import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { 
  BookOpen, 
  Code, 
  Shield, 
  Database, 
  TestTube, 
  Zap,
  Users,
  GitBranch,
  Cloud,
  Monitor,
  Layers,
  Target,
  ArrowRight
} from 'lucide-react'

export const Route = createFileRoute('/docs/handbook')({
  component: HandbookPage,
})

function HandbookPage() {
  const principles = [
    {
      number: "I",
      title: "ModernAPI Architecture Foundation",
      icon: <Layers className="w-6 h-6" />,
      description: "Our template implements Clean Architecture with 4 distinct layers: API, Application, Infrastructure, and Domain. Each layer has clear responsibilities and dependency rules.",
      implementation: [
        "ModernAPI.API: Controllers, Middleware, HTTP concerns only",
        "ModernAPI.Application: Services, DTOs, Use Cases orchestration",
        "ModernAPI.Infrastructure: EF Core, Repositories, External services",
        "ModernAPI.Domain: Entities, Value Objects, Business rules"
      ],
      example: "User entity extends IdentityUser<Guid> with rich domain methods like UpdateProfile() and ChangeEmail()"
    },
    {
      number: "II", 
      title: "JWT Authentication & ASP.NET Identity",
      icon: <Shield className="w-6 h-6" />,
      description: "We integrate ASP.NET Core Identity with JWT tokens for enterprise-grade security. HTTP-only cookies prevent XSS attacks while maintaining seamless user experience.",
      implementation: [
        "AuthController: Login, Register, Refresh token endpoints",
        "JwtTokenService: Access tokens (15min) + Refresh tokens (7 days)", 
        "RefreshToken entity: Stores refresh tokens with expiry tracking",
        "ExceptionMiddleware: Global error handling with RFC 7807 Problem Details"
      ],
      example: "User signs in → JWT stored in HTTP-only cookie → Dashboard fetches real user data from API"
    },
    {
      number: "III",
      title: "PostgreSQL with Entity Framework Core",
      icon: <Database className="w-6 h-6" />,
      description: "PostgreSQL provides robust data storage with EF Core handling migrations, configurations, and queries. All entities use Guid primary keys and snake_case naming.",
      implementation: [
        "ApplicationDbContext extends IdentityDbContext<User, Role, Guid>",
        "Configurations in ModernAPI.Infrastructure/Data/Configurations/",
        "Migrations: Code-first with proper Up/Down methods",
        "Repository pattern: Generic Repository<T, TId> with specific implementations"
      ],
      example: "UserRepository inherits Repository<User, Guid> and adds GetByEmailAsync() method"
    },
    {
      number: "IV",
      title: "Modern Frontend with TanStack Start",
      icon: <Zap className="w-6 h-6" />,
      description: "Our frontend uses TanStack Start with React 19, providing SSR, type safety, and blazing-fast Bun runtime. Server functions handle API communication with proper cookie management.",
      implementation: [
        "TanStack Router: File-based routing with type-safe navigation",
        "Server Functions: BFF layer proxying to .NET API with cookie handling",
        "React 19: Latest features with server components",
        "Shadcn/ui: Production-ready components with Tailwind CSS"
      ],
      example: "loginUser server function handles authentication, sets HTTP-only cookies, then redirects to dashboard"
    },
    {
      number: "V",
      title: "Testing Strategy & Implementation",
      icon: <TestTube className="w-6 h-6" />,
      description: "Comprehensive testing across all layers ensures reliability. Domain tests validate business rules, integration tests verify API contracts, and infrastructure tests confirm database operations.",
      implementation: [
        "ModernAPI.Domain.Tests: Entity behavior and business rule validation",
        "ModernAPI.API.Tests: Controller endpoints and middleware testing",
        "ModernAPI.Infrastructure.Tests: Repository and database integration tests",
        "ModernAPI.IntegrationTests: Full API workflow testing"
      ],
      example: "UserTests validates UpdateProfile() domain method, UserRepositoryTests confirms database operations"
    },
    {
      number: "VI",
      title: "Configuration & Environment Management",
      icon: <Cloud className="w-6 h-6" />,
      description: "Environment-specific configuration with secure secrets management. PostgreSQL connection strings, JWT settings, and API configurations are externalized and validated at startup.",
      implementation: [
        "appsettings.json hierarchy: Base → Environment → User secrets",
        "JwtSettings with validation: Secret, Issuer, Audience, Expiry times",
        "Environment variables: POSTGRES_CONNECTION_STRING, ASPNETCORE_ENVIRONMENT",
        "Frontend environment: VITE_API_URL, VITE_ENABLE_DOCS configuration"
      ],
      example: "JWT secret minimum 32 characters, validated at startup with clear error messages"
    },
    {
      number: "VII",
      title: "Backend-for-Frontend (BFF) Architecture",
      icon: <Code className="w-6 h-6" />,
      description: "Our frontend doesn't call the .NET API directly. Instead, TanStack Start server functions act as a BFF layer, handling authentication, cookie management, and API proxying with type safety.",
      implementation: [
        "TanStack Start Server Functions: Proxy API calls with authentication",
        "Cookie Management: Set/extract JWT tokens in HTTP-only cookies",
        "Type-Safe API Layer: TypeScript types shared between frontend and BFF",
        "Request/Response Transformation: Handle API contracts and error formatting"
      ],
      example: "loginUser server function: receives credentials → calls .NET API → sets secure cookies → returns user data"
    },
    {
      number: "VIII",
      title: "Domain-Driven Design Implementation",
      icon: <Layers className="w-6 h-6" />,
      description: "Rich domain entities with business logic, domain events for decoupling, and value objects for data integrity. The User entity demonstrates DDD principles with ASP.NET Identity integration.",
      implementation: [
        "User Entity: Extends IdentityUser<Guid> with domain methods (UpdateProfile, Deactivate)",
        "Domain Events: UserCreatedEvent, UserEmailChangedEvent using record types",
        "Business Rules: Validation in domain layer (email format, display name requirements)",
        "Repository Interfaces: Domain defines contracts, Infrastructure implements"
      ],
      example: "User.UpdateProfile() validates business rules, updates entity state, and raises UserProfileUpdatedEvent"
    },
    {
      number: "IX",
      title: "Containerization & Multi-Stage Builds",
      icon: <GitBranch className="w-6 h-6" />,
      description: "Docker multi-stage builds for optimized production images. Separate containers for API, PostgreSQL, and Redis with proper networking, health checks, and security configuration.",
      implementation: [
        "Multi-stage Dockerfile: Build stage (full SDK) → Runtime stage (minimal ASP.NET)",
        "Container Security: Non-root user, minimal attack surface, health checks",
        "Docker Compose: PostgreSQL 16, Redis 7, with persistent volumes and networking",
        "Production Optimized: Self-contained false, diagnostic disabled, proper logging"
      ],
      example: "Build: Tests run in container → Publish → Runtime image: 150MB vs 1GB+ with SDK"
    },
    {
      number: "X",
      title: "Kubernetes Deployment & Orchestration",
      icon: <Cloud className="w-6 h-6" />,
      description: "Production-ready Kubernetes manifests with ConfigMaps, Secrets, persistent storage, and monitoring. Automated deployment scripts handle rollouts, health checks, and rollbacks.",
      implementation: [
        "K8s Manifests: Namespace isolation, ConfigMaps for settings, Secrets for credentials",
        "Persistent Storage: PostgreSQL StatefulSet with persistent volumes",
        "Service Discovery: Internal DNS, load balancing, health check endpoints",
        "Deployment Automation: Bash scripts for validation, rollout, and rollback"
      ],
      example: "./scripts/deploy-k8s.sh validates cluster → applies manifests → monitors rollout → runs smoke tests"
    },
    {
      number: "XI",
      title: "Exception Handling & Observability",
      icon: <Monitor className="w-6 h-6" />,
      description: "Global exception middleware with RFC 7807 Problem Details standard, structured logging with Serilog, and comprehensive monitoring setup for production observability.",
      implementation: [
        "ExceptionMiddleware: Catches all exceptions → structured logging → RFC 7807 responses",
        "Serilog Configuration: Structured JSON logs with correlation IDs and context",
        "Health Checks: Database connectivity, external services, custom health endpoints",
        "Monitoring Stack: Prometheus metrics, Grafana dashboards, log aggregation"
      ],
      example: "Unhandled exception → logged with request ID → client gets consistent error format → monitoring alerts fired"
    },
    {
      number: "XII",
      title: "Development Workflow & CI/CD",
      icon: <GitBranch className="w-6 h-6" />,
      description: "Automated deployment pipeline with testing, containerization, and progressive rollouts. Development environment matches production using Docker Compose for consistency.",
      implementation: [
        "Local Development: Docker Compose with hot reload, database migrations, Redis caching",
        "CI Pipeline: Build → Test → Security Scan → Container Build → Push to Registry",
        "CD Pipeline: Deploy to staging → run integration tests → promote to production",
        "Infrastructure as Code: Kubernetes manifests, Terraform for cloud resources"
      ],
      example: "git push → GitHub Actions → tests pass → Docker build → K8s deploy → health check → rollout complete"
    }
  ]

  const techStack = [
    {
      category: "Backend Foundation",
      icon: <Code className="w-5 h-5" />,
      items: [
        { name: ".NET 9", purpose: "Latest LTS runtime with performance improvements" },
        { name: "ASP.NET Core", purpose: "High-performance web framework" },
        { name: "Entity Framework Core", purpose: "Modern ORM with LINQ support" },
        { name: "PostgreSQL", purpose: "Robust, standards-compliant database" }
      ]
    },
    {
      category: "Architecture Patterns",
      icon: <Layers className="w-5 h-5" />,
      items: [
        { name: "Clean Architecture", purpose: "Domain-centric design with clear boundaries" },
        { name: "Domain-Driven Design", purpose: "Rich domain models with business logic" },
        { name: "CQRS Inspiration", purpose: "Separate read and write concerns" },
        { name: "Repository Pattern", purpose: "Abstract data access behind interfaces" }
      ]
    },
    {
      category: "Security & Auth",
      icon: <Shield className="w-5 h-5" />,
      items: [
        { name: "JWT Tokens", purpose: "Stateless authentication with claims" },
        { name: "HTTP-only Cookies", purpose: "Secure refresh token storage" },
        { name: "ASP.NET Identity", purpose: "User management with extensible User entity" },
        { name: "Rate Limiting", purpose: "Prevent abuse and ensure fair usage" }
      ]
    },
    {
      category: "Testing Strategy",
      icon: <TestTube className="w-5 h-5" />,
      items: [
        { name: "Domain Tests", purpose: "Verify business logic and rules" },
        { name: "Integration Tests", purpose: "Test API endpoints with real database" },
        { name: "FluentAssertions", purpose: "Readable test assertions" },
        { name: "Test Data Builders", purpose: "Create realistic test scenarios" }
      ]
    },
    {
      category: "Developer Experience",
      icon: <Users className="w-5 h-5" />,
      items: [
        { name: "Scalar UI", purpose: "Modern OpenAPI documentation" },
        { name: "Serilog", purpose: "Structured logging with rich context" },
        { name: "AutoMapper", purpose: "Object mapping between layers" },
        { name: "FluentValidation", purpose: "Expressive input validation" }
      ]
    },
    {
      category: "Frontend Modern Stack",
      icon: <Zap className="w-5 h-5" />,
      items: [
        { name: "TanStack Start", purpose: "Full-stack React with SSR and Server Functions (BFF)" },
        { name: "React 19", purpose: "Latest React with Server Components" },
        { name: "Bun Runtime", purpose: "Fast JavaScript runtime and bundler" },
        { name: "Shadcn/ui", purpose: "Beautiful, accessible component library" }
      ]
    },
    {
      category: "Containerization & Deployment",
      icon: <Cloud className="w-5 h-5" />,
      items: [
        { name: "Docker Multi-stage", purpose: "Optimized production container builds" },
        { name: "PostgreSQL 16", purpose: "Robust database with persistent storage" },
        { name: "Redis 7", purpose: "Caching and session storage" },
        { name: "Kubernetes", purpose: "Container orchestration and scaling" }
      ]
    },
    {
      category: "Observability & Monitoring", 
      icon: <Monitor className="w-5 h-5" />,
      items: [
        { name: "Serilog", purpose: "Structured logging with rich context" },
        { name: "Health Checks", purpose: "Application and infrastructure monitoring" },
        { name: "RFC 7807", purpose: "Standardized API error responses" },
        { name: "Correlation IDs", purpose: "Request tracing across services" }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="px-8 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-3">
              <BookOpen className="w-3 h-3 mr-1" />
              The ModernAPI Handbook
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">
              ModernAPI Template
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {" "}Implementation Guide
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Deep dive into our production-ready template architecture. Learn how .NET 9, Clean Architecture, 
              JWT authentication, and React 19 work together in this enterprise-grade solution.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Introduction */}
      <section className="px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Template Architecture Overview</CardTitle>
              <CardDescription className="text-lg">
                This template implements enterprise-grade patterns with modern technologies, focusing on maintainability, security, and developer experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-base leading-relaxed">
                  <strong>ModernAPI</strong> is a production-ready full-stack template that combines .NET 9 backend 
                  with React 19 frontend. It demonstrates real-world implementation of Clean Architecture, JWT authentication, 
                  PostgreSQL integration, and modern frontend patterns with TanStack Start.
                </p>
                <p className="text-base leading-relaxed">
                  The template includes comprehensive testing, error handling, security measures, and deployment configurations. 
                  You can see it in action through the live demo - sign in and explore the dashboard that fetches real user 
                  data from the .NET API backend.
                </p>
                <p className="text-base leading-relaxed">
                  Below you'll find detailed explanations of each architectural component, implementation decisions, 
                  and how they work together to create a scalable, maintainable enterprise application.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* The Twelve Principles */}
      <section className="px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Implementation Details</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Core architectural components and how they're implemented in the ModernAPI template.
            </p>
          </div>

          <div className="space-y-6">
            {principles.map((principle, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        {principle.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {principle.number}
                        </Badge>
                        <CardTitle className="text-xl">{principle.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base leading-relaxed">
                        {principle.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <h4 className="font-medium mb-3 text-blue-700 dark:text-blue-300">
                        🔧 Implementation
                      </h4>
                      <ul className="space-y-2">
                        {principle.implementation.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-green-700 dark:text-green-300">
                        💡 Example
                      </h4>
                      <div className="p-3 bg-muted/30 rounded-lg text-sm">
                        {principle.example}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="px-8 py-10 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Technology Stack</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Carefully chosen technologies that embody our principles and enable rapid, reliable development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="text-primary">
                      {category.icon}
                    </div>
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.items.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {item.purpose}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Container Architecture & Deployment Flow */}
      <section className="px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Container Architecture & Deployment</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              How our containers interact and the automated deployment pipeline from development to production.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Container Interaction */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Container Interaction
                </CardTitle>
                <CardDescription>
                  How our multi-container architecture communicates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="font-medium text-sm mb-2">🚀 ModernAPI (.NET 9)</div>
                    <div className="text-xs text-muted-foreground">
                      • Port 8080 (internal), exposed via load balancer<br/>
                      • Connects to PostgreSQL on port 5432<br/>
                      • Uses Redis for caching on port 6379<br/>
                      • Health check: /health endpoint
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="font-medium text-sm mb-2">🗄️ PostgreSQL 16</div>
                    <div className="text-xs text-muted-foreground">
                      • Persistent volume for data storage<br/>
                      • StatefulSet for ordered deployment<br/>
                      • Automated backups and migrations<br/>
                      • Connection pooling and monitoring
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div className="font-medium text-sm mb-2">⚡ Redis 7</div>
                    <div className="text-xs text-muted-foreground">
                      • Session storage and API response caching<br/>
                      • LRU eviction policy, 256MB memory limit<br/>
                      • Persistent storage for session continuity<br/>
                      • Password authentication enabled
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deployment Pipeline */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Deployment Pipeline
                </CardTitle>
                <CardDescription>
                  Automated deployment from git push to production
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">1</div>
                    <div>
                      <div className="font-medium text-sm">Code Push & CI</div>
                      <div className="text-xs text-muted-foreground">git push → GitHub Actions → run tests</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">2</div>
                    <div>
                      <div className="font-medium text-sm">Container Build</div>
                      <div className="text-xs text-muted-foreground">Multi-stage Docker build → push to registry</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">3</div>
                    <div>
                      <div className="font-medium text-sm">K8s Deployment</div>
                      <div className="text-xs text-muted-foreground">deploy-k8s.sh → rolling update → health checks</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">4</div>
                    <div>
                      <div className="font-medium text-sm">Validation</div>
                      <div className="text-xs text-muted-foreground">Smoke tests → monitoring → auto-rollback if needed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BFF Architecture Diagram */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Backend-for-Frontend (BFF) Data Flow
              </CardTitle>
              <CardDescription>
                How TanStack Start Server Functions bridge the frontend and .NET API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4 items-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center mb-2">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium">React 19 UI</div>
                  <div className="text-xs text-muted-foreground">Dashboard, Forms</div>
                </div>
                
                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-lg bg-green-50 dark:bg-green-950/20 flex items-center justify-center mb-2">
                    <Code className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-sm font-medium">TanStack Start</div>
                  <div className="text-xs text-muted-foreground">Server Functions (BFF)</div>
                </div>
                
                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-lg bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center mb-2">
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-sm font-medium">.NET 9 API</div>
                  <div className="text-xs text-muted-foreground">Clean Architecture</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <div className="text-sm font-medium mb-2">Example: User Authentication Flow</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>1. React form calls loginUser() server function</div>
                  <div>2. Server function validates input, calls .NET /api/auth/login</div>
                  <div>3. .NET API validates credentials, returns JWT tokens</div>
                  <div>4. Server function sets HTTP-only cookies, returns user data</div>
                  <div>5. React redirects to dashboard, subsequent calls use cookies</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Implementation Guide */}
      <section className="px-8 py-10">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Putting Principles into Practice</CardTitle>
              <CardDescription>
                How to apply these principles in your daily development work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Start Here</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>Write domain tests to understand business requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>Model your domain entities with rich behavior</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>Create repository interfaces in the domain layer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>Implement infrastructure that adapts to domain needs</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">As You Scale</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>Add comprehensive logging and monitoring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>Implement proper caching and performance optimization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>Set up automated deployment pipelines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>Document architectural decisions with ADRs</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">
                  Remember: Principles Over Practices
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  These principles are more important than any specific technology or framework. 
                  They should guide your decisions whether you're building with .NET, Node.js, or any other platform. 
                  The ModernAPI template is one implementation—the principles are universal.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Conclusion */}
      <section className="px-8 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">The Journey Continues</h2>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            These twelve principles are not a destination—they're a compass for the journey of continuous improvement. 
            Every codebase, every team, and every project will find its own path guided by these fundamental truths.
          </p>
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8">
            <p className="text-base font-medium">
              "The best architectures, requirements, and designs emerge from self-organizing teams that 
              understand and apply sound principles."
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              — Adapted from the Agile Manifesto
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}