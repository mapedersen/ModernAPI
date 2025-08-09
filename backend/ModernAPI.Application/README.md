# Application Layer - ModernAPI Template

## Overview
The Application layer is the **orchestrator** of your business logic. It sits between the API and Domain layers, coordinating domain objects to fulfill specific use cases. This layer contains no business rules itself - it delegates to the Domain layer while managing transactions, validation, and data transformation.

## Key Responsibilities

### 1. **Use Case Orchestration**
- Coordinates multiple domain objects to complete business operations
- Manages the flow of data and control between domain entities
- Implements application-specific business flows

### 2. **Transaction Management**
- Ensures data consistency across multiple operations
- Manages Unit of Work and repository interactions
- Handles rollbacks when operations fail

### 3. **Data Transformation**
- Converts between domain objects and DTOs (Data Transfer Objects)
- Maps external data formats to internal domain models
- Prepares data for API responses

### 4. **Input Validation**
- Validates incoming requests using FluentValidation
- Ensures data integrity before reaching the domain
- Provides detailed validation error messages

### 5. **Domain Event Handling**
- Processes events raised by domain entities
- Coordinates cross-cutting concerns (logging, notifications, etc.)
- Maintains loose coupling between domain components

## Architecture Principles

### **Dependency Direction**
```
API Layer → Application Layer → Domain Layer
           ↑                  ↑
Infrastructure Layer ←---------┘
```

- Application **depends on** Domain (uses domain objects)
- Application **defines interfaces** for infrastructure (repositories, external services)
- Infrastructure **implements** interfaces defined by Application
- API **depends on** Application (calls services)

### **No Business Logic**
The Application layer orchestrates but doesn't contain business rules:

```csharp
// ❌ WRONG: Business logic in Application layer
public class UserService 
{
    public async Task DeactivateUser(UserId userId)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        
        // This is business logic - belongs in Domain!
        if (user.HasActiveOrders) 
            throw new Exception("Cannot deactivate user with orders");
            
        user.IsActive = false; // Direct property manipulation - bad!
    }
}

// ✅ CORRECT: Application orchestrates, Domain contains logic
public class UserService 
{
    public async Task<UserDto> DeactivateUserAsync(DeactivateUserRequest request)
    {
        var user = await _userRepo.GetByIdAsync(request.UserId);
        if (user is null) 
            throw new UserNotFoundException(request.UserId);
        
        // Domain handles the business logic
        user.Deactivate(); // This method contains the rules
        
        await _unitOfWork.SaveChangesAsync(); // Application manages persistence
        
        return _mapper.Map<UserDto>(user); // Application handles mapping
    }
}
```

## Folder Structure

```
ModernAPI.Application/
├── Services/          # Application services (use case orchestrators)
│   ├── AuthService.cs       # Authentication orchestration
│   ├── JwtTokenService.cs   # JWT token generation/validation
│   └── UserService.cs       # User management operations
├── DTOs/              # Data Transfer Objects for API communication
│   ├── AuthDtos.cs          # Authentication DTOs
│   └── UserDtos.cs          # User-related DTOs
├── Validators/        # FluentValidation validators for DTOs
├── Mappings/          # AutoMapper profiles for object mapping
├── Common/            # Shared application components
│   ├── Settings/            # Configuration POCOs
│   │   └── JwtSettings.cs  # JWT configuration
│   └── Exceptions/          # Application-specific exceptions
├── Interfaces/        # Application service contracts
│   ├── IAuthService.cs      # Authentication service interface
│   ├── IJwtTokenService.cs  # JWT service interface
│   ├── IPasswordService.cs  # Password validation abstraction
│   └── IUserService.cs      # User service interface
└── README.md          # This documentation
```

## Component Explanations

### **Services** (`/Services/`)
Application services orchestrate domain operations for specific use cases:

```csharp
public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<UserService> _logger;

    public async Task<UserDto> CreateUserAsync(CreateUserRequest request)
    {
        // 1. Input validation (handled by FluentValidation)
        // 2. Check business rules
        if (await _unitOfWork.Users.ExistsByEmailAsync(request.Email))
            throw new UserEmailAlreadyExistsException(request.Email);
            
        // 3. Create domain object (business logic in domain)
        var user = new User(request.Email, request.DisplayName);
        
        // 4. Persist
        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();
        
        // 5. Return DTO
        return _mapper.Map<UserDto>(user);
    }
}
```

### **DTOs** (`/DTOs/`)
Data Transfer Objects represent the contract between API and Application:

```csharp
// Request DTOs
public record CreateUserRequest(Email Email, string DisplayName);
public record UpdateUserProfileRequest(UserId UserId, string DisplayName);

// Response DTOs  
public record UserDto(UserId Id, string Email, string DisplayName, bool IsActive);
public record UserListDto(int TotalCount, IReadOnlyList<UserDto> Users);
```

### **Validators** (`/Validators/`)
FluentValidation classes ensure input data meets business requirements:

```csharp
public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotNull()
            .WithMessage("Email is required");
            
        RuleFor(x => x.DisplayName)
            .NotEmpty()
            .Length(1, 100)
            .WithMessage("Display name must be between 1 and 100 characters");
    }
}
```

### **Mappings** (`/Mappings/`)
AutoMapper profiles handle object-to-object mapping:

```csharp
public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        CreateMap<User, UserDto>();
        CreateMap<CreateUserRequest, User>()
            .ConstructUsing(src => new User(src.Email, src.DisplayName));
    }
}
```

## Design Patterns Used

### 1. **Service Pattern**
Application services encapsulate use cases and coordinate domain operations.

### 2. **DTO Pattern**
Separate internal domain models from external API contracts.

### 3. **Repository Pattern**
Abstract data access through interfaces defined in this layer.

### 4. **Unit of Work Pattern**
Coordinate changes across multiple repositories within transactions.

### 5. **Mapping Pattern**
Automatic conversion between domain objects and DTOs.

### 6. **Validation Pattern**
Centralized input validation with detailed error messages.

## Exception Handling Strategy

```csharp
// Application-specific exceptions
public class UserNotFoundException : ApplicationException
{
    public UserId UserId { get; }
    
    public UserNotFoundException(UserId userId) 
        : base($"User with ID {userId} was not found")
    {
        UserId = userId;
    }
}

// Service handles both domain and application exceptions
public async Task<UserDto> GetUserAsync(UserId userId)
{
    var user = await _userRepo.GetByIdAsync(userId);
    if (user is null)
        throw new UserNotFoundException(userId); // Application concern
        
    // If user.SomeMethod() throws domain exception, let it bubble up
    return _mapper.Map<UserDto>(user);
}
```

## Validation Philosophy

### **Single Source of Truth**
Backend validation is the authoritative source:

```csharp
// 1. FluentValidation rules define the contract
public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.Email).EmailAddress().MaximumLength(254);
        RuleFor(x => x.DisplayName).Length(1, 100);
    }
}

// 2. OpenAPI schema is generated from these rules
// 3. Frontend Zod schemas are generated from OpenAPI
// 4. TanStack Form uses Zod schemas for client-side validation
```

## Testing Strategy

### **Unit Testing Focus**
- Mock all dependencies (repositories, external services)
- Test business flow orchestration
- Verify correct domain method calls
- Assert proper DTO mapping

### **What NOT to Test Here**
- Domain business logic (test in Domain.Tests)
- Database operations (test in Infrastructure.Tests)
- HTTP concerns (test in API.Tests)

## Common Patterns

### **Command/Query Separation**
```csharp
// Commands change state
public async Task<UserDto> CreateUserAsync(CreateUserRequest request) { }
public async Task UpdateUserAsync(UpdateUserRequest request) { }

// Queries read state  
public async Task<UserDto> GetUserAsync(UserId userId) { }
public async Task<UserListDto> GetUsersAsync(int page, int size) { }
```

### **Result Pattern (Optional)**
For more sophisticated error handling:

```csharp
public async Task<Result<UserDto>> CreateUserAsync(CreateUserRequest request)
{
    try 
    {
        // ... implementation
        return Result.Success(userDto);
    }
    catch (DomainException ex)
    {
        return Result.Failure<UserDto>(ex.Message);
    }
}
```

## Authentication Implementation

### **AuthService**
Orchestrates the complete authentication flow:

```csharp
public class AuthService : IAuthService
{
    // Handles login, registration, token refresh, logout
    // Coordinates between UserManager, JwtTokenService, and repositories
    // No direct ASP.NET Core dependencies (uses IPasswordService abstraction)
}
```

### **JwtTokenService**
Manages JWT token lifecycle:

```csharp
public class JwtTokenService : IJwtTokenService
{
    // Generates access tokens with claims
    // Creates cryptographically secure refresh tokens
    // Validates token parameters
}
```

### **Authentication DTOs**
```csharp
// Request DTOs
public record LoginRequest(string Email, string Password, bool RememberMe);
public record RegisterRequest(string Email, string Password, string DisplayName);
public record RefreshTokenRequest(string RefreshToken);

// Response DTOs
public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAt,
    DateTime RefreshTokenExpiresAt,
    UserDto User
);
```

## Key Benefits

- ✅ **Testable**: Easy to unit test with mocked dependencies
- ✅ **Focused**: Each service handles specific use cases
- ✅ **Decoupled**: Domain and infrastructure concerns are separated
- ✅ **Consistent**: Standardized patterns for all operations
- ✅ **Maintainable**: Clear separation of responsibilities
- ✅ **Secure**: Authentication logic properly abstracted from infrastructure

---

**Next Layer**: The Application layer coordinates the Domain. Next, we'll build the Infrastructure layer that provides concrete implementations of our repository interfaces.