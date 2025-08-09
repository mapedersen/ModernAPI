namespace ModernAPI.Application.Common.Settings;

/// <summary>
/// JWT configuration settings.
/// </summary>
public class JwtSettings
{
    public const string SectionName = "JwtSettings";

    /// <summary>
    /// JWT signing key (must be at least 256 bits for HS256).
    /// </summary>
    public string Secret { get; set; } = string.Empty;

    /// <summary>
    /// JWT issuer (typically your API's domain).
    /// </summary>
    public string Issuer { get; set; } = string.Empty;

    /// <summary>
    /// JWT audience (typically your client application).
    /// </summary>
    public string Audience { get; set; } = string.Empty;

    /// <summary>
    /// Access token expiry time in minutes.
    /// </summary>
    public int AccessTokenExpiryMinutes { get; set; } = 15;

    /// <summary>
    /// Refresh token expiry time in days.
    /// </summary>
    public int RefreshTokenExpiryDays { get; set; } = 30;
}