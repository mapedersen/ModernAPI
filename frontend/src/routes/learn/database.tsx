import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Progress } from '~/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
import { Separator } from '~/components/ui/separator'
import { Switch } from '~/components/ui/switch'
import { ScrollArea } from '~/components/ui/scroll-area'
import { 
  Database, 
  Table, 
  Key, 
  Link2, 
  Settings, 
  Code, 
  Play, 
  CheckCircle,
  AlertTriangle,
  Loader2,
  GitBranch,
  Users,
  ShoppingCart,
  Package,
  Clock,
  ArrowRight,
  Activity,
  TrendingUp,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Zap,
  BookOpen,
  Terminal,
  FileText,
  Circle,
  ArrowDown,
  ArrowUp,
  Plus,
  Minus
} from 'lucide-react'
import { useLearningStore } from '~/stores/learning'
import { ModuleNavigation, useModuleCompletion } from '~/components/learning/ModuleNavigation'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/learn/database')({
  component: DatabasePage,
})

interface DatabaseEntity {
  id: string
  name: string
  tableName: string
  properties: EntityProperty[]
  relationships: Relationship[]
  position: { x: number; y: number }
  color: string
}

interface EntityProperty {
  id: string
  name: string
  type: string
  isKey: boolean
  isForeignKey: boolean
  isRequired: boolean
  maxLength?: number
  precision?: number
  scale?: number
  defaultValue?: string
  constraints: string[]
}

interface Relationship {
  id: string
  type: 'OneToOne' | 'OneToMany' | 'ManyToMany'
  fromEntity: string
  toEntity: string
  fromProperty: string
  toProperty: string
  cascadeDelete: boolean
  isRequired: boolean
}

interface Migration {
  id: string
  name: string
  timestamp: string
  status: 'pending' | 'applying' | 'applied' | 'failed'
  operations: MigrationOperation[]
  description: string
  duration?: number
}

interface MigrationOperation {
  type: 'CreateTable' | 'AddColumn' | 'DropColumn' | 'CreateIndex' | 'AddForeignKey' | 'UpdateData'
  description: string
  sql: string
}

interface QueryInsight {
  id: string
  query: string
  executionTime: number
  rowsReturned: number
  indexesUsed: string[]
  recommendation?: string
  severity: 'low' | 'medium' | 'high'
}

function DatabasePage() {
  const [selectedEntity, setSelectedEntity] = React.useState<string | null>('user')
  const [showRelationships, setShowRelationships] = React.useState(true)
  const [selectedMigration, setSelectedMigration] = React.useState<string | null>(null)
  const [isConnected, setIsConnected] = React.useState(true)
  const [migrationInProgress, setMigrationInProgress] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState<string | null>(null)
  const [showCode, setShowCode] = React.useState<Record<string, boolean>>({})
  const [selectedQuery, setSelectedQuery] = React.useState<string | null>(null)

  // Handle module completion and progression
  useModuleCompletion('database')

  // Sample entities based on ModernAPI backend
  const entities: DatabaseEntity[] = [
    {
      id: 'user',
      name: 'User',
      tableName: 'users',
      color: '#3b82f6',
      position: { x: 100, y: 100 },
      properties: [
        {
          id: 'id',
          name: 'Id',
          type: 'Guid',
          isKey: true,
          isForeignKey: false,
          isRequired: true,
          constraints: ['PRIMARY_KEY']
        },
        {
          id: 'email',
          name: 'Email',
          type: 'string',
          isKey: false,
          isForeignKey: false,
          isRequired: true,
          maxLength: 256,
          constraints: ['UNIQUE', 'EMAIL_INDEX']
        },
        {
          id: 'displayName',
          name: 'DisplayName',
          type: 'string',
          isKey: false,
          isForeignKey: false,
          isRequired: true,
          maxLength: 100,
          constraints: []
        },
        {
          id: 'firstName',
          name: 'FirstName',
          type: 'string',
          isKey: false,
          isForeignKey: false,
          isRequired: false,
          maxLength: 50,
          constraints: []
        },
        {
          id: 'lastName',
          name: 'LastName',
          type: 'string',
          isKey: false,
          isForeignKey: false,
          isRequired: false,
          maxLength: 50,
          constraints: []
        },
        {
          id: 'isActive',
          name: 'IsActive',
          type: 'bool',
          isKey: false,
          isForeignKey: false,
          isRequired: true,
          defaultValue: 'true',
          constraints: []
        },
        {
          id: 'createdAt',
          name: 'CreatedAt',
          type: 'DateTime',
          isKey: false,
          isForeignKey: false,
          isRequired: true,
          constraints: ['DEFAULT_NOW']
        }
      ],
      relationships: []
    },
    {
      id: 'product',
      name: 'Product',
      tableName: 'products',
      color: '#10b981',
      position: { x: 500, y: 150 },
      properties: [
        {
          id: 'id',
          name: 'Id',
          type: 'Guid',
          isKey: true,
          isForeignKey: false,
          isRequired: true,
          constraints: ['PRIMARY_KEY']
        },
        {
          id: 'name',
          name: 'Name',
          type: 'string',
          isKey: false,
          isForeignKey: false,
          isRequired: true,
          maxLength: 200,
          constraints: ['UNIQUE_INDEX']
        },
        {
          id: 'price',
          name: 'Price',
          type: 'decimal',
          isKey: false,
          isForeignKey: false,
          isRequired: true,
          precision: 10,
          scale: 2,
          constraints: ['CHECK_POSITIVE']
        },
        {
          id: 'stock',
          name: 'Stock',
          type: 'int',
          isKey: false,
          isForeignKey: false,
          isRequired: true,
          defaultValue: '0',
          constraints: ['CHECK_NON_NEGATIVE']
        },
        {
          id: 'categoryId',
          name: 'CategoryId',
          type: 'Guid',
          isKey: false,
          isForeignKey: true,
          isRequired: true,
          constraints: ['FOREIGN_KEY']
        }
      ],
      relationships: [
        {
          id: 'product-category',
          type: 'OneToMany',
          fromEntity: 'category',
          toEntity: 'product',
          fromProperty: 'Id',
          toProperty: 'CategoryId',
          cascadeDelete: false,
          isRequired: true
        }
      ]
    },
    {
      id: 'category',
      name: 'Category',
      tableName: 'categories',
      color: '#f59e0b',
      position: { x: 900, y: 100 },
      properties: [
        {
          id: 'id',
          name: 'Id',
          type: 'Guid',
          isKey: true,
          isForeignKey: false,
          isRequired: true,
          constraints: ['PRIMARY_KEY']
        },
        {
          id: 'name',
          name: 'Name',
          type: 'string',
          isKey: false,
          isForeignKey: false,
          isRequired: true,
          maxLength: 100,
          constraints: ['UNIQUE']
        },
        {
          id: 'description',
          name: 'Description',
          type: 'string',
          isKey: false,
          isForeignKey: false,
          isRequired: false,
          maxLength: 500,
          constraints: []
        }
      ],
      relationships: []
    },
    {
      id: 'order',
      name: 'Order',
      tableName: 'orders',
      color: '#8b5cf6',
      position: { x: 300, y: 400 },
      properties: [
        {
          id: 'id',
          name: 'Id',
          type: 'Guid',
          isKey: true,
          isForeignKey: false,
          isRequired: true,
          constraints: ['PRIMARY_KEY']
        },
        {
          id: 'userId',
          name: 'UserId',
          type: 'Guid',
          isKey: false,
          isForeignKey: true,
          isRequired: true,
          constraints: ['FOREIGN_KEY']
        },
        {
          id: 'orderDate',
          name: 'OrderDate',
          type: 'DateTime',
          isKey: false,
          isForeignKey: false,
          isRequired: true,
          constraints: ['INDEX']
        },
        {
          id: 'totalAmount',
          name: 'TotalAmount',
          type: 'decimal',
          isKey: false,
          isForeignKey: false,
          isRequired: true,
          precision: 10,
          scale: 2,
          constraints: ['CHECK_POSITIVE']
        },
        {
          id: 'status',
          name: 'Status',
          type: 'string',
          isKey: false,
          isForeignKey: false,
          isRequired: true,
          maxLength: 50,
          constraints: ['CHECK_STATUS']
        }
      ],
      relationships: [
        {
          id: 'user-orders',
          type: 'OneToMany',
          fromEntity: 'user',
          toEntity: 'order',
          fromProperty: 'Id',
          toProperty: 'UserId',
          cascadeDelete: true,
          isRequired: true
        }
      ]
    }
  ]

  // Sample migrations
  const migrations: Migration[] = [
    {
      id: 'init',
      name: 'InitialCreate',
      timestamp: '20250808_000001',
      status: 'applied',
      description: 'Initial database schema with User entity and ASP.NET Core Identity',
      operations: [
        {
          type: 'CreateTable',
          description: 'Create users table with Identity columns',
          sql: `CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(256) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`
        }
      ]
    },
    {
      id: 'products',
      name: 'AddProductsAndCategories',
      timestamp: '20250808_000002',
      status: 'applied',
      description: 'Add product catalog with categories and relationships',
      operations: [
        {
          type: 'CreateTable',
          description: 'Create categories table',
          sql: `CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500)
);`
        },
        {
          type: 'CreateTable',
          description: 'Create products table with category relationship',
          sql: `CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category_id UUID NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);`
        },
        {
          type: 'CreateIndex',
          description: 'Index on product name for fast searches',
          sql: 'CREATE UNIQUE INDEX idx_products_name ON products(name);'
        }
      ]
    },
    {
      id: 'orders',
      name: 'AddOrderSystem',
      timestamp: '20250808_000003',
      status: 'applied',
      description: 'Complete order management system with user relationships',
      operations: [
        {
          type: 'CreateTable',
          description: 'Create orders table',
          sql: `CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`
        },
        {
          type: 'CreateIndex',
          description: 'Index on order date for reporting queries',
          sql: 'CREATE INDEX idx_orders_date ON orders(order_date);'
        }
      ]
    },
    {
      id: 'performance',
      name: 'OptimizeQueries',
      timestamp: '20250808_000004',
      status: migrationInProgress && currentStep === 'performance' ? 'applying' : 'pending',
      description: 'Add performance indexes and constraints for better query optimization',
      operations: [
        {
          type: 'CreateIndex',
          description: 'Composite index for user orders',
          sql: 'CREATE INDEX idx_orders_user_date ON orders(user_id, order_date DESC);'
        },
        {
          type: 'CreateIndex',
          description: 'Index for product category lookups',
          sql: 'CREATE INDEX idx_products_category ON products(category_id);'
        }
      ]
    }
  ]

  // Sample query insights
  const queryInsights: QueryInsight[] = [
    {
      id: 'user-orders',
      query: 'SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC',
      executionTime: 2.3,
      rowsReturned: 15,
      indexesUsed: ['idx_orders_user_date'],
      severity: 'low'
    },
    {
      id: 'product-search',
      query: 'SELECT * FROM products WHERE name ILIKE ?',
      executionTime: 45.2,
      rowsReturned: 234,
      indexesUsed: [],
      recommendation: 'Add full-text search index on product name and description',
      severity: 'high'
    },
    {
      id: 'category-products',
      query: 'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id',
      executionTime: 8.7,
      rowsReturned: 1248,
      indexesUsed: ['idx_products_category'],
      severity: 'medium'
    }
  ]

  const runMigration = async (migrationId: string) => {
    if (migrationInProgress) return

    setMigrationInProgress(true)
    setCurrentStep(migrationId)

    const migration = migrations.find(m => m.id === migrationId)
    if (!migration) return

    // Simulate migration execution
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Update migration status
    migration.status = 'applied'
    migration.duration = 2.1

    setMigrationInProgress(false)
    setCurrentStep(null)
  }

  const getEntityByName = (name: string) => entities.find(e => e.id === name)
  const selectedEntityData = selectedEntity ? getEntityByName(selectedEntity) : null

  const toggleCodeView = (key: string) => {
    setShowCode(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const efCoreExamples = {
    entityConfiguration: `public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");
        
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();
            
        builder.Property(p => p.Name)
            .HasColumnName("name")
            .HasMaxLength(200)
            .IsRequired();
            
        builder.Property(p => p.Price)
            .HasColumnName("price")
            .HasPrecision(10, 2)
            .IsRequired();
            
        builder.Property(p => p.Stock)
            .HasColumnName("stock")
            .HasDefaultValue(0)
            .IsRequired();
            
        // Relationships
        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes
        builder.HasIndex(p => p.Name)
            .IsUnique()
            .HasDatabaseName("idx_products_name");
            
        builder.HasIndex(p => p.CategoryId)
            .HasDatabaseName("idx_products_category");
            
        // Constraints
        builder.HasCheckConstraint("CK_products_price_positive", "price > 0");
        builder.HasCheckConstraint("CK_products_stock_non_negative", "stock >= 0");
    }
}`,
    domainEntity: `public class Product : Entity<Guid>
{
    public string Name { get; private set; }
    public decimal Price { get; private set; }
    public int Stock { get; private set; }
    public Guid CategoryId { get; private set; }
    
    // Navigation properties
    public Category Category { get; private set; }
    public ICollection<OrderItem> OrderItems { get; private set; } = new List<OrderItem>();
    
    // Constructor for EF Core
    private Product() { }
    
    public Product(string name, decimal price, int stock, Guid categoryId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Product name is required", nameof(name));
        if (price <= 0)
            throw new ArgumentException("Price must be positive", nameof(price));
        if (stock < 0)
            throw new ArgumentException("Stock cannot be negative", nameof(stock));
            
        Id = Guid.NewGuid();
        Name = name;
        Price = price;
        Stock = stock;
        CategoryId = categoryId;
        
        RaiseDomainEvent(new ProductCreatedEvent(Id, name, price));
    }
    
    public void UpdatePrice(decimal newPrice)
    {
        if (newPrice <= 0)
            throw new ArgumentException("Price must be positive", nameof(newPrice));
            
        var oldPrice = Price;
        Price = newPrice;
        
        RaiseDomainEvent(new ProductPriceUpdatedEvent(Id, oldPrice, newPrice));
    }
    
    public void AdjustStock(int quantity)
    {
        if (Stock + quantity < 0)
            throw new InvalidOperationException("Insufficient stock");
            
        Stock += quantity;
        
        RaiseDomainEvent(new ProductStockAdjustedEvent(Id, quantity, Stock));
    }
}`,
    repositoryPattern: `public interface IProductRepository : IRepository<Product, Guid>
{
    Task<Product?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Product>> GetByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Product>> GetLowStockProductsAsync(int threshold = 10, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);
}

public class ProductRepository : Repository<Product, Guid>, IProductRepository
{
    public ProductRepository(ApplicationDbContext context) : base(context) { }
    
    public async Task<Product?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await Context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Name == name, cancellationToken);
    }
    
    public async Task<IReadOnlyList<Product>> GetByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await Context.Products
            .Where(p => p.CategoryId == categoryId)
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }
    
    public async Task<IReadOnlyList<Product>> GetLowStockProductsAsync(int threshold = 10, CancellationToken cancellationToken = default)
    {
        return await Context.Products
            .Where(p => p.Stock <= threshold)
            .OrderBy(p => p.Stock)
            .ThenBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }
    
    public async Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = Context.Products.Where(p => p.Name == name);
        
        if (excludeId.HasValue)
            query = query.Where(p => p.Id != excludeId.Value);
            
        return await query.AnyAsync(cancellationToken);
    }
}`
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Database & Domain Design</h1>
            <p className="text-muted-foreground">
              Master Entity Framework Core, domain modeling, and database optimization
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="gap-1">
            <Table className="w-3 h-3" />
            4 Entities
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <GitBranch className="w-3 h-3" />
            4 Migrations
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Activity className="w-3 h-3" />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-4">
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border',
            isConnected ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            )} />
            <span className={cn(
              'text-sm font-medium',
              isConnected ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
            )}>
              {isConnected ? 'Database Connected' : 'Database Offline'}
            </span>
            <code className="text-xs font-mono bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
              modernapi_development
            </code>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsConnected(!isConnected)}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Toggle Connection
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side - Schema Explorer */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="w-5 h-5" />
                Database Schema
              </CardTitle>
              <CardDescription>
                Explore entity relationships and database structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Schema Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-relationships"
                    checked={showRelationships}
                    onCheckedChange={setShowRelationships}
                  />
                  <label htmlFor="show-relationships" className="text-sm">
                    Show Relationships
                  </label>
                </div>
                <Badge variant="outline">PostgreSQL</Badge>
              </div>

              {/* Entity List */}
              <div className="space-y-2">
                {entities.map((entity) => (
                  <div
                    key={entity.id}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm',
                      selectedEntity === entity.id && 'ring-2 ring-primary border-primary/50 bg-primary/5'
                    )}
                    onClick={() => setSelectedEntity(entity.id)}
                    style={{
                      borderLeftColor: entity.color,
                      borderLeftWidth: '4px'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{entity.name}</h4>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {entity.properties.length} props
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <Table className="w-3 h-3" />
                        <code>{entity.tableName}</code>
                      </div>
                      
                      {entity.properties.slice(0, 3).map((prop) => (
                        <div key={prop.id} className="flex items-center gap-2 ml-4">
                          {prop.isKey && <Key className="w-3 h-3 text-yellow-500" />}
                          {prop.isForeignKey && <Link2 className="w-3 h-3 text-blue-500" />}
                          <span className="font-mono">{prop.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {prop.type}
                          </Badge>
                        </div>
                      ))}
                      
                      {entity.properties.length > 3 && (
                        <div className="text-xs text-muted-foreground ml-4">
                          +{entity.properties.length - 3} more...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Migration Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Migration Timeline
              </CardTitle>
              <CardDescription>
                Database schema evolution history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {migrations.map((migration, index) => (
                    <div key={migration.id} className="relative">
                      {index < migrations.length - 1 && (
                        <div className="absolute left-4 top-8 w-0.5 h-16 bg-border" />
                      )}
                      
                      <div 
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                          selectedMigration === migration.id && 'ring-2 ring-primary',
                          migration.status === 'applied' && 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10',
                          migration.status === 'applying' && 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10 animate-pulse',
                          migration.status === 'pending' && 'border-muted-foreground/20'
                        )}
                        onClick={() => setSelectedMigration(migration.id)}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          migration.status === 'applied' && 'bg-green-500 text-white',
                          migration.status === 'applying' && 'bg-blue-500 text-white',
                          migration.status === 'pending' && 'bg-muted text-muted-foreground'
                        )}>
                          {migration.status === 'applied' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : migration.status === 'applying' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{migration.name}</h4>
                            <Badge 
                              variant={migration.status === 'applied' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {migration.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {migration.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <code>{migration.timestamp}</code>
                            <span>•</span>
                            <span>{migration.operations.length} operations</span>
                            {migration.duration && (
                              <>
                                <span>•</span>
                                <span>{migration.duration}s</span>
                              </>
                            )}
                          </div>
                          
                          {migration.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                runMigration(migration.id)
                              }}
                              disabled={migrationInProgress}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Apply Migration
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Center - Entity Details */}
        <div className="space-y-6">
          {selectedEntityData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: selectedEntityData.color }}
                  />
                  {selectedEntityData.name} Entity
                </CardTitle>
                <CardDescription>
                  Domain entity properties and database mapping
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Table className="w-4 h-4" />
                  <code>{selectedEntityData.tableName}</code>
                </div>

                {/* Properties */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Properties</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedEntityData.properties.map((prop) => (
                      <div key={prop.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {prop.isKey && <Key className="w-4 h-4 text-yellow-500" />}
                            {prop.isForeignKey && <Link2 className="w-4 h-4 text-blue-500" />}
                            <span className="font-mono font-medium">{prop.name}</span>
                          </div>
                          <Badge variant="outline">{prop.type}</Badge>
                        </div>
                        
                        {prop.constraints.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {prop.constraints.map((constraint, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {constraint}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          {prop.isRequired && <div>• Required field</div>}
                          {prop.maxLength && <div>• Max length: {prop.maxLength}</div>}
                          {prop.precision && <div>• Precision: {prop.precision},{prop.scale}</div>}
                          {prop.defaultValue && <div>• Default: {prop.defaultValue}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Relationships */}
                {selectedEntityData.relationships.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Relationships</h4>
                    {selectedEntityData.relationships.map((rel) => (
                      <div key={rel.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{rel.type}</Badge>
                          <div className="text-xs text-muted-foreground">
                            {rel.cascadeDelete && 'CASCADE DELETE'}
                          </div>
                        </div>
                        <div className="text-sm">
                          <code>{rel.fromEntity}.{rel.fromProperty}</code>
                          <ArrowRight className="w-4 h-4 inline mx-2" />
                          <code>{rel.toEntity}.{rel.toProperty}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* EF Core Configuration */}
          <Tabs defaultValue="configuration" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="configuration">EF Config</TabsTrigger>
              <TabsTrigger value="entity">Domain Entity</TabsTrigger>
              <TabsTrigger value="repository">Repository</TabsTrigger>
            </TabsList>

            <TabsContent value="configuration" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Entity Framework Configuration
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCodeView('config')}
                    >
                      {showCode.config ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Fluent API configuration for database mapping
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showCode.config ? (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 z-10"
                        onClick={() => navigator.clipboard.writeText(efCoreExamples.entityConfiguration)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <ScrollArea className="h-64 w-full">
                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                          <code>{efCoreExamples.entityConfiguration}</code>
                        </pre>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert>
                        <Settings className="h-4 w-4" />
                        <AlertTitle>Configuration Features</AlertTitle>
                        <AlertDescription className="space-y-2">
                          <ul className="space-y-1 text-sm">
                            <li>• Table and column name mapping</li>
                            <li>• Data type precision and constraints</li>
                            <li>• Foreign key relationships</li>
                            <li>• Indexes for performance optimization</li>
                            <li>• Check constraints for data integrity</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                      
                      <div className="text-center">
                        <Button onClick={() => toggleCodeView('config')}>
                          <Code className="w-4 h-4 mr-2" />
                          View Configuration Code
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="entity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Rich Domain Entity
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCodeView('entity')}
                    >
                      {showCode.entity ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Domain-driven entity with business logic and validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showCode.entity ? (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 z-10"
                        onClick={() => navigator.clipboard.writeText(efCoreExamples.domainEntity)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <ScrollArea className="h-64 w-full">
                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                          <code>{efCoreExamples.domainEntity}</code>
                        </pre>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert>
                        <Package className="h-4 w-4" />
                        <AlertTitle>Domain Entity Features</AlertTitle>
                        <AlertDescription className="space-y-2">
                          <ul className="space-y-1 text-sm">
                            <li>• Encapsulated business logic</li>
                            <li>• Validation in constructors and methods</li>
                            <li>• Domain events for side effects</li>
                            <li>• Private setters for data integrity</li>
                            <li>• Navigation properties for relationships</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                      
                      <div className="text-center">
                        <Button onClick={() => toggleCodeView('entity')}>
                          <Code className="w-4 h-4 mr-2" />
                          View Entity Code
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="repository" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Repository Pattern
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCodeView('repository')}
                    >
                      {showCode.repository ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Data access abstraction with LINQ and async patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showCode.repository ? (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 z-10"
                        onClick={() => navigator.clipboard.writeText(efCoreExamples.repositoryPattern)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <ScrollArea className="h-64 w-full">
                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                          <code>{efCoreExamples.repositoryPattern}</code>
                        </pre>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert>
                        <Database className="h-4 w-4" />
                        <AlertTitle>Repository Pattern Benefits</AlertTitle>
                        <AlertDescription className="space-y-2">
                          <ul className="space-y-1 text-sm">
                            <li>• Testable data access layer</li>
                            <li>• Query abstraction and reusability</li>
                            <li>• Async/await for scalability</li>
                            <li>• Include() for eager loading</li>
                            <li>• Specialized query methods</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                      
                      <div className="text-center">
                        <Button onClick={() => toggleCodeView('repository')}>
                          <Code className="w-4 h-4 mr-2" />
                          View Repository Code
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side - Migration Details & Query Insights */}
        <div className="space-y-6">
          {/* Migration Details */}
          {selectedMigration && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Migration Details
                </CardTitle>
                <CardDescription>
                  {migrations.find(m => m.id === selectedMigration)?.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {migrations.find(m => m.id === selectedMigration)?.operations.map((op, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{op.type}</Badge>
                        <span className="text-sm font-medium">{op.description}</span>
                      </div>
                    </div>
                    
                    <ScrollArea className="h-24 w-full">
                      <pre className="text-xs bg-muted p-3 rounded font-mono overflow-x-auto">
                        <code>{op.sql}</code>
                      </pre>
                    </ScrollArea>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Query Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Query Performance Insights
              </CardTitle>
              <CardDescription>
                Real-time database query analysis and optimization suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {queryInsights.map((insight) => (
                <div 
                  key={insight.id}
                  className={cn(
                    'p-3 border rounded-lg cursor-pointer transition-all',
                    selectedQuery === insight.id && 'ring-2 ring-primary',
                    insight.severity === 'high' && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10',
                    insight.severity === 'medium' && 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10',
                    insight.severity === 'low' && 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
                  )}
                  onClick={() => setSelectedQuery(insight.id === selectedQuery ? null : insight.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn(
                        'w-4 h-4',
                        insight.severity === 'high' && 'text-red-500',
                        insight.severity === 'medium' && 'text-yellow-500',
                        insight.severity === 'low' && 'text-green-500'
                      )} />
                      <Badge 
                        variant={insight.severity === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {insight.severity} priority
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {insight.executionTime}ms
                    </div>
                  </div>
                  
                  <ScrollArea className="h-16 w-full mb-2">
                    <code className="text-xs bg-muted/50 p-2 rounded block font-mono">
                      {insight.query}
                    </code>
                  </ScrollArea>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span>{insight.rowsReturned} rows returned</span>
                    <div className="flex items-center gap-2">
                      {insight.indexesUsed.length > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          {insight.indexesUsed.length} indexes used
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          No indexes
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {selectedQuery === insight.id && insight.recommendation && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-primary mt-0.5" />
                        <div>
                          <h5 className="text-sm font-medium mb-1">Optimization Recommendation</h5>
                          <p className="text-xs text-muted-foreground">
                            {insight.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Database Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Database Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Terminal className="w-4 h-4 mr-2" />
                Open Database Console
              </Button>
              
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Generate Migration Script
              </Button>
              
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Activity className="w-4 h-4 mr-2" />
                Run Performance Analysis
              </Button>
              
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Database className="w-4 h-4 mr-2" />
                Backup Database
              </Button>
              
              <Separator />
              
              <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertTitle>Learning Resources</AlertTitle>
                <AlertDescription className="text-sm">
                  Complete EF Core documentation with domain modeling patterns and performance optimization guides.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Module Navigation */}
      <ModuleNavigation moduleId="database" />
    </div>
  )
}