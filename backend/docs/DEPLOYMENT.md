# Deployment Guide

This guide covers deployment procedures, troubleshooting, and operations for ModernAPI across different environments.

## Overview

ModernAPI supports multiple deployment strategies and environments:

- **Development**: Local development with hot reload
- **Staging**: Automated deployment from `develop` branch
- **Production**: Controlled deployment with manual approvals
- **PR Previews**: Isolated environments for pull request testing

## Deployment Strategies

### 1. Blue-Green Deployment (Recommended for Production)

Zero-downtime deployments by maintaining two identical production environments.

```
┌─────────────────┐    ┌─────────────────┐
│   Blue (Live)   │    │  Green (Idle)   │
│   Version 1.0   │    │   Version 1.1   │
└─────────────────┘    └─────────────────┘
         ▲                        ▲
         │          Switch        │
    ┌────┴────┐    Traffic   ┌────┴────┐
    │  Users  │ ────────────>│ Load    │
    │         │              │Balancer │
    └─────────┘              └─────────┘
```

**Advantages**:
- Zero downtime
- Instant rollback capability
- Full testing of new version before switch
- Risk mitigation

**Requirements**:
- 2x infrastructure resources
- Load balancer or reverse proxy
- Health check endpoints

### 2. Rolling Deployment

Gradual replacement of instances in Kubernetes environments.

**Advantages**:
- Resource efficient
- Built-in rollback
- Kubernetes native

**Requirements**:
- Kubernetes cluster
- Multiple replicas
- Backward compatible changes

### 3. Recreate Deployment

Simple stop-and-start deployment with brief downtime.

**Advantages**:
- Simple to implement
- Resource efficient
- No compatibility requirements

**Disadvantages**:
- Brief downtime
- No instant rollback

## Environment-Specific Deployments

### Development Environment

Local development setup using Docker Compose:

```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f modernapi

# Stop environment
docker-compose down
```

**Features**:
- Hot reload enabled
- Debug logging
- Local PostgreSQL
- Grafana/Prometheus monitoring

### Staging Environment

Automated deployment triggered by pushes to `develop` branch.

**Process**:
1. Push to `develop` branch
2. CI pipeline runs (build, test, security scan)
3. Docker image built and pushed
4. Deployment to staging environment
5. Health checks and smoke tests
6. Slack/Teams notification

**Configuration**:
```yaml
# Staging environment variables
ASPNETCORE_ENVIRONMENT=Staging
DATABASE_URL=staging-connection-string
JWT_SECRET=staging-jwt-secret
LOG_LEVEL=Information
```

**Accessing Staging**:
```bash
# Health check
curl https://staging-api.yourdomain.com/health

# API documentation
https://staging-api.yourdomain.com/scalar/v1

# Logs and monitoring
https://staging-grafana.yourdomain.com
```

### Production Environment

Controlled deployment with manual approvals and comprehensive monitoring.

**Process**:
1. Release created on `main` branch
2. Pre-deployment validation
3. Manual approval required
4. Blue-green or rolling deployment
5. Database migrations (if needed)
6. 30-minute monitoring period
7. Success/failure notifications

**Configuration**:
```yaml
# Production environment variables
ASPNETCORE_ENVIRONMENT=Production
DATABASE_URL=production-connection-string
JWT_SECRET=production-jwt-secret
LOG_LEVEL=Warning
CORS_ORIGINS=https://yourdomain.com
```

## Deployment Procedures

### Manual Production Deployment

#### Prerequisites
1. Staging deployment successful
2. All tests passing
3. Security scans clean
4. Release notes prepared

#### Steps

1. **Trigger Deployment**:
   ```bash
   # Via GitHub UI
   Go to Actions → Deploy to Production → Run workflow
   
   # Specify version and deployment type
   Version: v1.2.0
   Deployment Type: blue-green
   ```

2. **Monitor Pre-deployment Validation**:
   - Docker image exists and security scan passes
   - Staging environment health verified
   - Database backup created (if migrations needed)

3. **Approve Deployment**:
   - Review deployment request
   - Verify readiness checklist
   - Approve in GitHub Environments

4. **Monitor Deployment**:
   - Watch deployment logs
   - Monitor health checks
   - Verify application functionality

5. **Post-deployment Verification**:
   ```bash
   # Health checks
   curl https://api.yourdomain.com/health
   curl https://api.yourdomain.com/health/ready
   curl https://api.yourdomain.com/health/database
   
   # Authentication test
   curl -X POST https://api.yourdomain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@modernapi.dev","password":"Admin@123!"}'
   
   # Version verification
   curl https://api.yourdomain.com/version
   ```

### Emergency Rollback

#### Automatic Rollback Triggers
- Health checks failing for >3 consecutive checks
- Error rate >5% for >5 minutes
- Database connectivity issues
- Authentication system failures

#### Manual Rollback

1. **Immediate Rollback** (Blue-Green):
   ```bash
   # Switch traffic back to previous environment
   # This is automated in the workflow but can be done manually
   
   # For Traefik
   curl -X PUT "https://traefik.yourdomain.com/api/http/routers/modernapi" \
     -H "Authorization: Bearer $TRAEFIK_API_TOKEN" \
     -d '{"rule":"Host(`api.yourdomain.com`)","service":"modernapi-blue"}'
   ```

2. **Kubernetes Rollback**:
   ```bash
   # Rollback to previous version
   kubectl rollout undo deployment/modernapi -n modernapi
   
   # Check rollback status
   kubectl rollout status deployment/modernapi -n modernapi
   ```

3. **Docker Compose Rollback**:
   ```bash
   # Update to previous image version
   export MODERNAPI_IMAGE=ghcr.io/your-org/modernapi:v1.1.0
   docker-compose up -d modernapi
   ```

### PR Preview Deployments

Automatic preview environments for pull requests.

**Trigger Events**:
- PR opened/synchronized
- PR approved
- Comment `/deploy-preview` on PR

**Features**:
- Isolated database per PR
- Unique subdomain (pr-123.preview.yourdomain.com)
- Automatic cleanup on PR close
- Full API testing capability

**Accessing PR Previews**:
```bash
# Preview URL format
https://pr-{PR_NUMBER}.preview.yourdomain.com

# Health check
curl https://pr-123.preview.yourdomain.com/health

# API docs
https://pr-123.preview.yourdomain.com/scalar/v1
```

## Database Migrations

### Migration Strategy

1. **Staging Migrations**: Automatic with staging deployments
2. **Production Migrations**: Manual approval required
3. **Rollback Strategy**: Database backups before migrations

### Migration Process

#### Automatic Backup
```bash
# Production backup (automated in workflow)
pg_dump "$PRODUCTION_DATABASE_URL" \
  --file="production_backup_$(date +%Y%m%d_%H%M%S).sql" \
  --verbose --clean --if-exists
```

#### Migration Execution
```bash
# Run migrations
dotnet ef database update \
  --project ModernAPI.Infrastructure \
  --startup-project ModernAPI.API \
  --connection "$PRODUCTION_DATABASE_URL" \
  --verbose
```

#### Migration Rollback
```bash
# Rollback to specific migration
dotnet ef database update PreviousMigrationName \
  --project ModernAPI.Infrastructure \
  --startup-project ModernAPI.API \
  --connection "$PRODUCTION_DATABASE_URL"
```

### Migration Best Practices

1. **Backward Compatibility**: New migrations should be backward compatible
2. **Data Migrations**: Separate data migrations from schema changes
3. **Testing**: Test migrations on staging data first
4. **Documentation**: Document breaking changes
5. **Monitoring**: Monitor application after migrations

## Monitoring and Observability

### Health Check Endpoints

ModernAPI provides comprehensive health checks:

```csharp
// Basic health
GET /health
Response: {"status": "Healthy", "timestamp": "2025-01-08T10:00:00Z"}

// Readiness (Kubernetes)
GET /health/ready
Response: {"status": "Ready", "checks": {"database": "Healthy"}}

// Database specific
GET /health/database
Response: {"status": "Healthy", "responseTime": "15ms"}

// Version info
GET /version
Response: {
  "version": "1.2.0",
  "environment": "Production",
  "gitCommit": "abc123",
  "buildDate": "2025-01-08T09:00:00Z"
}
```

### Metrics and Logging

#### Application Metrics
- Request/response times
- Error rates
- Authentication success/failure rates
- Database connection health
- Memory and CPU usage

#### Access Methods
```bash
# Grafana Dashboard
https://dashboard.yourdomain.com

# Prometheus Metrics
https://api.yourdomain.com/metrics

# Structured Logs (Seq)
https://logs.yourdomain.com

# Health Dashboard
https://api.yourdomain.com/health-ui
```

### Alerting

#### Critical Alerts (PagerDuty/Slack)
- Application down (>2 minutes)
- Database connection lost
- High error rate (>10% for >2 minutes)
- Memory usage >90% for >5 minutes

#### Warning Alerts (Slack/Teams)
- Elevated error rate (>5% for >5 minutes)
- High response times (>2s average for >10 minutes)
- Low disk space (<20%)

## Troubleshooting

### Common Deployment Issues

#### 1. Docker Image Not Found
```bash
Error: image "ghcr.io/your-org/modernapi:v1.2.0" not found

# Solutions:
# 1. Verify image exists
docker manifest inspect ghcr.io/your-org/modernapi:v1.2.0

# 2. Check registry authentication
docker login ghcr.io

# 3. Verify tag format matches release
git tag --list
```

#### 2. Database Connection Issues
```bash
Error: Unable to connect to PostgreSQL server

# Solutions:
# 1. Test connection string
psql "$DATABASE_URL" -c "SELECT 1;"

# 2. Check network connectivity
telnet db-host 5432

# 3. Verify credentials in secrets
echo "$PRODUCTION_DATABASE_URL" | base64 -d
```

#### 3. Health Check Failures
```bash
Error: Health check endpoint returning 503

# Diagnosis:
# 1. Check application logs
kubectl logs deployment/modernapi -n modernapi --tail=100

# 2. Test individual components
curl https://api.yourdomain.com/health/database
curl https://api.yourdomain.com/health/ready

# 3. Check resource usage
kubectl top pods -n modernapi
```

#### 4. SSL/TLS Certificate Issues
```bash
Error: SSL certificate verification failed

# Solutions:
# 1. Check certificate expiry
echo | openssl s_client -connect api.yourdomain.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# 2. Verify certificate chain
curl -vI https://api.yourdomain.com

# 3. Check Let's Encrypt renewal
docker logs traefik | grep acme
```

### Performance Issues

#### High Memory Usage
```bash
# Check memory usage
kubectl top pods -n modernapi

# Check for memory leaks
curl https://api.yourdomain.com/metrics | grep memory

# Solutions:
# 1. Increase memory limits
# 2. Check for connection leaks
# 3. Review caching strategies
```

#### Slow Response Times
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.yourdomain.com/health

# Check database performance
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;

# Solutions:
# 1. Add database indexes
# 2. Implement caching
# 3. Optimize queries
```

### Rollback Scenarios

#### When to Rollback
- Critical bugs affecting users
- Performance degradation >50%
- Security vulnerabilities discovered
- Data integrity issues
- Compliance violations

#### Rollback Decision Matrix
| Severity | Impact | Time to Fix | Decision |
|----------|--------|-------------|----------|
| Critical | High | >30 min | Rollback |
| High | Medium | >1 hour | Rollback |
| Medium | Low | >4 hours | Consider rollback |
| Low | Low | Any | Fix forward |

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing in CI
- [ ] Security scans clean
- [ ] Staging deployment successful
- [ ] Database migrations tested
- [ ] Release notes prepared
- [ ] Rollback plan documented
- [ ] Team notified of deployment window

### During Deployment
- [ ] Monitor deployment logs
- [ ] Verify health checks
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Verify version deployment
- [ ] Check database connectivity

### Post-Deployment
- [ ] Comprehensive health check
- [ ] Performance monitoring
- [ ] Error rate monitoring
- [ ] User acceptance testing
- [ ] Documentation updates
- [ ] Team notification of completion
- [ ] Schedule post-mortem if issues

## Infrastructure Management

### Scaling

#### Horizontal Scaling (Kubernetes)
```yaml
# Increase replica count
kubectl scale deployment modernapi --replicas=5 -n modernapi

# Auto-scaling configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: modernapi-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: modernapi
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

#### Vertical Scaling
```yaml
# Update resource limits
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi" 
    cpu: "500m"
```

### Backup and Recovery

#### Database Backups
```bash
# Automated daily backups
pg_dump "$PRODUCTION_DATABASE_URL" | \
  gzip > "backup_$(date +%Y%m%d).sql.gz"

# Restore from backup
gunzip -c backup_20250108.sql.gz | \
  psql "$PRODUCTION_DATABASE_URL"
```

#### Configuration Backups
```bash
# Backup Kubernetes configurations
kubectl get all -n modernapi -o yaml > k8s-backup.yml

# Backup secrets (encrypted)
kubectl get secrets -n modernapi -o yaml > secrets-backup.yml
```

## Security Considerations

### Deployment Security
- Use least-privilege service accounts
- Encrypt secrets at rest and in transit
- Regularly rotate deployment credentials
- Audit deployment access logs
- Implement network segmentation

### Runtime Security
- Enable container security scanning
- Implement runtime protection
- Monitor for anomalous behavior
- Use security headers
- Regular security assessments

## Cost Optimization

### Resource Management
- Right-size containers based on actual usage
- Use spot instances for non-critical workloads
- Implement auto-scaling to optimize costs
- Regular resource usage reviews
- Clean up unused resources

### Monitoring Costs
- Track deployment resource usage
- Monitor cloud provider bills
- Set up cost alerts
- Optimize data transfer costs
- Review storage usage regularly

This deployment guide should be used in conjunction with the CI/CD setup guide and security documentation for complete deployment coverage.