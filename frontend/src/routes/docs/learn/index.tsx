import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { 
  BookOpen, 
  Clock, 
 
  Users, 
  Target, 
  ArrowRight,
  Trophy,
  Star,
  Lightbulb,
  Zap,
  Shield,
  Code
} from 'lucide-react'
import { getNavigationItemsByCategory } from '~/data/platform'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/docs/learn/')({
  component: LearnPage,
})

function LearnPage() {
  const learningModules = getNavigationItemsByCategory('learn')

  const learningPaths = [
    {
      title: 'Backend Mastery',
      description: 'Master Clean Architecture, domain modeling, and enterprise patterns',
      modules: ['architecture', 'database', 'testing'],
      icon: <Code className="w-6 h-6" />,
      color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
    },
    {
      title: 'Security & Authentication',
      description: 'Learn JWT, OAuth, and enterprise security patterns',
      modules: ['authentication'],
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-green-500/10 text-green-700 dark:text-green-300'
    },
    {
      title: 'Frontend Excellence',
      description: 'Modern React with TanStack Start and performance optimization',
      modules: ['frontend'],
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300'
    }
  ]

  const learningFeatures = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Hands-On Learning',
      description: 'Interactive modules with real code examples and live demos'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Production Ready',
      description: 'Learn patterns used in real enterprise applications and production systems'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Expert-Designed',
      description: 'Created by enterprise architects with decades of experience'
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: 'Best Practices',
      description: 'Learn industry-standard patterns and avoid common pitfalls'
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
                  Interactive Learning Platform
                </Badge>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Master Modern Development
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Learn Clean Architecture, domain-driven design, and modern full-stack patterns 
                through hands-on modules designed for real-world application development.
              </p>
            </div>


            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={learningModules[0]?.path}>
                <Button size="lg" className="px-8 py-6 text-lg">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Start with Clean Architecture
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Features */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why This Learning Path Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed by enterprise architects, tested by thousands of developers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningFeatures.map((feature, index) => (
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

      {/* Learning Paths */}
      <section className="px-8 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Structured Learning Paths</h2>
            <p className="text-lg text-muted-foreground">
              Follow curated paths or explore modules in your preferred order
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {learningPaths.map((path, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center mb-4', path.color)}>
                    {path.icon}
                  </div>
                  <CardTitle>{path.title}</CardTitle>
                  <CardDescription>{path.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {path.modules.map(moduleId => {
                      const module = learningModules.find(m => m.id === moduleId)
                      if (!module) return null
                      
                      return (
                        <Link key={moduleId} to={module.path}>
                          <div className="flex items-center gap-2 text-sm hover:bg-accent/50 rounded-lg p-2 -m-2 transition-colors">
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                            <span className="text-foreground hover:text-primary transition-colors">
                              {module.title}
                            </span>
                            <Badge variant="outline" className="text-xs ml-auto">
                              {module.estimatedTime}
                            </Badge>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Modules */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Complete Learning Modules</h2>
            <p className="text-lg text-muted-foreground">
              Master every aspect of modern full-stack development
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningModules.map((module, index) => (
              <Link key={module.id} to={module.path}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{module.icon}</div>
                      <Badge variant={
                        module.difficulty === 'beginner' ? 'default' :
                        module.difficulty === 'intermediate' ? 'secondary' :
                        'outline'
                      } className="text-xs">
                        {module.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {module.estimatedTime}
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    {/* Prerequisites */}
                    {module.prerequisites && module.prerequisites.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Prerequisites:</p>
                        <div className="flex flex-wrap gap-1">
                          {module.prerequisites.map(prereqId => {
                            const prereq = learningModules.find(m => m.id === prereqId)
                            if (!prereq) return null
                            
                            return (
                              <Badge 
                                key={prereqId} 
                                variant="outline"
                                className="text-xs"
                              >
                                {prereq.title}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-8 py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              Ready to Become a Full-Stack Expert?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of developers mastering modern application development
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={learningModules[0]?.path}>
              <Button size="lg" className="px-8 py-6 text-lg">
                <Star className="w-5 h-5 mr-2" />
                Begin Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}