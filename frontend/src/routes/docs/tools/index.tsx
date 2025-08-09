import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { 
  Wrench, 
  Database, 
  Activity, 
  Code, 
  ArrowRight,
  Clock
} from 'lucide-react'

export const Route = createFileRoute('/docs/tools/')({
  component: ToolsPage,
})

function ToolsPage() {
  const tools = [
    {
      id: 'api-playground',
      title: 'API Playground',
      description: 'Interactive API testing with real backend integration and code generation',
      path: '/tools/api-playground',
      icon: <Code className="w-6 h-6" />,
      estimatedTime: '10 min',
      features: ['Live API testing', 'Multi-language code generation', 'Authentication flow']
    },
    {
      id: 'scaffolding',
      title: 'Entity Scaffolding',
      description: 'Generate Clean Architecture boilerplate for new entities with full CRUD operations',
      path: '/tools/scaffolding',
      icon: <Wrench className="w-6 h-6" />,
      estimatedTime: '5 min',
      features: ['Entity generation', 'Repository pattern', 'Service layer', 'API controllers']
    },
    {
      id: 'monitoring',
      title: 'Monitoring Dashboard',
      description: 'Real-time application metrics, health checks, and performance monitoring',
      path: '/tools/monitoring',
      icon: <Activity className="w-6 h-6" />,
      estimatedTime: '15 min',
      features: ['Live metrics', 'Health checks', 'Performance graphs', 'Error tracking']
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative px-8 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                  <Wrench className="w-4 h-4 mr-2" />
                  Development Tools
                </Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                Developer Tools & Utilities
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Interactive tools for API testing, code generation, and system monitoring to accelerate your development workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link key={tool.id} to={tool.path}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {tool.icon}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {tool.estimatedTime}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {tool.features.map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}