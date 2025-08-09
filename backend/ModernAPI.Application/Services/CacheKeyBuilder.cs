namespace ModernAPI.Application.Services;

/// <summary>
/// Utility class for building consistent cache keys across the application.
/// Provides methods to generate standardized cache keys for different resource types.
/// </summary>
public static class CacheKeyBuilder
{
    private const string KeySeparator = ":";
    private const string AppPrefix = "modernapi";

    /// <summary>
    /// Builds a cache key for a user resource.
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>Cache key in format "modernapi:users:{userId}"</returns>
    public static string UserKey(Guid userId)
    {
        return $"{AppPrefix}{KeySeparator}users{KeySeparator}{userId}";
    }

    /// <summary>
    /// Builds a cache key for a user list/collection.
    /// </summary>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <param name="searchTerm">Search term (optional)</param>
    /// <returns>Cache key in format "modernapi:users:list:{page}:{size}:{searchTerm?}"</returns>
    public static string UserListKey(int pageNumber = 1, int pageSize = 10, string? searchTerm = null)
    {
        var key = $"{AppPrefix}{KeySeparator}users{KeySeparator}list{KeySeparator}{pageNumber}{KeySeparator}{pageSize}";
        
        if (!string.IsNullOrEmpty(searchTerm))
        {
            // Hash search term to avoid key length issues and special characters
            var searchHash = searchTerm.GetHashCode().ToString();
            key += $"{KeySeparator}search{KeySeparator}{searchHash}";
        }
        
        return key;
    }

    /// <summary>
    /// Builds a cache key for user search results.
    /// </summary>
    /// <param name="searchTerm">The search term</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Cache key in format "modernapi:users:search:{searchHash}:{page}:{size}"</returns>
    public static string UserSearchKey(string searchTerm, int pageNumber = 1, int pageSize = 10)
    {
        var searchHash = searchTerm.GetHashCode().ToString();
        return $"{AppPrefix}{KeySeparator}users{KeySeparator}search{KeySeparator}{searchHash}{KeySeparator}{pageNumber}{KeySeparator}{pageSize}";
    }

    /// <summary>
    /// Builds a cache key for the current user's profile.
    /// </summary>
    /// <param name="userId">The current user ID</param>
    /// <returns>Cache key in format "modernapi:users:profile:{userId}"</returns>
    public static string CurrentUserProfileKey(Guid userId)
    {
        return $"{AppPrefix}{KeySeparator}users{KeySeparator}profile{KeySeparator}{userId}";
    }

    /// <summary>
    /// Builds a cache key for authentication-related data.
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="dataType">Type of auth data (e.g., "refresh-tokens", "permissions")</param>
    /// <returns>Cache key in format "modernapi:auth:{dataType}:{userId}"</returns>
    public static string AuthKey(Guid userId, string dataType)
    {
        return $"{AppPrefix}{KeySeparator}auth{KeySeparator}{dataType}{KeySeparator}{userId}";
    }

    /// <summary>
    /// Builds a cache key for session data.
    /// </summary>
    /// <param name="sessionId">The session ID</param>
    /// <returns>Cache key in format "modernapi:sessions:{sessionId}"</returns>
    public static string SessionKey(string sessionId)
    {
        return $"{AppPrefix}{KeySeparator}sessions{KeySeparator}{sessionId}";
    }

    /// <summary>
    /// Builds a cache key for rate limiting.
    /// </summary>
    /// <param name="identifier">The identifier (IP, user ID, etc.)</param>
    /// <param name="endpoint">The endpoint or action</param>
    /// <returns>Cache key in format "modernapi:ratelimit:{endpoint}:{identifier}"</returns>
    public static string RateLimitKey(string identifier, string endpoint)
    {
        return $"{AppPrefix}{KeySeparator}ratelimit{KeySeparator}{endpoint}{KeySeparator}{identifier}";
    }

    /// <summary>
    /// Builds a pattern for removing user-related cache entries.
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>Pattern in format "modernapi:users:*:{userId}*" to match all user-related keys</returns>
    public static string UserPattern(Guid userId)
    {
        return $"{AppPrefix}{KeySeparator}users{KeySeparator}*{KeySeparator}{userId}*";
    }

    /// <summary>
    /// Builds a pattern for removing all user list cache entries.
    /// </summary>
    /// <returns>Pattern in format "modernapi:users:list:*"</returns>
    public static string UserListPattern()
    {
        return $"{AppPrefix}{KeySeparator}users{KeySeparator}list{KeySeparator}*";
    }

    /// <summary>
    /// Builds a pattern for removing user search cache entries.
    /// </summary>
    /// <returns>Pattern in format "modernapi:users:search:*"</returns>
    public static string UserSearchPattern()
    {
        return $"{AppPrefix}{KeySeparator}users{KeySeparator}search{KeySeparator}*";
    }

    /// <summary>
    /// Builds a generic cache key with custom segments.
    /// </summary>
    /// <param name="segments">Key segments to join</param>
    /// <returns>Cache key with app prefix</returns>
    public static string CustomKey(params string[] segments)
    {
        var allSegments = new[] { AppPrefix }.Concat(segments);
        return string.Join(KeySeparator, allSegments);
    }

    /// <summary>
    /// Gets the cache key expiration time based on resource type.
    /// </summary>
    /// <param name="resourceType">The type of cached resource</param>
    /// <returns>TimeSpan for cache expiration</returns>
    public static TimeSpan GetCacheExpiration(CacheResourceType resourceType)
    {
        return resourceType switch
        {
            CacheResourceType.UserResourceOwner => TimeSpan.FromMinutes(5),    // 5 minutes
            CacheResourceType.UserResourceOther => TimeSpan.FromMinutes(3),    // 3 minutes
            CacheResourceType.UserCollection => TimeSpan.FromMinutes(2),       // 2 minutes
            CacheResourceType.SearchResults => TimeSpan.FromMinutes(1),        // 1 minute
            CacheResourceType.AdminResource => TimeSpan.FromMinutes(2),        // 2 minutes
            CacheResourceType.NoCache => TimeSpan.Zero,                        // No caching
            _ => TimeSpan.FromMinutes(2)                                        // Default 2 minutes
        };
    }
}