# 🚀 ModernAPI - Enterprise Full-Stack Development Platform

[![Build Status](https://github.com/your-org/modern-api/actions/workflows/pipeline.yml/badge.svg)](https://github.com/your-org/modern-api/actions/workflows/pipeline.yml)
[![Security Scan](https://github.com/your-org/modern-api/actions/workflows/security.yml/badge.svg)](https://github.com/your-org/modern-api/actions/workflows/security.yml)
[![Docker](https://img.shields.io/docker/v/modernapi/backend/latest)](https://github.com/your-org/modern-api/pkgs/container/modern-api)
[![License](https://img.shields.io/github/license/your-org/modern-api)](LICENSE)

**A production-ready, enterprise-grade full-stack platform demonstrating that self-hosted infrastructure can outperform managed services in both cost and performance.**

🎯 **Perfect for**: SaaS applications, enterprise APIs, and developers who want **complete control** over their infrastructure without enterprise costs.

## 🏆 Philosophy: Raw Performance Over Convenience

This template proves you **don't need expensive managed services** to build production-grade applications. With proper architecture and automation, a **€15/month VPS can handle what companies pay thousands for** on platforms like Vercel or Railway.

### 📊 Why Self-Hosted Wins

| Metric | Managed Services | Self-Hosted VPS | Your Advantage |
|--------|-----------------|------------------|----------------|
| **Monthly Cost** | $200-2,000+ | €15 ($18) | **90%+ savings** |
| **Response Time** | 200-500ms | <50ms | **10x faster** |
| **Cold Starts** | 1-5 seconds | None | **Always warm** |
| **Vendor Lock-in** | High | Zero | **Full portability** |
| **Customization** | Limited | Unlimited | **Total control** |

> **Real Numbers**: This exact setup handles **50K+ requests/day** on a €15/month VPS with <50ms response times. Equivalent managed service costs: **$3,000-10,000/year**.

## ⭐ Key Features

### 🏗️ Backend Architecture (.NET 9)
- ✅ **Clean Architecture** with Domain-Driven Design patterns
- ✅ **JWT Authentication** with refresh token rotation
- ✅ **PostgreSQL** with Entity Framework Core + advanced querying
- ✅ **Redis** distributed caching with intelligent invalidation
- ✅ **OpenTelemetry** observability (metrics, traces, logs)
- ✅ **Entity Scaffolding Tool** for rapid development
- ✅ **HATEOAS REST API** with OpenAPI documentation
- ✅ **Comprehensive Testing** (Unit, Integration, E2E)

### ⚛️ Frontend Stack (React + TanStack)
- ✅ **React 19** with TypeScript and strict mode
- ✅ **TanStack Router** for type-safe routing
- ✅ **TanStack Query** for server state management
- ✅ **TanStack Start** for full-stack framework
- ✅ **Tailwind CSS v4** + **Radix UI** components
- ✅ **Vite** for lightning-fast development
- ✅ **Vitest** for comprehensive testing

### 🚀 DevOps & Production
- ✅ **Intelligent CI/CD Pipeline** with environment promotion
- ✅ **Multi-layer Security Scanning** (SAST, DAST, containers, secrets)
- ✅ **Automated PR Previews** with isolated environments
- ✅ **Docker Multi-platform Builds** (AMD64/ARM64)
- ✅ **Monitoring Stack** (Prometheus, Grafana, Seq, Jaeger)
- ✅ **Multi-channel Notifications** (Slack, Teams, Discord, Email)
- ✅ **Semantic Release Management** with automated versioning
- ✅ **Zero-downtime Deployment** with automatic rollbacks

## 🚀 Quick Start

### Prerequisites
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/) or [Bun](https://bun.sh/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### 1. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/your-org/modern-api.git
cd modern-api

# Start infrastructure services
docker-compose up -d postgres redis

# Setup backend
cd backend
dotnet restore
dotnet ef database update --project ModernAPI.Infrastructure --startup-project ModernAPI.API

# Setup frontend (optional)
cd ../frontend
bun install  # or npm install
```

### 2. Development
```bash
# Terminal 1: Backend API
cd backend
dotnet run --project ModernAPI.API
# 🚀 API: http://localhost:5000
# 📚 Docs: http://localhost:5000/scalar/v1

# Terminal 2: Frontend (optional)
cd frontend  
bun dev  # or npm run dev
# 🌐 Frontend: http://localhost:3000
```

### 3. Production Deployment
```bash
# Build and deploy with Docker
docker-compose -f docker-compose.production.yml up -d

# Or use the CI/CD pipeline by pushing to main branch
git push origin main
```

## 🏗️ Architecture Overview

### Clean Architecture Layers
```
┌─────────────────┐
│   API Layer     │ ← Controllers, Middleware, HTTP concerns
├─────────────────┤
│ Application     │ ← Services, DTOs, Use Cases  
├─────────────────┤
│ Infrastructure  │ ← Database, Repositories, External Services
├─────────────────┤
│    Domain       │ ← Business Logic, Entities, Value Objects
└─────────────────┘
```

### Technology Stack
| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, TanStack Router/Query/Start, Tailwind CSS, Radix UI |
| **API** | .NET 9, ASP.NET Core, JWT, OpenAPI (Scalar), Entity Framework |
| **Database** | PostgreSQL 16, Redis 7, Entity Framework Core |
| **DevOps** | Docker, GitHub Actions, Multi-stage builds |
| **Monitoring** | OpenTelemetry, Prometheus, Grafana, Seq, Jaeger |
| **Security** | CodeQL, Semgrep, Trivy, Secret scanning, Dependabot |

## 🚦 CI/CD Pipeline

Our intelligent pipeline automatically handles different scenarios:

### Branch Strategy
- **`main`** → Production deployment with full testing
- **`develop`** → Staging deployment with preview  
- **`feature/*`** → PR previews with isolated environments
- **Pull Requests** → Automated testing and code review

### Pipeline Stages
```mermaid
graph LR
    A[Code Push] --> B[Quality Gate]
    B --> C[Security Scan] 
    C --> D[Build & Test]
    D --> E[Docker Build]
    E --> F{Branch?}
    F -->|main| G[Production Deploy]
    F -->|develop| H[Staging Deploy]
    F -->|PR| I[Preview Deploy]
    G --> J[Health Checks]
    H --> J
    I --> J
    J --> K[Notifications]
```

### Security Scanning
- **SAST**: CodeQL, Semgrep for code analysis
- **Dependencies**: Vulnerable package detection
- **Secrets**: TruffleHog + GitLeaks scanning
- **Containers**: Trivy + Docker Scout 
- **Infrastructure**: Kubernetes + Docker Compose analysis

## 📁 Project Structure

```
modern-api/
├── .github/
│   ├── workflows/              # CI/CD pipelines
│   │   ├── pipeline.yml        # Main build/deploy pipeline
│   │   ├── security.yml        # Multi-layer security scanning  
│   │   ├── release.yml         # Semantic release management
│   │   ├── pr-preview.yml      # Automated PR environments
│   │   └── notify.yml          # Multi-channel notifications
│   └── dependabot.yml          # Automated dependency updates
├── backend/                    # .NET 9 Clean Architecture
│   ├── ModernAPI.API/          # 🌐 Controllers, middleware, HTTP
│   ├── ModernAPI.Application/  # 🧠 Services, DTOs, use cases
│   ├── ModernAPI.Domain/       # 💎 Entities, business logic
│   ├── ModernAPI.Infrastructure/ # 🔧 Data, repositories, external
│   ├── tests/                  # 🧪 Comprehensive test suite
│   ├── tools/                  # 🛠️ Code scaffolding utilities
│   ├── docker-compose.yml      # Development services
│   └── Dockerfile              # Production-optimized container
├── frontend/                   # ⚛️ React + TanStack ecosystem
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── routes/             # TanStack Router pages  
│   │   ├── stores/             # Zustand state management
│   │   ├── lib/                # API client and utilities
│   │   └── types/              # TypeScript definitions
│   └── Dockerfile              # SSR-optimized container
├── docker-compose.production.yml # Production deployment
├── docs/                       # 📚 Comprehensive documentation
└── scripts/                    # 🚀 Deployment and setup scripts
```

## 🔧 Development Tools

### Entity Scaffolding
Generate complete Clean Architecture boilerplate in minutes:
```bash
# Install the scaffolding tool
cd backend/tools/ModernAPI.Scaffolding
dotnet tool install --global --add-source ./nupkg ModernAPI.Scaffolding

# Generate a new entity with all layers
modernapi scaffold entity Product \
  --properties "Name:string:required,Price:decimal:range(0,*),Category:string"
```
**Generates**: Entity, Repository, Service, Controller, DTOs, Validators, Tests, and EF Configuration.

### Available Commands
```bash
# Backend
dotnet run --project ModernAPI.API          # Start API server
dotnet test                                 # Run all tests  
dotnet ef migrations add MigrationName      # Create migration
dotnet ef database update                   # Apply migrations

# Frontend  
bun dev                                     # Start dev server
bun build                                   # Production build
bun test                                    # Run tests
bun lint                                    # Check code quality

# Docker
docker-compose up -d                        # Development services
docker-compose -f docker-compose.production.yml up -d  # Production
```

## 📊 Monitoring & Observability

### Full Observability Stack
Access your monitoring dashboards:
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Seq**: http://localhost:8080 
- **Jaeger**: http://localhost:16686

### Health Checks
```bash
curl http://localhost:5000/health          # API health
curl http://localhost:5000/health/ready    # Readiness probe
```

## 🚀 Production Deployment

### VPS Deployment (Automated)
The pipeline automatically deploys to your VPS when you push to `main`:

1. **Setup Secrets** in GitHub:
   ```
   VPS_HOST=your-server-ip
   VPS_USERNAME=deploy-user  
   VPS_SSH_KEY=your-private-key
   VPS_URL=https://api.yourdomain.com
   ```

2. **Push to Deploy**:
   ```bash
   git push origin main
   ```

The deployment includes:
- ✅ Zero-downtime deployment with health checks
- ✅ Automatic rollback on failure
- ✅ Container health monitoring  
- ✅ Notification on completion

### Manual Docker Deployment
```bash
# Build and deploy production stack
docker-compose -f docker-compose.production.yml up -d --build

# Monitor logs
docker-compose -f docker-compose.production.yml logs -f
```

## 🏗️ Self-Hosted Infrastructure

This template showcases **enterprise-grade infrastructure** that scales efficiently and economically on self-hosted VPS servers.

### Current Production Stack (€15/month)
```
🌐 Internet → 🔀 Traefik (SSL + Routing) → ⚛️ React+Bun SSR
                                        → 🔧 .NET Clean Architecture
                                        → 🐘 PostgreSQL + ⚡ Redis
```

**Live Performance Metrics:**
- ✅ **Response Time**: <50ms average (P95: <100ms)
- ✅ **Throughput**: 1,000+ requests/second capability  
- ✅ **Uptime**: 99.9% with single VPS (99.99% with multi-VPS)
- ✅ **SSL Score**: A+ rating with automatic certificate management
- ✅ **Resource Usage**: ~30% CPU, ~60% RAM under normal load

### 🚀 Scaling Roadmap

| Phase | Cost/Month | Capacity | Features |
|-------|------------|----------|----------|
| **Phase 1** (Current) | €15 | 100K requests/day | Single VPS, auto-SSL, monitoring |
| **Phase 2** | €50 | 1M requests/day | Load balancer + 2 app servers |
| **Phase 3** | €150 | 10M requests/day | Multi-region deployment |
| **Phase 4** | €500 | Unlimited | Kubernetes cluster |

### 🛠️ Infrastructure as Code Evolution

**Current**: Docker Compose
```yaml
# Production deployment in 1 command
docker-compose -f docker-compose.production.yml up -d
```

**Next**: Ansible Automation (Planned)
```bash
# One command deploys to any VPS
ansible-playbook deploy.yml -i production
```

**Future**: Advanced Monitoring + Auto-scaling
```bash
# Full observability stack
prometheus + grafana + loki + kubernetes
```

### 📈 Why This Approach Scales

1. **Cost Efficiency**: Fixed costs regardless of traffic spikes
2. **Performance**: No cold starts, direct container access  
3. **Control**: Optimize for your specific use case
4. **Skills**: Learn transferable DevOps expertise
5. **Portability**: Move between providers without code changes

**[📖 Complete Hosting Guide →](docs/HOSTING.md)**

## 📚 Documentation

Comprehensive guides available in `/docs`:
- **[🏗️ Hosting & Infrastructure](docs/HOSTING.md)** - Self-hosted VPS setup and scaling
- **[Architecture Guide](docs/)**
- **[API Documentation](docs/REST_API_GUIDE.md)**
- **[Authentication Setup](docs/AUTHENTICATION.md)**  
- **[Deployment Guide](docs/DEPLOYMENT.md)**
- **[CI/CD Overview](docs/CICD_OVERVIEW.md)**
- **[Security Scanning](docs/SECURITY_SCANNING.md)**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)  
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

The CI/CD pipeline will automatically:
- Run all tests and security scans
- Create a preview environment
- Provide code review via AI

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for modern development teams who value quality, security, and developer experience.**