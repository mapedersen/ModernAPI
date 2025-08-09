import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Progress } from '~/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
import { Separator } from '~/components/ui/separator'
import { 
  Hammer, 
  Clock, 
  FileText, 
  Code, 
  Database, 
  Server, 
  Settings, 
  TestTube,
  Play,
  CheckCircle,
  Loader2,
  Copy,
  Terminal,
  Layers,
  Package,
  Zap,
  BookOpen,
  ArrowRight,
  Plus,
  Minus,
  AlertTriangle
} from 'lucide-react'
import { useLearningStore } from '~/stores/learning'
import { ModuleNavigation, useModuleCompletion } from '~/components/learning/ModuleNavigation'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/tools/scaffolding')({
  component: ScaffoldingPage,
})

interface EntityProperty {
  name: string
  type: string
  validations: string[]
  isRequired: boolean
}

interface GenerationStep {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'active' | 'complete'
  files: string[]
  duration: number
}

function ScaffoldingPage() {
  const [entityName, setEntityName] = React.useState('Product')
  const [properties, setProperties] = React.useState<EntityProperty[]>([
    { name: 'Name', type: 'string', validations: ['required'], isRequired: true },
    { name: 'Price', type: 'decimal', validations: ['required', 'range(0,*)'], isRequired: true },
    { name: 'Description', type: 'string', validations: [], isRequired: false },
    { name: 'CategoryId', type: 'Guid', validations: ['foreign(Category)'], isRequired: true }
  ])
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [generationProgress, setGenerationProgress] = React.useState(0)
  const [currentStep, setCurrentStep] = React.useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = React.useState<string[]>([])

  // Handle module completion and progression
  useModuleCompletion('scaffolding')

  const generationSteps: GenerationStep[] = [
    {
      id: 'domain-entity',
      name: 'Domain Entity',
      description: 'Rich domain entity with business logic and validation',
      icon: <Layers className="w-4 h-4" />,
      status: 'pending',
      files: [`Domain/Entities/${entityName}.cs`],
      duration: 800
    },
    {
      id: 'repository-interface',
      name: 'Repository Interface',
      description: 'Data access contract in Domain layer',
      icon: <Database className="w-4 h-4" />,
      status: 'pending',
      files: [`Domain/Interfaces/I${entityName}Repository.cs`],
      duration: 600
    },
    {
      id: 'repository-impl',
      name: 'Repository Implementation',
      description: 'EF Core repository with CRUD operations',
      icon: <Code className="w-4 h-4" />,
      status: 'pending',
      files: [`Infrastructure/Repositories/${entityName}Repository.cs`],
      duration: 900
    },
    {
      id: 'ef-configuration',
      name: 'EF Configuration',
      description: 'Entity Framework mapping and constraints',
      icon: <Settings className="w-4 h-4" />,
      status: 'pending',
      files: [`Infrastructure/Data/Configurations/${entityName}Configuration.cs`],
      duration: 700
    },
    {
      id: 'dtos',
      name: 'Data Transfer Objects',
      description: 'Request/Response DTOs and mappings',
      icon: <Package className="w-4 h-4" />,
      status: 'pending',
      files: [`Application/DTOs/${entityName}Dtos.cs`],
      duration: 800
    },
    {
      id: 'service-interface',
      name: 'Service Interface',
      description: 'Business logic service contract',
      icon: <FileText className="w-4 h-4" />,
      status: 'pending',
      files: [`Application/Interfaces/I${entityName}Service.cs`],
      duration: 500
    },
    {
      id: 'service-impl',
      name: 'Service Implementation',
      description: 'Business logic orchestration and validation',
      icon: <Server className="w-4 h-4" />,
      status: 'pending',
      files: [`Application/Services/${entityName}Service.cs`],
      duration: 1200
    },
    {
      id: 'validation',
      name: 'Validation Rules',
      description: 'FluentValidation rules for input validation',
      icon: <TestTube className="w-4 h-4" />,
      status: 'pending',
      files: [`Application/Validators/${entityName}Validators.cs`],
      duration: 600
    },
    {
      id: 'controller',
      name: 'API Controller',
      description: 'RESTful endpoints with full CRUD operations',
      icon: <Terminal className="w-4 h-4" />,
      status: 'pending',
      files: [`API/Controllers/${entityName}sController.cs`],
      duration: 1000
    }
  ]

  const addProperty = () => {
    setProperties([...properties, { name: '', type: 'string', validations: [], isRequired: false }])
  }

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index))
  }

  const updateProperty = (index: number, field: keyof EntityProperty, value: any) => {
    const updated = properties.map((prop, i) => 
      i === index ? { ...prop, [field]: value } : prop
    )
    setProperties(updated)
  }

  const generateEntity = async () => {
    if (isGenerating) return

    setIsGenerating(true)
    setGenerationProgress(0)
    setCompletedSteps([])

    for (let i = 0; i < generationSteps.length; i++) {
      const step = generationSteps[i]
      setCurrentStep(step.id)
      
      // Simulate generation time
      await new Promise(resolve => setTimeout(resolve, step.duration))
      
      setCompletedSteps(prev => [...prev, step.id])
      setGenerationProgress(((i + 1) / generationSteps.length) * 100)
      
      if (i < generationSteps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    setCurrentStep(null)
    setIsGenerating(false)
  }

  const getStepStatus = (stepId: string): 'pending' | 'active' | 'complete' => {
    if (completedSteps.includes(stepId)) return 'complete'
    if (currentStep === stepId) return 'active'
    return 'pending'
  }

  const generateCommand = () => {
    const propString = properties
      .map(p => {
        const validations = p.validations.join(',')
        return `${p.name}:${p.type}${validations ? `:${validations}` : ''}`
      })
      .join(',')
    
    return `modernapi scaffold entity ${entityName} --properties "${propString}"`
  }

  const timeSavings = {
    manual: 180, // 3 hours in minutes
    scaffolding: 5, // 5 minutes
    filesGenerated: 9,
    linesOfCode: 850
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Hammer className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Code Generation Workshop</h1>
            <p className="text-muted-foreground">
              Experience the power of automated Clean Architecture code generation
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            5 minutes vs 3 hours
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <FileText className="w-3 h-3" />
            9 files generated
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Code className="w-3 h-3" />
            850+ lines of code
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Side - Interactive Builder */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Entity Builder
              </CardTitle>
              <CardDescription>
                Design your entity and watch the scaffolding tool generate complete Clean Architecture code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Entity Name */}
              <div className="space-y-2">
                <Label htmlFor="entity-name">Entity Name</Label>
                <Input
                  id="entity-name"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="Product, Order, Customer..."
                  disabled={isGenerating}
                />
              </div>

              {/* Properties */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Properties</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addProperty}
                    disabled={isGenerating}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Property
                  </Button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {properties.map((prop, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Property name"
                          value={prop.name}
                          onChange={(e) => updateProperty(index, 'name', e.target.value)}
                          disabled={isGenerating}
                          className="text-sm"
                        />
                        <select
                          className="text-sm border rounded px-2 py-1"
                          value={prop.type}
                          onChange={(e) => updateProperty(index, 'type', e.target.value)}
                          disabled={isGenerating}
                        >
                          <option value="string">string</option>
                          <option value="int">int</option>
                          <option value="decimal">decimal</option>
                          <option value="bool">bool</option>
                          <option value="DateTime">DateTime</option>
                          <option value="Guid">Guid</option>
                        </select>
                      </div>
                      <div className="flex gap-1">
                        {prop.validations.map((validation, vIndex) => (
                          <Badge key={vIndex} variant="outline" className="text-xs">
                            {validation}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeProperty(index)}
                        disabled={isGenerating || properties.length === 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Command */}
              <div className="space-y-2">
                <Label>Generated CLI Command</Label>
                <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    <code className="flex-1 break-all">{generateCommand()}</code>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                onClick={generateEntity} 
                disabled={isGenerating || !entityName.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate Entity
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Time Savings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Time Savings Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {timeSavings.manual} min
                  </div>
                  <div className="text-sm text-muted-foreground">Manual Creation</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {timeSavings.scaffolding} min
                  </div>
                  <div className="text-sm text-muted-foreground">With Scaffolding</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {Math.round((timeSavings.manual / timeSavings.scaffolding) * 10) / 10}x
                </div>
                <div className="text-sm text-muted-foreground">Faster Development</div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Files Generated:</span>
                  <span className="font-medium">{timeSavings.filesGenerated}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Lines of Code:</span>
                  <span className="font-medium">{timeSavings.linesOfCode}+</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Architecture Layers:</span>
                  <span className="font-medium">4 (API, App, Domain, Infrastructure)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Generation Process */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Generation Progress
              </CardTitle>
              <CardDescription>
                Watch as Clean Architecture code is generated across all layers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(generationProgress)}%</span>
                </div>
                <Progress value={generationProgress} className="w-full" />
              </div>

              {/* Generation Steps */}
              <div className="space-y-2">
                {generationSteps.map((step, index) => {
                  const status = getStepStatus(step.id)
                  return (
                    <div 
                      key={step.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border transition-all',
                        status === 'active' && 'border-primary bg-primary/5',
                        status === 'complete' && 'border-green-500 bg-green-50 dark:bg-green-900/10',
                        status === 'pending' && 'border-muted-foreground/20'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                        status === 'active' && 'bg-primary text-primary-foreground animate-pulse',
                        status === 'complete' && 'bg-green-500 text-white',
                        status === 'pending' && 'bg-muted text-muted-foreground'
                      )}>
                        {status === 'complete' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : status === 'active' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={cn(
                            'font-medium text-sm',
                            status === 'complete' && 'text-green-700 dark:text-green-300'
                          )}>
                            {step.name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {step.files.length} file{step.files.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {(step.duration / 1000).toFixed(1)}s
                      </div>
                    </div>
                  )
                })}
              </div>

              {isGenerating && (
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertTitle>Generation in Progress</AlertTitle>
                  <AlertDescription>
                    Creating {timeSavings.filesGenerated} files across {4} architecture layers...
                  </AlertDescription>
                </Alert>
              )}

              {completedSteps.length === generationSteps.length && !isGenerating && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Generation Complete!</AlertTitle>
                  <AlertDescription>
                    Successfully generated {timeSavings.filesGenerated} files with {timeSavings.linesOfCode}+ lines of production-ready code.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="files">Generated Files</TabsTrigger>
              <TabsTrigger value="patterns">Patterns Used</TabsTrigger>
              <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <Accordion type="single" collapsible className="w-full">
                    {['API Layer', 'Application Layer', 'Infrastructure Layer', 'Domain Layer'].map((layer, index) => (
                      <AccordionItem key={layer} value={layer}>
                        <AccordionTrigger className="text-sm">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            {layer}
                            <Badge variant="outline" className="ml-auto">
                              {generationSteps.filter(step => {
                                if (layer === 'API Layer') return step.id === 'controller'
                                if (layer === 'Application Layer') return ['dtos', 'service-interface', 'service-impl', 'validation'].includes(step.id)
                                if (layer === 'Infrastructure Layer') return ['repository-impl', 'ef-configuration'].includes(step.id)
                                if (layer === 'Domain Layer') return ['domain-entity', 'repository-interface'].includes(step.id)
                                return false
                              }).length} files
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2">
                          {generationSteps
                            .filter(step => {
                              if (layer === 'API Layer') return step.id === 'controller'
                              if (layer === 'Application Layer') return ['dtos', 'service-interface', 'service-impl', 'validation'].includes(step.id)
                              if (layer === 'Infrastructure Layer') return ['repository-impl', 'ef-configuration'].includes(step.id)
                              if (layer === 'Domain Layer') return ['domain-entity', 'repository-interface'].includes(step.id)
                              return false
                            })
                            .map(step => (
                              <div key={step.id} className="flex items-center gap-2 p-2 text-sm">
                                {step.icon}
                                <span className="flex-1">{step.name}</span>
                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                  {step.files[0]}
                                </code>
                              </div>
                            ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4">
              <div className="grid gap-3">
                {[
                  { name: 'Clean Architecture', desc: 'Proper dependency direction and layer separation' },
                  { name: 'Repository Pattern', desc: 'Data access abstraction with interfaces' },
                  { name: 'Domain-Driven Design', desc: 'Rich domain entities with business logic' },
                  { name: 'SOLID Principles', desc: 'Well-structured, maintainable code' },
                  { name: 'Dependency Injection', desc: 'Loose coupling and testability' },
                  { name: 'DTO Pattern', desc: 'Clear API contracts and data transfer' }
                ].map((pattern) => (
                  <div key={pattern.name} className="flex items-start gap-3 p-3 border rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm">{pattern.name}</h4>
                      <p className="text-xs text-muted-foreground">{pattern.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="next-steps" className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-3">
                    {[
                      { step: 1, task: 'Add DbSet to ApplicationDbContext', code: `public DbSet<${entityName}> ${entityName}s { get; set; }` },
                      { step: 2, task: 'Register services in DI container', code: 'services.AddScoped<I...Repository, ...Repository>()' },
                      { step: 3, task: 'Create and apply migration', code: `dotnet ef migrations add Add${entityName}` },
                      { step: 4, task: 'Write unit and integration tests', code: '// Test domain logic and API endpoints' }
                    ].map((item) => (
                      <div key={item.step} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-primary">{item.step}</span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{item.task}</p>
                          <code className="block text-xs bg-muted p-2 rounded font-mono">
                            {item.code}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Alert>
                    <BookOpen className="h-4 w-4" />
                    <AlertTitle>Pro Tip</AlertTitle>
                    <AlertDescription>
                      The generated code follows all ModernAPI patterns and is production-ready. 
                      You can immediately start using the API endpoints!
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Module Navigation */}
      <ModuleNavigation moduleId="scaffolding" />
    </div>
  )
}