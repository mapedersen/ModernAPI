import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Database, Terminal, AlertTriangle, Code, CheckCircle, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/guides/migrations')({
  component: MigrationsGuideComponent,
})

function MigrationsGuideComponent() {
  const migrationSteps = [
    { id: 1, title: 'Create Migration', completed: false },
    { id: 2, title: 'Review Changes', completed: false },
    { id: 3, title: 'Test Migration', completed: false },
    { id: 4, title: 'Apply to Database', completed: false },
    { id: 5, title: 'Verify Schema', completed: false },
  ]

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Database Migrations</h1>
            <p className="text-muted-foreground">EF Core migrations, schema evolution, and deployment strategies</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Guides</Badge>
          <Badge variant="outline">Intermediate</Badge>
          <span className="text-sm text-muted-foreground">• 12 min read</span>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Migration Workflow
          </CardTitle>
          <CardDescription>
            Follow these steps for safe database schema evolution in ModernAPI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            {migrationSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted border-2 border-muted-foreground text-muted-foreground'
                }`}>
                  {step.completed ? '✓' : step.id}
                </div>
                <span className="text-sm font-medium">{step.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="basics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-6">
          {/* Migration Overview */}
          <Card>
            <CardHeader>
              <CardTitle>What are EF Core Migrations?</CardTitle>
              <CardDescription>
                Code-first database schema management with version control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Key Concepts</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• <strong>Migration:</strong> A versioned set of database schema changes</li>
                  <li>• <strong>Model Snapshot:</strong> Current state of your EF Core model</li>
                  <li>• <strong>Up Methods:</strong> Apply changes to move forward</li>
                  <li>• <strong>Down Methods:</strong> Reverse changes for rollback</li>
                  <li>• <strong>Migration History:</strong> Tracks applied migrations in __EFMigrationsHistory table</li>
                </ul>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Benefits</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Version-controlled schema changes</li>
                    <li>• Reproducible deployments</li>
                    <li>• Safe rollback capabilities</li>
                    <li>• Team collaboration support</li>
                    <li>• Environment synchronization</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">ModernAPI Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• PostgreSQL optimized migrations</li>
                    <li>• snake_case naming conventions</li>
                    <li>• Audit column configurations</li>
                    <li>• Index and constraint management</li>
                    <li>• Seed data integration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Basic Migration Workflow
              </CardTitle>
              <CardDescription>
                Standard process for creating and applying migrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Step-by-Step Process</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">1</div>
                    <div>
                      <p className="font-medium">Modify Your Model</p>
                      <p className="text-sm text-muted-foreground">Update entities, add new properties, or create new entities</p>
                      <pre className="text-xs bg-muted-foreground/10 rounded mt-2 p-2"><code>// Add new property to User entity
public string PhoneNumber &#123; get; set; &#125; = string.Empty;</code></pre>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">2</div>
                    <div>
                      <p className="font-medium">Create Migration</p>
                      <p className="text-sm text-muted-foreground">Generate migration file with descriptive name</p>
                      <pre className="text-xs bg-muted-foreground/10 rounded mt-2 p-2"><code>dotnet ef migrations add AddUserPhoneNumber --project ModernAPI.Infrastructure --startup-project ModernAPI.API</code></pre>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">3</div>
                    <div>
                      <p className="font-medium">Review Generated Code</p>
                      <p className="text-sm text-muted-foreground">Inspect migration file for accuracy and safety</p>
                      <pre className="text-xs bg-muted-foreground/10 rounded mt-2 p-2"><code>// Check Migrations/20240101000000_AddUserPhoneNumber.cs
migrationBuilder.AddColumn&lt;string&gt;(
    name: "phone_number",
    table: "users",
    nullable: false,
    defaultValue: "");</code></pre>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">4</div>
                    <div>
                      <p className="font-medium">Apply Migration</p>
                      <p className="text-sm text-muted-foreground">Update database schema</p>
                      <pre className="text-xs bg-muted-foreground/10 rounded mt-2 p-2"><code>dotnet ef database update --project ModernAPI.Infrastructure --startup-project ModernAPI.API</code></pre>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands" className="space-y-6">
          {/* Essential Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Essential Migration Commands
              </CardTitle>
              <CardDescription>
                Complete reference for dotnet ef commands in ModernAPI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Creating Migrations</h4>
                <div className="space-y-3">
                  <div>
                    <code className="bg-black text-green-400 px-3 py-1 rounded text-sm">dotnet ef migrations add AddProduct --project ModernAPI.Infrastructure --startup-project ModernAPI.API</code>
                    <p className="text-sm text-muted-foreground mt-1">Create a new migration with descriptive name</p>
                  </div>
                  
                  <div>
                    <code className="bg-black text-green-400 px-3 py-1 rounded text-sm">dotnet ef migrations add AddProduct --project ModernAPI.Infrastructure --startup-project ModernAPI.API --output-dir Data/Migrations/Products</code>
                    <p className="text-sm text-muted-foreground mt-1">Create migration in specific directory</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Applying Migrations</h4>
                <div className="space-y-3">
                  <div>
                    <code className="bg-black text-green-400 px-3 py-1 rounded text-sm">dotnet ef database update --project ModernAPI.Infrastructure --startup-project ModernAPI.API</code>
                    <p className="text-sm text-muted-foreground mt-1">Apply all pending migrations</p>
                  </div>
                  
                  <div>
                    <code className="bg-black text-green-400 px-3 py-1 rounded text-sm">dotnet ef database update AddProduct --project ModernAPI.Infrastructure --startup-project ModernAPI.API</code>
                    <p className="text-sm text-muted-foreground mt-1">Apply migrations up to a specific migration</p>
                  </div>
                  
                  <div>
                    <code className="bg-black text-green-400 px-3 py-1 rounded text-sm">dotnet ef database update --connection "Host=localhost;Database=modernapi_staging;Username=admin;Password=password"</code>
                    <p className="text-sm text-muted-foreground mt-1">Apply to specific database connection</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Information & Status</h4>
                <div className="space-y-3">
                  <div>
                    <code className="bg-black text-green-400 px-3 py-1 rounded text-sm">dotnet ef migrations list --project ModernAPI.Infrastructure --startup-project ModernAPI.API</code>
                    <p className="text-sm text-muted-foreground mt-1">List all migrations (applied and pending)</p>
                  </div>
                  
                  <div>
                    <code className="bg-black text-green-400 px-3 py-1 rounded text-sm">dotnet ef database update --project ModernAPI.Infrastructure --startup-project ModernAPI.API --verbose</code>
                    <p className="text-sm text-muted-foreground mt-1">Apply migrations with detailed SQL output</p>
                  </div>
                  
                  <div>
                    <code className="bg-black text-green-400 px-3 py-1 rounded text-sm">dotnet ef migrations script --project ModernAPI.Infrastructure --startup-project ModernAPI.API</code>
                    <p className="text-sm text-muted-foreground mt-1">Generate SQL script for all migrations</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Rollback & Removal</h4>
                <div className="space-y-3">
                  <div>
                    <code className="bg-black text-yellow-400 px-3 py-1 rounded text-sm">dotnet ef database update PreviousMigration --project ModernAPI.Infrastructure --startup-project ModernAPI.API</code>
                    <p className="text-sm text-muted-foreground mt-1">Rollback to a specific migration</p>
                  </div>
                  
                  <div>
                    <code className="bg-black text-red-400 px-3 py-1 rounded text-sm">dotnet ef migrations remove --project ModernAPI.Infrastructure --startup-project ModernAPI.API</code>
                    <p className="text-sm text-muted-foreground mt-1">Remove the last unapplied migration</p>
                  </div>
                  
                  <div>
                    <code className="bg-black text-red-400 px-3 py-1 rounded text-sm">dotnet ef database drop --project ModernAPI.Infrastructure --startup-project ModernAPI.API</code>
                    <p className="text-sm text-muted-foreground mt-1">Drop the entire database (development only)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment-Specific Commands */}
          <Card>
            <CardHeader>
              <CardTitle>Environment-Specific Migrations</CardTitle>
              <CardDescription>
                Running migrations against different environments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Using Environment Variables</h4>
                <pre className="text-sm"><code>{`# Development
export ASPNETCORE_ENVIRONMENT=Development
dotnet ef database update --project ModernAPI.Infrastructure --startup-project ModernAPI.API

# Staging
export ASPNETCORE_ENVIRONMENT=Staging
dotnet ef database update --project ModernAPI.Infrastructure --startup-project ModernAPI.API

# Production (use connection string)
dotnet ef database update --project ModernAPI.Infrastructure --startup-project ModernAPI.API \\
  --connection "Host=prod-db.example.com;Database=modernapi;Username=api_user;Password=secure_password"`}</code></pre>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Production Safety
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Always test migrations in staging first</li>
                  <li>• Use connection strings instead of environment files</li>
                  <li>• Generate and review SQL scripts before applying</li>
                  <li>• Take database backups before major schema changes</li>
                  <li>• Consider downtime requirements for large table changes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {/* Custom Migration Code */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Migration Techniques</CardTitle>
              <CardDescription>
                Custom migrations, data seeding, and complex schema changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Custom Migration with Data Seeding</h4>
                <pre className="text-sm"><code>{`public partial class SeedAdminUser : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Schema changes first
        migrationBuilder.AddColumn<bool>(
            name: "is_system_user",
            table: "users",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        // Data seeding
        migrationBuilder.Sql(@"
            INSERT INTO users (id, user_name, normalized_user_name, email, normalized_email, 
                             email_confirmed, security_stamp, concurrency_stamp, 
                             display_name, first_name, last_name, is_active, is_system_user, created_at)
            VALUES (
                gen_random_uuid(),
                'admin@modernapi.com',
                'ADMIN@MODERNAPI.COM',
                'admin@modernapi.com',
                'ADMIN@MODERNAPI.COM',
                true,
                gen_random_uuid()::text,
                gen_random_uuid()::text,
                'System Administrator',
                'System',
                'Administrator',
                true,
                true,
                now()
            ) ON CONFLICT DO NOTHING;
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Remove seeded data first
        migrationBuilder.Sql(@"
            DELETE FROM users WHERE is_system_user = true;
        ");
        
        // Then remove schema changes
        migrationBuilder.DropColumn(
            name: "is_system_user",
            table: "users");
    }
}`}</code></pre>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Safe Column Additions with Default Values</h4>
                <pre className="text-sm"><code>{`public partial class AddProductPriorityWithDefaults : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Add column with default value for existing records
        migrationBuilder.AddColumn<int>(
            name: "priority",
            table: "products",
            type: "integer",
            nullable: false,
            defaultValue: 1);

        // Update existing records with business logic
        migrationBuilder.Sql(@"
            UPDATE products 
            SET priority = CASE 
                WHEN price > 1000 THEN 3  -- High priority for expensive items
                WHEN stock_quantity < 10 THEN 2  -- Medium priority for low stock
                ELSE 1  -- Normal priority
            END
            WHERE priority = 1;  -- Only update records that still have default
        ");
    }
}`}</code></pre>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Handling Large Table Migrations</h4>
                <pre className="text-sm"><code>{`public partial class AddProductSearchIndex : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Create index concurrently to avoid locking (PostgreSQL specific)
        migrationBuilder.Sql(@"
            CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_products_search_vector 
            ON products USING gin(to_tsvector('english', name || ' ' || description));
        ");

        // Add computed column for full-text search
        migrationBuilder.AddColumn<string>(
            name: "search_vector",
            table: "products", 
            type: "tsvector",
            nullable: true,
            computedColumnSql: "to_tsvector('english', name || ' ' || coalesce(description, ''))",
            stored: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex("ix_products_search_vector", "products");
        migrationBuilder.DropColumn("search_vector", "products");
    }
}`}</code></pre>
              </div>
            </CardContent>
          </Card>

          {/* Migration Strategies */}
          <Card>
            <CardHeader>
              <CardTitle>Zero-Downtime Migration Strategies</CardTitle>
              <CardDescription>
                Techniques for deploying schema changes without service interruption
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">Safe Changes</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Adding nullable columns</li>
                    <li>• Adding new tables</li>
                    <li>• Adding indexes (with CONCURRENTLY)</li>
                    <li>• Adding check constraints (not enforced initially)</li>
                    <li>• Expanding varchar length</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">Dangerous Changes</h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• Dropping columns</li>
                    <li>• Renaming columns/tables</li>
                    <li>• Adding non-nullable columns</li>
                    <li>• Changing data types</li>
                    <li>• Adding foreign key constraints</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Multi-Phase Migration Strategy</h4>
                <div className="space-y-3">
                  <div>
                    <strong>Phase 1: Additive Changes</strong>
                    <pre className="text-xs bg-muted-foreground/10 rounded mt-1 p-2"><code>// Add new column, keep old column
migrationBuilder.AddColumn&lt;string&gt;("phone_number", "users", nullable: true);</code></pre>
                  </div>
                  
                  <div>
                    <strong>Phase 2: Data Migration</strong>
                    <pre className="text-xs bg-muted-foreground/10 rounded mt-1 p-2"><code>// Application code writes to both columns during transition period
// Background job migrates data from old to new column</code></pre>
                  </div>
                  
                  <div>
                    <strong>Phase 3: Cleanup</strong>
                    <pre className="text-xs bg-muted-foreground/10 rounded mt-1 p-2"><code>// After all data is migrated and applications updated
migrationBuilder.DropColumn("old_phone", "users");</code></pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          {/* CI/CD Integration */}
          <Card>
            <CardHeader>
              <CardTitle>CI/CD Integration</CardTitle>
              <CardDescription>
                Automating migrations in deployment pipelines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">GitHub Actions Migration Workflow</h4>
                <pre className="text-sm"><code>{`name: Deploy with Migrations

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'
          
      - name: Install EF Core Tools
        run: dotnet tool install --global dotnet-ef
        
      - name: Generate Migration Script
        run: |
          cd backend
          dotnet ef migrations script --idempotent --output migration.sql \\
            --project ModernAPI.Infrastructure --startup-project ModernAPI.API
            
      - name: Apply Migrations
        env:
          CONNECTION_STRING: \$&#123;&#123; secrets.PRODUCTION_CONNECTION_STRING &#125;&#125;
        run: |
          cd backend
          dotnet ef database update \\
            --project ModernAPI.Infrastructure --startup-project ModernAPI.API \\
            --connection "\$&#123;CONNECTION_STRING&#125;"
            
      - name: Deploy Application
        # Your deployment steps here
        run: echo "Deploy application after successful migration"`}</code></pre>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Production Deployment Checklist
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Test migrations in staging environment first</li>
                  <li>• Use --idempotent flag for SQL script generation</li>
                  <li>• Monitor database performance during migration</li>
                  <li>• Have rollback plan ready</li>
                  <li>• Coordinate with team about deployment windows</li>
                  <li>• Consider maintenance mode for breaking changes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Docker Integration */}
          <Card>
            <CardHeader>
              <CardTitle>Docker & Container Deployments</CardTitle>
              <CardDescription>
                Running migrations in containerized environments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Dockerfile with Migration Support</h4>
                <pre className="text-sm"><code>{`# Multi-stage Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build-env

WORKDIR /app
COPY . .

# Install EF Core tools
RUN dotnet tool install --global dotnet-ef
ENV PATH="\$&#123;PATH&#125;:/root/.dotnet/tools"

# Build and publish
RUN dotnet publish ModernAPI.API -c Release -o out

# Runtime stage  
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build-env /app/out .

# Copy migration tool for runtime migrations
COPY --from=build-env /root/.dotnet/tools /root/.dotnet/tools
ENV PATH="\$&#123;PATH&#125;:/root/.dotnet/tools"

# Entry point script that runs migrations before starting app
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]`}</code></pre>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Docker Entry Point Script</h4>
                <pre className="text-sm"><code>{`#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database..."
until pg_isready -h "\$&#123;DB_HOST&#125;" -p "\$&#123;DB_PORT&#125;" -U "\$&#123;DB_USER&#125;"; do
  echo "Database is not ready - sleeping"
  sleep 2
done

echo "Database is ready - applying migrations"

# Apply migrations
dotnet ef database update --project ModernAPI.Infrastructure --startup-project ModernAPI.API \\
  --connection "Host=\$&#123;DB_HOST&#125;;Port=\$&#123;DB_PORT&#125;;Database=\$&#123;DB_NAME&#125;;Username=\$&#123;DB_USER&#125;;Password=\$&#123;DB_PASSWORD&#125;"

echo "Migrations applied successfully - starting application"

# Start the application
exec dotnet ModernAPI.API.dll`}</code></pre>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Docker Compose with Migration Service</h4>
                <pre className="text-sm"><code>{`version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: modernapi
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  migration:
    build: .
    command: |
      bash -c "
        dotnet ef database update --project ModernAPI.Infrastructure --startup-project ModernAPI.API &&
        echo 'Migrations completed'
      "
    environment:
      - ConnectionStrings__DefaultConnection=Host=db;Database=modernapi;Username=admin;Password=password
    depends_on:
      - db

  api:
    build: .
    ports:
      - "5051:8080"
    environment:
      - ConnectionStrings__DefaultConnection=Host=db;Database=modernapi;Username=admin;Password=password
    depends_on:
      - migration
      
volumes:
  postgres_data:`}</code></pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          {/* Common Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Common Migration Issues
              </CardTitle>
              <CardDescription>
                Solutions for frequent migration problems in ModernAPI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">Migration Already Applied Error</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                    Error: The migration '20240101000000_AddProduct' has already been applied to the database.
                  </p>
                  <div className="bg-red-100 dark:bg-red-900/40 rounded p-2">
                    <p className="text-xs font-mono">dotnet ef migrations remove --project ModernAPI.Infrastructure --startup-project ModernAPI.API</p>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                    Or manually delete the migration file and re-create it with a new name.
                  </p>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">Database Connection Issues</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                    Error: A network-related or instance-specific error occurred while establishing a connection to SQL Server.
                  </p>
                  <div className="bg-red-100 dark:bg-red-900/40 rounded p-2 space-y-1">
                    <p className="text-xs font-mono"># Check connection string</p>
                    <p className="text-xs font-mono">dotnet ef database update --connection "Host=localhost;Database=modernapi;Username=admin;Password=password" --project ModernAPI.Infrastructure --startup-project ModernAPI.API</p>
                    <p className="text-xs font-mono"># Or verify environment</p>
                    <p className="text-xs font-mono">echo $ASPNETCORE_ENVIRONMENT</p>
                  </div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">Model Snapshot Out of Sync</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                    Error: The model backing the context has changed since the database was created.
                  </p>
                  <div className="bg-red-100 dark:bg-red-900/40 rounded p-2 space-y-1">
                    <p className="text-xs font-mono"># Reset and recreate migrations</p>
                    <p className="text-xs font-mono">rm -rf Migrations/</p>
                    <p className="text-xs font-mono">dotnet ef migrations add InitialCreate --project ModernAPI.Infrastructure --startup-project ModernAPI.API</p>
                    <p className="text-xs font-mono">dotnet ef database drop --project ModernAPI.Infrastructure --startup-project ModernAPI.API</p>
                    <p className="text-xs font-mono">dotnet ef database update --project ModernAPI.Infrastructure --startup-project ModernAPI.API</p>
                  </div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">Foreign Key Constraint Violation</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                    Error: The ALTER TABLE statement conflicted with the FOREIGN KEY constraint.
                  </p>
                  <div className="bg-red-100 dark:bg-red-900/40 rounded p-2">
                    <p className="text-xs font-mono"># Add migration with data cleanup</p>
                    <pre className="text-xs font-mono">{`migrationBuilder.Sql(@"
  DELETE FROM child_table WHERE parent_id NOT IN (SELECT id FROM parent_table);
");

migrationBuilder.AddForeignKey(
    name: "FK_child_table_parent_table",
    table: "child_table",
    column: "parent_id",
    principalTable: "parent_table",
    principalColumn: "id");`}</pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recovery Procedures */}
          <Card>
            <CardHeader>
              <CardTitle>Migration Recovery Procedures</CardTitle>
              <CardDescription>
                How to recover from failed or problematic migrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Emergency Rollback Procedure</h4>
                <div className="space-y-3">
                  <div>
                    <strong>Step 1: Identify Last Good Migration</strong>
                    <pre className="text-xs bg-muted-foreground/10 rounded mt-1 p-2"><code>dotnet ef migrations list --project ModernAPI.Infrastructure --startup-project ModernAPI.API</code></pre>
                  </div>
                  
                  <div>
                    <strong>Step 2: Rollback Database</strong>
                    <pre className="text-xs bg-muted-foreground/10 rounded mt-1 p-2"><code>dotnet ef database update LastGoodMigration --project ModernAPI.Infrastructure --startup-project ModernAPI.API</code></pre>
                  </div>
                  
                  <div>
                    <strong>Step 3: Remove Failed Migration</strong>
                    <pre className="text-xs bg-muted-foreground/10 rounded mt-1 p-2"><code>dotnet ef migrations remove --project ModernAPI.Infrastructure --startup-project ModernAPI.API</code></pre>
                  </div>
                  
                  <div>
                    <strong>Step 4: Fix Issues and Re-create</strong>
                    <pre className="text-xs bg-muted-foreground/10 rounded mt-1 p-2"><code># Fix your model/configuration issues, then:
dotnet ef migrations add FixedMigration --project ModernAPI.Infrastructure --startup-project ModernAPI.API</code></pre>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-3">Manual Database Repair</h4>
                <pre className="text-sm"><code>{`-- If migrations table is corrupted or inconsistent:

-- 1. Check current migration state
SELECT * FROM "__EFMigrationsHistory" ORDER BY "MigrationId";

-- 2. Manually insert missing migration record (if needed)
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20240101000000_AddProduct', '9.0.0');

-- 3. Or remove incorrectly recorded migration
DELETE FROM "__EFMigrationsHistory" 
WHERE "MigrationId" = '20240101000000_BadMigration';`}</code></pre>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-yellow-800 dark:text-yellow-200">Best Practices for Recovery</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Always backup database before applying migrations</li>
                  <li>• Test migrations in development/staging first</li>
                  <li>• Use --idempotent flag for production scripts</li>
                  <li>• Monitor migration performance and locks</li>
                  <li>• Have rollback plan documented and tested</li>
                  <li>• Keep migration scripts in version control</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Next Steps */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Continue learning about ModernAPI development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Related Guides</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Adding New Entities</li>
                <li>• API Endpoint Creation</li>
                <li>• Testing Strategies</li>
                <li>• Deployment Workflows</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Advanced Topics</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Multi-tenant migrations</li>
                <li>• Zero-downtime deployments</li>
                <li>• Database sharding strategies</li>
                <li>• Performance optimization</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Tools & References</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• EF Core documentation</li>
                <li>• PostgreSQL best practices</li>
                <li>• Migration testing tools</li>
                <li>• Monitoring solutions</li>
              </ul>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button className="gap-2">
              <Code className="w-4 h-4" />
              Add New Entity Guide
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Terminal className="w-4 h-4" />
              API Playground
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}