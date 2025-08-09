namespace ModernAPI.Domain.Entities;

/// <summary>
/// Represents a refresh token for JWT authentication.
/// Refresh tokens are used to obtain new access tokens without requiring the user to re-authenticate.
/// </summary>
public class RefreshToken
{
    /// <summary>
    /// The unique identifier for this refresh token.
    /// </summary>
    public Guid Id { get; private set; }

    /// <summary>
    /// The refresh token value (should be cryptographically secure).
    /// </summary>
    public string Token { get; private set; } = string.Empty;

    /// <summary>
    /// The ID of the user this refresh token belongs to.
    /// </summary>
    public Guid UserId { get; private set; }

    /// <summary>
    /// When this refresh token expires.
    /// </summary>
    public DateTime ExpiresAt { get; private set; }

    /// <summary>
    /// Whether this refresh token has been revoked.
    /// </summary>
    public bool IsRevoked { get; private set; }

    /// <summary>
    /// When this refresh token was revoked (if applicable).
    /// </summary>
    public DateTime? RevokedAt { get; private set; }

    /// <summary>
    /// The reason for revoking this token (if applicable).
    /// </summary>
    public string? RevokedReason { get; private set; }

    /// <summary>
    /// When this refresh token was created.
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// When this refresh token was last updated.
    /// </summary>
    public DateTime UpdatedAt { get; private set; }

    /// <summary>
    /// Navigation property to the user.
    /// </summary>
    public User User { get; private set; } = null!;

    /// <summary>
    /// Private constructor for Entity Framework.
    /// </summary>
    private RefreshToken() { }

    /// <summary>
    /// Creates a new refresh token.
    /// </summary>
    /// <param name="token">The token value</param>
    /// <param name="userId">The user ID</param>
    /// <param name="expiresAt">When the token expires</param>
    public RefreshToken(string token, Guid userId, DateTime expiresAt)
    {
        if (string.IsNullOrWhiteSpace(token))
            throw new ArgumentException("Token cannot be null or empty", nameof(token));

        if (userId == Guid.Empty)
            throw new ArgumentException("User ID cannot be empty", nameof(userId));

        if (expiresAt <= DateTime.UtcNow)
            throw new ArgumentException("Token must expire in the future", nameof(expiresAt));

        Id = Guid.NewGuid();
        Token = token;
        UserId = userId;
        ExpiresAt = expiresAt;
        IsRevoked = false;

        var now = DateTime.UtcNow;
        CreatedAt = now;
        UpdatedAt = now;
    }

    /// <summary>
    /// Revokes this refresh token.
    /// </summary>
    /// <param name="reason">The reason for revocation</param>
    public void Revoke(string reason = "Token revoked")
    {
        if (IsRevoked)
            throw new InvalidOperationException("Token is already revoked");

        IsRevoked = true;
        RevokedAt = DateTime.UtcNow;
        RevokedReason = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Checks if this refresh token is valid (not expired and not revoked).
    /// </summary>
    /// <returns>True if the token is valid</returns>
    public bool IsValid()
    {
        return !IsRevoked && ExpiresAt > DateTime.UtcNow;
    }

    /// <summary>
    /// Checks if this refresh token is expired.
    /// </summary>
    /// <returns>True if the token is expired</returns>
    public bool IsExpired()
    {
        return ExpiresAt <= DateTime.UtcNow;
    }
}