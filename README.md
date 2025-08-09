# ModernAPI Full-Stack Template

A production-ready full-stack application template with .NET Clean Architecture backend and React TanStack frontend.

## Features

### Backend (.NET 9)
- ✅ **Clean Architecture** with Domain-Driven Design
- ✅ **JWT Authentication** with refresh tokens
- ✅ **PostgreSQL** database with Entity Framework Core
- ✅ **Redis** distributed caching
- ✅ **OpenTelemetry** monitoring and observability
- ✅ **Comprehensive testing** across all layers
- ✅ **Docker** containerization
- ✅ **GitHub Actions** CI/CD

### Frontend (React + TanStack)
- ✅ **React 19** with TypeScript
- ✅ **TanStack Router** for routing
- ✅ **TanStack Query** for data fetching
- ✅ **TanStack Start** for full-stack framework
- ✅ **Tailwind CSS** + **Radix UI** components
- ✅ **Vite** for fast development
- ✅ **Vitest** for testing

## Quick Start

### Install the Template
```bash
# Install from this directory
dotnet new install .

# Verify installation
dotnet new list | grep modernapi
```

### Create a New Project
```bash
# Create your custom project
dotnet new modernapi --ProjectName "PersonalOS" --AuthorName "Your Name"

# Or with all options
dotnet new modernapi \
  --ProjectName "TaskManager" \
  --AuthorName "John Doe" \
  --CompanyName "TaskCorp" \
  --DatabaseName "taskmanager_db" \
  --IncludeFrontend true \
  --IncludeRedis true \
  --IncludeMonitoring true \
  --IncludeDocker true
```

### Available Parameters

| Parameter | Description | Default | Type |
|-----------|-------------|---------|------|
| `ProjectName` | Name of your project | `ModernAPI` | string |
| `AuthorName` | Author name for the project | `API Developer` | string |
| `CompanyName` | Company/organization namespace | `Company` | string |
| `DatabaseName` | PostgreSQL database name | `modernapi` | string |
| `JwtIssuer` | JWT token issuer | `ModernAPI` | string |
| `JwtAudience` | JWT token audience | `ModernAPI.Users` | string |
| `FrontendPort` | Frontend dev server port | `5173` | string |
| `ApiUrl` | API base URL for frontend | `http://localhost:5000` | string |
| `IncludeFrontend` | Include React frontend | `true` | bool |
| `IncludeAuth` | Include JWT authentication | `true` | bool |
| `IncludeRedis` | Include Redis caching | `true` | bool |
| `IncludeMonitoring` | Include OpenTelemetry monitoring | `true` | bool |
| `IncludeDocker` | Include Docker setup | `true` | bool |
| `IncludeScaffolding` | Include code scaffolding tool | `true` | bool |
| `IncludeCICD` | Include GitHub Actions | `true` | bool |

## After Creating Your Project

### Backend Setup
```bash
cd YourProject/backend

# Start dependencies
docker-compose up -d

# Restore packages and run migrations
dotnet restore
dotnet ef database update --project ModernAPI.Infrastructure --startup-project ModernAPI.API

# Run the API
dotnet run --project ModernAPI.API
```

### Frontend Setup (if included)
```bash
cd YourProject/frontend

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

## Project Structure

```
YourProject/
├── backend/                    # .NET Clean Architecture API
│   ├── YourProject.API/        # Controllers, middleware, configuration
│   ├── YourProject.Application/ # Services, DTOs, use cases
│   ├── YourProject.Domain/     # Entities, value objects, domain events
│   ├── YourProject.Infrastructure/ # Data access, external services
│   └── tests/                  # Comprehensive test suite
├── frontend/                   # React TanStack application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── routes/             # TanStack Router pages
│   │   ├── stores/             # Zustand state management
│   │   ├── lib/                # Utilities and API client
│   │   └── types/              # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml          # Development services
└── README.md
```

## Development Workflow

1. **Start Services**: `docker-compose up -d` (PostgreSQL, Redis)
2. **Backend**: `dotnet run --project YourProject.API`
3. **Frontend**: `npm run dev` (if included)
4. **Access**:
   - API: http://localhost:5000
   - Frontend: http://localhost:5173 (if included)
   - API Docs: http://localhost:5000/scalar/v1

## Template Updates

```bash
# Update the template
cd path/to/ModernAPI
git pull origin main
dotnet new install . --force

# Create new projects with updated template
dotnet new modernapi --ProjectName "NewProject"
```

## Uninstall Template

```bash
dotnet new uninstall ModernAPI.FullStack
```

## What Gets Replaced

When you create a new project, the template engine replaces:
- `ModernAPI` → Your `ProjectName` throughout all files
- Namespaces: `ModernAPI.Domain` → `YourProject.Domain`
- Database names, JWT settings, API URLs
- Package.json name, Docker container names
- Documentation and README files

## Examples

### Personal Productivity System
```bash
dotnet new modernapi \
  --ProjectName "PersonalOS" \
  --AuthorName "Marcus Pedersen" \
  --DatabaseName "personalos_db" \
  --IncludeFrontend true
```

### Minimal API-Only Project
```bash
dotnet new modernapi \
  --ProjectName "BlogAPI" \
  --IncludeFrontend false \
  --IncludeRedis false \
  --IncludeMonitoring false
```

### Enterprise Full-Stack
```bash
dotnet new modernapi \
  --ProjectName "InventorySystem" \
  --CompanyName "Enterprise Corp" \
  --AuthorName "Development Team" \
  --IncludeFrontend true \
  --IncludeMonitoring true \
  --IncludeCICD true
```

This template provides a solid foundation for modern full-stack applications with proven architectural patterns and production-ready features.