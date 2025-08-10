import * as React from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '~/components/ui/navigation-menu'
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import { 
  Shield, 
  Menu, 
  Home, 
  BookOpen, 
  BarChart3, 
  LogOut,
  User,
  Settings,
  Github
} from 'lucide-react'
import { useAuthStore } from '~/stores/auth'
import { cn } from '~/lib/utils'

interface HeaderProps {
  variant?: 'default' | 'minimal'
  showAuth?: boolean
}

export function Header({ variant = 'default', showAuth = true }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  
  const isDashboard = location.pathname.startsWith('/dashboard')
  const isDocs = location.pathname.startsWith('/docs')
  
  const handleLogout = () => {
    clearAuth()
    navigate({ to: '/auth/login' })
    setMobileMenuOpen(false)
  }

  const navigationItems = [
    {
      title: 'Home',
      href: '/',
      icon: <Home className="w-4 h-4" />,
      active: location.pathname === '/'
    },
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <BarChart3 className="w-4 h-4" />,
      active: isDashboard,
      requiresAuth: true
    },
    {
      title: 'Documentation',
      href: '/docs',
      icon: <BookOpen className="w-4 h-4" />,
      active: isDocs
    },
    {
      title: 'GitHub',
      href: 'https://github.com/mapedersen/ModernAPI',
      icon: <Github className="w-4 h-4" />,
      active: false,
      external: true
    }
  ]

  const visibleNavItems = navigationItems.filter(item => 
    !item.requiresAuth || isAuthenticated
  )

  if (variant === 'minimal') {
    return (
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
        <div className="container flex h-14 items-center px-4">
          <Link to="/" className="flex items-center gap-2 mr-6">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Shield className="w-3 h-3 text-primary" />
            </div>
            <span className="font-semibold text-sm">ModernAPI</span>
          </Link>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-8">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-lg">ModernAPI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center h-16">
          <NavigationMenu className="flex items-center h-full">
            <NavigationMenuList className="flex items-center h-full !m-0">
              {visibleNavItems.map((item) => (
                <NavigationMenuItem key={item.href} className="flex items-center">
                  <NavigationMenuLink asChild>
                    {item.external ? (
                      <a 
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 gap-2",
                          item.active && "bg-accent text-accent-foreground"
                        )}
                      >
                        {item.icon}
                        {item.title}
                      </a>
                    ) : (
                      <Link 
                        to={item.href}
                        className={cn(
                          "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 gap-2",
                          item.active && "bg-accent text-accent-foreground"
                        )}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    )}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-4 ml-auto">
          {showAuth && isAuthenticated && user ? (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {user.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : showAuth && !isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth/login">Get Started</Link>
              </Button>
            </div>
          ) : null}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <Shield className="w-3 h-3 text-primary" />
                  </div>
                  ModernAPI
                </SheetTitle>
              </SheetHeader>
              
              <nav className="flex flex-col gap-4 mt-8">
                {visibleNavItems.map((item) => (
                  item.external ? (
                    <a 
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent",
                        item.active && "bg-accent text-accent-foreground"
                      )}
                    >
                      {item.icon}
                      {item.title}
                      {item.active && <Badge variant="secondary" className="ml-auto">Current</Badge>}
                    </a>
                  ) : (
                    <Link 
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent",
                        item.active && "bg-accent text-accent-foreground"
                      )}
                    >
                      {item.icon}
                      {item.title}
                      {item.active && <Badge variant="secondary" className="ml-auto">Current</Badge>}
                    </Link>
                  )
                ))}
                
                {showAuth && isAuthenticated && user && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center gap-3 px-3 py-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {user.displayName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">{user.displayName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start gap-3" 
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>
                )}
                
                {showAuth && !isAuthenticated && (
                  <div className="border-t pt-4 mt-4 flex flex-col gap-2">
                    <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-3">
                        <User className="w-4 h-4" />
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-start gap-3">
                        <Settings className="w-4 h-4" />
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}