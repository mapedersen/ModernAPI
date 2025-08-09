# Developer Troubleshooting Guide

## Quick Error Debugging Checklist

### 1. **Get the Request ID**
Every error response includes a `requestId`. Use this to find the exact error in logs:

```bash
# Search logs for specific request
grep "0HMVBP9JK9J6C:00000001" logs/modernapi-*.log

# Or using structured logging tools
docker logs api-container | jq 'select(.RequestId == "0HMVBP9JK9J6C:00000001")'
```

### 2. **Identify Error Category**
| HTTP Status | Category | Action |
|-------------|----------|--------|
| 400 | Client Error | Check request format, validation |
| 401 | Authentication | Check JWT token, user permissions |
| 404 | Not Found | Verify resource exists, check IDs |
| 409 | Conflict | Check business rules, existing data |
| 500 | Server Error | Check logs, fix code issue |

### 3. **Common Error Scenarios**

#### Validation Errors (400)
```json
{
  "errors": {
    "Email": ["Email is required", "Email format is invalid"]
  }
}
```
**Solution**: Fix client request validation

#### Business Rule Violations (400)
```json
{
  "errorCode": "USER_NOT_ACTIVE",
  "detail": "User is not active"
}
```
**Solution**: Check domain business rules

#### Resource Not Found (404)
**Common Causes**:
- GUID format incorrect
- Resource deleted
- Permission issue (user can't see resource)

## Log Analysis Examples

### Finding Root Cause
```bash
# 1. Find the error log entry
grep "RequestId: ABC123" logs/*.log

# 2. Look for context around the time
grep -C 10 "01:30:00" logs/modernapi-20250808.log

# 3. Check for related database errors
grep -i "database\|sql\|entity" logs/*.log | grep "01:30"
```

### Structured Log Queries
```bash
# Filter by user
grep '"UserId": "john.doe@example.com"' logs/*.log

# Filter by endpoint
grep '"RequestPath": "/api/users"' logs/*.log

# Filter by IP address
grep '"RemoteIpAddress": "192.168.1.100"' logs/*.log
```

## Development vs Production Differences

| Aspect | Development | Production |
|--------|------------|------------|
| **Error Detail** | Full exception message | Generic message |
| **Stack Trace** | Included in response | Only in logs |
| **Inner Exceptions** | Shown in response | Only in logs |
| **Sensitive Data** | May be visible | Always hidden |

## Testing Error Scenarios

### Manual Testing
```bash
# Test validation error
curl -X POST http://localhost:5051/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "displayName": ""}'

# Test not found
curl -X GET http://localhost:5051/api/users/00000000-0000-0000-0000-000000000000

# Test unauthorized
curl -X GET http://localhost:5051/api/users \
  -H "Authorization: Bearer invalid-token"
```

### Unit Testing Errors
```csharp
[Fact]
public async Task CreateUser_WithInvalidEmail_ShouldReturnValidationError()
{
    // Arrange
    var request = new CreateUserRequest("invalid-email", "Name", "First", "Last");
    
    // Act & Assert
    var exception = await Assert.ThrowsAsync<ValidationException>(
        () => _userService.CreateUserAsync(request));
        
    exception.ValidationErrors.Should().ContainKey("Email");
}
```

## Performance Impact Monitoring

### Key Metrics
- Exception rate per minute
- Response time for error responses
- Memory usage during exception handling
- Log volume and performance

### Alerts to Set Up
```yaml
# Example alert configuration
- alert: HighExceptionRate
  expr: rate(http_requests_exceptions_total[5m]) > 0.1
  labels:
    severity: warning
  annotations:
    summary: "High exception rate detected"

- alert: CriticalError
  expr: rate(http_requests_5xx_total[1m]) > 0.01
  labels:
    severity: critical
  annotations:
    summary: "5xx errors detected"
```

## Common Development Issues

### 1. Exception Not Caught by Middleware
**Symptom**: Generic ASP.NET error page instead of JSON
**Cause**: Exception thrown before middleware executes
**Solution**: Check middleware order in Program.cs

### 2. Sensitive Data in Logs
**Symptom**: Personal data visible in production logs
**Solution**: 
- Use `[LoggerMessage]` with structured logging
- Sanitize sensitive fields before logging
- Review log retention policies

### 3. Performance Issues with Exception Handling
**Symptom**: Slow error responses
**Causes**:
- Complex exception object serialization
- Expensive logging operations
- Database queries in exception handlers

**Solutions**:
- Cache expensive operations
- Use async logging
- Minimize database calls in error paths

## Integration with External Tools

### Application Performance Monitoring (APM)
```csharp
// Add correlation IDs to APM traces
Activity.Current?.SetTag("RequestId", context.TraceIdentifier);
Activity.Current?.SetTag("ErrorCode", domainException.ErrorCode);
```

### Log Aggregation (ELK Stack, Splunk)
```json
{
  "@timestamp": "2025-08-08T01:30:00.123Z",
  "level": "ERROR",
  "message": "Unhandled exception occurred",
  "requestId": "0HMVBP9JK9J6C:00000001",
  "userId": "john.doe@example.com",
  "endpoint": "/api/users",
  "exception": {
    "type": "ValidationException",
    "message": "Email is required",
    "stackTrace": "..."
  }
}
```

### Error Tracking (Sentry, Bugsnag)
```csharp
// Capture structured error context
SentrySdk.ConfigureScope(scope =>
{
    scope.SetTag("RequestId", context.TraceIdentifier);
    scope.SetContext("Request", new
    {
        Path = context.Request.Path,
        Method = context.Request.Method,
        UserId = context.User?.Identity?.Name
    });
});
```

## Debugging Checklist

- [ ] Check the `requestId` in logs
- [ ] Verify request format and content type
- [ ] Check authentication/authorization
- [ ] Validate business rules and domain constraints
- [ ] Review recent code changes
- [ ] Check database connectivity and constraints
- [ ] Verify environment configuration
- [ ] Test in development environment
- [ ] Check for rate limiting or throttling
- [ ] Review middleware execution order