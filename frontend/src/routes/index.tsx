import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { 
  Code, 
  Shield, 
  Database, 
  Zap,
  ArrowRight,
  BookOpen,
  PlayCircle,
  Github,
  ExternalLink,
  Server
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Enterprise Security',
      description: 'JWT authentication, refresh tokens, and comprehensive security middleware built-in',
      color: 'text-green-600'
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Clean Architecture',
      description: 'Domain-driven design with clear separation of concerns and SOLID principles',
      color: 'text-blue-600'
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Modern Data Layer',
      description: 'Entity Framework Core with PostgreSQL, migrations, and rich domain entities',
      color: 'text-purple-600'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Fast Frontend',
      description: 'TanStack Start with React 19, SSR, and blazing-fast Bun runtime',
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge variant="secondary" className="text-sm">
                🚀 Production Ready
              </Badge>
              <Badge variant="outline" className="text-sm">
                .NET 9 + React 19
              </Badge>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              ModernAPI
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {" "}Template
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4">
              Enterprise-grade full-stack template with Clean Architecture, modern security, 
              and developer-first tooling. Start building production-ready APIs in minutes.
            </p>
            <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-8">
              🚀 <strong>Live Demo:</strong> Sign in and explore the dashboard with real user data from the .NET API
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/auth/login">
                <Button size="lg" className="px-8 py-6 text-lg">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Try Live Demo
                </Button>
              </Link>
              <Link to="/docs/handbook">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  View Documentation
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Github className="w-4 h-4" />
                <span>Open Source</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span>Zero Configuration</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Enterprise Security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with modern best practices and enterprise-grade patterns
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-4 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-8 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Modern Tech Stack</h2>
            <p className="text-lg text-muted-foreground">
              Carefully chosen technologies for maximum productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Backend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">.NET 9</span>
                    <Badge variant="secondary">Latest LTS</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">ASP.NET Core</span>
                    <Badge variant="secondary">Web API</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Entity Framework Core</span>
                    <Badge variant="secondary">ORM</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">PostgreSQL</span>
                    <Badge variant="secondary">Database</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">JWT + Identity</span>
                    <Badge variant="secondary">Auth</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Frontend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">React 19</span>
                    <Badge variant="secondary">Latest</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">TanStack Start</span>
                    <Badge variant="secondary">Full-Stack</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Bun Runtime</span>
                    <Badge variant="secondary">Fast</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">TypeScript</span>
                    <Badge variant="secondary">Type Safe</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Shadcn/ui</span>
                    <Badge variant="secondary">Components</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Start</h2>
            <p className="text-lg text-muted-foreground">
              Get up and running in under 5 minutes
            </p>
          </div>

          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-primary font-bold">
                      1
                    </div>
                    <h3 className="font-medium">Clone & Setup</h3>
                    <p className="text-sm text-muted-foreground">Clone the template and install dependencies</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-primary font-bold">
                      2
                    </div>
                    <h3 className="font-medium">Configure</h3>
                    <p className="text-sm text-muted-foreground">Set up your database and environment</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-primary font-bold">
                      3
                    </div>
                    <h3 className="font-medium">Build</h3>
                    <p className="text-sm text-muted-foreground">Start coding your business logic</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Link to="/auth/login">
                    <Button className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Try Demo
                    </Button>
                  </Link>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View on GitHub
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}