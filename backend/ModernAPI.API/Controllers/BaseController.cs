using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Asp.Versioning;
using ModernAPI.Application.Services;
using ModernAPI.Application.DTOs;
using ModernAPI.API.Services;

namespace ModernAPI.API.Controllers;

/// <summary>
/// Base controller providing common functionality for all API controllers.
/// Includes helper methods for consistent response handling and user context.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public abstract class BaseController : ControllerBase
{
    /// <summary>
    /// Gets the current user's ID from JWT claims.
    /// </summary>
    /// <returns>The user ID</returns>
    /// <exception cref="UnauthorizedAccessException">Thrown when user ID is not found in claims</exception>
    protected string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User ID not found in token claims");
    }

    /// <summary>
    /// Gets the current user's email from JWT claims.
    /// </summary>
    /// <returns>The user email</returns>
    /// <exception cref="UnauthorizedAccessException">Thrown when email is not found in claims</exception>
    protected string GetUserEmail()
    {
        return User.FindFirstValue(ClaimTypes.Email)
            ?? throw new UnauthorizedAccessException("User email not found in token claims");
    }

    /// <summary>
    /// Gets the current user's roles from JWT claims.
    /// </summary>
    /// <returns>Collection of user roles</returns>
    protected IEnumerable<string> GetUserRoles()
    {
        return User.FindAll(ClaimTypes.Role).Select(c => c.Value);
    }

    /// <summary>
    /// Checks if the current user has a specific role.
    /// </summary>
    /// <param name="role">The role to check</param>
    /// <returns>True if user has the role, false otherwise</returns>
    protected bool HasRole(string role)
    {
        return User.IsInRole(role);
    }

    /// <summary>
    /// Checks if the current user has any of the specified roles.
    /// </summary>
    /// <param name="roles">The roles to check</param>
    /// <returns>True if user has any of the roles, false otherwise</returns>
    protected bool HasAnyRole(params string[] roles)
    {
        return roles.Any(role => User.IsInRole(role));
    }

    /// <summary>
    /// Creates a consistent Created response with location header.
    /// </summary>
    /// <typeparam name="T">The response data type</typeparam>
    /// <param name="actionName">The action name for the location header</param>
    /// <param name="routeValues">Route values for the location header</param>
    /// <param name="value">The response data</param>
    /// <returns>Created action result with location header</returns>
    protected CreatedAtActionResult CreatedAtActionResult<T>(string actionName, object? routeValues, T value)
    {
        return CreatedAtAction(actionName, routeValues, value);
    }

    /// <summary>
    /// Creates a consistent NoContent response for successful operations without return data.
    /// </summary>
    /// <returns>NoContent action result</returns>
    protected NoContentResult NoContentResult()
    {
        return NoContent();
    }

    /// <summary>
    /// Creates a consistent NotFound response with Problem Details format.
    /// </summary>
    /// <param name="message">Optional custom message</param>
    /// <returns>NotFound action result with Problem Details</returns>
    protected NotFoundObjectResult NotFoundResult(string? message = null)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
            Title = "Not Found",
            Status = StatusCodes.Status404NotFound,
            Detail = message ?? "The requested resource was not found",
            Instance = HttpContext.Request.Path
        };
        
        return NotFound(problemDetails);
    }

    /// <summary>
    /// Creates a consistent BadRequest response with Problem Details format.
    /// </summary>
    /// <param name="message">Error message</param>
    /// <returns>BadRequest action result with Problem Details</returns>
    protected BadRequestObjectResult BadRequestResult(string message)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "Bad Request",
            Status = StatusCodes.Status400BadRequest,
            Detail = message,
            Instance = HttpContext.Request.Path
        };
        
        return BadRequest(problemDetails);
    }

    /// <summary>
    /// Creates a consistent validation error response with ValidationProblemDetails format (422 Unprocessable Entity).
    /// </summary>
    /// <param name="errors">Validation errors</param>
    /// <returns>UnprocessableEntity action result with validation errors</returns>
    protected ObjectResult ValidationErrorResult(IDictionary<string, string[]> errors)
    {
        var validationProblemDetails = new ValidationProblemDetails(errors)
        {
            Type = "https://tools.ietf.org/html/rfc4918#section-11.2",
            Title = "One or more validation errors occurred",
            Status = StatusCodes.Status422UnprocessableEntity,
            Instance = HttpContext.Request.Path
        };
        
        return StatusCode(StatusCodes.Status422UnprocessableEntity, validationProblemDetails);
    }

    /// <summary>
    /// Creates a consistent validation error response for a single field (422 Unprocessable Entity).
    /// </summary>
    /// <param name="field">Field name that failed validation</param>
    /// <param name="error">Error message</param>
    /// <returns>UnprocessableEntity action result with validation error</returns>
    protected ObjectResult ValidationErrorResult(string field, string error)
    {
        var errors = new Dictionary<string, string[]>
        {
            [field] = [error]
        };
        
        return ValidationErrorResult(errors);
    }

    /// <summary>
    /// Creates a consistent Conflict response with Problem Details format.
    /// </summary>
    /// <param name="message">Conflict message</param>
    /// <returns>Conflict action result with Problem Details</returns>
    protected ConflictObjectResult ConflictResult(string message)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.8",
            Title = "Conflict",
            Status = StatusCodes.Status409Conflict,
            Detail = message,
            Instance = HttpContext.Request.Path
        };
        
        return Conflict(problemDetails);
    }

    /// <summary>
    /// Creates a consistent Unauthorized response with Problem Details format.
    /// </summary>
    /// <param name="message">Optional custom message</param>
    /// <returns>Unauthorized action result with Problem Details</returns>
    protected UnauthorizedObjectResult UnauthorizedResult(string? message = null)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7235#section-3.1",
            Title = "Unauthorized",
            Status = StatusCodes.Status401Unauthorized,
            Detail = message ?? "Authentication is required to access this resource",
            Instance = HttpContext.Request.Path
        };
        
        return Unauthorized(problemDetails);
    }

    /// <summary>
    /// Creates a consistent Forbidden response with custom message.
    /// </summary>
    /// <param name="message">Optional custom message</param>
    /// <returns>ObjectResult with 403 status</returns>
    protected ObjectResult ForbiddenResult(string? message = null)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.3",
            Title = "Forbidden",
            Status = StatusCodes.Status403Forbidden,
            Detail = message ?? "You do not have permission to access this resource",
            Instance = HttpContext.Request.Path
        };
        
        return StatusCode(StatusCodes.Status403Forbidden, problemDetails);
    }

    /// <summary>
    /// Validates that the current user can access resources belonging to the specified user ID.
    /// Allows access if the current user is the owner or has admin role.
    /// </summary>
    /// <param name="resourceUserId">The user ID that owns the resource</param>
    /// <param name="adminRole">The admin role name (default: "Administrator")</param>
    /// <returns>True if access is allowed, false otherwise</returns>
    protected bool CanAccessUserResource(string resourceUserId, string adminRole = "Administrator")
    {
        var currentUserId = GetUserId();
        return currentUserId == resourceUserId || HasRole(adminRole);
    }

    /// <summary>
    /// Ensures the current user can access resources belonging to the specified user ID.
    /// Throws UnauthorizedAccessException if access is denied.
    /// </summary>
    /// <param name="resourceUserId">The user ID that owns the resource</param>
    /// <param name="adminRole">The admin role name (default: "Administrator")</param>
    /// <exception cref="UnauthorizedAccessException">Thrown when access is denied</exception>
    protected void EnsureUserResourceAccess(string resourceUserId, string adminRole = "Administrator")
    {
        if (!CanAccessUserResource(resourceUserId, adminRole))
        {
            throw new UnauthorizedAccessException("You can only access your own resources or you need administrator privileges");
        }
    }

    /// <summary>
    /// Gets pagination parameters from query string with validation and defaults.
    /// </summary>
    /// <param name="page">Page number (1-based)</param>
    /// <param name="pageSize">Number of items per page</param>
    /// <param name="maxPageSize">Maximum allowed page size (default: 100)</param>
    /// <returns>Validated pagination parameters</returns>
    protected (int page, int pageSize) GetPaginationParameters(int page = 1, int pageSize = 20, int maxPageSize = 100)
    {
        // Ensure minimum values
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;

        // Enforce maximum page size
        if (pageSize > maxPageSize) pageSize = maxPageSize;

        return (page, pageSize);
    }

    #region HTTP Caching Helper Methods

    /// <summary>
    /// Handles conditional GET requests using ETags and Last-Modified headers.
    /// Returns 304 Not Modified if the resource hasn't changed.
    /// </summary>
    /// <param name="cachingService">The HTTP caching service</param>
    /// <param name="etagService">The ETag service</param>
    /// <param name="entity">The entity to check (must have Id and UpdatedAt)</param>
    /// <returns>ActionResult with 304 if not modified, null if should proceed normally</returns>
    protected ActionResult? HandleConditionalGet<T>(IHttpCachingService cachingService, IETagService etagService, T entity) 
        where T : class
    {
        if (entity == null)
            return null;

        // Use reflection to get Id and UpdatedAt - in a real implementation, you might use interfaces
        var idProperty = typeof(T).GetProperty("Id");
        var updatedAtProperty = typeof(T).GetProperty("UpdatedAt");

        if (idProperty?.GetValue(entity) is Guid id && updatedAtProperty?.GetValue(entity) is DateTime updatedAt)
        {
            var etag = etagService.GenerateETag(id, updatedAt);
            return Request.HandleConditionalGet(Response, cachingService, etag, updatedAt);
        }

        return null;
    }

    /// <summary>
    /// Handles conditional GET requests for UserDto specifically.
    /// </summary>
    /// <param name="cachingService">The HTTP caching service</param>
    /// <param name="etagService">The ETag service</param>
    /// <param name="user">The user DTO</param>
    /// <returns>ActionResult with 304 if not modified, null if should proceed normally</returns>
    protected ActionResult? HandleConditionalGet(IHttpCachingService cachingService, IETagService etagService, UserDto user)
    {
        if (user == null)
            return null;

        var etag = etagService.GenerateETag(user);
        return Request.HandleConditionalGet(Response, cachingService, etag, user.UpdatedAt);
    }

    /// <summary>
    /// Handles conditional GET requests for user collections.
    /// </summary>
    /// <param name="cachingService">The HTTP caching service</param>
    /// <param name="etagService">The ETag service</param>
    /// <param name="users">Collection of users</param>
    /// <returns>ActionResult with 304 if not modified, null if should proceed normally</returns>
    protected ActionResult? HandleConditionalGet(IHttpCachingService cachingService, IETagService etagService, IEnumerable<UserDto> users)
    {
        var userList = users?.ToList() ?? new List<UserDto>();
        var etag = etagService.GenerateCollectionETag(userList);
        
        // For collections, use the latest UpdatedAt as Last-Modified
        var lastModified = userList.Any() ? userList.Max(u => u.UpdatedAt) : (DateTime?)null;
        
        return Request.HandleConditionalGet(Response, cachingService, etag, lastModified);
    }

    /// <summary>
    /// Validates conditional update requests (PUT/PATCH) using If-Match headers.
    /// Returns 412 Precondition Failed if validation fails.
    /// </summary>
    /// <param name="cachingService">The HTTP caching service</param>
    /// <param name="etagService">The ETag service</param>
    /// <param name="entity">The current entity state</param>
    /// <returns>ActionResult with 412 if validation fails, null if should proceed</returns>
    protected ActionResult? ValidateConditionalUpdate<T>(IHttpCachingService cachingService, IETagService etagService, T entity) 
        where T : class
    {
        if (entity == null)
            return null;

        // Use reflection to get Id and UpdatedAt
        var idProperty = typeof(T).GetProperty("Id");
        var updatedAtProperty = typeof(T).GetProperty("UpdatedAt");

        if (idProperty?.GetValue(entity) is Guid id && updatedAtProperty?.GetValue(entity) is DateTime updatedAt)
        {
            var etag = etagService.GenerateETag(id, updatedAt);
            return Request.ValidateConditionalUpdate(cachingService, etag);
        }

        return null;
    }

    /// <summary>
    /// Validates conditional update requests for UserDto specifically.
    /// </summary>
    /// <param name="cachingService">The HTTP caching service</param>
    /// <param name="etagService">The ETag service</param>
    /// <param name="user">The current user DTO</param>
    /// <returns>ActionResult with 412 if validation fails, null if should proceed</returns>
    protected ActionResult? ValidateConditionalUpdate(IHttpCachingService cachingService, IETagService etagService, UserDto user)
    {
        if (user == null)
            return null;

        var etag = etagService.GenerateETag(user);
        return Request.ValidateConditionalUpdate(cachingService, etag);
    }

    /// <summary>
    /// Sets appropriate cache headers for user resources.
    /// </summary>
    /// <param name="cachingService">The HTTP caching service</param>
    /// <param name="resourceUserId">The ID of the user who owns the resource</param>
    /// <param name="maxAgeSeconds">Optional override for max-age</param>
    protected void SetUserResourceCacheHeaders(IHttpCachingService cachingService, string resourceUserId, int? maxAgeSeconds = null)
    {
        try
        {
            var currentUserId = GetUserId();
            var isCurrentUser = currentUserId == resourceUserId;
            Response.SetUserResourceCache(cachingService, isCurrentUser, maxAgeSeconds);
        }
        catch
        {
            // If we can't determine the current user (e.g., in tests), set conservative caching
            Response.SetUserResourceCache(cachingService, false, maxAgeSeconds);
        }
    }

    /// <summary>
    /// Sets appropriate cache headers for user collections.
    /// </summary>
    /// <param name="cachingService">The HTTP caching service</param>
    /// <param name="maxAgeSeconds">Optional override for max-age</param>
    protected void SetUserCollectionCacheHeaders(IHttpCachingService cachingService, int? maxAgeSeconds = null)
    {
        Response.SetCollectionCache(cachingService, maxAgeSeconds);
    }

    /// <summary>
    /// Sets appropriate cache headers for search results.
    /// </summary>
    /// <param name="cachingService">The HTTP caching service</param>
    /// <param name="maxAgeSeconds">Optional override for max-age</param>
    protected void SetSearchResultsCacheHeaders(IHttpCachingService cachingService, int? maxAgeSeconds = null)
    {
        Response.SetSearchResultsCache(cachingService, maxAgeSeconds);
    }

    /// <summary>
    /// Sets appropriate cache headers for admin resources.
    /// </summary>
    /// <param name="cachingService">The HTTP caching service</param>
    /// <param name="maxAgeSeconds">Optional override for max-age</param>
    protected void SetAdminResourceCacheHeaders(IHttpCachingService cachingService, int? maxAgeSeconds = null)
    {
        Response.SetAdminResourceCache(cachingService, maxAgeSeconds);
    }

    /// <summary>
    /// Sets ETag and Last-Modified headers for a resource.
    /// </summary>
    /// <param name="cachingService">The HTTP caching service</param>
    /// <param name="etagService">The ETag service</param>
    /// <param name="entity">The entity to create headers for</param>
    protected void SetEntityHeaders<T>(IHttpCachingService cachingService, IETagService etagService, T entity) 
        where T : class
    {
        if (entity == null)
            return;

        var idProperty = typeof(T).GetProperty("Id");
        var updatedAtProperty = typeof(T).GetProperty("UpdatedAt");

        if (idProperty?.GetValue(entity) is Guid id && updatedAtProperty?.GetValue(entity) is DateTime updatedAt)
        {
            var etag = etagService.GenerateETag(id, updatedAt);
            Response.SetEntityHeaders(cachingService, etag, updatedAt);
        }
    }

    /// <summary>
    /// Sets ETag and Last-Modified headers for a UserDto.
    /// </summary>
    /// <param name="cachingService">The HTTP caching service</param>
    /// <param name="etagService">The ETag service</param>
    /// <param name="user">The user DTO</param>
    protected void SetEntityHeaders(IHttpCachingService cachingService, IETagService etagService, UserDto user)
    {
        if (user == null)
            return;

        var etag = etagService.GenerateETag(user);
        Response.SetEntityHeaders(cachingService, etag, user.UpdatedAt);
    }

    /// <summary>
    /// Sets ETag and Last-Modified headers for a user collection.
    /// </summary>
    /// <param name="cachingService">The HTTP caching service</param>
    /// <param name="etagService">The ETag service</param>
    /// <param name="users">Collection of users</param>
    protected void SetCollectionHeaders(IHttpCachingService cachingService, IETagService etagService, IEnumerable<UserDto> users)
    {
        var userList = users?.ToList() ?? new List<UserDto>();
        if (!userList.Any())
            return;

        var etag = etagService.GenerateCollectionETag(userList);
        var lastModified = userList.Max(u => u.UpdatedAt);
        
        Response.SetEntityHeaders(cachingService, etag, lastModified);
    }

    #endregion

    #region Additional HTTP Status Code Helper Methods

    /// <summary>
    /// Creates a consistent Precondition Failed response (412) for failed conditional requests.
    /// </summary>
    /// <param name="message">Optional custom message</param>
    /// <returns>ObjectResult with 412 status and Problem Details</returns>
    protected ObjectResult PreconditionFailedResult(string? message = null)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.10",
            Title = "Precondition Failed",
            Status = StatusCodes.Status412PreconditionFailed,
            Detail = message ?? "The resource has been modified since it was last retrieved",
            Instance = HttpContext.Request.Path
        };
        
        return StatusCode(StatusCodes.Status412PreconditionFailed, problemDetails);
    }

    /// <summary>
    /// Creates a consistent Internal Server Error response (500) with Problem Details format.
    /// </summary>
    /// <param name="message">Optional custom message</param>
    /// <returns>ObjectResult with 500 status and Problem Details</returns>
    protected ObjectResult InternalServerErrorResult(string? message = null)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
            Title = "Internal Server Error",
            Status = StatusCodes.Status500InternalServerError,
            Detail = message ?? "An internal server error occurred",
            Instance = HttpContext.Request.Path
        };
        
        return StatusCode(StatusCodes.Status500InternalServerError, problemDetails);
    }

    /// <summary>
    /// Creates a consistent Created response (201) with location header and Problem Details compliance.
    /// </summary>
    /// <typeparam name="T">The response data type</typeparam>
    /// <param name="actionName">The action name for the location header</param>
    /// <param name="routeValues">Route values for the location header</param>
    /// <param name="value">The response data</param>
    /// <returns>Created action result with location header</returns>
    protected CreatedAtActionResult CreatedAtAction<T>(string actionName, object? routeValues, T value)
    {
        // Override to ensure consistent Created responses
        return base.CreatedAtAction(actionName, routeValues, value);
    }

    /// <summary>
    /// Creates a consistent Not Modified response (304) for conditional GET requests.
    /// </summary>
    /// <returns>StatusCodeResult with 304 status</returns>
    protected StatusCodeResult NotModifiedResult()
    {
        return StatusCode(StatusCodes.Status304NotModified);
    }

    /// <summary>
    /// Adds standard Problem Details extensions (requestId, timestamp) to any Problem Details object.
    /// </summary>
    /// <param name="problemDetails">The Problem Details object to enhance</param>
    /// <returns>Enhanced Problem Details object</returns>
    protected ProblemDetails EnhanceProblemDetails(ProblemDetails problemDetails)
    {
        problemDetails.Extensions["requestId"] = HttpContext.TraceIdentifier;
        problemDetails.Extensions["timestamp"] = DateTimeOffset.UtcNow;
        return problemDetails;
    }

    /// <summary>
    /// Adds standard Problem Details extensions (requestId, timestamp) to any ValidationProblemDetails object.
    /// </summary>
    /// <param name="validationProblemDetails">The Validation Problem Details object to enhance</param>
    /// <returns>Enhanced Validation Problem Details object</returns>
    protected ValidationProblemDetails EnhanceValidationProblemDetails(ValidationProblemDetails validationProblemDetails)
    {
        validationProblemDetails.Extensions["requestId"] = HttpContext.TraceIdentifier;
        validationProblemDetails.Extensions["timestamp"] = DateTimeOffset.UtcNow;
        return validationProblemDetails;
    }

    #endregion
}