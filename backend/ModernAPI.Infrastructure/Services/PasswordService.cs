using Microsoft.AspNetCore.Identity;
using ModernAPI.Application.Interfaces;
using ModernAPI.Domain.Entities;

namespace ModernAPI.Infrastructure.Services;

/// <summary>
/// Implementation of password service using ASP.NET Core Identity's UserManager.
/// This keeps ASP.NET Core Identity dependencies properly abstracted.
/// </summary>
public class PasswordService : IPasswordService
{
    private readonly UserManager<User> _userManager;
    private readonly IPasswordHasher<User> _passwordHasher;

    /// <summary>
    /// Initializes a new instance of the PasswordService.
    /// </summary>
    /// <param name="userManager">The user manager</param>
    /// <param name="passwordHasher">The password hasher</param>
    public PasswordService(UserManager<User> userManager, IPasswordHasher<User> passwordHasher)
    {
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _passwordHasher = passwordHasher ?? throw new ArgumentNullException(nameof(passwordHasher));
    }

    /// <inheritdoc />
    public async Task<bool> ValidatePasswordAsync(Guid userId, string password)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return false;

        // Check the password using UserManager
        var result = await _userManager.CheckPasswordAsync(user, password);
        
        // Also check for lockout if password check succeeded
        if (result && await _userManager.IsLockedOutAsync(user))
        {
            // Increment failed access attempts even though password is correct
            await _userManager.AccessFailedAsync(user);
            return false;
        }

        // Reset failed access attempts on successful login
        if (result)
        {
            await _userManager.ResetAccessFailedCountAsync(user);
        }
        else
        {
            // Increment failed access attempts
            await _userManager.AccessFailedAsync(user);
        }

        return result;
    }

    /// <inheritdoc />
    public async Task<bool> IsLockedOutAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return false;

        return await _userManager.IsLockedOutAsync(user);
    }
}