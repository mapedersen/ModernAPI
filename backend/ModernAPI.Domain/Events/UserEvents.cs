using ModernAPI.Domain.Entities;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Domain.Events;

/// <summary>
/// Domain event raised when a new user is created.
/// </summary>
/// <param name="UserId">The ID of the created user</param>
/// <param name="Email">The email address of the created user</param>
/// <param name="DisplayName">The display name of the created user</param>
public record UserCreatedEvent(
    Guid UserId,
    Email Email,
    string DisplayName
) : DomainEvent;

/// <summary>
/// Domain event raised when a user's display name is updated.
/// </summary>
/// <param name="UserId">The ID of the user</param>
/// <param name="OldDisplayName">The previous display name</param>
/// <param name="NewDisplayName">The new display name</param>
public record UserDisplayNameUpdatedEvent(
    Guid UserId,
    string OldDisplayName,
    string NewDisplayName
) : DomainEvent;

/// <summary>
/// Domain event raised when a user's first and last names are updated.
/// </summary>
/// <param name="UserId">The ID of the user</param>
/// <param name="FirstName">The new first name (nullable)</param>
/// <param name="LastName">The new last name (nullable)</param>
public record UserNamesUpdatedEvent(
    Guid UserId,
    string? FirstName,
    string? LastName
) : DomainEvent;

/// <summary>
/// Domain event raised when a user's email address is changed.
/// </summary>
/// <param name="UserId">The ID of the user</param>
/// <param name="OldEmail">The previous email address</param>
/// <param name="NewEmail">The new email address</param>
public record UserEmailChangedEvent(
    Guid UserId,
    Email OldEmail,
    Email NewEmail
) : DomainEvent;

/// <summary>
/// Domain event raised when a user's email is verified.
/// </summary>
/// <param name="UserId">The ID of the user</param>
/// <param name="Email">The verified email address</param>
public record UserEmailVerifiedEvent(
    Guid UserId,
    Email Email
) : DomainEvent;

/// <summary>
/// Domain event raised when a user account is deactivated.
/// </summary>
/// <param name="UserId">The ID of the deactivated user</param>
/// <param name="Email">The email address of the deactivated user</param>
public record UserDeactivatedEvent(
    Guid UserId,
    Email Email
) : DomainEvent;

/// <summary>
/// Domain event raised when a user account is reactivated.
/// </summary>
/// <param name="UserId">The ID of the reactivated user</param>
/// <param name="Email">The email address of the reactivated user</param>
public record UserReactivatedEvent(
    Guid UserId,
    Email Email
) : DomainEvent;