# Git Workflow and Branching Strategy

This document defines the Git workflow, branching strategy, and development process for ModernAPI. Our approach combines GitHub Flow simplicity with GitFlow's environment management capabilities.

## Overview

We use a **hybrid Git workflow** that balances simplicity with robust release management:

- **GitHub Flow** for feature development (simple, fast)
- **GitFlow concepts** for release management (structured, reliable)
- **Semantic commits** for automated versioning
- **Environment-specific deployments** for safe releases

## Branch Strategy

### Core Branches

```
┌─────────────────────────────────────────────────────────────────┐
│                    Production Environment                        │
│ main ─────●─────●─────●─────●─────●─────●─────●─────●──→        │
│           │     │     │     │     │     │     │                │
│          v1.0  v1.1  v1.2  v2.0  v2.1  v2.2  v2.3             │
└─────────────────────────────────────────────────────────────────┘
           │     │     │     │     │     │     │
┌─────────────────────────────────────────────────────────────────┐
│                     Staging Environment                         │
│ develop ──●─────●─────●─────●─────●─────●─────●─────●──→        │
│           │     │     │     │     │     │     │                │
│          β1.1  β1.2  β2.0  β2.1  β2.2  β2.3  β3.0             │
└─────────────────────────────────────────────────────────────────┘
             ▲     ▲     ▲     ▲     ▲     ▲
┌─────────────────────────────────────────────────────────────────┐
│                  Feature Development                            │
│ feature/* ─●─────●──┐  ●─────●──┐  ●─────●──┐                  │
│ hotfix/*      ●──┐  │     ●──┐  │     ●──┐  │                  │
│ release/*        │  │        │  │        │  │                  │
└─────────────────────────────────────────────────────────────────┘
```

#### `main` Branch
- **Purpose**: Production-ready code
- **Environment**: Production
- **Protection**: Highly protected, merge via PR only
- **Deployment**: Automatic to production on merge
- **Versioning**: Tagged with semantic versions (v1.0.0, v1.1.0, etc.)

#### `develop` Branch  
- **Purpose**: Integration branch for ongoing development
- **Environment**: Staging
- **Protection**: Protected, merge via PR only
- **Deployment**: Automatic to staging on merge
- **Versioning**: Pre-release versions (v1.1.0-beta.1)

### Feature Branches

#### `feature/*` Branches
- **Purpose**: New features and enhancements
- **Naming**: `feature/user-authentication`, `feature/api-versioning`
- **Base**: Created from `develop`
- **Merge**: Back to `develop` via PR
- **Lifetime**: Short-lived (1-2 weeks max)
- **Environment**: Development/Preview (optional)

#### `hotfix/*` Branches
- **Purpose**: Critical production fixes
- **Naming**: `hotfix/security-vulnerability`, `hotfix/critical-bug`
- **Base**: Created from `main`
- **Merge**: To both `main` AND `develop`
- **Deployment**: Immediate to production after merge
- **Lifetime**: Very short (hours to 1 day)

#### `release/*` Branches
- **Purpose**: Release preparation and stabilization
- **Naming**: `release/v1.2.0`, `release/v2.0.0`
- **Base**: Created from `develop`
- **Merge**: To `main` and back to `develop`
- **Environment**: Pre-production/UAT
- **Lifetime**: 1-2 weeks for testing and bug fixes

## Semantic Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning and changelog generation.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types and Versioning Impact

| Type | Description | Version Impact | Example |
|------|-------------|----------------|---------|
| `feat` | New feature | **MINOR** | `feat(auth): add OAuth2 integration` |
| `fix` | Bug fix | **PATCH** | `fix(api): resolve null reference exception` |
| `docs` | Documentation | **PATCH** | `docs(readme): update installation guide` |
| `style` | Code formatting | **PATCH** | `style(api): fix code formatting` |
| `refactor` | Code refactoring | **PATCH** | `refactor(auth): improve token validation` |
| `perf` | Performance improvement | **PATCH** | `perf(db): optimize query performance` |
| `test` | Adding tests | **No version** | `test(auth): add integration tests` |
| `build` | Build system changes | **PATCH** | `build(docker): optimize production image` |
| `ci` | CI/CD changes | **No version** | `ci(github): add security scanning` |
| `chore` | Maintenance tasks | **No version** | `chore(deps): update dependencies` |
| `revert` | Revert changes | **PATCH** | `revert: feat(auth): add OAuth2 integration` |

### Breaking Changes

For **MAJOR** version bumps, include `BREAKING CHANGE:` in the footer:

```bash
feat(api): redesign authentication endpoints

BREAKING CHANGE: Authentication endpoints now require API version header
```

## Development Workflow

### 1. Feature Development Process

```bash
# 1. Start from develop branch
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/user-profile-management

# 3. Work on feature with semantic commits
git add .
git commit -m "feat(profile): add user profile endpoints"

# 4. Push and create PR
git push origin feature/user-profile-management
# Create PR: feature/user-profile-management → develop
```

### 2. Pull Request Process

#### PR Creation Checklist

- [ ] **Title**: Clear, descriptive, follows conventional format
- [ ] **Description**: What, why, and how of the changes
- [ ] **Tests**: All tests pass, new tests added if needed
- [ ] **Documentation**: Updated if necessary
- [ ] **Breaking Changes**: Clearly documented if any
- [ ] **Screenshots**: For UI changes
- [ ] **Reviewers**: Assign appropriate team members

#### PR Review Requirements

- **Minimum 1 approval** for feature branches
- **Minimum 2 approvals** for release branches
- **All CI checks passing** (tests, security, quality)
- **No merge conflicts**
- **Up-to-date with target branch**

### 3. Release Process

#### Regular Release (from develop)

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Update version and changelog (automated)
npm run changelog

# 3. Fix any release-specific issues
git commit -m "fix(release): address UAT feedback"

# 4. Create PR to main
# PR: release/v1.2.0 → main

# 5. After merge, tag is automatically created
# 6. Merge back to develop (automated)
```

#### Hotfix Release (from main)

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. Implement fix
git commit -m "fix(security): resolve authentication bypass"

# 3. Create PRs to both main and develop
# PR 1: hotfix/critical-security-fix → main
# PR 2: hotfix/critical-security-fix → develop

# 4. Deploy immediately after merge to main
```

## Environment Strategy

### Environment Mapping

| Environment | Branch | Deployment | Purpose | URL |
|-------------|--------|------------|---------|-----|
| **Development** | `feature/*` | Manual/Preview | Feature development | `https://feature-branch.dev.api.com` |
| **Staging** | `develop` | Automatic | Integration testing | `https://staging.api.com` |
| **Pre-Production** | `release/*` | Manual | UAT and final testing | `https://preprod.api.com` |
| **Production** | `main` | Automatic | Live system | `https://api.com` |

### Deployment Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                        Deployment Pipeline                      │
└─────────────────────────────────────────────────────────────────┘

Development     Staging        Pre-Production    Production
─────────────   ──────────     ──────────────    ──────────
feature/*   │   develop    │   release/*    │   main
            │              │                │
Manual      │   Auto       │   Manual       │   Auto
Deploy      │   Deploy     │   Deploy       │   Deploy
            │              │                │
Preview     │   Staging    │   UAT          │   Production
Environment │   Environment│   Environment  │   Environment
            │              │                │
Optional    │   Required   │   Required     │   Required
Testing     │   Testing    │   Testing      │   Monitoring
```

## Branch Protection Rules

### `main` Branch Protection

- ✅ **Require PR reviews**: 2 required reviewers
- ✅ **Dismiss stale reviews**: When new commits are pushed  
- ✅ **Require review from code owners**: Yes
- ✅ **Restrict pushes to matching branches**: Yes
- ✅ **Require status checks**: All CI checks must pass
- ✅ **Require branches to be up to date**: Yes
- ✅ **Require linear history**: Yes (no merge commits)
- ✅ **Include administrators**: Yes
- ✅ **Allow force pushes**: No
- ✅ **Allow deletions**: No

### `develop` Branch Protection

- ✅ **Require PR reviews**: 1 required reviewer
- ✅ **Dismiss stale reviews**: When new commits are pushed
- ✅ **Require status checks**: All CI checks must pass
- ✅ **Require branches to be up to date**: Yes
- ✅ **Include administrators**: No
- ✅ **Allow force pushes**: No
- ✅ **Allow deletions**: No

## CI/CD Integration

### Automated Workflows

#### On Feature Branch Push
1. **Build & Test**: Compile, unit tests, integration tests
2. **Quality Checks**: Code quality, security scanning
3. **Preview Deployment**: Deploy to preview environment (optional)
4. **Notification**: Slack/Teams notification with results

#### On PR to develop
1. **Full CI Pipeline**: Build, test, quality, security
2. **Preview Environment**: Update preview deployment
3. **Automated Reviews**: Dependency check, security scan results
4. **Status Checks**: All must pass before merge

#### On Merge to develop
1. **Build & Test**: Full test suite
2. **Deploy to Staging**: Automatic deployment
3. **Integration Tests**: Run against staging environment
4. **Pre-release Version**: Create beta version (v1.2.0-beta.1)

#### On Merge to main
1. **Production Build**: Optimized production build
2. **Security Scan**: Final security validation
3. **Deploy to Production**: Blue/green deployment
4. **Release**: Create GitHub release with changelog
5. **Notification**: Success/failure notifications

### Environment Variables and Secrets

| Environment | Configuration | Source |
|-------------|---------------|---------|
| **Development** | `.env.development` | Local file |
| **Staging** | `.env.staging` | GitHub Secrets |
| **Production** | `.env.production` | GitHub Secrets |

## Best Practices

### Commit Best Practices

✅ **DO:**
- Use conventional commit format
- Write clear, descriptive commit messages
- Keep commits atomic (one logical change)
- Reference issues/tickets when applicable
- Use present tense ("add feature" not "added feature")

❌ **DON'T:**
- Make commits too large or too small
- Use vague messages like "fix bug" or "update code"
- Mix unrelated changes in one commit
- Commit directly to main or develop

### Branch Best Practices

✅ **DO:**
- Keep feature branches short-lived (< 2 weeks)
- Regularly sync with develop to avoid conflicts
- Use descriptive branch names
- Delete branches after merging
- Rebase feature branches before creating PR

❌ **DON'T:**
- Create long-lived feature branches
- Work directly on develop or main
- Force push to shared branches
- Leave stale branches in repository

### PR Best Practices

✅ **DO:**
- Write clear PR titles and descriptions
- Include testing instructions
- Add screenshots for UI changes
- Request reviews from relevant team members
- Respond to review feedback promptly

❌ **DON'T:**
- Create massive PRs with hundreds of changes
- Ignore failing CI checks
- Merge without reviews (except hotfixes)
- Leave PR comments unresolved

## Release Management

### Version Strategy

We follow **Semantic Versioning (SemVer)**:

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

### Release Types

#### Regular Release
- **Frequency**: Every 2-4 weeks
- **Source**: develop branch
- **Process**: release branch → UAT → main
- **Timeline**: 1-2 weeks from branch to production

#### Hotfix Release
- **Frequency**: As needed for critical issues
- **Source**: main branch
- **Process**: hotfix branch → main (immediate)
- **Timeline**: Same day for critical security issues

#### Pre-release
- **Purpose**: Beta testing, early access
- **Versions**: v1.2.0-beta.1, v1.2.0-rc.1
- **Environment**: Staging or dedicated pre-production

### Changelog Management

- **Automated**: Generated from conventional commits
- **Manual curation**: For major releases
- **Breaking changes**: Prominently documented
- **Migration guides**: For major version bumps

## Rollback Strategy

### Rollback Triggers

- **Automatic**: Health check failures, error rate spikes
- **Manual**: Critical bugs discovered post-deployment
- **Scheduled**: Planned rollback for testing

### Rollback Process

```bash
# 1. Immediate rollback (revert deployment)
kubectl rollout undo deployment/modernapi -n production

# 2. Code rollback (if needed)
git revert <commit-hash>
git push origin main

# 3. Database rollback (if needed)
# Run database migration rollback scripts

# 4. Communication
# Notify team and stakeholders
```

## Monitoring and Alerting

### Branch Health Monitoring

- **Build success rates** per branch
- **Test coverage trends** over time
- **PR merge time** and review cycles
- **Deployment frequency** and success rates

### Quality Metrics

- **Code quality scores** (SonarQube)
- **Security vulnerabilities** detected
- **Dependency health** and updates
- **Performance regression** detection

## Tools and Integration

### Required Tools

- **Git**: Version control
- **GitHub**: Repository hosting and PR management
- **GitHub Actions**: CI/CD automation
- **semantic-release**: Automated versioning
- **commitlint**: Commit message validation
- **husky**: Git hooks

### Optional Tools

- **Slack/Teams**: Notifications
- **SonarQube**: Code quality
- **Snyk**: Security scanning
- **Dependabot**: Dependency updates

## Team Responsibilities

### All Developers

- Follow semantic commit conventions
- Create PRs for all changes
- Participate in code reviews
- Keep branches up to date
- Write tests for new features

### Tech Leads

- Review architecture changes
- Approve breaking changes
- Manage release planning
- Monitor code quality metrics

### DevOps/SRE

- Maintain CI/CD pipelines
- Monitor deployment health
- Manage environment configurations
- Handle production incidents

## Emergency Procedures

### Critical Security Issue

1. **Immediate action**: Create hotfix branch from main
2. **Fix implementation**: Minimal changes to address issue
3. **Fast-track review**: Security team approval only
4. **Emergency deployment**: Skip normal gates if necessary
5. **Post-incident**: Full review and process improvement

### Production Outage

1. **Immediate rollback**: If recent deployment caused issue
2. **Incident response**: Follow incident response playbook
3. **Communication**: Status page and stakeholder notifications
4. **Post-mortem**: Document learnings and process improvements

---

This workflow ensures **reliability**, **quality**, and **speed** while maintaining **security** and **compliance**. Regular reviews and updates keep the process aligned with team needs and industry best practices.