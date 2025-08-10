import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { 
  BookOpen, 
  Target, 
  ArrowRight,
  FileText,
  Code,
  Settings,
  Layers,
  Database,
  Lock,
  Search,
  Clock,
  Users
} from 'lucide-react'
import { getNavigationItemsByCategory } from '~/data/platform'

export const Route = createFileRoute('/docs/reference/')({
  component: ReferencePage,
})

function ReferencePage() {
  const referenceItems = getNavigationItemsByCategory('reference')

  const referenceCategories = [
    {
      title: 'Architecture Decisions',
      description: 'Understand the why behind every design choice',
      icon: <Target className="w-8 h-8" />,
      items: referenceItems.filter(item => item.tags?.includes('architecture') || item.tags?.includes('decision-making')),
      color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
    },
    {
      title: 'API Documentation',
      description: 'Complete endpoint reference and testing tools',
      icon: <Code className="w-8 h-8" />,
      items: referenceItems.filter(item => item.tags?.includes('api') || item.tags?.includes('endpoints')),
      color: 'bg-green-500/10 text-green-700 dark:text-green-300'
    },
    {
      title: 'Standards & Patterns',
      description: 'Coding conventions and design patterns',
      icon: <Layers className="w-8 h-8" />,
      items: referenceItems.filter(item => item.tags?.includes('standards') || item.tags?.includes('patterns')),
      color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300'
    },
    {
      title: 'Configuration',
      description: 'Environment setup and configuration options',
      icon: <Settings className="w-8 h-8" />,
      items: referenceItems.filter(item => item.tags?.includes('config') || item.tags?.includes('environment')),
      color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
    }
  ]

  const referenceFeatures = [
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Quick Reference',
      description: 'Find exactly what you need, when you need it, with powerful search and filtering'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Always Up-to-Date',
      description: 'Reference materials that evolve with the template and reflect current best practices'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Team-Friendly',
      description: 'Share knowledge across your team with consistent documentation and standards'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Decision Context',
      description: 'Understand not just what to do, but why decisions were made and their trade-offs'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative px-8 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="flex justify-center">
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Developer Reference Hub
                </Badge>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Reference & Documentation
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Your daily companion for development decisions. Access architecture decisions, 
                API documentation, coding standards, and configuration references all in one place.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/docs/reference/adr">
                <Button size="lg" className="px-8 py-6 text-lg">
                  <Target className="w-5 h-5 mr-2" />
                  Explore Architecture Decisions
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/docs/reference/api">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                  <Code className="w-5 h-5 mr-2" />
                  API Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reference Features */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Reference Documentation Matters</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Great documentation accelerates development and reduces decision paralysis
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {referenceFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reference Categories */}
      <section className="px-8 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Reference Categories</h2>
            <p className="text-lg text-muted-foreground">
              Organized documentation for every aspect of development
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {referenceCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${category.color}`}>
                    {category.icon}
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <CardDescription className="text-base">{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.items.map(item => (
                      <Link key={item.id} to={item.path} className="block">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors group">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{item.icon}</span>
                            <div>
                              <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.estimatedTime && (
                              <Badge variant="outline" className="text-xs">
                                {item.estimatedTime}
                              </Badge>
                            )}
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Reference Items */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Complete Reference Library</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for informed development decisions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {referenceItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        item.difficulty === 'beginner' ? 'default' :
                        item.difficulty === 'intermediate' ? 'secondary' :
                        'outline'
                      } className="text-xs">
                        {item.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    {item.estimatedTime && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {item.estimatedTime}
                      </div>
                    )}
                  </div>
                  
                  {item.tags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <Link to={item.path}>
                    <Button className="w-full">
                      Explore
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-8 py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              Make Better Development Decisions
            </h2>
            <p className="text-lg text-muted-foreground">
              Access the reasoning behind every architectural choice and implementation detail
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/docs/reference/adr">
              <Button size="lg" className="px-8 py-6 text-lg">
                <Target className="w-5 h-5 mr-2" />
                Start with Architecture Decisions
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/docs/reference/standards">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                <FileText className="w-5 h-5 mr-2" />
                View Code Standards
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}