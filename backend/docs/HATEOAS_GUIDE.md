# HATEOAS Implementation Guide

Comprehensive guide to Hypermedia as the Engine of Application State (HATEOAS) implementation in ModernAPI, achieving REST Level 3 maturity with self-descriptive, discoverable APIs.

## Table of Contents

- [What is HATEOAS?](#what-is-hateoas)
- [Why HATEOAS?](#why-hateoas)
- [REST Maturity Level 3](#rest-maturity-level-3)
- [Implementation Architecture](#implementation-architecture)
- [Link Generation System](#link-generation-system)
- [Response Examples](#response-examples)
- [Adding Links to New Endpoints](#adding-links-to-new-endpoints)
- [Advanced HATEOAS Patterns](#advanced-hateoas-patterns)
- [Client Integration](#client-integration)
- [Best Practices](#best-practices)

## What is HATEOAS?

**HATEOAS (Hypermedia as the Engine of Application State)** is a constraint of REST that makes APIs self-descriptive and discoverable. Instead of clients having hardcoded knowledge of API endpoints, the server provides hypermedia links that guide client navigation.

### Core Concept

Every API response includes links that tell clients:
- What actions are available on the current resource
- How to navigate to related resources  
- What operations the client can perform next

### Example Without HATEOAS (REST Level 2)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john@example.com",
  "displayName": "John Doe",
  "isActive": true
}
```
**Problem**: Client must know all available endpoints and construct URLs manually.

### Example With HATEOAS (REST Level 3)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000", 
  "email": "john@example.com",
  "displayName": "John Doe",
  "isActive": true,
  "_links": {
    "self": {
      "href": "/api/v1/users/123e4567-e89b-12d3-a456-426614174000",
      "rel": "self",
      "method": "GET",
      "title": "Get user details"
    },
    "edit": {
      "href": "/api/v1/users/123e4567-e89b-12d3-a456-426614174000",
      "rel": "edit", 
      "method": "PUT",
      "title": "Update user profile",
      "type": "application/json"
    },
    "patch": {
      "href": "/api/v1/users/123e4567-e89b-12d3-a456-426614174000",
      "rel": "patch",
      "method": "PATCH", 
      "title": "Partially update user profile",
      "type": "application/json-patch+json"
    }
  }
}
```
**Solution**: Server tells client what actions are available and how to perform them.

## Why HATEOAS?

### 1. **Discoverability** 🔍
Clients can explore the API without documentation:
```json
{
  "message": "Welcome to ModernAPI",
  "_links": {
    "users": {"href": "/api/v1/users", "method": "GET"},
    "auth": {"href": "/api/v1/auth/login", "method": "POST"},
    "docs": {"href": "/swagger/v1", "method": "GET"}
  }
}
```

### 2. **Reduced Coupling** 🔗
Clients don't hardcode URLs:
```typescript
// Bad: Hardcoded URLs
const deleteUrl = `/api/v1/users/${userId}`;

// Good: Use provided links
const deleteUrl = user._links.delete?.href;
if (deleteUrl) {
  // User can be deleted
  await fetch(deleteUrl, { method: 'DELETE' });
}
```

### 3. **Self-Documenting** 📚
Links include metadata:
```json
{
  "href": "/api/v1/users/123/change-email",
  "rel": "change-email",
  "method": "PUT", 
  "title": "Change email address",
  "type": "application/json",
  "schema": {"email": "string"}
}
```

### 4. **State Transitions** ⚡
Links reflect current state and available transitions:
```json
// Active user - can deactivate
{
  "isActive": true,
  "_links": {
    "deactivate": {"href": "/api/v1/users/123/deactivate", "method": "POST"}
  }
}

// Inactive user - can reactivate  
{
  "isActive": false,
  "_links": {
    "reactivate": {"href": "/api/v1/users/123/reactivate", "method": "POST"}
  }
}
```

### 5. **Permission-Based Links** 🔐
Links adapt to user permissions:
```json
// Regular user sees limited links
{
  "id": "123",
  "_links": {
    "self": {"href": "/api/v1/users/123", "method": "GET"},
    "edit": {"href": "/api/v1/users/123", "method": "PUT"}
  }
}

// Admin sees additional links
{
  "id": "123", 
  "_links": {
    "self": {"href": "/api/v1/users/123", "method": "GET"},
    "edit": {"href": "/api/v1/users/123", "method": "PUT"},
    "deactivate": {"href": "/api/v1/users/123/deactivate", "method": "POST"},
    "delete": {"href": "/api/v1/users/123", "method": "DELETE"}
  }
}
```

## REST Maturity Level 3

ModernAPI achieves **Level 3 REST maturity** through comprehensive HATEOAS implementation:

### Richardson Maturity Model

```
Level 0: HTTP as Transport
├─ Single endpoint
└─ RPC-style operations

Level 1: Resources  
├─ Multiple resources
└─ Proper URL structure

Level 2: HTTP Verbs ✅ Implemented
├─ HTTP methods (GET, POST, PUT, DELETE)  
├─ Status codes (200, 201, 404, etc.)
└─ HTTP headers for metadata

Level 3: Hypermedia Controls ✅ Implemented  
├─ HATEOAS links in responses
├─ Self-descriptive messages
└─ Hypermedia-driven navigation
```

### Level 3 Benefits

1. **API Evolution**: URLs can change without breaking clients
2. **Business Rule Enforcement**: Links reflect what's allowed
3. **Workflow Guidance**: Natural navigation through processes
4. **Documentation Integration**: Self-documenting capabilities

## Implementation Architecture

### Core Components

```
┌─────────────────────────────────────────┐
│               Client Request            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│            Controller Layer             │
│  • Handles HTTP requests                │
│  • Calls Link Generator                 │  
│  • Adds links to responses              │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Link Generator                │
│  • Context-aware link creation          │
│  • Permission-based filtering           │
│  • Dynamic URL generation               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           HATEOAS DTOs                  │
│  • Base classes with _links             │
│  • Collection wrappers                  │
│  • Metadata inclusion                   │
└─────────────────────────────────────────┘
```

### Key Classes

#### 1. HateoasDto Base Class

```csharp
public abstract record HateoasDto
{
    [JsonPropertyName("_links")]
    public Dictionary<string, LinkDto> Links { get; init; } = new();

    public virtual void AddLink(string rel, LinkDto link)
    {
        Links[rel] = link;
    }

    public virtual void AddLinks(Dictionary<string, LinkDto> links)
    {
        if (links == null) return;
        
        foreach (var (rel, link) in links)
        {
            Links[rel] = link;
        }
    }

    public bool HasLink(string rel) => Links.ContainsKey(rel);
    
    public LinkDto? GetLink(string rel) => 
        Links.TryGetValue(rel, out var link) ? link : null;
}
```

#### 2. LinkDto Structure

```csharp
public record LinkDto
{
    /// <summary>The URI of the linked resource</summary>
    public required string Href { get; init; }
    
    /// <summary>Link relationship (self, edit, delete, etc.)</summary>  
    public required string Rel { get; init; }
    
    /// <summary>HTTP method to use</summary>
    public required string Method { get; init; }
    
    /// <summary>Human-readable description</summary>
    public string? Title { get; init; }
    
    /// <summary>Expected media type</summary>
    public string? Type { get; init; }
}
```

#### 3. Collection Wrapper

```csharp
public record HateoasCollectionDto<T> : HateoasDto where T : class
{
    public required IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();
    public int TotalCount { get; init; }
    public int CurrentPage { get; init; }  
    public int PageSize { get; init; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;

    [JsonPropertyName("_metadata")]
    public object Metadata => new
    {
        TotalCount, CurrentPage, PageSize, TotalPages,
        HasNextPage = CurrentPage < TotalPages,
        HasPreviousPage = CurrentPage > 1
    };
}
```

## Link Generation System

### ILinkGenerator Service

The `ILinkGenerator` service creates context-aware hypermedia links:

```csharp
public interface ILinkGenerator  
{
    /// <summary>Generate a single link</summary>
    LinkDto GenerateLink(string action, string controller, 
        object? values = null, string rel = "self", 
        string method = "GET", string? title = null);
    
    /// <summary>Generate user resource links</summary>
    Dictionary<string, LinkDto> GenerateUserLinks(Guid userId, 
        string? currentUserId = null, bool isAdmin = false);
        
    /// <summary>Generate pagination links</summary>
    Dictionary<string, LinkDto> GeneratePaginationLinks(string controller, 
        string action, int currentPage, int totalPages, int pageSize, 
        object? additionalRouteValues = null);
        
    /// <summary>Generate authentication links</summary>
    Dictionary<string, LinkDto> GenerateAuthLinks(bool isAuthenticated = false);
}
```

### Permission-Based Link Generation

Links are dynamically generated based on context:

```csharp
public Dictionary<string, LinkDto> GenerateUserLinks(Guid userId, 
    string? currentUserId = null, bool isAdmin = false)
{
    var links = new Dictionary<string, LinkDto>
    {
        ["self"] = GenerateLink("GetUser", "Users", 
            new { id = userId, version = "1.0" }, 
            "self", "GET", "Get user details")
    };

    // Owner or admin can edit
    if (currentUserId == userId.ToString() || isAdmin)
    {
        links["edit"] = GenerateLink("UpdateUser", "Users", 
            new { id = userId, version = "1.0" }, 
            "edit", "PUT", "Update user profile");
            
        links["patch"] = GenerateLink("PatchUser", "Users", 
            new { id = userId, version = "1.0" }, 
            "patch", "PATCH", "Partially update user profile");
    }

    // Admin-only actions
    if (isAdmin)
    {
        links["deactivate"] = GenerateLink("DeactivateUser", "Users", 
            new { id = userId, version = "1.0" }, 
            "deactivate", "POST", "Deactivate user account");
            
        links["delete"] = GenerateLink("DeleteUser", "Users", 
            new { id = userId, version = "1.0" }, 
            "delete", "DELETE", "Permanently delete user");
    }

    return links;
}
```

## Response Examples

### 1. Individual Resource Response

#### GET /api/v1/users/123e4567-e89b-12d3-a456-426614174000

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com", 
  "displayName": "John Doe",
  "isActive": true,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-15T14:30:00Z",
  "_links": {
    "self": {
      "href": "http://localhost:5000/api/v1/users/123e4567-e89b-12d3-a456-426614174000",
      "rel": "self", 
      "method": "GET",
      "title": "Get user details",
      "type": "application/json"
    },
    "edit": {
      "href": "http://localhost:5000/api/v1/users/123e4567-e89b-12d3-a456-426614174000", 
      "rel": "edit",
      "method": "PUT",
      "title": "Update user profile",
      "type": "application/json"
    },
    "patch": {
      "href": "http://localhost:5000/api/v1/users/123e4567-e89b-12d3-a456-426614174000",
      "rel": "patch", 
      "method": "PATCH",
      "title": "Partially update user profile",
      "type": "application/json-patch+json"
    },
    "change-email": {
      "href": "http://localhost:5000/api/v1/users/123e4567-e89b-12d3-a456-426614174000/email",
      "rel": "change-email",
      "method": "PUT", 
      "title": "Change email address",
      "type": "application/json"
    },
    "users": {
      "href": "http://localhost:5000/api/v1/users",
      "rel": "users",
      "method": "GET",
      "title": "Get all users", 
      "type": "application/json"
    }
  }
}
```

### 2. Collection Response with Pagination

#### GET /api/v1/users?page=2&pageSize=10

```json
{
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@example.com",
      "displayName": "John Doe", 
      "isActive": true,
      "_links": {
        "self": {
          "href": "http://localhost:5000/api/v1/users/123e4567-e89b-12d3-a456-426614174000",
          "rel": "self",
          "method": "GET"
        }
      }
    }
    // ... more users
  ],
  "totalCount": 150,
  "currentPage": 2,
  "pageSize": 10,
  "_metadata": {
    "totalCount": 150,
    "currentPage": 2, 
    "pageSize": 10,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPreviousPage": true
  },
  "_links": {
    "self": {
      "href": "http://localhost:5000/api/v1/users?page=2&pageSize=10",
      "rel": "self",
      "method": "GET",
      "title": "Current page (2)"
    },
    "first": {
      "href": "http://localhost:5000/api/v1/users?page=1&pageSize=10", 
      "rel": "first",
      "method": "GET",
      "title": "First page"
    },
    "prev": {
      "href": "http://localhost:5000/api/v1/users?page=1&pageSize=10",
      "rel": "prev", 
      "method": "GET",
      "title": "Previous page"
    },
    "next": {
      "href": "http://localhost:5000/api/v1/users?page=3&pageSize=10",
      "rel": "next",
      "method": "GET", 
      "title": "Next page"
    },
    "last": {
      "href": "http://localhost:5000/api/v1/users?page=15&pageSize=10",
      "rel": "last",
      "method": "GET",
      "title": "Last page"
    }
  }
}
```

### 3. Authentication Response 

#### POST /api/v1/auth/login

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "refresh-token-here",
  "expiresAt": "2024-01-01T12:00:00Z",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com", 
    "displayName": "John Doe"
  },
  "_links": {
    "profile": {
      "href": "http://localhost:5000/api/v1/users/me",
      "rel": "profile",
      "method": "GET",
      "title": "Get current user profile"
    },
    "logout": {
      "href": "http://localhost:5000/api/v1/auth/logout",
      "rel": "logout", 
      "method": "POST",
      "title": "Logout from current session"
    },
    "logout-all": {
      "href": "http://localhost:5000/api/v1/auth/logout-all",
      "rel": "logout-all",
      "method": "POST", 
      "title": "Logout from all devices"
    },
    "refresh": {
      "href": "http://localhost:5000/api/v1/auth/refresh", 
      "rel": "refresh",
      "method": "POST",
      "title": "Refresh access token"
    },
    "change-password": {
      "href": "http://localhost:5000/api/v1/auth/change-password",
      "rel": "change-password",
      "method": "POST",
      "title": "Change password"
    }
  }
}
```

### 4. Error Response with HATEOAS

#### HTTP 422 Unprocessable Entity

```json
{
  "type": "https://tools.ietf.org/html/rfc4918#section-11.2",
  "title": "One or more validation errors occurred",
  "status": 422,
  "detail": "The request contains invalid data",
  "instance": "/api/v1/users",
  "errors": {
    "Email": ["The Email field is required."],
    "Password": ["Password must be at least 8 characters long."]
  },
  "requestId": "0HN7KQAAABAA4",
  "timestamp": "2024-01-01T10:30:00Z",
  "_links": {
    "help": {
      "href": "https://docs.modernapi.dev/user-creation", 
      "rel": "help",
      "method": "GET",
      "title": "User creation documentation"
    },
    "retry": {
      "href": "http://localhost:5000/api/v1/users",
      "rel": "retry",
      "method": "POST", 
      "title": "Retry user creation",
      "type": "application/json"
    }
  }
}
```

## Adding Links to New Endpoints

### Step 1: Create DTO with HATEOAS Support

```csharp
public record ProductDto : HateoasDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; } 
    public required decimal Price { get; init; }
    public required string Category { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
```

### Step 2: Extend Link Generator

```csharp
public interface ILinkGenerator
{
    // Add new method for product links
    Dictionary<string, LinkDto> GenerateProductLinks(Guid productId, 
        string? currentUserId = null, bool isAdmin = false);
}

public class LinkGeneratorService : ILinkGenerator
{
    public Dictionary<string, LinkDto> GenerateProductLinks(Guid productId, 
        string? currentUserId = null, bool isAdmin = false)
    {
        var links = new Dictionary<string, LinkDto>
        {
            ["self"] = GenerateLink("GetProduct", "Products", 
                new { id = productId, version = "1.0" }, 
                "self", "GET", "Get product details")
        };

        // Admin can edit products
        if (isAdmin)
        {
            links["edit"] = GenerateLink("UpdateProduct", "Products", 
                new { id = productId, version = "1.0" }, 
                "edit", "PUT", "Update product");
                
            links["delete"] = GenerateLink("DeleteProduct", "Products", 
                new { id = productId, version = "1.0" }, 
                "delete", "DELETE", "Delete product");
        }

        // Related resources
        links["category"] = GenerateLink("GetCategory", "Categories", 
            new { id = "category-id", version = "1.0" }, 
            "category", "GET", "View product category");
            
        links["products"] = GenerateLink("GetProducts", "Products", 
            new { version = "1.0" }, 
            "products", "GET", "View all products");

        return links;
    }
}
```

### Step 3: Update Controller

```csharp
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class ProductsController : BaseController
{
    private readonly IProductService _productService;
    private readonly ILinkGenerator _linkGenerator;

    public ProductsController(IProductService productService, 
        ILinkGenerator linkGenerator)
    {
        _productService = productService;
        _linkGenerator = linkGenerator;
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductDto>> GetProduct(Guid id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        
        // Add HATEOAS links
        var productWithLinks = AddLinksToProduct(product);
        
        return Ok(productWithLinks);
    }

    private ProductDto AddLinksToProduct(ProductDto product)
    {
        try
        {
            var currentUserId = GetUserId();
            var isAdmin = HasRole("Administrator");
            var links = _linkGenerator.GenerateProductLinks(product.Id, currentUserId, isAdmin);
            product.AddLinks(links);
        }
        catch
        {
            // Gracefully handle link generation failures
        }
        
        return product;
    }
}
```

### Step 4: Collection Support

```csharp
[HttpGet]
public async Task<ActionResult<HateoasCollectionDto<ProductDto>>> GetProducts(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20,
    [FromQuery] string? category = null)
{
    var result = await _productService.GetProductsAsync(page, pageSize, category);
    
    // Add links to individual products
    var productsWithLinks = result.Products.Select(AddLinksToProduct).ToList();
    
    // Create collection with pagination links
    var collection = new HateoasCollectionDto<ProductDto>
    {
        Items = productsWithLinks,
        TotalCount = result.TotalCount,
        CurrentPage = page,
        PageSize = pageSize
    };

    // Add pagination links
    var paginationLinks = _linkGenerator.GeneratePaginationLinks(
        "Products", "GetProducts", page, result.TotalPages, pageSize, 
        new { category });
    collection.AddLinks(paginationLinks);

    return Ok(collection);
}
```

## Advanced HATEOAS Patterns

### 1. Workflow State Links

Links that change based on business state:

```csharp
public Dictionary<string, LinkDto> GenerateOrderLinks(Guid orderId, OrderStatus status, bool isAdmin)
{
    var links = new Dictionary<string, LinkDto>
    {
        ["self"] = GenerateLink("GetOrder", "Orders", new { id = orderId })
    };

    // State-based links
    switch (status)
    {
        case OrderStatus.Pending:
            links["confirm"] = GenerateLink("ConfirmOrder", "Orders", 
                new { id = orderId }, "confirm", "POST", "Confirm order");
            links["cancel"] = GenerateLink("CancelOrder", "Orders", 
                new { id = orderId }, "cancel", "POST", "Cancel order");
            break;
            
        case OrderStatus.Confirmed:
            links["ship"] = GenerateLink("ShipOrder", "Orders", 
                new { id = orderId }, "ship", "POST", "Ship order");
            break;
            
        case OrderStatus.Shipped:
            links["track"] = GenerateLink("TrackOrder", "Orders", 
                new { id = orderId }, "track", "GET", "Track shipment");
            break;
            
        case OrderStatus.Delivered:
            links["return"] = GenerateLink("ReturnOrder", "Orders", 
                new { id = orderId }, "return", "POST", "Return order");
            break;
    }

    return links;
}
```

### 2. Conditional Form Links

Links with schema information for dynamic form generation:

```csharp
public LinkDto GenerateFormLink(string action, string controller, object values, 
    string rel, object? schema = null)
{
    var link = GenerateLink(action, controller, values, rel, "POST");
    
    if (schema != null)
    {
        link = link with { 
            Schema = JsonSerializer.Serialize(schema)
        };
    }
    
    return link;
}

// Usage
links["create-user"] = GenerateFormLink("CreateUser", "Users", null, "create-user", 
    new {
        email = new { type = "string", format = "email", required = true },
        displayName = new { type = "string", required = true },
        password = new { type = "string", minLength = 8, required = true }
    });
```

### 3. Bulk Operations

Links for collection-level operations:

```csharp
public Dictionary<string, LinkDto> GenerateCollectionLinks<T>(
    IEnumerable<T> items, string controller, bool isAdmin = false)
{
    var links = new Dictionary<string, LinkDto>();
    
    if (items.Any())
    {
        if (isAdmin)
        {
            links["bulk-delete"] = GenerateLink($"Bulk{controller}", controller, 
                null, "bulk-delete", "DELETE", "Delete multiple items");
                
            links["bulk-update"] = GenerateLink($"Bulk{controller}", controller, 
                null, "bulk-update", "PATCH", "Update multiple items");
        }
        
        links["export"] = GenerateLink($"Export{controller}", controller, 
            null, "export", "GET", "Export to CSV");
    }
    
    return links;
}
```

## Client Integration

### JavaScript/TypeScript Example

```typescript
interface ApiLink {
  href: string;
  rel: string;
  method: string;
  title?: string;
  type?: string;
}

interface HateoasResource {
  _links: Record<string, ApiLink>;
}

class HateoasClient {
  async followLink(resource: HateoasResource, rel: string, data?: any): Promise<any> {
    const link = resource._links[rel];
    if (!link) {
      throw new Error(`Link with rel '${rel}' not found`);
    }
    
    const options: RequestInit = {
      method: link.method,
      headers: {
        'Content-Type': link.type || 'application/json'
      }
    };
    
    if (data && (link.method === 'POST' || link.method === 'PUT' || link.method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(link.href, options);
    return response.json();
  }
  
  hasLink(resource: HateoasResource, rel: string): boolean {
    return !!resource._links[rel];
  }
  
  async navigatePagination(collection: any, direction: 'next' | 'prev' | 'first' | 'last'): Promise<any> {
    return this.followLink(collection, direction);
  }
}

// Usage
const client = new HateoasClient();
const user = await client.getUser('123');

// Check if user can be edited
if (client.hasLink(user, 'edit')) {
  await client.followLink(user, 'edit', { displayName: 'New Name' });
}

// Navigate pagination
const users = await client.getUsers();
if (client.hasLink(users, 'next')) {
  const nextPage = await client.navigatePagination(users, 'next');
}
```

### .NET Client Example

```csharp
public class HateoasClient
{
    private readonly HttpClient _httpClient;
    
    public HateoasClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }
    
    public async Task<T?> FollowLinkAsync<T>(HateoasResource resource, string rel, 
        object? data = null) where T : class
    {
        if (!resource.Links.TryGetValue(rel, out var link))
        {
            throw new InvalidOperationException($"Link with rel '{rel}' not found");
        }
        
        var request = new HttpRequestMessage(new HttpMethod(link.Method), link.Href);
        
        if (data != null && (link.Method == "POST" || link.Method == "PUT" || link.Method == "PATCH"))
        {
            request.Content = JsonContent.Create(data);
            request.Content.Headers.ContentType = 
                MediaTypeHeaderValue.Parse(link.Type ?? "application/json");
        }
        
        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        
        return await response.Content.ReadFromJsonAsync<T>();
    }
    
    public bool HasLink(HateoasResource resource, string rel)
    {
        return resource.Links.ContainsKey(rel);
    }
}

// Usage  
var client = new HateoasClient(httpClient);
var user = await client.GetUserAsync("123");

// Check capabilities
if (client.HasLink(user, "edit"))
{
    await client.FollowLinkAsync<UserDto>(user, "edit", new { DisplayName = "New Name" });
}
```

## Best Practices

### 1. Link Relationships (rel values)

Use standard and custom rel values consistently:

#### Standard Relations
- `self` - Link to the resource itself
- `edit` - Link to edit the resource  
- `delete` - Link to delete the resource
- `next` / `prev` - Navigation links
- `first` / `last` - Boundary navigation
- `related` - Related resource link

#### Custom Relations  
- `activate` / `deactivate` - State changes
- `approve` / `reject` - Workflow actions
- `duplicate` - Resource duplication
- `export` - Data export functionality

### 2. Link Metadata

Include helpful metadata in links:

```json
{
  "href": "/api/v1/users/123",
  "rel": "edit", 
  "method": "PUT",
  "title": "Update user profile",
  "type": "application/json",
  "deprecated": false,
  "templated": false
}
```

### 3. Error Handling

Gracefully handle link generation failures:

```csharp
private UserDto AddLinksToUser(UserDto user)
{
    try
    {
        var links = _linkGenerator.GenerateUserLinks(user.Id, GetUserId(), HasRole("Admin"));
        user.AddLinks(links);
    }
    catch (Exception ex)
    {
        _logger.LogWarning(ex, "Failed to generate links for user {UserId}", user.Id);
        // Continue without links rather than failing the request
    }
    
    return user;
}
```

### 4. Performance Considerations

- **Lazy Loading**: Generate links only when needed
- **Caching**: Cache generated links for repeated requests
- **Batch Generation**: Generate links for collections efficiently

```csharp
// Efficient bulk link generation
public IEnumerable<UserDto> AddLinksToUsers(IEnumerable<UserDto> users)
{
    var currentUserId = GetUserId();
    var isAdmin = HasRole("Administrator");
    
    return users.Select(user => 
    {
        var links = _linkGenerator.GenerateUserLinks(user.Id, currentUserId, isAdmin);
        user.AddLinks(links);
        return user;
    });
}
```

### 5. Testing HATEOAS Links

```csharp
[Test]
public async Task GetUser_ShouldIncludeAppropriateLinks()
{
    // Arrange
    var user = await CreateTestUserAsync();
    
    // Act  
    var response = await _client.GetAsync($"/api/v1/users/{user.Id}");
    var result = await response.Content.ReadFromJsonAsync<UserDto>();
    
    // Assert
    Assert.NotNull(result._links);
    Assert.True(result.HasLink("self"));
    Assert.True(result.HasLink("edit"));
    Assert.Equal("GET", result.GetLink("self").Method);
    Assert.Equal("PUT", result.GetLink("edit").Method);
}

[Test]
public async Task GetUser_AsAdmin_ShouldIncludeAdminLinks()
{
    // Arrange
    var user = await CreateTestUserAsync();
    AuthenticateAsAdmin();
    
    // Act
    var response = await _client.GetAsync($"/api/v1/users/{user.Id}");
    var result = await response.Content.ReadFromJsonAsync<UserDto>();
    
    // Assert
    Assert.True(result.HasLink("delete"));
    Assert.True(result.HasLink("deactivate"));
}
```

---

## Summary

HATEOAS implementation in ModernAPI provides:

1. **Self-Descriptive APIs**: Responses include navigation information
2. **Reduced Coupling**: Clients discover capabilities dynamically  
3. **Permission-Aware**: Links adapt to user permissions and context
4. **Workflow Support**: State-based navigation through business processes
5. **Standard Compliance**: Following REST Level 3 maturity principles

This comprehensive HATEOAS implementation makes your API truly RESTful, discoverable, and client-friendly, enabling sophisticated client applications that can adapt to API changes and user permissions dynamically.

For practical implementation examples, see the [API Development Cookbook](API_DEVELOPMENT_COOKBOOK.md).