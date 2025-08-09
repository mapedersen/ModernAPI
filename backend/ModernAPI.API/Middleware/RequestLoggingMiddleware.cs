using System.Diagnostics;
using Serilog.Context;

namespace ModernAPI.API.Middleware;

/// <summary>
/// Middleware that logs HTTP requests and responses with correlation IDs and performance metrics.
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;
    private static readonly ActivitySource ActivitySource = new("ModernAPI.RequestLogging");
    private static readonly HashSet<string> SensitiveHeaders = new(StringComparer.OrdinalIgnoreCase)
    {
        "Authorization",
        "Cookie",
        "Set-Cookie",
        "X-Api-Key"
    };

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next ?? throw new ArgumentNullException(nameof(next));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip logging for health checks and metrics endpoints
        if (context.Request.Path.StartsWithSegments("/health") ||
            context.Request.Path.StartsWithSegments("/metrics"))
        {
            await _next(context);
            return;
        }

        // Generate or extract correlation ID
        var correlationId = GetOrCreateCorrelationId(context);
        
        // Add correlation ID to response headers
        context.Response.Headers.TryAdd("X-Correlation-Id", correlationId);

        // Create activity for distributed tracing
        using var activity = Activity.Current ?? ActivitySource.StartActivity("HTTP " + context.Request.Method);
        activity?.SetTag("http.method", context.Request.Method);
        activity?.SetTag("http.url", context.Request.Path);
        activity?.SetTag("correlation.id", correlationId);

        // Push correlation ID to Serilog context
        using (LogContext.PushProperty("CorrelationId", correlationId))
        using (LogContext.PushProperty("RequestPath", context.Request.Path))
        using (LogContext.PushProperty("RequestMethod", context.Request.Method))
        {
            var stopwatch = Stopwatch.StartNew();
            var requestBody = string.Empty;

            // Log request
            try
            {
                // Capture request body for POST/PUT/PATCH
                if (HttpMethods.IsPost(context.Request.Method) ||
                    HttpMethods.IsPut(context.Request.Method) ||
                    HttpMethods.IsPatch(context.Request.Method))
                {
                    requestBody = await CaptureRequestBody(context.Request);
                }

                LogRequest(context, requestBody);

                // Call next middleware
                await _next(context);

                // Log successful response
                LogResponse(context, stopwatch.ElapsedMilliseconds, correlationId);
            }
            catch (Exception ex)
            {
                // Log error response
                LogError(context, ex, stopwatch.ElapsedMilliseconds, correlationId);
                throw;
            }
            finally
            {
                activity?.SetTag("http.status_code", context.Response.StatusCode);
                activity?.SetTag("http.duration_ms", stopwatch.ElapsedMilliseconds);
            }
        }
    }

    private string GetOrCreateCorrelationId(HttpContext context)
    {
        // Check for existing correlation ID in headers
        if (context.Request.Headers.TryGetValue("X-Correlation-Id", out var correlationId) &&
            !string.IsNullOrWhiteSpace(correlationId))
        {
            return correlationId.ToString();
        }

        // Check for trace ID from distributed tracing
        if (Activity.Current?.TraceId.ToString() is { } traceId && !string.IsNullOrWhiteSpace(traceId))
        {
            return traceId;
        }

        // Generate new correlation ID
        return Guid.NewGuid().ToString();
    }

    private async Task<string> CaptureRequestBody(HttpRequest request)
    {
        // Don't capture large requests or binary content
        if (request.ContentLength > 100_000 || // 100KB limit
            request.ContentType?.Contains("multipart/form-data", StringComparison.OrdinalIgnoreCase) == true ||
            request.ContentType?.Contains("application/octet-stream", StringComparison.OrdinalIgnoreCase) == true)
        {
            return "[Binary or Large Content]";
        }

        request.EnableBuffering();
        
        try
        {
            using var reader = new StreamReader(
                request.Body,
                encoding: System.Text.Encoding.UTF8,
                detectEncodingFromByteOrderMarks: false,
                bufferSize: 1024,
                leaveOpen: true);
            
            var body = await reader.ReadToEndAsync();
            request.Body.Position = 0;
            
            // Mask sensitive data
            return MaskSensitiveData(body);
        }
        catch
        {
            request.Body.Position = 0;
            return "[Error reading body]";
        }
    }

    private string MaskSensitiveData(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return content;

        // Mask password fields
        content = System.Text.RegularExpressions.Regex.Replace(
            content,
            @"""password""\s*:\s*""[^""]*""",
            @"""password"":""***""",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        // Mask token fields
        content = System.Text.RegularExpressions.Regex.Replace(
            content,
            @"""(access_?token|refresh_?token|token)""\s*:\s*""[^""]*""",
            @"""$1"":""***""",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        return content;
    }

    private void LogRequest(HttpContext context, string requestBody)
    {
        var headers = context.Request.Headers
            .Where(h => !SensitiveHeaders.Contains(h.Key))
            .ToDictionary(h => h.Key, h => h.Value.ToString());

        _logger.LogInformation("HTTP Request started: {Method} {Path} {QueryString} from {RemoteIp}",
            context.Request.Method,
            context.Request.Path,
            context.Request.QueryString,
            context.Connection.RemoteIpAddress);

        _logger.LogDebug("Request details: Headers: {@Headers}, Body: {Body}",
            headers,
            requestBody);
    }

    private void LogResponse(HttpContext context, long elapsedMs, string correlationId)
    {
        var level = context.Response.StatusCode >= 400 ? LogLevel.Warning : LogLevel.Information;
        
        _logger.Log(level, 
            "HTTP Request completed: {Method} {Path} responded {StatusCode} in {ElapsedMs}ms (CorrelationId: {CorrelationId})",
            context.Request.Method,
            context.Request.Path,
            context.Response.StatusCode,
            elapsedMs,
            correlationId);
    }

    private void LogError(HttpContext context, Exception ex, long elapsedMs, string correlationId)
    {
        _logger.LogError(ex,
            "HTTP Request failed: {Method} {Path} after {ElapsedMs}ms (CorrelationId: {CorrelationId})",
            context.Request.Method,
            context.Request.Path,
            elapsedMs,
            correlationId);
    }
}