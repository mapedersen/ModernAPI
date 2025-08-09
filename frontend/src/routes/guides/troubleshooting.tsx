import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { 
  Bug, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database, 
  Server, 
  Shield,
  FileText,
  Terminal,
  Eye,
  Info,
  Code,
  Copy,
  ExternalLink
} from 'lucide-react'

export const Route = createFileRoute('/guides/troubleshooting')({
  component: TroubleshootingGuideComponent,
})

interface TroubleshootingStep {
  id: number
  title: string
  description: string
  completed: boolean
  category: 'quick' | 'analysis' | 'investigation'
}

interface ErrorScenario {
  status: number
  category: string
  title: string
  description: string
  action: string
  examples: string[]
  color: string
}

interface LogExample {
  title: string
  command: string
  description: string
  category: 'search' | 'context' | 'database'
}

function TroubleshootingGuideComponent() {
  const quickSteps: TroubleshootingStep[] = [
    { id: 1, title: 'Get Request ID', description: 'Find requestId from error response', completed: false, category: 'quick' },
    { id: 2, title: 'Identify Error Category', description: 'Check HTTP status code', completed: false, category: 'quick' },
    { id: 3, title: 'Search Logs', description: 'Use requestId to find exact error', completed: false, category: 'analysis' },
    { id: 4, title: 'Check Context', description: 'Look for related log entries', completed: false, category: 'analysis' },
    { id: 5, title: 'Investigate Root Cause', description: 'Analyze business logic and data', completed: false, category: 'investigation' },
    { id: 6, title: 'Apply Fix', description: 'Implement solution and test', completed: false, category: 'investigation' }
  ]

  const errorScenarios: ErrorScenario[] = [
    {
      status: 400,
      category: 'Client Error',
      title: 'Bad Request',
      description: 'Request format issues or business rule violations',
      action: 'Check request format, validation rules, and business constraints',
      examples: [
        'Validation errors (missing required fields)',
        'Business rule violations (USER_NOT_ACTIVE)',
        'Invalid data format or types'
      ],
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    },
    {
      status: 401,
      category: 'Authentication',
      title: 'Unauthorized',
      description: 'Authentication issues with JWT tokens or user permissions',
      action: 'Check JWT token validity, expiration, and user permissions',
      examples: [
        'Expired JWT token',
        'Invalid token signature',
        'Missing authorization header'
      ],
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    },
    {
      status: 404,
      category: 'Not Found',
      title: 'Resource Not Found',
      description: 'Requested resource does not exist or user lacks access',
      action: 'Verify resource exists, check IDs, and confirm user permissions',
      examples: [
        'Incorrect GUID format',
        'Resource was deleted',
        'Permission-based hiding'
      ],
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    },
    {
      status: 409,
      category: 'Conflict',
      title: 'Business Constraint',
      description: 'Business rules prevent the operation from completing',
      action: 'Check business rules, existing data, and constraint violations',
      examples: [
        'Duplicate SKU or email',
        'Inventory constraints',
        'State transition rules'
      ],
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    },
    {
      status: 500,
      category: 'Server Error',
      title: 'Internal Error',
      description: 'Unexpected server-side errors requiring investigation',
      action: 'Check logs immediately, fix code issues, and monitor system health',
      examples: [
        'Unhandled exceptions',
        'Database connection issues',
        'Configuration problems'
      ],
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
  ]

  const logExamples: LogExample[] = [
    {
      title: 'Find Specific Request',
      command: 'grep "0HMVBP9JK9J6C:00000001" logs/modernapi-*.log',
      description: 'Search logs for specific request using requestId',
      category: 'search'
    },
    {
      title: 'Structured Log Search',
      command: 'docker logs api-container | jq \'select(.RequestId == "0HMVBP9JK9J6C:00000001")\'',
      description: 'Use jq to parse structured JSON logs',
      category: 'search'
    },
    {
      title: 'Context Around Time',
      command: 'grep -C 10 "01:30:00" logs/modernapi-20250808.log',
      description: 'Get 10 lines before and after a specific timestamp',
      category: 'context'
    },
    {
      title: 'Database Errors',
      command: 'grep -i "database\\|sql\\|entity" logs/*.log | grep "01:30"',
      description: 'Find database-related errors around specific time',
      category: 'database'
    }
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStepColor = (category: string) => {
    switch (category) {
      case 'quick': return 'bg-green-500'
      case 'analysis': return 'bg-blue-500'
      case 'investigation': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'search': return <Search className="w-4 h-4" />
      case 'context': return <Clock className="w-4 h-4" />
      case 'database': return <Database className="w-4 h-4" />
      default: return <Terminal className="w-4 h-4" />
    }
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Bug className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Developer Troubleshooting Guide</h1>
            <p className="text-muted-foreground">Comprehensive debugging workflows and error analysis techniques</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Guides</Badge>
          <Badge variant="outline">All Levels</Badge>
          <span className="text-sm text-muted-foreground">• 25 min read</span>
        </div>
      </div>

      {/* Quick Debugging Checklist */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Quick Error Debugging Checklist
          </CardTitle>
          <CardDescription>
            Follow these 6 steps to systematically debug any error in ModernAPI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${getStepColor(step.category)}`}>
                  {step.completed ? '✓' : step.id}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="errors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="errors">Error Categories</TabsTrigger>
          <TabsTrigger value="scenarios">Common Scenarios</TabsTrigger>
          <TabsTrigger value="logs">Log Analysis</TabsTrigger>
          <TabsTrigger value="environments">Environment Diff</TabsTrigger>
          <TabsTrigger value="tools">Debug Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-6">
          {/* Error Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                HTTP Status Code Categories
              </CardTitle>
              <CardDescription>
                Understand what each error category means and how to approach debugging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errorScenarios.map((error) => (
                  <div key={error.status} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center font-mono font-bold text-lg">
                          {error.status}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{error.title}</h3>
                          <Badge className={error.color}>
                            {error.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{error.description}</p>
                    
                    <Alert>
                      <Info className="w-4 h-4" />
                      <AlertDescription>
                        <strong>Action:</strong> {error.action}
                      </AlertDescription>
                    </Alert>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Common Examples:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {error.examples.map((example, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <XCircle className="w-3 h-3 text-red-500" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          {/* Validation Errors */}
          <Card>
            <CardHeader>
              <CardTitle>Validation Errors (400 Bad Request)</CardTitle>
              <CardDescription>
                Client-side validation failures and how to debug them
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Example Response:</h4>
                <pre className="text-sm bg-background p-3 rounded border overflow-x-auto"><code>{`{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred",
  "status": 400,
  "errors": {
    "Email": ["Email is required", "Email format is invalid"],
    "Price": ["Price must be greater than 0"]
  },
  "requestId": "0HMVBP9JK9J6C:00000001",
  "timestamp": "2025-08-08T01:30:00.123Z"
}`}</code></pre>
              </div>
              
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Debugging Steps:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Check the "errors" object for specific field validation failures</li>
                    <li>Verify client is sending all required fields</li>
                    <li>Confirm data types match expected formats (dates, numbers, GUIDs)</li>
                    <li>Review FluentValidation rules in the Application layer</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Business Rule Violations */}
          <Card>
            <CardHeader>
              <CardTitle>Business Rule Violations (400 Bad Request)</CardTitle>
              <CardDescription>
                Domain-specific constraints and business logic failures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Example Response:</h4>
                <pre className="text-sm bg-background p-3 rounded border overflow-x-auto"><code>{`{
  "type": "https://modernapi.example.com/problems/domain/user_not_active",
  "title": "Business rule violation",
  "status": 400,
  "detail": "User account is not active and cannot perform this operation",
  "errorCode": "USER_NOT_ACTIVE",
  "requestId": "0HMVBP9JK9J6C:00000002",
  "timestamp": "2025-08-08T01:30:00.123Z"
}`}</code></pre>
              </div>
              
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Debugging Steps:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Look for the "errorCode" field for specific business rule</li>
                    <li>Check domain entity methods for business logic validation</li>
                    <li>Review domain exception definitions</li>
                    <li>Verify entity state meets business requirements</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Resource Not Found */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Not Found (404 Not Found)</CardTitle>
              <CardDescription>
                When requested resources don't exist or aren't accessible
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Example Response:</h4>
                <pre className="text-sm bg-background p-3 rounded border overflow-x-auto"><code>{`{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Resource not found",
  "status": 404,
  "detail": "User with ID '123e4567-e89b-12d3-a456-426614174000' was not found",
  "requestId": "0HMVBP9JK9J6C:00000003",
  "timestamp": "2025-08-08T01:30:00.123Z"
}`}</code></pre>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-yellow-800 dark:text-yellow-200">Common Causes:</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• <strong>GUID format incorrect:</strong> Check if ID is valid GUID format</li>
                  <li>• <strong>Resource deleted:</strong> Entity was soft-deleted or deactivated</li>
                  <li>• <strong>Permission issue:</strong> User can see resource but lacks access rights</li>
                  <li>• <strong>Wrong endpoint:</strong> Check URL routing and parameter names</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          {/* Log Search Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Log Analysis Commands
              </CardTitle>
              <CardDescription>
                Essential commands for finding and analyzing error logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logExamples.map((example, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(example.category)}
                        <h4 className="font-medium">{example.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {example.category}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(example.command)}
                        className="gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </Button>
                    </div>
                    
                    <div className="bg-muted rounded p-3 mb-2">
                      <code className="text-sm font-mono">{example.command}</code>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{example.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Root Cause Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Root Cause Analysis Workflow</CardTitle>
              <CardDescription>
                Step-by-step process for investigating complex errors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">1</div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Find the Error Log Entry</h4>
                    <div className="bg-muted rounded p-3 mb-2">
                      <code className="text-sm">grep "RequestId: ABC123" logs/*.log</code>
                    </div>
                    <p className="text-sm text-muted-foreground">Use the requestId from the client error response to locate exact log entry</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">2</div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Look for Context Around Time</h4>
                    <div className="bg-muted rounded p-3 mb-2">
                      <code className="text-sm">grep -C 10 "01:30:00" logs/modernapi-20250808.log</code>
                    </div>
                    <p className="text-sm text-muted-foreground">Get surrounding context to understand what led to the error</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">3</div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Check for Related Database Errors</h4>
                    <div className="bg-muted rounded p-3 mb-2">
                      <code className="text-sm">grep -i "database\\|sql\\|entity" logs/*.log | grep "01:30"</code>
                    </div>
                    <p className="text-sm text-muted-foreground">Look for database connection issues, constraint violations, or EF Core errors</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments" className="space-y-6">
          {/* Development vs Production */}
          <Card>
            <CardHeader>
              <CardTitle>Development vs Production Differences</CardTitle>
              <CardDescription>
                Understanding how error information differs between environments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Aspect</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Development</th>
                      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Production</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium">Error Detail</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Full exception message
                        </div>
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          Generic message
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium">Stack Trace</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Included in response
                        </div>
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-yellow-500" />
                          Only in logs
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium">Inner Exceptions</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Shown in response
                        </div>
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-yellow-500" />
                          Only in logs
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium">Sensitive Data</td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          May be visible
                        </div>
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          Always hidden
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Production Debugging Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Production Debugging Best Practices</CardTitle>
              <CardDescription>
                How to debug effectively in production without sensitive data exposure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  <strong>Security First:</strong> Production errors hide sensitive information by design. 
                  Always use server logs and monitoring tools for detailed investigation.
                </AlertDescription>
              </Alert>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Do This
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Use requestId to find detailed server logs</li>
                    <li>• Set up structured logging with correlation IDs</li>
                    <li>• Implement comprehensive monitoring and alerts</li>
                    <li>• Use APM tools like Application Insights</li>
                    <li>• Create debug endpoints with proper authorization</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Avoid This
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Never expose full stack traces to clients</li>
                    <li>• Don't log sensitive data (passwords, tokens)</li>
                    <li>• Avoid enabling detailed error pages in production</li>
                    <li>• Don't rely solely on client-side error information</li>
                    <li>• Never debug directly in production databases</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          {/* Debug Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Essential Debug Tools</CardTitle>
              <CardDescription>
                Tools and techniques for effective ModernAPI debugging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Command Line Tools
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="border rounded p-3">
                      <div className="font-medium text-sm mb-1">grep / ripgrep</div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">rg "error" logs/ -A 5 -B 5</code>
                      <p className="text-xs text-muted-foreground mt-1">Fast log searching with context</p>
                    </div>
                    
                    <div className="border rounded p-3">
                      <div className="font-medium text-sm mb-1">jq</div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">cat logs.json | jq '.Level == "Error"'</code>
                      <p className="text-xs text-muted-foreground mt-1">Parse and filter JSON logs</p>
                    </div>
                    
                    <div className="border rounded p-3">
                      <div className="font-medium text-sm mb-1">dotnet ef</div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">dotnet ef database update --verbose</code>
                      <p className="text-xs text-muted-foreground mt-1">Debug EF Core migrations</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Monitoring Tools
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="border rounded p-3">
                      <div className="font-medium text-sm mb-1">Scalar UI</div>
                      <p className="text-xs text-muted-foreground">Interactive API documentation and testing at <code>/scalar/v1</code></p>
                    </div>
                    
                    <div className="border rounded p-3">
                      <div className="font-medium text-sm mb-1">Health Checks</div>
                      <p className="text-xs text-muted-foreground">System health monitoring at <code>/health</code></p>
                    </div>
                    
                    <div className="border rounded p-3">
                      <div className="font-medium text-sm mb-1">Serilog</div>
                      <p className="text-xs text-muted-foreground">Structured logging with request correlation</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Quick Reference</CardTitle>
              <CardDescription>
                Common debugging scenarios and their solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Database Issues</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Check connection strings in appsettings.json</li>
                    <li>• Verify database exists and is accessible</li>
                    <li>• Run migrations: <code>dotnet ef database update</code></li>
                    <li>• Check EF Core logs for SQL queries</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">Authentication Issues</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Verify JWT token is not expired</li>
                    <li>• Check Authorization header format: <code>Bearer &#123;token&#125;</code></li>
                    <li>• Validate JWT secret and issuer settings</li>
                    <li>• Confirm user exists and is active</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-yellow-800 dark:text-yellow-200">Validation Failures</h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Check FluentValidation rules in Application layer</li>
                    <li>• Verify request DTOs match expected format</li>
                    <li>• Ensure required fields are provided</li>
                    <li>• Validate data types and constraints</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* External Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Additional Resources
              </CardTitle>
              <CardDescription>
                Helpful links and documentation for deeper investigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">ModernAPI Documentation</h4>
                  <div className="space-y-2 text-sm">
                    <Button variant="outline" size="sm" className="justify-start gap-2">
                      <FileText className="w-3 h-3" />
                      Error Handling Guide
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2">
                      <Code className="w-3 h-3" />
                      API Reference
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2">
                      <Database className="w-3 h-3" />
                      Database Schema
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">External Tools</h4>
                  <div className="space-y-2 text-sm">
                    <Button variant="outline" size="sm" className="justify-start gap-2">
                      <ExternalLink className="w-3 h-3" />
                      RFC 7807 Problem Details
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2">
                      <ExternalLink className="w-3 h-3" />
                      EF Core Logging
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2">
                      <ExternalLink className="w-3 h-3" />
                      Serilog Documentation
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}