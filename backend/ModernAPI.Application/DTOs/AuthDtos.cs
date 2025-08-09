using System.ComponentModel.DataAnnotations;

namespace ModernAPI.Application.DTOs;

/// <summary>
/// Request DTO for user login.
/// </summary>
/// <param name="Email">User's email address</param>
/// <param name="Password">User's password</param>
/// <param name="RememberMe">Whether to extend the token expiry</param>
public record LoginRequest(
    [Required][EmailAddress] string Email,
    [Required][MinLength(6)] string Password,
    bool RememberMe = false
);

/// <summary>
/// Request DTO for user registration.
/// </summary>
/// <param name="Email">User's email address</param>
/// <param name="Password">User's password</param>
/// <param name="ConfirmPassword">Password confirmation</param>
/// <param name="DisplayName">User's display name</param>
/// <param name="FirstName">User's first name</param>
/// <param name="LastName">User's last name</param>
public record RegisterRequest(
    [Required][EmailAddress] string Email,
    [Required][MinLength(8)] string Password,
    [Required] string ConfirmPassword,
    [Required][MaxLength(100)] string DisplayName,
    [MaxLength(50)] string? FirstName,
    [MaxLength(50)] string? LastName
);

/// <summary>
/// Request DTO for refreshing tokens.
/// </summary>
/// <param name="RefreshToken">The refresh token</param>
public record RefreshTokenRequest(
    [Required] string RefreshToken
);

/// <summary>
/// Request DTO for changing password.
/// </summary>
/// <param name="CurrentPassword">User's current password</param>
/// <param name="NewPassword">User's new password</param>
/// <param name="ConfirmNewPassword">Confirmation of new password</param>
public record ChangePasswordRequest(
    [Required] string CurrentPassword,
    [Required][MinLength(8)] string NewPassword,
    [Required] string ConfirmNewPassword
);

/// <summary>
/// Response DTO containing authentication tokens.
/// </summary>
/// <param name="AccessToken">JWT access token</param>
/// <param name="RefreshToken">Refresh token for token renewal</param>
/// <param name="AccessTokenExpiresAt">When the access token expires</param>
/// <param name="RefreshTokenExpiresAt">When the refresh token expires</param>
/// <param name="User">User information</param>
public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAt,
    DateTime RefreshTokenExpiresAt,
    UserDto User
);

/// <summary>
/// Response DTO for logout operation.
/// </summary>
/// <param name="Message">Success message</param>
public record LogoutResponse(
    string Message
);

/// <summary>
/// Request DTO for logout operation.
/// </summary>
/// <param name="RefreshToken">The refresh token to revoke</param>
public record LogoutRequest(
    [Required] string RefreshToken
);

/// <summary>
/// Request DTO for token validation.
/// </summary>
/// <param name="RefreshToken">The refresh token to validate</param>
public record TokenValidationRequest(
    [Required] string RefreshToken
);

/// <summary>
/// Response DTO for token validation.
/// </summary>
/// <param name="IsValid">Whether the token is valid</param>
public record TokenValidationResponse(
    bool IsValid
);

/// <summary>
/// DTO for user profile information in auth context.
/// </summary>
/// <param name="Id">User ID</param>
/// <param name="Email">User's email</param>
/// <param name="DisplayName">User's display name</param>
/// <param name="FirstName">User's first name</param>
/// <param name="LastName">User's last name</param>
/// <param name="IsEmailVerified">Whether the email is verified</param>
/// <param name="Roles">User's roles</param>
public record AuthUserDto(
    Guid Id,
    string Email,
    string DisplayName,
    string? FirstName,
    string? LastName,
    bool IsEmailVerified,
    IReadOnlyList<string> Roles
);