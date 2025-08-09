import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { Separator } from '~/components/ui/separator'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { 
  Play,
  Copy,
  ChevronDown,
  ChevronRight,
  Globe,
  Code,
  Shield,
  AlertTriangle,
  CheckCircle,
  Key,
  Lock,
  Unlock,
  Send,
  Eye,
  EyeOff,
  Zap,
  BookOpen,
  Settings,
  FileText,
  Terminal,
  Clock,
  Activity,
  Users,
  Database,
  ShoppingCart,
  Package,
  Plus,
  Minus,
  Download,
  Upload,
  Edit,
  Trash2,
  RotateCcw,
  Save,
  X,
  Check,
  Info
} from 'lucide-react'
import { useLearningStore } from '~/stores/learning'
import { ModuleNavigation, useModuleCompletion } from '~/components/learning/ModuleNavigation'
import { cn } from '~/lib/utils'
import type { 
  APIPlaygroundEndpoint, 
  APIRequestState, 
  APIResponseState, 
  AuthFlowStep, 
  ErrorScenario,
  OpenAPISpec,
  APIParameterDefinition,
  APIRequestBodyDefinition,
  APIResponseDefinition
} from '~/types/learning'

export const Route = createFileRoute('/tools/api-playground')({
  component: APIPlaygroundPage,
})

function APIPlaygroundPage() {
  // Handle module completion and progression
  useModuleCompletion('api-playground')
  const [selectedEndpoint, setSelectedEndpoint] = React.useState<APIPlaygroundEndpoint | null>(null)
  const [requestState, setRequestState] = React.useState<APIRequestState>({
    endpoint: null,
    method: 'GET',
    url: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    queryParams: {},
    pathParams: {},
    body: '',
    bodyType: 'json'
  })
  const [responseState, setResponseState] = React.useState<APIResponseState>({})
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState('all')
  const [showAuthHeaders, setShowAuthHeaders] = React.useState(false)
  const [authToken, setAuthToken] = React.useState('')
  const [selectedAuthStep, setSelectedAuthStep] = React.useState<string | null>('login')
  const [selectedErrorScenario, setSelectedErrorScenario] = React.useState<string | null>(null)
  const [showRequestCode, setShowRequestCode] = React.useState(false)
  const [codeLanguage, setCodeLanguage] = React.useState<'curl' | 'javascript' | 'csharp' | 'python'>('curl')

  // Sample API endpoints based on ModernAPI backend
  const endpoints: APIPlaygroundEndpoint[] = [
    {
      id: 'auth-login',
      method: 'POST',
      path: '/api/auth/login',
      title: 'User Login',
      description: 'Authenticate user with email and password to receive JWT tokens',
      category: 'Authentication',
      requiresAuth: false,
      requestBody: {
        contentType: 'application/json',
        description: 'Login credentials',
        schema: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            rememberMe: { type: 'boolean' }
          },
          required: ['email', 'password']
        },
        example: {
          email: 'admin@modernapi.dev',
          password: 'SecurePass123!',
          rememberMe: true
        }
      },
      responses: [
        {
          statusCode: 200,
          description: 'Login successful',
          contentType: 'application/json',
          example: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...',
            user: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'admin@modernapi.dev',
              displayName: 'Admin User',
              isActive: true
            },
            expiresIn: 900
          }
        },
        {
          statusCode: 401,
          description: 'Invalid credentials',
          contentType: 'application/problem+json',
          example: {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
            title: 'Unauthorized',
            status: 401,
            detail: 'Invalid email or password'
          }
        }
      ],
      tags: ['Authentication', 'JWT', 'Security'],
      example: {
        curl: `curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@modernapi.dev",
    "password": "SecurePass123!",
    "rememberMe": true
  }'`,
        javascript: `const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@modernapi.dev',
    password: 'SecurePass123!',
    rememberMe: true
  })
});

const result = await response.json();`,
        csharp: `var request = new LoginRequest
{
    Email = "admin@modernapi.dev",
    Password = "SecurePass123!",
    RememberMe = true
};

var response = await httpClient.PostAsJsonAsync("/api/auth/login", request);
var result = await response.Content.ReadFromJsonAsync<AuthResponse>();`,
        python: `import requests

response = requests.post('http://localhost:5000/api/auth/login', json={
    'email': 'admin@modernapi.dev',
    'password': 'SecurePass123!',
    'rememberMe': True
})

result = response.json()`
      }
    },
    {
      id: 'auth-refresh',
      method: 'POST',
      path: '/api/auth/refresh',
      title: 'Refresh Token',
      description: 'Refresh expired access token using refresh token',
      category: 'Authentication',
      requiresAuth: false,
      requestBody: {
        contentType: 'application/json',
        description: 'Refresh token',
        schema: {
          type: 'object',
          properties: {
            refreshToken: { type: 'string' }
          },
          required: ['refreshToken']
        },
        example: {
          refreshToken: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...'
        }
      },
      responses: [
        {
          statusCode: 200,
          description: 'Token refreshed successfully',
          example: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'dGhpcyBpcyBhIG5ldyByZWZyZXNoIHRva2Vu...',
            expiresIn: 900
          }
        }
      ],
      tags: ['Authentication', 'JWT', 'Token Refresh'],
      example: {
        curl: `curl -X POST http://localhost:5000/api/auth/refresh \\
  -H "Content-Type: application/json" \\
  -d '{"refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."}'`,
        javascript: `const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refreshToken: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...'
  })
});`,
        csharp: `var response = await httpClient.PostAsJsonAsync("/api/auth/refresh", new {
    RefreshToken = "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
});`,
        python: `response = requests.post('/api/auth/refresh', json={
    'refreshToken': 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...'
})`
      }
    },
    {
      id: 'users-list',
      method: 'GET',
      path: '/api/users',
      title: 'List Users',
      description: 'Get paginated list of users with filtering and sorting',
      category: 'Users',
      requiresAuth: true,
      parameters: [
        {
          name: 'page',
          in: 'query',
          type: 'integer',
          required: false,
          description: 'Page number (1-based)',
          example: 1
        },
        {
          name: 'pageSize',
          in: 'query',
          type: 'integer',
          required: false,
          description: 'Number of items per page (max 100)',
          example: 10
        },
        {
          name: 'search',
          in: 'query',
          type: 'string',
          required: false,
          description: 'Search in display name and email',
          example: 'john'
        },
        {
          name: 'sortBy',
          in: 'query',
          type: 'string',
          required: false,
          description: 'Sort field',
          enum: ['displayName', 'email', 'createdAt'],
          example: 'displayName'
        },
        {
          name: 'sortDesc',
          in: 'query',
          type: 'boolean',
          required: false,
          description: 'Sort in descending order',
          example: false
        }
      ],
      responses: [
        {
          statusCode: 200,
          description: 'Users retrieved successfully',
          example: {
            data: [
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'john.doe@example.com',
                displayName: 'John Doe',
                firstName: 'John',
                lastName: 'Doe',
                isActive: true,
                createdAt: '2025-01-01T12:00:00Z'
              }
            ],
            pagination: {
              page: 1,
              pageSize: 10,
              totalPages: 5,
              totalItems: 42,
              hasNextPage: true,
              hasPrevPage: false
            }
          }
        },
        {
          statusCode: 401,
          description: 'Unauthorized - Invalid or missing token'
        }
      ],
      tags: ['Users', 'Pagination', 'Search'],
      example: {
        curl: `curl -X GET "http://localhost:5000/api/users?page=1&pageSize=10&search=john" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`,
        javascript: `const response = await fetch('/api/users?page=1&pageSize=10&search=john', {
  headers: {
    'Authorization': 'Bearer ' + accessToken
  }
});`,
        csharp: `var response = await httpClient.GetAsync("/api/users?page=1&pageSize=10&search=john");
var users = await response.Content.ReadFromJsonAsync<PagedResult<UserDto>>();`,
        python: `headers = {'Authorization': f'Bearer {access_token}'}
response = requests.get('/api/users', params={
    'page': 1, 'pageSize': 10, 'search': 'john'
}, headers=headers)`
      }
    },
    {
      id: 'users-create',
      method: 'POST',
      path: '/api/users',
      title: 'Create User',
      description: 'Create a new user account',
      category: 'Users',
      requiresAuth: true,
      requestBody: {
        contentType: 'application/json',
        description: 'User creation data',
        schema: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            displayName: { type: 'string', minLength: 1, maxLength: 100 },
            firstName: { type: 'string', maxLength: 50 },
            lastName: { type: 'string', maxLength: 50 },
            password: { type: 'string', minLength: 6 }
          },
          required: ['email', 'displayName', 'password']
        },
        example: {
          email: 'jane.smith@example.com',
          displayName: 'Jane Smith',
          firstName: 'Jane',
          lastName: 'Smith',
          password: 'SecurePassword123!'
        }
      },
      responses: [
        {
          statusCode: 201,
          description: 'User created successfully',
          example: {
            user: {
              id: '456e7890-f12b-34c5-d678-901234567890',
              email: 'jane.smith@example.com',
              displayName: 'Jane Smith',
              firstName: 'Jane',
              lastName: 'Smith',
              isActive: true,
              createdAt: '2025-01-08T10:30:00Z'
            },
            message: 'User created successfully'
          }
        },
        {
          statusCode: 409,
          description: 'Email already exists',
          example: {
            type: 'https://modernapi.example.com/problems/domain/email_already_exists',
            title: 'Business rule violation',
            status: 409,
            detail: 'A user with email jane.smith@example.com already exists'
          }
        }
      ],
      tags: ['Users', 'Creation'],
      example: {
        curl: `curl -X POST http://localhost:5000/api/users \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "jane.smith@example.com",
    "displayName": "Jane Smith",
    "firstName": "Jane",
    "lastName": "Smith", 
    "password": "SecurePassword123!"
  }'`,
        javascript: `const response = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'jane.smith@example.com',
    displayName: 'Jane Smith',
    firstName: 'Jane',
    lastName: 'Smith',
    password: 'SecurePassword123!'
  })
});`,
        csharp: `var request = new CreateUserRequest
{
    Email = "jane.smith@example.com",
    DisplayName = "Jane Smith",
    FirstName = "Jane",
    LastName = "Smith",
    Password = "SecurePassword123!"
};

var response = await httpClient.PostAsJsonAsync("/api/users", request);`,
        python: `data = {
    'email': 'jane.smith@example.com',
    'displayName': 'Jane Smith', 
    'firstName': 'Jane',
    'lastName': 'Smith',
    'password': 'SecurePassword123!'
}

response = requests.post('/api/users', json=data, headers=headers)`
      }
    },
    {
      id: 'users-get',
      method: 'GET',
      path: '/api/users/{id}',
      title: 'Get User by ID',
      description: 'Retrieve a specific user by their unique identifier',
      category: 'Users',
      requiresAuth: true,
      parameters: [
        {
          name: 'id',
          in: 'path',
          type: 'string',
          required: true,
          description: 'User unique identifier (UUID)',
          example: '123e4567-e89b-12d3-a456-426614174000'
        }
      ],
      responses: [
        {
          statusCode: 200,
          description: 'User found',
          example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            displayName: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
            isActive: true,
            createdAt: '2025-01-01T12:00:00Z',
            updatedAt: '2025-01-05T09:15:00Z'
          }
        },
        {
          statusCode: 404,
          description: 'User not found',
          example: {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
            title: 'Resource not found',
            status: 404,
            detail: 'User with ID \'123e4567-e89b-12d3-a456-426614174000\' was not found'
          }
        }
      ],
      tags: ['Users', 'Retrieval'],
      example: {
        curl: `curl -X GET http://localhost:5000/api/users/123e4567-e89b-12d3-a456-426614174000 \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`,
        javascript: `const response = await fetch('/api/users/123e4567-e89b-12d3-a456-426614174000', {
  headers: {
    'Authorization': 'Bearer ' + accessToken
  }
});`,
        csharp: `var userId = Guid.Parse("123e4567-e89b-12d3-a456-426614174000");
var response = await httpClient.GetAsync($"/api/users/{userId}");
var user = await response.Content.ReadFromJsonAsync<UserDto>();`,
        python: `user_id = '123e4567-e89b-12d3-a456-426614174000'
response = requests.get(f'/api/users/{user_id}', headers=headers)`
      }
    }
  ]

  // Authentication flow steps
  const authSteps: AuthFlowStep[] = [
    {
      id: 'login',
      title: '1. User Login',
      description: 'Authenticate with credentials to receive JWT tokens',
      type: 'login',
      endpoint: '/api/auth/login',
      method: 'POST',
      requestExample: {
        email: 'admin@modernapi.dev',
        password: 'SecurePass123!',
        rememberMe: true
      },
      responseExample: {
        accessToken: 'eyJhbGciOiJIUzI1NiIs...',
        refreshToken: 'dGhpcyBpcyBhIHJlZnJlc2g...',
        user: { id: '123...', email: 'admin@modernapi.dev' },
        expiresIn: 900
      },
      explanation: 'The login endpoint validates credentials and returns JWT tokens. The access token (15 min) is used for API requests, while the refresh token (7 days) allows getting new access tokens.',
      securityFeatures: [
        'Password hashing with BCrypt',
        'Rate limiting on login attempts', 
        'JWT tokens with expiration',
        'HTTP-only cookies for token storage',
        'CORS protection'
      ]
    },
    {
      id: 'protected-request',
      title: '2. Protected API Request',
      description: 'Use access token to call protected endpoints',
      type: 'protected-request',
      endpoint: '/api/users',
      method: 'GET',
      requestExample: {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...',
          'Content-Type': 'application/json'
        }
      },
      responseExample: {
        data: [{ id: '123...', email: 'user@example.com' }],
        pagination: { page: 1, totalItems: 10 }
      },
      explanation: 'Protected endpoints require a valid JWT token in the Authorization header. The token is validated on each request and contains user claims.',
      securityFeatures: [
        'JWT token validation',
        'Claims-based authorization',
        'Role-based access control',
        'Token expiration checking',
        'Secure token transmission'
      ]
    },
    {
      id: 'refresh',
      title: '3. Token Refresh',
      description: 'Refresh expired access token using refresh token',
      type: 'refresh',
      endpoint: '/api/auth/refresh',
      method: 'POST',
      requestExample: {
        refreshToken: 'dGhpcyBpcyBhIHJlZnJlc2g...'
      },
      responseExample: {
        accessToken: 'eyJhbGciOiJIUzI1NiIs...',
        refreshToken: 'bmV3IHJlZnJlc2ggdG9rZW4...',
        expiresIn: 900
      },
      explanation: 'When the access token expires, use the refresh token to get a new access token without re-authentication. This provides seamless user experience.',
      securityFeatures: [
        'Refresh token rotation',
        'Token family validation',
        'Automatic cleanup of expired tokens',
        'Single-use refresh tokens',
        'Refresh token expiration'
      ]
    },
    {
      id: 'logout',
      title: '4. Secure Logout',
      description: 'Invalidate tokens and clear session',
      type: 'logout',
      endpoint: '/api/auth/logout',
      method: 'POST',
      requestExample: {
        refreshToken: 'dGhpcyBpcyBhIHJlZnJlc2g...'
      },
      responseExample: {
        success: true,
        message: 'Logged out successfully'
      },
      explanation: 'Proper logout invalidates the refresh token on the server and clears client-side tokens, preventing token reuse.',
      securityFeatures: [
        'Server-side token invalidation',
        'Client-side token cleanup',
        'Session termination',
        'Audit logging',
        'Secure cookie clearing'
      ]
    }
  ]

  // Error scenarios
  const errorScenarios: ErrorScenario[] = [
    {
      id: 'validation-error',
      title: 'Validation Error (400)',
      description: 'Request data fails validation rules',
      statusCode: 400,
      errorType: 'ValidationException',
      problemDetails: {
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
        title: 'One or more validation errors occurred',
        status: 400,
        errors: {
          'Email': ['Email is required', 'Email format is invalid'],
          'Password': ['Password must be at least 6 characters']
        },
        requestId: '0HMVBP9JK9J6C:00000001',
        timestamp: '2025-08-08T01:30:00.123Z'
      },
      resolution: 'Fix validation errors in request data and retry',
      preventionTips: [
        'Validate input on client side before sending',
        'Use proper data types and formats',
        'Check required field constraints',
        'Follow API documentation schemas'
      ]
    },
    {
      id: 'unauthorized-error',
      title: 'Unauthorized (401)',
      description: 'Missing or invalid authentication token',
      statusCode: 401,
      errorType: 'UnauthorizedException',
      problemDetails: {
        type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
        title: 'Unauthorized',
        status: 401,
        detail: 'Access token is missing or invalid',
        requestId: '0HMVBP9JK9J6C:00000002',
        timestamp: '2025-08-08T01:30:00.123Z'
      },
      resolution: 'Obtain valid access token through login or refresh',
      preventionTips: [
        'Always include Authorization header for protected endpoints',
        'Handle token expiration gracefully',
        'Implement automatic token refresh',
        'Validate token format before sending'
      ]
    },
    {
      id: 'not-found-error',
      title: 'Not Found (404)',
      description: 'Requested resource does not exist',
      statusCode: 404,
      errorType: 'NotFoundException',
      problemDetails: {
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
        title: 'Resource not found',
        status: 404,
        detail: 'User with ID \'123e4567-e89b-12d3-a456-426614174000\' was not found',
        requestId: '0HMVBP9JK9J6C:00000003',
        timestamp: '2025-08-08T01:30:00.123Z'
      },
      resolution: 'Verify resource ID exists before making request',
      preventionTips: [
        'Validate resource IDs before API calls',
        'Handle 404 responses gracefully in UI',
        'Implement resource existence checks',
        'Use proper error boundaries'
      ]
    },
    {
      id: 'conflict-error',
      title: 'Conflict (409)',
      description: 'Business rule violation or resource conflict',
      statusCode: 409,
      errorType: 'ConflictException',
      problemDetails: {
        type: 'https://modernapi.example.com/problems/domain/email_already_exists',
        title: 'Business rule violation',
        status: 409,
        detail: 'A user with email john.doe@example.com already exists',
        errorCode: 'EMAIL_ALREADY_EXISTS',
        requestId: '0HMVBP9JK9J6C:00000004',
        timestamp: '2025-08-08T01:30:00.123Z'
      },
      resolution: 'Resolve business constraint violation and retry',
      preventionTips: [
        'Check for existing resources before creation',
        'Implement unique constraint validation',
        'Handle business rule violations gracefully',
        'Provide clear error messages to users'
      ]
    },
    {
      id: 'server-error',
      title: 'Internal Server Error (500)',
      description: 'Unexpected server-side error occurred',
      statusCode: 500,
      errorType: 'InternalServerError',
      problemDetails: {
        type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
        title: 'An error occurred while processing your request',
        status: 500,
        detail: 'An unexpected error occurred. Please try again later.',
        requestId: '0HMVBP9JK9J6C:00000005',
        timestamp: '2025-08-08T01:30:00.123Z'
      },
      resolution: 'Retry request or contact support with request ID',
      preventionTips: [
        'Implement proper error handling',
        'Use circuit breaker patterns',
        'Monitor application health',
        'Set up alerting for server errors'
      ]
    }
  ]

  // Mock OpenAPI spec
  const openApiSpec: OpenAPISpec = {
    openapi: '3.0.1',
    info: {
      title: 'ModernAPI',
      version: '1.0.0',
      description: 'A modern .NET 9 API with Clean Architecture, Domain-Driven Design, and comprehensive testing'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.modernapi.dev',
        description: 'Production server'
      }
    ],
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'User Login',
          operationId: 'login',
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/problem+json': {
                  schema: { $ref: '#/components/schemas/ProblemDetails' }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        LoginRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
            rememberMe: { type: 'boolean' }
          },
          required: ['email', 'password']
        },
        AuthResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            user: { $ref: '#/components/schemas/UserDto' },
            expiresIn: { type: 'integer' }
          }
        },
        UserDto: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            displayName: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            isActive: { type: 'boolean' }
          }
        },
        ProblemDetails: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            title: { type: 'string' },
            status: { type: 'integer' },
            detail: { type: 'string' },
            requestId: { type: 'string' }
          }
        }
      },
      securitySchemes: {
        Bearer: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }

  const categories = ['all', ...Array.from(new Set(endpoints.map(e => e.category)))]
  const filteredEndpoints = selectedCategory === 'all' 
    ? endpoints 
    : endpoints.filter(e => e.category === selectedCategory)

  const executeRequest = async () => {
    if (!selectedEndpoint) return

    setIsLoading(true)
    const startTime = Date.now()

    try {
      // Build URL with path parameters
      let url = `${requestState.url}${selectedEndpoint.path}`
      Object.entries(requestState.pathParams).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, encodeURIComponent(value))
      })

      // Add query parameters
      const queryString = new URLSearchParams(requestState.queryParams).toString()
      if (queryString) {
        url += `?${queryString}`
      }

      // Prepare headers
      const headers = { ...requestState.headers }
      if (selectedEndpoint.requiresAuth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      // Prepare request options
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers,
      }

      if (selectedEndpoint.method !== 'GET' && requestState.body) {
        options.body = requestState.body
      }

      // Make request (simulated)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
      
      const duration = Date.now() - startTime
      const mockResponse = selectedEndpoint.responses[0] // Use first response as success
      
      setResponseState({
        status: mockResponse.statusCode,
        statusText: mockResponse.statusCode === 200 ? 'OK' : 
                   mockResponse.statusCode === 201 ? 'Created' :
                   mockResponse.statusCode === 401 ? 'Unauthorized' :
                   mockResponse.statusCode === 404 ? 'Not Found' : 'Error',
        headers: {
          'Content-Type': mockResponse.contentType || 'application/json',
          'X-Request-ID': `REQ-${Date.now()}`,
          'X-RateLimit-Remaining': '99'
        },
        body: JSON.stringify(mockResponse.example, null, 2),
        duration,
        size: JSON.stringify(mockResponse.example).length,
        timestamp: new Date()
      })

    } catch (error) {
      const duration = Date.now() - startTime
      setResponseState({
        status: 0,
        statusText: 'Network Error',
        error: error instanceof Error ? error.message : 'Request failed',
        duration,
        timestamp: new Date()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectEndpoint = (endpoint: APIPlaygroundEndpoint) => {
    setSelectedEndpoint(endpoint)
    setRequestState(prev => ({
      ...prev,
      endpoint,
      method: endpoint.method,
      body: endpoint.requestBody ? JSON.stringify(endpoint.requestBody.example, null, 2) : '',
      pathParams: {},
      queryParams: {}
    }))
    setResponseState({})
  }

  const updateRequestHeader = (key: string, value: string) => {
    setRequestState(prev => ({
      ...prev,
      headers: { ...prev.headers, [key]: value }
    }))
  }

  const addRequestHeader = () => {
    const key = `Custom-Header-${Object.keys(requestState.headers).length + 1}`
    updateRequestHeader(key, '')
  }

  const removeRequestHeader = (key: string) => {
    setRequestState(prev => {
      const { [key]: removed, ...headers } = prev.headers
      return { ...prev, headers }
    })
  }

  const updateQueryParam = (key: string, value: string) => {
    setRequestState(prev => ({
      ...prev,
      queryParams: { ...prev.queryParams, [key]: value }
    }))
  }

  const updatePathParam = (key: string, value: string) => {
    setRequestState(prev => ({
      ...prev,
      pathParams: { ...prev.pathParams, [key]: value }
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-muted-foreground'
    if (status >= 200 && status < 300) return 'text-green-600'
    if (status >= 300 && status < 400) return 'text-blue-600'
    if (status >= 400 && status < 500) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">API Playground & Testing</h1>
            <p className="text-muted-foreground">
              Interactive REST API exploration with real examples and comprehensive documentation
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="gap-1">
            <Terminal className="w-3 h-3" />
            {endpoints.length} Endpoints
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Shield className="w-3 h-3" />
            JWT Authentication
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <FileText className="w-3 h-3" />
            OpenAPI 3.0
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="playground" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="playground">API Playground</TabsTrigger>
          <TabsTrigger value="auth-flow">Auth Flow</TabsTrigger>
          <TabsTrigger value="error-handling">Error Handling</TabsTrigger>
          <TabsTrigger value="openapi">OpenAPI Spec</TabsTrigger>
          <TabsTrigger value="code-gen">Code Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="playground" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Side - Endpoint Explorer */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Endpoint Explorer
                  </CardTitle>
                  <CardDescription>
                    Browse and test API endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label>Filter by Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category === 'all' ? 'All Categories' : category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Endpoints List */}
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {filteredEndpoints.map(endpoint => (
                        <div
                          key={endpoint.id}
                          className={cn(
                            'p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm',
                            selectedEndpoint?.id === endpoint.id && 'ring-2 ring-primary border-primary/50 bg-primary/5'
                          )}
                          onClick={() => selectEndpoint(endpoint)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={
                                  endpoint.method === 'GET' ? 'default' :
                                  endpoint.method === 'POST' ? 'secondary' :
                                  endpoint.method === 'PUT' ? 'outline' :
                                  endpoint.method === 'DELETE' ? 'destructive' : 'default'
                                }
                                className="text-xs font-mono"
                              >
                                {endpoint.method}
                              </Badge>
                              {endpoint.requiresAuth && (
                                <Lock className="w-3 h-3 text-yellow-500" />
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {endpoint.category}
                            </Badge>
                          </div>
                          
                          <h4 className="font-medium text-sm mb-1">{endpoint.title}</h4>
                          <code className="text-xs text-muted-foreground font-mono">
                            {endpoint.path}
                          </code>
                          <p className="text-xs text-muted-foreground mt-2">
                            {endpoint.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {endpoint.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Center - Request Builder */}
            <div className="space-y-4">
              {selectedEndpoint ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Request Builder
                      </CardTitle>
                      <CardDescription>
                        Configure and send API request
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Request URL */}
                      <div className="space-y-2">
                        <Label>Request URL</Label>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="font-mono">
                            {selectedEndpoint.method}
                          </Badge>
                          <Input
                            value={`${requestState.url}${selectedEndpoint.path}`}
                            onChange={(e) => setRequestState(prev => ({ ...prev, url: e.target.value.replace(selectedEndpoint.path, '') }))}
                            className="font-mono"
                          />
                        </div>
                      </div>

                      {/* Path Parameters */}
                      {selectedEndpoint.parameters?.filter(p => p.in === 'path').length > 0 && (
                        <div className="space-y-2">
                          <Label>Path Parameters</Label>
                          {selectedEndpoint.parameters.filter(p => p.in === 'path').map(param => (
                            <div key={param.name} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Label className="text-xs font-mono">{param.name}</Label>
                                {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                              </div>
                              <Input
                                placeholder={param.example?.toString() || param.description}
                                value={requestState.pathParams[param.name] || ''}
                                onChange={(e) => updatePathParam(param.name, e.target.value)}
                                className="font-mono text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Query Parameters */}
                      {selectedEndpoint.parameters?.filter(p => p.in === 'query').length > 0 && (
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
                            <ChevronRight className="w-4 h-4" />
                            Query Parameters
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-2 mt-2">
                            {selectedEndpoint.parameters.filter(p => p.in === 'query').map(param => (
                              <div key={param.name} className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs font-mono">{param.name}</Label>
                                  {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                </div>
                                <Input
                                  placeholder={param.example?.toString() || param.description}
                                  value={requestState.queryParams[param.name] || ''}
                                  onChange={(e) => updateQueryParam(param.name, e.target.value)}
                                  className="font-mono text-sm"
                                />
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      {/* Request Headers */}
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
                          <ChevronRight className="w-4 h-4" />
                          Headers ({Object.keys(requestState.headers).length})
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 mt-2">
                          {/* Auth Token */}
                          {selectedEndpoint.requiresAuth && (
                            <div className="space-y-2 p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
                              <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-yellow-600" />
                                <Label className="text-sm font-medium">Authentication Required</Label>
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  type={showAuthHeaders ? 'text' : 'password'}
                                  placeholder="Enter JWT access token"
                                  value={authToken}
                                  onChange={(e) => setAuthToken(e.target.value)}
                                  className="font-mono text-xs"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowAuthHeaders(!showAuthHeaders)}
                                >
                                  {showAuthHeaders ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Headers */}
                          {Object.entries(requestState.headers).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <Input
                                value={key}
                                onChange={(e) => {
                                  const newHeaders = { ...requestState.headers }
                                  delete newHeaders[key]
                                  newHeaders[e.target.value] = value
                                  setRequestState(prev => ({ ...prev, headers: newHeaders }))
                                }}
                                className="font-mono text-sm"
                              />
                              <Input
                                value={value}
                                onChange={(e) => updateRequestHeader(key, e.target.value)}
                                className="font-mono text-sm"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRequestHeader(key)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          
                          <Button variant="outline" size="sm" onClick={addRequestHeader}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Header
                          </Button>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Request Body */}
                      {selectedEndpoint.requestBody && (
                        <div className="space-y-2">
                          <Label>Request Body</Label>
                          <div className="space-y-2">
                            <Select value={requestState.bodyType} onValueChange={(value: any) => setRequestState(prev => ({ ...prev, bodyType: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="json">JSON</SelectItem>
                                <SelectItem value="form">Form Data</SelectItem>
                                <SelectItem value="text">Plain Text</SelectItem>
                              </SelectContent>
                            </Select>
                            <Textarea
                              value={requestState.body}
                              onChange={(e) => setRequestState(prev => ({ ...prev, body: e.target.value }))}
                              rows={8}
                              className="font-mono text-sm"
                              placeholder={selectedEndpoint.requestBody.description}
                            />
                          </div>
                        </div>
                      )}

                      {/* Send Button */}
                      <Button 
                        onClick={executeRequest} 
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Activity className="w-4 h-4 mr-2 animate-spin" />
                            Sending Request...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Request
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select an Endpoint</h3>
                    <p className="text-muted-foreground">
                      Choose an API endpoint from the explorer to start building your request
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Side - Response Viewer */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Response Viewer
                  </CardTitle>
                  <CardDescription>
                    API response details and data formatting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {responseState.status ? (
                    <>
                      {/* Response Status */}
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-3 h-3 rounded-full',
                            responseState.status >= 200 && responseState.status < 300 ? 'bg-green-500' :
                            responseState.status >= 400 ? 'bg-red-500' : 'bg-yellow-500'
                          )} />
                          <span className={cn('font-medium', getStatusColor(responseState.status))}>
                            {responseState.status} {responseState.statusText}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {responseState.duration}ms
                        </div>
                      </div>

                      {/* Response Headers */}
                      {responseState.headers && (
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
                            <ChevronRight className="w-4 h-4" />
                            Response Headers ({Object.keys(responseState.headers).length})
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-1 mt-2">
                            {Object.entries(responseState.headers).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-xs font-mono p-2 bg-muted/50 rounded">
                                <span className="text-muted-foreground">{key}:</span>
                                <span>{value}</span>
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      {/* Response Body */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Response Body</Label>
                          <div className="flex items-center gap-2">
                            {responseState.size && (
                              <span className="text-xs text-muted-foreground">
                                {responseState.size} bytes
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(responseState.body || '')}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <ScrollArea className="h-64 w-full">
                          <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                            <code>
                              {responseState.error || responseState.body || 'No response body'}
                            </code>
                          </pre>
                        </ScrollArea>
                      </div>

                      {/* Response Metadata */}
                      {responseState.timestamp && (
                        <div className="text-xs text-muted-foreground border-t pt-3">
                          Request completed at {responseState.timestamp.toLocaleTimeString()}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-8 text-center">
                      <Terminal className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Response Yet</h3>
                      <p className="text-muted-foreground">
                        Send a request to see the response details
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expected Response */}
              {selectedEndpoint && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Expected Responses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedEndpoint.responses.map(response => (
                      <div key={response.statusCode} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant={
                              response.statusCode >= 200 && response.statusCode < 300 ? 'default' :
                              response.statusCode >= 400 ? 'destructive' : 'secondary'
                            }
                          >
                            {response.statusCode}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{response.description}</span>
                        </div>
                        {response.example && (
                          <ScrollArea className="h-24 w-full">
                            <pre className="text-xs bg-muted/50 p-2 rounded font-mono">
                              <code>{JSON.stringify(response.example, null, 2)}</code>
                            </pre>
                          </ScrollArea>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="auth-flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Authentication Flow Demonstration
              </CardTitle>
              <CardDescription>
                Interactive walkthrough of JWT authentication and authorization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auth Flow Steps */}
              <div className="grid gap-4">
                {authSteps.map((step, index) => (
                  <div key={step.id} className="relative">
                    {index < authSteps.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
                    )}
                    
                    <Card className={cn(
                      'cursor-pointer transition-all',
                      selectedAuthStep === step.id && 'ring-2 ring-primary border-primary/50'
                    )}>
                      <CardHeader onClick={() => setSelectedAuthStep(selectedAuthStep === step.id ? null : step.id)}>
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                            step.type === 'login' && 'bg-blue-100 text-blue-600',
                            step.type === 'protected-request' && 'bg-green-100 text-green-600',
                            step.type === 'refresh' && 'bg-orange-100 text-orange-600',
                            step.type === 'logout' && 'bg-red-100 text-red-600'
                          )}>
                            {step.type === 'login' && <Key className="w-5 h-5" />}
                            {step.type === 'protected-request' && <Lock className="w-5 h-5" />}
                            {step.type === 'refresh' && <RotateCcw className="w-5 h-5" />}
                            {step.type === 'logout' && <Unlock className="w-5 h-5" />}
                          </div>
                          
                          <div className="flex-1">
                            <CardTitle className="text-lg">{step.title}</CardTitle>
                            <CardDescription>{step.description}</CardDescription>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="font-mono">
                                {step.method}
                              </Badge>
                              <code className="text-sm text-muted-foreground">{step.endpoint}</code>
                            </div>
                          </div>
                          
                          <ChevronDown className={cn(
                            'w-5 h-5 transition-transform',
                            selectedAuthStep === step.id && 'rotate-180'
                          )} />
                        </div>
                      </CardHeader>
                      
                      {selectedAuthStep === step.id && (
                        <CardContent className="space-y-4 border-t">
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Request Example */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Request Example</Label>
                              <ScrollArea className="h-32 w-full">
                                <pre className="text-xs bg-muted p-3 rounded font-mono">
                                  <code>{JSON.stringify(step.requestExample, null, 2)}</code>
                                </pre>
                              </ScrollArea>
                            </div>
                            
                            {/* Response Example */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Response Example</Label>
                              <ScrollArea className="h-32 w-full">
                                <pre className="text-xs bg-muted p-3 rounded font-mono">
                                  <code>{JSON.stringify(step.responseExample, null, 2)}</code>
                                </pre>
                              </ScrollArea>
                            </div>
                          </div>
                          
                          {/* Explanation */}
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>How it works</AlertTitle>
                            <AlertDescription className="text-sm">
                              {step.explanation}
                            </AlertDescription>
                          </Alert>
                          
                          {/* Security Features */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Security Features</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {step.securityFeatures.map(feature => (
                                <div key={feature} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="error-handling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Error Handling & Problem Details
              </CardTitle>
              <CardDescription>
                Learn about RFC 7807 Problem Details and error scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Scenarios */}
              <div className="grid gap-4">
                {errorScenarios.map(scenario => (
                  <Card 
                    key={scenario.id}
                    className={cn(
                      'cursor-pointer transition-all',
                      selectedErrorScenario === scenario.id && 'ring-2 ring-primary border-primary/50',
                      scenario.statusCode >= 400 && scenario.statusCode < 500 && 'border-l-4 border-l-yellow-500',
                      scenario.statusCode >= 500 && 'border-l-4 border-l-red-500'
                    )}
                  >
                    <CardHeader onClick={() => setSelectedErrorScenario(selectedErrorScenario === scenario.id ? null : scenario.id)}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant={
                                scenario.statusCode >= 400 && scenario.statusCode < 500 ? 'secondary' :
                                scenario.statusCode >= 500 ? 'destructive' : 'default'
                              }
                              className="font-mono"
                            >
                              {scenario.statusCode}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{scenario.errorType}</span>
                          </div>
                          <CardTitle className="text-lg">{scenario.title}</CardTitle>
                          <CardDescription>{scenario.description}</CardDescription>
                        </div>
                        <ChevronDown className={cn(
                          'w-5 h-5 transition-transform',
                          selectedErrorScenario === scenario.id && 'rotate-180'
                        )} />
                      </div>
                    </CardHeader>
                    
                    {selectedErrorScenario === scenario.id && (
                      <CardContent className="space-y-4 border-t">
                        {/* Problem Details Response */}
                        <div>
                          <Label className="text-sm font-medium mb-2 block">RFC 7807 Problem Details Response</Label>
                          <ScrollArea className="h-48 w-full">
                            <pre className="text-xs bg-muted p-4 rounded font-mono">
                              <code>{JSON.stringify(scenario.problemDetails, null, 2)}</code>
                            </pre>
                          </ScrollArea>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Resolution */}
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Resolution</AlertTitle>
                            <AlertDescription className="text-sm">
                              {scenario.resolution}
                            </AlertDescription>
                          </Alert>
                          
                          {/* Prevention Tips */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Prevention Tips</Label>
                            <ul className="space-y-1">
                              {scenario.preventionTips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
              
              {/* Error Handling Best Practices */}
              <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertTitle>Error Handling Best Practices</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>ModernAPI implements comprehensive error handling following RFC 7807 Problem Details standard:</p>
                  <ul className="space-y-1 mt-2 text-sm">
                    <li>• Consistent error response format across all endpoints</li>
                    <li>• Request correlation IDs for debugging and support</li>
                    <li>• Security-aware error messages (no sensitive data exposure)</li>
                    <li>• Structured logging with full context</li>
                    <li>• Client-friendly error codes and descriptions</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="openapi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                OpenAPI 3.0 Specification
              </CardTitle>
              <CardDescription>
                Interactive OpenAPI spec viewer with schema exploration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">API Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Title</Label>
                      <p className="text-sm">{openApiSpec.info.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Version</Label>
                      <p className="text-sm">{openApiSpec.info.version}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm">{openApiSpec.info.description}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Servers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {openApiSpec.servers.map((server, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <code className="text-sm font-mono">{server.url}</code>
                        <p className="text-xs text-muted-foreground mt-1">{server.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              
              {/* OpenAPI Spec Viewer */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-medium">Complete OpenAPI Specification</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(openApiSpec, null, 2))}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Spec
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-96 w-full">
                  <pre className="text-xs bg-muted p-4 rounded-lg font-mono">
                    <code>{JSON.stringify(openApiSpec, null, 2)}</code>
                  </pre>
                </ScrollArea>
              </div>
              
              {/* Schema Components */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Schema Components</CardTitle>
                  <CardDescription>
                    Reusable data models and security schemes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(openApiSpec.components.schemas).map(([name, schema]) => (
                    <Collapsible key={name}>
                      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium p-3 border rounded-lg w-full hover:bg-muted/50">
                        <ChevronRight className="w-4 h-4" />
                        <code>{name}</code>
                        <Badge variant="outline" className="ml-auto">Schema</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <ScrollArea className="h-32 w-full">
                          <pre className="text-xs bg-muted p-3 rounded font-mono">
                            <code>{JSON.stringify(schema, null, 2)}</code>
                          </pre>
                        </ScrollArea>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code-gen" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Code Generation Examples
              </CardTitle>
              <CardDescription>
                Generate client code in multiple programming languages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedEndpoint ? (
                <>
                  {/* Language Selector */}
                  <div className="flex items-center gap-4">
                    <Label>Select Language:</Label>
                    <div className="flex gap-2">
                      {(['curl', 'javascript', 'csharp', 'python'] as const).map(lang => (
                        <Button
                          key={lang}
                          variant={codeLanguage === lang ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCodeLanguage(lang)}
                          className="capitalize"
                        >
                          {lang === 'curl' ? 'cURL' : 
                           lang === 'csharp' ? 'C#' : 
                           lang === 'javascript' ? 'JavaScript' : 'Python'}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Code Example */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg capitalize">
                          {codeLanguage === 'curl' ? 'cURL' : 
                           codeLanguage === 'csharp' ? 'C#' : 
                           codeLanguage === 'javascript' ? 'JavaScript' : 'Python'} Example
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(selectedEndpoint.example[codeLanguage])}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Code
                        </Button>
                      </div>
                      <CardDescription>
                        {selectedEndpoint.method} {selectedEndpoint.path} - {selectedEndpoint.title}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64 w-full">
                        <pre className="text-sm bg-muted p-4 rounded-lg font-mono overflow-x-auto">
                          <code>{selectedEndpoint.example[codeLanguage]}</code>
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                  
                  {/* Additional Examples */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Error Handling</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-32 w-full">
                          <pre className="text-xs bg-muted p-3 rounded font-mono">
                            <code>
                              {codeLanguage === 'javascript' ? 
                                `try {
  const response = await fetch('/api/users', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }
  
  const data = await response.json();
} catch (error) {
  console.error('API Error:', error.message);
}` :
                                codeLanguage === 'csharp' ?
                                `try
{
    var response = await httpClient.GetAsync("/api/users");
    response.EnsureSuccessStatusCode();
    var users = await response.Content.ReadFromJsonAsync<List<UserDto>>();
}
catch (HttpRequestException ex)
{
    // Handle HTTP errors
    Console.WriteLine($"Error: {ex.Message}");
}` :
                                codeLanguage === 'python' ?
                                `try:
    response = requests.get('/api/users', headers=headers)
    response.raise_for_status()
    data = response.json()
except requests.exceptions.HTTPError as e:
    print(f"HTTP Error: {e}")
except requests.exceptions.RequestException as e:
    print(f"Request Error: {e}")` :
                                `# Error handling with curl
curl -X GET http://localhost:5000/api/users \\
  -H "Authorization: Bearer $TOKEN" \\
  -w "\\nHTTP Status: %{http_code}\\n" \\
  -s --fail || echo "Request failed"`
                              }
                            </code>
                          </pre>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Response Processing</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-32 w-full">
                          <pre className="text-xs bg-muted p-3 rounded font-mono">
                            <code>
                              {codeLanguage === 'javascript' ? 
                                `// Process paginated response
const { data, pagination } = await response.json();

console.log(\`Found \${pagination.totalItems} users\`);
data.forEach(user => {
  console.log(\`User: \${user.displayName} (\${user.email})\`);
});

// Handle pagination
if (pagination.hasNextPage) {
  // Load next page
}` :
                                codeLanguage === 'csharp' ?
                                `var result = await response.Content.ReadFromJsonAsync<PagedResult<UserDto>>();

Console.WriteLine($"Found {result.Pagination.TotalItems} users");

foreach (var user in result.Data)
{
    Console.WriteLine($"User: {user.DisplayName} ({user.Email})");
}

// Handle pagination
if (result.Pagination.HasNextPage)
{
    // Load next page
}` :
                                codeLanguage === 'python' ?
                                `result = response.json()
data = result['data']
pagination = result['pagination']

print(f"Found {pagination['totalItems']} users")

for user in data:
    print(f"User: {user['displayName']} ({user['email']})")

# Handle pagination  
if pagination['hasNextPage']:
    # Load next page
    pass` :
                                `# Process JSON response with jq
curl -X GET http://localhost:5000/api/users \\
  -H "Authorization: Bearer $TOKEN" \\
  | jq '.data[] | "User: \\(.displayName) (\\(.email))"'

# Extract pagination info
curl -X GET http://localhost:5000/api/users \\
  -H "Authorization: Bearer $TOKEN" \\
  | jq '.pagination | "Page \\(.page) of \\(.totalPages)"'`
                              }
                            </code>
                          </pre>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Select an Endpoint</AlertTitle>
                  <AlertDescription>
                    Choose an API endpoint from the playground tab to see code generation examples in multiple languages.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Module Navigation */}
      <ModuleNavigation moduleId="api-playground" />
    </div>
  )
}