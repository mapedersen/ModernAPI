using ModernAPI.Application.DTOs;

namespace ModernAPI.Application.Services;

/// <summary>
/// Represents HTTP response headers for caching purposes.
/// </summary>
public interface IHttpResponseHeaders
{
    string? CacheControl { get; set; }
    string? Pragma { get; set; }
    string? Expires { get; set; }
    string? Vary { get; set; }
    string? ETag { get; set; }
    string? LastModified { get; set; }
}

/// <summary>
/// Represents HTTP request headers for conditional requests.
/// </summary>
public interface IHttpRequestHeaders
{
    IEnumerable<string> IfNoneMatch { get; }
    IEnumerable<string> IfModifiedSince { get; }
    IEnumerable<string> IfMatch { get; }
}

/// <summary>
/// Simple result for conditional operations.
/// </summary>
public record ConditionalResult(int StatusCode, object? Content = null);

/// <summary>
/// Service for managing HTTP caching headers and policies.
/// Provides methods for setting appropriate Cache-Control headers and handling conditional requests.
/// </summary>
public interface IHttpCachingService
{
    /// <summary>
    /// Sets Cache-Control headers for individual user resources.
    /// Uses private caching with appropriate max-age based on user authorization.
    /// </summary>
    /// <param name="responseHeaders">The HTTP response headers to modify</param>
    /// <param name="isCurrentUser">Whether the resource belongs to the current user</param>
    /// <param name="maxAgeSeconds">Override for max-age in seconds (optional)</param>
    void SetUserResourceCacheHeaders(IHttpResponseHeaders responseHeaders, bool isCurrentUser, int? maxAgeSeconds = null);

    /// <summary>
    /// Sets Cache-Control headers for user collections/lists.
    /// Uses shorter TTL for collections as they change more frequently.
    /// </summary>
    /// <param name="responseHeaders">The HTTP response headers to modify</param>
    /// <param name="maxAgeSeconds">Override for max-age in seconds (optional)</param>
    void SetUserCollectionCacheHeaders(IHttpResponseHeaders responseHeaders, int? maxAgeSeconds = null);

    /// <summary>
    /// Sets Cache-Control headers for search results.
    /// Uses very short TTL as search results can change frequently.
    /// </summary>
    /// <param name="responseHeaders">The HTTP response headers to modify</param>
    /// <param name="maxAgeSeconds">Override for max-age in seconds (optional)</param>
    void SetSearchResultsCacheHeaders(IHttpResponseHeaders responseHeaders, int? maxAgeSeconds = null);

    /// <summary>
    /// Sets Cache-Control headers for admin-only resources.
    /// Uses private caching with shorter TTL for sensitive data.
    /// </summary>
    /// <param name="responseHeaders">The HTTP response headers to modify</param>
    /// <param name="maxAgeSeconds">Override for max-age in seconds (optional)</param>
    void SetAdminResourceCacheHeaders(IHttpResponseHeaders responseHeaders, int? maxAgeSeconds = null);

    /// <summary>
    /// Sets no-cache headers for resources that should never be cached.
    /// </summary>
    /// <param name="responseHeaders">The HTTP response headers to modify</param>
    void SetNoCacheHeaders(IHttpResponseHeaders responseHeaders);

    /// <summary>
    /// Handles conditional GET requests based on ETag and Last-Modified headers.
    /// </summary>
    /// <param name="requestHeaders">The incoming HTTP request headers</param>
    /// <param name="responseHeaders">The HTTP response headers to modify</param>
    /// <param name="currentETag">The current ETag for the resource</param>
    /// <param name="lastModified">The last modified date of the resource</param>
    /// <returns>ConditionalResult with 304 Not Modified if conditions match, null if request should proceed normally</returns>
    ConditionalResult? HandleConditionalGet(IHttpRequestHeaders requestHeaders, IHttpResponseHeaders responseHeaders, string currentETag, DateTime? lastModified = null);

    /// <summary>
    /// Validates conditional PUT/PATCH requests based on If-Match headers.
    /// </summary>
    /// <param name="requestHeaders">The incoming HTTP request headers</param>
    /// <param name="currentETag">The current ETag for the resource</param>
    /// <returns>ConditionalResult with 412 Precondition Failed if validation fails, null if request should proceed</returns>
    ConditionalResult? ValidateConditionalUpdate(IHttpRequestHeaders requestHeaders, string currentETag);

    /// <summary>
    /// Sets ETag and Last-Modified headers on the response.
    /// </summary>
    /// <param name="responseHeaders">The HTTP response headers to modify</param>
    /// <param name="etag">The ETag to set</param>
    /// <param name="lastModified">The last modified date to set (optional)</param>
    void SetEntityHeaders(IHttpResponseHeaders responseHeaders, string etag, DateTime? lastModified = null);

    /// <summary>
    /// Gets the configured cache duration for different resource types.
    /// </summary>
    /// <param name="resourceType">The type of resource</param>
    /// <returns>Cache duration in seconds</returns>
    int GetCacheDuration(CacheResourceType resourceType);
}

/// <summary>
/// Enumeration of different resource types for caching policies.
/// </summary>
public enum CacheResourceType
{
    /// <summary>Individual user resource accessed by the owner</summary>
    UserResourceOwner,
    
    /// <summary>Individual user resource accessed by another user</summary>
    UserResourceOther,
    
    /// <summary>User collections/lists</summary>
    UserCollection,
    
    /// <summary>Search results</summary>
    SearchResults,
    
    /// <summary>Admin-only resources</summary>
    AdminResource,
    
    /// <summary>Resources that should not be cached</summary>
    NoCache
}

/// <summary>
/// Implementation of IHttpCachingService with configurable caching policies.
/// </summary>
public class HttpCachingService : IHttpCachingService
{
    private readonly Dictionary<CacheResourceType, int> _cacheDurations;

    /// <summary>
    /// Initializes the caching service with default cache durations.
    /// </summary>
    public HttpCachingService()
    {
        _cacheDurations = new Dictionary<CacheResourceType, int>
        {
            // User accessing their own resource - can be cached longer
            [CacheResourceType.UserResourceOwner] = 300,      // 5 minutes
            
            // User accessing another user's resource - shorter cache
            [CacheResourceType.UserResourceOther] = 180,      // 3 minutes
            
            // User collections change frequently - shorter cache
            [CacheResourceType.UserCollection] = 120,         // 2 minutes
            
            // Search results change very frequently
            [CacheResourceType.SearchResults] = 60,           // 1 minute
            
            // Admin resources - sensitive, shorter cache
            [CacheResourceType.AdminResource] = 120,          // 2 minutes
            
            // No cache
            [CacheResourceType.NoCache] = 0
        };
    }

    public void SetUserResourceCacheHeaders(IHttpResponseHeaders responseHeaders, bool isCurrentUser, int? maxAgeSeconds = null)
    {
        var resourceType = isCurrentUser ? CacheResourceType.UserResourceOwner : CacheResourceType.UserResourceOther;
        var maxAge = maxAgeSeconds ?? GetCacheDuration(resourceType);
        
        if (maxAge > 0)
        {
            responseHeaders.CacheControl = $"private, max-age={maxAge}, must-revalidate";
            responseHeaders.Vary = "Authorization";
        }
        else
        {
            SetNoCacheHeaders(responseHeaders);
        }
    }

    public void SetUserCollectionCacheHeaders(IHttpResponseHeaders responseHeaders, int? maxAgeSeconds = null)
    {
        var maxAge = maxAgeSeconds ?? GetCacheDuration(CacheResourceType.UserCollection);
        
        if (maxAge > 0)
        {
            responseHeaders.CacheControl = $"private, max-age={maxAge}, must-revalidate";
            responseHeaders.Vary = "Authorization";
        }
        else
        {
            SetNoCacheHeaders(responseHeaders);
        }
    }

    public void SetSearchResultsCacheHeaders(IHttpResponseHeaders responseHeaders, int? maxAgeSeconds = null)
    {
        var maxAge = maxAgeSeconds ?? GetCacheDuration(CacheResourceType.SearchResults);
        
        if (maxAge > 0)
        {
            responseHeaders.CacheControl = $"private, max-age={maxAge}, must-revalidate";
            responseHeaders.Vary = "Authorization";
        }
        else
        {
            SetNoCacheHeaders(responseHeaders);
        }
    }

    public void SetAdminResourceCacheHeaders(IHttpResponseHeaders responseHeaders, int? maxAgeSeconds = null)
    {
        var maxAge = maxAgeSeconds ?? GetCacheDuration(CacheResourceType.AdminResource);
        
        if (maxAge > 0)
        {
            responseHeaders.CacheControl = $"private, max-age={maxAge}, must-revalidate, no-store";
            responseHeaders.Vary = "Authorization";
        }
        else
        {
            SetNoCacheHeaders(responseHeaders);
        }
    }

    public void SetNoCacheHeaders(IHttpResponseHeaders responseHeaders)
    {
        responseHeaders.CacheControl = "no-cache, no-store, must-revalidate";
        responseHeaders.Pragma = "no-cache";
        responseHeaders.Expires = "0";
    }

    public ConditionalResult? HandleConditionalGet(IHttpRequestHeaders requestHeaders, IHttpResponseHeaders responseHeaders, string currentETag, DateTime? lastModified = null)
    {
        // Set entity headers first
        SetEntityHeaders(responseHeaders, currentETag, lastModified);
        
        // Check If-None-Match header (ETag-based)
        var ifNoneMatch = requestHeaders.IfNoneMatch.FirstOrDefault();
        if (!string.IsNullOrEmpty(ifNoneMatch))
        {
            var etagService = GetETagService();
            if (etagService.CheckIfNoneMatch(ifNoneMatch, currentETag))
            {
                // ETag matches - return 304 Not Modified
                return new ConditionalResult(304);
            }
        }
        
        // Check If-Modified-Since header (date-based)
        if (lastModified.HasValue && requestHeaders.IfModifiedSince.Any())
        {
            var ifModifiedSinceHeader = requestHeaders.IfModifiedSince.FirstOrDefault();
            if (!string.IsNullOrEmpty(ifModifiedSinceHeader) && DateTime.TryParse(ifModifiedSinceHeader, out var ifModifiedSince))
            {
                // Compare dates (truncate to seconds for HTTP date precision)
                var lastModifiedTruncated = TruncateToSeconds(lastModified.Value);
                var ifModifiedSinceTruncated = TruncateToSeconds(ifModifiedSince);
                
                if (lastModifiedTruncated <= ifModifiedSinceTruncated)
                {
                    // Resource hasn't been modified - return 304 Not Modified
                    return new ConditionalResult(304);
                }
            }
        }
        
        // No match found - proceed with normal response
        return null;
    }

    public ConditionalResult? ValidateConditionalUpdate(IHttpRequestHeaders requestHeaders, string currentETag)
    {
        var ifMatch = requestHeaders.IfMatch.FirstOrDefault();
        
        // If no If-Match header, proceed with the operation
        if (string.IsNullOrEmpty(ifMatch))
        {
            return null;
        }
        
        var etagService = GetETagService();
        if (!etagService.CheckIfMatch(ifMatch, currentETag))
        {
            // ETags don't match - return 412 Precondition Failed
            return new ConditionalResult(412, new { 
                message = "The resource has been modified since you last retrieved it. Please refresh and try again.",
                code = "PRECONDITION_FAILED"
            });
        }
        
        // ETag matches - proceed with the operation
        return null;
    }

    public void SetEntityHeaders(IHttpResponseHeaders responseHeaders, string etag, DateTime? lastModified = null)
    {
        responseHeaders.ETag = etag;
        
        if (lastModified.HasValue)
        {
            // Convert to UTC and format for HTTP headers
            var utcLastModified = lastModified.Value.Kind == DateTimeKind.Utc 
                ? lastModified.Value 
                : lastModified.Value.ToUniversalTime();
                
            responseHeaders.LastModified = utcLastModified.ToString("R"); // RFC 1123 format
        }
    }

    public int GetCacheDuration(CacheResourceType resourceType)
    {
        return _cacheDurations.TryGetValue(resourceType, out var duration) ? duration : 0;
    }

    /// <summary>
    /// Gets the ETag service. In a real implementation, this would be injected.
    /// For now, we create a new instance.
    /// </summary>
    private static IETagService GetETagService()
    {
        return new ETagService();
    }

    /// <summary>
    /// Truncates a DateTime to seconds precision for HTTP date comparison.
    /// </summary>
    private static DateTime TruncateToSeconds(DateTime dateTime)
    {
        return new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, 
            dateTime.Hour, dateTime.Minute, dateTime.Second, dateTime.Kind);
    }
}