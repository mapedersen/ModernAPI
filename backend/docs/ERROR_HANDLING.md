# Error Handling Guide

## Overview

ModernAPI implements comprehensive error handling using RFC 7807 Problem Details standard. All errors return structured JSON responses with consistent formatting and appropriate HTTP status codes.

## Error Response Format

All error responses follow the Problem Details specification:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Resource not found",
  "status": 404,
  "detail": "User with ID '123e4567-e89b-12d3-a456-426614174000' was not found",
  "instance": "/api/users/123e4567-e89b-12d3-a456-426614174000",
  "requestId": "0HMVBP9JK9J6C:00000001",
  "timestamp": "2025-08-08T01:30:00.123Z"
}
```

### Standard Fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | URI reference identifying the problem type |
| `title` | string | Short, human-readable summary of the problem |
| `status` | number | HTTP status code |
| `detail` | string | Human-readable explanation specific to this occurrence |
| `instance` | string | URI reference identifying the specific occurrence |
| `requestId` | string | Unique identifier for request tracing |
| `timestamp` | string | ISO 8601 timestamp when the error occurred |

## HTTP Status Codes & Error Types

### 400 Bad Request

#### Validation Errors
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred",
  "status": 400,
  "instance": "/api/users",
  "errors": {
    "Email": ["Email is required", "Email format is invalid"],
    "Password": ["Password must be at least 8 characters"]
  },
  "requestId": "0HMVBP9JK9J6C:00000002",
  "timestamp": "2025-08-08T01:30:00.123Z"
}
```

#### Business Rule Violations (Domain Exceptions)
```json
{
  "type": "https://modernapi.example.com/problems/domain/user_not_active",
  "title": "Business rule violation",
  "status": 400,
  "detail": "User 123e4567-e89b-12d3-a456-426614174000 is not active and cannot perform this operation",
  "instance": "/api/users/123e4567-e89b-12d3-a456-426614174000/change-email",
  "errorCode": "USER_NOT_ACTIVE",
  "requestId": "0HMVBP9JK9J6C:00000003",
  "timestamp": "2025-08-08T01:30:00.123Z"
}
```

#### Invalid Arguments
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Invalid argument",
  "status": 400,
  "detail": "User ID must be a valid GUID",
  "instance": "/api/users/invalid-id",
  "requestId": "0HMVBP9JK9J6C:00000004",
  "timestamp": "2025-08-08T01:30:00.123Z"
}
```

### 401 Unauthorized

```json
{
  "type": "https://tools.ietf.org/html/rfc7235#section-3.1",
  "title": "Unauthorized",
  "status": 401,
  "detail": "You are not authorized to access this resource",
  "instance": "/api/users",
  "requestId": "0HMVBP9JK9J6C:00000005",
  "timestamp": "2025-08-08T01:30:00.123Z"
}
```

### 404 Not Found

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Resource not found",
  "status": 404,
  "detail": "User with ID '123e4567-e89b-12d3-a456-426614174000' was not found",
  "instance": "/api/users/123e4567-e89b-12d3-a456-426614174000",
  "requestId": "0HMVBP9JK9J6C:00000006",
  "timestamp": "2025-08-08T01:30:00.123Z"
}
```

### 409 Conflict

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.8",
  "title": "Conflict",
  "status": 409,
  "detail": "A user with this email address already exists",
  "instance": "/api/users",
  "requestId": "0HMVBP9JK9J6C:00000007",
  "timestamp": "2025-08-08T01:30:00.123Z"
}
```

### 500 Internal Server Error

#### Development Environment
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.6.1",
  "title": "An error occurred while processing your request",
  "status": 500,
  "detail": "Object reference not set to an instance of an object",
  "instance": "/api/users",
  "exception": "NullReferenceException",
  "stackTrace": "at ModernAPI.API.Controllers.UsersController...",
  "requestId": "0HMVBP9JK9J6C:00000008",
  "timestamp": "2025-08-08T01:30:00.123Z"
}
```

#### Production Environment
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.6.1",
  "title": "An error occurred while processing your request",
  "status": 500,
  "detail": "An internal server error occurred. Please contact support if the problem persists.",
  "instance": "/api/users",
  "requestId": "0HMVBP9JK9J6C:00000009",
  "timestamp": "2025-08-08T01:30:00.123Z"
}
```

## Domain-Specific Error Codes

| Error Code | Description | Typical Scenario |
|------------|-------------|------------------|
| `USER_NOT_ACTIVE` | User account is not active | Attempting operations on deactivated user |
| `USER_ALREADY_ACTIVE` | User is already active | Trying to activate an already active user |
| `USER_ALREADY_DEACTIVATED` | User is already deactivated | Trying to deactivate an already deactivated user |
| `EMAIL_ALREADY_VERIFIED` | Email is already verified | Trying to verify an already verified email |

## Client-Side Error Handling

### JavaScript/TypeScript Example

```typescript
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  requestId: string;
  timestamp: string;
  errorCode?: string;
  errors?: Record<string, string[]>;
}

async function handleApiCall(apiCall: () => Promise<Response>) {
  try {
    const response = await apiCall();
    
    if (!response.ok) {
      const problemDetails: ProblemDetails = await response.json();
      
      switch (problemDetails.status) {
        case 400:
          if (problemDetails.errors) {
            // Handle validation errors
            handleValidationErrors(problemDetails.errors);
          } else if (problemDetails.errorCode) {
            // Handle business rule violations
            handleBusinessRuleViolation(problemDetails);
          } else {
            // Handle other bad requests
            showError(problemDetails.detail);
          }
          break;
          
        case 401:
          // Redirect to login
          redirectToLogin();
          break;
          
        case 404:
          showError('Resource not found');
          break;
          
        case 409:
          showError(problemDetails.detail);
          break;
          
        case 500:
          showError('Server error. Please try again later.');
          // Log the requestId for support
          console.error('Server error - Request ID:', problemDetails.requestId);
          break;
          
        default:
          showError('An unexpected error occurred');
      }
      
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Network error:', error);
    showError('Network error. Please check your connection.');
    return null;
  }
}

function handleValidationErrors(errors: Record<string, string[]>) {
  Object.entries(errors).forEach(([field, messages]) => {
    messages.forEach(message => {
      showFieldError(field, message);
    });
  });
}

function handleBusinessRuleViolation(problemDetails: ProblemDetails) {
  switch (problemDetails.errorCode) {
    case 'USER_NOT_ACTIVE':
      showError('Your account is not active. Please contact support.');
      break;
    case 'EMAIL_ALREADY_VERIFIED':
      showInfo('Your email is already verified.');
      break;
    default:
      showError(problemDetails.detail);
  }
}
```

### React Hook Example

```typescript
import { useState } from 'react';

interface ApiError {
  message: string;
  field?: string;
  requestId?: string;
}

export function useApiError() {
  const [errors, setErrors] = useState<ApiError[]>([]);
  
  const handleApiError = (problemDetails: ProblemDetails) => {
    const newErrors: ApiError[] = [];
    
    if (problemDetails.errors) {
      // Validation errors
      Object.entries(problemDetails.errors).forEach(([field, messages]) => {
        messages.forEach(message => {
          newErrors.push({ message, field, requestId: problemDetails.requestId });
        });
      });
    } else {
      // Single error
      newErrors.push({
        message: problemDetails.detail,
        requestId: problemDetails.requestId
      });
    }
    
    setErrors(newErrors);
  };
  
  const clearErrors = () => setErrors([]);
  
  return { errors, handleApiError, clearErrors };
}
```

## Logging and Debugging

### Request Correlation

Every error includes a `requestId` that can be used to correlate client errors with server logs:

1. **Client receives error** with `requestId: "0HMVBP9JK9J6C:00000001"`
2. **Server logs** contain the same request ID
3. **Search logs** using the request ID to find full context

### Log Structure

Server logs include structured information:

```
[01:30:00 ERR] Unhandled exception occurred. RequestId: 0HMVBP9JK9J6C:00000001, Path: POST /api/users, User: john.doe@example.com
System.ArgumentException: Invalid email format
   at ModernAPI.Domain.ValueObjects.Email..ctor(String value)
   ...
Context: {
  "RequestId": "0HMVBP9JK9J6C:00000001",
  "RequestPath": "/api/users",
  "RequestMethod": "POST",
  "UserAgent": "Mozilla/5.0...",
  "RemoteIpAddress": "192.168.1.100",
  "UserId": "john.doe@example.com"
}
```

### Development vs Production

- **Development**: Full exception details, stack traces, and context
- **Production**: Generic error messages, full details only in logs
- **Security**: No sensitive information exposed in production responses

## Best Practices

### For API Consumers

1. **Always handle HTTP status codes** appropriately
2. **Use requestId** for support requests and debugging
3. **Parse validation errors** to show field-specific messages
4. **Implement retry logic** for 5xx errors with exponential backoff
5. **Cache and display user-friendly messages** for common business rule violations

### For API Developers

1. **Use specific exception types** for different scenarios
2. **Provide meaningful error messages** that help users understand the problem
3. **Include relevant context** in exception messages
4. **Test error scenarios** in both development and production modes
5. **Document new error codes** and scenarios as they're added

## Support and Troubleshooting

When contacting support, always include:
- The full error response (including `requestId`)
- The timestamp of the error
- Steps to reproduce the issue
- Your user ID or email (if applicable)

The `requestId` allows support to quickly locate the exact error in server logs with full context and stack traces.