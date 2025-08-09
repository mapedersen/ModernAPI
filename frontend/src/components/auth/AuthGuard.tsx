import React from 'react'
import { useRouter } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Shield, BookOpen, ArrowRight, Sparkles } from 'lucide-react'
import { useAuthStore } from '~/stores/auth'
import { LoginModal } from './LoginModal'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, fallback, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user, hasCheckedAuth, checkAuthStatus } = useAuthStore()
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = React.useState(false)

  // Check auth status on mount if not already checked
  React.useEffect(() => {
    if (!hasCheckedAuth && !isLoading) {
      checkAuthStatus()
    }
  }, [hasCheckedAuth, isLoading, checkAuthStatus])

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    // The modal will handle navigation
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If auth is not required or user is authenticated, show children
  if (!requireAuth || isAuthenticated) {
    return <>{children}</>
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Default authentication required UI
  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-lg w-full">
          <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-2">
                Welcome to ModernAPI
              </CardTitle>
              <CardDescription className="text-base">
                Sign in to access the complete learning platform with interactive modules, 
                architecture decisions, and hands-on development guides.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium">Interactive Learning</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto">
                    <Shield className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-sm font-medium">Enterprise Patterns</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                  </div>
                  <p className="text-sm font-medium">Modern Stack</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => setShowLoginModal(true)}
                  className="w-full"
                  size="lg"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Sign In & Start Learning
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <Button 
                  onClick={() => router.navigate({ to: '/' })}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Back to Home
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Secure authentication with JWT tokens and enterprise-grade security patterns
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        title="Sign In to ModernAPI"
        description="Access interactive learning modules and enterprise development guides"
      />
    </>
  )
}

// Hook to check if current route should be protected
export function useRouteProtection() {
  const { isAuthenticated } = useAuthStore()
  
  // Routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/welcome'
  ]
  
  return {
    isAuthenticated,
    isProtectedRoute: (path: string) => !publicRoutes.includes(path)
  }
}