using System.Security.Cryptography;
using System.Text;
using ModernAPI.Application.DTOs;

namespace ModernAPI.Application.Services;

/// <summary>
/// Service for generating and validating ETags for HTTP caching.
/// Uses UpdatedAt timestamps and entity IDs to create unique, deterministic ETags.
/// </summary>
public interface IETagService
{
    /// <summary>
    /// Generates an ETag for a single entity based on its ID and last modified time.
    /// </summary>
    /// <param name="entityId">The unique identifier of the entity</param>
    /// <param name="lastModified">The last modified timestamp</param>
    /// <returns>A quoted ETag string suitable for HTTP headers</returns>
    string GenerateETag(Guid entityId, DateTime lastModified);

    /// <summary>
    /// Generates an ETag for a user DTO.
    /// </summary>
    /// <param name="user">The user DTO</param>
    /// <returns>A quoted ETag string suitable for HTTP headers</returns>
    string GenerateETag(UserDto user);

    /// <summary>
    /// Generates an ETag for a collection of entities.
    /// Uses a combination of all entity IDs and their last modified times.
    /// </summary>
    /// <param name="entities">Collection of entities with ID and LastModified</param>
    /// <returns>A quoted ETag string suitable for HTTP headers</returns>
    string GenerateCollectionETag(IEnumerable<(Guid Id, DateTime LastModified)> entities);

    /// <summary>
    /// Generates an ETag for a user collection.
    /// </summary>
    /// <param name="users">Collection of user DTOs</param>
    /// <returns>A quoted ETag string suitable for HTTP headers</returns>
    string GenerateCollectionETag(IEnumerable<UserDto> users);

    /// <summary>
    /// Validates if the provided ETag matches the current entity state.
    /// </summary>
    /// <param name="providedETag">The ETag from the client request</param>
    /// <param name="entityId">The entity ID</param>
    /// <param name="lastModified">The current last modified timestamp</param>
    /// <returns>True if ETags match, false otherwise</returns>
    bool ValidateETag(string? providedETag, Guid entityId, DateTime lastModified);

    /// <summary>
    /// Validates if the provided ETag matches the current user state.
    /// </summary>
    /// <param name="providedETag">The ETag from the client request</param>
    /// <param name="user">The current user DTO</param>
    /// <returns>True if ETags match, false otherwise</returns>
    bool ValidateETag(string? providedETag, UserDto user);

    /// <summary>
    /// Parses an ETag header value by removing quotes and handling weak ETags.
    /// </summary>
    /// <param name="etagHeader">The raw ETag header value</param>
    /// <returns>The parsed ETag value without quotes</returns>
    string? ParseETagHeader(string? etagHeader);

    /// <summary>
    /// Checks if the provided If-None-Match header value matches the current ETag.
    /// Supports both single ETags and comma-separated lists, including the "*" wildcard.
    /// </summary>
    /// <param name="ifNoneMatchHeader">The If-None-Match header value</param>
    /// <param name="currentETag">The current entity ETag</param>
    /// <returns>True if there's a match (meaning return 304), false otherwise</returns>
    bool CheckIfNoneMatch(string? ifNoneMatchHeader, string currentETag);

    /// <summary>
    /// Checks if the provided If-Match header value matches the current ETag.
    /// Supports both single ETags and comma-separated lists, including the "*" wildcard.
    /// </summary>
    /// <param name="ifMatchHeader">The If-Match header value</param>
    /// <param name="currentETag">The current entity ETag</param>
    /// <returns>True if there's a match (proceed with operation), false otherwise (return 412)</returns>
    bool CheckIfMatch(string? ifMatchHeader, string currentETag);
}

/// <summary>
/// Implementation of IETagService using SHA-256 hashing for ETag generation.
/// </summary>
public class ETagService : IETagService
{
    private const string WEAK_ETAG_PREFIX = "W/";
    
    public string GenerateETag(Guid entityId, DateTime lastModified)
    {
        // Use UTC timestamp to ensure consistency across timezones
        var utcLastModified = lastModified.Kind == DateTimeKind.Utc 
            ? lastModified 
            : lastModified.ToUniversalTime();
            
        // Create a string that uniquely identifies this entity state
        var entityState = $"{entityId}:{utcLastModified:O}"; // ISO 8601 format for precision
        
        return GenerateHashedETag(entityState);
    }

    public string GenerateETag(UserDto user)
    {
        return GenerateETag(user.Id, user.UpdatedAt);
    }

    public string GenerateCollectionETag(IEnumerable<(Guid Id, DateTime LastModified)> entities)
    {
        var entityList = entities.ToList();
        if (!entityList.Any())
        {
            // Return a consistent ETag for empty collections
            return GenerateHashedETag("empty_collection");
        }

        // Sort by ID to ensure consistent ordering regardless of input order
        var sortedEntities = entityList.OrderBy(e => e.Id);
        
        var combinedState = string.Join("|", 
            sortedEntities.Select(e => $"{e.Id}:{e.LastModified.ToUniversalTime():O}"));
        
        return GenerateHashedETag(combinedState);
    }

    public string GenerateCollectionETag(IEnumerable<UserDto> users)
    {
        var entities = users.Select(u => (u.Id, u.UpdatedAt));
        return GenerateCollectionETag(entities);
    }

    public bool ValidateETag(string? providedETag, Guid entityId, DateTime lastModified)
    {
        if (string.IsNullOrEmpty(providedETag))
            return false;

        var currentETag = GenerateETag(entityId, lastModified);
        var parsedProvidedETag = ParseETagHeader(providedETag);
        var parsedCurrentETag = ParseETagHeader(currentETag);

        return string.Equals(parsedProvidedETag, parsedCurrentETag, StringComparison.Ordinal);
    }

    public bool ValidateETag(string? providedETag, UserDto user)
    {
        return ValidateETag(providedETag, user.Id, user.UpdatedAt);
    }

    public string? ParseETagHeader(string? etagHeader)
    {
        if (string.IsNullOrEmpty(etagHeader))
            return null;

        var etag = etagHeader.Trim();
        
        // Handle weak ETags
        if (etag.StartsWith(WEAK_ETAG_PREFIX))
        {
            etag = etag.Substring(WEAK_ETAG_PREFIX.Length);
        }
        
        // Remove surrounding quotes
        if (etag.StartsWith("\"") && etag.EndsWith("\"") && etag.Length >= 2)
        {
            etag = etag.Substring(1, etag.Length - 2);
        }

        return etag;
    }

    public bool CheckIfNoneMatch(string? ifNoneMatchHeader, string currentETag)
    {
        if (string.IsNullOrEmpty(ifNoneMatchHeader))
            return false;

        var trimmedHeader = ifNoneMatchHeader.Trim();
        
        // Handle wildcard - matches any ETag (used for "if resource exists" scenarios)
        if (trimmedHeader == "*")
            return true;

        var parsedCurrentETag = ParseETagHeader(currentETag);
        if (string.IsNullOrEmpty(parsedCurrentETag))
            return false;

        // Split on comma and check each ETag
        var etags = trimmedHeader.Split(',', StringSplitOptions.RemoveEmptyEntries);
        
        foreach (var etag in etags)
        {
            var parsedETag = ParseETagHeader(etag.Trim());
            if (string.Equals(parsedETag, parsedCurrentETag, StringComparison.Ordinal))
            {
                return true; // Match found - should return 304 Not Modified
            }
        }

        return false; // No match - return the resource
    }

    public bool CheckIfMatch(string? ifMatchHeader, string currentETag)
    {
        if (string.IsNullOrEmpty(ifMatchHeader))
        {
            // If no If-Match header is provided, the operation should proceed
            return true;
        }

        var trimmedHeader = ifMatchHeader.Trim();
        
        // Handle wildcard - matches any existing resource
        if (trimmedHeader == "*")
            return true;

        var parsedCurrentETag = ParseETagHeader(currentETag);
        if (string.IsNullOrEmpty(parsedCurrentETag))
            return false;

        // Split on comma and check each ETag
        var etags = trimmedHeader.Split(',', StringSplitOptions.RemoveEmptyEntries);
        
        foreach (var etag in etags)
        {
            var parsedETag = ParseETagHeader(etag.Trim());
            if (string.Equals(parsedETag, parsedCurrentETag, StringComparison.Ordinal))
            {
                return true; // Match found - operation can proceed
            }
        }

        return false; // No match - return 412 Precondition Failed
    }

    /// <summary>
    /// Generates a hashed ETag using SHA-256 and returns it as a quoted string.
    /// </summary>
    /// <param name="input">The input string to hash</param>
    /// <returns>A quoted ETag string</returns>
    private static string GenerateHashedETag(string input)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
        
        // Convert to hexadecimal string and take first 16 characters for reasonable length
        var hashString = Convert.ToHexString(hashBytes)[..16];
        
        // Return as quoted ETag
        return $"\"{hashString}\"";
    }
}