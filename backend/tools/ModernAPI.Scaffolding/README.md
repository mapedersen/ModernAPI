# ModernAPI Scaffolding Tool

A .NET Global Tool for generating Clean Architecture boilerplate code in ModernAPI projects.

## Installation

### Local Development
```bash
# Build and install from source
cd tools/ModernAPI.Scaffolding
dotnet pack
dotnet tool install --global --add-source ./nupkg ModernAPI.Scaffolding
```

### From NuGet (Future)
```bash
dotnet tool install --global ModernAPI.Scaffolding
```

## Usage

### Entity Scaffolding
Generate a complete entity with all Clean Architecture layers:

```bash
# Basic entity
modernapi scaffold entity Product --properties "Name:string:required,Price:decimal:range(0,*),Description:string"

# Entity with foreign keys
modernapi scaffold entity Order --properties "CustomerName:string:required,Total:decimal:required,Status:OrderStatus:required,CustomerId:Guid:foreign(Customer)"

# Entity without authentication
modernapi scaffold entity PublicData --properties "Title:string:required,Content:string" --no-auth
```

#### Property Format
Properties use the format: `Name:Type:Validations`

**Supported Types:**
- `string`, `int`, `decimal`, `bool`, `DateTime`, `Guid`
- Nullable versions: `string?`, `int?`, `decimal?`, etc.
- Custom enums: `OrderStatus`, `UserRole`

**Supported Validations:**
- `required` - Makes property required and non-nullable
- `maxlength(100)` - Sets maximum string length
- `range(0,*)` - Sets numeric range validation
- `email` - Email validation for strings
- `foreign(EntityName)` - Marks as foreign key to another entity

#### Generated Files
For entity `Product`, generates:
- ✅ `Domain/Entities/Product.cs` - Entity with business logic
- ✅ `Domain/Interfaces/IProductRepository.cs` - Repository interface
- ✅ `Infrastructure/Repositories/ProductRepository.cs` - EF Core repository
- ✅ `Infrastructure/Data/Configurations/ProductConfiguration.cs` - EF configuration
- ✅ `Application/DTOs/ProductDtos.cs` - Request/Response DTOs
- ✅ `Application/Interfaces/IProductService.cs` - Service interface
- ✅ `Application/Services/ProductService.cs` - Business logic service
- ✅ `Application/Validators/ProductValidators.cs` - FluentValidation rules
- ✅ `API/Controllers/ProductsController.cs` - HTTP endpoints

### Service Scaffolding (Planned)
```bash
# Generate service with interface
modernapi scaffold service EmailService --lifetime Singleton
modernapi scaffold service PaymentService --lifetime Scoped
```

### Controller Scaffolding (Planned)
```bash
# Generate controller
modernapi scaffold controller ProductsController --entity Product
modernapi scaffold controller PublicApiController --no-auth
```

## Examples

### E-commerce Product Entity
```bash
modernapi scaffold entity Product \
  --properties "Name:string:required,Price:decimal:required,Description:string,CategoryId:Guid:foreign(Category),IsActive:bool" \
  --output ./backend
```

### Blog Post Entity
```bash
modernapi scaffold entity BlogPost \
  --properties "Title:string:required,Content:string:required,AuthorId:Guid:foreign(User),PublishedAt:DateTime?,IsPublished:bool"
```

### User Profile Entity (No Auth)
```bash
modernapi scaffold entity UserProfile \
  --properties "DisplayName:string:required,Bio:string,AvatarUrl:string,UserId:Guid:foreign(User)" \
  --no-auth
```

## Features

### ✅ Implemented
- Entity scaffolding with full Clean Architecture layers
- Property parsing with validation attributes
- Foreign key relationship detection
- Authentication requirement control
- Template-based code generation using Handlebars
- Project structure analysis and validation
- Comprehensive logging and error handling

### 🚧 Planned
- Service scaffolding
- Controller-only scaffolding  
- Custom validation rules
- Relationship mapping (one-to-many, many-to-many)
- Unit test generation
- Migration script generation
- Interactive property builder
- Template customization

## Requirements

- .NET 9.0 or later
- Must be run from within a ModernAPI project directory
- Project must follow ModernAPI Clean Architecture structure

## Project Structure Detection

The tool automatically detects ModernAPI projects by looking for:
- `ModernAPI.sln` solution file
- `*.API`, `*.Application`, `*.Domain`, `*.Infrastructure` project directories
- Standard Clean Architecture folder structure

## Template System

Uses Handlebars.NET for template processing with custom helpers:
- `{{pascalCase}}` - Converts to PascalCase
- `{{camelCase}}` - Converts to camelCase  
- `{{plural}}` - Pluralizes entity names
- `{{isNullable}}` - Checks if type is nullable

## Configuration

The tool reads project structure automatically. No configuration files needed.

## Troubleshooting

### "Could not find ModernAPI project root"
- Ensure you're running the command from within a ModernAPI project
- Check that your project has the required structure and solution file

### "Template not found" Error
- Verify the tool was installed correctly with all embedded resources
- Try reinstalling: `dotnet tool uninstall -g ModernAPI.Scaffolding && dotnet tool install -g ModernAPI.Scaffolding`

### Generated Code Issues
- Ensure your property syntax is correct: `Name:Type:Validations`
- Check that referenced entities (in foreign keys) exist in your project
- Verify all required project directories exist

## Development

### Building
```bash
cd tools/ModernAPI.Scaffolding
dotnet build
```

### Testing
```bash
dotnet test
```

### Creating Templates
Templates are stored in `Templates/` directory as Handlebars (.hbs) files and embedded as resources.

## Contributing

1. Add new templates to `Templates/` directory
2. Update the `ModernAPI.Scaffolding.csproj` to include new embedded resources
3. Implement command handlers in `Commands/` directory
4. Add template processing logic to service classes
5. Update this README with new features

## License

Same as ModernAPI template project.