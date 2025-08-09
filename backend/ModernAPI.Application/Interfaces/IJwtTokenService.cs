using System.Security.Claims;
using ModernAPI.Domain.Entities;

namespace ModernAPI.Application.Interfaces;

/// <summary>
/// Service for JWT token operations.
/// </summary>
public interface IJwtTokenService
{
    /// <summary>
    /// Generates a JWT access token for the user.
    /// </summary>
    /// <param name="user">The user to create the token for</param>
    /// <param name="roles">The user's roles</param>
    /// <param name="rememberMe">Whether to extend the token expiry</param>
    /// <returns>The JWT token and expiry</returns>
    Task<(string Token, DateTime ExpiresAt)> GenerateAccessTokenAsync(User user, IList<string> roles, bool rememberMe = false);

    /// <summary>
    /// Generates a refresh token.
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="rememberMe">Whether to extend the token expiry</param>
    /// <returns>The refresh token entity</returns>
    RefreshToken GenerateRefreshToken(Guid userId, bool rememberMe = false);

    /// <summary>
    /// Validates a JWT token and extracts claims.
    /// </summary>
    /// <param name="token">The JWT token to validate</param>
    /// <returns>ClaimsPrincipal if valid, null if invalid</returns>
    ClaimsPrincipal? ValidateToken(string token);

    /// <summary>
    /// Gets the user ID from a JWT token.
    /// </summary>
    /// <param name="token">The JWT token</param>
    /// <returns>User ID if found, null otherwise</returns>
    Guid? GetUserIdFromToken(string token);

    /// <summary>
    /// Checks if a JWT token is expired.
    /// </summary>
    /// <param name="token">The JWT token</param>
    /// <returns>True if expired</returns>
    bool IsTokenExpired(string token);
}