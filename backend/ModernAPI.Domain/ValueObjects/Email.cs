using System.Text.RegularExpressions;

namespace ModernAPI.Domain.ValueObjects;

/// <summary>
/// Email value object that ensures email addresses are valid and normalized.
/// Immutable and implements value equality.
/// </summary>
public record Email
{
    private static readonly Regex EmailRegex = new(
        @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase,
        TimeSpan.FromMilliseconds(250));

    /// <summary>
    /// The normalized email address value.
    /// </summary>
    public string Value { get; }

    /// <summary>
    /// Initializes a new Email with validation and normalization.
    /// </summary>
    /// <param name="value">The email address string</param>
    /// <exception cref="ArgumentException">Thrown when email is invalid</exception>
    public Email(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Email address cannot be empty or whitespace", nameof(value));

        var trimmed = value.Trim();
        
        if (trimmed.Length > 254) // RFC 5321 limit
            throw new ArgumentException("Email address is too long (max 254 characters)", nameof(value));

        if (!IsValidEmail(trimmed))
            throw new ArgumentException($"'{trimmed}' is not a valid email address", nameof(value));

        // Normalize: convert to lowercase
        Value = trimmed.ToLowerInvariant();
    }

    /// <summary>
    /// Validates an email address using regex and additional rules.
    /// </summary>
    /// <param name="email">Email address to validate</param>
    /// <returns>True if valid, false otherwise</returns>
    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrEmpty(email))
            return false;

        // Basic regex check
        if (!EmailRegex.IsMatch(email))
            return false;

        // Additional business rules
        var parts = email.Split('@');
        if (parts.Length != 2)
            return false;

        var localPart = parts[0];
        var domainPart = parts[1];

        // Local part checks
        if (localPart.Length == 0 || localPart.Length > 64)
            return false;

        if (localPart.StartsWith('.') || localPart.EndsWith('.'))
            return false;

        if (localPart.Contains(".."))
            return false;

        // Domain part checks
        if (domainPart.Length == 0 || domainPart.Length > 255)
            return false;

        if (domainPart.StartsWith('.') || domainPart.EndsWith('.'))
            return false;

        if (domainPart.StartsWith('-') || domainPart.EndsWith('-'))
            return false;

        return true;
    }

    /// <summary>
    /// Creates an Email from a string, returning null if invalid.
    /// </summary>
    /// <param name="value">Email address string</param>
    /// <returns>Email object or null if invalid</returns>
    public static Email? CreateOrNull(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        try
        {
            return new Email(value);
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Attempts to create an Email from a string.
    /// </summary>
    /// <param name="value">Email address string</param>
    /// <param name="email">The resulting Email if successful</param>
    /// <returns>True if successful, false otherwise</returns>
    public static bool TryCreate(string? value, out Email? email)
    {
        email = CreateOrNull(value);
        return email is not null;
    }

    /// <summary>
    /// Gets the domain part of the email address.
    /// </summary>
    /// <returns>The domain portion of the email</returns>
    public string GetDomain()
    {
        return Value.Split('@')[1];
    }

    /// <summary>
    /// Gets the local part of the email address (before @).
    /// </summary>
    /// <returns>The local portion of the email</returns>
    public string GetLocalPart()
    {
        return Value.Split('@')[0];
    }

    /// <summary>
    /// Implicit conversion from Email to string.
    /// </summary>
    public static implicit operator string(Email email) => email.Value;

    /// <summary>
    /// Explicit conversion from string to Email.
    /// </summary>
    public static explicit operator Email(string email) => new(email);

    /// <inheritdoc />
    public override string ToString() => Value;
}