# ModernAPI Backend

A modern .NET 9 Web API implementing Clean Architecture with PostgreSQL database, JWT authentication, and comprehensive error handling.

## Features

### 🎯 REST API Excellence
- ✅ **REST Level 3 (HATEOAS)** - Hypermedia-driven navigation with self-discoverable API
- ✅ **Complete HTTP Verb Support** - GET, POST, PUT, PATCH, DELETE with proper semantics
- ✅ **API Versioning** - URL segment, header, and query string strategies
- ✅ **HTTP Caching & ETags** - Performance optimization with conditional requests (304/412)
- ✅ **JSON Patch Support** - RFC 6902 compliant partial updates
- ✅ **Standardized Status Codes** - RFC 7807 Problem Details for all errors

### 🏗️ Architecture & Development
- ✅ **Clean Architecture** - Domain, Application, Infrastructure, and API layers
- ✅ **Domain-Driven Design** - Rich domain models with business logic
- ✅ **JWT Authentication** - Secure token-based authentication with refresh tokens
- ✅ **PostgreSQL Database** - With Entity Framework Core and migrations
- ✅ **Redis Distributed Cache** - Scalable caching across multiple instances
- ✅ **Global Error Handling** - RFC 7807 Problem Details standard
- ✅ **Unit of Work Pattern** - Transaction management and repository coordination
- ✅ **Comprehensive Testing** - Unit, Integration, and API tests including REST compliance
- ✅ **Code Scaffolding** - CLI tool for generating Clean Architecture boilerplate

### 🚀 DevOps & Production
- ✅ **Docker Support** - Containerized database and application
- ✅ **API Documentation** - Versioned OpenAPI/Swagger with Scalar UI
- ✅ **Health Checks** - Database, cache, and application health monitoring
- ✅ **Environment Configuration** - 12-Factor App compliant configuration management
- ✅ **CI/CD Pipeline** - GitHub Actions with automated testing and deployment
- ✅ **Security Scanning** - Multi-layered security analysis and vulnerability detection
- ✅ **Blue-Green Deployment** - Zero-downtime production deployments
- ✅ **PR Preview Environments** - Isolated testing environments for pull requests
- ✅ **Monitoring & Observability** - Prometheus, Grafana, and structured logging
- ✅ **GitOps Workflow** - Git-based deployment and release management

## 📚 Documentation

- **[REST API Features](docs/REST_API_FEATURES.md)** - Complete feature overview and examples
- **[Developer Quick Reference](docs/DEVELOPER_QUICK_REFERENCE.md)** - Essential patterns and code examples
- **[Redis Setup Guide](docs/REDIS_SETUP.md)** - Distributed caching configuration and usage
- **[HTTP Status Codes](docs/HTTP_STATUS_CODES.md)** - Complete status code implementation guide

## Quick Start

### Prerequisites
- .NET 9 SDK
- Docker & Docker Compose

### Database & Cache Setup

1. Copy environment variables:
```bash
cp .env.example .env.development
```

2. Start PostgreSQL database and Redis cache:
```bash
docker-compose up -d
```

3. Verify services are running:
```bash
docker-compose ps
```

You should see both `modernapi-postgres` and `modernapi-redis` containers running.

### Development

1. Restore NuGet packages:
```bash
dotnet restore
```

2. Build the solution:
```bash
dotnet build
```

3. Apply database migrations:
```bash
dotnet ef database update --project ModernAPI.Infrastructure --startup-project ModernAPI.API
```

4. Run the API:
```bash
dotnet run --project ModernAPI.API
```

5. Access the API:
- API: http://localhost:5000
- Swagger/Scalar UI: http://localhost:5000/scalar/v1
- Health Check: http://localhost:5000/health

### Service Connections

#### PostgreSQL Database
- **Host**: localhost
- **Port**: 5432
- **Database**: modernapi
- **Username**: modernapi_user
- **Password**: dev_password_123 (default, change in .env)

Connect using JetBrains DataGrip or any PostgreSQL client.

#### Redis Cache
- **Host**: localhost
- **Port**: 6379
- **Password**: dev_redis_password (default, change in .env)

Connect using Redis CLI: `redis-cli -h localhost -p 6379 -a dev_redis_password`

### Docker Commands

```bash
# Start all services (database and cache)
docker-compose up -d

# Stop all services
docker-compose down

# View service logs
docker-compose logs -f postgres redis

# Reset all data (removes all data)
docker-compose down -v && docker-compose up -d

# Redis-specific commands
docker-compose logs -f redis
docker exec -it modernapi-redis redis-cli -a dev_redis_password
```

## Authentication

The API uses JWT authentication with refresh tokens. Default admin credentials:
- Email: admin@modernapi.dev
- Password: Admin@123!

For detailed authentication documentation, see [Authentication Guide](docs/AUTHENTICATION.md).

### Quick Authentication Test

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "confirmPassword": "Test123!",
    "displayName": "Test User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@modernapi.dev",
    "password": "Admin@123!"
  }'
```

## Project Structure

```
ModernAPI.Backend/
├── ModernAPI.API/           # Web API layer (Controllers, Middleware, Configuration)
├── ModernAPI.Application/   # Application layer (Services, DTOs, Interfaces)
├── ModernAPI.Domain/        # Domain layer (Entities, Value Objects, Domain Events)
├── ModernAPI.Infrastructure/# Infrastructure layer (Data Access, External Services)
├── tests/                   # Test projects
│   ├── ModernAPI.API.Tests/
│   ├── ModernAPI.Application.Tests/
│   ├── ModernAPI.Domain.Tests/
│   ├── ModernAPI.Infrastructure.Tests/
│   └── ModernAPI.IntegrationTests/
└── docs/                    # Documentation
    ├── AUTHENTICATION.md    # Authentication & Authorization guide
    ├── ERROR_HANDLING.md    # Error handling documentation
    └── DEVELOPER_TROUBLESHOOTING.md
```

## Documentation

### Core Application
- [Authentication Guide](docs/AUTHENTICATION.md) - JWT authentication, endpoints, and security
- [Error Handling Guide](docs/ERROR_HANDLING.md) - Error responses and handling patterns
- [Testing Guide](docs/TESTING.md) - Testing strategies and examples
- [Developer Troubleshooting](docs/DEVELOPER_TROUBLESHOOTING.md) - Common issues and solutions

### Development & Operations
- [Code Scaffolding Guide](docs/SCAFFOLDING.md) - CLI tool for generating Clean Architecture code
- [Environment Configuration](docs/ENVIRONMENT_CONFIGURATION.md) - Configuration management
- [Monitoring Guide](docs/MONITORING.md) - Observability and monitoring setup
- [Docker Production Guide](docs/DOCKER_PRODUCTION.md) - Production deployment with Docker

### CI/CD & GitOps
- [CI/CD Overview](docs/CICD_OVERVIEW.md) - Complete CI/CD system overview
- [CI/CD Setup Guide](docs/CICD_SETUP.md) - Step-by-step setup and configuration
- [Git Workflow Guide](docs/GIT_WORKFLOW.md) - Branching strategy and development workflow
- [Deployment Guide](docs/DEPLOYMENT.md) - Deployment procedures and troubleshooting
- [Security Scanning Guide](docs/SECURITY_SCANNING.md) - Security scanning and compliance

## Technologies

- **.NET 9** - Latest .NET framework
- **Entity Framework Core 9** - ORM with PostgreSQL provider
- **ASP.NET Core Identity** - User management and authentication
- **JWT Bearer Authentication** - Token-based authentication
- **PostgreSQL** - Primary database
- **Docker** - Containerization
- **FluentValidation** - Input validation
- **AutoMapper** - Object mapping
- **Serilog** - Structured logging
- **xUnit** - Testing framework

## Development Guidelines

### Clean Architecture Principles

1. **Domain Layer** - Contains business logic and entities
2. **Application Layer** - Contains use cases and application logic
3. **Infrastructure Layer** - Contains data access and external services
4. **API Layer** - Contains controllers and HTTP-specific code

## Code Scaffolding

ModernAPI includes a powerful CLI tool for generating Clean Architecture boilerplate:

### Install Scaffolding Tool
```bash
cd tools/ModernAPI.Scaffolding
dotnet pack
dotnet tool install --global --add-source ./nupkg ModernAPI.Scaffolding
```

### Generate New Entities
```bash
# Complete entity with all Clean Architecture layers
modernapi scaffold entity Product --properties "Name:string:required,Price:decimal:required"

# Entity with relationships
modernapi scaffold entity Order --properties "Total:decimal:required,CustomerId:Guid:foreign(Customer)"
```

**Generates 9 files** including entity, repository, service, controller, DTOs, and configurations.
**Time savings**: 2-3 hours → 5 minutes per entity.

See `tools/ModernAPI.Scaffolding/README.md` for full documentation.

### Adding New Features

1. Start with domain entities and business rules
2. Create application services and DTOs
3. Implement infrastructure repositories
4. Add API controllers and endpoints
5. Write tests at each layer
6. Update documentation

## Testing

Run all tests:
```bash
dotnet test
```

Run tests with coverage:
```bash
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

## Contributing

1. Follow Clean Architecture principles
2. Write tests for new features
3. Update documentation
4. Follow existing code patterns
5. Run tests before committing

## License

This is a template project for educational and development purposes.