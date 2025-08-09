# CI/CD Setup and Configuration Guide

This guide covers the complete setup and configuration of the ModernAPI CI/CD system built with GitHub Actions.

## Overview

ModernAPI includes a comprehensive CI/CD system that provides:

- **Continuous Integration**: Automated testing, code quality checks, and security scanning
- **Continuous Deployment**: Automated deployments to staging and production environments
- **GitOps Workflow**: Git-based deployment management with semantic versioning
- **Security-First**: Multi-layered security scanning at every stage
- **Multi-Channel Notifications**: Alerts via Slack, Teams, Discord, and Email

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub Actions                         │
├─────────────────────────────────────────────────────────────────┤
│ Push to feature/* → CI Pipeline → PR Preview Environment       │
│ Push to develop   → CI + Deploy to Staging                     │
│ Push to main      → CI + Release + Deploy to Production        │
│ PR Events         → CI + Security Scan + Preview Deploy        │
│ Schedule          → Security Scan + Cleanup                     │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Setup Checklist

- [ ] Configure repository secrets
- [ ] Set up branch protection rules
- [ ] Configure GitHub environments
- [ ] Set up notification channels (optional)
- [ ] Configure monitoring endpoints
- [ ] Test the CI/CD pipeline

## 1. Repository Configuration

### 1.1 Required Secrets

Navigate to **Settings → Secrets and variables → Actions** in your GitHub repository and add these secrets:

#### Database & Application Secrets
```bash
# Production database
PRODUCTION_DATABASE_URL=Host=your-prod-host;Database=modernapi_prod;Username=modernapi;Password=your-secure-password

# JWT Configuration
PRODUCTION_JWT_SECRET=your-very-secure-jwt-secret-minimum-32-characters-long

# PostgreSQL
PRODUCTION_POSTGRES_PASSWORD=your-secure-postgres-password

# Monitoring
PRODUCTION_GRAFANA_PASSWORD=your-grafana-admin-password
PRODUCTION_SEQ_API_KEY=your-seq-api-key

# SSL Certificate
ACME_EMAIL=your-email@domain.com
```

#### Deployment Secrets (Choose based on your infrastructure)
```bash
# For Kubernetes deployments
PRODUCTION_KUBECONFIG=base64-encoded-kubeconfig-content

# For VPS/Docker deployments
VPS_HOST=your-server-ip
VPS_USER=deploy-user
VPS_SSH_KEY=your-private-ssh-key

# For cloud deployments
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AZURE_CLIENT_ID=your-azure-client-id
```

#### Notification Secrets (Optional)
```bash
# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Microsoft Teams
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
NOTIFICATION_EMAIL=alerts@yourdomain.com
```

#### Security Scanning Secrets (Optional but Recommended)
```bash
# Semgrep (for advanced security scanning)
SEMGREP_APP_TOKEN=your-semgrep-token

# GitLeaks (optional license)
GITLEAKS_LICENSE=your-gitleaks-license

# Docker Scout (for container scanning)
DOCKER_SCOUT_TOKEN=your-docker-scout-token
```

### 1.2 Repository Variables

Set these in **Settings → Secrets and variables → Actions → Variables**:

```bash
# Deployment configuration
AUTO_DEPLOY_PRODUCTION=false  # Set to 'true' for automatic production deployments
PREVIEW_DOMAIN=preview.yourdomain.com  # Domain for PR preview environments

# Monitoring
MONITORING_DASHBOARD_URL=https://dashboard.yourdomain.com
```

## 2. Branch Protection Rules

Configure branch protection for `main` and `develop` branches:

### 2.1 Main Branch Protection
Go to **Settings → Branches → Add rule** for `main`:

- **Branch name pattern**: `main`
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: 2
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - Required status checks:
    - `build-and-test`
    - `security-scan`
    - `docker-build`
- ✅ **Require conversation resolution before merging**
- ✅ **Restrict pushes that create files**
- ✅ **Include administrators**

### 2.2 Develop Branch Protection
Add rule for `develop`:

- **Branch name pattern**: `develop`
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: 1
- ✅ **Require status checks to pass before merging**
  - Required status checks:
    - `build-and-test`
    - `security-scan`
- ✅ **Include administrators**

## 3. GitHub Environments

Configure deployment environments in **Settings → Environments**:

### 3.1 Production Environment
Create environment: `production`

**Protection Rules**:
- ✅ **Required reviewers**: Add production deployment team
- ✅ **Wait timer**: 5 minutes
- ✅ **Deployment branches**: Selected branches → `main`

**Environment Secrets** (if different from repository secrets):
- Add production-specific overrides if needed

### 3.2 Production Approval Environment
Create environment: `production-approval`

**Protection Rules**:
- ✅ **Required reviewers**: Add DevOps/SRE team
- ✅ **Deployment branches**: Selected branches → `main`

### 3.3 Staging Environment
Create environment: `staging`

**Protection Rules**:
- ✅ **Deployment branches**: Selected branches → `develop`
- No reviewers needed for staging

### 3.4 Preview Environments
Create environment: `preview-pr-*`

**Protection Rules**:
- ✅ **Deployment branches**: All branches (for PR previews)

## 4. Workflow Configuration

### 4.1 Workflow Files Overview

The CI/CD system includes these GitHub Actions workflows:

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **CI Pipeline** | `ci.yml` | Push, PR | Code quality, testing, security |
| **Docker Build** | `docker.yml` | Push to main/develop | Multi-arch container builds |
| **Deploy Staging** | `deploy-staging.yml` | Push to develop | Automated staging deployment |
| **Deploy Production** | `deploy-production.yml` | Release, Manual | Production deployment with approvals |
| **Release Management** | `release.yml` | Push to main | Semantic versioning and releases |
| **PR Previews** | `pr-preview.yml` | PR events | Isolated preview environments |
| **Security Scanning** | `security.yml` | Push, PR, Schedule | Comprehensive security analysis |
| **Notifications** | `notify.yml` | Workflow completion | Multi-channel alerts |

### 4.2 Customizing Workflows

#### Modify Docker Registry
Edit `.github/workflows/docker.yml`:

```yaml
env:
  REGISTRY: your-registry.com  # Change from ghcr.io
  IMAGE_NAME: your-org/modernapi
```

#### Update Domain Configuration
Update domains in all workflow files:

```bash
# Find and replace in all workflow files
find .github/workflows -name "*.yml" -exec sed -i 's/yourdomain.com/your-actual-domain.com/g' {} \;
```

#### Customize Deployment Strategy
Edit `.github/workflows/deploy-production.yml` to choose your deployment method:

- **Blue-Green**: Zero downtime, requires load balancer
- **Rolling**: Kubernetes-style rolling updates
- **Recreate**: Simple stop-and-start (brief downtime)

## 5. Notification Setup

### 5.1 Slack Integration

1. Create a Slack app in your workspace
2. Enable incoming webhooks
3. Create webhook URLs for different channels:
   - `#alerts` for critical notifications
   - `#production` for production deployments
   - `#development` for general CI/CD updates
4. Add `SLACK_WEBHOOK_URL` to repository secrets

### 5.2 Microsoft Teams Integration

1. Go to the Teams channel where you want notifications
2. Click "..." → "Connectors" → "Incoming Webhook"
3. Configure and copy the webhook URL
4. Add `TEAMS_WEBHOOK_URL` to repository secrets

### 5.3 Discord Integration

1. Go to Server Settings → Integrations → Webhooks
2. Create a new webhook for your desired channel
3. Copy the webhook URL
4. Add `DISCORD_WEBHOOK_URL` to repository secrets

### 5.4 Email Notifications

Configure SMTP settings for email alerts:

1. Use Gmail App Passwords for Gmail SMTP
2. Add all SMTP_* secrets to repository
3. Email notifications are sent for critical issues only

## 6. Security Configuration

### 6.1 Security Scanning Schedule

The security workflow runs:
- **On every push/PR**: Basic security checks
- **Daily at 2 AM UTC**: Comprehensive security scan
- **Manual trigger**: On-demand security analysis

### 6.2 Security Scan Types

| Scan Type | Tools | Coverage |
|-----------|--------|----------|
| **Dependencies** | `dotnet list package --vulnerable`, npm audit | Vulnerable packages |
| **Code Analysis** | CodeQL, Semgrep | Security anti-patterns, OWASP Top 10 |
| **Secrets** | TruffleHog, GitLeaks | Hardcoded secrets, API keys |
| **Containers** | Trivy, Docker Scout | Container vulnerabilities |
| **Infrastructure** | kube-score, hadolint | Infrastructure security |

### 6.3 Customizing Security Rules

Edit `.github/workflows/security.yml`:

```yaml
# Add custom Semgrep rules
config: >-
  p/security-audit
  p/secrets
  p/owasp-top-ten
  p/cwe-top-25
  p/r2c-best-practices
  your-custom-rules.yml  # Add custom rules
```

## 7. Monitoring Integration

### 7.1 Health Check Endpoints

Ensure your API provides these endpoints for monitoring:

```csharp
// Required endpoints
GET /health              // Basic health check
GET /health/ready        // Readiness probe
GET /health/database     // Database connectivity
GET /version            // Version information
```

### 7.2 Monitoring Dashboard

Configure monitoring dashboard URLs in workflow files:

```yaml
# Update monitoring URLs in deploy workflows
MONITORING_URL: "https://dashboard.yourdomain.com"
GRAFANA_URL: "https://grafana.yourdomain.com"
```

## 8. Testing the CI/CD Pipeline

### 8.1 Test Sequence

1. **Test CI Pipeline**:
   ```bash
   # Create a feature branch
   git checkout -b feature/test-cicd
   
   # Make a small change
   echo "# Test" >> README.md
   git add . && git commit -m "feat: test CI/CD pipeline"
   git push origin feature/test-cicd
   
   # Create PR to develop
   # Verify CI runs and passes
   ```

2. **Test Staging Deployment**:
   ```bash
   # Merge PR to develop
   # Verify staging deployment runs
   # Check staging environment health
   curl https://staging-api.yourdomain.com/health
   ```

3. **Test Production Release**:
   ```bash
   # Create PR from develop to main
   # Use conventional commit messages
   git commit -m "feat: add new feature for production"
   
   # Merge to main
   # Verify release is created
   # Check production deployment (if auto-deploy enabled)
   ```

### 8.2 Troubleshooting First Run

Common issues and solutions:

1. **Secret Access Errors**:
   - Verify all required secrets are set
   - Check secret names match exactly (case-sensitive)

2. **Docker Registry Issues**:
   - Ensure GITHUB_TOKEN has package write permissions
   - Check registry URLs are correct

3. **Deployment Failures**:
   - Verify environment URLs are accessible
   - Check deployment credentials
   - Review deployment logs in Actions tab

## 9. Advanced Configuration

### 9.1 Custom Deployment Strategies

#### Blue-Green with AWS ALB
```yaml
# In deploy-production.yml
- name: Switch ALB target group
  run: |
    aws elbv2 modify-listener --listener-arn $LISTENER_ARN \
      --default-actions Type=forward,TargetGroupArn=$NEW_TARGET_GROUP_ARN
```

#### Canary Deployments
```yaml
# Add canary step
- name: Deploy canary (10% traffic)
  run: |
    kubectl patch service modernapi \
      -p '{"spec":{"selector":{"version":"canary"}}}'
```

### 9.2 Multi-Cloud Deployments

Configure multiple cloud providers:

```yaml
strategy:
  matrix:
    cloud: [aws, azure, gcp]
    environment: [staging, production]
```

### 9.3 Custom Notification Channels

Add webhook integration for custom systems:

```yaml
- name: Custom system notification
  run: |
    curl -X POST "${{ secrets.CUSTOM_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{"deployment": "${{ needs.validate.outputs.version }}", "status": "success"}'
```

## 10. Maintenance and Updates

### 10.1 Regular Maintenance Tasks

**Weekly**:
- Review security scan results
- Check for dependency updates
- Monitor deployment success rates

**Monthly**:
- Update GitHub Actions versions
- Review and update secrets
- Audit access permissions

**Quarterly**:
- Review and update branch protection rules
- Audit CI/CD performance metrics
- Update documentation

### 10.2 Upgrading the CI/CD System

To upgrade workflows:

1. **Backup current configuration**:
   ```bash
   git checkout -b backup/cicd-$(date +%Y%m%d)
   git push origin backup/cicd-$(date +%Y%m%d)
   ```

2. **Update workflows incrementally**:
   - Update one workflow at a time
   - Test thoroughly in staging
   - Monitor for issues

3. **Update documentation**:
   - Update this guide with changes
   - Notify team of updates
   - Update troubleshooting guides

## 11. Best Practices

### 11.1 Security Best Practices

- ✅ Never commit secrets to version control
- ✅ Use least-privilege access for service accounts
- ✅ Regularly rotate secrets and tokens
- ✅ Monitor security scan results daily
- ✅ Keep dependencies updated

### 11.2 Deployment Best Practices

- ✅ Always test in staging first
- ✅ Use semantic versioning for releases
- ✅ Maintain rollback procedures
- ✅ Monitor post-deployment metrics
- ✅ Document deployment procedures

### 11.3 Monitoring Best Practices

- ✅ Set up alerts for critical failures
- ✅ Monitor deployment frequency and success rates
- ✅ Track mean time to recovery (MTTR)
- ✅ Review CI/CD metrics regularly
- ✅ Use dashboards for visibility

## Support and Troubleshooting

For troubleshooting CI/CD issues, see:
- `docs/DEPLOYMENT.md` - Deployment troubleshooting
- `docs/SECURITY_SCANNING.md` - Security scan configuration
- GitHub Actions logs in the repository
- Monitoring dashboards for runtime issues

For template-specific questions:
- Check existing documentation in `/docs`
- Review workflow files for inline comments
- Follow established patterns in the codebase