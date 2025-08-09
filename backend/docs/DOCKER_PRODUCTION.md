# Docker Production Deployment Guide

This guide covers deploying ModernAPI in production using Docker and Docker Compose with a complete monitoring stack.

## Overview

The production Docker setup includes:

- **ModernAPI Application** - .NET 9 Web API with JWT authentication
- **PostgreSQL Database** - Primary data storage with optimized configuration
- **Traefik Reverse Proxy** - SSL termination, load balancing, and routing
- **Monitoring Stack** - Prometheus, Grafana, Seq, and OpenTelemetry
- **Security Hardening** - Non-root containers, network isolation, resource limits

## Quick Start

### Prerequisites

- Docker Engine 20.10+ and Docker Compose v2
- Domain name with DNS pointing to your server
- SSL certificate (Let's Encrypt via Traefik)

### 1. Environment Configuration

Copy the production environment template:

```bash
cp .env.example .env.production
```

Configure essential variables in `.env.production`:

```env
# Domain Configuration
DOMAIN=yourdomain.com
API_DOMAIN=api.yourdomain.com
ACME_EMAIL=admin@yourdomain.com

# Security
JWT_SECRET=your-very-long-jwt-secret-key-minimum-32-characters-2024
POSTGRES_PASSWORD=your-secure-database-password-here
GRAFANA_ADMIN_PASSWORD=your-grafana-admin-password
SEQ_API_KEY=your-seq-api-key-for-structured-logging

# Database
POSTGRES_USER=modernapi_user
POSTGRES_DB=modernapi
DATABASE_URL=Host=postgres;Database=modernapi;Username=modernapi_user;Password=your-secure-database-password-here

# CORS (adjust for your frontend domains)
CORS_ORIGINS=https://app.yourdomain.com,https://admin.yourdomain.com
```

### 2. Deploy with Script

Use the deployment script for automated deployment:

```bash
./scripts/deploy-docker.sh --deploy
```

Or deploy manually:

```bash
# Build images
docker build --target runtime --tag modernapi:latest .

# Start services
docker-compose -f docker-compose.production.yml --env-file .env.production up -d

# Check health
docker-compose -f docker-compose.production.yml ps
```

### 3. Verify Deployment

The script will show service URLs and status. Access your services:

- **API**: https://api.yourdomain.com
- **Grafana**: https://dashboard.yourdomain.com
- **Prometheus**: https://metrics.yourdomain.com  
- **Seq Logs**: https://logs.yourdomain.com
- **Traefik Dashboard**: https://traefik.yourdomain.com

## Architecture

### Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           Internet                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│ Traefik (Reverse Proxy + SSL)                                  │
│ • SSL Termination (Let's Encrypt)                              │
│ • Load Balancing                                               │
│ • Request Routing                                              │
└────────────┬────────────────────────┬───────────────────────────┘
             │                        │
┌────────────▼────────────┐ ┌─────────▼───────────────────────────┐
│ ModernAPI Application   │ │ Monitoring Stack                    │
│ • .NET 9 Web API        │ │ • Grafana (Dashboards)             │
│ • JWT Authentication    │ │ • Prometheus (Metrics)             │  
│ • OpenTelemetry         │ │ • Seq (Structured Logs)            │
│ • Health Checks         │ │ • OpenTelemetry Collector          │
└────────────┬────────────┘ └─────────────────────────────────────┘
             │
┌────────────▼────────────┐
│ PostgreSQL Database     │
│ • Persistent Storage    │
│ • Optimized Config      │
│ • Health Checks         │
└─────────────────────────┘
```

### Network Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ modernapi-network (172.20.0.0/16)                              │
│ ┌─────────────┐ ┌──────────────┐ ┌─────────────────────────────┐│
│ │ ModernAPI   │ │ PostgreSQL   │ │ Traefik                     ││
│ │ :8080       │ │ :5432        │ │ :80, :443                   ││
│ └─────────────┘ └──────────────┘ └─────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ monitoring-network (172.21.0.0/16)                             │
│ ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐│
│ │ Grafana     │ │ Prometheus   │ │ Seq          │ │ OTel      ││
│ │ :3000       │ │ :9090        │ │ :5341        │ │ :4317     ││
│ └─────────────┘ └──────────────┘ └──────────────┘ └───────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Configuration Details

### Environment Variables

#### Application Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `ASPNETCORE_ENVIRONMENT` | Application environment | `Production` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-very-long-secret...` |
| `JWT_ISSUER` | JWT token issuer | `ModernAPI` |
| `JWT_AUDIENCE` | JWT token audience | `ModernAPI.Users` |
| `DATABASE_URL` | PostgreSQL connection string | `Host=postgres;Database=...` |
| `CORS_ORIGINS` | Allowed CORS origins | `https://app.example.com` |

#### Infrastructure Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `DOMAIN` | Base domain | `yourdomain.com` |
| `API_DOMAIN` | API subdomain | `api.yourdomain.com` |
| `ACME_EMAIL` | Let's Encrypt email | `admin@yourdomain.com` |
| `POSTGRES_PASSWORD` | Database password | `secure-password-123` |
| `GRAFANA_ADMIN_PASSWORD` | Grafana admin password | `grafana-admin-pass` |

#### Monitoring Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `SEQ_API_KEY` | Seq logging API key | `seq-api-key-123` |
| `LOG_LEVEL` | Application log level | `Warning` |
| `OTEL_SERVICE_NAME` | OpenTelemetry service name | `ModernAPI` |

### Resource Limits

Each service has configured resource limits for production stability:

#### ModernAPI Application
- **CPU**: 0.25-1.0 cores
- **Memory**: 256MB-512MB
- **Replicas**: 1 (can be scaled)

#### PostgreSQL Database  
- **CPU**: 0.25-1.0 cores
- **Memory**: 256MB-1GB
- **Storage**: Persistent volume
- **Configuration**: Optimized for performance

#### Monitoring Stack
- **Prometheus**: 512MB memory limit
- **Grafana**: 256MB memory limit
- **Seq**: 512MB memory limit

### Security Configuration

#### Container Security
- All containers run as non-root users
- Read-only root filesystems where possible
- Dropped capabilities
- Security context restrictions

#### Network Security
- Service isolation with dedicated networks
- No exposed database ports
- All traffic through Traefik reverse proxy
- SSL/TLS encryption for all external communication

#### Data Security
- Encrypted database connections
- JWT secrets from environment variables
- No hardcoded credentials
- Secure secret management

## Operations

### Deployment Script Commands

The deployment script (`scripts/deploy-docker.sh`) provides these operations:

```bash
# Deploy application
./scripts/deploy-docker.sh --deploy

# Update deployment
./scripts/deploy-docker.sh --update

# Create backup
./scripts/deploy-docker.sh --backup

# Check health
./scripts/deploy-docker.sh --health

# View logs
./scripts/deploy-docker.sh --logs [service_name]

# Clean up resources
./scripts/deploy-docker.sh --cleanup

# Stop services
./scripts/deploy-docker.sh --stop
```

### Manual Operations

#### Service Management

```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Stop all services
docker-compose -f docker-compose.production.yml down

# Restart specific service
docker-compose -f docker-compose.production.yml restart modernapi

# Scale ModernAPI instances
docker-compose -f docker-compose.production.yml up -d --scale modernapi=3
```

#### Health Monitoring

```bash
# Check service status
docker-compose -f docker-compose.production.yml ps

# View service logs
docker-compose -f docker-compose.production.yml logs -f modernapi

# Check container health
docker inspect --format='{{.State.Health.Status}}' modernapi-app
```

#### Database Operations

```bash
# Database backup
docker-compose -f docker-compose.production.yml exec postgres \
    pg_dump -U modernapi_user modernapi > backup_$(date +%Y%m%d_%H%M%S).sql

# Database restore
docker-compose -f docker-compose.production.yml exec -T postgres \
    psql -U modernapi_user modernapi < backup_file.sql

# Database shell
docker-compose -f docker-compose.production.yml exec postgres \
    psql -U modernapi_user modernapi
```

### Rolling Updates

For zero-downtime updates:

1. **Build new image**:
   ```bash
   docker build --target runtime --tag modernapi:v1.1.0 .
   docker tag modernapi:v1.1.0 modernapi:latest
   ```

2. **Rolling update**:
   ```bash
   docker-compose -f docker-compose.production.yml up -d --no-deps modernapi
   ```

3. **Verify deployment**:
   ```bash
   curl -f https://api.yourdomain.com/health
   ```

## Monitoring and Observability

### Metrics (Prometheus + Grafana)

**Prometheus Configuration**: `monitoring/prometheus/prometheus.yml`
- Scrapes metrics every 30 seconds
- Stores 30 days of data
- Auto-discovery of services

**Grafana Dashboards**: `monitoring/grafana/dashboards/`
- ModernAPI Overview Dashboard
- System metrics and performance
- Authentication and business metrics

**Key Metrics Monitored**:
- HTTP request rate and duration
- Authentication success/failure rates
- Database connection health
- Memory and CPU usage
- Error rates and types

### Logging (Seq)

**Structured Logging** with Serilog:
- JSON formatted logs
- Correlation IDs for request tracing
- Log levels: Warning and above in production
- Integration with ASP.NET Core diagnostics

**Seq Dashboard**: `https://logs.yourdomain.com`
- Search and filter logs
- Real-time log streaming  
- Alert configuration
- Log analysis and visualization

### Tracing (OpenTelemetry)

**Distributed Tracing**:
- HTTP request tracing
- Database query tracing
- Custom span creation
- Export to Jaeger (optional)

### Health Checks

**Application Health Endpoints**:
- `/health` - Basic health check
- `/health/ready` - Readiness probe
- Database connectivity check
- External service dependency checks

## SSL/TLS Configuration

### Let's Encrypt (Automatic)

Traefik automatically manages SSL certificates:

```yaml
# Traefik configuration in docker-compose.production.yml
environment:
  - TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME_EMAIL=${ACME_EMAIL}
  - TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME_STORAGE=/letsencrypt/acme.json
  - TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME_HTTPCHALLENGE_ENTRYPOINT=web
```

**Certificate Storage**: Persistent volume at `/letsencrypt/acme.json`

### Custom SSL Certificates

To use custom SSL certificates:

1. **Place certificates** in `./ssl/` directory:
   ```
   ssl/
   ├── cert.pem
   └── key.pem
   ```

2. **Update Traefik configuration** to use file provider
3. **Mount SSL directory** in docker-compose.yml

## Performance Optimization

### Database Optimization

PostgreSQL is configured with production-optimized settings:

```sql
# Key PostgreSQL settings
max_connections=200
shared_buffers=256MB
effective_cache_size=1GB
work_mem=4MB
maintenance_work_mem=64MB
checkpoint_completion_target=0.9
wal_buffers=16MB
```

### Application Optimization

**.NET Production Configuration**:
- Server garbage collection
- Production build optimizations
- ReadyToRun compilation
- Trimmed deployments

**Caching Strategy**:
- Response caching for GET endpoints
- In-memory caching for frequently accessed data
- Database query optimization

### Container Optimization

**Multi-stage Docker builds**:
- Separate build and runtime images
- Minimal runtime image (ASP.NET Core runtime only)
- Optimized layer caching

## Backup and Recovery

### Automated Backups

The deployment script includes backup functionality:

```bash
# Create backup
./scripts/deploy-docker.sh --backup

# Backup location: ./backups/YYYYMMDD_HHMMSS/
```

### Manual Backup

```bash
# Database backup
docker-compose -f docker-compose.production.yml exec postgres \
    pg_dumpall -U modernapi_user > full_backup.sql

# Application logs backup
docker cp modernapi-app:/app/logs ./logs_backup/

# Configuration backup
cp .env.production ./backups/
cp docker-compose.production.yml ./backups/
```

### Recovery Procedures

1. **Database Recovery**:
   ```bash
   # Stop application
   docker-compose -f docker-compose.production.yml stop modernapi
   
   # Restore database
   docker-compose -f docker-compose.production.yml exec -T postgres \
       psql -U modernapi_user -d postgres < full_backup.sql
   
   # Start application
   docker-compose -f docker-compose.production.yml start modernapi
   ```

2. **Full System Recovery**:
   ```bash
   # Deploy from backup configuration
   cp ./backups/.env.production .env.production
   ./scripts/deploy-docker.sh --deploy
   
   # Restore data
   # ... restore database and persistent volumes
   ```

## Security Considerations

### Production Security Checklist

- [ ] **Environment Variables**: All secrets in environment variables, not config files
- [ ] **SSL/TLS**: All communication encrypted (HTTPS only)
- [ ] **Database Security**: Strong passwords, encrypted connections
- [ ] **Container Security**: Non-root users, minimal images
- [ ] **Network Security**: Service isolation, firewall rules
- [ ] **Monitoring**: Security event logging and alerting
- [ ] **Backup Security**: Encrypted backups, secure storage
- [ ] **Access Control**: Limited server access, key-based authentication

### Security Monitoring

**Log Analysis**: Monitor for:
- Failed authentication attempts
- Unusual request patterns
- Error rate spikes
- Unauthorized access attempts

**Metrics Alerting**: Set alerts for:
- High error rates (>5% 5xx responses)
- Authentication failure spikes
- Resource exhaustion
- Service downtime

## Troubleshooting

### Common Issues

#### SSL Certificate Issues

```bash
# Check certificate status
docker-compose -f docker-compose.production.yml logs traefik

# Force certificate renewal
docker-compose -f docker-compose.production.yml restart traefik
```

#### Database Connection Issues

```bash
# Check database health
docker-compose -f docker-compose.production.yml exec postgres pg_isready

# Check connection string
docker-compose -f docker-compose.production.yml exec modernapi \
    printenv | grep DATABASE_URL
```

#### Memory/Performance Issues

```bash
# Check resource usage
docker stats

# Check application metrics
curl https://api.yourdomain.com/metrics

# Review logs for memory leaks
docker-compose -f docker-compose.production.yml logs modernapi | grep -i memory
```

### Log Analysis

**Application Logs**:
```bash
# Real-time application logs
docker-compose -f docker-compose.production.yml logs -f modernapi

# Error logs only
docker-compose -f docker-compose.production.yml logs modernapi | grep ERROR
```

**System Logs**:
```bash
# Container resource usage
docker-compose -f docker-compose.production.yml top

# System performance
htop
iostat -x 1
```

## Scaling

### Horizontal Scaling

**Scale ModernAPI instances**:
```bash
# Scale to 3 instances
docker-compose -f docker-compose.production.yml up -d --scale modernapi=3

# Load balancer (Traefik) automatically distributes traffic
```

**Database Scaling**:
- Read replicas for read-heavy workloads
- Connection pooling optimization
- Database partitioning for large datasets

### Vertical Scaling

**Increase container resources**:

```yaml
# In docker-compose.production.yml
deploy:
  resources:
    limits:
      cpus: '2.0'      # Increase CPU limit
      memory: 1G       # Increase memory limit
    reservations:
      cpus: '0.5'      # Increase CPU reservation
      memory: 512M     # Increase memory reservation
```

## Migration to Kubernetes

When ready to migrate to Kubernetes, the application includes:

- Kubernetes manifests in `k8s/` directory
- Helm charts (future enhancement)
- Migration documentation
- Deployment scripts for Kubernetes

See [Kubernetes Deployment Guide](KUBERNETES_PRODUCTION.md) for details.

## Support and Maintenance

### Regular Maintenance

**Weekly Tasks**:
- Review monitoring dashboards
- Check error rates and logs
- Verify backup integrity
- Update security patches

**Monthly Tasks**:
- Rotate JWT secrets
- Update container images
- Review resource usage
- Performance optimization

**Quarterly Tasks**:
- Security audit
- Disaster recovery testing
- Capacity planning
- Documentation updates

### Getting Help

1. **Check logs** first: `./scripts/deploy-docker.sh --logs`
2. **Review metrics** in Grafana dashboard
3. **Consult documentation** in `/docs` directory
4. **Check health endpoints** for service status

---

For additional deployment options, see:
- [Kubernetes Production Guide](KUBERNETES_PRODUCTION.md)
- [VPS Deployment Guide](VPS_DEPLOYMENT.md)
- [Environment Configuration Guide](ENVIRONMENT_CONFIGURATION.md)