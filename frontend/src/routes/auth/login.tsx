import * as React from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { 
  Shield, 
  Cookie, 
  RefreshCw, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Code,
  Server,
  Globe
} from 'lucide-react'
import { loginUser } from '~/lib/api/client'
import { useAuthStore } from '~/stores/auth'
import { useLearningStore } from '~/stores/learning'
import type { LoginRequest } from '~/types/auth'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
})

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const { setCurrentModule } = useLearningStore()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [authStep, setAuthStep] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = React.useState('')

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@modernapi.dev', // Pre-fill with demo credentials
      password: 'AdminPassword123!',
      rememberMe: false
    }
  })

  // Set current module on mount
  React.useEffect(() => {
    setCurrentModule('authentication')
  }, [setCurrentModule])

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true)
    setAuthStep('submitting')
    setErrorMessage('')

    try {
      const result = await loginUser({ data: values as LoginRequest })
      
      if (result.success && result.user) {
        setUser(result.user)
        setAuthStep('success')
        
        // Navigate to learning platform after short delay to show success
        setTimeout(() => {
          router.navigate({ to: '/learn' })
        }, 1500)
      }
    } catch (error) {
      setAuthStep('error')
      setErrorMessage(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const securityFeatures = [
    {
      icon: <Cookie className="w-4 h-4" />,
      title: 'HTTP-Only Cookies',
      description: 'JWT tokens stored securely, inaccessible to JavaScript',
      status: 'active'
    },
    {
      icon: <Shield className="w-4 h-4" />,
      title: 'CSRF Protection',
      description: 'SameSite cookies prevent cross-site attacks',
      status: 'active'
    },
    {
      icon: <RefreshCw className="w-4 h-4" />,
      title: 'Token Refresh',
      description: 'Automatic token renewal for seamless UX',
      status: authStep === 'success' ? 'active' : 'pending'
    },
    {
      icon: <Lock className="w-4 h-4" />,
      title: 'Secure Transport',
      description: 'HTTPS-only in production with SSL/TLS',
      status: 'active'
    }
  ]

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Authentication & Security Masterclass</h1>
              <p className="text-muted-foreground">
                Experience enterprise-grade JWT authentication with real API integration
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              <Lock className="w-3 h-3 mr-1" />
              JWT Authentication
            </Badge>
            <Badge variant="secondary">
              <Cookie className="w-3 h-3 mr-1" />
              HTTP-Only Cookies
            </Badge>
            <Badge variant="secondary">
              <Shield className="w-3 h-3 mr-1" />
              CSRF Protection
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 min-h-[600px]">
          {/* Left Side - Interactive Login */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Live Authentication Demo
                </CardTitle>
                <CardDescription>
                  This form connects to your real .NET API backend
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="admin@modernapi.dev" 
                              type="email"
                              disabled={isLoading}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                disabled={isLoading}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Demo password: AdminPassword123!
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {errorMessage && (
                      <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errorMessage}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : authStep === 'success' ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <ArrowRight className="w-4 h-4 mr-2" />
                      )}
                      {authStep === 'submitting' 
                        ? 'Authenticating...' 
                        : authStep === 'success'
                        ? 'Success! Redirecting...'
                        : 'Sign In'
                      }
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Features Active
                </CardTitle>
                <CardDescription>
                  Enterprise-grade security measures protecting your authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        feature.status === 'active' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{feature.title}</h4>
                          <Badge 
                            variant={feature.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {feature.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Learning Content */}
          <div className="space-y-6">
            <Tabs defaultValue="flow" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="flow">Auth Flow</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="implementation">Code</TabsTrigger>
              </TabsList>

              <TabsContent value="flow" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Authentication Flow</CardTitle>
                    <CardDescription>
                      Step-by-step JWT authentication process
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { step: 1, title: 'User submits credentials', status: authStep === 'idle' ? 'pending' : 'complete' },
                        { step: 2, title: 'Frontend calls server function', status: authStep === 'submitting' || authStep === 'success' || authStep === 'error' ? 'complete' : 'pending' },
                        { step: 3, title: 'Server function proxies to .NET API', status: authStep === 'submitting' || authStep === 'success' || authStep === 'error' ? 'complete' : 'pending' },
                        { step: 4, title: 'API validates credentials', status: authStep === 'success' || authStep === 'error' ? 'complete' : 'pending' },
                        { step: 5, title: 'JWT tokens generated & returned', status: authStep === 'success' ? 'complete' : 'pending' },
                        { step: 6, title: 'Tokens stored in HTTP-only cookies', status: authStep === 'success' ? 'complete' : 'pending' },
                        { step: 7, title: 'User redirected to dashboard', status: 'pending' }
                      ].map((item) => (
                        <div key={item.step} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            item.status === 'complete' 
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {item.status === 'complete' ? '✓' : item.step}
                          </div>
                          <span className={`text-sm ${
                            item.status === 'complete' ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security Deep Dive</CardTitle>
                    <CardDescription>
                      Understanding the security measures implemented
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Cookie className="w-4 h-4" />
                          HTTP-Only Cookie Strategy
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          JWT tokens are stored in HTTP-only cookies, making them inaccessible to JavaScript and preventing XSS attacks.
                        </p>
                        <Badge variant="outline" className="text-xs">
                          XSS Protection
                        </Badge>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          CSRF Protection
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          SameSite=Strict cookies prevent cross-site request forgery attacks.
                        </p>
                        <Badge variant="outline" className="text-xs">
                          CSRF Protection
                        </Badge>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Token Refresh Strategy
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Short-lived access tokens (15 min) with automatic refresh for seamless UX.
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Session Management
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="implementation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Implementation Details
                    </CardTitle>
                    <CardDescription>
                      Key code patterns and server function implementation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        Server Function (BFF Layer)
                      </h4>
                      <pre className="text-xs text-muted-foreground overflow-x-auto">
                        <code>{`export const loginUser = createServerFn()
  .validator((data: LoginRequest) => data)
  .handler(async ({ email, password }) => {
    // Proxy to .NET API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    
    const result = await response.json()
    
    // Set secure HTTP-only cookies
    setHeader('Set-Cookie', [
      \`accessToken=\${result.accessToken}; HttpOnly; Secure\`,
      \`refreshToken=\${result.refreshToken}; HttpOnly; Secure\`
    ])
    
    return { success: true, user: result.user }
  })`}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}