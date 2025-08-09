import * as React from 'react'
import { useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
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
  Sparkles
} from 'lucide-react'
import { loginUser } from '~/lib/api/client'
import { useAuthStore } from '~/stores/auth'
import type { LoginRequest } from '~/types/auth'
import { cn } from '~/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
})

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  title?: string
  description?: string
  successRedirect?: string
}

export function LoginModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  title = "Welcome to ModernAPI",
  description = "Sign in to access the complete learning platform",
  successRedirect = '/learn'
}: LoginModalProps) {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [showPassword, setShowPassword] = React.useState(false)
  const [authStep, setAuthStep] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = React.useState('')

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@modernapi.dev', // Pre-fill with demo credentials
      password: 'AdminPassword123!',
      rememberMe: true
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
            // Smooth transition to platform
            router.navigate({ to: successRedirect })
          }
          
          // Delay closing modal to show smooth transition
          setTimeout(() => {
            onClose()
            // Reset form state for next use
            setAuthStep('idle')
            form.reset()
          }, 300)
        }, 1500)
      }
    } catch (error) {
      setAuthStep('error')
      setErrorMessage(error instanceof Error ? error.message : 'Login failed')
    }
  }

  const handleClose = () => {
    if (authStep === 'submitting') return // Prevent closing during submission
    setAuthStep('idle')
    setErrorMessage('')
    form.reset({
      email: 'admin@modernapi.dev',
      password: 'AdminPassword123!',
      rememberMe: true
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <DialogDescription className="text-base">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Success State */}
        {authStep === 'success' && (
          <div className="py-12 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              Welcome to ModernAPI!
            </h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Unlocking your learning experience...
            </p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            </div>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">Preparing your personalized experience</span>
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
          </div>
        )}

        {/* Login Form */}
        {authStep !== 'success' && (
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          disabled={authStep === 'submitting'}
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
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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

                {authStep === 'error' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <DialogFooter className="flex-col space-y-2 pt-4">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={authStep === 'submitting'}
                  >
                    {authStep === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Sign In & Continue
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClose}
                    className="w-full"
                    disabled={authStep === 'submitting'}
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </form>
            </Form>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                This demo showcases enterprise authentication patterns with JWT tokens and secure cookies.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Hook for easy modal state management
export function useLoginModal() {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  
  return {
    isOpen,
    openModal,
    closeModal,
    LoginModal: (props: Omit<LoginModalProps, 'isOpen' | 'onClose'>) => (
      <LoginModal {...props} isOpen={isOpen} onClose={closeModal} />
    )
  }
}