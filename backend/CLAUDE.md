# ModernAPI Codebase Guide for AI Assistants

## Overview

This is a .NET 9 Web API project implementing Clean Architecture with JWT authentication, PostgreSQL database, and comprehensive error handling. The project serves as a production-ready template for building modern APIs.

## Architecture

### Layer Responsibilities

```
┌─────────────────────────────────────────────────────────────────┐
│ API Layer (ModernAPI.API)                                       │
│ • HTTP concerns: Controllers, Middleware, Filters               │
│ • Dependency injection configuration                            │
│ • Request/Response handling                                     │
│ • No business logic                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │ References
┌────────────────────▼────────────────────────────────────────────┐
│ Application Layer (ModernAPI.Application)                       │
│ • Business logic orchestration                                  │
│ • Application services                                          │
│ • DTOs and mappings                                            │
│ • Input validation                                             │
│ • Interfaces for infrastructure                                │
└────────────────────┬────────────────────────────────────────────┘
                     │ References
┌────────────────────▼────────────────────────────────────────────┐
│ Domain Layer (ModernAPI.Domain)                                 │
│ • Core business entities                                        │
│ • Value objects                                                 │
│ • Domain events                                                 │
│ • Business rules and invariants                                │
│ • Repository interfaces                                         │
└────────────────────┬────────────────────────────────────────────┘
                     │ Referenced by
┌────────────────────▼────────────────────────────────────────────┐
│ Infrastructure Layer (ModernAPI.Infrastructure)                 │
│ • Data access (EF Core)                                        │
│ • External service integrations                                │
│ • Repository implementations                                    │
│ • Database configurations                                       │
└──────────────────────────────────────────────────────────────────┘
```

### Key Design Patterns

1. **Repository Pattern**: Abstract data access through interfaces
2. **Unit of Work**: Coordinate changes across repositories
3. **Domain Events**: Decouple domain logic from side effects
4. **Value Objects**: Encapsulate validation and business rules
5. **DTOs**: Separate API contracts from domain models
6. **Dependency Injection**: Loose coupling between layers

## Authentication System

### Components

1. **JWT Tokens**:
   - Access tokens (15 min expiry)
   - Refresh tokens (7-30 days)
   - HMAC SHA256 signing

2. **Services**:
   - `AuthService`: Authentication orchestration
   - `JwtTokenService`: Token generation/validation
   - `PasswordService`: Password validation (abstracts ASP.NET Identity)

3. **Entities**:
   - `User`: Domain entity with business rules
   - `RefreshToken`: Token storage and validation

### Authentication Flow

```
Client → AuthController → AuthService → UserManager/PasswordService
                                     ↓
                              JwtTokenService
                                     ↓
                              Database (via UnitOfWork)
```

## Database

### Entity Framework Core Setup

- **Provider**: PostgreSQL (Npgsql)
- **Migrations**: Code-first with migrations in Infrastructure layer
- **Configuration**: Fluent API configurations in `Data/Configurations/`
- **Context**: `ApplicationDbContext` extends `IdentityDbContext`

### Key Tables

- `users`: ASP.NET Identity users with custom properties
- `refresh_tokens`: JWT refresh token storage
- `asp_net_*`: Identity framework tables

## Error Handling

### Global Exception Middleware

Location: `ModernAPI.API/Middleware/ExceptionMiddleware.cs`

Handles:
- Domain exceptions → 400 Bad Request
- Validation exceptions → 400 with field errors
- Not found exceptions → 404
- Conflict exceptions → 409
- Unauthorized → 401
- Unhandled → 500 (with details in dev)

### Response Format

RFC 7807 Problem Details:
```json
{
  "type": "error-type-uri",
  "title": "Error summary",
  "status": 400,
  "detail": "Detailed message",
  "instance": "/api/endpoint",
  "requestId": "unique-id",
  "timestamp": "2025-08-08T00:00:00Z"
}
```

## Entity Scaffolding Tool

ModernAPI includes a powerful CLI tool for generating Clean Architecture boilerplate code:

### Installation
```bash
# Install the scaffolding tool globally
cd tools/ModernAPI.Scaffolding
dotnet pack
dotnet tool install --global --add-source ./nupkg ModernAPI.Scaffolding
```

### Usage
```bash
# Generate complete entity with all layers
modernapi scaffold entity Product --properties "Name:string:required,Price:decimal:range(0,*),Description:string"

# Entity with foreign keys
modernapi scaffold entity Order --properties "CustomerName:string:required,Total:decimal:required,CustomerId:Guid:foreign(Customer)"

# Without authentication requirements
modernapi scaffold entity PublicData --properties "Title:string:required,Content:string" --no-auth
```

### Generated Files
For entity `Product`, automatically generates:
- `Domain/Entities/Product.cs` - Entity with business logic
- `Domain/Interfaces/IProductRepository.cs` - Repository interface
- `Infrastructure/Repositories/ProductRepository.cs` - EF Core repository
- `Infrastructure/Data/Configurations/ProductConfiguration.cs` - EF configuration
- `Application/DTOs/ProductDtos.cs` - Request/Response DTOs
- `Application/Interfaces/IProductService.cs` - Service interface
- `Application/Services/ProductService.cs` - Business logic service
- `Application/Validators/ProductValidators.cs` - FluentValidation rules
- `API/Controllers/ProductsController.cs` - HTTP endpoints

**Time Savings**: New entity creation: 2-3 hours → 5 minutes

For full documentation, see: `tools/ModernAPI.Scaffolding/README.md`

## Common Tasks

### Adding a New Entity (Manual Process)

*Note: Use the scaffolding tool above for automated generation*

1. **Domain Layer**:
   ```csharp
   // ModernAPI.Domain/Entities/Product.cs
   public class Product
   {
       public Guid Id { get; private set; }
       public string Name { get; private set; }
       // Business logic here
   }
   ```

2. **Repository Interface**:
   ```csharp
   // ModernAPI.Domain/Interfaces/IProductRepository.cs
   public interface IProductRepository
   {
       Task<Product?> GetByIdAsync(Guid id);
   }
   ```

3. **Infrastructure Implementation**:
   ```csharp
   // ModernAPI.Infrastructure/Repositories/ProductRepository.cs
   public class ProductRepository : IProductRepository
   {
       // EF Core implementation
   }
   ```

4. **Configuration**:
   ```csharp
   // ModernAPI.Infrastructure/Data/Configurations/ProductConfiguration.cs
   public class ProductConfiguration : IEntityTypeConfiguration<Product>
   {
       // EF Core configuration
   }
   ```

5. **Update DbContext**:
   ```csharp
   public DbSet<Product> Products { get; set; }
   ```

6. **Create Migration**:
   ```bash
   dotnet ef migrations add AddProduct --project ModernAPI.Infrastructure --startup-project ModernAPI.API
   ```

### Adding a New API Endpoint

1. **Create DTOs**:
   ```csharp
   // ModernAPI.Application/DTOs/ProductDtos.cs
   public record CreateProductRequest(string Name, decimal Price);
   public record ProductDto(Guid Id, string Name, decimal Price);
   ```

2. **Create Service Interface**:
   ```csharp
   // ModernAPI.Application/Interfaces/IProductService.cs
   public interface IProductService
   {
       Task<ProductDto> CreateAsync(CreateProductRequest request);
   }
   ```

3. **Implement Service**:
   ```csharp
   // ModernAPI.Application/Services/ProductService.cs
   public class ProductService : IProductService
   {
       // Implementation
   }
   ```

4. **Create Controller**:
   ```csharp
   // ModernAPI.API/Controllers/ProductsController.cs
   [ApiController]
   [Route("api/[controller]")]
   public class ProductsController : ControllerBase
   {
       // Endpoints
   }
   ```

### Adding Authentication to Endpoint

```csharp
[Authorize] // Requires authentication
[HttpGet("protected")]
public async Task<IActionResult> GetProtected()
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    // Implementation
}

[Authorize(Roles = "Admin")] // Requires specific role
[HttpDelete("{id}")]
public async Task<IActionResult> Delete(Guid id)
{
    // Admin-only operation
}
```

## Configuration

### Environment Variables

Priority order:
1. Environment variables
2. appsettings.{Environment}.json
3. appsettings.json

Key variables:
- `POSTGRES_CONNECTION_STRING`: Database connection
- `JwtSettings__Secret`: JWT signing key
- `ASPNETCORE_ENVIRONMENT`: Development/Production

### appsettings.json Structure

```json
{
  "JwtSettings": {
    "Secret": "minimum-32-characters",
    "Issuer": "ModernAPI",
    "Audience": "ModernAPI.Users",
    "AccessTokenExpiryInMinutes": 15,
    "RefreshTokenExpiryInDays": 7
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

## Testing Strategy

### Test Projects

1. **ModernAPI.Domain.Tests**: Domain logic, entities, value objects
2. **ModernAPI.Application.Tests**: Services, validation, mappings
3. **ModernAPI.Infrastructure.Tests**: Repositories, data access
4. **ModernAPI.API.Tests**: Controllers, middleware
5. **ModernAPI.IntegrationTests**: End-to-end API tests

### Running Tests

```bash
# All tests
dotnet test

# Specific project
dotnet test tests/ModernAPI.Domain.Tests

# With coverage
dotnet test /p:CollectCoverage=true
```

## Common Patterns

### Validation

Use FluentValidation for complex validation:

```csharp
public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);
            
        RuleFor(x => x.Price)
            .GreaterThan(0);
    }
}
```

### Mapping

Use AutoMapper for DTO mappings:

```csharp
public class ProductMappingProfile : Profile
{
    public ProductMappingProfile()
    {
        CreateMap<Product, ProductDto>();
        CreateMap<CreateProductRequest, Product>();
    }
}
```

### Repository Pattern

```csharp
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<T>> GetAllAsync();
    Task AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
}
```

### Unit of Work

```csharp
using (var transaction = await _unitOfWork.BeginTransactionAsync())
{
    try
    {
        // Multiple operations
        await _unitOfWork.Products.AddAsync(product);
        await _unitOfWork.SaveChangesAsync();
        await _unitOfWork.CommitTransactionAsync();
    }
    catch
    {
        await _unitOfWork.RollbackTransactionAsync();
        throw;
    }
}
```

## Debugging Tips

### Enable Detailed Logging

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  }
}
```

### View SQL Queries

```csharp
// In ApplicationDbContext configuration
optionsBuilder.LogTo(Console.WriteLine, LogLevel.Information)
    .EnableSensitiveDataLogging()
    .EnableDetailedErrors();
```

### Common Issues

1. **Migration Failures**: Check connection string and database permissions
2. **JWT 401 Errors**: Verify token expiry and signing key
3. **Dependency Injection**: Ensure services are registered in correct order
4. **CORS Issues**: Check allowed origins in Program.cs

## Code Style Guidelines

### Naming Conventions

- **Classes/Interfaces**: PascalCase
- **Methods**: PascalCase
- **Properties**: PascalCase
- **Private fields**: _camelCase
- **Parameters/Variables**: camelCase
- **Constants**: UPPER_CASE

### File Organization

```
ClassName.cs structure:
1. Using statements
2. Namespace
3. Class documentation
4. Public constants
5. Private fields
6. Constructors
7. Public properties
8. Public methods
9. Protected methods
10. Private methods
```

### Async/Await

- Always use `Async` suffix for async methods
- Always use `CancellationToken` parameter
- Prefer `Task` over `void` for async methods

## Security Considerations

### Never Do

- Store secrets in code or config files
- Log sensitive data (passwords, tokens)
- Trust client input without validation
- Use HTTP in production
- Expose stack traces in production

### Always Do

- Validate all input
- Use parameterized queries (EF Core does this)
- Implement rate limiting
- Log security events
- Keep dependencies updated

## Performance Tips

### Database

- Use `.AsNoTracking()` for read-only queries
- Implement pagination for lists
- Use includes judiciously to avoid N+1 queries
- Index foreign keys and commonly queried fields

### API

- Implement response caching where appropriate
- Use compression middleware
- Implement pagination
- Return minimal data in DTOs

## Extending the Template

### Adding Features Checklist

- [ ] Define domain entity with business rules
- [ ] Create repository interface in Domain
- [ ] Implement repository in Infrastructure
- [ ] Add EF configuration
- [ ] Create DTOs in Application
- [ ] Create service interface and implementation
- [ ] Register services in DI container
- [ ] Create controller endpoints
- [ ] Add validation rules
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Update API documentation
- [ ] Create database migration
- [ ] Update CLAUDE.md if patterns change

## Quick Commands

```bash
# Build
dotnet build

# Run
dotnet run --project ModernAPI.API

# Scaffolding
modernapi scaffold entity EntityName --properties "Name:string:required,Value:decimal"

# Create migration
dotnet ef migrations add MigrationName --project ModernAPI.Infrastructure --startup-project ModernAPI.API

# Update database
dotnet ef database update --project ModernAPI.Infrastructure --startup-project ModernAPI.API

# Remove last migration
dotnet ef migrations remove --project ModernAPI.Infrastructure --startup-project ModernAPI.API

# Run tests
dotnet test

# Format code
dotnet format

# Add package to specific project
dotnet add ModernAPI.Application package PackageName

# Restore packages
dotnet restore
```

## Contact for Template Issues

This is a template project. For issues or improvements:
1. Check existing documentation in `/docs`
2. Review test projects for examples
3. Follow established patterns in the codebase
4. Maintain Clean Architecture principles