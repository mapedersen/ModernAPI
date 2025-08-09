# REST API Features

## Overview
ModernAPI is a production-ready .NET 9 Web API template implementing REST Level 3 (HATEOAS) with comprehensive features.

## Features Implemented

### ✅ REST Level 3 (HATEOAS)
- Hypermedia links in all responses
- Self-discoverable API navigation
- Dynamic action discovery based on permissions

### ✅ Complete HTTP Verb Support
- **GET** - Retrieve resources
- **POST** - Create resources (returns 201 + Location header)
- **PUT** - Replace entire resources
- **PATCH** - Partial updates with JSON Patch (RFC 6902)
- **DELETE** - Remove resources (returns 204)

### ✅ API Versioning
- URL segment: `/api/v1.0/users`
- Header: `Api-Version: 1.0`
- Query string: `?version=1.0`

### ✅ HTTP Caching & ETags
- Conditional requests (304 Not Modified)
- ETag-based validation
- Optimized cache policies per resource type

### ✅ Standardized Status Codes
- 200, 201, 204, 304, 400, 401, 403, 404, 409, 412, 422, 500
- RFC 7807 Problem Details for all errors

### ✅ Performance & Observability
- OpenTelemetry tracing and metrics
- Request correlation IDs
- Structured logging with Serilog

## Quick Examples

### HATEOAS Response
```json
{
  "id": "123",
  "displayName": "John Doe",
  "_links": {
    "self": { "href": "/api/v1/users/123", "method": "GET" },
    "edit": { "href": "/api/v1/users/123", "method": "PUT" }
  }
}
```

### PATCH Request
```http
PATCH /api/v1/users/123
Content-Type: application/json-patch+json

[
  { "op": "replace", "path": "/displayName", "value": "Jane Doe" }
]
```

### Conditional Request
```http
GET /api/v1/users/123
If-None-Match: "W/\"1641024000\""

Response: 304 Not Modified
```

## Architecture
- **Clean Architecture** (Domain, Application, Infrastructure, API)
- **Domain-Driven Design** patterns
- **SOLID principles** throughout
- **Comprehensive testing** strategy