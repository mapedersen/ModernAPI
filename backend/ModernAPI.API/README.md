# API Layer - ModernAPI Template

## Overview
The API layer is the **entry point** for HTTP requests and the **presentation layer** of the Clean Architecture. It handles HTTP-specific concerns like routing, model binding, authentication, and response formatting while delegating business logic to the Application layer.

## Key Responsibilities

### 1. **HTTP Request/Response Handling**
- Routes HTTP requests to appropriate controllers and actions
- Performs model binding and validation
- Formats responses with proper HTTP status codes
- Handles content negotiation (JSON, XML, etc.)

### 2. **Authentication & Authorization**
- JWT token validation and claims processing
- Role-based and policy-based authorization
- API key authentication for service-to-service calls
- Cross-origin request handling (CORS)

### 3. **API Documentation**
- Interactive Scalar API documentation
- OpenAPI/Swagger specification generation
- Request/response schema documentation
- Authentication flow documentation

### 4. **Error Handling & Middleware**
- Global exception handling and error formatting
- Request/response logging and monitoring
- Performance monitoring and metrics collection
- Security headers and protection middleware

### 5. **Input Validation**
- Model state validation using FluentValidation
- Custom validation attributes and filters
- File upload validation and processing
- Query parameter validation

## Architecture Principles

### **Thin Controllers**
Controllers should be lightweight and delegate to Application services:

```csharp
// ✅ GOOD: Thin controller that delegates to Application layer
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    [HttpPost]
    public async Task<ActionResult<UserResponse>> CreateUser(CreateUserRequest request)
    {
        var result = await _userService.CreateUserAsync(request);
        return CreatedAtAction(nameof(GetUser), new { id = result.User.Id }, result);
    }
}

// ❌ BAD: Fat controller with business logic
[ApiController]
public class BadUsersController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateUser(CreateUserRequest request)
    {
        // This business logic should be in Application layer!
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return Conflict("User already exists");
            
        var user = new User(request.Email, request.DisplayName);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        return Ok(user);
    }
}
```

### **Dependency Direction**
```
Controllers → Application Services → Domain Objects
```

The API layer **depends on** the Application layer but **not** on Infrastructure or Domain directly.

### **HTTP-Specific Concerns Only**
API layer handles only HTTP/REST concerns:
- ✅ Routing, model binding, status codes
- ✅ Authentication, authorization, CORS
- ✅ Request/response formatting
- ❌ Business logic (belongs in Application/Domain)
- ❌ Data access (belongs in Infrastructure)

## Folder Structure

```
ModernAPI.API/
├── Controllers/           # API controllers
│   ├── BaseController.cs  # Base controller with common functionality
│   └── UsersController.cs # User management endpoints
├── Middleware/           # Custom middleware components
│   ├── ExceptionMiddleware.cs
│   ├── LoggingMiddleware.cs
│   └── SecurityHeadersMiddleware.cs
├── Common/               # Shared API components
│   ├── Filters/         # Action filters and attributes
│   ├── ModelBinders/    # Custom model binders
│   └── Extensions/      # Extension methods for API setup
├── Program.cs           # Application entry point and service configuration
├── appsettings.json     # Configuration settings
└── README.md           # This documentation
```

## Controller Design Patterns

### **Base Controller**
Common functionality shared across controllers:

```csharp
[ApiController]
public abstract class BaseController : ControllerBase
{
    protected ActionResult<T> HandleResult<T>(T data, string? message = null)
    {
        if (data == null)
            return NotFound();
            
        return Ok(data);
    }

    protected ActionResult HandleException(Exception ex)
    {
        // Global exception handling will catch this
        throw ex;
    }
    
    protected string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier) 
            ?? throw new UnauthorizedAccessException("User ID not found in claims");
    }
}
```

### **Resource Controllers**
RESTful controllers following HTTP conventions:

```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : BaseController
{
    // GET /api/users
    [HttpGet]
    public async Task<ActionResult<UserListDto>> GetUsers([FromQuery] GetUsersRequest request)
    
    // GET /api/users/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetUser(Guid id)
    
    // POST /api/users
    [HttpPost]
    public async Task<ActionResult<UserResponse>> CreateUser(CreateUserRequest request)
    
    // PUT /api/users/{id}
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UserResponse>> UpdateUser(Guid id, UpdateUserProfileRequest request)
    
    // DELETE /api/users/{id}
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteUser(Guid id)
}
```

## Middleware Pipeline

The middleware pipeline processes requests in order:

```csharp
app.UseExceptionHandler();      // Global exception handling
app.UseSecurityHeaders();       // Security headers
app.UseHttpsRedirection();      // HTTPS enforcement
app.UseCors();                  // Cross-origin requests
app.UseAuthentication();        // JWT authentication
app.UseAuthorization();         // Role/policy authorization
app.UseRequestLogging();        // Request/response logging
app.MapControllers();           // Route to controllers
```

### **Custom Middleware**
Handle cross-cutting concerns:

```csharp
public class ExceptionMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }
    
    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var problemDetails = ex switch
        {
            NotFoundException => new ProblemDetails
            {
                Status = 404,
                Title = "Resource not found",
                Detail = ex.Message
            },
            ValidationException => new ValidationProblemDetails(),
            _ => new ProblemDetails
            {
                Status = 500,
                Title = "Internal server error"
            }
        };
        
        context.Response.StatusCode = problemDetails.Status ?? 500;
        await context.Response.WriteAsJsonAsync(problemDetails);
    }
}
```

## API Documentation with Scalar

### **OpenAPI Configuration**
Generate comprehensive API documentation:

```csharp
services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info.Title = "ModernAPI";
        document.Info.Version = "v1";
        document.Info.Description = "A modern, clean architecture API template";
        return Task.CompletedTask;
    });
});

// Use Scalar instead of Swagger UI for better developer experience
app.MapScalarApiReference();
```

### **Controller Documentation**
Comprehensive XML documentation for API endpoints:

```csharp
/// <summary>
/// Creates a new user account
/// </summary>
/// <param name="request">User creation details</param>
/// <returns>The created user information</returns>
/// <response code="201">User created successfully</response>
/// <response code="400">Invalid request data</response>
/// <response code="409">User with email already exists</response>
[HttpPost]
[ProducesResponseType(typeof(UserResponse), StatusCodes.Status201Created)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
public async Task<ActionResult<UserResponse>> CreateUser(CreateUserRequest request)
```

## Validation Integration

### **FluentValidation Integration**
Automatic validation with detailed error responses:

```csharp
// Register FluentValidation
services.AddFluentValidationAutoValidation()
        .AddFluentValidationClientsideAdapters()
        .AddValidatorsFromAssemblyContaining<CreateUserRequestValidator>();

// Controllers automatically validate request models
[HttpPost]
public async Task<ActionResult<UserResponse>> CreateUser(CreateUserRequest request)
{
    // If validation fails, FluentValidation returns 400 Bad Request automatically
    // with detailed validation error messages
    
    var result = await _userService.CreateUserAsync(request);
    return CreatedAtAction(nameof(GetUser), new { id = result.User.Id }, result);
}
```

## Authentication & Authorization

### **JWT Configuration**
```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });
```

### **Authorization Policies**
```csharp
services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireRole("Administrator"));
        
    options.AddPolicy("UserManagement", policy =>
        policy.RequireClaim("permission", "user:manage"));
});

// Usage in controllers
[Authorize(Policy = "UserManagement")]
[HttpDelete("{id:guid}")]
public async Task<ActionResult> DeleteUser(Guid id)
```

## Error Handling Strategy

### **Problem Details Standard**
Use RFC 7807 Problem Details for consistent error responses:

```csharp
// Validation errors
{
    "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
    "title": "One or more validation errors occurred.",
    "status": 400,
    "errors": {
        "Email": ["Email address is required"]
    }
}

// Business logic errors
{
    "type": "https://example.com/probs/user-not-found",
    "title": "User not found",
    "status": 404,
    "detail": "User with ID '123' was not found"
}
```

## Performance Considerations

### **Response Caching**
```csharp
[HttpGet("{id:guid}")]
[ResponseCache(Duration = 300, VaryByHeader = "Authorization")]
public async Task<ActionResult<UserDto>> GetUser(Guid id)
```

### **Compression**
```csharp
services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
});
```

### **Rate Limiting**
```csharp
services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? context.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));
});
```

## Key Benefits

- ✅ **Clean Separation**: HTTP concerns separated from business logic
- ✅ **Comprehensive Documentation**: Interactive Scalar API documentation
- ✅ **Robust Error Handling**: Consistent problem details responses
- ✅ **Security**: JWT authentication, authorization policies, security headers
- ✅ **Performance**: Caching, compression, rate limiting
- ✅ **Validation**: Automatic FluentValidation integration
- ✅ **Monitoring**: Request/response logging and metrics

---

**Complete Stack**: With the API layer complete, we have a fully functional Clean Architecture implementation ready for frontend integration and deployment!