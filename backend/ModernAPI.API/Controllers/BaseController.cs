using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ModernAPI.API.Controllers;

/// <summary>
/// Base controller providing common functionality for all API controllers.
/// Includes helper methods for consistent response handling and user context.
/// </summary>
[ApiController]
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
    /// Creates a consistent NotFound response with optional message.
    /// </summary>
    /// <param name="message">Optional custom message</param>
    /// <returns>NotFound action result</returns>
    protected NotFoundObjectResult NotFoundResult(string? message = null)
    {
        return NotFound(new { message = message ?? "The requested resource was not found" });
    }

    /// <summary>
    /// Creates a consistent BadRequest response with validation errors.
    /// </summary>
    /// <param name="errors">Validation errors</param>
    /// <returns>BadRequest action result with validation errors</returns>
    protected BadRequestObjectResult BadRequestResult(IDictionary<string, string[]> errors)
    {
        return BadRequest(new ValidationProblemDetails(errors));
    }

    /// <summary>
    /// Creates a consistent BadRequest response with a simple message.
    /// </summary>
    /// <param name="message">Error message</param>
    /// <returns>BadRequest action result</returns>
    protected BadRequestObjectResult BadRequestResult(string message)
    {
        return BadRequest(new { message });
    }

    /// <summary>
    /// Creates a consistent Conflict response.
    /// </summary>
    /// <param name="message">Conflict message</param>
    /// <returns>Conflict action result</returns>
    protected ConflictObjectResult ConflictResult(string message)
    {
        return Conflict(new { message });
    }

    /// <summary>
    /// Creates a consistent Unauthorized response.
    /// </summary>
    /// <param name="message">Optional custom message</param>
    /// <returns>Unauthorized action result</returns>
    protected UnauthorizedObjectResult UnauthorizedResult(string? message = null)
    {
        return Unauthorized(new { message = message ?? "You are not authorized to perform this action" });
    }

    /// <summary>
    /// Creates a consistent Forbidden response.
    /// </summary>
    /// <param name="message">Optional custom message</param>
    /// <returns>Forbid action result</returns>
    protected ForbidResult ForbiddenResult(string? message = null)
    {
        // Note: ForbidResult doesn't accept a message, so we'd need to use ObjectResult for custom messages
        return Forbid();
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
}