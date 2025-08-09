using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ModernAPI.Application.DTOs;
using ModernAPI.Application.Interfaces;
using ModernAPI.API.Monitoring;
using System.Security.Claims;
using System.Diagnostics;

namespace ModernAPI.API.Controllers;

/// <summary>
/// Controller for authentication operations including login, registration, and token management.
/// </summary>
[Produces("application/json")]
public class AuthController : BaseController
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly AuthenticationMetrics _metrics;

    public AuthController(IAuthService authService, ILogger<AuthController> logger, AuthenticationMetrics metrics)
    {
        _authService = authService ?? throw new ArgumentNullException(nameof(authService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _metrics = metrics ?? throw new ArgumentNullException(nameof(metrics));
    }

    /// <summary>
    /// Authenticates a user and returns access and refresh tokens.
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Authentication response with tokens and user information</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Login request received for email: {Email}", request.Email);
        _metrics.RecordLoginAttempt();
        
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            var result = await _authService.LoginAsync(request, cancellationToken);
            
            _metrics.RecordLoginSuccess(durationMs: stopwatch.ElapsedMilliseconds);
            _logger.LogInformation("User logged in successfully");
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            _metrics.RecordLoginFailure(reason: "invalid_credentials", durationMs: stopwatch.ElapsedMilliseconds);
            throw;
        }
        catch (Exception)
        {
            _metrics.RecordLoginFailure(reason: "error", durationMs: stopwatch.ElapsedMilliseconds);
            throw;
        }
    }

    /// <summary>
    /// Registers a new user account and returns access and refresh tokens.
    /// </summary>
    /// <param name="request">Registration information</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Authentication response with tokens and user information</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Registration request received for email: {Email}", request.Email);
        
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            var result = await _authService.RegisterAsync(request, cancellationToken);
            
            _metrics.RecordRegistration(success: true, durationMs: stopwatch.ElapsedMilliseconds);
            _logger.LogInformation("User registered successfully");
            return CreatedAtAction(nameof(GetCurrentUser), new { }, result);
        }
        catch (Exception)
        {
            _metrics.RecordRegistration(success: false, durationMs: stopwatch.ElapsedMilliseconds);
            throw;
        }
    }

    /// <summary>
    /// Refreshes an access token using a valid refresh token.
    /// </summary>
    /// <param name="request">Refresh token request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>New authentication response with fresh tokens</returns>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        _logger.LogDebug("Token refresh request received");
        
        try
        {
            var result = await _authService.RefreshTokenAsync(request, cancellationToken);
            
            _metrics.RecordTokenRefresh(success: true);
            _logger.LogDebug("Token refreshed successfully");
            return Ok(result);
        }
        catch (Exception)
        {
            _metrics.RecordTokenRefresh(success: false);
            throw;
        }
    }

    /// <summary>
    /// Logs out the current user by revoking their refresh token.
    /// </summary>
    /// <param name="request">Logout request with refresh token</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Logout confirmation</returns>
    [HttpPost("logout")]
    [ProducesResponseType(typeof(LogoutResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LogoutResponse>> Logout([FromBody] LogoutRequest request, CancellationToken cancellationToken)
    {
        _logger.LogDebug("Logout request received");

        var result = await _authService.LogoutAsync(request.RefreshToken, cancellationToken);
        
        _metrics.RecordLogout();
        _logger.LogDebug("User logged out successfully");
        return Ok(result);
    }

    /// <summary>
    /// Logs out the current user from all devices by revoking all their refresh tokens.
    /// Requires authentication.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Logout confirmation</returns>
    [HttpPost("logout-all")]
    [Authorize]
    [ProducesResponseType(typeof(LogoutResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LogoutResponse>> LogoutFromAllDevices(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        _logger.LogInformation("Logout from all devices request for user: {UserId}", userId);

        var result = await _authService.LogoutFromAllDevicesAsync(userId, cancellationToken);
        
        _logger.LogInformation("User logged out from all devices successfully");
        return Ok(result);
    }

    /// <summary>
    /// Changes the current user's password.
    /// Requires authentication.
    /// </summary>
    /// <param name="request">Password change request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Operation result</returns>
    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(typeof(OperationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OperationResult>> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        _logger.LogInformation("Password change request for user: {UserId}", userId);

        var result = await _authService.ChangePasswordAsync(userId, request, cancellationToken);
        
        _logger.LogInformation("Password changed successfully for user: {UserId}", userId);
        return Ok(result);
    }

    /// <summary>
    /// Gets the current authenticated user's information.
    /// Requires authentication.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Current user information</returns>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(AuthUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AuthUserDto>> GetCurrentUser(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        _logger.LogDebug("Get current user request for: {UserId}", userId);

        var result = await _authService.GetCurrentUserAsync(userId, cancellationToken);
        
        return Ok(result);
    }

    /// <summary>
    /// Validates a refresh token.
    /// </summary>
    /// <param name="request">Token validation request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Token validation result</returns>
    [HttpPost("validate-token")]
    [ProducesResponseType(typeof(TokenValidationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TokenValidationResponse>> ValidateRefreshToken([FromBody] TokenValidationRequest request, CancellationToken cancellationToken)
    {
        _logger.LogDebug("Token validation request received");

        var isValid = await _authService.ValidateRefreshTokenAsync(request.RefreshToken, cancellationToken);
        
        return Ok(new TokenValidationResponse(isValid));
    }

    /// <summary>
    /// Gets the current user ID from the JWT claims.
    /// </summary>
    /// <returns>Current user ID</returns>
    /// <exception cref="UnauthorizedAccessException">If user ID claim is not found</exception>
    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            _logger.LogWarning("User ID claim not found or invalid in JWT token");
            throw new UnauthorizedAccessException("User ID not found in token");
        }

        return userId;
    }
}