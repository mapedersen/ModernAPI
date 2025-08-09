using Microsoft.AspNetCore.Mvc;
using ModernAPI.Application.Common.Exceptions;
using ModernAPI.Domain.Exceptions;
using System.Net;
using System.Text.Json;

namespace ModernAPI.API.Middleware;

/// <summary>
/// Global exception handling middleware that catches unhandled exceptions
/// and converts them to appropriate HTTP responses using RFC 7807 Problem Details.
/// </summary>
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    /// <summary>
    /// Initializes the exception middleware.
    /// </summary>
    /// <param name="next">The next middleware in the pipeline</param>
    /// <param name="logger">Logger for exception details</param>
    /// <param name="environment">Web host environment information</param>
    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    /// <summary>
    /// Processes the HTTP request and handles any exceptions that occur.
    /// </summary>
    /// <param name="context">The HTTP context</param>
    /// <returns>Task representing the async operation</returns>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            // Enhanced logging with more context
            using var logScope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["RequestId"] = context.TraceIdentifier,
                ["RequestPath"] = context.Request.Path,
                ["RequestMethod"] = context.Request.Method,
                ["UserAgent"] = context.Request.Headers.UserAgent.ToString(),
                ["RemoteIpAddress"] = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
                ["UserId"] = context.User?.Identity?.Name ?? "Anonymous"
            });

            _logger.LogError(ex, 
                "Unhandled exception occurred. RequestId: {RequestId}, Path: {Method} {Path}, User: {User}",
                context.TraceIdentifier, context.Request.Method, context.Request.Path, 
                context.User?.Identity?.Name ?? "Anonymous");

            await HandleExceptionAsync(context, ex);
        }
    }

    /// <summary>
    /// Converts exceptions to appropriate HTTP responses with Problem Details format.
    /// </summary>
    /// <param name="context">The HTTP context</param>
    /// <param name="exception">The exception to handle</param>
    /// <returns>Task representing the async operation</returns>
    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var problemDetails = CreateProblemDetails(exception, context);

        context.Response.StatusCode = problemDetails.Status ?? (int)HttpStatusCode.InternalServerError;
        
        // Add security headers to prevent information disclosure
        context.Response.Headers["X-Content-Type-Options"] = "nosniff";
        context.Response.Headers["X-Frame-Options"] = "DENY";
        context.Response.ContentType = "application/problem+json";

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        var json = JsonSerializer.Serialize(problemDetails, options);
        await context.Response.WriteAsync(json);
    }

    /// <summary>
    /// Creates appropriate Problem Details based on the exception type.
    /// </summary>
    /// <param name="exception">The exception to convert</param>
    /// <param name="context">The HTTP context</param>
    /// <returns>Problem details object</returns>
    private ProblemDetails CreateProblemDetails(Exception exception, HttpContext context)
    {
        var problemDetails = exception switch
        {
            // Application layer exceptions
            NotFoundException notFoundEx => new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
                Title = "Resource not found",
                Status = (int)HttpStatusCode.NotFound,
                Detail = notFoundEx.Message,
                Instance = context.Request.Path
            },

            ConflictException conflictEx => new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.8",
                Title = "Conflict",
                Status = (int)HttpStatusCode.Conflict,
                Detail = conflictEx.Message,
                Instance = context.Request.Path
            },

            PreconditionFailedException preconditionEx => new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.10",
                Title = "Precondition Failed",
                Status = (int)HttpStatusCode.PreconditionFailed, // 412
                Detail = preconditionEx.Message,
                Instance = context.Request.Path
            },

            ModernAPI.Application.Common.Exceptions.ValidationException validationEx => CreateValidationProblemDetails(validationEx, context),

            // Domain layer exceptions
            DomainException domainEx => new ProblemDetails
            {
                Type = $"https://modernapi.example.com/problems/domain/{domainEx.ErrorCode.ToLowerInvariant()}",
                Title = "Business rule violation",
                Status = (int)HttpStatusCode.BadRequest,
                Detail = domainEx.Message,
                Instance = context.Request.Path,
                Extensions = { ["errorCode"] = domainEx.ErrorCode }
            },

            // Framework exceptions
            UnauthorizedAccessException => new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7235#section-3.1",
                Title = "Unauthorized",
                Status = (int)HttpStatusCode.Unauthorized,
                Detail = "Authentication is required to access this resource",
                Instance = context.Request.Path
            },

            ArgumentException argEx => new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                Title = "Bad Request",
                Status = (int)HttpStatusCode.BadRequest,
                Detail = argEx.Message,
                Instance = context.Request.Path
            },
            
            // Task cancellation (client disconnected)
            TaskCanceledException => new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.8",
                Title = "Request Cancelled",
                Status = (int)HttpStatusCode.RequestTimeout, // 408
                Detail = "The request was cancelled",
                Instance = context.Request.Path
            },
            
            OperationCanceledException => new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.8",
                Title = "Operation Cancelled",
                Status = (int)HttpStatusCode.RequestTimeout, // 408
                Detail = "The operation was cancelled",
                Instance = context.Request.Path
            },

            // Generic exceptions
            _ => CreateGenericProblemDetails(exception, context)
        };

        // Add request ID for correlation
        problemDetails.Extensions["requestId"] = context.TraceIdentifier;

        // Add timestamp
        problemDetails.Extensions["timestamp"] = DateTimeOffset.UtcNow;
        
        // Add trace ID for distributed tracing (if available)
        if (context.Request.Headers.TryGetValue("X-Trace-Id", out var traceId))
        {
            problemDetails.Extensions["traceId"] = traceId.ToString();
        }

        return problemDetails;
    }

    /// <summary>
    /// Creates validation problem details for FluentValidation exceptions.
    /// Uses 422 Unprocessable Entity for validation errors as per RFC 4918.
    /// </summary>
    /// <param name="validationException">The validation exception</param>
    /// <param name="context">The HTTP context</param>
    /// <returns>Validation problem details</returns>
    private static ValidationProblemDetails CreateValidationProblemDetails(
        ModernAPI.Application.Common.Exceptions.ValidationException validationException,
        HttpContext context)
    {
        var problemDetails = new ValidationProblemDetails(validationException.ValidationErrors)
        {
            Type = "https://tools.ietf.org/html/rfc4918#section-11.2",
            Title = "One or more validation errors occurred",
            Status = (int)HttpStatusCode.UnprocessableEntity, // 422
            Instance = context.Request.Path
        };

        return problemDetails;
    }

    /// <summary>
    /// Creates problem details for unhandled exceptions.
    /// </summary>
    /// <param name="exception">The unhandled exception</param>
    /// <param name="context">The HTTP context</param>
    /// <returns>Generic problem details</returns>
    private ProblemDetails CreateGenericProblemDetails(Exception exception, HttpContext context)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
            Title = "An error occurred while processing your request",
            Status = (int)HttpStatusCode.InternalServerError,
            Instance = context.Request.Path
        };

        // Include exception details only in development
        if (_environment.IsDevelopment())
        {
            problemDetails.Detail = exception.Message;
            problemDetails.Extensions["exception"] = exception.GetType().Name;
            problemDetails.Extensions["stackTrace"] = exception.StackTrace;

            // Include inner exception details if present
            if (exception.InnerException != null)
            {
                problemDetails.Extensions["innerException"] = new
                {
                    type = exception.InnerException.GetType().Name,
                    message = exception.InnerException.Message,
                    stackTrace = exception.InnerException.StackTrace
                };
            }
        }
        else
        {
            problemDetails.Detail = "An internal server error occurred. Please contact support if the problem persists.";
        }

        return problemDetails;
    }
}

/// <summary>
/// Extension methods for registering the exception middleware.
/// </summary>
public static class ExceptionMiddlewareExtensions
{
    /// <summary>
    /// Adds the global exception handling middleware to the pipeline.
    /// </summary>
    /// <param name="app">The application builder</param>
    /// <returns>The application builder for method chaining</returns>
    public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app)
    {
        return app.UseMiddleware<ExceptionMiddleware>();
    }
}