using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Domain.Exceptions;

/// <summary>
/// Base class for all domain-specific exceptions.
/// Domain exceptions represent business rule violations and expected error conditions.
/// </summary>
public abstract class DomainException : Exception
{
    /// <summary>
    /// Error code for categorizing the exception type.
    /// </summary>
    public string ErrorCode { get; }

    /// <summary>
    /// Initializes a new domain exception with an error code and message.
    /// </summary>
    /// <param name="errorCode">Unique error code for this exception type</param>
    /// <param name="message">Human-readable error message</param>
    protected DomainException(string errorCode, string message) 
        : base(message)
    {
        ErrorCode = errorCode;
    }

    /// <summary>
    /// Initializes a new domain exception with an error code, message, and inner exception.
    /// </summary>
    /// <param name="errorCode">Unique error code for this exception type</param>
    /// <param name="message">Human-readable error message</param>
    /// <param name="innerException">The exception that caused this exception</param>
    protected DomainException(string errorCode, string message, Exception innerException) 
        : base(message, innerException)
    {
        ErrorCode = errorCode;
    }
}

/// <summary>
/// Exception thrown when trying to perform operations on a user that is not active.
/// </summary>
public class UserNotActiveException : DomainException
{
    /// <summary>
    /// The ID of the inactive user.
    /// </summary>
    public Guid UserId { get; }

    /// <summary>
    /// Initializes a new UserNotActiveException.
    /// </summary>
    /// <param name="userId">The ID of the inactive user</param>
    public UserNotActiveException(Guid userId) 
        : base("USER_NOT_ACTIVE", $"User {userId} is not active and cannot perform this operation")
    {
        UserId = userId;
    }
}

/// <summary>
/// Exception thrown when trying to deactivate a user that is already deactivated.
/// </summary>
public class UserAlreadyDeactivatedException : DomainException
{
    /// <summary>
    /// The ID of the user that is already deactivated.
    /// </summary>
    public Guid UserId { get; }

    /// <summary>
    /// Initializes a new UserAlreadyDeactivatedException.
    /// </summary>
    /// <param name="userId">The ID of the already deactivated user</param>
    public UserAlreadyDeactivatedException(Guid userId) 
        : base("USER_ALREADY_DEACTIVATED", $"User {userId} is already deactivated")
    {
        UserId = userId;
    }
}

/// <summary>
/// Exception thrown when trying to activate a user that is already active.
/// </summary>
public class UserAlreadyActiveException : DomainException
{
    /// <summary>
    /// The ID of the user that is already active.
    /// </summary>
    public Guid UserId { get; }

    /// <summary>
    /// Initializes a new UserAlreadyActiveException.
    /// </summary>
    /// <param name="userId">The ID of the already active user</param>
    public UserAlreadyActiveException(Guid userId) 
        : base("USER_ALREADY_ACTIVE", $"User {userId} is already active")
    {
        UserId = userId;
    }
}

/// <summary>
/// Exception thrown when trying to verify an email that is already verified.
/// </summary>
public class EmailAlreadyVerifiedException : DomainException
{
    /// <summary>
    /// The ID of the user whose email is already verified.
    /// </summary>
    public Guid UserId { get; }

    /// <summary>
    /// Initializes a new EmailAlreadyVerifiedException.
    /// </summary>
    /// <param name="userId">The ID of the user whose email is already verified</param>
    public EmailAlreadyVerifiedException(Guid userId) 
        : base("EMAIL_ALREADY_VERIFIED", $"Email for user {userId} is already verified")
    {
        UserId = userId;
    }
}