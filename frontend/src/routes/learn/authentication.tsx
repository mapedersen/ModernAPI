import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { 
  Shield, 
  Lock, 
  Key, 
  Clock, 
  Server, 
  Cookie, 
  CheckCircle,
  AlertTriangle,
  Code,
  ArrowRight
} from 'lucide-react'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/learn/authentication')({
  component: AuthenticationPage,
})

function AuthenticationPage() {

  const authenticationFeatures = [
    {
      title: 'JWT Token Authentication',
      description: 'Secure stateless authentication using JSON Web Tokens',
      icon: <Key className="w-5 h-5" />,
      color: 'text-blue-500',
      implementation: [
        'Access tokens with short expiry (15 minutes)',
        'Refresh tokens with longer expiry (7 days)',
        'Automatic token refresh on API calls',
        'Secure token storage in HTTP-only cookies'
      ]
    },
    {
      title: 'HTTP-Only Cookie Security',
      description: 'Enhanced security through secure cookie implementation',
      icon: <Cookie className="w-5 h-5" />,
      color: 'text-green-500',
      implementation: [
        'HttpOnly flag prevents XSS attacks',
        'Secure flag for HTTPS-only transmission',
        'SameSite attribute for CSRF protection',
        'Automatic cookie expiry management'
      ]
    },
    {
      title: 'ASP.NET Core Identity',
      description: 'Enterprise-grade user management and authentication',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-purple-500',
      implementation: [
        'Built-in user management',
        'Password hashing with PBKDF2',
        'Account lockout protection',
        'Email confirmation workflow'
      ]
    },
    {
      title: 'Role-Based Authorization',
      description: 'Fine-grained access control and permissions',
      icon: <Lock className="w-5 h-5" />,
      color: 'text-orange-500',
      implementation: [
        'Role-based access control (RBAC)',
        'Policy-based authorization',
        'Resource-based permissions',
        'Dynamic role assignment'
      ]
    }
  ]

  const securityBestPractices = [
    {
      title: 'Token Rotation Strategy',
      description: 'Automatic token refresh prevents long-lived token exposure',
      risk: 'High',
      mitigation: 'Implement automatic refresh token rotation'
    },
    {
      title: 'Password Security',
      description: 'Strong password policies and secure hashing algorithms',
      risk: 'High',
      mitigation: 'Use PBKDF2 with high iteration counts'
    },
    {
      title: 'Rate Limiting',
      description: 'Prevent brute force attacks on authentication endpoints',
      risk: 'Medium',
      mitigation: 'Implement progressive delays and account lockout'
    },
    {
      title: 'HTTPS Enforcement',
      description: 'All authentication traffic must be encrypted',
      risk: 'Critical',
      mitigation: 'Force HTTPS in production environments'
    }
  ]

  const codeExamples = {
    jwt: `// JWT Token Service Implementation
public class JwtTokenService : IJwtTokenService
{
    public string GenerateAccessToken(User user, IList<string> roles)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
        
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new("display_name", user.DisplayName)
        };
        
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), 
                SecurityAlgorithms.HmacSha256Signature)
        };
        
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}`,
    cookies: `// HTTP-Only Cookie Configuration
private void SetSecureTokens(string accessToken, string refreshToken)
{
    var cookieOptions = new CookieOptions
    {
        HttpOnly = true,      // Prevent XSS attacks
        Secure = true,        // HTTPS only
        SameSite = SameSiteMode.Strict,  // CSRF protection
        Expires = DateTime.UtcNow.AddDays(7)
    };
    
    Response.Cookies.Append("accessToken", accessToken, cookieOptions);
    Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
}`,
    middleware: `// Authentication Middleware Configuration
public void Configure(IApplicationBuilder app)
{
    app.UseAuthentication(); // Must come before authorization
    app.UseAuthorization();
    
    // Custom JWT middleware for cookie extraction
    app.UseMiddleware<JwtCookieMiddleware>();
}`
  }

  return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Authentication & Security Masterclass</h1>
            <p className="text-muted-foreground">
              Hands-on experience with JWT authentication and enterprise security patterns
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            <Key className="w-3 h-3 mr-1" />
            JWT Authentication
          </Badge>
          <Badge variant="secondary">
            <Cookie className="w-3 h-3 mr-1" />
            HTTP-Only Cookies
          </Badge>
          <Badge variant="secondary">
            <Shield className="w-3 h-3 mr-1" />
            ASP.NET Core Identity
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Authentication Overview</TabsTrigger>
          <TabsTrigger value="implementation">Implementation Details</TabsTrigger>
          <TabsTrigger value="security">Security Best Practices</TabsTrigger>
          <TabsTrigger value="testing">Live Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Authentication Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                Authentication Flow
              </CardTitle>
              <CardDescription>
                Understanding the complete authentication process from login to API access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/20 rounded-lg p-6">
                  <div className="text-center text-sm text-muted-foreground mb-6">
                    Login → JWT Generation → Cookie Storage → API Access → Token Refresh
                  </div>
                  
                  <div className="grid md:grid-cols-5 gap-4">
                    {[
                      { step: '1', title: 'User Login', desc: 'Email + Password' },
                      { step: '2', title: 'JWT Creation', desc: 'Access + Refresh Tokens' },
                      { step: '3', title: 'Cookie Storage', desc: 'HTTP-Only Cookies' },
                      { step: '4', title: 'API Requests', desc: 'Automatic Token Inclusion' },
                      { step: '5', title: 'Auto Refresh', desc: 'Seamless Token Renewal' }
                    ].map((item) => (
                      <div key={item.step} className="text-center">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center mx-auto mb-2">
                          {item.step}
                        </div>
                        <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {authenticationFeatures.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg bg-muted/20', feature.color)}>
                      {feature.icon}
                    </div>
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.implementation.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-6">
          {/* Code Examples */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  JWT Token Service
                </CardTitle>
                <CardDescription>
                  Core JWT implementation with secure token generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted/20 rounded-lg p-4 text-xs overflow-x-auto">
                  <code>{codeExamples.jwt}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="w-5 h-5" />
                  HTTP-Only Cookie Security
                </CardTitle>
                <CardDescription>
                  Secure cookie configuration for token storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted/20 rounded-lg p-4 text-xs overflow-x-auto">
                  <code>{codeExamples.cookies}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Middleware Configuration
                </CardTitle>
                <CardDescription>
                  ASP.NET Core authentication pipeline setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted/20 rounded-lg p-4 text-xs overflow-x-auto">
                  <code>{codeExamples.middleware}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="space-y-4">
            {securityBestPractices.map((practice) => (
              <Alert key={practice.title} className="border-l-4 border-l-orange-500">
                <AlertTriangle className="h-4 w-4" />
                <div className="ml-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{practice.title}</h4>
                    <Badge variant={practice.risk === 'Critical' ? 'destructive' : practice.risk === 'High' ? 'destructive' : 'secondary'}>
                      {practice.risk} Risk
                    </Badge>
                  </div>
                  <AlertDescription className="mt-2">
                    <p className="mb-2">{practice.description}</p>
                    <p className="text-sm font-medium text-green-600">
                      ✓ Mitigation: {practice.mitigation}
                    </p>
                  </AlertDescription>
                </div>
              </Alert>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Live Authentication Testing
              </CardTitle>
              <CardDescription>
                Test the authentication system with your running backend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Clock className="h-4 w-4" />
                <div className="ml-2">
                  <h4 className="font-semibold">Interactive Testing Environment</h4>
                  <AlertDescription className="mt-2">
                    This section will include an interactive testing environment where you can:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Test login with different credentials</li>
                      <li>Inspect JWT token contents</li>
                      <li>Observe cookie behavior</li>
                      <li>Test token refresh mechanism</li>
                      <li>Simulate authentication failures</li>
                    </ul>
                  </AlertDescription>
                </div>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      </div>
  )
}