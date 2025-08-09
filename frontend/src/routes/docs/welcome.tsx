import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { 
  BookOpen, 
  ArrowRight,
  Clock,
  Trophy,
  Target,
  Users,
  Zap,
  Shield,
  Code,
  Star
} from 'lucide-react'
import { AuthGuard } from '~/components/auth/AuthGuard'
import { ModuleNavigation, useModuleCompletion } from '~/components/learning/ModuleNavigation'
import { useLearningStore } from '~/stores/learning'
import { getNavigationItemsByCategory } from '~/data/platform'

export const Route = createFileRoute('/docs/welcome')({
  component: () => (
    <AuthGuard>
      <WelcomePage />
    </AuthGuard>
  ),
})

function WelcomePage() {
  // Handle module completion and progression
  useModuleCompletion('welcome')
  
  const learningModules = getNavigationItemsByCategory('learn')
  const nextModule = learningModules[0] // Just get the first module (architecture)

  const templateHighlights = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Enterprise Security',
      description: 'JWT authentication, secure cookies, CSRF protection, and comprehensive security middleware',
      features: ['JWT Tokens', 'HTTP-only Cookies', 'CSRF Protection', 'Rate Limiting']
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Clean Architecture',
      description: 'Domain-driven design with clear separation of concerns and dependency inversion',
      features: ['Domain Layer', 'Application Services', 'Repository Pattern', 'Unit of Work']
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Modern Stack',
      description: 'Latest .NET 9, React 19, TanStack Start, and Bun runtime for maximum performance',
      features: ['.NET 9', 'React 19', 'TanStack Start', 'Bun Runtime']
    }
  ]

  const learningOutcomes = [
    'Understand the template\'s purpose and enterprise-grade features',
    'Navigate the learning platform and track your progress effectively',
    'Recognize the benefits of Clean Architecture and modern tooling',
    'Prepare for the comprehensive learning journey ahead'
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative px-8 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <Star className="w-4 h-4 mr-2" />
                Module 1: Welcome
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                Welcome to ModernAPI
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Your gateway to mastering enterprise-grade full-stack development. 
                This comprehensive template and learning platform will transform how you build modern applications.
              </p>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/handbook">
                <Button size="lg" className="px-8 py-6 text-lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Read Handbook
                </Button>
              </Link>
              <Link to="/learn/architecture">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Explore Architecture
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                5 min read
              </div>
              <Badge variant="default">Beginner</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Outcomes */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                What You'll Learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {learningOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-sm">{outcome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Template Overview */}
      <section className="px-8 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Makes ModernAPI Special?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A carefully crafted template that combines proven architectural patterns 
              with cutting-edge technologies for production-ready applications.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {templateHighlights.map((highlight, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-primary">
                      {highlight.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{highlight.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {highlight.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {highlight.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Journey Preview */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your Learning Journey</h2>
            <p className="text-lg text-muted-foreground">
              Structured modules that build upon each other to create comprehensive understanding
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningModules.slice(1, 7).map((module, index) => {
              return (
                <Card key={module.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{module.icon}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          module.difficulty === 'beginner' ? 'default' :
                          module.difficulty === 'intermediate' ? 'secondary' :
                          'outline'
                        } className="text-xs">
                          {module.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg">
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
                      <Link to={module.path}>
                        <Button size="sm" variant="outline">
                          Learn
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              {learningModules.length - 7} more modules available in the complete learning path
            </p>
            <Link to="/learn">
              <Button variant="outline">
                View All Learning Modules
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="px-8 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Interactive Learning Experience</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold">Hands-On Learning</h3>
              <p className="text-sm text-muted-foreground">
                Interactive modules with real code examples, live demos, and practical exercises
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Track your learning journey, unlock new modules, and celebrate achievements
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold">Expert Guidance</h3>
              <p className="text-sm text-muted-foreground">
                Learn from enterprise architects with decades of real-world experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Ready to Begin?</h2>
            <p className="text-lg text-muted-foreground">
              You're about to embark on a comprehensive journey that will elevate your development skills
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {nextModule ? (
              <Link to={nextModule.path}>
                <Button size="lg" className="px-8 py-6 text-lg">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Continue to {nextModule.title}
                </Button>
              </Link>
            ) : (
              <Link to="/learn">
                <Button size="lg" className="px-8 py-6 text-lg">
                  <Trophy className="w-5 h-5 mr-2" />
                  Explore All Modules
                </Button>
              </Link>
            )}
            <Link to="/learn">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                <BookOpen className="w-5 h-5 mr-2" />
                View Learning Path
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Module Navigation */}
      <div className="px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <ModuleNavigation moduleId="welcome" />
        </div>
      </div>
    </div>
  )
}