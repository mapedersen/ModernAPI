import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { CheckCircle, Code, Database, Server, FileText, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/guides/add-entity')({
  component: AddEntityGuideComponent,
})

function AddEntityGuideComponent() {
  const steps = [
    { id: 1, title: 'Domain Entity', completed: false },
    { id: 2, title: 'Domain Events', completed: false },
    { id: 3, title: 'Repository Interface', completed: false },
    { id: 4, title: 'EF Configuration', completed: false },
    { id: 5, title: 'Repository Implementation', completed: false },
    { id: 6, title: 'DTOs & Mapping', completed: false },
    { id: 7, title: 'Application Service', completed: false },
    { id: 8, title: 'API Controller', completed: false },
    { id: 9, title: 'Database Migration', completed: false },
  ]

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Code className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Adding New Entities</h1>
            <p className="text-muted-foreground">Complete workflow for adding domain entities with all layers</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Guides</Badge>
          <Badge variant="outline">Intermediate</Badge>
          <span className="text-sm text-muted-foreground">• 15 min read</span>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Implementation Steps
          </CardTitle>
          <CardDescription>
            Follow these 9 steps to properly implement a new entity following Clean Architecture principles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map((step) => (
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domain">Domain Layer</TabsTrigger>
          <TabsTrigger value="application">Application Layer</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Example: Product Entity */}
          <Card>
            <CardHeader>
              <CardTitle>Example: Product Entity</CardTitle>
              <CardDescription>
                We'll walk through adding a Product entity with pricing, inventory, and category relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Business Requirements</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Products have names, descriptions, and SKUs</li>
                  <li>• Track inventory levels and pricing</li>
                  <li>• Support multiple categories per product</li>
                  <li>• Audit creation and modification times</li>
                  <li>• Soft delete with deactivation dates</li>
                </ul>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">What We'll Build</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Rich domain entity with business logic</li>
                    <li>• Repository pattern for data access</li>
                    <li>• Application services for use cases</li>
                    <li>• RESTful API endpoints</li>
                    <li>• Complete test coverage</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Architecture Benefits</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Business logic in the domain</li>
                    <li>• Testable without dependencies</li>
                    <li>• Consistent data access patterns</li>
                    <li>• Clean API design</li>
                    <li>• Easy to extend and modify</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Files You'll Create
              </CardTitle>
              <CardDescription>
                Complete list of files needed for the Product entity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm"><code>{`ModernAPI.Domain/
├── Entities/
│   └── Product.cs                    # Step 1: Domain entity
├── Events/
│   ├── ProductCreatedEvent.cs       # Step 2: Domain events
│   ├── ProductPriceChangedEvent.cs
│   └── ProductDiscontinuedEvent.cs
└── Interfaces/
    └── IProductRepository.cs        # Step 3: Repository contract

ModernAPI.Infrastructure/
├── Data/Configurations/
│   └── ProductConfiguration.cs      # Step 4: EF configuration
├── Repositories/
│   └── ProductRepository.cs         # Step 5: Repository implementation
└── Migrations/
    └── 20240101_AddProductEntity.cs # Step 9: Database migration

ModernAPI.Application/
├── DTOs/
│   ├── ProductDtos.cs              # Step 6: Data transfer objects
│   └── ProductMappings.cs          # Step 6: AutoMapper profiles
├── Services/
│   └── ProductService.cs           # Step 7: Application service
└── Interfaces/
    └── IProductService.cs          # Step 7: Service contract

ModernAPI.API/
└── Controllers/
    └── ProductsController.cs       # Step 8: API controller`}</code></pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain" className="space-y-6">
          {/* Step 1: Domain Entity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">1</div>
                Create Domain Entity
              </CardTitle>
              <CardDescription>
                ModernAPI.Domain/Entities/Product.cs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm"><code>{`public class Product : Entity<Guid>
{
    // Private setters enforce business rules
    public string Name { get; private set; }
    public string Description { get; private set; }
    public string Sku { get; private set; }
    public decimal Price { get; private set; }
    public int StockQuantity { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public DateTime? DiscontinuedAt { get; private set; }

    // Private constructor for EF Core
    private Product() { }

    // Public constructor with business validation
    public Product(string name, string description, string sku, decimal price, int stockQuantity)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Product name is required", nameof(name));
        
        if (string.IsNullOrWhiteSpace(sku))
            throw new ArgumentException("Product SKU is required", nameof(sku));
            
        if (price < 0)
            throw new ArgumentException("Price cannot be negative", nameof(price));
            
        if (stockQuantity < 0)
            throw new ArgumentException("Stock quantity cannot be negative", nameof(stockQuantity));

        Id = Guid.NewGuid();
        Name = name;
        Description = description ?? string.Empty;
        Sku = sku;
        Price = price;
        StockQuantity = stockQuantity;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;

        // Raise domain event
        RaiseDomainEvent(new ProductCreatedEvent(Id, Name, Sku, Price));
    }

    // Business methods
    public void UpdatePrice(decimal newPrice)
    {
        if (newPrice < 0)
            throw new ArgumentException("Price cannot be negative", nameof(newPrice));

        var oldPrice = Price;
        Price = newPrice;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new ProductPriceChangedEvent(Id, oldPrice, newPrice));
    }

    public void AdjustStock(int quantity)
    {
        if (StockQuantity + quantity < 0)
            throw new InvalidOperationException("Insufficient stock for this operation");

        StockQuantity += quantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Discontinue()
    {
        IsActive = false;
        DiscontinuedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new ProductDiscontinuedEvent(Id, Name));
    }
}`}</code></pre>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">Key Patterns</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• <strong>Private setters:</strong> Enforce business rules through methods</li>
                  <li>• <strong>Rich constructor:</strong> Ensure valid object creation</li>
                  <li>• <strong>Business methods:</strong> Encapsulate domain logic</li>
                  <li>• <strong>Domain events:</strong> Notify other parts of the system</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Domain Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">2</div>
                Create Domain Events
              </CardTitle>
              <CardDescription>
                ModernAPI.Domain/Events/ProductEvents.cs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm"><code>{`// Product created event
public record ProductCreatedEvent(
    Guid ProductId,
    string Name,
    string Sku,
    decimal Price
) : DomainEvent;

// Product price changed event  
public record ProductPriceChangedEvent(
    Guid ProductId,
    decimal OldPrice,
    decimal NewPrice
) : DomainEvent;

// Product discontinued event
public record ProductDiscontinuedEvent(
    Guid ProductId,
    string Name
) : DomainEvent;

// Event handlers (in Application layer)
public class ProductEventHandlers : 
    INotificationHandler<ProductCreatedEvent>,
    INotificationHandler<ProductPriceChangedEvent>
{
    private readonly ILogger<ProductEventHandlers> _logger;
    
    public async Task Handle(ProductCreatedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Product created: {ProductId} - {Name}", 
            notification.ProductId, notification.Name);
        
        // Could trigger: inventory setup, catalog updates, etc.
    }
    
    public async Task Handle(ProductPriceChangedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Product price changed: {ProductId} from {OldPrice} to {NewPrice}",
            notification.ProductId, notification.OldPrice, notification.NewPrice);
            
        // Could trigger: price alerts, competitor analysis, etc.
    }
}`}</code></pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="application" className="space-y-6">
          {/* Step 6: DTOs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">6</div>
                Create DTOs & Mapping
              </CardTitle>
              <CardDescription>
                ModernAPI.Application/DTOs/ProductDtos.cs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm"><code>{`// Response DTOs
public record ProductDto(
    Guid Id,
    string Name,
    string Description,
    string Sku,
    decimal Price,
    int StockQuantity,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record ProductResponse(
    ProductDto Product,
    string? Message = null
);

public record ProductListResponse(
    IReadOnlyList<ProductDto> Products,
    int TotalCount,
    int PageNumber,
    int PageSize
);

// Request DTOs
public record CreateProductRequest(
    [Required] string Name,
    string? Description,
    [Required] string Sku,
    [Range(0, double.MaxValue)] decimal Price,
    [Range(0, int.MaxValue)] int StockQuantity
);

public record UpdateProductRequest(
    string Name,
    string? Description,
    [Range(0, double.MaxValue)] decimal Price
);

public record AdjustStockRequest(
    [Range(-10000, 10000)] int Adjustment,
    string? Reason
);

// AutoMapper Profile
public class ProductMappingProfile : Profile
{
    public ProductMappingProfile()
    {
        CreateMap<Product, ProductDto>();
        CreateMap<CreateProductRequest, Product>()
            .ConstructUsing(src => new Product(src.Name, src.Description ?? "", src.Sku, src.Price, src.StockQuantity));
    }
}`}</code></pre>
              </div>
            </CardContent>
          </Card>

          {/* Step 7: Application Service */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">7</div>
                Create Application Service
              </CardTitle>
              <CardDescription>
                ModernAPI.Application/Services/ProductService.cs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm"><code>{`public interface IProductService
{
    Task<ProductResponse> CreateProductAsync(CreateProductRequest request, CancellationToken cancellationToken = default);
    Task<ProductDto> GetProductByIdAsync(Guid productId, CancellationToken cancellationToken = default);
    Task<ProductListResponse> GetProductsAsync(int pageNumber = 1, int pageSize = 10, CancellationToken cancellationToken = default);
    Task<ProductResponse> UpdateProductAsync(Guid productId, UpdateProductRequest request, CancellationToken cancellationToken = default);
    Task AdjustStockAsync(Guid productId, AdjustStockRequest request, CancellationToken cancellationToken = default);
    Task DiscontinueProductAsync(Guid productId, CancellationToken cancellationToken = default);
}

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<ProductService> _logger;

    public ProductService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<ProductService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<ProductResponse> CreateProductAsync(CreateProductRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating product with SKU: {Sku}", request.Sku);

        // Check if SKU already exists
        var existingProduct = await _unitOfWork.Products.GetBySkuAsync(request.Sku, cancellationToken);
        if (existingProduct != null)
        {
            throw new ConflictException("Product", request.Sku, "A product with this SKU already exists");
        }

        var product = new Product(request.Name, request.Description ?? "", request.Sku, request.Price, request.StockQuantity);

        await _unitOfWork.Products.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var productDto = _mapper.Map<ProductDto>(product);
        return new ProductResponse(productDto, "Product created successfully");
    }

    public async Task<ProductDto> GetProductByIdAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(productId, cancellationToken);
        if (product == null)
        {
            throw new NotFoundException("Product", productId.ToString());
        }

        return _mapper.Map<ProductDto>(product);
    }

    public async Task AdjustStockAsync(Guid productId, AdjustStockRequest request, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(productId, cancellationToken);
        if (product == null)
        {
            throw new NotFoundException("Product", productId.ToString());
        }

        product.AdjustStock(request.Adjustment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Stock adjusted for product {ProductId} by {Adjustment}. Reason: {Reason}",
            productId, request.Adjustment, request.Reason ?? "Not specified");
    }
}`}</code></pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-6">
          {/* Step 3: Repository Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">3</div>
                Repository Interface
              </CardTitle>
              <CardDescription>
                ModernAPI.Domain/Interfaces/IProductRepository.cs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm"><code>{`public interface IProductRepository : IRepository<Product, Guid>
{
    Task<Product?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default);
    Task<bool> IsSkuUniqueAsync(string sku, Guid? excludeProductId = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Product>> GetActiveProductsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Product>> GetLowStockProductsAsync(int threshold = 10, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Product>> SearchProductsAsync(string searchTerm, CancellationToken cancellationToken = default);
}`}</code></pre>
              </div>
            </CardContent>
          </Card>

          {/* Step 8: API Controller */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">8</div>
                API Controller
              </CardTitle>
              <CardDescription>
                ModernAPI.API/Controllers/ProductsController.cs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm"><code>{`[Route("api/[controller]")]
public class ProductsController : BaseController
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpPost]
    public async Task<ActionResult<ProductResponse>> CreateProduct(
        [FromBody] CreateProductRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _productService.CreateProductAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetProduct), new { id = result.Product.Id }, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductDto>> GetProduct(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var product = await _productService.GetProductByIdAsync(id, cancellationToken);
        return Ok(product);
    }

    [HttpGet]
    public async Task<ActionResult<ProductListResponse>> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int size = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _productService.GetProductsAsync(page, size, cancellationToken);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProductResponse>> UpdateProduct(
        [FromRoute] Guid id,
        [FromBody] UpdateProductRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _productService.UpdateProductAsync(id, request, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/stock")]
    public async Task<ActionResult> AdjustStock(
        [FromRoute] Guid id,
        [FromBody] AdjustStockRequest request,
        CancellationToken cancellationToken)
    {
        await _productService.AdjustStockAsync(id, request, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DiscontinueProduct(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        await _productService.DiscontinueProductAsync(id, cancellationToken);
        return NoContent();
    }
}`}</code></pre>
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
            Complete the implementation with testing and migration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Testing</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Write domain entity tests</li>
                <li>• Test repository implementations</li>
                <li>• Unit test application services</li>
                <li>• Integration test API endpoints</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Database Migration</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Run: dotnet ef migrations add AddProduct</li>
                <li>• Review generated migration</li>
                <li>• Apply: dotnet ef database update</li>
                <li>• Verify database schema</li>
              </ul>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button className="gap-2">
              <Database className="w-4 h-4" />
              View Database Guide
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Code className="w-4 h-4" />
              Testing Patterns
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}