import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { 
  BookOpen, 
  ArrowRight,
  Clock,
  Wrench,
  FileText,
  HelpCircle
} from 'lucide-react'
import { platformSections } from '~/data/platform'

export const Route = createFileRoute('/docs/')({
  component: DocsHomePage,
})

function DocsHomePage() {
  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'learn':
        return <BookOpen className="w-6 h-6" />
      case 'tools':
        return <Wrench className="w-6 h-6" />
      case 'guides':
        return <HelpCircle className="w-6 h-6" />
      case 'reference':
        return <FileText className="w-6 h-6" />
      default:
        return <BookOpen className="w-6 h-6" />
    }
  }

  const getSectionColor = (sectionId: string) => {
    switch (sectionId) {
      case 'learn':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:hover:bg-blue-900'
      case 'tools':
        return 'border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-800 dark:bg-green-950 dark:hover:bg-green-900'
      case 'guides':
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950 dark:hover:bg-purple-900'
      case 'reference':
        return 'border-orange-200 bg-orange-50 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:hover:bg-orange-900'
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">ModernAPI Documentation</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Complete guide to building production-ready APIs with Clean Architecture, .NET 9, and React 19.
        </p>
      </div>

      {/* Documentation Sections */}
      <div className="grid gap-6">
        {platformSections
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <Card key={section.id} className={`transition-colors ${getSectionColor(section.id)}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-background/50">
                      {getSectionIcon(section.id)}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{section.title}</CardTitle>
                      <CardDescription className="text-base mt-2">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {section.items.length} {section.items.length === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {section.items.map((item) => (
                    <Link key={item.id} to={item.path}>
                      <div className="group flex items-center justify-between p-4 rounded-lg border bg-background/50 hover:bg-background hover:shadow-sm transition-all">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{item.icon}</span>
                            <h3 className="font-medium group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            {item.estimatedTime && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {item.estimatedTime}
                              </div>
                            )}
                            {item.difficulty && (
                              <Badge 
                                variant={
                                  item.difficulty === 'beginner' ? 'default' :
                                  item.difficulty === 'intermediate' ? 'secondary' : 
                                  'outline'
                                }
                                className="text-xs"
                              >
                                {item.difficulty}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Quick Start */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Quick Start
          </CardTitle>
          <CardDescription>
            New to ModernAPI? Start with our foundational concepts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/docs/learn/architecture">
              <Button className="w-full sm:w-auto">
                Start with Clean Architecture
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/docs/handbook">
              <Button variant="outline" className="w-full sm:w-auto">
                Read the Handbook
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}