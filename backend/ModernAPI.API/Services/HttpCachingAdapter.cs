using Microsoft.AspNetCore.Mvc;
using ModernAPI.Application.Services;
using Microsoft.Extensions.Primitives;

namespace ModernAPI.API.Services;

/// <summary>
/// Adapter that wraps ASP.NET Core HttpRequest headers for use with the application layer caching service.
/// </summary>
public class HttpRequestHeadersAdapter : IHttpRequestHeaders
{
    private readonly IHeaderDictionary _headers;

    public HttpRequestHeadersAdapter(IHeaderDictionary headers)
    {
        _headers = headers ?? throw new ArgumentNullException(nameof(headers));
    }

    public IEnumerable<string> IfNoneMatch => GetHeaderValues("If-None-Match");
    public IEnumerable<string> IfModifiedSince => GetHeaderValues("If-Modified-Since");
    public IEnumerable<string> IfMatch => GetHeaderValues("If-Match");

    private IEnumerable<string> GetHeaderValues(string headerName)
    {
        if (_headers.TryGetValue(headerName, out var values))
        {
            return values.Where(v => !string.IsNullOrEmpty(v))!;
        }
        return Enumerable.Empty<string>();
    }
}

/// <summary>
/// Adapter that wraps ASP.NET Core HttpResponse headers for use with the application layer caching service.
/// </summary>
public class HttpResponseHeadersAdapter : IHttpResponseHeaders
{
    private readonly IHeaderDictionary _headers;

    public HttpResponseHeadersAdapter(IHeaderDictionary headers)
    {
        _headers = headers ?? throw new ArgumentNullException(nameof(headers));
    }

    public string? CacheControl
    {
        get => GetHeaderValue("Cache-Control");
        set => SetHeaderValue("Cache-Control", value);
    }

    public string? Pragma
    {
        get => GetHeaderValue("Pragma");
        set => SetHeaderValue("Pragma", value);
    }

    public string? Expires
    {
        get => GetHeaderValue("Expires");
        set => SetHeaderValue("Expires", value);
    }

    public string? Vary
    {
        get => GetHeaderValue("Vary");
        set => SetHeaderValue("Vary", value);
    }

    public string? ETag
    {
        get => GetHeaderValue("ETag");
        set => SetHeaderValue("ETag", value);
    }

    public string? LastModified
    {
        get => GetHeaderValue("Last-Modified");
        set => SetHeaderValue("Last-Modified", value);
    }

    private string? GetHeaderValue(string headerName)
    {
        return _headers.TryGetValue(headerName, out var values) ? values.FirstOrDefault() : null;
    }

    private void SetHeaderValue(string headerName, string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            _headers.Remove(headerName);
        }
        else
        {
            _headers[headerName] = value;
        }
    }
}

/// <summary>
/// Extension methods for HTTP caching functionality in ASP.NET Core controllers.
/// Provides bridge between application layer abstractions and ASP.NET Core HTTP types.
/// </summary>
public static class HttpCachingExtensions
{
    /// <summary>
    /// Extension method to easily set user resource cache headers.
    /// </summary>
    public static void SetUserResourceCache(this HttpResponse response, IHttpCachingService cachingService, bool isCurrentUser, int? maxAgeSeconds = null)
    {
        var responseHeaders = new HttpResponseHeadersAdapter(response.Headers);
        cachingService.SetUserResourceCacheHeaders(responseHeaders, isCurrentUser, maxAgeSeconds);
    }

    /// <summary>
    /// Extension method to easily set collection cache headers.
    /// </summary>
    public static void SetCollectionCache(this HttpResponse response, IHttpCachingService cachingService, int? maxAgeSeconds = null)
    {
        var responseHeaders = new HttpResponseHeadersAdapter(response.Headers);
        cachingService.SetUserCollectionCacheHeaders(responseHeaders, maxAgeSeconds);
    }

    /// <summary>
    /// Extension method to easily set search results cache headers.
    /// </summary>
    public static void SetSearchResultsCache(this HttpResponse response, IHttpCachingService cachingService, int? maxAgeSeconds = null)
    {
        var responseHeaders = new HttpResponseHeadersAdapter(response.Headers);
        cachingService.SetSearchResultsCacheHeaders(responseHeaders, maxAgeSeconds);
    }

    /// <summary>
    /// Extension method to easily set admin resource cache headers.
    /// </summary>
    public static void SetAdminResourceCache(this HttpResponse response, IHttpCachingService cachingService, int? maxAgeSeconds = null)
    {
        var responseHeaders = new HttpResponseHeadersAdapter(response.Headers);
        cachingService.SetAdminResourceCacheHeaders(responseHeaders, maxAgeSeconds);
    }

    /// <summary>
    /// Extension method to easily set no-cache headers.
    /// </summary>
    public static void SetNoCache(this HttpResponse response, IHttpCachingService cachingService)
    {
        var responseHeaders = new HttpResponseHeadersAdapter(response.Headers);
        cachingService.SetNoCacheHeaders(responseHeaders);
    }

    /// <summary>
    /// Extension method to set entity headers (ETag and Last-Modified).
    /// </summary>
    public static void SetEntityHeaders(this HttpResponse response, IHttpCachingService cachingService, string etag, DateTime? lastModified = null)
    {
        var responseHeaders = new HttpResponseHeadersAdapter(response.Headers);
        cachingService.SetEntityHeaders(responseHeaders, etag, lastModified);
    }

    /// <summary>
    /// Extension method to handle conditional GET requests.
    /// </summary>
    public static ActionResult? HandleConditionalGet(this HttpRequest request, HttpResponse response, IHttpCachingService cachingService, string currentETag, DateTime? lastModified = null)
    {
        var requestHeaders = new HttpRequestHeadersAdapter(request.Headers);
        var responseHeaders = new HttpResponseHeadersAdapter(response.Headers);
        
        var result = cachingService.HandleConditionalGet(requestHeaders, responseHeaders, currentETag, lastModified);
        if (result != null)
        {
            if (result.StatusCode == 304)
            {
                return new StatusCodeResult(304);
            }
        }
        
        return null;
    }

    /// <summary>
    /// Extension method to validate conditional update requests.
    /// </summary>
    public static ActionResult? ValidateConditionalUpdate(this HttpRequest request, IHttpCachingService cachingService, string currentETag)
    {
        var requestHeaders = new HttpRequestHeadersAdapter(request.Headers);
        
        var result = cachingService.ValidateConditionalUpdate(requestHeaders, currentETag);
        if (result != null)
        {
            if (result.StatusCode == 412)
            {
                return new ObjectResult(result.Content)
                {
                    StatusCode = 412
                };
            }
        }
        
        return null;
    }
}