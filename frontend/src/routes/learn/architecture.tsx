import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { 
  ArrowDown, 
  Database, 
  Server, 
  Code, 
  Shield, 
  Layers3,
  GitBranch,
  Package,
  Settings,
  FileText,
  TestTube,
  ArrowRight
} from 'lucide-react'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/learn/architecture')({
  component: ArchitecturePage,
})

function ArchitecturePage() {
  const [selectedLayer, setSelectedLayer] = useState<string | null>('api')

  const layers = [
    {
      id: 'api',
      name: 'API Layer (ModernAPI.API)',
      description: 'HTTP concerns, Controllers, Middleware - The entry point of your application',
      color: 'bg-blue-500',
      position: { top: '10%' },
      technologies: ['ASP.NET Core 9', 'Controllers', 'Middleware', 'Scalar UI', 'CORS'],
      responsibilities: [
        'HTTP request/response handling with proper status codes',
        'Global exception handling with RFC 7807 Problem Details',
        'JWT authentication middleware and cookie extraction',
        'Request/response logging and monitoring',
        'API documentation with OpenAPI specification',
        'CORS configuration for frontend integration'
      ],
      files: [
        'Controllers/AuthController.cs - JWT authentication endpoints',
        'Controllers/UsersController.cs - User management CRUD operations',
        'Middleware/ExceptionMiddleware.cs - Global error handling',
        'Program.cs - Dependency injection and middleware configuration'
      ]
    },
    {
      id: 'application',
      name: 'Application Layer (ModernAPI.Application)',
      description: 'Business logic orchestration, Services, DTOs, Use Cases',
      color: 'bg-green-500',
      position: { top: '35%' },
      technologies: ['Application Services', 'DTOs', 'AutoMapper', 'FluentValidation', 'MediatR'],
      responsibilities: [
        'Coordinate business operations without containing business logic',
        'Transform data between layers using DTOs and AutoMapper',
        'Validate input using FluentValidation with detailed error messages',
        'Define service contracts and interfaces for dependency injection',
        'Handle cross-cutting concerns like logging and caching',
        'Orchestrate complex workflows involving multiple domain entities'
      ],
      files: [
        'Services/AuthService.cs - Authentication workflow orchestration',
        'Services/JwtTokenService.cs - JWT token generation and validation',
        'DTOs/AuthDtos.cs - Authentication request/response models',
        'Interfaces/IAuthService.cs - Service contracts and abstractions'
      ]
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure Layer (ModernAPI.Infrastructure)',
      description: 'Data access, External services, Technical implementations',
      color: 'bg-orange-500',
      position: { top: '60%' },
      technologies: ['Entity Framework Core', 'PostgreSQL', 'Repository Pattern', 'Unit of Work', 'Migrations'],
      responsibilities: [
        'Implement repository interfaces from Domain layer',
        'Configure Entity Framework with Fluent API and conventions',
        'Manage database migrations and schema evolution',
        'Handle external service integrations (email, file storage)',
        'Implement caching strategies and performance optimizations',
        'Provide infrastructure services like password hashing'
      ],
      files: [
        'Data/ApplicationDbContext.cs - EF Core context with Identity integration',
        'Repositories/UserRepository.cs - User data access implementation',
        'Repositories/UnitOfWork.cs - Transaction coordination across repositories',
        'Data/Configurations/ - Entity type configurations with snake_case naming'
      ]
    },
    {
      id: 'domain',
      name: 'Domain Layer (ModernAPI.Domain)',
      description: 'Pure business logic, Entities, Value Objects, Domain Events',
      color: 'bg-purple-500',
      position: { top: '85%' },
      technologies: ['Rich Domain Entities', 'Value Objects', 'Domain Events', 'Business Invariants'],
      responsibilities: [
        'Define business entities with encapsulated behavior and validation',
        'Implement business rules and invariants within entity methods',
        'Raise domain events when important business events occur',
        'Define repository contracts without implementation details',
        'Create value objects for type safety and validation',
        'Contain zero dependencies on external frameworks or libraries'
      ],
      files: [
        'Entities/User.cs - Rich user entity extending IdentityUser',
        'Events/UserCreatedEvent.cs - Domain events for business workflows',
        'Interfaces/IUserRepository.cs - Repository contracts',
        'Exceptions/DomainException.cs - Business rule violation exceptions'
      ]
    }
  ]

  const designPatterns = [
    {
      name: 'Repository Pattern',
      description: 'Abstraction layer for data access operations',
      benefits: ['Testability', 'Maintainability', 'Separation of Concerns']
    },
    {
      name: 'Unit of Work',
      description: 'Maintains list of objects and coordinates writing changes',
      benefits: ['Transaction Management', 'Change Tracking', 'Performance']
    },
    {
      name: 'Dependency Injection',
      description: 'Inversion of control for loose coupling',
      benefits: ['Testability', 'Flexibility', 'SOLID Principles']
    },
    {
      name: 'Domain Events',
      description: 'Decouples domain logic from side effects',
      benefits: ['Loose Coupling', 'Event-Driven Architecture', 'Scalability']
    }
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Layers3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">ModernAPI Clean Architecture</h1>
            <p className="text-muted-foreground">
              Explore the four-layer Clean Architecture implementation powering this .NET 9 template
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <Badge variant="secondary">
            <Settings className="w-3 h-3 mr-1" />
            Clean Architecture
          </Badge>
          <Badge variant="secondary">
            <GitBranch className="w-3 h-3 mr-1" />
            Domain-Driven Design
          </Badge>
          <Badge variant="secondary">
            <Shield className="w-3 h-3 mr-1" />
            SOLID Principles
          </Badge>
          <Badge variant="outline">
            <Database className="w-3 h-3 mr-1" />
            EF Core + PostgreSQL
          </Badge>
          <Badge variant="outline">
            <Code className="w-3 h-3 mr-1" />
            .NET 9 + ASP.NET Core
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Architecture Overview</TabsTrigger>
          <TabsTrigger value="layers">Layer Deep Dive</TabsTrigger>
          <TabsTrigger value="patterns">Design Patterns</TabsTrigger>
          <TabsTrigger value="flow">Data Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Interactive Architecture Diagram */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers3 className="w-5 h-5" />
                ModernAPI Clean Architecture Layers
              </CardTitle>
              <CardDescription>
                Click each layer to explore the specific .NET 9 implementation, files, and responsibilities in the ModernAPI template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-muted/20 rounded-lg overflow-hidden">
                {/* Architecture Visualization */}
                {layers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className={cn(
                      'absolute left-8 right-8 h-16 rounded-lg border-2 cursor-pointer transition-all duration-300 flex items-center justify-between px-6',
                      selectedLayer === layer.id
                        ? `${layer.color} border-white shadow-lg scale-105`
                        : 'bg-card border-border hover:border-primary/50 hover:shadow-md',
                      selectedLayer && selectedLayer !== layer.id && 'opacity-60'
                    )}
                    style={layer.position}
                    onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
                  >
                    <div>
                      <h3 className={cn(
                        'font-semibold',
                        selectedLayer === layer.id ? 'text-white' : 'text-foreground'
                      )}>
                        {layer.name}
                      </h3>
                      <p className={cn(
                        'text-sm',
                        selectedLayer === layer.id ? 'text-white/80' : 'text-muted-foreground'
                      )}>
                        {layer.description}
                      </p>
                    </div>
                    <div className={cn(
                      'flex flex-col items-center gap-1',
                      selectedLayer === layer.id ? 'text-white' : 'text-muted-foreground'
                    )}>
                      <Badge variant={selectedLayer === layer.id ? "secondary" : "outline"}>
                        {layer.files.length} files
                      </Badge>
                    </div>
                  </div>
                ))}

                {/* Arrows showing dependencies */}
                {layers.slice(0, -1).map((_, index) => (
                  <div
                    key={`arrow-${index}`}
                    className="absolute left-1/2 transform -translate-x-1/2 text-muted-foreground"
                    style={{ top: `${25 + index * 25}%` }}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </div>
                ))}
              </div>

              {/* Layer Details */}
              {selectedLayer && (
                <div className="mt-6">
                  <Separator className="mb-4" />
                  {layers
                    .filter(layer => layer.id === selectedLayer)
                    .map(layer => (
                      <div key={layer.id} className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-semibold flex items-center gap-2">
                              <div className={cn('w-3 h-3 rounded-full', layer.color)} />
                              {layer.name} Details
                            </h4>
                            <p className="text-muted-foreground mt-1">{layer.description}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedLayer(null)}
                          >
                            Close
                          </Button>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-6">
                          <div>
                            <h5 className="font-medium mb-2 flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Technologies
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {layer.technologies.map(tech => (
                                <Badge key={tech} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium mb-2 flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              Responsibilities
                            </h5>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {layer.responsibilities.slice(0, 3).map((resp, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                                  {resp}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 className="font-medium mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Key Files
                            </h5>
                            <ul className="space-y-1 text-sm text-muted-foreground font-mono">
                              {layer.files.map(file => (
                                <li key={file} className="flex items-center gap-2">
                                  <Code className="w-3 h-3 flex-shrink-0" />
                                  {file}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Implementation Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Server className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">API Endpoints</p>
                    <p className="text-2xl font-bold">12+</p>
                    <p className="text-xs text-muted-foreground">Auth + Users + Health</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Code className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Application Services</p>
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-xs text-muted-foreground">Auth, JWT, User, Password</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Database className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Repositories</p>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-xs text-muted-foreground">User, RefreshToken, UoW</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <TestTube className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Domain Entities</p>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-xs text-muted-foreground">User, RefreshToken</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Why Clean Architecture in ModernAPI?
              </CardTitle>
              <CardDescription>
                The benefits you get from this architectural approach in real-world development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <TestTube className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Complete Test Coverage</h4>
                      <p className="text-sm text-muted-foreground">Business logic completely isolated and testable. Domain tests run without databases or external dependencies.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Database Flexibility</h4>
                      <p className="text-sm text-muted-foreground">Switch from PostgreSQL to SQL Server or SQLite by changing one line in configuration.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Framework Independence</h4>
                      <p className="text-sm text-muted-foreground">Business rules don't depend on ASP.NET Core, Entity Framework, or any external library.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Clear Dependencies</h4>
                      <p className="text-sm text-muted-foreground">Dependencies point inward. Infrastructure depends on Domain, never the reverse.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layers" className="space-y-4">
          <div className="grid gap-4">
            {layers.map((layer) => (
              <Card key={layer.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={cn('w-4 h-4 rounded-full', layer.color)} />
                    {layer.name}
                  </CardTitle>
                  <CardDescription>{layer.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Core Responsibilities</h4>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {layer.responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    {layer.technologies.map(tech => (
                      <Badge key={tech} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {designPatterns.map((pattern) => (
              <Card key={pattern.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{pattern.name}</CardTitle>
                  <CardDescription>{pattern.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium mb-2">Benefits</h4>
                  <ul className="space-y-1">
                    {pattern.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Flow Through Layers</CardTitle>
              <CardDescription>
                Understanding how a typical API request flows through the Clean Architecture layers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center text-muted-foreground text-sm mb-4">
                  HTTP Request → Authentication → Business Logic → Data Access → Response
                </div>
                
                {/* Flow visualization would go here */}
                <div className="bg-muted/20 rounded-lg p-6 text-center text-muted-foreground">
                  <p>Interactive flow diagram will be implemented here</p>
                  <p className="text-xs mt-2">Showing request/response flow with code examples</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      </div>
  )
}