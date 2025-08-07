# Modern Fullstack Application Template - Technical Specification

## Overview
A comprehensive, production-ready template for modern fullstack applications following 12-factor methodology, designed for scalability, maintainability, and developer experience.

## Technology Stack

### Backend (.NET 9)
- **Runtime**: .NET 9 with C# 13
- **Framework**: ASP.NET Core Web API
- **Authentication**: ASP.NET Core Identity (self-contained)
- **Database**: PostgreSQL with Entity Framework Core
- **Caching**: Redis (containerized)
- **Message Queue**: RabbitMQ (self-hosted, containerized)
- **Logging**: Serilog with structured logging
- **Monitoring**: OpenTelemetry with Prometheus metrics
- **Documentation**: Scalar API documentation with OpenAPI 3.1 schemas

### Frontend (React 19)
- **Framework**: React 19 with TypeScript 5.x
- **Build Tool**: Vite
- **Routing**: TanStack Router (type-safe routing)
- **Server State**: TanStack Query (data fetching, caching, synchronization)
- **Forms**: TanStack Form with Zod validation (generated from OpenAPI schemas)
- **Client State**: Zustand (lightweight client state)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Testing**: Vitest + React Testing Library + comprehensive ESLint
- **ESLint Plugins**: @typescript-eslint, @tanstack/query, @tanstack/router, jsx-a11y
- **Type Safety**: Full end-to-end TypeScript with generated API clients

### Infrastructure & DevOps (Self-Hosted)
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose (production-ready with multiple replicas)
- **CI/CD**: GitHub Actions with automated testing, security scanning, and deployment
- **Database Migrations**: EF Core migrations with automated deployment
- **Secret Management**: Docker secrets + environment variables
- **Monitoring**: Self-hosted Grafana + Prometheus + Loki stack
- **Reverse Proxy**: Traefik with automatic SSL (Let's Encrypt)
- **Backup Strategy**: Automated PostgreSQL backups with retention policies

## Architecture Implementation

### Backend Architecture: Clean Architecture (Layer-Focused)
- **Domain Layer**: Entities, value objects, domain services, interfaces
- **Application Layer**: Services, DTOs, validation, business logic
- **Infrastructure Layer**: Data access, external services, repositories
- **API Layer**: Controllers, middleware, dependency injection configuration

**Benefits**: Clear separation of concerns, testable, framework-independent core, familiar to most developers

### Data Access Pattern: Repository + Unit of Work
- **Repository Pattern**: Abstract data access for each aggregate root
- **Unit of Work Pattern**: Centralized transaction management across repositories
- **Entity Framework Core**: ORM with code-first approach
- **Benefits**: Familiar pattern, easier to understand, good for learning Clean Architecture principles

### Service Layer Structure
```csharp
public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IValidator<CreateUserRequest> _validator;
    
    // Business logic implementation with validation
}
```

### Validation Architecture: Single Source of Truth
- **Backend**: FluentValidation defines all business rules and validation logic
- **OpenAPI Schema**: Validation rules are reflected in OpenAPI documentation
- **Frontend**: Zod schemas generated from OpenAPI for client-side validation
- **Error Handling**: Consistent RFC 7807 Problem Details for validation errors
- **Type Safety**: End-to-end TypeScript types generated from validated schemas

```
Backend FluentValidation → OpenAPI Schema → Generated Zod Schemas → TanStack Form
```

### Testing Philosophy
Each test project mirrors its corresponding production layer, enforcing architectural boundaries:

- **Domain.Tests**: No external dependencies, pure unit tests
- **Application.Tests**: Mock all infrastructure dependencies  
- **Infrastructure.Tests**: Test real implementations with test doubles for external services
- **API.Tests**: Test controllers and middleware in isolation
- **IntegrationTests**: Full stack testing with test database

This structure prevents architectural violations and ensures each layer can be tested independently.

## 12-Factor App Compliance

1. **Codebase**: Single repo with multiple deployments
2. **Dependencies**: Explicit dependency declaration (packages, Docker)
3. **Config**: Environment-specific configuration (appsettings, env vars)
4. **Backing Services**: Treat databases, caches as attached resources
5. **Build, Release, Run**: Strict separation of build and runtime
6. **Processes**: Stateless processes with shared-nothing architecture
7. **Port Binding**: Self-contained services exposing HTTP
8. **Concurrency**: Scale via process model (horizontal scaling)
9. **Disposability**: Fast startup and graceful shutdown
10. **Dev/Prod Parity**: Keep environments as similar as possible
11. **Logs**: Treat logs as event streams
12. **Admin Processes**: Run admin tasks as one-off processes

## Development Experience

### Local Development
- **Setup**: Single command setup with Docker Compose
- **Hot Reload**: Both frontend and backend with file watching
- **Database**: Seeded development database with sample data
- **Testing**: Integrated test runner with coverage reporting
- **Debugging**: Configured VS Code launch configurations

### Code Quality & Standards
- **EditorConfig**: Consistent formatting across IDEs
- **Compiler Settings**: Treat warnings as errors, nullable reference types enabled
- **Linting**: ESLint with TanStack plugins (frontend), StyleCop/SonarAnalyzer (.NET)
- **Formatting**: Prettier (frontend), built-in .NET formatting
- **Code Analysis**: Built-in .NET analyzers + custom rules
- **Exception Handling**: Dogmatic global exception handling approach
- **Documentation**: XML documentation required for public APIs

### Testing Strategy (Per-Layer Architecture)
- **Domain.Tests**: Pure unit tests for entities, value objects, domain services
- **Application.Tests**: Service layer tests with mocked dependencies
- **Infrastructure.Tests**: Repository and external service integration tests
- **API.Tests**: Controller and middleware unit tests
- **IntegrationTests**: Full API testing with test database
- **Frontend Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright for critical user journeys

## Security Features

### Authentication & Authorization
- **Identity**: ASP.NET Core Identity with JWT tokens
- **Multi-factor**: TOTP support with QR code generation
- **Password Policy**: Configurable complexity requirements
- **Account Management**: Email verification, password reset
- **Authorization**: Role-based + claim-based access control

### Security Measures
- **HTTPS**: Enforced in all environments
- **CORS**: Configurable cross-origin policies
- **Rate Limiting**: Built-in request throttling
- **Input Validation**: Server-side validation with FluentValidation
- **SQL Injection**: Parameterized queries via EF Core
- **XSS Protection**: Content Security Policy headers
- **Dependency Scanning**: Automated vulnerability checks

## Deployment & Operations

### Environments (VPS-Based)
- **Development**: Local Docker Compose
- **Staging**: Digital Ocean VPS with Docker Compose
- **Production**: Digital Ocean VPS with Docker Compose + load balancing

### Monitoring & Observability
- **Health Checks**: Built-in health endpoints
- **Metrics**: Custom business metrics + system metrics
- **Logging**: Structured logging with correlation IDs
- **Tracing**: Distributed tracing for request flow
- **Alerting**: Configurable alerts for critical issues

## Project Structure
```
src/
├── backend/
│   ├── ModernAPI.Domain/
│   ├── ModernAPI.Application/
│   ├── ModernAPI.Infrastructure/
│   ├── ModernAPI.API/
│   └── tests/
│       ├── ModernAPI.Domain.Tests/
│       ├── ModernAPI.Application.Tests/
│       ├── ModernAPI.Infrastructure.Tests/
│       ├── ModernAPI.API.Tests/
│       └── ModernAPI.IntegrationTests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── tests/
├── docs/
├── scripts/
└── infrastructure/
    ├── docker/
    └── scripts/
```

## Code Quality Standards

### .NET Code Standards
- **Compiler Configuration**:
  - `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`
  - `<Nullable>enable</Nullable>`
  - `<ImplicitUsings>enable</ImplicitUsings>`
  - `<WarningsAsErrors />` (all warnings become errors)
  - `<WarningsNotAsErrors>CS1591</WarningsNotAsErrors>` (allow missing XML docs in some cases)

- **Code Analysis Rules**:
  - StyleCop analyzers for consistent code style
  - Microsoft.CodeAnalysis.NetAnalyzers for best practices
  - SonarAnalyzer for code quality and security
  - Custom rules for domain-specific patterns

- **Naming Conventions**:
  - PascalCase for classes, methods, properties
  - camelCase for fields, parameters, local variables
  - Interfaces prefixed with 'I'
  - Async methods suffixed with 'Async'
  - Constants in PascalCase

### TypeScript/React Standards
- **Strict TypeScript Configuration**:
  - `strict: true`
  - `noUncheckedIndexedAccess: true`
  - `exactOptionalPropertyTypes: true`

- **ESLint Rules**:
  - @typescript-eslint/recommended
  - react-hooks/recommended
  - Custom rules for consistent patterns

- **Naming Conventions**:
  - PascalCase for React components
  - camelCase for functions and variables
  - SCREAMING_SNAKE_CASE for constants
  - kebab-case for file names

### EditorConfig Standards
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.{cs,csx}]
indent_size = 4

[*.{json,yml,yaml}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

## Implementation Details

### Message Queue Implementation
- **RabbitMQ**: Containerized message broker for reliable async processing
- **Integration**: Background services for message consumption
- **Patterns**: Publish/Subscribe for event-driven architecture

### Monitoring Stack (Self-Hosted)
- **Prometheus**: Metrics collection and storage
- **Grafana**: Dashboards and alerting
- **Loki**: Log aggregation and querying
- **Jaeger**: Distributed tracing (optional)
- **Health Checks**: Built-in ASP.NET Core health check endpoints

### API Documentation & Tooling
- **Scalar**: Modern, interactive API documentation (replaces Swagger UI)
- **OpenAPI 3.1**: Comprehensive schema with validation rules
- **Code Generation**: TypeScript client and Zod schemas from OpenAPI
- **Development**: Hot-reload API documentation during development

### Deployment Configuration
- **Docker Compose**: Production-ready with service scaling
- **Traefik**: Reverse proxy with automatic SSL certificates
- **PostgreSQL**: Primary database with automated backups
- **Redis**: Caching and session storage
- **RabbitMQ**: Message queuing for background processing

### Security Implementation
- **HTTPS Enforcement**: All traffic redirected to HTTPS
- **JWT Authentication**: ASP.NET Core Identity with JWT tokens
- **CORS Configuration**: Restrictive cross-origin policies
- **Rate Limiting**: Built-in request throttling middleware
- **Input Validation**: FluentValidation (backend) + Zod schemas (frontend, generated from OpenAPI)
- **Security Headers**: Comprehensive security header middleware
- **Global Exception Handling**: RFC 7807 Problem Details with structured error responses

---

**Note**: For alternative architectural approaches and patterns not implemented in this template, see [ALTERNATIVE_APPROACHES.md](./ALTERNATIVE_APPROACHES.md).