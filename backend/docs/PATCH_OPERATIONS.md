# PATCH Operations Guide

Comprehensive guide to JSON Patch implementation in ModernAPI, following RFC 6902 standard for efficient partial resource updates with optimistic concurrency control.

## Table of Contents

- [JSON Patch Overview](#json-patch-overview)
- [RFC 6902 Standard](#rfc-6902-standard)
- [Supported Operations](#supported-operations)
- [Implementation Architecture](#implementation-architecture)
- [PATCH Examples](#patch-examples)
- [Security Considerations](#security-considerations)
- [Validation and Error Handling](#validation-and-error-handling)
- [Best Practices](#best-practices)
- [Client Integration](#client-integration)

## JSON Patch Overview

**JSON Patch** is a standard format for describing changes to JSON documents. Instead of sending the entire resource, clients can send only the specific changes they want to make, resulting in:

- **Bandwidth efficiency**: Send only what changes
- **Atomic operations**: All changes succeed or fail together  
- **Conflict detection**: Works with ETags for optimistic concurrency
- **Granular updates**: Target specific fields or array elements

### Why Use PATCH?

#### Traditional PUT Update
```http
PUT /api/v1/users/123 HTTP/1.1
Content-Type: application/json

{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "displayName": "John Smith",  // Only field that changed
  "isActive": true,
  "bio": "Software Developer",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```
**Problem**: Send entire resource even for small changes

#### JSON Patch Alternative
```http
PATCH /api/v1/users/123 HTTP/1.1  
Content-Type: application/json-patch+json
If-Match: W/"123e4567-1672574200"

[
  {
    "op": "replace",
    "path": "/displayName", 
    "value": "John Smith"
  }
]
```
**Benefits**: Send only the change, reduce bandwidth by 85%

## RFC 6902 Standard

ModernAPI implements [RFC 6902 - JSON Patch](https://tools.ietf.org/html/rfc6902) specification:

### Media Type
```
Content-Type: application/json-patch+json
```

### Operation Format
Each operation is a JSON object with:
- `op`: Operation type (required)
- `path`: JSON Pointer to target location (required)
- `value`: New value (required for add, replace, test)
- `from`: Source path (required for copy, move)

### JSON Pointer Syntax
JSON Pointers identify locations within JSON documents:
```
/displayName           -> root.displayName
/preferences/theme     -> root.preferences.theme
/tags/0               -> root.tags[0] (first array element)
/tags/-               -> root.tags (append to array)
```

## Supported Operations

### 1. Replace Operation

Replace the value at a given path.

```json
{
  "op": "replace",
  "path": "/displayName",
  "value": "John Smith"
}
```

**Before:**
```json
{
  "displayName": "John Doe",
  "email": "john@example.com"
}
```

**After:**
```json
{
  "displayName": "John Smith",
  "email": "john@example.com"
}
```

### 2. Add Operation

Add a new value at a given path.

#### Add New Property
```json
{
  "op": "add",
  "path": "/bio",
  "value": "Software Developer"
}
```

#### Add to Array
```json
{
  "op": "add",
  "path": "/tags/-",
  "value": "developer"
}
```

#### Add to Array at Index
```json
{
  "op": "add", 
  "path": "/tags/1",
  "value": "senior"
}
```

### 3. Remove Operation

Remove a value at a given path.

#### Remove Property
```json
{
  "op": "remove",
  "path": "/bio"
}
```

#### Remove Array Element
```json
{
  "op": "remove",
  "path": "/tags/0"
}
```

### 4. Move Operation

Move a value from one path to another.

```json
{
  "op": "move",
  "from": "/preferences/oldSetting",
  "path": "/preferences/newSetting"
}
```

### 5. Copy Operation

Copy a value from one path to another.

```json
{
  "op": "copy",
  "from": "/preferences/theme",
  "path": "/preferences/backupTheme"
}
```

### 6. Test Operation

Test that a value at a path equals a specific value. Useful for conditional operations.

```json
{
  "op": "test",
  "path": "/isActive",
  "value": true
}
```

**Use Case**: Ensure user is active before making changes
```json
[
  {
    "op": "test",
    "path": "/isActive",
    "value": true
  },
  {
    "op": "replace", 
    "path": "/displayName",
    "value": "New Name"
  }
]
```

## Implementation Architecture

### DTO for PATCH Operations

```csharp
/// <summary>
/// DTO for PATCH operations on user profiles.
/// Only includes fields that can be modified via PATCH.
/// </summary>
public record PatchUserProfileRequest
{
    /// <summary>Display name of the user</summary>
    public string? DisplayName { get; init; }
    
    /// <summary>User bio/description</summary>
    public string? Bio { get; init; }
    
    /// <summary>User preferences</summary>
    public UserPreferencesDto? Preferences { get; init; }
    
    /// <summary>Tags associated with the user</summary>
    public List<string>? Tags { get; init; }
}

/// <summary>
/// User preferences that can be patched
/// </summary>
public record UserPreferencesDto
{
    public string? Theme { get; init; }
    public bool? NotificationsEnabled { get; init; }
    public string? Language { get; init; }
    public string? Timezone { get; init; }
}
```

### Controller Implementation

```csharp
/// <summary>
/// Partially updates a user's profile using JSON Patch operations.
/// Supports RFC 6902 JSON Patch standard for granular updates.
/// </summary>
[HttpPatch("{id:guid}")]
[Authorize]
[Consumes("application/json-patch+json")]
[ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
[ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status422UnprocessableEntity)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status412PreconditionFailed)]
public async Task<ActionResult<UserResponse>> PatchUser(Guid id, 
    JsonPatchDocument<PatchUserProfileRequest> patchDocument)
{
    _logger.LogInformation("Applying patch operations to user profile: {UserId}", id);

    // Validate patch document
    if (patchDocument == null || patchDocument.Operations.Count == 0)
    {
        return BadRequest("Patch document cannot be null or empty");
    }

    // Ensure user can only update their own profile or has admin privileges
    EnsureUserResourceAccess(id.ToString());

    // Get current user state for conditional request validation
    var currentUser = await _userService.GetUserByIdAsync(id);
    
    // Validate conditional update request (ETag check)
    var conditionalResult = ValidateConditionalUpdate(_cachingService, _etagService, currentUser);
    if (conditionalResult != null)
    {
        return conditionalResult; // Returns 412 Precondition Failed
    }

    var result = await _userService.PatchUserProfileAsync(id, patchDocument);

    // Set no-cache headers for update responses to ensure fresh data
    Response.SetNoCache(_cachingService);

    return Ok(result);
}
```

### Service Implementation

```csharp
public interface IUserService
{
    Task<UserResponse> PatchUserProfileAsync(Guid userId, 
        JsonPatchDocument<PatchUserProfileRequest> patchDocument);
}

public class UserService : IUserService
{
    public async Task<UserResponse> PatchUserProfileAsync(Guid userId, 
        JsonPatchDocument<PatchUserProfileRequest> patchDocument)
    {
        // Get current user
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new UserNotFoundException($"User with ID {userId} not found");
        }

        // Map current user to patch DTO
        var patchRequest = _mapper.Map<PatchUserProfileRequest>(user);
        
        // Apply patch operations
        try
        {
            patchDocument.ApplyTo(patchRequest, error => 
            {
                throw new ValidationException($"Patch operation failed: {error.ErrorMessage}");
            });
        }
        catch (JsonPatchException ex)
        {
            throw new ValidationException($"Invalid patch operation: {ex.Message}");
        }

        // Validate the patched model
        var validationResult = await _patchValidator.ValidateAsync(patchRequest);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Apply changes to domain entity
        ApplyPatchToUser(user, patchRequest);

        // Save changes
        await _userRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        // Return updated user
        var userDto = _mapper.Map<UserDto>(user);
        return new UserResponse
        {
            User = userDto,
            Message = "User profile updated successfully"
        };
    }

    private static void ApplyPatchToUser(User user, PatchUserProfileRequest patchRequest)
    {
        if (patchRequest.DisplayName != null)
            user.UpdateDisplayName(patchRequest.DisplayName);
            
        if (patchRequest.Bio != null)
            user.UpdateBio(patchRequest.Bio);

        if (patchRequest.Preferences != null)
        {
            user.UpdatePreferences(
                theme: patchRequest.Preferences.Theme,
                notificationsEnabled: patchRequest.Preferences.NotificationsEnabled,
                language: patchRequest.Preferences.Language,
                timezone: patchRequest.Preferences.Timezone
            );
        }

        if (patchRequest.Tags != null)
            user.UpdateTags(patchRequest.Tags);
    }
}
```

### Validation

```csharp
public class PatchUserProfileValidator : AbstractValidator<PatchUserProfileRequest>
{
    public PatchUserProfileValidator()
    {
        RuleFor(x => x.DisplayName)
            .Length(1, 100)
            .When(x => x.DisplayName != null);

        RuleFor(x => x.Bio)
            .MaximumLength(500)
            .When(x => x.Bio != null);

        RuleFor(x => x.Tags)
            .Must(tags => tags.Count <= 10)
            .WithMessage("Maximum 10 tags allowed")
            .When(x => x.Tags != null);

        RuleFor(x => x.Tags)
            .Must(tags => tags.All(tag => tag.Length <= 50))
            .WithMessage("Each tag must be 50 characters or less")
            .When(x => x.Tags != null);
    }
}
```

## PATCH Examples

### 1. Simple Field Update

Update user's display name:

```http
PATCH /api/v1/users/123e4567-e89b-12d3-a456-426614174000 HTTP/1.1
Content-Type: application/json-patch+json
If-Match: W/"123e4567-1672574200"
Authorization: Bearer your-token

[
  {
    "op": "replace",
    "path": "/displayName",
    "value": "John Smith Jr."
  }
]
```

### 2. Multiple Field Updates

Update multiple fields atomically:

```http
PATCH /api/v1/users/123e4567-e89b-12d3-a456-426614174000 HTTP/1.1
Content-Type: application/json-patch+json
If-Match: W/"123e4567-1672574200"
Authorization: Bearer your-token

[
  {
    "op": "replace",
    "path": "/displayName", 
    "value": "John Smith"
  },
  {
    "op": "add",
    "path": "/bio",
    "value": "Senior Software Developer"
  },
  {
    "op": "replace",
    "path": "/preferences/theme",
    "value": "dark"
  }
]
```

### 3. Nested Object Updates

Update user preferences:

```http
PATCH /api/v1/users/me HTTP/1.1
Content-Type: application/json-patch+json
If-Match: W/"123e4567-1672574200"
Authorization: Bearer your-token

[
  {
    "op": "replace",
    "path": "/preferences/theme",
    "value": "dark"
  },
  {
    "op": "replace", 
    "path": "/preferences/notificationsEnabled",
    "value": false
  },
  {
    "op": "add",
    "path": "/preferences/timezone",
    "value": "America/New_York"
  }
]
```

### 4. Array Operations

Manage user tags:

```http
PATCH /api/v1/users/me HTTP/1.1
Content-Type: application/json-patch+json
If-Match: W/"123e4567-1672574200"
Authorization: Bearer your-token

[
  {
    "op": "add",
    "path": "/tags/-",
    "value": "senior-developer"
  },
  {
    "op": "replace",
    "path": "/tags/0", 
    "value": "full-stack"
  },
  {
    "op": "remove",
    "path": "/tags/2"
  }
]
```

### 5. Conditional Operations

Use test operation for conditional updates:

```http
PATCH /api/v1/users/123 HTTP/1.1
Content-Type: application/json-patch+json
If-Match: W/"123e4567-1672574200"
Authorization: Bearer your-token

[
  {
    "op": "test",
    "path": "/isActive",
    "value": true
  },
  {
    "op": "replace",
    "path": "/displayName",
    "value": "Updated Name"
  }
]
```

### 6. Complex Nested Updates

```http
PATCH /api/v1/users/me HTTP/1.1
Content-Type: application/json-patch+json
If-Match: W/"123e4567-1672574200"

[
  {
    "op": "replace",
    "path": "/preferences",
    "value": {
      "theme": "dark",
      "language": "en-US", 
      "notifications": {
        "email": true,
        "push": false,
        "sms": false
      }
    }
  }
]
```

## Security Considerations

### 1. Path Validation

Only allow updates to permitted fields:

```csharp
public class SecurePatchValidator
{
    private static readonly HashSet<string> AllowedPaths = new()
    {
        "/displayName",
        "/bio", 
        "/preferences/theme",
        "/preferences/notificationsEnabled",
        "/preferences/language",
        "/preferences/timezone",
        "/tags"
    };

    public static bool IsPathAllowed(string path)
    {
        // Exact match for simple paths
        if (AllowedPaths.Contains(path))
            return true;
            
        // Pattern match for array operations
        if (Regex.IsMatch(path, @"^/tags/\d+$") || path == "/tags/-")
            return true;
            
        return false;
    }
}
```

### 2. Operation Filtering

Restrict dangerous operations:

```csharp
public static class PatchSecurityFilter
{
    private static readonly HashSet<string> AllowedOperations = new()
    {
        "replace", "add", "remove", "test"
    };
    
    // Disallow "move" and "copy" operations for security
    
    public static void ValidatePatchDocument<T>(JsonPatchDocument<T> patchDocument) where T : class
    {
        foreach (var operation in patchDocument.Operations)
        {
            if (!AllowedOperations.Contains(operation.op))
            {
                throw new ValidationException($"Operation '{operation.op}' is not allowed");
            }
            
            if (!SecurePatchValidator.IsPathAllowed(operation.path))
            {
                throw new ValidationException($"Path '{operation.path}' is not allowed");
            }
        }
    }
}
```

### 3. Input Sanitization

Sanitize values before applying:

```csharp
public static class PatchSanitizer
{
    public static void SanitizePatchDocument<T>(JsonPatchDocument<T> patchDocument) where T : class
    {
        foreach (var operation in patchDocument.Operations)
        {
            if (operation.value is string stringValue)
            {
                // Trim whitespace
                operation.value = stringValue.Trim();
                
                // HTML encode if needed
                if (operation.path.Contains("/bio"))
                {
                    operation.value = WebUtility.HtmlEncode(stringValue);
                }
            }
        }
    }
}
```

### 4. Authorization Checks

Ensure users can only patch their own resources:

```csharp
[HttpPatch("{id:guid}")]
public async Task<ActionResult<UserResponse>> PatchUser(Guid id, 
    JsonPatchDocument<PatchUserProfileRequest> patchDocument)
{
    // Ensure user can only update their own profile (or admin)
    EnsureUserResourceAccess(id.ToString());
    
    // Additional security validation
    PatchSecurityFilter.ValidatePatchDocument(patchDocument);
    PatchSanitizer.SanitizePatchDocument(patchDocument);
    
    // Continue with patch operation...
}
```

## Validation and Error Handling

### Validation Errors (422 Unprocessable Entity)

```json
{
  "type": "https://tools.ietf.org/html/rfc4918#section-11.2",
  "title": "One or more validation errors occurred", 
  "status": 422,
  "detail": "The patch operations contain invalid data",
  "instance": "/api/v1/users/123",
  "errors": {
    "DisplayName": ["Display name cannot be empty"],
    "Tags": ["Maximum 10 tags allowed"]
  },
  "_links": {
    "retry": {
      "href": "/api/v1/users/123",
      "rel": "retry",
      "method": "PATCH",
      "type": "application/json-patch+json"
    }
  }
}
```

### Patch Operation Errors

```json
{
  "type": "https://tools.ietf.org/html/rfc6902#section-5",
  "title": "JSON Patch Operation Failed",
  "status": 400,
  "detail": "The replace operation failed because path '/nonexistentField' was not found",
  "instance": "/api/v1/users/123",
  "patchError": {
    "operation": {
      "op": "replace",
      "path": "/nonexistentField", 
      "value": "some value"
    },
    "errorType": "PathNotFound"
  }
}
```

### Precondition Failed (412)

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.10",
  "title": "Precondition Failed",
  "status": 412,
  "detail": "The resource has been modified since you last retrieved it. Please refresh and try again.",
  "instance": "/api/v1/users/123",
  "currentETag": "W/\"123e4567-1672574300\"",
  "providedETag": "W/\"123e4567-1672574200\"",
  "_links": {
    "refresh": {
      "href": "/api/v1/users/123",
      "rel": "refresh", 
      "method": "GET"
    }
  }
}
```

## Best Practices

### 1. Atomic Operations

All operations in a patch document are applied atomically:

```json
[
  {"op": "replace", "path": "/displayName", "value": "John Smith"},
  {"op": "add", "path": "/tags/-", "value": "developer"},
  {"op": "remove", "path": "/bio"}
]
```

If any operation fails, none are applied.

### 2. Idempotent Operations

Design operations to be safely retryable:

```json
[
  {
    "op": "test",
    "path": "/displayName", 
    "value": "John Doe"
  },
  {
    "op": "replace",
    "path": "/displayName",
    "value": "John Smith"
  }
]
```

### 3. Meaningful Error Messages

Provide clear feedback on failures:

```csharp
public class PatchOperationException : Exception
{
    public string Operation { get; }
    public string Path { get; }
    public string ErrorType { get; }

    public PatchOperationException(string operation, string path, string errorType, string message)
        : base(message)
    {
        Operation = operation;
        Path = path;
        ErrorType = errorType;
    }
}
```

### 4. Version-Specific Patch DTOs

Create version-specific DTOs for different API versions:

```csharp
// v1.0 PATCH DTO
public record PatchUserProfileRequestV1
{
    public string? DisplayName { get; init; }
    public string? Bio { get; init; }
}

// v2.0 PATCH DTO (with additional fields)
public record PatchUserProfileRequestV2 : PatchUserProfileRequestV1
{
    public UserPreferencesDto? Preferences { get; init; }
    public List<string>? Tags { get; init; }
    public ContactInfoDto? ContactInfo { get; init; }
}
```

### 5. Logging and Monitoring

Log patch operations for auditing:

```csharp
public async Task<UserResponse> PatchUserProfileAsync(Guid userId, 
    JsonPatchDocument<PatchUserProfileRequest> patchDocument)
{
    _logger.LogInformation("Applying {OperationCount} patch operations to user {UserId}: {Operations}",
        patchDocument.Operations.Count,
        userId,
        string.Join(", ", patchDocument.Operations.Select(op => $"{op.op}:{op.path}")));

    // Apply operations...

    _logger.LogInformation("Successfully applied patch operations to user {UserId}", userId);
    return result;
}
```

## Client Integration

### JavaScript/TypeScript Example

```typescript
class JsonPatchClient {
  async patchResource<T>(url: string, operations: PatchOperation[], etag?: string): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json-patch+json',
      'Authorization': `Bearer ${this.getToken()}`
    };
    
    if (etag) {
      headers['If-Match'] = etag;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(operations)
    });

    if (response.status === 412) {
      throw new PreconditionFailedError('Resource was modified by another user');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new PatchError(error.detail, error.errors);
    }

    return response.json();
  }
}

interface PatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: any;
  from?: string;
}

// Usage
const client = new JsonPatchClient();

try {
  const updatedUser = await client.patchResource<UserDto>('/api/v1/users/me', [
    { op: 'replace', path: '/displayName', value: 'New Name' },
    { op: 'add', path: '/tags/-', value: 'developer' }
  ], etag);
} catch (error) {
  if (error instanceof PreconditionFailedError) {
    // Refresh and retry
    console.log('Resource was modified, refreshing...');
  }
}
```

### .NET Client Example

```csharp
public class JsonPatchClient
{
    private readonly HttpClient _httpClient;

    public JsonPatchClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<T> PatchAsync<T>(string url, JsonPatchDocument patchDocument, 
        string? etag = null) where T : class
    {
        var request = new HttpRequestMessage(HttpMethod.Patch, url);
        request.Content = new StringContent(
            JsonConvert.SerializeObject(patchDocument),
            Encoding.UTF8,
            "application/json-patch+json");

        if (!string.IsNullOrEmpty(etag))
        {
            request.Headers.IfMatch.Add(new EntityTagHeaderValue(etag));
        }

        var response = await _httpClient.SendAsync(request);

        if (response.StatusCode == HttpStatusCode.PreconditionFailed)
        {
            throw new PreconditionFailedException(
                "Resource was modified. Please refresh and try again.");
        }

        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject<T>(content)!;
    }
}

// Usage
var patchDoc = new JsonPatchDocument();
patchDoc.Replace(x => x.DisplayName, "New Name");
patchDoc.Add(x => x.Tags, "developer");

try
{
    var updatedUser = await client.PatchAsync<UserDto>("/api/v1/users/me", patchDoc, etag);
}
catch (PreconditionFailedException)
{
    // Handle conflict
    Console.WriteLine("Resource was modified, please refresh and retry");
}
```

### cURL Examples

```bash
# Simple field update
curl -X PATCH "http://localhost:5000/api/v1/users/me" \
  -H "Content-Type: application/json-patch+json" \
  -H "If-Match: W/\"123e4567-1672574200\"" \
  -H "Authorization: Bearer $TOKEN" \
  -d '[
    {
      "op": "replace",
      "path": "/displayName",
      "value": "John Smith"
    }
  ]'

# Multiple operations
curl -X PATCH "http://localhost:5000/api/v1/users/me" \
  -H "Content-Type: application/json-patch+json" \
  -H "If-Match: W/\"123e4567-1672574200\"" \
  -H "Authorization: Bearer $TOKEN" \
  -d '[
    {
      "op": "replace", 
      "path": "/displayName",
      "value": "John Smith"
    },
    {
      "op": "add",
      "path": "/bio",
      "value": "Senior Software Developer"
    },
    {
      "op": "replace",
      "path": "/preferences/theme", 
      "value": "dark"
    }
  ]'
```

---

## Summary

ModernAPI's JSON Patch implementation provides:

1. **RFC 6902 Compliance**: Standard-compliant partial updates
2. **Bandwidth Efficiency**: Send only changed data
3. **Atomic Operations**: All changes succeed or fail together
4. **Security**: Path validation and operation restrictions
5. **Concurrency Control**: ETag-based optimistic locking
6. **Comprehensive Validation**: Input validation and error handling

This implementation enables efficient, secure, and reliable partial resource updates while maintaining full compatibility with HTTP standards and REST principles.

For more implementation patterns, see the [API Development Cookbook](API_DEVELOPMENT_COOKBOOK.md).