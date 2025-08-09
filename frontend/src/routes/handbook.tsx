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
  Target
} from 'lucide-react'

export const Route = createFileRoute('/handbook')({
  component: HandbookPage,
})

function HandbookPage() {
  const principles = [
    {
      number: "I",
      title: "Domain-Driven Architecture",
      icon: <Layers className="w-6 h-6" />,
      description: "The heart of every great system lies in its domain model. Business logic should live in rich domain entities, not scattered across services or controllers.",
      details: [
        "Entities encapsulate business rules and invariants",
        "Domain events communicate state changes",
        "Repositories abstract data access at the domain boundary",
        "Services orchestrate complex domain operations"
      ],
      antipattern: "Anemic domain models with all logic in service layers"
    },
    {
      number: "II", 
      title: "Clean Architecture Boundaries",
      icon: <Target className="w-6 h-6" />,
      description: "Dependencies point inward. The domain knows nothing of databases, web frameworks, or external services. Infrastructure adapts to domain needs, never the reverse.",
      details: [
        "Domain layer has no external dependencies",
        "Application layer orchestrates use cases",
        "Infrastructure implements domain interfaces",
        "API layer handles HTTP concerns only"
      ],
      antipattern: "Domain entities depending on Entity Framework or web frameworks"
    },
    {
      number: "III",
      title: "Test-Driven Development",
      icon: <TestTube className="w-6 h-6" />,
      description: "Tests are not afterthoughts—they are the design tool. Write tests first to drive clean, focused implementations that solve real problems.",
      details: [
        "Domain tests specify business behavior",
        "Integration tests verify system contracts", 
        "Unit tests document component responsibilities",
        "Test data builders create realistic scenarios"
      ],
      antipattern: "Testing implementation details instead of behavior"
    },
    {
      number: "IV",
      title: "Security by Design",
      icon: <Shield className="w-6 h-6" />,
      description: "Security isn't a feature to add later—it's woven into every architectural decision. Authentication, authorization, and data protection are first-class concerns.",
      details: [
        "JWT tokens with HTTP-only refresh cookies",
        "CSRF protection on all state-changing operations",
        "Rate limiting prevents abuse",
        "Input validation at API boundaries"
      ],
      antipattern: "Adding security as an afterthought"
    },
    {
      number: "V",
      title: "Database as Implementation Detail",
      icon: <Database className="w-6 h-6" />,
      description: "The database serves the domain, not the other way around. Schema follows domain design. Migrations preserve data integrity across deployments.",
      details: [
        "Domain entities define data structure",
        "EF Core configurations map domain to schema",
        "Migrations are versioned and reviewable",
        "Repository pattern abstracts data access"
      ],
      antipattern: "Designing domain around database constraints"
    },
    {
      number: "VI",
      title: "API Design Excellence",
      icon: <Code className="w-6 h-6" />,
      description: "APIs are user interfaces for developers. They should be intuitive, consistent, and follow REST principles. Every endpoint tells a story about your domain.",
      details: [
        "Resource-based URLs that express intent",
        "HTTP status codes that convey meaning",
        "Consistent error handling with RFC 7807",
        "OpenAPI documentation that stays current"
      ],
      antipattern: "RPC-style endpoints that break REST conventions"
    },
    {
      number: "VII",
      title: "Configuration and Environment Parity",
      icon: <Cloud className="w-6 h-6" />,
      description: "Configuration varies between deploys, code doesn't. Environment variables and secure configuration management ensure consistency across development, staging, and production.",
      details: [
        "Secrets never committed to version control",
        "Environment-specific appsettings files",
        "Configuration validation at startup",
        "12-factor methodology for configuration"
      ],
      antipattern: "Hardcoded configuration or environment-specific code"
    },
    {
      number: "VIII",
      title: "Observability and Monitoring",
      icon: <Monitor className="w-6 h-6" />,
      description: "You can't manage what you don't measure. Structured logging, metrics, and tracing provide insight into system behavior and performance.",
      details: [
        "Structured logging with correlation IDs",
        "Application metrics and health checks",
        "Request/response logging for debugging",
        "Error tracking and alerting"
      ],
      antipattern: "Logging strings without structure or context"
    },
    {
      number: "IX",
      title: "DevOps and Deployment Excellence",
      icon: <GitBranch className="w-6 h-6" />,
      description: "Deployment should be boring—automated, repeatable, and fast. Infrastructure as code ensures consistency. CI/CD pipelines catch issues early.",
      details: [
        "Containerized applications for consistency",
        "Infrastructure as Code with proper versioning",
        "Automated testing in CI/CD pipelines",
        "Blue-green or rolling deployments"
      ],
      antipattern: "Manual deployments and snowflake servers"
    },
    {
      number: "X",
      title: "Performance by Default",
      icon: <Zap className="w-6 h-6" />,
      description: "Fast is a feature. Design for performance from the start with proper caching, efficient queries, and scalable patterns. Measure everything.",
      details: [
        "HTTP caching headers for appropriate resources",
        "Database query optimization and indexing", 
        "Async/await for non-blocking operations",
        "Connection pooling and resource management"
      ],
      antipattern: "Optimizing for performance as an afterthought"
    },
    {
      number: "XI",
      title: "Developer Experience First",
      icon: <Users className="w-6 h-6" />,
      description: "Great software is built by happy developers. Invest in tooling, documentation, and patterns that make the next developer's job easier.",
      details: [
        "Clear README with setup instructions",
        "Code generation tools for repetitive tasks",
        "Consistent naming and organization",
        "Interactive API documentation"
      ],
      antipattern: "Prioritizing clever code over readable code"
    },
    {
      number: "XII",
      title: "Evolutionary Architecture",
      icon: <BookOpen className="w-6 h-6" />,
      description: "Architecture isn't set in stone—it evolves. Design for change with loose coupling, clear boundaries, and architectural decision records that capture the 'why' behind choices.",
      details: [
        "Architectural Decision Records (ADRs) document choices",
        "Loose coupling enables independent changes",
        "Feature flags allow gradual rollouts",
        "Refactoring is part of regular development"
      ],
      antipattern: "Over-engineering for imaginary future requirements"
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
        { name: "TanStack Start", purpose: "Full-stack React with SSR" },
        { name: "React 19", purpose: "Latest React with Server Components" },
        { name: "Bun Runtime", purpose: "Fast JavaScript runtime and bundler" },
        { name: "Shadcn/ui", purpose: "Beautiful, accessible component library" }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              <BookOpen className="w-3 h-3 mr-1" />
              The ModernAPI Handbook
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              Twelve Principles of
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {" "}Modern Development
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A philosophy for building enterprise software that stands the test of time. 
              Inspired by the 12 Factor Method, refined through years of production experience.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Introduction */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Our Development Philosophy</CardTitle>
              <CardDescription className="text-lg">
                Modern software development requires more than just writing code—it demands a philosophy that guides every architectural decision.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-base leading-relaxed">
                  The <strong>ModernAPI Handbook</strong> distills years of enterprise software development into twelve 
                  fundamental principles. These aren't just theoretical concepts—they're battle-tested practices that 
                  have proven their worth in production systems serving millions of users.
                </p>
                <p className="text-base leading-relaxed">
                  Each principle addresses a critical aspect of modern software development, from domain modeling 
                  to deployment strategies. Together, they form a cohesive philosophy that prioritizes maintainability, 
                  testability, and developer experience while never compromising on security or performance.
                </p>
                <p className="text-base leading-relaxed">
                  This handbook serves as both a reference and a guide. Whether you're starting a new project or 
                  refactoring an existing system, these principles provide a North Star for architectural decisions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* The Twelve Principles */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">The Twelve Principles</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each principle represents a fundamental truth about building maintainable, scalable software systems.
            </p>
          </div>

          <div className="space-y-8">
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
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 text-green-700 dark:text-green-300">
                        ✓ Key Practices
                      </h4>
                      <ul className="space-y-2">
                        {principle.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-red-700 dark:text-red-300">
                        ✗ Common Antipattern
                      </h4>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {principle.antipattern}
                        </p>
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
      <section className="px-8 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Technology Stack</h2>
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

      {/* Implementation Guide */}
      <section className="px-8 py-16">
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
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">The Journey Continues</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
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