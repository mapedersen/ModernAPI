# ModernAPI - AI-Friendly Development Guide

## 🤖 Claude Code Integration

This template is designed for seamless AI-assisted development with Claude Code and other AI tools.

## 📋 Architecture Overview

### Clean Architecture Layers

```
┌─────────────────┐
│   API Layer     │ ← Controllers, Middleware, HTTP concerns
├─────────────────┤
│ Application     │ ← Services, DTOs, Use Cases
├─────────────────┤
│ Infrastructure  │ ← Database, Repositories, External Services  
├─────────────────┤
│    Domain       │ ← Business Logic, Entities, Value Objects
└─────────────────┘
```

### Key Patterns
- **Domain-Driven Design (DDD)**: Rich entities with business logic
- **Repository Pattern**: Data access abstraction
- **Unit of Work**: Transaction management
- **CQRS-inspired**: Separate DTOs for commands and queries
- **Native Identity Integration**: ASP.NET Core Identity with custom User entity

## 🏗️ Entity Structure

### Current Entities

#### User Entity (`ModernAPI.Domain.Entities.User`)
- **Base**: `IdentityUser<Guid>` (native ASP.NET Core Identity)
- **Key Properties**: 
  - `DisplayName`, `FirstName`, `LastName`
  - `IsActive`, `IsEmailVerified` 
  - `CreatedAt`, `UpdatedAt`, `DeactivatedAt`
- **Domain Methods**: `UpdateProfile()`, `ChangeEmail()`, `Deactivate()`, etc.
- **Events**: `UserCreatedEvent`, `UserEmailChangedEvent`, etc.

### Domain Events
Located in `ModernAPI.Domain.Events/`
- All events use `Guid` for user references
- Events are `record` types implementing `IDomainEvent`

## 🛠️ Development Patterns

### Adding New Entities

1. **Domain Entity** (`ModernAPI.Domain.Entities/`)
   ```csharp
   public class Product : Entity<Guid>
   {
       public string Name { get; private set; }
       public decimal Price { get; private set; }
       
       // Constructor with business validation
       public Product(string name, decimal price)
       {
           if (string.IsNullOrWhiteSpace(name))
               throw new ArgumentException("Name is required");
               
           Id = Guid.NewGuid();
           Name = name;
           Price = price;
           
           RaiseDomainEvent(new ProductCreatedEvent(Id, name, price));
       }
       
       // Domain methods for business operations
       public void UpdatePrice(decimal newPrice)
       {
           if (newPrice < 0)
               throw new ArgumentException("Price cannot be negative");
               
           var oldPrice = Price;
           Price = newPrice;
           
           RaiseDomainEvent(new ProductPriceUpdatedEvent(Id, oldPrice, newPrice));
       }
   }
   ```

2. **Domain Events** (`ModernAPI.Domain.Events/`)
   ```csharp
   public record ProductCreatedEvent(
       Guid ProductId,
       string Name,
       decimal Price
   ) : DomainEvent;
   ```

3. **Repository Interface** (`ModernAPI.Domain.Interfaces/`)
   ```csharp
   public interface IProductRepository : IRepository<Product, Guid>
   {
       Task<Product?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
       Task<IReadOnlyList<Product>> GetByPriceRangeAsync(decimal minPrice, decimal maxPrice, CancellationToken cancellationToken = default);
   }
   ```

4. **Repository Implementation** (`ModernAPI.Infrastructure.Repositories/`)
   ```csharp
   public class ProductRepository : Repository<Product, Guid>, IProductRepository
   {
       public ProductRepository(ApplicationDbContext context) : base(context) { }
       
       public async Task<Product?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
       {
           return await Context.Products
               .FirstOrDefaultAsync(p => p.Name == name, cancellationToken);
       }
   }
   ```

5. **EF Configuration** (`ModernAPI.Infrastructure.Data.Configurations/`)
   ```csharp
   public class ProductConfiguration : IEntityTypeConfiguration<Product>
   {
       public void Configure(EntityTypeBuilder<Product> builder)
       {
           builder.ToTable("products");
           
           builder.HasKey(p => p.Id);
           builder.Property(p => p.Id).HasColumnName("id");
           
           builder.Property(p => p.Name)
               .HasColumnName("name")
               .HasMaxLength(200)
               .IsRequired();
               
           builder.Property(p => p.Price)
               .HasColumnName("price")
               .HasPrecision(10, 2)
               .IsRequired();
               
           // Ignore domain events (not persisted)
           builder.Ignore(p => p.DomainEvents);
       }
   }
   ```

6. **DTOs** (`ModernAPI.Application.DTOs/`)
   ```csharp
   public record ProductDto(
       Guid Id,
       string Name,
       decimal Price,
       DateTime CreatedAt
   );
   
   public record CreateProductRequest(
       string Name,
       decimal Price
   );
   
   public record ProductResponse(
       ProductDto Product,
       string? Message = null
   );
   ```

7. **Service Interface** (`ModernAPI.Application.Interfaces/`)
   ```csharp
   public interface IProductService
   {
       Task<ProductResponse> CreateProductAsync(CreateProductRequest request, CancellationToken cancellationToken = default);
       Task<ProductDto> GetProductByIdAsync(Guid productId, CancellationToken cancellationToken = default);
   }
   ```

8. **Service Implementation** (`ModernAPI.Application.Services/`)
   ```csharp
   public class ProductService : IProductService
   {
       private readonly IUnitOfWork _unitOfWork;
       private readonly IMapper _mapper;
       private readonly ILogger<ProductService> _logger;
       
       public async Task<ProductResponse> CreateProductAsync(CreateProductRequest request, CancellationToken cancellationToken = default)
       {
           _logger.LogInformation("Creating product with name: {Name}", request.Name);
           
           var product = new Product(request.Name, request.Price);
           
           await _unitOfWork.Products.AddAsync(product, cancellationToken);
           await _unitOfWork.SaveChangesAsync(cancellationToken);
           
           return _mapper.MapToProductResponse(product, "Product created successfully");
       }
   }
   ```

9. **Controller** (`ModernAPI.API.Controllers/`)
   ```csharp
   [Route("api/[controller]")]
   public class ProductsController : BaseController
   {
       private readonly IProductService _productService;
       
       [HttpPost]
       public async Task<ActionResult<ProductResponse>> CreateProduct([FromBody] CreateProductRequest request, CancellationToken cancellationToken)
       {
           var result = await _productService.CreateProductAsync(request, cancellationToken);
           return CreatedAtAction(nameof(GetProduct), new { id = result.Product.Id }, result);
       }
   }
   ```

## 🧪 Testing Patterns

### Domain Tests (TDD + DDD)
```csharp
[Fact]
public void Constructor_WithValidData_ShouldCreateProduct()
{
    // Arrange
    var name = "Test Product";
    var price = 99.99m;
    
    // Act
    var product = new Product(name, price);
    
    // Assert
    product.Name.Should().Be(name);
    product.Price.Should().Be(price);
    product.DomainEvents.Should().ContainSingle()
        .Which.Should().BeOfType<ProductCreatedEvent>();
}

[Fact]
public void UpdatePrice_WithNegativeValue_ShouldThrowArgumentException()
{
    // Arrange
    var product = new Product("Test", 10.00m);
    
    // Act & Assert
    var exception = Assert.Throws<ArgumentException>(() => product.UpdatePrice(-5.00m));
    exception.Message.Should().Contain("Price cannot be negative");
}
```

### Application Tests
```csharp
[Fact]
public async Task CreateProductAsync_WithValidRequest_ShouldReturnProduct()
{
    // Arrange
    var request = new CreateProductRequest("Test Product", 99.99m);
    
    // Act
    var result = await _productService.CreateProductAsync(request);
    
    // Assert
    result.Product.Name.Should().Be(request.Name);
    result.Message.Should().Be("Product created successfully");
    
    VerifyProductWasAdded();
}
```

## 🗄️ Database Conventions

### Naming
- **Tables**: `snake_case` (products, user_roles)
- **Columns**: `snake_case` (display_name, created_at)
- **Primary Keys**: `id`
- **Foreign Keys**: `{entity}_id` (user_id, product_id)

### Migrations
```bash
# Create migration
dotnet ef migrations add AddProductEntity --project ModernAPI.Infrastructure --startup-project ModernAPI.API

# Apply migration
dotnet ef database update --project ModernAPI.Infrastructure --startup-project ModernAPI.API
```

## 🔧 Key Services & Dependencies

### Already Configured
- **Database**: PostgreSQL with EF Core
- **Identity**: ASP.NET Core Identity with User entity
- **Logging**: Serilog with structured logging
- **Mapping**: AutoMapper with custom extensions
- **Validation**: FluentValidation
- **Documentation**: Scalar UI
- **Health Checks**: Database connectivity

### Service Registration Pattern
```csharp
// In ModernAPI.Application.Common.DependencyInjection
services.AddScoped<IProductService, ProductService>();

// In ModernAPI.Infrastructure.Common.DependencyInjection  
services.AddScoped<IProductRepository, ProductRepository>();
```

## 🌐 API Patterns

### Base Controller
All controllers inherit from `BaseController` with common functionality:
- Standardized error responses
- User context access
- Common HTTP status mappings

### Response Patterns
```csharp
// Success with data
return Ok(new ProductResponse(product, "Product created successfully"));

// Created
return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, result);

// Not found
throw new NotFoundException("Product", productId);

// Conflict
throw new ConflictException("Product", name, "Product with this name already exists");
```

## 🎯 AI Development Tips

### Best Practices for AI Assistance

1. **Descriptive Method Names**
   ```csharp
   // Good - AI understands intent
   public void UpdateProductPrice(decimal newPrice)
   public void DeactivateUserAccount()
   
   // Avoid - unclear intent
   public void Update(decimal value)
   public void Change()
   ```

2. **Comprehensive Tests as Documentation**
   ```csharp
   [Fact]
   public void Should_PreventDeactivatedUsersFromChangingEmail()
   {
       // AI can read this like a specification
   }
   ```

3. **Domain Events for Business Clarity**
   ```csharp
   // AI understands business flow
   RaiseDomainEvent(new ProductPriceUpdatedEvent(Id, oldPrice, newPrice));
   ```

4. **Rich Exception Messages**
   ```csharp
   throw new UserNotActiveException(userId, "Deactivated users cannot change email addresses");
   ```

## 🚨 Exception Handling Patterns

ModernAPI implements comprehensive global exception handling with RFC 7807 Problem Details standard.

### Exception Types & Usage

1. **Domain Exceptions** (Business Rule Violations)
   ```csharp
   // Create new domain exception
   public class ProductOutOfStockException : DomainException
   {
       public Guid ProductId { get; }
       
       public ProductOutOfStockException(Guid productId) 
           : base("PRODUCT_OUT_OF_STOCK", $"Product {productId} is out of stock")
       {
           ProductId = productId;
       }
   }
   
   // Use in domain entity
   public void Reserve(int quantity)
   {
       if (Stock < quantity)
           throw new ProductOutOfStockException(Id);
   }
   ```

2. **Application Exceptions** (Service Layer Issues)
   ```csharp
   // Not found - entity doesn't exist
   throw new NotFoundException("Product", productId.ToString());
   
   // Conflict - business constraint violation
   throw new ConflictException("Product", request.Sku, "SKU already exists");
   
   // Validation - input validation failed
   var errors = new Dictionary<string, string[]>
   {
       ["Price"] = new[] { "Price must be greater than 0" }
   };
   throw new ValidationException(errors);
   ```

3. **Automatic Error Response Generation**
   - All exceptions automatically convert to RFC 7807 Problem Details
   - Includes correlation IDs for request tracing
   - Development vs Production security (no sensitive data leakage)

### Error Response Examples

```json
// 400 Bad Request - Business Rule
{
  "type": "https://modernapi.example.com/problems/domain/product_out_of_stock",
  "title": "Business rule violation",
  "status": 400,
  "detail": "Product 123e4567-e89b-12d3-a456-426614174000 is out of stock",
  "errorCode": "PRODUCT_OUT_OF_STOCK",
  "requestId": "0HMVBP9JK9J6C:00000001",
  "timestamp": "2025-08-08T01:30:00.123Z"
}

// 404 Not Found
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Resource not found",
  "status": 404,
  "detail": "Product with ID '123e4567-e89b-12d3-a456-426614174000' was not found",
  "requestId": "0HMVBP9JK9J6C:00000002",
  "timestamp": "2025-08-08T01:30:00.123Z"
}
```

### Global Exception Middleware Features

- **Structured Logging**: Request context, user info, correlation IDs
- **Security**: Hides sensitive information in production
- **Standards Compliant**: RFC 7807 Problem Details format
- **Client-Friendly**: Consistent error structure for all exceptions
- **Debugging**: Full context in development, minimal in production

### Documentation References

- **API Consumers**: See `/docs/ERROR_HANDLING.md` for complete error response format
- **Developers**: See `/docs/DEVELOPER_TROUBLESHOOTING.md` for debugging guide
- **Testing**: Exception middleware has 21 comprehensive test cases

## 📁 File Organization

```
ModernAPI/
├── backend/
│   ├── ModernAPI.Domain/           # Core business logic
│   │   ├── Entities/              # Domain entities
│   │   ├── ValueObjects/          # Value objects
│   │   ├── Events/                # Domain events
│   │   ├── Exceptions/            # Domain exceptions
│   │   └── Interfaces/            # Repository interfaces
│   ├── ModernAPI.Application/     # Use cases and services
│   │   ├── Services/              # Application services
│   │   ├── DTOs/                  # Data transfer objects
│   │   ├── Interfaces/            # Service interfaces
│   │   ├── Mappings/              # AutoMapper profiles
│   │   └── Validators/            # FluentValidation
│   ├── ModernAPI.Infrastructure/  # External concerns
│   │   ├── Data/                  # EF Core context and configurations
│   │   ├── Repositories/          # Repository implementations
│   │   └── Common/                # Infrastructure services
│   └── ModernAPI.API/             # HTTP layer
│       ├── Controllers/           # API controllers
│       ├── Middleware/            # Custom middleware
│       └── Program.cs             # App configuration
└── tests/                         # All test projects
```

## 🚀 Getting Started

1. **Add New Entity**: Follow the 9-step pattern above
2. **Run Tests**: `dotnet test` (Domain tests are the foundation)
3. **Create Migration**: Use EF Core commands
4. **Test API**: Use Scalar UI at http://localhost:5051/scalar/v1
5. **Document Changes**: Update this CLAUDE.md file

## 📊 Current Status

- ✅ **Domain Layer**: 100% tested, production-ready
- ✅ **API**: Fully functional with database integration  
- ✅ **Authentication**: ASP.NET Core Identity configured
- ⚠️ **Application Tests**: Template tests need minor assertion updates
- 📋 **TODO**: Complete middleware, JWT endpoints, React frontend

## 🎯 AI-Friendly Development Workflow

1. **Understand Business Requirements**
2. **Write Domain Tests First** (TDD approach)
3. **Implement Domain Logic** (rich entities with business rules)
4. **Create Application Services** (orchestration and DTOs)
5. **Add Repository Implementation** (data access)
6. **Build API Controllers** (HTTP layer)
7. **Test Integration** (real database, API calls)

This template provides a **rock-solid foundation** for building modern SaaS applications with AI assistance. The clear patterns, comprehensive documentation, and clean architecture make it easy for AI tools to understand and extend the codebase.