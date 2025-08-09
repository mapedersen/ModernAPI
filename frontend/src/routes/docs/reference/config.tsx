import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Settings, Database, Shield, Server, AlertTriangle } from 'lucide-react'

export const Route = createFileRoute('/docs/reference/config')({
  component: ConfigurationReferenceComponent,
})

function ConfigurationReferenceComponent() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Configuration Reference</h1>
            <p className="text-muted-foreground">Complete configuration options and environment setup</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Reference</Badge>
          <Badge variant="outline">Beginner</Badge>
          <span className="text-sm text-muted-foreground">• 8 min read</span>
        </div>
      </div>

      <Tabs defaultValue="appsettings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appsettings">App Settings</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="jwt">JWT & Security</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
        </TabsList>

        <TabsContent value="appsettings" className="space-y-6">
          {/* Main Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                appsettings.json Structure
              </CardTitle>
              <CardDescription>
                Core application configuration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm"><code>{`{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=modernapi_dev;Username=postgres;Password=postgres"
  },
  "JwtSettings": {
    "Secret": "your-super-secure-jwt-secret-key-here-at-least-256-bits",
    "Issuer": "ModernAPI",
    "Audience": "ModernAPI.Client",
    "ExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 30
  },
  "CorsSettings": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001"
    ],
    "AllowCredentials": true
  },
  "RateLimitSettings": {
    "EnableRateLimiting": true,
    "PermitLimit": 100,
    "Window": "00:01:00",
    "QueueLimit": 10
  }
}`}</code></pre>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Note:</strong> Never commit sensitive configuration like JWT secrets or connection strings to version control. Use environment variables or secure configuration providers for production.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Environment-Specific Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Environment-Specific Configuration</CardTitle>
              <CardDescription>
                Different settings for Development, Staging, and Production
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-green-600">Development</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <pre className="text-xs"><code>{`// appsettings.Development.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug"
    }
  },
  "DetailedErrors": true,
  "ShowPII": true
}`}</code></pre>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-yellow-600">Staging</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <pre className="text-xs"><code>{`// appsettings.Staging.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  },
  "DetailedErrors": false,
  "ShowPII": false
}`}</code></pre>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-red-600">Production</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <pre className="text-xs"><code>{`// appsettings.Production.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning"
    }
  },
  "DetailedErrors": false,
  "ShowPII": false
}`}</code></pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          {/* Database Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Configuration
              </CardTitle>
              <CardDescription>
                PostgreSQL connection strings and Entity Framework settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Connection String Formats</h4>
                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">Local Development</Badge>
                    <div className="bg-muted rounded-lg p-3">
                      <code className="text-sm">Host=localhost;Database=modernapi_dev;Username=postgres;Password=postgres;Port=5432</code>
                    </div>
                  </div>
                  
                  <div>
                    <Badge variant="outline" className="mb-2">Docker Compose</Badge>
                    <div className="bg-muted rounded-lg p-3">
                      <code className="text-sm">Host=db;Database=modernapi;Username=postgres;Password=postgres;Port=5432</code>
                    </div>
                  </div>
                  
                  <div>
                    <Badge variant="outline" className="mb-2">Production (Azure)</Badge>
                    <div className="bg-muted rounded-lg p-3">
                      <code className="text-sm">Host=myserver.postgres.database.azure.com;Database=modernapi_prod;Username=admin@myserver;Password=&#123;password&#125;;Port=5432;SSL Mode=Require</code>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Entity Framework Options</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm"><code>{`{
  "EntityFramework": {
    "EnableSensitiveDataLogging": false,
    "EnableDetailedErrors": false,
    "CommandTimeout": 30,
    "MaxRetryCount": 3,
    "MaxRetryDelay": "00:00:30",
    "EnableServiceProviderCaching": true,
    "EnableQuerySplittingBehavior": true
  }
}`}</code></pre>
                </div>
              </div>
              
              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  <strong>Migration Note:</strong> Use environment variables for production connection strings. The template includes migration scripts for different environments.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Migration Commands */}
          <Card>
            <CardHeader>
              <CardTitle>Migration Commands</CardTitle>
              <CardDescription>
                Common Entity Framework Core migration operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Create Migration</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <code className="text-sm">dotnet ef migrations add MigrationName</code>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Apply Migration</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <code className="text-sm">dotnet ef database update</code>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Remove Migration</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <code className="text-sm">dotnet ef migrations remove</code>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Generate Script</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <code className="text-sm">dotnet ef migrations script</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jwt" className="space-y-6">
          {/* JWT Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                JWT & Security Settings
              </CardTitle>
              <CardDescription>
                Authentication and security configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">JWT Configuration</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm"><code>{`{
  "JwtSettings": {
    "Secret": "your-256-bit-secret-key-here-must-be-very-long-and-secure",
    "Issuer": "ModernAPI",
    "Audience": "ModernAPI.Client",
    "ExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 30,
    "ClockSkew": "00:05:00",
    "RequireHttpsMetadata": true,
    "SaveToken": true,
    "ValidateIssuer": true,
    "ValidateAudience": true,
    "ValidateLifetime": true,
    "ValidateIssuerSigningKey": true
  }
}`}</code></pre>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Security Headers</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• X-Content-Type-Options: nosniff</li>
                    <li>• X-Frame-Options: DENY</li>
                    <li>• X-XSS-Protection: 1; mode=block</li>
                    <li>• Strict-Transport-Security</li>
                    <li>• Content-Security-Policy</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">CORS Settings</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <pre className="text-xs"><code>{`{
  "CorsSettings": {
    "AllowedOrigins": [
      "https://app.modernapi.dev"
    ],
    "AllowedMethods": [
      "GET", "POST", "PUT", "DELETE"
    ],
    "AllowedHeaders": [
      "Content-Type", "Authorization"
    ],
    "AllowCredentials": true,
    "MaxAge": 86400
  }
}`}</code></pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limiting */}
          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting Configuration</CardTitle>
              <CardDescription>
                Control API request rates and prevent abuse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm"><code>{`{
  "RateLimitSettings": {
    "EnableRateLimiting": true,
    "PermitLimit": 100,
    "Window": "00:01:00",
    "QueueLimit": 10,
    "Policies": {
      "AuthPolicy": {
        "PermitLimit": 10,
        "Window": "00:01:00"
      },
      "ApiPolicy": {
        "PermitLimit": 1000,
        "Window": "00:15:00"
      }
    }
  }
}`}</code></pre>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-yellow-800 dark:text-yellow-200">Rate Limit Policies</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• <strong>AuthPolicy:</strong> Strict limits for authentication endpoints</li>
                  <li>• <strong>ApiPolicy:</strong> General API usage limits</li>
                  <li>• <strong>Anonymous:</strong> More restrictive for unauthenticated users</li>
                  <li>• <strong>Sliding Window:</strong> Prevents burst requests</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environment" className="space-y-6">
          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Production-ready environment configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Required Environment Variables</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm"><code>{`# Database
DATABASE_CONNECTION_STRING=Host=prod-db;Database=modernapi;Username=user;Password=secure-password

# JWT Security
JWT_SECRET=your-production-jwt-secret-must-be-very-long-and-secure-256-bits
JWT_ISSUER=ModernAPI.Production
JWT_AUDIENCE=ModernAPI.Client

# External Services
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
REDIS_CONNECTION_STRING=localhost:6379

# Monitoring
APPLICATION_INSIGHTS_CONNECTION_STRING=InstrumentationKey=your-key
SERILOG_MINIMUM_LEVEL=Warning

# Feature Flags
ENABLE_SWAGGER=false
ENABLE_DETAILED_ERRORS=false
ENABLE_PII_LOGGING=false`}</code></pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Docker Environment</h4>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm"><code>{`# docker-compose.yml environment section
environment:
  - ASPNETCORE_ENVIRONMENT=Production
  - DATABASE_CONNECTION_STRING=Host=db;Database=modernapi;Username=postgres;Password=postgres
  - JWT_SECRET=$&#123;JWT_SECRET&#125;
  - JWT_ISSUER=ModernAPI.Docker
  - CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80
  - ENABLE_SWAGGER=true`}</code></pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Validation */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration Validation</CardTitle>
              <CardDescription>
                Built-in validation for critical configuration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Startup Validation</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  The application validates critical configuration at startup and will fail to start if required settings are missing.
                </p>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm"><code>{`// Validated at startup
public class JwtSettings
{
    [Required]
    [MinLength(32)]
    public string Secret { get; set; } = string.Empty;
    
    [Required]
    public string Issuer { get; set; } = string.Empty;
    
    [Required]
    public string Audience { get; set; } = string.Empty;
    
    [Range(1, 1440)]
    public int ExpiryMinutes { get; set; } = 60;
}`}</code></pre>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">Common Configuration Errors</h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• JWT Secret too short (must be at least 256 bits)</li>
                  <li>• Missing database connection string</li>
                  <li>• Invalid CORS origins format</li>
                  <li>• Missing required environment variables in production</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}