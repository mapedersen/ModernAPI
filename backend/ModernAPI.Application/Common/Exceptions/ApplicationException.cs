namespace ModernAPI.Application.Common.Exceptions;

/// <summary>
/// Base class for all application-layer exceptions.
/// These exceptions represent application-specific concerns like "not found", 
/// "unauthorized", or validation failures.
/// </summary>
public abstract class ApplicationException : Exception
{
    /// <summary>
    /// Error code for categorizing the exception type.
    /// </summary>
    public string ErrorCode { get; }

    /// <summary>
    /// Initializes a new application exception with an error code and message.
    /// </summary>
    /// <param name="errorCode">Unique error code for this exception type</param>
    /// <param name="message">Human-readable error message</param>
    protected ApplicationException(string errorCode, string message) 
        : base(message)
    {
        ErrorCode = errorCode;
    }

    /// <summary>
    /// Initializes a new application exception with an error code, message, and inner exception.
    /// </summary>
    /// <param name="errorCode">Unique error code for this exception type</param>
    /// <param name="message">Human-readable error message</param>
    /// <param name="innerException">The exception that caused this exception</param>
    protected ApplicationException(string errorCode, string message, Exception innerException) 
        : base(message, innerException)
    {
        ErrorCode = errorCode;
    }
}

/// <summary>
/// Exception thrown when a requested resource is not found.
/// </summary>
public class NotFoundException : ApplicationException
{
    /// <summary>
    /// The type of resource that was not found.
    /// </summary>
    public string ResourceType { get; }

    /// <summary>
    /// The identifier that was used to search for the resource.
    /// </summary>
    public string ResourceId { get; }

    /// <summary>
    /// Initializes a new NotFoundException.
    /// </summary>
    /// <param name="resourceType">The type of resource (e.g., "User", "Product")</param>
    /// <param name="resourceId">The identifier that was searched for</param>
    public NotFoundException(string resourceType, string resourceId) 
        : base("RESOURCE_NOT_FOUND", $"{resourceType} with identifier '{resourceId}' was not found")
    {
        ResourceType = resourceType;
        ResourceId = resourceId;
    }

    /// <summary>
    /// Initializes a new NotFoundException with a custom message.
    /// </summary>
    /// <param name="resourceType">The type of resource (e.g., "User", "Product")</param>
    /// <param name="resourceId">The identifier that was searched for</param>
    /// <param name="message">Custom error message</param>
    public NotFoundException(string resourceType, string resourceId, string message) 
        : base("RESOURCE_NOT_FOUND", message)
    {
        ResourceType = resourceType;
        ResourceId = resourceId;
    }
}

/// <summary>
/// Exception thrown when a validation fails during application processing.
/// This is different from input validation - it's for business rule validation.
/// </summary>
public class ValidationException : ApplicationException
{
    /// <summary>
    /// Dictionary of validation errors with field names as keys and error messages as values.
    /// </summary>
    public Dictionary<string, string[]> ValidationErrors { get; }

    /// <summary>
    /// Initializes a new ValidationException with a single validation error.
    /// </summary>
    /// <param name="field">The field that failed validation</param>
    /// <param name="error">The validation error message</param>
    public ValidationException(string field, string error) 
        : base("VALIDATION_FAILED", "One or more validation errors occurred")
    {
        ValidationErrors = new Dictionary<string, string[]>
        {
            { field, [error] }
        };
    }

    /// <summary>
    /// Initializes a new ValidationException with multiple validation errors.
    /// </summary>
    /// <param name="validationErrors">Dictionary of validation errors</param>
    public ValidationException(Dictionary<string, string[]> validationErrors) 
        : base("VALIDATION_FAILED", "One or more validation errors occurred")
    {
        ValidationErrors = validationErrors;
    }

    /// <summary>
    /// Creates a ValidationException from FluentValidation results.
    /// </summary>
    /// <param name="failures">FluentValidation failure results</param>
    /// <returns>A new ValidationException</returns>
    public static ValidationException FromFluentValidation(IEnumerable<FluentValidation.Results.ValidationFailure> failures)
    {
        var validationErrors = failures
            .GroupBy(f => f.PropertyName)
            .ToDictionary(
                g => g.Key, 
                g => g.Select(f => f.ErrorMessage).ToArray()
            );

        return new ValidationException(validationErrors);
    }
}

/// <summary>
/// Exception thrown when a business rule conflict occurs.
/// For example, trying to create a user with an email that already exists.
/// </summary>
public class ConflictException : ApplicationException
{
    /// <summary>
    /// The resource that caused the conflict.
    /// </summary>
    public string Resource { get; }

    /// <summary>
    /// The conflicting value.
    /// </summary>
    public string ConflictingValue { get; }

    /// <summary>
    /// Initializes a new ConflictException.
    /// </summary>
    /// <param name="resource">The resource type that has a conflict</param>
    /// <param name="conflictingValue">The value that caused the conflict</param>
    /// <param name="message">Custom error message</param>
    public ConflictException(string resource, string conflictingValue, string? message = null) 
        : base("RESOURCE_CONFLICT", message ?? $"{resource} with value '{conflictingValue}' already exists")
    {
        Resource = resource;
        ConflictingValue = conflictingValue;
    }
}

/// <summary>
/// Exception thrown when a precondition for a request fails.
/// Typically used for ETag mismatches in conditional requests.
/// </summary>
public class PreconditionFailedException : ApplicationException
{
    /// <summary>
    /// The resource that failed the precondition check.
    /// </summary>
    public string Resource { get; }

    /// <summary>
    /// The expected precondition value.
    /// </summary>
    public string? ExpectedValue { get; }

    /// <summary>
    /// The actual precondition value.
    /// </summary>
    public string? ActualValue { get; }

    /// <summary>
    /// Initializes a new PreconditionFailedException.
    /// </summary>
    /// <param name="resource">The resource that failed the precondition</param>
    /// <param name="message">Custom error message</param>
    public PreconditionFailedException(string resource, string? message = null) 
        : base("PRECONDITION_FAILED", message ?? $"The precondition for {resource} has failed")
    {
        Resource = resource;
    }

    /// <summary>
    /// Initializes a new PreconditionFailedException with expected and actual values.
    /// </summary>
    /// <param name="resource">The resource that failed the precondition</param>
    /// <param name="expectedValue">The expected precondition value</param>
    /// <param name="actualValue">The actual precondition value</param>
    /// <param name="message">Custom error message</param>
    public PreconditionFailedException(string resource, string expectedValue, string actualValue, string? message = null) 
        : base("PRECONDITION_FAILED", message ?? $"The precondition for {resource} has failed. Expected: {expectedValue}, Actual: {actualValue}")
    {
        Resource = resource;
        ExpectedValue = expectedValue;
        ActualValue = actualValue;
    }
}