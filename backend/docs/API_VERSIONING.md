# API Versioning Guide

Comprehensive guide to API versioning strategies implemented in ModernAPI, supporting multiple versioning approaches for maximum flexibility and backward compatibility.

## Table of Contents

- [Versioning Overview](#versioning-overview)
- [Supported Versioning Strategies](#supported-versioning-strategies)
- [Implementation Details](#implementation-details)
- [Version Lifecycle Management](#version-lifecycle-management)
- [Migration Strategies](#migration-strategies)
- [Best Practices](#best-practices)
- [Examples and Usage](#examples-and-usage)

## Versioning Overview

ModernAPI implements **multiple versioning strategies** to provide flexibility for different client types and use cases. The API supports:

- **URL Path Versioning** (Default, Recommended)
- **HTTP Header Versioning** (Custom headers)
- **Query String Versioning** (Fallback option)

All endpoints support versioning with **semantic versioning** principles (`major.minor` format).

### Why Multiple Strategies?

Different clients have different capabilities:
- **Web browsers**: Easy with URL path versioning
- **Mobile apps**: Flexible with header versioning  
- **Legacy systems**: Simple with query string versioning
- **API gateways**: Custom header routing capabilities

## Supported Versioning Strategies

### 1. URL Path Versioning (Default) ✅ Recommended

The most visible and cache-friendly approach.

#### Format
```
/api/v{version}/{controller}/{action}
```

#### Examples
```bash
# Version 1.0 endpoints
GET /api/v1/users
GET /api/v1/users/123e4567-e89b-12d3-a456-426614174000

# Version 2.0 endpoints (when available)
GET /api/v2/users  
GET /api/v2/users/123e4567-e89b-12d3-a456-426614174000
```

#### Advantages
- **Highly visible**: Version is obvious in URL
- **Cache-friendly**: CDNs and proxies can cache different versions
- **Browser-friendly**: Easy to bookmark and share
- **Debug-friendly**: Clear in logs and monitoring

### 2. HTTP Header Versioning

Using custom API version headers for cleaner URLs.

#### Headers Supported
```
X-API-Version: 1.0
API-Version: 1.0
```

#### Examples
```bash
# Using X-API-Version header
curl -X GET "http://localhost:5000/api/users" \
  -H "X-API-Version: 1.0" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Using API-Version header
curl -X GET "http://localhost:5000/api/users" \
  -H "API-Version: 1.0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Advantages
- **Clean URLs**: No version clutter in endpoint paths
- **Header flexibility**: Easy to set default versions
- **Gateway-friendly**: API gateways can route by headers

### 3. Query String Versioning

Simple fallback method using query parameters.

#### Format
```
?version={version} or ?api-version={version}
```

#### Examples
```bash
# Using version parameter
GET /api/users?version=1.0

# Using api-version parameter  
GET /api/users?api-version=1.0

# Combined with other query parameters
GET /api/users?version=1.0&page=1&pageSize=10
```

#### Advantages
- **Universal support**: Works with any HTTP client
- **Simple implementation**: Easy for legacy systems
- **Fallback option**: When headers aren't practical

## Implementation Details

### Controller Configuration

All controllers inherit from `BaseController` with versioning support:

```csharp
[ApiController]
[ApiVersion("1.0")]  // Default version
[Route("api/v{version:apiVersion}/[controller]")]
public class UsersController : BaseController
{
    // Controller implementation
}
```

### Version-Specific Actions

You can have version-specific implementations:

```csharp
[ApiVersion("1.0")]
[HttpGet]
public async Task<ActionResult<UserDto>> GetUsersV1()
{
    // Version 1.0 implementation
    return await _userService.GetUsersAsync();
}

[ApiVersion("2.0")]  
[HttpGet]
public async Task<ActionResult<UserDtoV2>> GetUsersV2()
{
    // Version 2.0 implementation with enhanced data
    return await _userService.GetUsersV2Async();
}
```

### Startup Configuration

API versioning is configured in `Program.cs`:

```csharp
builder.Services.AddApiVersioning(opt =>
{
    // URL path versioning (primary)
    opt.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),     // /api/v1/users
        new HeaderApiVersionReader("X-API-Version"),  // X-API-Version: 1.0
        new HeaderApiVersionReader("API-Version"),    // API-Version: 1.0  
        new QueryStringApiVersionReader("version"),   // ?version=1.0
        new QueryStringApiVersionReader("api-version") // ?api-version=1.0
    );
    
    opt.DefaultApiVersion = new ApiVersion(1, 0);  // Default to v1.0
    opt.AssumeDefaultVersionWhenUnspecified = true;
    opt.ApiVersionSelector = new CurrentImplementationApiVersionSelector(opt);
});

builder.Services.AddVersionedApiExplorer(setup =>
{
    setup.GroupNameFormat = "'v'VVV";  // v1.0, v2.0 format
    setup.SubstituteApiVersionInUrl = true;
});
```

### OpenAPI/Swagger Integration

Each version gets its own OpenAPI document:

```csharp
builder.Services.ConfigureOptions<ConfigureSwaggerOptions>();
builder.Services.AddSwaggerGen(options =>
{
    options.OperationFilter<SwaggerDefaultValues>();
    
    // Include XML comments for documentation
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
});
```

This creates separate documentation for each API version:
- `/swagger/v1.0/swagger.json`
- `/swagger/v2.0/swagger.json`

## Version Lifecycle Management

### Version States

| State | Description | Support Level |
|-------|-------------|---------------|
| **Current** | Latest stable version | Full support |
| **Supported** | Previous stable version | Bug fixes only |
| **Deprecated** | Marked for removal | Security fixes only |
| **Retired** | No longer available | Not supported |

### Deprecation Process

#### 1. Announce Deprecation
Add deprecation headers to responses:

```csharp
[Obsolete("This endpoint is deprecated. Use v2.0 instead.")]
[ApiVersion("1.0", Deprecated = true)]
public async Task<ActionResult> OldEndpoint()
{
    Response.Headers.Add("X-API-Deprecated", "true");
    Response.Headers.Add("X-API-Deprecation-Date", "2024-12-31");
    Response.Headers.Add("X-API-Sunset-Date", "2025-06-30");
    Response.Headers.Add("X-API-Migration-Guide", "https://docs.modernapi.dev/migration/v1-to-v2");
    
    // Implementation
}
```

#### 2. Migration Period
- **6 months minimum**: Time for clients to migrate
- **Documentation**: Clear migration guides
- **Monitoring**: Track usage of deprecated versions

#### 3. Retirement
- Remove deprecated endpoints
- Return 410 Gone for retired versions

### Version Support Timeline

```
Version 1.0: Released Jan 2024
├─ Current: Jan 2024 - Jun 2024
├─ Supported: Jun 2024 - Dec 2024  
├─ Deprecated: Dec 2024 - Jun 2025
└─ Retired: Jun 2025

Version 2.0: Released Jun 2024  
├─ Current: Jun 2024 - Present
└─ Future deprecation: TBD
```

## Migration Strategies

### 1. Breaking Changes

#### Major Version Changes (1.0 → 2.0)
- Data structure changes
- Endpoint behavior modifications  
- Authentication method changes
- Required field additions

Example breaking change:
```json
// v1.0 Response
{
  "id": "123",
  "name": "John Doe",
  "email": "john@example.com"
}

// v2.0 Response (breaking change)
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "profile": {
    "firstName": "John",
    "lastName": "Doe", 
    "displayName": "John Doe"
  },
  "contactInfo": {
    "primaryEmail": "john@example.com"
  }
}
```

### 2. Non-Breaking Changes

#### Minor Version Changes (1.0 → 1.1)
- New optional fields
- New endpoints  
- Enhanced functionality
- Performance improvements

Example non-breaking change:
```json
// v1.0 Response
{
  "id": "123",
  "name": "John Doe", 
  "email": "john@example.com"
}

// v1.1 Response (backward compatible)
{
  "id": "123",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "https://example.com/avatar.jpg",  // New field
  "lastLogin": "2024-01-01T10:00:00Z"         // New field
}
```

### 3. Gradual Migration Strategy

#### Phase 1: Parallel Implementation
```csharp
// Support both versions simultaneously
[ApiVersion("1.0")]
[ApiVersion("2.0")]
[HttpGet]
public async Task<ActionResult> GetUsers()
{
    var version = HttpContext.GetRequestedApiVersion();
    
    if (version?.MajorVersion == 2)
    {
        return await GetUsersV2();
    }
    
    return await GetUsersV1();
}
```

#### Phase 2: Feature Flagging
```csharp
public async Task<ActionResult> GetUsers()
{
    var useV2Features = _featureManager.IsEnabledAsync("UseV2UserEndpoint");
    
    if (await useV2Features)
    {
        return await GetUsersV2();
    }
    
    return await GetUsersV1();
}
```

#### Phase 3: Sunset Old Version
- Monitor usage metrics
- Notify remaining clients
- Graceful shutdown of old endpoints

## Best Practices

### 1. Version Naming Convention

Use **semantic versioning** format:
- `v1.0`, `v1.1`, `v2.0`
- Major version for breaking changes
- Minor version for backward-compatible additions

### 2. Default Version Strategy

```csharp
// Always specify a default version
opt.DefaultApiVersion = new ApiVersion(1, 0);
opt.AssumeDefaultVersionWhenUnspecified = true;
```

Benefits:
- Graceful handling of unversioned requests
- Backward compatibility for existing clients
- Clear migration path

### 3. Version Documentation

Each version should have:
- **OpenAPI specification**: Swagger documentation
- **Migration guides**: Step-by-step upgrade instructions
- **Changelog**: Detailed list of changes
- **Support timeline**: When versions will be deprecated

### 4. Backward Compatibility

#### Do's ✅
- Add new optional fields
- Add new endpoints
- Enhance existing functionality without changing behavior
- Improve performance
- Add validation that doesn't break existing valid requests

#### Don'ts ❌
- Remove fields from responses
- Change field types or formats
- Modify endpoint behavior
- Add required fields without defaults
- Change authentication requirements

### 5. Client Communication

#### Deprecation Notifications
```
HTTP/1.1 200 OK
X-API-Deprecated: true
X-API-Deprecation-Date: 2024-12-31
X-API-Sunset-Date: 2025-06-30  
X-API-Migration-Guide: https://docs.modernapi.dev/migration
Warning: 299 "This API version is deprecated"
```

#### Version Information
```
HTTP/1.1 200 OK
X-API-Version: 1.0
X-API-Current-Version: 2.0
X-API-Supported-Versions: 1.0, 1.1, 2.0
```

## Examples and Usage

### Client Implementation Examples

#### JavaScript/TypeScript
```typescript
class ApiClient {
  private baseUrl = 'https://api.modernapi.dev';
  private version = 'v1.0';
  
  // URL path versioning (recommended)
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/api/${this.version}/users`);
    return response.json();
  }
  
  // Header versioning
  async getUsersWithHeader(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/api/users`, {
      headers: {
        'X-API-Version': this.version,
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.json();
  }
}
```

#### .NET Client
```csharp
public class ApiClient
{
    private readonly HttpClient _httpClient;
    private const string ApiVersion = "1.0";
    
    public ApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }
    
    // URL path versioning
    public async Task<List<User>> GetUsersAsync()
    {
        var response = await _httpClient.GetAsync($"/api/v{ApiVersion}/users");
        return await response.Content.ReadFromJsonAsync<List<User>>();
    }
    
    // Header versioning
    public async Task<List<User>> GetUsersWithHeaderAsync()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/users");
        request.Headers.Add("X-API-Version", ApiVersion);
        
        var response = await _httpClient.SendAsync(request);
        return await response.Content.ReadFromJsonAsync<List<User>>();
    }
}
```

### Testing Multiple Versions

```csharp
[Test]
public async Task GetUsers_V1_ReturnsLegacyFormat()
{
    var response = await _client.GetAsync("/api/v1.0/users");
    var users = await response.Content.ReadFromJsonAsync<UserV1[]>();
    
    Assert.IsTrue(users.All(u => !string.IsNullOrEmpty(u.Name)));
}

[Test]  
public async Task GetUsers_V2_ReturnsEnhancedFormat()
{
    var response = await _client.GetAsync("/api/v2.0/users");
    var users = await response.Content.ReadFromJsonAsync<UserV2[]>();
    
    Assert.IsTrue(users.All(u => u.Profile != null));
    Assert.IsTrue(users.All(u => u.ContactInfo != null));
}
```

### Migration Testing

```bash
#!/bin/bash
# Test script for version migration

echo "Testing v1.0 endpoint..."
curl -X GET "http://localhost:5000/api/v1.0/users" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\nTesting v2.0 endpoint..."  
curl -X GET "http://localhost:5000/api/v2.0/users" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\nTesting header versioning..."
curl -X GET "http://localhost:5000/api/users" \
  -H "X-API-Version: 1.0" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Summary

ModernAPI's versioning strategy provides:

1. **Flexibility**: Multiple versioning approaches for different client needs
2. **Compatibility**: Graceful handling of version transitions  
3. **Clarity**: Clear version lifecycle and migration paths
4. **Standards**: Following REST and HTTP best practices

This comprehensive approach ensures that your API can evolve while maintaining backward compatibility and providing clear upgrade paths for clients.

For implementation details, see the [API Development Cookbook](API_DEVELOPMENT_COOKBOOK.md) for practical examples and patterns.