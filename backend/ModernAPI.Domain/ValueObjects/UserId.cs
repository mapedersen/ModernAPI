namespace ModernAPI.Domain.ValueObjects;

/// <summary>
/// Strongly-typed identifier for User entities.
/// Prevents mixing up different entity IDs and provides type safety.
/// </summary>
public record UserId : IEquatable<UserId>
{
    /// <summary>
    /// The underlying GUID value of the user identifier.
    /// </summary>
    public Guid Value { get; }

    /// <summary>
    /// Initializes a new UserId with the specified GUID value.
    /// </summary>
    /// <param name="value">The GUID value for the user ID</param>
    /// <exception cref="ArgumentException">Thrown when value is empty GUID</exception>
    public UserId(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("User ID cannot be empty", nameof(value));
            
        Value = value;
    }

    /// <summary>
    /// Creates a new unique UserId.
    /// </summary>
    /// <returns>A new UserId with a unique GUID value</returns>
    public static UserId New() => new(Guid.NewGuid());

    /// <summary>
    /// Creates a UserId from a string representation of a GUID.
    /// </summary>
    /// <param name="value">String representation of a GUID</param>
    /// <returns>A new UserId</returns>
    /// <exception cref="FormatException">Thrown when value is not a valid GUID</exception>
    public static UserId FromString(string value) => new(Guid.Parse(value));

    /// <summary>
    /// Attempts to create a UserId from a string representation of a GUID.
    /// </summary>
    /// <param name="value">String representation of a GUID</param>
    /// <param name="userId">The resulting UserId if successful</param>
    /// <returns>True if successful, false otherwise</returns>
    public static bool TryFromString(string value, out UserId? userId)
    {
        if (Guid.TryParse(value, out var guid) && guid != Guid.Empty)
        {
            userId = new UserId(guid);
            return true;
        }
        
        userId = null;
        return false;
    }

    /// <summary>
    /// Implicit conversion from UserId to Guid.
    /// </summary>
    public static implicit operator Guid(UserId userId) => userId.Value;

    /// <summary>
    /// Explicit conversion from Guid to UserId.
    /// </summary>
    public static explicit operator UserId(Guid guid) => new(guid);

    /// <inheritdoc />
    public override string ToString() => Value.ToString();
}