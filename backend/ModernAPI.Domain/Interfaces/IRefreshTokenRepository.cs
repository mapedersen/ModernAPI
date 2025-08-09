using ModernAPI.Domain.Entities;

namespace ModernAPI.Domain.Interfaces;

/// <summary>
/// Repository interface for refresh token operations.
/// </summary>
public interface IRefreshTokenRepository
{
    /// <summary>
    /// Gets a refresh token by its token value.
    /// </summary>
    /// <param name="token">The token value</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The refresh token if found, null otherwise</returns>
    Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all refresh tokens for a specific user.
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of refresh tokens for the user</returns>
    Task<IReadOnlyList<RefreshToken>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all active (non-revoked, non-expired) refresh tokens for a user.
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of active refresh tokens</returns>
    Task<IReadOnlyList<RefreshToken>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new refresh token.
    /// </summary>
    /// <param name="refreshToken">The refresh token to add</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates a refresh token.
    /// </summary>
    /// <param name="refreshToken">The refresh token to update</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task UpdateAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);

    /// <summary>
    /// Removes expired refresh tokens for cleanup.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of tokens removed</returns>
    Task<int> RemoveExpiredTokensAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Revokes all refresh tokens for a user (useful for logout from all devices).
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="reason">Reason for revocation</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of tokens revoked</returns>
    Task<int> RevokeAllUserTokensAsync(Guid userId, string reason = "User logout", CancellationToken cancellationToken = default);
}