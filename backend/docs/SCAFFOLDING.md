# Entity Scaffolding Guide

ModernAPI includes a powerful CLI tool for generating Clean Architecture boilerplate code automatically. This tool eliminates the repetitive work of creating entities and ensures consistency across your codebase.

## Overview

The `modernapi` CLI tool generates complete entities following Clean Architecture patterns, including:
- Domain entities with business logic
- Repository interfaces and implementations
- Service layers with interfaces
- Controllers with full CRUD operations
- DTOs for requests and responses
- Entity Framework configurations
- Validation rules

**Time Savings**: Creating a new entity manually takes 2-3 hours. With scaffolding, it takes 5 minutes.

## Installation

### Global Installation
```bash
cd tools/ModernAPI.Scaffolding
dotnet pack
dotnet tool install --global --add-source ./nupkg ModernAPI.Scaffolding
```

### Verify Installation
```bash
modernapi --help
```

## Basic Usage

### Simple Entity
```bash
modernapi scaffold entity Product --properties "Name:string:required,Price:decimal:required,Description:string"
```

### Entity with Relationships
```bash
modernapi scaffold entity Order --properties "CustomerName:string:required,Total:decimal:required,Status:OrderStatus:required,CustomerId:Guid:foreign(Customer)"
```

### Public Entity (No Authentication)
```bash
modernapi scaffold entity BlogPost --properties "Title:string:required,Content:string:required,PublishedAt:DateTime?" --no-auth
```

## Property Syntax

Properties use the format: `Name:Type:Validations`

### Supported Types
- **Primitives**: `string`, `int`, `decimal`, `bool`, `DateTime`, `Guid`
- **Nullable**: `string?`, `int?`, `decimal?`, `DateTime?`
- **Custom**: `OrderStatus`, `UserRole` (your enums)

### Supported Validations
- `required` - Makes property required and non-nullable
- `maxlength(100)` - Sets maximum string length
- `range(0,1000)` - Sets numeric range validation  
- `email` - Email validation for strings
- `foreign(EntityName)` - Marks as foreign key to another entity

### Examples
```bash
# E-commerce product
modernapi scaffold entity Product \
  --properties "Name:string:required,Price:decimal:range(0,*),CategoryId:Guid:foreign(Category),IsActive:bool"

# User profile
modernapi scaffold entity UserProfile \
  --properties "DisplayName:string:required,Bio:string,AvatarUrl:string,UserId:Guid:foreign(User)"

# Blog post
modernapi scaffold entity BlogPost \
  --properties "Title:string:required,Content:string:required,AuthorId:Guid:foreign(User),PublishedAt:DateTime?"
```

## Generated Files

For entity `Product`, the tool generates:

```
Domain/Entities/Product.cs                    - Entity with business logic
Domain/Interfaces/IProductRepository.cs      - Repository interface
Infrastructure/Repositories/ProductRepository.cs - EF Core implementation
Infrastructure/Data/Configurations/ProductConfiguration.cs - EF config
Application/DTOs/ProductDtos.cs               - Request/Response DTOs
Application/Interfaces/IProductService.cs    - Service interface
Application/Services/ProductService.cs       - Business logic service
Application/Validators/ProductValidators.cs  - FluentValidation rules
API/Controllers/ProductsController.cs        - HTTP endpoints with CRUD
```

## Code Quality

Generated code follows all ModernAPI patterns:
- ✅ **Clean Architecture** layers and dependencies
- ✅ **Domain-driven design** with business logic in entities
- ✅ **Proper validation** and error handling
- ✅ **JWT authentication** integration (optional)
- ✅ **Logging** and structured error responses
- ✅ **Entity Framework** configurations
- ✅ **Repository pattern** with interfaces
- ✅ **SOLID principles** throughout

## Next Steps After Scaffolding

After generating an entity, you need to:

1. **Add to DbContext**:
   ```csharp
   // In ApplicationDbContext.cs
   public DbSet<Product> Products { get; set; }
   ```

2. **Register Services** (if not using auto-discovery):
   ```csharp
   // In DependencyInjection.cs
   services.AddScoped<IProductRepository, ProductRepository>();
   services.AddScoped<IProductService, ProductService>();
   ```

3. **Create Migration**:
   ```bash
   dotnet ef migrations add AddProduct --project ModernAPI.Infrastructure --startup-project ModernAPI.API
   dotnet ef database update --project ModernAPI.Infrastructure --startup-project ModernAPI.API
   ```

4. **Write Tests**:
   ```bash
   # Unit tests for domain logic
   # Integration tests for API endpoints
   ```

## Project Structure Detection

The tool automatically detects ModernAPI projects by looking for:
- `ModernAPI.sln` solution file
- `*.API`, `*.Application`, `*.Domain`, `*.Infrastructure` projects
- Standard Clean Architecture folder structure

Run the command from anywhere within your ModernAPI project directory.

## Advanced Features

### Custom Templates
Templates are located in `Templates/` directory and use Handlebars syntax with custom helpers:
- `{{pascalCase}}` - Converts to PascalCase
- `{{camelCase}}` - Converts to camelCase  
- `{{plural}}` - Pluralizes entity names
- `{{isNullable}}` - Checks if type is nullable

### Extending the Tool
To add new templates or commands:
1. Add new `.hbs` templates to `Templates/` directory
2. Update `ModernAPI.Scaffolding.csproj` to include embedded resources
3. Implement new command handlers in `Commands/` directory

## Troubleshooting

### "Could not find ModernAPI project root"
- Ensure you're running the command from within a ModernAPI project
- Check that your project has the required structure and solution file

### "Template not found" Error
- Some templates are not yet implemented (marked as planned in TODO.md)
- The tool will succeed for implemented templates and show which ones failed

### Generated Code Issues
- Verify property syntax is correct: `Name:Type:Validations`
- Check that referenced entities (in foreign keys) exist in your project
- Ensure all required project directories exist

## Future Enhancements

Planned features:
- [ ] Service-only scaffolding
- [ ] Controller-only scaffolding  
- [ ] Unit test generation
- [ ] Custom validation rules
- [ ] Relationship mapping (one-to-many, many-to-many)
- [ ] Interactive property builder

## Examples

See `tools/ModernAPI.Scaffolding/README.md` for comprehensive examples and full CLI documentation.