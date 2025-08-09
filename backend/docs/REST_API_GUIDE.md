# REST API Complete Guide

A comprehensive guide to the ModernAPI .NET 9 Web API template implementing advanced REST architecture patterns and Level 3 REST maturity (HATEOAS).

## Table of Contents

- [REST Maturity Levels](#rest-maturity-levels)
- [API Features Overview](#api-features-overview)
- [Quick Start Guide](#quick-start-guide)
- [Architecture Overview](#architecture-overview)
- [REST Level 3 Implementation](#rest-level-3-implementation)
- [API Standards Compliance](#api-standards-compliance)
- [Performance Features](#performance-features)
- [Security Implementation](#security-implementation)
- [Best Practices Summary](#best-practices-summary)
- [Related Documentation](#related-documentation)

## REST Maturity Levels

ModernAPI achieves **Level 3 REST maturity** (Richardson Maturity Model) with full HATEOAS implementation:

### Level 0: HTTP as Transport (❌ Not Modern)
- Single endpoint, POST-only operations
- HTTP used only as transport mechanism

### Level 1: Resources (✅ Implemented)
- Multiple resource endpoints
- Proper URL structure: `/api/v1/users/{id}`
- Resource-based thinking

### Level 2: HTTP Verbs (✅ Implemented)
- Proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Correct status codes (200, 201, 204, 404, 422, etc.)
- HTTP headers for metadata

### Level 3: Hypermedia Controls (✅ Implemented)
- HATEOAS (Hypermedia as the Engine of Application State)
- Self-descriptive responses with navigation links
- Client-driven workflow through discovered actions

## API Features Overview

### Core REST Features

| Feature | Implementation | Benefit |
|---------|---------------|---------|
| **API Versioning** | URL segment, header, query string | Backward compatibility |
| **HATEOAS Links** | Hypermedia controls in all responses | Client discoverability |
| **HTTP Caching** | ETags, Last-Modified, conditional requests | Performance optimization |
| **PATCH Support** | JSON Patch Document (RFC 6902) | Efficient partial updates |
| **Status Codes** | RFC-compliant error responses | Standardized communication |
| **Content Negotiation** | JSON, Problem Details (RFC 7807) | Flexible response formats |

### Advanced Features

- **Conditional Requests**: ETag-based optimistic concurrency
- **Cache Policies**: Resource-specific caching strategies
- **Pagination**: HATEOAS-enabled navigation
- **Field Validation**: Comprehensive validation with Problem Details
- **Rate Limiting**: API protection and fair usage
- **OpenTelemetry**: Distributed tracing and metrics

## Quick Start Guide

### 1. Authentication

First, obtain an access token:

```bash
# Register a new user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "password": "Developer123!",
    "confirmPassword": "Developer123!",
    "displayName": "API Developer"
  }'

# Login to get tokens
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "password": "Developer123!"
  }'
```

Response includes HATEOAS links:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "refresh-token-here",
  "expiresAt": "2024-01-01T12:00:00Z",
  "_links": {
    "profile": {
      "href": "http://localhost:5000/api/v1/users/me",
      "rel": "profile",
      "method": "GET"
    },
    "logout": {
      "href": "http://localhost:5000/api/v1/auth/logout",
      "rel": "logout",
      "method": "POST"
    }
  }
}
```

### 2. Basic CRUD Operations

#### Get User Profile (with caching)
```bash
curl -X GET http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

Response with HATEOAS links and cache headers:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "developer@example.com",
  "displayName": "API Developer",
  "isActive": true,
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T11:30:00Z",
  "_links": {
    "self": {
      "href": "http://localhost:5000/api/v1/users/123e4567-e89b-12d3-a456-426614174000",
      "rel": "self",
      "method": "GET"
    },
    "edit": {
      "href": "http://localhost:5000/api/v1/users/123e4567-e89b-12d3-a456-426614174000",
      "rel": "edit",
      "method": "PUT"
    },
    "patch": {
      "href": "http://localhost:5000/api/v1/users/123e4567-e89b-12d3-a456-426614174000",
      "rel": "patch",
      "method": "PATCH",
      "type": "application/json-patch+json"
    }
  }
}
```

Headers include caching information:
```
ETag: "W/\"123e4567-1672574200\""
Last-Modified: Mon, 01 Jan 2024 11:30:00 GMT
Cache-Control: private, max-age=300, must-revalidate
```

#### Update with Conditional Request
```bash
curl -X PUT http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "If-Match: W/\"123e4567-1672574200\"" \
  -d '{
    "displayName": "Senior API Developer"
  }'
```

#### Partial Update with PATCH
```bash
curl -X PATCH http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json-patch+json" \
  -H "If-Match: W/\"123e4567-1672574200\"" \
  -d '[
    {
      "op": "replace",
      "path": "/displayName",
      "value": "Senior API Developer"
    }
  ]'
```

### 3. Collection Operations with Pagination

```bash
curl -X GET "http://localhost:5000/api/v1/users?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response with pagination links:
```json
{
  "items": [...],
  "totalCount": 150,
  "currentPage": 1,
  "pageSize": 10,
  "_metadata": {
    "totalCount": 150,
    "currentPage": 1,
    "pageSize": 10,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "_links": {
    "self": {
      "href": "http://localhost:5000/api/v1/users?page=1&pageSize=10",
      "rel": "self",
      "method": "GET"
    },
    "next": {
      "href": "http://localhost:5000/api/v1/users?page=2&pageSize=10",
      "rel": "next",
      "method": "GET"
    },
    "last": {
      "href": "http://localhost:5000/api/v1/users?page=15&pageSize=10",
      "rel": "last",
      "method": "GET"
    }
  }
}
```

## Architecture Overview

### Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│              API Layer                  │
│  Controllers, Middleware, HATEOAS       │
├─────────────────────────────────────────┤
│           Application Layer             │
│    Services, DTOs, Caching, Validation │
├─────────────────────────────────────────┤
│            Domain Layer                 │
│      Entities, Value Objects, Events   │
├─────────────────────────────────────────┤
│         Infrastructure Layer            │
│    Data Access, External Services      │
└─────────────────────────────────────────┘
```

### Key Components

#### API Layer (`ModernAPI.API`)
- **Controllers**: RESTful endpoints with HATEOAS
- **Base Controller**: Common functionality and caching
- **Link Generator**: HATEOAS link creation service
- **Middleware**: Exception handling, logging, metrics

#### Application Layer (`ModernAPI.Application`)
- **Services**: Business logic implementation
- **DTOs**: Data transfer objects with HATEOAS support
- **Caching Services**: HTTP caching and ETag management
- **Validators**: Input validation with FluentValidation

#### Domain Layer (`ModernAPI.Domain`)
- **Entities**: Business objects with behavior
- **Value Objects**: Immutable data structures
- **Domain Events**: Business event notifications

#### Infrastructure Layer (`ModernAPI.Infrastructure`)
- **Repositories**: Data access implementation
- **Database Context**: EF Core configuration
- **External Services**: Third-party integrations

## REST Level 3 Implementation

### HATEOAS (Hypermedia as the Engine of Application State)

Every response includes hypermedia links that guide client navigation:

```json
{
  "data": { "..." },
  "_links": {
    "self": { "href": "/resource/123", "rel": "self", "method": "GET" },
    "edit": { "href": "/resource/123", "rel": "edit", "method": "PUT" },
    "delete": { "href": "/resource/123", "rel": "delete", "method": "DELETE" }
  }
}
```

### Dynamic Link Generation

Links are context-aware based on:
- User permissions (owner vs. admin vs. guest)
- Resource state (active vs. inactive)
- Business rules (e.g., can't delete if has dependencies)

### Discoverability

Clients can navigate the API without hardcoded URLs:
- Root endpoint provides entry points
- Each resource response includes available actions
- Pagination automatically includes navigation links

## API Standards Compliance

### RFC Compliance

| Standard | Implementation | Purpose |
|----------|---------------|---------|
| **RFC 7231** | HTTP/1.1 Semantics | Standard HTTP methods and status codes |
| **RFC 7807** | Problem Details | Standardized error responses |
| **RFC 6902** | JSON Patch | Partial resource updates |
| **RFC 7232** | Conditional Requests | ETag-based caching |
| **RFC 5988** | Web Linking | HATEOAS link relationships |

### Status Code Usage

```json
// Success Responses
200 OK - Resource retrieved successfully
201 Created - Resource created successfully  
204 No Content - Resource updated/deleted successfully
304 Not Modified - Cached resource is still valid

// Client Error Responses  
400 Bad Request - Malformed request syntax
401 Unauthorized - Authentication required
403 Forbidden - Access denied
404 Not Found - Resource doesn't exist
409 Conflict - Resource conflict (duplicate email)
412 Precondition Failed - Conditional request failed
422 Unprocessable Entity - Validation errors

// Server Error Responses
500 Internal Server Error - Unexpected server error
503 Service Unavailable - Service temporarily down
```

## Performance Features

### HTTP Caching Strategy

#### Cache Policies by Resource Type

```csharp
// Individual user resources (owner accessing own data)
Cache-Control: private, max-age=300, must-revalidate

// User collections (frequently changing)  
Cache-Control: private, max-age=120, must-revalidate

// Search results (very dynamic)
Cache-Control: private, max-age=60, must-revalidate

// Admin resources (sensitive data)
Cache-Control: private, max-age=120, must-revalidate, no-store
```

#### Conditional Requests

```bash
# Client sends ETag from previous response
If-None-Match: W/"123e4567-1672574200"

# Server responds with 304 if unchanged
HTTP/1.1 304 Not Modified
ETag: W/"123e4567-1672574200"
```

#### Optimistic Concurrency Control

```bash
# Client includes ETag when updating
If-Match: W/"123e4567-1672574200"

# Server returns 412 if resource was modified
HTTP/1.1 412 Precondition Failed
```

### Performance Monitoring

- **OpenTelemetry**: Distributed tracing and metrics
- **Prometheus Metrics**: Request duration, error rates
- **Health Checks**: Database and dependency monitoring
- **Structured Logging**: JSON-formatted logs with correlation

## Security Implementation

### Authentication & Authorization
- **JWT Bearer Tokens**: Stateless authentication
- **Refresh Tokens**: Secure token renewal
- **Role-based Authorization**: Fine-grained permissions
- **Scope-based Access**: Resource-level permissions

### Security Headers
```
Content-Type: application/json
X-Content-Type-Options: nosniff  
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Input Validation
- **FluentValidation**: Comprehensive input validation
- **Model Binding**: Automatic request validation
- **Problem Details**: Standardized error responses

## Best Practices Summary

### API Design Principles

1. **Consistent Resource Naming**
   - Use nouns for resources: `/users`, `/products`
   - Use plurals for collections: `/api/v1/users`
   - Use hyphens for multi-word resources: `/user-profiles`

2. **HTTP Method Usage**
   ```
   GET    /users      # List users
   GET    /users/{id} # Get specific user  
   POST   /users      # Create new user
   PUT    /users/{id} # Update entire user
   PATCH  /users/{id} # Partial user update
   DELETE /users/{id} # Delete user
   ```

3. **Response Format**
   - Always include HATEOAS links
   - Use consistent error format (Problem Details)
   - Include metadata for collections
   - Provide ETag headers for cacheable resources

4. **Caching Strategy**
   - Use ETags for all resources
   - Implement conditional requests
   - Set appropriate Cache-Control headers
   - Support If-None-Match and If-Modified-Since

5. **Error Handling**
   - Use appropriate HTTP status codes
   - Provide detailed error messages
   - Include validation details for 422 responses
   - Log errors with correlation IDs

## Related Documentation

For detailed implementation guides, see:

- [API Versioning Guide](API_VERSIONING.md) - Versioning strategies and migration
- [HATEOAS Implementation Guide](HATEOAS_GUIDE.md) - Hypermedia controls and links  
- [HTTP Caching Guide](HTTP_CACHING.md) - ETag implementation and cache policies
- [PATCH Operations Guide](PATCH_OPERATIONS.md) - JSON Patch operations and examples
- [HTTP Status Codes Reference](HTTP_STATUS_CODES_REFERENCE.md) - Complete status code usage
- [API Development Cookbook](API_DEVELOPMENT_COOKBOOK.md) - Practical patterns and recipes

---

## Examples and Testing

### Using the API with curl

See complete examples in our [API Development Cookbook](API_DEVELOPMENT_COOKBOOK.md) including:
- Authentication workflows  
- CRUD operations
- Conditional requests
- PATCH operations
- Error handling
- Collection navigation

### Integration with Client Applications

The API's HATEOAS implementation makes it ideal for:
- **Single Page Applications (SPA)**: Dynamic form generation
- **Mobile Applications**: Reduced client coupling
- **API Gateways**: Self-documenting service discovery
- **Microservices**: Service mesh navigation

This guide provides the foundation for building robust, scalable REST APIs following modern best practices and industry standards.