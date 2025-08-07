using Microsoft.AspNetCore.Identity;
using ModernAPI.Domain.Events;
using ModernAPI.Domain.Exceptions;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Domain.Entities;

/// <summary>
/// User entity representing a user in the system.
/// Extends IdentityUser for native ASP.NET Core Identity integration.
/// Demonstrates rich domain model with business logic, validation, and domain events.
/// </summary>

public class User : IdentityUser<Guid>
{
    private readonly List<IDomainEvent> _domainEvents = new();

    /// <summary>
    /// The user's display name.
    /// </summary>
    public string DisplayName { get; private set; } = string.Empty;

    /// <summary>
    /// The user's first name (optional).
    /// </summary>
    public string? FirstName { get; private set; }

    /// <summary>
    /// The user's last name (optional).
    /// </summary>
    public string? LastName { get; private set; }

    /// <summary>
    /// When the user account was created.
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// When the user account was last updated.
    /// </summary>
    public DateTime UpdatedAt { get; private set; }

    /// <summary>
    /// Whether the user account is currently active.
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// When the user account was deactivated (if applicable).
    /// </summary>
    public DateTime? DeactivatedAt { get; private set; }

    /// <summary>
    /// Whether the user's email address has been verified.
    /// Note: This duplicates IdentityUser.EmailConfirmed for domain clarity.
    /// </summary>
    public bool IsEmailVerified 
    { 
        get => EmailConfirmed;
        private set => EmailConfirmed = value;
    }

    /// <summary>
    /// When the user's email was verified (if applicable).
    /// </summary>
    public DateTime? EmailVerifiedAt { get; private set; }

    /// <summary>
    /// Collection of domain events that have been raised by this entity.
    /// </summary>
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    // Private constructor for EF Core and Identity
    private User() : base() { }

    /// <summary>
    /// Creates a new User with the specified email and display name.
    /// </summary>
    /// <param name="email">The user's email address</param>
    /// <param name="displayName">The user's display name</param>
    /// <param name="firstName">The user's first name (optional)</param>
    /// <param name="lastName">The user's last name (optional)</param>
    /// <exception cref="ArgumentNullException">Thrown when required parameters are null</exception>
    /// <exception cref="ArgumentException">Thrown when display name is invalid</exception>
    public User(Email email, string displayName, string? firstName = null, string? lastName = null)
    {
        Id = Guid.NewGuid();
        
        SetEmail(email);
        SetDisplayName(displayName);
        SetNames(firstName, lastName);
        
        // Set Identity properties
        UserName = email.Value;
        NormalizedUserName = email.Value.ToUpperInvariant();
        NormalizedEmail = email.Value.ToUpperInvariant();
        
        var now = DateTime.UtcNow;
        CreatedAt = now;
        UpdatedAt = now;
        IsActive = true;
        IsEmailVerified = false;

        // Raise domain event for user creation
        RaiseDomainEvent(new UserCreatedEvent(Id, email, DisplayName));
    }

    /// <summary>
    /// Updates the user's display name.
    /// </summary>
    /// <param name="displayName">New display name</param>
    /// <exception cref="ArgumentException">Thrown when display name is invalid</exception>
    /// <exception cref="UserNotActiveException">Thrown when user is not active</exception>
    public void UpdateDisplayName(string displayName)
    {
        EnsureUserIsActive();
        
        var oldDisplayName = DisplayName;
        SetDisplayName(displayName);
        UpdatedAt = DateTime.UtcNow;

        if (oldDisplayName != DisplayName)
        {
            RaiseDomainEvent(new UserDisplayNameUpdatedEvent(Id, oldDisplayName, DisplayName));
        }
    }

    /// <summary>
    /// Updates the user's first and last names.
    /// </summary>
    /// <param name="firstName">New first name</param>
    /// <param name="lastName">New last name</param>
    /// <exception cref="UserNotActiveException">Thrown when user is not active</exception>
    public void UpdateNames(string? firstName, string? lastName)
    {
        EnsureUserIsActive();
        
        var oldFirstName = FirstName;
        var oldLastName = LastName;
        
        SetNames(firstName, lastName);
        UpdatedAt = DateTime.UtcNow;

        if (oldFirstName != FirstName || oldLastName != LastName)
        {
            RaiseDomainEvent(new UserNamesUpdatedEvent(Id, FirstName, LastName));
        }
    }

    /// <summary>
    /// Updates the user's profile information (display name and names).
    /// </summary>
    /// <param name="displayName">New display name</param>
    /// <param name="firstName">New first name</param>
    /// <param name="lastName">New last name</param>
    public void UpdateProfile(string displayName, string? firstName, string? lastName)
    {
        UpdateDisplayName(displayName);
        UpdateNames(firstName, lastName);
    }

    /// <summary>
    /// Changes the user's email address.
    /// This will require re-verification of the new email.
    /// </summary>
    /// <param name="newEmail">The new email address</param>
    /// <exception cref="ArgumentNullException">Thrown when email is null</exception>
    /// <exception cref="UserNotActiveException">Thrown when user is not active</exception>
    public void ChangeEmail(Email newEmail)
    {
        EnsureUserIsActive();
        
        var currentEmail = new Email(Email ?? string.Empty);
        if (currentEmail.Value.Equals(newEmail.Value, StringComparison.OrdinalIgnoreCase))
            return; // No change needed

        var oldEmail = currentEmail;
        SetEmail(newEmail);
        
        // Update Identity properties
        UserName = newEmail.Value;
        NormalizedUserName = newEmail.Value.ToUpperInvariant();
        NormalizedEmail = newEmail.Value.ToUpperInvariant();
        
        // Reset email verification when email changes
        IsEmailVerified = false;
        EmailVerifiedAt = null;
        UpdatedAt = DateTime.UtcNow;

        RaiseDomainEvent(new UserEmailChangedEvent(Id, oldEmail, newEmail));
    }

    /// <summary>
    /// Marks the user's email as verified.
    /// </summary>
    /// <exception cref="UserNotActiveException">Thrown when user is not active</exception>
    /// <exception cref="EmailAlreadyVerifiedException">Thrown when email is already verified</exception>
    public void VerifyEmail()
    {
        EnsureUserIsActive();
        
        if (IsEmailVerified)
            throw new EmailAlreadyVerifiedException(Id);

        IsEmailVerified = true;
        EmailVerifiedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        var email = new Email(Email ?? string.Empty);
        RaiseDomainEvent(new UserEmailVerifiedEvent(Id, email));
    }

    /// <summary>
    /// Deactivates the user account.
    /// </summary>
    /// <exception cref="UserAlreadyDeactivatedException">Thrown when user is already deactivated</exception>
    public void Deactivate()
    {
        if (!IsActive)
            throw new UserAlreadyDeactivatedException(Id);

        IsActive = false;
        DeactivatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        var email = new Email(Email ?? string.Empty);
        RaiseDomainEvent(new UserDeactivatedEvent(Id, email));
    }

    /// <summary>
    /// Reactivates the user account.
    /// </summary>
    /// <exception cref="UserAlreadyActiveException">Thrown when user is already active</exception>
    public void Reactivate()
    {
        if (IsActive)
            throw new UserAlreadyActiveException(Id);

        IsActive = true;
        DeactivatedAt = null;
        UpdatedAt = DateTime.UtcNow;

        var email = new Email(Email ?? string.Empty);
        RaiseDomainEvent(new UserReactivatedEvent(Id, email));
    }

    /// <summary>
    /// Gets the user's full name if first and last names are available.
    /// </summary>
    /// <returns>Full name or display name if full name is not available</returns>
    public string GetFullNameOrDisplayName()
    {
        if (!string.IsNullOrWhiteSpace(FirstName) && !string.IsNullOrWhiteSpace(LastName))
            return $"{FirstName} {LastName}";
            
        if (!string.IsNullOrWhiteSpace(FirstName))
            return FirstName;
            
        if (!string.IsNullOrWhiteSpace(LastName))
            return LastName;
            
        return DisplayName;
    }

    /// <summary>
    /// Checks if the user can perform actions (is active).
    /// </summary>
    /// <returns>True if user can perform actions</returns>
    public bool CanPerformActions() => IsActive;

    /// <summary>
    /// Gets the user's email as a domain value object.
    /// </summary>
    /// <returns>Email value object</returns>
    public Email GetDomainEmail()
    {
        return new Email(Email ?? string.Empty);
    }

    /// <summary>
    /// Raises a domain event to be handled later by the application layer.
    /// </summary>
    /// <param name="domainEvent">The domain event to raise</param>
    protected void RaiseDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    /// <summary>
    /// Clears all pending domain events. Should be called after events are processed.
    /// </summary>
    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    // Private helper methods

    private void SetEmail(Email email)
    {
        Email = email?.Value ?? throw new ArgumentNullException(nameof(email));
    }

    private void SetDisplayName(string displayName)
    {
        if (string.IsNullOrWhiteSpace(displayName))
            throw new ArgumentException("Display name cannot be empty or whitespace", nameof(displayName));

        if (displayName.Length > 100)
            throw new ArgumentException("Display name cannot exceed 100 characters", nameof(displayName));

        DisplayName = displayName.Trim();
    }

    private void SetNames(string? firstName, string? lastName)
    {
        if (firstName?.Length > 50)
            throw new ArgumentException("First name cannot exceed 50 characters", nameof(firstName));

        if (lastName?.Length > 50)
            throw new ArgumentException("Last name cannot exceed 50 characters", nameof(lastName));

        FirstName = string.IsNullOrWhiteSpace(firstName) ? null : firstName.Trim();
        LastName = string.IsNullOrWhiteSpace(lastName) ? null : lastName.Trim();
    }

    private void EnsureUserIsActive()
    {
        if (!IsActive)
            throw new UserNotActiveException(Id);
    }
}