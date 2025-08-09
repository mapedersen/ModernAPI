import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Code, FileText, Database, GitBranch, CheckCircle } from 'lucide-react'

export const Route = createFileRoute('/docs/reference/standards')({
  component: CodeStandardsComponent,
})

function CodeStandardsComponent() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Code Standards</h1>
            <p className="text-muted-foreground">Coding conventions, naming patterns, and style guidelines</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Reference</Badge>
          <Badge variant="outline">Beginner</Badge>
          <span className="text-sm text-muted-foreground">• 12 min read</span>
        </div>
      </div>

      <Tabs defaultValue="csharp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="csharp">C# Standards</TabsTrigger>
          <TabsTrigger value="typescript">TypeScript</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="csharp" className="space-y-6">
          {/* C# Naming Conventions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                C# Naming Conventions
              </CardTitle>
              <CardDescription>
                Consistent naming patterns across the .NET codebase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">✓ Correct</h4>
                    <div className="bg-muted rounded-lg p-3 space-y-2">
                      <div><code className="text-sm">public class UserService</code></div>
                      <div><code className="text-sm">public interface IUserRepository</code></div>
                      <div><code className="text-sm">public string DisplayName &#123; get; set; &#125;</code></div>
                      <div><code className="text-sm">private readonly ILogger _logger;</code></div>
                      <div><code className="text-sm">public const int MAX_RETRY_COUNT = 3;</code></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">✗ Incorrect</h4>
                    <div className="bg-muted rounded-lg p-3 space-y-2">
                      <div><code className="text-sm">public class userService</code></div>
                      <div><code className="text-sm">public interface UserRepository</code></div>
                      <div><code className="text-sm">public string display_name &#123; get; set; &#125;</code></div>
                      <div><code className="text-sm">private readonly ILogger logger;</code></div>
                      <div><code className="text-sm">public const int maxRetryCount = 3;</code></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 pt-4">
                <div className="space-y-2">
                  <h5 className="font-medium">Classes & Interfaces</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• PascalCase for classes</li>
                    <li>• Interface prefix with 'I'</li>
                    <li>• Descriptive, not abbreviated</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">Methods & Properties</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• PascalCase for public members</li>
                    <li>• camelCase for parameters</li>
                    <li>• Verb for methods, noun for properties</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">Fields & Constants</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• _fieldName for private fields</li>
                    <li>• UPPER_CASE for constants</li>
                    <li>• camelCase for local variables</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Organization */}
          <Card>
            <CardHeader>
              <CardTitle>File Organization</CardTitle>
              <CardDescription>
                Standard file structure and organization patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm"><code>{`ModernAPI.Domain/
├── Entities/
│   └── User.cs              # One class per file
├── ValueObjects/
│   └── Email.cs             # Value object classes
├── Events/
│   └── UserCreatedEvent.cs  # Domain events
├── Exceptions/
│   └── UserNotFoundException.cs
└── Interfaces/
    └── IUserRepository.cs   # Repository contracts`}</code></pre>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">File Naming Rules</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Match the primary class name exactly</li>
                  <li>• Use PascalCase for file names</li>
                  <li>• One primary class per file</li>
                  <li>• Organize by feature, not by type</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typescript" className="space-y-6">
          {/* TypeScript Standards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                TypeScript Standards
              </CardTitle>
              <CardDescription>
                Frontend code conventions and best practices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">✓ Preferred</h4>
                    <div className="bg-muted rounded-lg p-3 space-y-2">
                      <div><code className="text-sm">interface UserProfile {`{}`}</code></div>
                      <div><code className="text-sm">type UserStatus = 'active' | 'inactive'</code></div>
                      <div><code className="text-sm">export function UserCard() {`{}`}</code></div>
                      <div><code className="text-sm">const [isLoading, setIsLoading] = useState()</code></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">✗ Avoid</h4>
                    <div className="bg-muted rounded-lg p-3 space-y-2">
                      <div><code className="text-sm">interface IUserProfile {`{}`}</code></div>
                      <div><code className="text-sm">type UserStatus = string</code></div>
                      <div><code className="text-sm">export function userCard() {`{}`}</code></div>
                      <div><code className="text-sm">const [loading, setLoading] = useState()</code></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Import Organization</h4>
                <div className="bg-muted rounded-lg p-3">
                  <pre className="text-sm"><code>{`// 1. External libraries
import React from 'react'
import { useForm } from 'react-hook-form'

// 2. Internal components
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'

// 3. Types and utilities
import type { User } from '~/types/user'
import { cn } from '~/lib/utils'`}</code></pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          {/* Database Conventions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Naming Conventions
              </CardTitle>
              <CardDescription>
                PostgreSQL table and column naming standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Tables & Columns</h4>
                    <div className="bg-muted rounded-lg p-3 space-y-2">
                      <div><code className="text-sm">users</code> (table name)</div>
                      <div><code className="text-sm">display_name</code> (column)</div>
                      <div><code className="text-sm">created_at</code> (timestamp)</div>
                      <div><code className="text-sm">user_id</code> (foreign key)</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Indexes & Constraints</h4>
                    <div className="bg-muted rounded-lg p-3 space-y-2">
                      <div><code className="text-sm">idx_users_email</code> (index)</div>
                      <div><code className="text-sm">ck_users_email_format</code> (check)</div>
                      <div><code className="text-sm">fk_orders_user_id</code> (foreign key)</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">General Rules</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Use snake_case for all names</li>
                      <li>• Singular nouns for table names</li>
                      <li>• Descriptive column names</li>
                      <li>• Consistent _id suffix for keys</li>
                      <li>• created_at/updated_at for timestamps</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Migration Naming</h4>
                    <div className="bg-muted rounded-lg p-3 space-y-2">
                      <div><code className="text-sm">20240101_AddUserTable</code></div>
                      <div><code className="text-sm">20240102_AddEmailIndex</code></div>
                      <div><code className="text-sm">20240103_UpdateUserSchema</code></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          {/* General Standards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                General Development Standards
              </CardTitle>
              <CardDescription>
                Cross-cutting concerns and general best practices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Git Commit Messages
                    </h4>
                    <div className="bg-muted rounded-lg p-3 space-y-2">
                      <div><code className="text-sm">feat: add user profile component</code></div>
                      <div><code className="text-sm">fix: resolve authentication bug</code></div>
                      <div><code className="text-sm">docs: update API documentation</code></div>
                      <div><code className="text-sm">refactor: simplify user service</code></div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Code Comments</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Explain why, not what</li>
                      <li>• Document complex business logic</li>
                      <li>• Use XML comments for public APIs</li>
                      <li>• Keep comments up to date</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Error Handling</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Use specific exception types</li>
                      <li>• Include meaningful error messages</li>
                      <li>• Log errors with context</li>
                      <li>• Follow RFC 7807 for API errors</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Testing Standards</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Follow AAA pattern (Arrange, Act, Assert)</li>
                      <li>• Use descriptive test method names</li>
                      <li>• One assertion per test when possible</li>
                      <li>• Test behavior, not implementation</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Code Review Checklist</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
                  <div>
                    <ul className="space-y-1">
                      <li>□ Follows naming conventions</li>
                      <li>□ Has appropriate tests</li>
                      <li>□ Handles errors properly</li>
                    </ul>
                  </div>
                  <div>
                    <ul className="space-y-1">
                      <li>□ No hardcoded values</li>
                      <li>□ Follows SOLID principles</li>
                      <li>□ Documentation updated</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}