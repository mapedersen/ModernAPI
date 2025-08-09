import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Code, Database, Server, Shield, ExternalLink } from 'lucide-react'

export const Route = createFileRoute('/docs/reference/api')({
  component: APIReferenceComponent,
})

function APIReferenceComponent() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Code className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">API Documentation</h1>
            <p className="text-muted-foreground">Complete API reference with live testing capabilities</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Reference</Badge>
          <Badge variant="outline">Beginner</Badge>
          <span className="text-sm text-muted-foreground">• 15 min read</span>
        </div>
      </div>

      <div className="grid gap-6">
        {/* API Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              API Overview
            </CardTitle>
            <CardDescription>
              The ModernAPI template provides a comprehensive RESTful API built with ASP.NET Core 9, 
              featuring Clean Architecture patterns and enterprise-grade security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <code className="text-sm">
                Base URL: <span className="text-primary">https://localhost:5051/api</span>
              </code>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">API Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• RESTful design principles</li>
                  <li>• JWT authentication</li>
                  <li>• OpenAPI/Swagger documentation</li>
                  <li>• Rate limiting</li>
                  <li>• Request validation</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Response Format</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• JSON responses</li>
                  <li>• RFC 7807 Problem Details</li>
                  <li>• Consistent error handling</li>
                  <li>• CORS enabled</li>
                  <li>• Content negotiation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Available Endpoints
            </CardTitle>
            <CardDescription>
              Core API endpoints for user management and authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auth Endpoints */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Authentication
              </h4>
              <div className="space-y-3">
                {[
                  { method: 'POST', path: '/auth/login', description: 'Authenticate user and get JWT token' },
                  { method: 'POST', path: '/auth/refresh', description: 'Refresh JWT token' },
                  { method: 'POST', path: '/auth/logout', description: 'Logout and invalidate tokens' }
                ].map((endpoint) => (
                  <div key={endpoint.path} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'} className="font-mono text-xs">
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                    <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* User Endpoints */}
            <div>
              <h4 className="font-medium mb-3">User Management</h4>
              <div className="space-y-3">
                {[
                  { method: 'GET', path: '/users', description: 'Get all users (paginated)' },
                  { method: 'GET', path: '/users/{id}', description: 'Get user by ID' },
                  { method: 'PUT', path: '/users/{id}', description: 'Update user profile' },
                  { method: 'DELETE', path: '/users/{id}', description: 'Deactivate user account' }
                ].map((endpoint) => (
                  <div key={endpoint.path} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'} className="font-mono text-xs">
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                    <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive API Testing</CardTitle>
            <CardDescription>
              Test the API endpoints directly from your development environment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Scalar UI (Development)</h4>
              <p className="text-sm text-muted-foreground">
                Interactive API documentation with live testing capabilities
              </p>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Open Scalar UI
              </Button>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Postman Collection</h4>
              <p className="text-sm text-muted-foreground">
                Pre-configured requests for all API endpoints
              </p>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Download Collection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Authentication Guide
            </CardTitle>
            <CardDescription>
              How to authenticate and make authorized requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">1. Login Request</h4>
                <div className="bg-muted rounded-lg p-3">
                  <pre className="text-sm"><code>{`POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@modernapi.dev",
  "password": "AdminPassword123!"
}`}</code></pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">2. Use JWT Token</h4>
                <div className="bg-muted rounded-lg p-3">
                  <pre className="text-sm"><code>{`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}</code></pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}