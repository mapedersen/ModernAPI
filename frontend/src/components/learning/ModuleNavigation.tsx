import * as React from 'react'
import { useRouter } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock,
  Target
} from 'lucide-react'
import { useLearningStore, learningModules } from '~/stores/learning'
import { cn } from '~/lib/utils'

interface ModuleNavigationProps {
  moduleId: string
  className?: string
}

export function ModuleNavigation({ moduleId, className }: ModuleNavigationProps) {
  const router = useRouter()
  const { 
    getNextModule,
    getPreviousModule
  } = useLearningStore()

  const currentModuleData = learningModules.find(m => m.id === moduleId)
  const nextModule = getNextModule()
  const previousModule = getPreviousModule()

  const handleNext = React.useCallback(() => {
    if (nextModule) {
      router.navigate({ to: nextModule.path })
    }
  }, [nextModule, router])

  const handlePrevious = React.useCallback(() => {
    if (previousModule) {
      router.navigate({ to: previousModule.path })
    }
  }, [previousModule, router])

  if (!currentModuleData) return null

  return (
    <div className={cn("space-y-6", className)}>
      {/* Current Module Info */}
      <Card className="border-2 border-primary">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-primary/10">
              {currentModuleData.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{currentModuleData.title}</h3>
                <Badge variant="secondary">
                  {currentModuleData.difficulty}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {currentModuleData.description}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {currentModuleData.estimatedTime}
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {currentModuleData.difficulty}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Navigation Actions */}
      <div className="flex items-center justify-between gap-4">
        {/* Previous Button */}
        <div className="flex-1">
          {previousModule ? (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="w-full justify-start h-16"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <div className="text-left">
                <div className="text-sm font-medium">Previous</div>
                <div className="text-xs text-muted-foreground truncate">
                  {previousModule.title}
                </div>
              </div>
            </Button>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-3">
              First module
            </div>
          )}
        </div>

        {/* Next Button */}
        <div className="flex-1">
          {nextModule ? (
            <Button
              onClick={handleNext}
              className="w-full justify-end h-16"
              size="lg"
            >
              <div className="text-right mr-2">
                <div className="text-sm font-medium">Next</div>
                <div className="text-xs opacity-90 truncate">
                  {nextModule.title}
                </div>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-3">
              Last module
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Simple module tracking hook
export function useModuleCompletion(moduleId: string) {
  const { setCurrentModule } = useLearningStore()
  
  React.useEffect(() => {
    setCurrentModule(moduleId)
  }, [moduleId, setCurrentModule])
}