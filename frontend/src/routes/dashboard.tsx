import { createFileRoute, redirect } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { 
  Users, 
  Activity, 
  Database,
  Shield,
  Plus,
  RefreshCw,
  Mail,
  Calendar,
  User,
  Settings,
  LogOut
} from 'lucide-react'
import * as React from 'react'
import { getUsers } from '~/lib/api/client'
import { useAuthStore } from '~/stores/auth'
import type { UserDto as BackendUserDto } from '~/types/user'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    // This will be handled by AuthGuard component when we add it
  },
  loader: async () => {
    try {
      const usersData = await getUsers()
      return { usersData }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      return { usersData: null }
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { usersData } = Route.useLoaderData()
  const { user, clearAuth } = useAuthStore()
  
  const handleLogout = () => {
    clearAuth()
    window.location.href = '/auth/login'
  }

  const stats = [
    {
      title: 'Total Users',
      value: usersData?.totalCount || 0,
      icon: <Users className="w-4 h-4" />,
      change: '+2.5%',
      changeType: 'positive' as const,
      description: 'Active users in system'
    },
    {
      title: 'API Requests',
      value: '12.4k',
      icon: <Activity className="w-4 h-4" />,
      change: '+5.2%',
      changeType: 'positive' as const,
      description: 'Requests this month'
    },
    {
      title: 'Database',
      value: '98.5%',
      icon: <Database className="w-4 h-4" />,
      change: '+0.1%',
      changeType: 'positive' as const,
      description: 'Uptime this month'
    },
    {
      title: 'Security Score',
      value: 'A+',
      icon: <Shield className="w-4 h-4" />,
      change: 'Excellent',
      changeType: 'neutral' as const,
      description: 'Security rating'
    }
  ]

  const recentUsers = usersData?.users?.slice(0, 5) || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">ModernAPI Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>
                    {user?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">{user?.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.displayName}
              </h2>
              <p className="text-muted-foreground">
                Here's what's happening with your ModernAPI system today.
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={
                      stat.changeType === 'positive' 
                        ? 'text-green-600' 
                        : stat.changeType === 'negative' 
                        ? 'text-red-600' 
                        : 'text-muted-foreground'
                    }>
                      {stat.change}
                    </span>{' '}
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Users */}
            <Card className="col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>
                    Latest users registered in your system
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {recentUsers.length > 0 ? (
                  <div className="space-y-4">
                    {recentUsers.map((user: BackendUserDto) => (
                      <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {user.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.displayName}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.isActive ? 'default' : 'secondary'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant={user.isEmailVerified ? 'default' : 'destructive'}>
                            {user.isEmailVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No users found or failed to load users</p>
                    <Button variant="outline" className="mt-4">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions & System Info */}
            <div className="col-span-3 space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common administrative tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    System Settings
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Audit
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    Database Status
                  </Button>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>
                    Current system health
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Server</span>
                    <Badge variant="default" className="bg-green-500">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="default" className="bg-green-500">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Authentication</span>
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Backup</span>
                    <span className="text-sm text-muted-foreground">2h ago</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}