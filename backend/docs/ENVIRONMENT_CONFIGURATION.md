# Environment Configuration Guide

This guide covers how ModernAPI handles environment-specific configuration following 12-Factor App principles.

## Overview

ModernAPI uses a hierarchical configuration approach that prioritizes environment variables over configuration files, ensuring secrets never appear in source code and enabling the same codebase to run in multiple environments.

## Configuration Hierarchy (Priority Order)

1. **System Environment Variables** (highest priority)
2. **Environment-specific .env files** (`.env.development`, `.env.staging`, `.env.production`)
3. **Base .env file** 
4. **appsettings.{Environment}.json**
5. **appsettings.json** (lowest priority)

## Environment Files Structure

### Development Environment
**File**: `.env.development`
```bash
ASPNETCORE_ENVIRONMENT=Development
JWT_SECRET=development-jwt-secret-key-minimum-32-characters-for-security-compliance
POSTGRES_CONNECTION_STRING=Host=localhost;Port=5432;Database=modernapi_dev;Username=modernapi_user;Password=dev_password;
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Staging Environment
**File**: `.env.staging`
```bash
ASPNETCORE_ENVIRONMENT=Staging
JWT_SECRET=${STAGING_JWT_SECRET}  # From external secret manager
POSTGRES_CONNECTION_STRING=${STAGING_DATABASE_URL}
CORS_ORIGINS=${STAGING_CORS_ORIGINS}
```

### Production Environment
**File**: `.env.production`
```bash
ASPNETCORE_ENVIRONMENT=Production
JWT_SECRET=${PRODUCTION_JWT_SECRET}  # From secure vault
POSTGRES_CONNECTION_STRING=${PRODUCTION_DATABASE_URL}
CORS_ORIGINS=${PRODUCTION_CORS_ORIGINS}
```

## Configuration Variables Reference

### Authentication & Security
| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | JWT signing key (min 32 chars) | `your-secure-jwt-key-here` | ✅ |
| `JWT_ISSUER` | JWT issuer | `ModernAPI` | ✅ |
| `JWT_AUDIENCE` | JWT audience | `ModernAPI.Users` | ✅ |

### Database
| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `POSTGRES_CONNECTION_STRING` | PostgreSQL connection | `Host=localhost;Port=5432;...` | ✅ |

### Logging & Monitoring
| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SEQ_URL` | Seq logging server URL | `http://localhost:5341` | ❌ |
| `SEQ_API_KEY` | Seq API key | `your-seq-api-key` | ❌ |
| `LOG_LEVEL` | Minimum log level | `Debug`, `Information`, `Warning` | ❌ |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OpenTelemetry endpoint | `http://localhost:4317` | ❌ |

### CORS & Security
| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000,https://app.com` | ❌ |

### Feature Flags
| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `ENABLE_SWAGGER` | Enable Swagger UI | `true`, `false` | ❌ |
| `ENABLE_DETAILED_ERRORS` | Show detailed error messages | `true`, `false` | ❌ |

## Environment Detection

The application automatically detects the environment and loads the appropriate configuration:

```csharp
var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

// Loads .env.development, .env.staging, or .env.production
var envFiles = new[]
{
    $".env.{environment.ToLower()}",
    ".env"  // fallback
};
```

## Deployment Scenarios

### Local Development
```bash
# Uses .env.development automatically
dotnet run --project ModernAPI.API

# Or explicitly set environment
export ASPNETCORE_ENVIRONMENT=Development
dotnet run --project ModernAPI.API
```

### Docker Development
```yaml
# docker-compose.yml
services:
  modernapi:
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - JWT_SECRET=docker-dev-secret-key-32-chars-min
    env_file:
      - .env.development
```

### Production VPS
```bash
# Set environment variables on server
export ASPNETCORE_ENVIRONMENT=Production
export JWT_SECRET="$(vault kv get -field=jwt_secret secret/modernapi)"
export POSTGRES_CONNECTION_STRING="$(vault kv get -field=db_url secret/modernapi)"

# Run application
./ModernAPI.API
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: modernapi
        env:
        - name: ASPNETCORE_ENVIRONMENT
          value: "Production"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: modernapi-secrets
              key: jwt-secret
```

## Security Best Practices

### ✅ DO:
- Use environment variables for all secrets
- Keep different secrets for each environment
- Use external secret managers (Azure Key Vault, AWS Secrets Manager)
- Validate required configuration on startup
- Use strong, unique JWT secrets (minimum 32 characters)

### ❌ DON'T:
- Put secrets in .env.production files
- Commit actual secrets to version control
- Share secrets between environments
- Use weak or predictable secrets

## Configuration Validation

The application validates critical configuration on startup:

```csharp
// JWT Secret validation
if (string.IsNullOrEmpty(jwtSettings.Secret) || jwtSettings.Secret.Length < 32)
{
    throw new InvalidOperationException("JWT Secret must be at least 32 characters long");
}
```

## appsettings Files

### appsettings.json (Base)
```json
{
  "JwtSettings": {
    "Secret": "",  // Never put secrets here!
    "Issuer": "ModernAPI",
    "Audience": "ModernAPI.Users"
  }
}
```

### appsettings.Development.json
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug"
    }
  },
  "Features": {
    "EnableSwagger": true,
    "EnableDetailedErrors": true
  }
}
```

### appsettings.Production.json
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning"
    }
  },
  "Features": {
    "EnableSwagger": false,
    "EnableDetailedErrors": false
  }
}
```

## Environment Setup Guide

### 1. Development Setup
```bash
# Copy template
cp .env.example .env.development

# Edit with your values
nano .env.development

# Run application
dotnet run --project ModernAPI.API
```

### 2. Staging Setup
```bash
# Set staging-specific variables
export STAGING_JWT_SECRET="staging-secret-from-vault"
export STAGING_DATABASE_URL="postgresql://staging-db:5432/modernapi"
export ASPNETCORE_ENVIRONMENT=Staging

# Deploy application
./deploy-staging.sh
```

### 3. Production Setup
```bash
# Use external secret manager
kubectl create secret generic modernapi-secrets \
  --from-literal=jwt-secret="$(vault kv get -field=jwt secret/modernapi)" \
  --from-literal=database-url="$(vault kv get -field=db secret/modernapi)"

# Deploy to Kubernetes
kubectl apply -f k8s/
```

## Troubleshooting

### Common Issues

#### 1. "JWT Secret must be at least 32 characters long"
**Solution**: Set a secure JWT_SECRET environment variable
```bash
export JWT_SECRET="your-secure-jwt-secret-key-minimum-32-characters-long"
```

#### 2. Database connection failures
**Solution**: Verify POSTGRES_CONNECTION_STRING
```bash
export POSTGRES_CONNECTION_STRING="Host=localhost;Port=5432;Database=modernapi;Username=user;Password=pass;"
```

#### 3. Environment file not loading
**Solution**: Check file naming and location
```bash
# Ensure files exist in project root
ls -la .env*
# .env.development
# .env.staging  
# .env.production
```

### Debug Configuration Loading
```bash
# Enable configuration debug logging
export Logging__LogLevel__Microsoft.Extensions.Configuration=Debug
dotnet run --project ModernAPI.API
```

## Integration with External Services

### Azure Key Vault
```csharp
// In Program.cs for production
if (environment.IsProduction())
{
    builder.Configuration.AddAzureKeyVault(
        new Uri(Environment.GetEnvironmentVariable("AZURE_KEYVAULT_URL")!),
        new DefaultAzureCredential()
    );
}
```

### AWS Secrets Manager
```csharp
// In Program.cs for production
if (environment.IsProduction())
{
    builder.Configuration.AddSecretsManager(
        configurator: options =>
        {
            options.SecretFilter = entry => entry.Name.StartsWith("modernapi/");
        });
}
```

### HashiCorp Vault
```bash
# External script to populate environment
#!/bin/bash
export JWT_SECRET="$(vault kv get -field=jwt_secret secret/modernapi)"
export DATABASE_URL="$(vault kv get -field=database_url secret/modernapi)"
exec "$@"
```

## 12-Factor App Compliance

✅ **Factor III (Config)**: All config stored in environment  
✅ **Factor IV (Backing Services)**: Database and services configurable via URLs  
✅ **Factor V (Build/Release/Run)**: Strict separation maintained  
✅ **Factor X (Dev/Prod Parity)**: Same code runs in all environments  

## Migration Guide

### From Hardcoded Configuration
1. Move secrets to environment variables
2. Create environment-specific .env files  
3. Update deployment scripts
4. Test in staging environment
5. Deploy to production

### Example Migration
**Before**:
```json
{
  "JwtSettings": {
    "Secret": "hardcoded-secret-key-here"
  }
}
```

**After**:
```json
{
  "JwtSettings": {
    "Secret": ""  // Now comes from JWT_SECRET environment variable
  }
}
```

```bash
export JWT_SECRET="secure-secret-from-vault"
```

This configuration system ensures your ModernAPI template is production-ready, secure, and follows cloud-native best practices.