import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Settings, Code, Package } from 'lucide-react'

export const Route = createFileRoute('/guides/customization')({
  component: CustomizationGuide,
})

function CustomizationGuide() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Template Customization</h1>
            <p className="text-muted-foreground">Adapt ModernAPI template for your specific needs</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Guides</Badge>
          <Badge variant="outline">Advanced</Badge>
          <span className="text-sm text-muted-foreground">• 25 min read</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="project">Project Setup</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customization Strategy</CardTitle>
              <CardDescription>
                Transform ModernAPI template into your specific business application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Customization Areas</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• <strong>Project Structure</strong> - Rename projects and namespaces</li>
                  <li>• <strong>Domain Model</strong> - Add your business entities</li>
                  <li>• <strong>Configuration</strong> - Environment-specific settings</li>
                  <li>• <strong>Branding</strong> - API documentation and error messages</li>
                  <li>• <strong>Authentication</strong> - Social login, API keys, custom claims</li>
                  <li>• <strong>Database</strong> - Different providers, connection patterns</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Scenarios</CardTitle>
              <CardDescription>Real-world customization examples</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">E-commerce API</h4>
                  <p className="text-sm text-muted-foreground mb-2">Product catalog, orders, payments</p>
                  <ul className="text-xs space-y-1">
                    <li>• Product entities</li>
                    <li>• Shopping cart</li>
                    <li>• Payment integration</li>
                    <li>• Inventory management</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">SaaS Platform</h4>
                  <p className="text-sm text-muted-foreground mb-2">Multi-tenant with subscriptions</p>
                  <ul className="text-xs space-y-1">
                    <li>• Tenant isolation</li>
                    <li>• Subscription billing</li>
                    <li>• Feature flags</li>
                    <li>• Usage analytics</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Enterprise API</h4>
                  <p className="text-sm text-muted-foreground mb-2">Internal microservice</p>
                  <ul className="text-xs space-y-1">
                    <li>• AD integration</li>
                    <li>• Complex workflows</li>
                    <li>• Approval processes</li>
                    <li>• Audit logging</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Renaming</CardTitle>
              <CardDescription>Rename projects and namespaces for your domain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Rename Solution and Projects</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="text-sm"><code>{`# Rename solution file
mv ModernAPI.sln EcommerceAPI.sln

# Rename project folders
mv ModernAPI.Domain EcommerceAPI.Domain
mv ModernAPI.Application EcommerceAPI.Application  
mv ModernAPI.Infrastructure EcommerceAPI.Infrastructure
mv ModernAPI.API EcommerceAPI.API

# Update .csproj files
sed -i 's/ModernAPI/EcommerceAPI/g' **/*.csproj
sed -i 's/ModernAPI/EcommerceAPI/g' **/*.cs`}</code></pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Update Namespaces</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="text-sm"><code>{`// Before
namespace ModernAPI.Domain.Entities
&#123;
    public class User : Entity<Guid>
    &#123;
        // ...
    &#125;
&#125;

// After  
namespace EcommerceAPI.Domain.Entities
&#123;
    public class User : Entity<Guid>
    &#123;
        // ...
    &#125;
&#125;`}</code></pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Branding</CardTitle>
              <CardDescription>Customize documentation, error messages, and API metadata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">OpenAPI Documentation</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="text-sm"><code>{`// Program.cs
builder.Services.AddSwaggerGen(options =>
&#123;
    options.SwaggerDoc("v1", new OpenApiInfo
    &#123;
        Title = "E-commerce API",
        Version = "v1",
        Description = "Complete e-commerce platform API",
        Contact = new OpenApiContact
        &#123;
            Name = "Your Company",
            Email = "api@yourstore.com",
            Url = new Uri("https://yourstore.com")
        &#125;
    &#125;);
&#125;);`}</code></pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Custom Error Messages</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="text-sm"><code>{`// Custom exception messages
public class EcommerceExceptions
&#123;
    public static class Products
    &#123;
        public const string NotFound = "Product not found in our catalog";
        public const string OutOfStock = "This item is currently out of stock";
        public const string InvalidPrice = "Product price must be greater than $0";
    &#125;
&#125;`}</code></pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Patterns</CardTitle>
              <CardDescription>CQRS, Event Sourcing, and Complex Domain Logic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">CQRS Implementation</h4>
                  <p className="text-sm text-muted-foreground mb-2">Separate read and write models</p>
                  <ul className="text-xs space-y-1">
                    <li>• Command handlers for writes</li>
                    <li>• Query handlers for reads</li>
                    <li>• MediatR integration</li>
                    <li>• Separate databases</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Domain Services</h4>
                  <p className="text-sm text-muted-foreground mb-2">Complex business operations</p>
                  <ul className="text-xs space-y-1">
                    <li>• Multi-entity operations</li>
                    <li>• Business rule coordination</li>
                    <li>• Cross-aggregate communication</li>
                    <li>• External service integration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}