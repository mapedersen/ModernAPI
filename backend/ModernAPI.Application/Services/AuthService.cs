using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using ModernAPI.Application.Common.Exceptions;
using ModernAPI.Application.DTOs;
using ModernAPI.Application.Interfaces;
using ModernAPI.Domain.Entities;
using ModernAPI.Domain.Interfaces;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Application.Services;

/// <summary>
/// Service for authentication operations including login, registration, and token management.
/// </summary>
public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly IPasswordService _passwordService;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<User> userManager,
        IPasswordService passwordService,
        IJwtTokenService jwtTokenService,
        IUnitOfWork unitOfWork,
        ILogger<AuthService> logger)
    {
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _passwordService = passwordService ?? throw new ArgumentNullException(nameof(passwordService));
        _jwtTokenService = jwtTokenService ?? throw new ArgumentNullException(nameof(jwtTokenService));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Login attempt for email: {Email}", request.Email);

        // Find user by email
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            _logger.LogWarning("Login failed: User not found with email {Email}", request.Email);
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Check if user is active
        if (!user.IsActive)
        {
            _logger.LogWarning("Login failed: User {UserId} is not active", user.Id);
            throw new UnauthorizedAccessException("Account is not active. Please contact support.");
        }

        // Check if account is locked
        if (await _passwordService.IsLockedOutAsync(user.Id))
        {
            _logger.LogWarning("Login failed: Account is locked out for user {UserId}", user.Id);
            throw new UnauthorizedAccessException("Account is locked out. Please try again later.");
        }

        // Verify password
        var isPasswordValid = await _passwordService.ValidatePasswordAsync(user.Id, request.Password);
        if (!isPasswordValid)
        {
            _logger.LogWarning("Login failed: Invalid password for user {UserId}", user.Id);
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Get user roles
        var roles = await _userManager.GetRolesAsync(user);

        // Generate tokens
        var (accessToken, accessTokenExpiresAt) = await _jwtTokenService.GenerateAccessTokenAsync(user, roles, request.RememberMe);
        var refreshToken = _jwtTokenService.GenerateRefreshToken(user.Id, request.RememberMe);

        // Save refresh token
        await _unitOfWork.RefreshTokens.AddAsync(refreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} logged in successfully", user.Id);

        // Map user for response
        var userDto = MapToUserDto(user, roles);

        return new AuthResponse(
            accessToken,
            refreshToken.Token,
            accessTokenExpiresAt,
            refreshToken.ExpiresAt,
            userDto
        );
    }

    /// <inheritdoc />
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Registration attempt for email: {Email}", request.Email);

        // Validate passwords match
        if (request.Password != request.ConfirmPassword)
        {
            var validationErrors = new Dictionary<string, string[]>
            {
                [nameof(request.ConfirmPassword)] = new[] { "Passwords do not match" }
            };
            throw new ModernAPI.Application.Common.Exceptions.ValidationException(validationErrors);
        }

        // Check if user already exists
        if (await _userManager.FindByEmailAsync(request.Email) != null)
        {
            throw new ConflictException("User", request.Email, "A user with this email address already exists");
        }

        // Create user entity
        var user = new User(
            new Email(request.Email),
            request.DisplayName,
            request.FirstName,
            request.LastName
        );

        // Create user with Identity
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.ToDictionary(
                e => e.Code,
                e => new[] { e.Description }
            );
            throw new ModernAPI.Application.Common.Exceptions.ValidationException(errors);
        }

        // Add default role
        await _userManager.AddToRoleAsync(user, "User");

        // Get roles for token generation
        var roles = await _userManager.GetRolesAsync(user);

        // Generate tokens
        var (accessToken, accessTokenExpiresAt) = await _jwtTokenService.GenerateAccessTokenAsync(user, roles);
        var refreshToken = _jwtTokenService.GenerateRefreshToken(user.Id);

        // Save refresh token
        await _unitOfWork.RefreshTokens.AddAsync(refreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} registered successfully with email {Email}", user.Id, request.Email);

        // Map user for response
        var userDto = MapToUserDto(user, roles);

        return new AuthResponse(
            accessToken,
            refreshToken.Token,
            accessTokenExpiresAt,
            refreshToken.ExpiresAt,
            userDto
        );
    }

    /// <inheritdoc />
    public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Refresh token attempt");

        // Find the refresh token
        var refreshToken = await _unitOfWork.RefreshTokens.GetByTokenAsync(request.RefreshToken, cancellationToken);
        if (refreshToken == null)
        {
            _logger.LogWarning("Refresh token not found: {Token}", request.RefreshToken[..10] + "...");
            throw new UnauthorizedAccessException("Invalid refresh token");
        }

        // Validate refresh token
        if (!refreshToken.IsValid())
        {
            _logger.LogWarning("Invalid refresh token for user {UserId}: Revoked={IsRevoked}, Expired={IsExpired}", 
                refreshToken.UserId, refreshToken.IsRevoked, refreshToken.IsExpired());
            throw new UnauthorizedAccessException("Refresh token is expired or revoked");
        }

        // Get user
        var user = await _userManager.FindByIdAsync(refreshToken.UserId.ToString());
        if (user == null || !user.IsActive)
        {
            _logger.LogWarning("User not found or not active for refresh token: {UserId}", refreshToken.UserId);
            throw new UnauthorizedAccessException("User not found or not active");
        }

        // Get user roles
        var roles = await _userManager.GetRolesAsync(user);

        // Generate new tokens
        var (accessToken, accessTokenExpiresAt) = await _jwtTokenService.GenerateAccessTokenAsync(user, roles);
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken(user.Id);

        // Revoke old refresh token
        refreshToken.Revoke("Token refreshed");
        await _unitOfWork.RefreshTokens.UpdateAsync(refreshToken, cancellationToken);

        // Save new refresh token
        await _unitOfWork.RefreshTokens.AddAsync(newRefreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Tokens refreshed successfully for user {UserId}", user.Id);

        // Map user for response
        var userDto = MapToUserDto(user, roles);

        return new AuthResponse(
            accessToken,
            newRefreshToken.Token,
            accessTokenExpiresAt,
            newRefreshToken.ExpiresAt,
            userDto
        );
    }

    /// <inheritdoc />
    public async Task<LogoutResponse> LogoutAsync(string refreshTokenValue, CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Logout attempt");

        var refreshToken = await _unitOfWork.RefreshTokens.GetByTokenAsync(refreshTokenValue, cancellationToken);
        if (refreshToken != null && refreshToken.IsValid())
        {
            refreshToken.Revoke("User logout");
            await _unitOfWork.RefreshTokens.UpdateAsync(refreshToken, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("User {UserId} logged out successfully", refreshToken.UserId);
        }

        return new LogoutResponse("Logged out successfully");
    }

    /// <inheritdoc />
    public async Task<LogoutResponse> LogoutFromAllDevicesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Logging out user {UserId} from all devices", userId);

        var revokedCount = await _unitOfWork.RefreshTokens.RevokeAllUserTokensAsync(userId, "Logout from all devices", cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Revoked {Count} refresh tokens for user {UserId}", revokedCount, userId);

        return new LogoutResponse($"Logged out from all devices successfully. Revoked {revokedCount} active sessions.");
    }

    /// <inheritdoc />
    public async Task<OperationResult> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Password change attempt for user {UserId}", userId);

        // Validate passwords match
        if (request.NewPassword != request.ConfirmNewPassword)
        {
            var validationErrors = new Dictionary<string, string[]>
            {
                [nameof(request.ConfirmNewPassword)] = new[] { "Passwords do not match" }
            };
            throw new ModernAPI.Application.Common.Exceptions.ValidationException(validationErrors);
        }

        // Get user
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            throw new NotFoundException("User", userId.ToString());
        }

        // Change password
        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = result.Errors.ToDictionary(
                e => e.Code,
                e => new[] { e.Description }
            );
            throw new ModernAPI.Application.Common.Exceptions.ValidationException(errors);
        }

        // Optionally revoke all refresh tokens to force re-login on all devices
        await _unitOfWork.RefreshTokens.RevokeAllUserTokensAsync(userId, "Password changed", cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Password changed successfully for user {UserId}", userId);

        return OperationResult.CreateSuccess("Password changed successfully. Please log in again on all devices.");
    }

    /// <inheritdoc />
    public async Task<AuthUserDto> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            throw new NotFoundException("User", userId.ToString());
        }

        var roles = await _userManager.GetRolesAsync(user);

        return new AuthUserDto(
            user.Id,
            user.Email ?? string.Empty,
            user.DisplayName,
            user.FirstName,
            user.LastName,
            user.EmailVerifiedAt.HasValue,
            roles.ToList().AsReadOnly()
        );
    }

    /// <inheritdoc />
    public async Task<bool> ValidateRefreshTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var refreshToken = await _unitOfWork.RefreshTokens.GetByTokenAsync(token, cancellationToken);
        return refreshToken?.IsValid() == true;
    }

    /// <summary>
    /// Maps a User entity to UserDto for authentication responses.
    /// </summary>
    private static UserDto MapToUserDto(User user, IList<string> roles)
    {
        return new UserDto(
            user.Id,
            user.Email ?? string.Empty,
            user.DisplayName,
            user.FirstName,
            user.LastName,
            user.IsActive,
            user.EmailVerifiedAt.HasValue,
            user.CreatedAt,
            user.UpdatedAt
        );
    }
}