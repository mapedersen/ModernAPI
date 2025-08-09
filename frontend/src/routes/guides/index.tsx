import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { 
  BookOpen, 
  Rocket, 
  GitBranch, 
  Plus,
  ArrowRight,
  Clock,
  Users,
  Bug,
  TestTube
} from 'lucide-react'

export const Route = createFileRoute('/guides/')({
  component: GuidesPage,
})

function GuidesPage() {
  const guides = [
    {
      id: 'add-entity',
      title: 'Adding New Entities',
      description: 'Step-by-step guide to add new domain entities with Clean Architecture patterns',
      path: '/guides/add-entity',
      icon: <Plus className="w-6 h-6" />,
      estimatedTime: '20 min',
      difficulty: 'intermediate',
      topics: ['Domain modeling', 'Repository pattern', 'API endpoints', 'Database migrations']
    },
    {
      id: 'deployment',
      title: 'Production Deployment',
      description: 'Deploy your ModernAPI application to production with Docker, Kubernetes, and CI/CD',
      path: '/guides/deployment',
      icon: <Rocket className="w-6 h-6" />,
      estimatedTime: '45 min',
      difficulty: 'advanced',
      topics: ['Docker containers', 'Kubernetes', 'CI/CD pipelines', 'Environment configuration']
    },
    {
      id: 'git-workflow',
      title: 'Git Workflow & Collaboration',
      description: 'Best practices for team collaboration, branching strategies, and code review',
      path: '/guides/git-workflow',
      icon: <GitBranch className="w-6 h-6" />,
      estimatedTime: '15 min',
      difficulty: 'beginner',
      topics: ['Branching strategy', 'Pull requests', 'Code review', 'Release management']
    },
    {
      id: 'testing',
      title: 'Comprehensive Testing Guide',
      description: 'Master TDD + DDD approach with complete testing strategies and best practices',
      path: '/guides/testing',
      icon: <TestTube className="w-6 h-6" />,
      estimatedTime: '35 min',
      difficulty: 'intermediate',
      topics: ['TDD workflow', 'Domain tests', 'Application tests', 'Test automation', 'Coverage analysis']
    },
    {
      id: 'troubleshooting',
      title: 'Developer Troubleshooting Guide',
      description: 'Comprehensive debugging workflows, error analysis, and problem-solving techniques',
      path: '/guides/troubleshooting',
      icon: <Bug className="w-6 h-6" />,
      estimatedTime: '25 min',
      difficulty: 'intermediate',
      topics: ['Error debugging', 'Log analysis', 'Root cause investigation', 'Production debugging']
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

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
                  <BookOpen className="w-4 h-4 mr-2" />
                  Step-by-Step Guides
                </Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                Development Guides
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Comprehensive guides for common development tasks, deployment strategies, and team collaboration workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Link key={guide.id} to={guide.path}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {guide.icon}
                      </div>
                      <Badge className={getDifficultyColor(guide.difficulty)}>
                        {guide.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {guide.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {guide.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {guide.estimatedTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          All levels
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Topics covered:</h4>
                        <div className="flex flex-wrap gap-1">
                          {guide.topics.map((topic) => (
                            <Badge key={topic} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end pt-2">
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