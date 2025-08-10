import * as React from 'react'
import { useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  User,
  Loader2,
  Sparkles,
  ArrowRight,
  Rocket
} from 'lucide-react'
import { loginUser } from '~/lib/api/client'
import { useAuthStore } from '~/stores/auth'
import type { LoginRequest } from '~/types/auth'
import { cn } from '~/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

interface InlineLoginProps {
  onSuccess?: () => void
  className?: string
}

export function InlineLogin({ onSuccess, className }: InlineLoginProps) {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [showPassword, setShowPassword] = React.useState(false)
  const [authStep, setAuthStep] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = React.useState('')

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@modernapi.dev',
      password: 'AdminPassword123!',
    }
  })

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setAuthStep('submitting')
    setErrorMessage('')

    try {
      const result = await loginUser({ data: values as LoginRequest })
      
      if (result.success && result.user) {
        setUser(result.user)
        setAuthStep('success')
        
        // Handle success with smooth transition
        setTimeout(() => {
          if (onSuccess) {
            onSuccess()
          } else {
            router.navigate({ to: '/docs/learn' })
          }
        }, 2000)
      }
    } catch (error) {
      setAuthStep('error')
      setErrorMessage(error instanceof Error ? error.message : 'Login failed')
    }
  }

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <Card className="border-2 border-primary/20 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl mb-2">
            {authStep === 'success' ? 'Welcome to ModernAPI!' : 'Ready to Start Learning?'}
          </CardTitle>
          <CardDescription className="text-base">
            {authStep === 'success' 
              ? 'Taking you to your personalized learning experience...'
              : 'Sign in to access the complete interactive learning platform'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {authStep === 'success' ? (
            // Success State
            <div className="py-8 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  Authentication Successful!
                </h3>
                
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Rocket className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">Launching your learning journey</span>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            // Login Form
            <>
              <Alert className="mb-6">
                <User className="h-4 w-4" />
                <AlertDescription>
                  <strong>Demo Credentials:</strong><br />
                  Email: admin@modernapi.dev<br />
                  Password: AdminPassword123!
                </AlertDescription>
              </Alert>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              {...field}
                              disabled={authStep === 'submitting'}
                              className="h-12"
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
                                {...field}
                                disabled={authStep === 'submitting'}
                                className="h-12 pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={authStep === 'submitting'}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {authStep === 'error' && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full h-14 text-lg"
                    disabled={authStep === 'submitting'}
                  >
                    {authStep === 'submitting' ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Signing you in...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-3" />
                        Sign In & Start Learning
                        <ArrowRight className="w-5 h-5 ml-3" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  Secure authentication with enterprise-grade JWT tokens and security patterns
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}