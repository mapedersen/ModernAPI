# Security Scanning Guide

This guide covers the comprehensive security scanning system integrated into ModernAPI's CI/CD pipeline.

## Overview

ModernAPI implements a multi-layered security approach with automated scanning at every stage of the development lifecycle:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Scanning Layers                    │
├─────────────────────────────────────────────────────────────────┤
│ Code Commit → Static Analysis → Dependency Scan → Build        │
│ Container Scan → Infrastructure Scan → Runtime Protection      │
│ Continuous Monitoring → Incident Response → Compliance         │
└─────────────────────────────────────────────────────────────────┘
```

## Security Scanning Types

### 1. Dependency Vulnerability Scanning

Identifies known vulnerabilities in project dependencies.

#### Tools Used
- **.NET Dependencies**: `dotnet list package --vulnerable`
- **NPM Dependencies**: `npm audit`
- **Transitive Dependencies**: Included in scans

#### Configuration
```yaml
# In .github/workflows/security.yml
- name: .NET dependency vulnerability scan
  run: |
    dotnet list package --vulnerable --include-transitive 2>&1 | tee dependency-scan.log
    
    if grep -i "vulnerable" dependency-scan.log; then
      echo "⚠️ Vulnerable dependencies detected!"
      if grep -i "critical\|high" dependency-scan.log; then
        exit 1  # Fail on high/critical vulnerabilities
      fi
    fi
```

#### Scan Triggers
- Every push to main/develop branches
- Every pull request
- Daily scheduled scan at 2 AM UTC
- Manual workflow dispatch

#### Vulnerability Severity Handling
| Severity | Action | Deployment |
|----------|--------|------------|
| **Critical** | ❌ Fail build | Blocked |
| **High** | ❌ Fail build | Blocked |
| **Medium** | ⚠️ Warning | Allowed with review |
| **Low** | ℹ️ Info | Allowed |

### 2. Static Code Security Analysis

Analyzes source code for security vulnerabilities and anti-patterns.

#### Tools Used
- **CodeQL**: GitHub's semantic code analysis
- **Semgrep**: Pattern-based security analysis
- **Custom Rules**: Organization-specific security patterns

#### CodeQL Configuration
```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: csharp
    queries: +security-extended,security-and-quality
```

**Covered Vulnerabilities**:
- SQL Injection
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Authentication bypasses
- Authorization issues
- Input validation flaws
- Cryptographic issues

#### Semgrep Configuration
```yaml
- name: Semgrep security scan
  uses: semgrep/semgrep-action@v1
  with:
    config: >-
      p/security-audit
      p/secrets
      p/owasp-top-ten
      p/cwe-top-25
      p/r2c-best-practices
```

**Rule Sets**:
- **OWASP Top 10**: Web application security risks
- **CWE Top 25**: Common weakness enumeration
- **Secrets Detection**: API keys, tokens, passwords
- **Best Practices**: Secure coding patterns

### 3. Secret Detection

Prevents secrets from being committed to the repository.

#### Tools Used
- **TruffleHog**: Deep secret scanning with verification
- **GitLeaks**: Git-aware secret detection
- **Custom Pattern Matching**: Organization-specific patterns

#### TruffleHog Configuration
```yaml
- name: TruffleHog secret scan
  uses: trufflesecurity/trufflehog@main
  with:
    base: ${{ github.event.repository.default_branch }}
    head: HEAD
    path: .
    extra_args: --debug --only-verified
```

**Detection Patterns**:
- AWS credentials
- API keys (GitHub, Slack, etc.)
- Database connection strings
- Private keys
- JWT secrets
- OAuth tokens

#### Custom Secret Patterns
```bash
# Additional patterns checked
password\s*=\s*['""][^'""]{8,}['"""]
api[_-]?key\s*[=:]\s*['""][^'""]+['"""]
secret[_-]?key\s*[=:]\s*['""][^'""]+['"""]
connectionstring\s*[=:]\s*['""][^'""]+['"""]
```

### 4. Container Security Scanning

Analyzes Docker images for vulnerabilities and misconfigurations.

#### Tools Used
- **Trivy**: Comprehensive vulnerability scanner
- **Docker Scout**: Docker's native security scanning
- **Hadolint**: Dockerfile best practice analysis

#### Trivy Configuration
```yaml
- name: Run Trivy container scan
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'modernapi:security-scan'
    format: 'sarif'
    output: 'trivy-container-results.sarif'
```

**Scan Coverage**:
- OS package vulnerabilities
- Language-specific packages (.NET, Node.js)
- Configuration issues
- Secret detection in layers
- License compliance

#### Docker Scout Configuration
```yaml
- name: Docker Scout vulnerability scan
  uses: docker/scout-action@v1
  with:
    command: cves
    image: modernapi:security-scan
    sarif-file: scout-results.sarif
```

#### Dockerfile Security Analysis
```yaml
- name: Dockerfile best practices check
  run: |
    wget -O hadolint https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64
    chmod +x hadolint
    ./hadolint Dockerfile --format json > dockerfile-scan.json
```

**Checks Include**:
- Use of latest tags (discouraged)
- Running as root user
- Unnecessary packages
- Layer optimization
- Security best practices

### 5. Infrastructure Security Scanning

Analyzes infrastructure-as-code for security misconfigurations.

#### Kubernetes Security
```yaml
- name: Kubernetes security scan
  run: |
    wget -O kube-score https://github.com/zegl/kube-score/releases/latest/download/kube-score_linux_amd64
    chmod +x kube-score
    ./kube-score score k8s/*.yml --output-format json > k8s-security-scan.json
```

**Kubernetes Checks**:
- Security contexts
- Resource limits
- Network policies
- RBAC configurations
- Pod security standards

#### Docker Compose Security
```yaml
- name: Docker Compose security check
  run: |
    # Check for privileged containers
    if grep -q "privileged.*true" docker-compose*.yml; then
      echo "⚠️ Privileged container found"
    fi
    
    # Check for host network mode
    if grep -q "network_mode.*host" docker-compose*.yml; then
      echo "⚠️ Host network mode found"
    fi
```

#### GitHub Actions Security
```yaml
- name: GitHub Actions security check
  run: |
    # Check for dangerous permissions
    if grep -q "permissions:.*write-all" .github/workflows/*.yml; then
      echo "⚠️ Overly broad permissions found"
    fi
    
    # Check for external action versions
    grep -E "uses:.*@(?!v[0-9])" .github/workflows/*.yml
```

## Security Workflow Configuration

### Workflow Triggers

The security workflow (`.github/workflows/security.yml`) runs on:

1. **Push Events**:
   ```yaml
   on:
     push:
       branches: [main, develop]
   ```

2. **Pull Request Events**:
   ```yaml
   on:
     pull_request:
       branches: [main, develop]
   ```

3. **Scheduled Scans**:
   ```yaml
   on:
     schedule:
       # Daily at 2 AM UTC
       - cron: '0 2 * * *'
   ```

4. **Manual Triggers**:
   ```yaml
   on:
     workflow_dispatch:
       inputs:
         scan_type:
           description: 'Type of security scan'
           required: true
           default: 'full'
           type: choice
           options:
             - full
             - dependencies
             - code
             - secrets
             - docker
   ```

### Conditional Scanning

Different scans run based on the trigger:

```yaml
dependency-scan:
  if: |
    github.event.inputs.scan_type == 'full' ||
    github.event.inputs.scan_type == 'dependencies' ||
    github.event_name != 'workflow_dispatch'

code-security:
  if: |
    github.event.inputs.scan_type == 'full' ||
    github.event.inputs.scan_type == 'code' ||
    github.event_name != 'workflow_dispatch'
```

## Security Reports and Artifacts

### SARIF Integration

Security results are uploaded to GitHub Security tab using SARIF format:

```yaml
- name: Upload CodeQL results
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: codeql-results.sarif

- name: Upload Semgrep results
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: semgrep.sarif
```

### Artifact Storage

Security scan results are stored as workflow artifacts:

```yaml
- name: Upload security scan results
  uses: actions/upload-artifact@v4
  with:
    name: security-scan-results
    path: |
      dependency-scan.log
      trivy-results.sarif
      docker-security-summary.md
    retention-days: 90
```

### Security Summary Report

A comprehensive security report is generated after all scans:

```markdown
# Security Scan Report

**Scan Date:** 2025-01-08T10:00:00Z
**Repository:** your-org/modernapi
**Branch:** main
**Commit:** abc123def

## Scan Results Overview

| Component | Status | Issues |
|-----------|--------|--------|
| Dependencies | ✅ Clean | None |
| Code Analysis | ✅ Clean | None |
| Secret Scan | ❌ Issues Found | 2 |
| Docker Security | ✅ Clean | None |
| Infrastructure | ⚠️ Warnings | 1 |
```

## Issue Management

### Automatic Issue Creation

Critical security findings automatically create GitHub issues:

```yaml
- name: Create security issue
  if: |
    always() &&
    (needs.dependency-scan.result == 'failure' || needs.secret-scan.result == 'failure') &&
    github.event_name == 'schedule'
  uses: actions/github-script@v7
  with:
    script: |
      await github.rest.issues.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: `🔒 Security Issues Detected - ${new Date().toISOString().split('T')[0]}`,
        body: `Security scan has detected issues requiring attention...`,
        labels: ['security', 'bug', 'priority-high']
      });
```

### Issue Prioritization

Issues are automatically labeled based on severity:

| Finding | Labels | Priority |
|---------|--------|----------|
| Critical vulnerabilities | `security`, `critical`, `priority-high` | P0 |
| High severity issues | `security`, `high`, `priority-high` | P1 |
| Secrets in code | `security`, `secrets`, `priority-high` | P1 |
| Medium issues | `security`, `medium`, `priority-medium` | P2 |
| Best practice violations | `security`, `enhancement` | P3 |

## Advanced Configuration

### Custom Semgrep Rules

Create custom security rules for your organization:

```yaml
# .semgrep/custom-rules.yml
rules:
  - id: modernapi-jwt-hardcode
    pattern: |
      JwtSettings.Secret = "$VALUE"
    message: "JWT secret should not be hardcoded"
    severity: ERROR
    languages: [csharp]
    
  - id: modernapi-sql-injection
    pattern: |
      $QUERY = $"SELECT * FROM users WHERE id = {$ID}"
    message: "Potential SQL injection vulnerability"
    severity: ERROR
    languages: [csharp]
```

### Environment-Specific Scanning

Different security requirements for different environments:

```yaml
# Production requires stricter scanning
production-security:
  if: github.ref == 'refs/heads/main'
  steps:
    - name: Strict security scan
      run: |
        # Fail on any vulnerability
        trivy image --exit-code 1 --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL modernapi:latest
```

### Integration with External Tools

#### SAST Integration
```yaml
- name: External SAST scan
  run: |
    # Integrate with tools like Checkmarx, Veracode, etc.
    checkmarx-cli scan --project modernapi --source .
```

#### DAST Integration
```yaml
- name: Dynamic security testing
  run: |
    # Run DAST against staging environment
    zap-baseline.py -t https://staging-api.yourdomain.com
```

## Compliance and Reporting

### Compliance Standards

The security scanning helps meet various compliance requirements:

- **OWASP ASVS**: Application Security Verification Standard
- **PCI DSS**: Payment Card Industry Data Security Standard
- **SOC 2**: Service Organization Control 2
- **ISO 27001**: Information Security Management
- **NIST**: National Institute of Standards and Technology

### Reporting Integration

#### Security Dashboards
```bash
# Grafana dashboard for security metrics
curl -X POST "https://grafana.yourdomain.com/api/dashboards/db" \
  -H "Authorization: Bearer $GRAFANA_TOKEN" \
  -d @security-dashboard.json
```

#### Compliance Reports
```yaml
- name: Generate compliance report
  run: |
    python scripts/generate-compliance-report.py \
      --format pdf \
      --standard pci-dss \
      --output compliance-report.pdf
```

## Troubleshooting

### Common Issues

#### 1. False Positives
```yaml
# Suppress false positives in Semgrep
# .semgrepignore
tests/
*.test.cs
# Ignore specific rule in file
# semgrep:ignore-next-line:rule-id
```

#### 2. Scan Timeouts
```yaml
# Increase timeout for large repositories
timeout-minutes: 30  # Default is 10
```

#### 3. Rate Limiting
```yaml
# Add delays between API calls
- name: Scan with rate limiting
  run: |
    sleep 10  # Delay between scans
    semgrep --config=auto --json --output=results.json
```

#### 4. Memory Issues
```yaml
# Use specific runner for large scans
runs-on: ubuntu-latest-8-cores  # More resources
```

### Debugging Scans

#### Enable Debug Logging
```yaml
env:
  SEMGREP_DEBUG: 1
  TRIVY_DEBUG: 1
  
steps:
  - name: Debug security scan
    run: |
      echo "Debug information:"
      trivy --debug image modernapi:latest
```

#### Manual Testing
```bash
# Test security tools locally
docker run --rm -v $(pwd):/src \
  semgrep/semgrep:latest \
  --config=p/security-audit /src

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image modernapi:latest
```

## Best Practices

### Security Scanning Best Practices

1. **Fail Fast**: Fail builds on critical/high vulnerabilities
2. **Regular Updates**: Keep security tools updated
3. **Baseline Scans**: Establish security baselines
4. **Exception Handling**: Document and track exceptions
5. **Team Training**: Train team on security findings

### Tool Selection Criteria

1. **Accuracy**: Low false positive rate
2. **Coverage**: Comprehensive vulnerability database
3. **Integration**: Easy CI/CD integration
4. **Performance**: Fast scan times
5. **Reporting**: Clear, actionable reports

### Remediation Workflow

1. **Immediate**: Fix critical vulnerabilities
2. **Short-term**: Address high/medium issues
3. **Long-term**: Improve security posture
4. **Documentation**: Document security decisions
5. **Training**: Share learnings with team

## Metrics and KPIs

### Security Metrics to Track

- **Mean Time to Detection (MTTD)**
- **Mean Time to Resolution (MTTR)**
- **Vulnerability density** (vulnerabilities per KLOC)
- **Security debt** (open security issues)
- **False positive rate**
- **Scan coverage percentage**

### Reporting Dashboards

Create dashboards to track:
- Daily/weekly security scan results
- Vulnerability trends over time
- Security issue resolution times
- Compliance status
- Tool effectiveness metrics

This security scanning guide provides comprehensive coverage of the security measures integrated into ModernAPI's CI/CD pipeline, helping maintain high security standards throughout the development lifecycle.