namespace ModernAPI.Application.Interfaces;

/// <summary>
/// Abstraction for password-related operations to decouple from ASP.NET Core Identity.
/// </summary>
public interface IPasswordService
{
    /// <summary>
    /// Validates a user's password.
    /// </summary>
    /// <param name="userId">The user's ID</param>
    /// <param name="password">The password to validate</param>
    /// <returns>True if the password is valid, false otherwise</returns>
    Task<bool> ValidatePasswordAsync(Guid userId, string password);

    /// <summary>
    /// Checks if a user account is locked out.
    /// </summary>
    /// <param name="userId">The user's ID</param>
    /// <returns>True if the account is locked out, false otherwise</returns>
    Task<bool> IsLockedOutAsync(Guid userId);
}