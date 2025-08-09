import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { 
  Globe, 
  Shield, 
  Code, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight,
  Settings,
  Database,
  Server,
  Link as LinkIcon,
  FileText,
  Zap,
  Users,
  Clock,
  GitBranch,
  Target,
  BookOpen
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/learn/rest-api')({
  component: RestApiPage,
})

function RestApiPage() {
  const [selectedStatusCode, setSelectedStatusCode] = useState<string>('200')

  const httpMethods = [
    {
      method: 'GET',
      purpose: 'Retrieve data',
      idempotent: true,
      safe: true,
      example: 'GET /api/users/123',
      description: 'Fetch a specific user by ID'
    },
    {
      method: 'POST',
      purpose: 'Create new resource',
      idempotent: false,
      safe: false,
      example: 'POST /api/users',
      description: 'Create a new user account'
    },
    {
      method: 'PUT',
      purpose: 'Update/replace resource',
      idempotent: true,
      safe: false,
      example: 'PUT /api/users/123',
      description: 'Update entire user resource'
    },
    {
      method: 'PATCH',
      purpose: 'Partial update',
      idempotent: false,
      safe: false,
      example: 'PATCH /api/users/123',
      description: 'Update specific user fields'
    },
    {
      method: 'DELETE',
      purpose: 'Remove resource',
      idempotent: true,
      safe: false,
      example: 'DELETE /api/users/123',
      description: 'Deactivate or remove user'
    }
  ]

  const statusCodes = [
    {
      code: '200',
      name: 'OK',
      category: 'success',
      description: 'Request successful, response body contains data',
      usage: 'GET, PUT, PATCH operations'
    },
    {
      code: '201',
      name: 'Created',
      category: 'success',
      description: 'Resource successfully created',
      usage: 'POST operations, include Location header'
    },
    {
      code: '204',
      name: 'No Content',
      category: 'success',
      description: 'Request successful, no response body',
      usage: 'DELETE operations, empty responses'
    },
    {
      code: '400',
      name: 'Bad Request',
      category: 'client',
      description: 'Invalid request format or validation errors',
      usage: 'Malformed JSON, validation failures'
    },
    {
      code: '401',
      name: 'Unauthorized',
      category: 'client',
      description: 'Authentication required or invalid',
      usage: 'Missing or invalid JWT token'
    },
    {
      code: '403',
      name: 'Forbidden',
      category: 'client',
      description: 'Authenticated but not authorized',
      usage: 'Insufficient permissions for resource'
    },
    {
      code: '404',
      name: 'Not Found',
      category: 'client',
      description: 'Resource does not exist',
      usage: 'Invalid resource ID or endpoint'
    },
    {
      code: '409',
      name: 'Conflict',
      category: 'client',
      description: 'Resource conflict or constraint violation',
      usage: 'Duplicate email, business rule violation'
    },
    {
      code: '422',
      name: 'Unprocessable Entity',
      category: 'client',
      description: 'Valid format but semantic errors',
      usage: 'Business validation failures'
    },
    {
      code: '500',
      name: 'Internal Server Error',
      category: 'server',
      description: 'Unexpected server error',
      usage: 'Unhandled exceptions, system failures'
    }
  ]

  const designPrinciples = [
    {
      title: 'Resource-Based URLs',
      description: 'Use nouns, not verbs. Resources are the key abstraction.',
      example: '/api/users/123/orders rather than /api/getUserOrders?userId=123',
      icon: <Target className="w-5 h-5" />
    },
    {
      title: 'HTTP Methods as Verbs',
      description: 'Let HTTP methods define the action on resources.',
      example: 'POST /api/users (create) vs GET /api/users (retrieve)',
      icon: <ArrowRight className="w-5 h-5" />
    },
    {
      title: 'Stateless Interactions',
      description: 'Each request contains all information needed to process it.',
      example: 'Include authentication token and context in every request',
      icon: <Shield className="w-5 h-5" />
    },
    {
      title: 'Consistent Data Formats',
      description: 'Standardize request/response formats across all endpoints.',
      example: 'Always return &#123; data, message, errors &#125; structure',
      icon: <FileText className="w-5 h-5" />
    }
  ]

  const enterpriseFeatures = [
    {
      title: 'Global Exception Handling',
      description: 'RFC 7807 Problem Details for consistent error responses',
      benefits: ['Consistent error format', 'Client-friendly messages', 'Debugging information']
    },
    {
      title: 'Request/Response Logging',
      description: 'Comprehensive logging with correlation IDs',
      benefits: ['Request tracing', 'Performance monitoring', 'Debugging support']
    },
    {
      title: 'Rate Limiting',
      description: 'Built-in rate limiting with different policies',
      benefits: ['API protection', 'Resource management', 'Fair usage']
    },
    {
      title: 'API Versioning',
      description: 'Header-based versioning strategy',
      benefits: ['Backward compatibility', 'Gradual migration', 'Clear deprecation']
    },
    {
      title: 'OpenAPI Documentation',
      description: 'Scalar UI with interactive testing capabilities',
      benefits: ['Auto-generated docs', 'Live testing', 'Client SDK generation']
    },
    {
      title: 'CORS Configuration',
      description: 'Flexible cross-origin resource sharing setup',
      benefits: ['Frontend integration', 'Security control', 'Development flexibility']
    }
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">REST API Best Practices</h1>
            <p className="text-muted-foreground">
              Modern REST API design patterns, error handling, and enterprise-grade implementation
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            <Globe className="w-3 h-3 mr-1" />
            REST API
          </Badge>
          <Badge variant="secondary">
            <Shield className="w-3 h-3 mr-1" />
            Enterprise
          </Badge>
          <Badge variant="secondary">
            <FileText className="w-3 h-3 mr-1" />
            RFC Standards
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="principles" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="principles">Design Principles</TabsTrigger>
          <TabsTrigger value="methods">HTTP Methods</TabsTrigger>
          <TabsTrigger value="status-codes">Status Codes</TabsTrigger>
          <TabsTrigger value="error-handling">Error Handling</TabsTrigger>
          <TabsTrigger value="features">Enterprise Features</TabsTrigger>
          <TabsTrigger value="examples">Real Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="principles" className="space-y-6">
          {/* Design Principles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                REST Design Principles
              </CardTitle>
              <CardDescription>
                Fundamental principles that guide our REST API implementation in ModernAPI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {designPrinciples.map((principle, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <div className="text-primary">{principle.icon}</div>
                        </div>
                        <h4 className="font-semibold">{principle.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{principle.description}</p>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <code className="text-xs">{principle.example}</code>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* URL Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                URL Structure & Conventions
              </CardTitle>
              <CardDescription>
                Consistent and predictable URL patterns used throughout ModernAPI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Resource Collection Patterns</h4>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <code className="text-sm">GET /api/users</code>
                      <span className="text-xs text-muted-foreground">Get all users (paginated)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <code className="text-sm">GET /api/users/&#123;id&#125;</code>
                      <span className="text-xs text-muted-foreground">Get specific user</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <code className="text-sm">POST /api/users</code>
                      <span className="text-xs text-muted-foreground">Create new user</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <code className="text-sm">PUT /api/users/&#123;id&#125;</code>
                      <span className="text-xs text-muted-foreground">Update entire user</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <code className="text-sm">DELETE /api/users/&#123;id&#125;</code>
                      <span className="text-xs text-muted-foreground">Deactivate user</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">✓ Good URL Examples</h4>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 space-y-1">
                      <code className="text-xs block">/api/users</code>
                      <code className="text-xs block">/api/users/123/profile</code>
                      <code className="text-xs block">/api/products?category=electronics</code>
                      <code className="text-xs block">/api/orders/456/items</code>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">✗ Avoid These Patterns</h4>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 space-y-1">
                      <code className="text-xs block">/api/getUsers</code>
                      <code className="text-xs block">/api/user_profile/123</code>
                      <code className="text-xs block">/api/products/getByCategory</code>
                      <code className="text-xs block">/api/deleteOrder/456</code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          {/* HTTP Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                HTTP Methods Usage
              </CardTitle>
              <CardDescription>
                Proper usage of HTTP methods in our REST API implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {httpMethods.map((method, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={method.method === 'GET' ? 'default' : 'secondary'}
                          className="font-mono"
                        >
                          {method.method}
                        </Badge>
                        <div>
                          <h4 className="font-medium">{method.purpose}</h4>
                          <code className="text-sm text-muted-foreground">{method.example}</code>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {method.idempotent && (
                          <Badge variant="outline" className="text-xs">Idempotent</Badge>
                        )}
                        {method.safe && (
                          <Badge variant="outline" className="text-xs">Safe</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                ))}
              </div>
              
              <Alert className="mt-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Idempotent methods</strong> can be called multiple times with the same result. 
                  <strong>Safe methods</strong> don't modify server state and can be cached.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status-codes" className="space-y-6">
          {/* Status Codes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                HTTP Status Codes
              </CardTitle>
              <CardDescription>
                Comprehensive status code usage in ModernAPI - click on a status code to see details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-5 gap-2">
                {statusCodes.map((status) => (
                  <Button
                    key={status.code}
                    variant={selectedStatusCode === status.code ? "default" : "outline"}
                    size="sm"
                    className="justify-start"
                    onClick={() => setSelectedStatusCode(status.code)}
                  >
                    <span className="font-mono">{status.code}</span>
                  </Button>
                ))}
              </div>
              
              {selectedStatusCode && (
                <div className="mt-6 p-6 bg-muted/30 rounded-lg">
                  {statusCodes
                    .filter(s => s.code === selectedStatusCode)
                    .map(status => (
                      <div key={status.code} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={
                              status.category === 'success' ? 'default' :
                              status.category === 'client' ? 'secondary' :
                              'destructive'
                            }
                            className="font-mono text-lg px-3 py-1"
                          >
                            {status.code}
                          </Badge>
                          <h3 className="text-xl font-semibold">{status.name}</h3>
                        </div>
                        <p className="text-muted-foreground">{status.description}</p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Common Usage</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{status.usage}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="error-handling" className="space-y-6">
          {/* Error Handling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                RFC 7807 Problem Details
              </CardTitle>
              <CardDescription>
                Standardized error responses using the RFC 7807 Problem Details specification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Standard Error Response Format</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm"><code>{`{
  "type": "https://modernapi.example.com/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "The request contains invalid field values",
  "instance": "/api/users",
  "requestId": "0HMVBP9JK9J6C:00000001",
  "timestamp": "2025-01-09T10:30:00.123Z",
  "errors": {
    "email": ["Email format is invalid"],
    "password": ["Password must be at least 8 characters"]
  }
}`}</code></pre>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Error Response Fields</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <code>type</code>
                      <span className="text-muted-foreground">URI identifying the problem type</span>
                    </div>
                    <div className="flex justify-between">
                      <code>title</code>
                      <span className="text-muted-foreground">Human-readable summary</span>
                    </div>
                    <div className="flex justify-between">
                      <code>status</code>
                      <span className="text-muted-foreground">HTTP status code</span>
                    </div>
                    <div className="flex justify-between">
                      <code>detail</code>
                      <span className="text-muted-foreground">Human-readable explanation</span>
                    </div>
                    <div className="flex justify-between">
                      <code>instance</code>
                      <span className="text-muted-foreground">URI reference to specific occurrence</span>
                    </div>
                    <div className="flex justify-between">
                      <code>requestId</code>
                      <span className="text-muted-foreground">Correlation ID for tracing</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Exception Middleware</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <pre className="text-xs"><code>{`public class ExceptionMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }
    
    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var problemDetails = exception switch
        {
            ValidationException validationEx => CreateValidationProblem(validationEx),
            NotFoundException notFoundEx => CreateNotFoundProblem(notFoundEx),
            ConflictException conflictEx => CreateConflictProblem(conflictEx),
            _ => CreateInternalServerErrorProblem(exception)
        };
        
        problemDetails.Instance = context.Request.Path;
        problemDetails.Extensions["requestId"] = Activity.Current?.Id;
        problemDetails.Extensions["timestamp"] = DateTimeOffset.UtcNow;
        
        context.Response.StatusCode = problemDetails.Status ?? 500;
        await context.Response.WriteAsJsonAsync(problemDetails);
    }
}`}</code></pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Errors */}
          <Card>
            <CardHeader>
              <CardTitle>Validation Error Examples</CardTitle>
              <CardDescription>
                How validation errors are formatted in different scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Field Validation Errors</h4>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    <pre className="text-xs"><code>{`{
  "type": "/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "One or more fields are invalid",
  "errors": {
    "firstName": ["First name is required"],
    "email": [
      "Email format is invalid",
      "Email must be unique"
    ],
    "age": ["Age must be between 18 and 120"]
  }
}`}</code></pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Business Rule Violations</h4>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    <pre className="text-xs"><code>{`{
  "type": "/problems/business-rule-violation",
  "title": "Business Rule Violation",
  "status": 422,
  "detail": "Cannot delete user with active orders",
  "errorCode": "USER_HAS_ACTIVE_ORDERS",
  "context": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "activeOrderCount": 3
  }
}`}</code></pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          {/* Enterprise Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Enterprise API Features
              </CardTitle>
              <CardDescription>
                Production-ready features built into the ModernAPI template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enterpriseFeatures.map((feature, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      <div className="space-y-1">
                        {feature.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-muted-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Interactive API Documentation
              </CardTitle>
              <CardDescription>
                Scalar UI provides modern, interactive API documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Interactive request testing
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Auto-generated from OpenAPI specs
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Authentication support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Response examples
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Access URLs</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Development:</strong>
                        <br />
                        <code className="text-xs">http://localhost:5051/scalar/v1</code>
                      </div>
                      <div>
                        <strong>OpenAPI Spec:</strong>
                        <br />
                        <code className="text-xs">http://localhost:5051/swagger/v1/swagger.json</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">XML Documentation Integration</h4>
                <pre className="text-xs"><code>{`/// <summary>
/// Creates a new user account with the provided information
/// </summary>
/// <param name="request">User creation details including email and profile information</param>
/// <param name="cancellationToken">Cancellation token for async operation</param>
/// <returns>Created user details with assigned ID and creation timestamp</returns>
/// <response code="201">User created successfully</response>
/// <response code="400">Validation errors in request data</response>
/// <response code="409">Email address already exists</response>
[HttpPost]
[ProducesResponseType(typeof(UserResponse), StatusCodes.Status201Created)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
public async Task<ActionResult<UserResponse>> CreateUser([FromBody] CreateUserRequest request)`}</code></pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          {/* Real API Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Real Implementation Examples
              </CardTitle>
              <CardDescription>
                Actual controller implementations from the ModernAPI template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">User Management Controller</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm"><code>{`[Route("api/[controller]")]
[Authorize]
public class UsersController : BaseController
{
    private readonly IUserService _userService;

    [HttpGet]
    [ProducesResponseType(typeof(UserListResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserListResponse>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int size = 10,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _userService.GetUsersAsync(page, size, search, cancellationToken);
        return Ok(result);
    }

    [HttpGet("&#123;id:guid&#125;")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> GetUser(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default)
    {
        var user = await _userService.GetUserByIdAsync(id, cancellationToken);
        return Ok(user);
    }

    [HttpPut("&#123;id:guid&#125;")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserResponse>> UpdateUser(
        [FromRoute] Guid id,
        [FromBody] UpdateUserRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await _userService.UpdateUserAsync(id, request, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("&#123;id:guid&#125;")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeactivateUser(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default)
    {
        await _userService.DeactivateUserAsync(id, cancellationToken);
        return NoContent();
    }
}`}</code></pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Authentication Controller</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm"><code>{`[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController : BaseController
{
    private readonly IAuthService _authService;

    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResponse>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        
        // Set HTTP-only cookie for refresh token
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        };
        Response.Cookies.Append("refreshToken", result.RefreshToken, cookieOptions);
        
        return Ok(result);
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(RefreshTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<RefreshTokenResponse>> RefreshToken(
        CancellationToken cancellationToken = default)
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized("Refresh token not found");
        }

        var result = await _authService.RefreshTokenAsync(refreshToken, cancellationToken);
        return Ok(result);
    }
}`}</code></pre>
                </div>
              </div>
              
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Performance Tip:</strong> Notice how controllers are lightweight and delegate 
                  business logic to services. This keeps them focused on HTTP concerns while maintaining 
                  clean separation of responsibilities.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Testing Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                API Testing Examples
              </CardTitle>
              <CardDescription>
                How to test REST APIs with proper assertions and scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Integration Test Example</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm"><code>{`[Test]
public async Task GetUser_WithValidId_ReturnsUserData()
{
    // Arrange
    var user = await SeedUserAsync();
    
    // Act
    var response = await Client.GetAsync($"/api/users/&#123;user.Id&#125;");
    
    // Assert
    response.Should().Be200Ok();
    
    var userDto = await response.ReadAsJsonAsync<UserDto>();
    userDto.Should().NotBeNull();
    userDto.Id.Should().Be(user.Id);
    userDto.Email.Should().Be(user.Email);
    userDto.DisplayName.Should().Be(user.DisplayName);
}

[Test]
public async Task CreateUser_WithInvalidData_ReturnsProblemDetails()
{
    // Arrange
    var request = new CreateUserRequest
    {
        Email = "invalid-email",
        Password = "weak"
    };
    
    // Act
    var response = await Client.PostAsJsonAsync("/api/users", request);
    
    // Assert
    response.Should().Be400BadRequest();
    
    var problemDetails = await response.ReadAsJsonAsync<ValidationProblemDetails>();
    problemDetails.Should().NotBeNull();
    problemDetails.Title.Should().Be("Validation Error");
    problemDetails.Errors.Should().ContainKey("Email");
    problemDetails.Errors.Should().ContainKey("Password");
}`}</code></pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}