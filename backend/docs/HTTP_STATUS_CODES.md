# HTTP Status Code Standardization Guide

This document defines the standardized HTTP status codes for the ModernAPI .NET 9 Web API template to ensure consistent REST API compliance across all endpoints.

## Table of Contents

1. [Overview](#overview)
2. [Success Status Codes (2xx)](#success-status-codes-2xx)
3. [Redirection Status Codes (3xx)](#redirection-status-codes-3xx)
4. [Client Error Status Codes (4xx)](#client-error-status-codes-4xx)
5. [Server Error Status Codes (5xx)](#server-error-status-codes-5xx)
6. [Exception to Status Code Mapping](#exception-to-status-code-mapping)
7. [ProducesResponseType Standards](#producesresponsetype-standards)
8. [Problem Details Format](#problem-details-format)
9. [Implementation Guidelines](#implementation-guidelines)

## Overview

All API endpoints must follow RFC 7231 HTTP status code semantics and return appropriate status codes based on the operation result. This guide ensures consistency across all controllers and provides clear expectations for API consumers.

## Success Status Codes (2xx)

### 200 OK
**Usage:** Successful GET, PUT, PATCH operations that return data
- Used for successful data retrieval
- Used for successful updates that return the updated resource
- Used for successful operations that return operation results

**Examples:**
- `GET /api/v1/users/{id}` - Returns user data
- `PUT /api/v1/users/{id}` - Returns updated user data
- `POST /api/v1/auth/login` - Returns authentication tokens

### 201 Created
**Usage:** Successful POST operations that create new resources
- Must include `Location` header pointing to the created resource
- Should return the created resource in the response body
- Used for user registration, resource creation

**Examples:**
- `POST /api/v1/users` - Creates new user, returns user data with Location header
- `POST /api/v1/auth/register` - Creates new user account, returns auth data

**Implementation:**
```csharp
return CreatedAtAction(nameof(GetUser), new { id = result.Id }, result);
```

### 204 No Content
**Usage:** Successful DELETE operations or operations that don't return data
- Used for successful deletions
- Used for successful operations that don't need to return data
- Response body should be empty

**Examples:**
- `DELETE /api/v1/users/{id}` - Successfully deletes user
- `POST /api/v1/auth/logout` - Successfully logs out (alternative to 200)

## Redirection Status Codes (3xx)

### 304 Not Modified
**Usage:** Conditional GET requests where resource hasn't changed
- Used with ETag and If-None-Match headers
- Used with Last-Modified and If-Modified-Since headers
- Response body should be empty

**Examples:**
- `GET /api/v1/users/{id}` with matching ETag
- `GET /api/v1/users` with matching collection ETag

## Client Error Status Codes (4xx)

### 400 Bad Request
**Usage:** Invalid request format, malformed JSON, or generic client errors
- Used for malformed JSON payloads
- Used for invalid query parameters
- Used for general client-side errors that don't fit other 4xx codes

**Problem Details Type:** `https://tools.ietf.org/html/rfc7231#section-6.5.1`

### 401 Unauthorized
**Usage:** Authentication required or authentication failed
- Used when no authentication credentials provided
- Used when authentication credentials are invalid
- Used for expired access tokens (not refresh tokens)

**Problem Details Type:** `https://tools.ietf.org/html/rfc7235#section-3.1`

**Examples:**
- Missing Authorization header
- Invalid JWT token
- Expired access token

### 403 Forbidden
**Usage:** Valid authentication but insufficient permissions
- Used when user is authenticated but lacks required permissions
- Used for role-based access control violations
- Used when user tries to access resources they don't own (without admin rights)

**Problem Details Type:** `https://tools.ietf.org/html/rfc7231#section-6.5.3`

**Examples:**
- User trying to access admin-only endpoints
- User trying to modify another user's data without admin privileges

### 404 Not Found
**Usage:** Requested resource doesn't exist
- Used when resource ID doesn't exist
- Used for invalid API endpoints
- Should not reveal whether resource never existed vs. user lacks access

**Problem Details Type:** `https://tools.ietf.org/html/rfc7231#section-6.5.4`

**Examples:**
- `GET /api/v1/users/{non-existent-id}`
- `PUT /api/v1/users/{non-existent-id}`

### 409 Conflict
**Usage:** Request conflicts with current resource state
- Used for duplicate resource creation (e.g., email already exists)
- Used for business rule conflicts
- Used for optimistic concurrency conflicts (alternative to 412)

**Problem Details Type:** `https://tools.ietf.org/html/rfc7231#section-6.5.8`

**Examples:**
- Creating user with existing email
- Deactivating already inactive user
- Verifying already verified email

### 412 Precondition Failed
**Usage:** Conditional request preconditions failed
- Used with If-Match header mismatches (ETag validation)
- Used with If-Unmodified-Since header failures
- Used for optimistic concurrency control

**Problem Details Type:** `https://tools.ietf.org/html/rfc7231#section-6.5.10`

**Examples:**
- `PUT /api/v1/users/{id}` with outdated If-Match ETag
- `PATCH /api/v1/users/{id}` with stale resource state

### 422 Unprocessable Entity
**Usage:** Request is well-formed but contains validation errors
- Used for FluentValidation failures
- Used for business rule validation failures
- Used when request format is correct but content is invalid

**Problem Details Type:** `https://tools.ietf.org/html/rfc4918#section-11.2`

**Examples:**
- Invalid email format in registration
- Password doesn't meet complexity requirements
- Required fields missing or invalid

## Server Error Status Codes (5xx)

### 500 Internal Server Error
**Usage:** Unhandled server-side exceptions
- Used for unexpected exceptions
- Used for database connection failures
- Used for third-party service failures

**Problem Details Type:** `https://tools.ietf.org/html/rfc7231#section-6.6.1`

**Security Note:** Never expose sensitive information in production error messages.

## Exception to Status Code Mapping

| Exception Type | HTTP Status | Problem Details Type |
|---------------|-------------|---------------------|
| `NotFoundException` | 404 | `https://tools.ietf.org/html/rfc7231#section-6.5.4` |
| `ConflictException` | 409 | `https://tools.ietf.org/html/rfc7231#section-6.5.8` |
| `ValidationException` | 422 | `https://tools.ietf.org/html/rfc4918#section-11.2` |
| `UnauthorizedAccessException` | 401 | `https://tools.ietf.org/html/rfc7235#section-3.1` |
| `ArgumentException` | 400 | `https://tools.ietf.org/html/rfc7231#section-6.5.1` |
| `DomainException` | 400 | Custom domain type |
| Generic exceptions | 500 | `https://tools.ietf.org/html/rfc7231#section-6.6.1` |

## ProducesResponseType Standards

Every controller action must declare all possible response types using `ProducesResponseType` attributes:

```csharp
[ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status304NotModified)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
public async Task<ActionResult<UserDto>> GetUser(Guid id)
```

### Required Attributes by Operation Type

**GET Operations:**
- `200 OK` - Success with data
- `304 Not Modified` - For cacheable resources
- `401 Unauthorized` - If authentication required
- `404 Not Found` - If resource might not exist
- `403 Forbidden` - If authorization required

**POST Operations (Create):**
- `201 Created` - Successful creation
- `400 Bad Request` - Invalid request format
- `422 Unprocessable Entity` - Validation failures
- `409 Conflict` - Resource conflicts
- `401 Unauthorized` - If authentication required

**PUT Operations:**
- `200 OK` - Successful update with data
- `400 Bad Request` - Invalid request format
- `422 Unprocessable Entity` - Validation failures
- `401 Unauthorized` - If authentication required
- `403 Forbidden` - If authorization required
- `404 Not Found` - If resource doesn't exist
- `412 Precondition Failed` - If using conditional updates

**PATCH Operations:**
- Same as PUT operations
- Additionally consider `400 Bad Request` for invalid patch operations

**DELETE Operations:**
- `204 No Content` - Successful deletion
- `401 Unauthorized` - If authentication required
- `403 Forbidden` - If authorization required
- `404 Not Found` - If resource doesn't exist

## Problem Details Format

All error responses must follow RFC 7807 Problem Details format:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Resource not found",
  "status": 404,
  "detail": "User with identifier 'non-existent-id' was not found",
  "instance": "/api/v1/users/non-existent-id",
  "requestId": "80000001-0001-f700-b63f-84710c7967bb",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Validation Error Format

Validation errors should use `ValidationProblemDetails`:

```json
{
  "type": "https://tools.ietf.org/html/rfc4918#section-11.2",
  "title": "One or more validation errors occurred",
  "status": 422,
  "instance": "/api/v1/users",
  "errors": {
    "Email": ["Email address is required", "Email format is invalid"],
    "DisplayName": ["Display name must be between 2 and 50 characters"]
  },
  "requestId": "80000001-0001-f700-b63f-84710c7967bb",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## Implementation Guidelines

### 1. Controller Level
- Use `ProducesResponseType` attributes for all possible responses
- Implement proper status code returns using helper methods
- Ensure Location headers for 201 responses

### 2. Exception Handling
- Map exceptions consistently in global middleware
- Use appropriate Problem Details types
- Include correlation IDs for troubleshooting

### 3. Caching Integration
- Return 304 for conditional GET requests
- Return 412 for failed conditional updates
- Set appropriate cache headers

### 4. Security Considerations
- Don't expose sensitive information in error messages
- Use 404 instead of 403 to avoid information disclosure when appropriate
- Implement consistent error responses to prevent information leakage

### 5. Testing Requirements
- Test all declared response status codes
- Verify Problem Details format compliance
- Test edge cases and error conditions

### 6. Documentation
- Ensure OpenAPI/Swagger reflects all status codes
- Provide clear examples for each response type
- Document error response formats

## Validation Checklist

Before deploying, ensure:

- [ ] All controller actions have complete `ProducesResponseType` attributes
- [ ] Exception middleware maps all exception types correctly
- [ ] Problem Details responses are RFC 7807 compliant
- [ ] Location headers are present for 201 responses
- [ ] Conditional request handling returns appropriate 304/412 codes
- [ ] Security considerations are addressed in error responses
- [ ] All status codes are tested with integration tests
- [ ] OpenAPI documentation is complete and accurate