using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ModernAPI.Application.DTOs;
using ModernAPI.Application.Interfaces;

namespace ModernAPI.API.Controllers;

/// <summary>
/// Controller for managing user accounts and profiles.
/// Provides RESTful endpoints for user operations including registration, profile management, and user queries.
/// </summary>
[Route("api/[controller]")]
[ApiController]
[Produces("application/json")]
public class UsersController : BaseController
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    /// <summary>
    /// Initializes a new instance of the UsersController.
    /// </summary>
    /// <param name="userService">Service for user operations</param>
    /// <param name="logger">Logger for controller operations</param>
    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Retrieves a paginated list of users.
    /// </summary>
    /// <param name="page">Page number (1-based, default: 1)</param>
    /// <param name="pageSize">Number of users per page (default: 20, max: 100)</param>
    /// <param name="includeInactive">Whether to include inactive users (default: false)</param>
    /// <returns>A paginated list of users</returns>
    /// <response code="200">Users retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="401">Authentication required</response>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(UserListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserListDto>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool includeInactive = false)
    {
        _logger.LogInformation("Getting users - Page: {Page}, PageSize: {PageSize}, IncludeInactive: {IncludeInactive}",
            page, pageSize, includeInactive);

        var (validatedPage, validatedPageSize) = GetPaginationParameters(page, pageSize);

        var request = new GetUsersRequest(validatedPage, validatedPageSize, includeInactive);
        var result = await _userService.GetUsersAsync(request);

        return Ok(result);
    }

    /// <summary>
    /// Retrieves a specific user by their unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the user</param>
    /// <returns>The user information</returns>
    /// <response code="200">User found and returned</response>
    /// <response code="404">User not found</response>
    /// <response code="401">Authentication required</response>
    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserDto>> GetUser(Guid id)
    {
        _logger.LogInformation("Getting user by ID: {UserId}", id);

        var user = await _userService.GetUserByIdAsync(id);
        return Ok(user);
    }

    /// <summary>
    /// Retrieves the current user's profile information.
    /// </summary>
    /// <returns>The current user's profile</returns>
    /// <response code="200">Profile retrieved successfully</response>
    /// <response code="401">Authentication required</response>
    /// <response code="404">User not found</response>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = GetUserId();
        _logger.LogInformation("Getting current user profile: {UserId}", userId);

        var user = await _userService.GetUserByIdAsync(Guid.Parse(userId));
        return Ok(user);
    }

    /// <summary>
    /// Searches for users by display name.
    /// </summary>
    /// <param name="searchTerm">The search term to look for in display names</param>
    /// <param name="page">Page number (1-based, default: 1)</param>
    /// <param name="pageSize">Number of users per page (default: 20, max: 100)</param>
    /// <param name="includeInactive">Whether to include inactive users (default: false)</param>
    /// <returns>A list of users matching the search criteria</returns>
    /// <response code="200">Search completed successfully</response>
    /// <response code="400">Invalid search parameters</response>
    /// <response code="401">Authentication required</response>
    [HttpGet("search")]
    [Authorize]
    [ProducesResponseType(typeof(UserListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserListDto>> SearchUsers(
        [FromQuery] string searchTerm,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool includeInactive = false)
    {
        _logger.LogInformation("Searching users with term: {SearchTerm}", searchTerm);

        var (validatedPage, validatedPageSize) = GetPaginationParameters(page, pageSize);

        var request = new SearchUsersRequest(searchTerm, validatedPage, validatedPageSize, includeInactive);
        var result = await _userService.SearchUsersAsync(request);

        return Ok(result);
    }

    /// <summary>
    /// Creates a new user account.
    /// </summary>
    /// <param name="request">The user creation details</param>
    /// <returns>The created user information</returns>
    /// <response code="201">User created successfully</response>
    /// <response code="400">Invalid request data or validation errors</response>
    /// <response code="409">User with email already exists</response>
    [HttpPost]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UserResponse>> CreateUser(CreateUserRequest request)
    {
        _logger.LogInformation("Creating new user with email: {Email}", request.Email);

        var result = await _userService.CreateUserAsync(request);

        return CreatedAtAction(
            nameof(GetUser),
            new { id = result.User.Id },
            result);
    }

    /// <summary>
    /// Updates a user's profile information.
    /// </summary>
    /// <param name="id">The unique identifier of the user to update</param>
    /// <param name="request">The updated profile information</param>
    /// <returns>The updated user information</returns>
    /// <response code="200">User updated successfully</response>
    /// <response code="400">Invalid request data or validation errors</response>
    /// <response code="401">Authentication required</response>
    /// <response code="403">Access denied - can only update own profile or need admin privileges</response>
    /// <response code="404">User not found</response>
    [HttpPut("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponse>> UpdateUser(Guid id, UpdateUserProfileRequest request)
    {
        _logger.LogInformation("Updating user profile: {UserId}", id);

        // Ensure user can only update their own profile or has admin privileges
        EnsureUserResourceAccess(id.ToString());

        var result = await _userService.UpdateUserProfileAsync(id, request);

        return Ok(result);
    }

    /// <summary>
    /// Updates the current user's profile information.
    /// </summary>
    /// <param name="request">The updated profile information</param>
    /// <returns>The updated user information</returns>
    /// <response code="200">Profile updated successfully</response>
    /// <response code="400">Invalid request data or validation errors</response>
    /// <response code="401">Authentication required</response>
    /// <response code="404">User not found</response>
    [HttpPut("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponse>> UpdateCurrentUser(UpdateUserProfileRequest request)
    {
        var userId = GetUserId();
        _logger.LogInformation("Updating current user profile: {UserId}", userId);

        var result = await _userService.UpdateUserProfileAsync(Guid.Parse(userId), request);

        return Ok(result);
    }

    /// <summary>
    /// Changes a user's email address.
    /// </summary>
    /// <param name="id">The unique identifier of the user</param>
    /// <param name="request">The new email address</param>
    /// <returns>The updated user information</returns>
    /// <response code="200">Email changed successfully</response>
    /// <response code="400">Invalid email address</response>
    /// <response code="401">Authentication required</response>
    /// <response code="403">Access denied - can only change own email or need admin privileges</response>
    /// <response code="404">User not found</response>
    /// <response code="409">Email address already in use</response>
    [HttpPut("{id:guid}/email")]
    [Authorize]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UserResponse>> ChangeEmail(Guid id, ChangeUserEmailRequest request)
    {
        _logger.LogInformation("Changing email for user: {UserId} to {NewEmail}", id, request.NewEmail);

        // Ensure user can only change their own email or has admin privileges
        EnsureUserResourceAccess(id.ToString());

        var result = await _userService.ChangeUserEmailAsync(id, request);

        return Ok(result);
    }

    /// <summary>
    /// Verifies a user's email address.
    /// </summary>
    /// <param name="id">The unique identifier of the user</param>
    /// <returns>Operation result</returns>
    /// <response code="200">Email verified successfully</response>
    /// <response code="401">Authentication required</response>
    /// <response code="403">Access denied - can only verify own email or need admin privileges</response>
    /// <response code="404">User not found</response>
    /// <response code="400">Email already verified</response>
    [HttpPost("{id:guid}/verify-email")]
    [Authorize]
    [ProducesResponseType(typeof(OperationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OperationResult>> VerifyEmail(Guid id)
    {
        _logger.LogInformation("Verifying email for user: {UserId}", id);

        // Ensure user can only verify their own email or has admin privileges
        EnsureUserResourceAccess(id.ToString());

        var result = await _userService.VerifyUserEmailAsync(id);

        return Ok(result);
    }

    /// <summary>
    /// Deactivates a user account.
    /// </summary>
    /// <param name="id">The unique identifier of the user to deactivate</param>
    /// <returns>Operation result</returns>
    /// <response code="200">User deactivated successfully</response>
    /// <response code="401">Authentication required</response>
    /// <response code="403">Access denied - admin privileges required</response>
    /// <response code="404">User not found</response>
    /// <response code="400">User already deactivated</response>
    [HttpPost("{id:guid}/deactivate")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(typeof(OperationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OperationResult>> DeactivateUser(Guid id)
    {
        _logger.LogInformation("Deactivating user: {UserId} by admin: {AdminUserId}", id, GetUserId());

        var result = await _userService.DeactivateUserAsync(id);

        return Ok(result);
    }

    /// <summary>
    /// Reactivates a user account.
    /// </summary>
    /// <param name="id">The unique identifier of the user to reactivate</param>
    /// <returns>Operation result</returns>
    /// <response code="200">User reactivated successfully</response>
    /// <response code="401">Authentication required</response>
    /// <response code="403">Access denied - admin privileges required</response>
    /// <response code="404">User not found</response>
    /// <response code="400">User already active</response>
    [HttpPost("{id:guid}/reactivate")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(typeof(OperationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OperationResult>> ReactivateUser(Guid id)
    {
        _logger.LogInformation("Reactivating user: {UserId} by admin: {AdminUserId}", id, GetUserId());

        var result = await _userService.ReactivateUserAsync(id);

        return Ok(result);
    }

    /// <summary>
    /// Permanently deletes a user account.
    /// This is a destructive operation and should be used with caution.
    /// </summary>
    /// <param name="id">The unique identifier of the user to delete</param>
    /// <returns>No content on successful deletion</returns>
    /// <response code="204">User deleted successfully</response>
    /// <response code="401">Authentication required</response>
    /// <response code="403">Access denied - admin privileges required</response>
    /// <response code="404">User not found</response>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        _logger.LogWarning("Permanently deleting user: {UserId} by admin: {AdminUserId}", id, GetUserId());

        // First deactivate the user (business logic)
        await _userService.DeactivateUserAsync(id);

        // Note: Implement actual deletion logic based on your requirements
        // Consider if you really need hard deletion or if deactivation is sufficient

        return NoContent();
    }

    /// <summary>
    /// Gets statistics about users in the system.
    /// </summary>
    /// <returns>User statistics</returns>
    /// <response code="200">Statistics retrieved successfully</response>
    /// <response code="401">Authentication required</response>
    /// <response code="403">Access denied - admin privileges required</response>
    [HttpGet("statistics")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> GetUserStatistics()
    {
        _logger.LogInformation("Getting user statistics requested by admin: {AdminUserId}", GetUserId());

        var totalUsers = await _userService.GetUserCountAsync(includeInactive: true);
        var activeUsers = await _userService.GetUserCountAsync(includeInactive: false);
        var inactiveUsers = totalUsers - activeUsers;

        var statistics = new
        {
            totalUsers,
            activeUsers,
            inactiveUsers,
            activePercentage = totalUsers > 0 ? Math.Round((double)activeUsers / totalUsers * 100, 2) : 0,
            generatedAt = DateTimeOffset.UtcNow
        };

        return Ok(statistics);
    }
}