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
            _logger.LogError(ex, "An unhandled exception occurred while processing request {Method} {Path}",
                context.Request.Method, context.Request.Path);

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
                Detail = "You are not authorized to access this resource",
                Instance = context.Request.Path
            },

            ArgumentException argEx => new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                Title = "Invalid argument",
                Status = (int)HttpStatusCode.BadRequest,
                Detail = argEx.Message,
                Instance = context.Request.Path
            },

            // Generic exceptions
            _ => CreateGenericProblemDetails(exception, context)
        };

        // Add request ID for correlation
        problemDetails.Extensions["requestId"] = context.TraceIdentifier;

        // Add timestamp
        problemDetails.Extensions["timestamp"] = DateTimeOffset.UtcNow;

        return problemDetails;
    }

    /// <summary>
    /// Creates validation problem details for FluentValidation exceptions.
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
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "One or more validation errors occurred",
            Status = (int)HttpStatusCode.BadRequest,
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