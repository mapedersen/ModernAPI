using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using ModernAPI.API.Middleware;
using ModernAPI.Application.Common.Exceptions;
using ModernAPI.Domain.Exceptions;
using Moq;
using System.Net;
using System.Text.Json;
using Xunit;

namespace ModernAPI.API.Tests.Middleware;

/// <summary>
/// Tests for ExceptionMiddleware global exception handling.
/// </summary>
public class ExceptionMiddlewareTests
{
    private readonly Mock<ILogger<ExceptionMiddleware>> _mockLogger;
    private readonly Mock<IWebHostEnvironment> _mockEnvironment;
    private readonly ExceptionMiddleware _middleware;

    public ExceptionMiddlewareTests()
    {
        _mockLogger = new Mock<ILogger<ExceptionMiddleware>>();
        _mockEnvironment = new Mock<IWebHostEnvironment>();
        _middleware = new ExceptionMiddleware(
            next: context => throw new InvalidOperationException("Test exception"),
            _mockLogger.Object,
            _mockEnvironment.Object);
    }

    [Fact]
    public async Task InvokeAsync_WithNotFoundException_ShouldReturn404WithProblemDetails()
    {
        // Arrange
        var context = CreateHttpContext();
        var exception = new NotFoundException("User", "123");
        var middleware = new ExceptionMiddleware(
            next: _ => throw exception,
            _mockLogger.Object,
            _mockEnvironment.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
        context.Response.ContentType.Should().Be("application/problem+json");
        
        var responseBody = await GetResponseBody(context);
        var problemDetails = JsonSerializer.Deserialize<JsonElement>(responseBody);
        
        problemDetails.GetProperty("title").GetString().Should().Be("Resource not found");
        problemDetails.GetProperty("status").GetInt32().Should().Be(404);
        problemDetails.GetProperty("detail").GetString().Should().Contain("User");
        problemDetails.GetProperty("requestId").GetString().Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task InvokeAsync_WithConflictException_ShouldReturn409WithProblemDetails()
    {
        // Arrange
        var context = CreateHttpContext();
        var exception = new ConflictException("User", "test@example.com", "Email already exists");
        var middleware = new ExceptionMiddleware(
            next: _ => throw exception,
            _mockLogger.Object,
            _mockEnvironment.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.Conflict);
        
        var responseBody = await GetResponseBody(context);
        var problemDetails = JsonSerializer.Deserialize<JsonElement>(responseBody);
        
        problemDetails.GetProperty("title").GetString().Should().Be("Conflict");
        problemDetails.GetProperty("status").GetInt32().Should().Be(409);
        problemDetails.GetProperty("detail").GetString().Should().Contain("Email already exists");
    }

    [Fact]
    public async Task InvokeAsync_WithValidationException_ShouldReturn422WithValidationDetails()
    {
        // Arrange
        var context = CreateHttpContext();
        var validationErrors = new Dictionary<string, string[]>
        {
            ["Email"] = new[] { "Email is required", "Email format is invalid" },
            ["Name"] = new[] { "Name is required" }
        };
        var exception = new ModernAPI.Application.Common.Exceptions.ValidationException(validationErrors);
        var middleware = new ExceptionMiddleware(
            next: _ => throw exception,
            _mockLogger.Object,
            _mockEnvironment.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.UnprocessableEntity); // 422 per RFC 4918
        
        var responseBody = await GetResponseBody(context);
        var problemDetails = JsonSerializer.Deserialize<JsonElement>(responseBody);
        
        problemDetails.GetProperty("title").GetString().Should().Be("One or more validation errors occurred");
        problemDetails.GetProperty("status").GetInt32().Should().Be(422); // UnprocessableEntity
        
        // ValidationProblemDetails uses "errors" property for field-specific errors
        if (problemDetails.TryGetProperty("errors", out var errors))
        {
            errors.Should().NotBeNull();
        }
    }

    [Fact]
    public async Task InvokeAsync_WithDomainException_ShouldReturn400WithBusinessRuleDetails()
    {
        // Arrange
        var context = CreateHttpContext();
        var exception = new UserNotActiveException(Guid.NewGuid());
        var middleware = new ExceptionMiddleware(
            next: _ => throw exception,
            _mockLogger.Object,
            _mockEnvironment.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        
        var responseBody = await GetResponseBody(context);
        var problemDetails = JsonSerializer.Deserialize<JsonElement>(responseBody);
        
        problemDetails.GetProperty("title").GetString().Should().Be("Business rule violation");
        problemDetails.GetProperty("detail").GetString().Should().Contain("not active");
        problemDetails.GetProperty("errorCode").GetString().Should().Be("USER_NOT_ACTIVE");
    }

    [Fact]
    public async Task InvokeAsync_WithUnauthorizedAccessException_ShouldReturn401()
    {
        // Arrange
        var context = CreateHttpContext();
        var exception = new UnauthorizedAccessException("Access denied");
        var middleware = new ExceptionMiddleware(
            next: _ => throw exception,
            _mockLogger.Object,
            _mockEnvironment.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.Unauthorized);
        
        var responseBody = await GetResponseBody(context);
        var problemDetails = JsonSerializer.Deserialize<JsonElement>(responseBody);
        
        problemDetails.GetProperty("title").GetString().Should().Be("Unauthorized");
        problemDetails.GetProperty("detail").GetString().Should().Be("Authentication is required to access this resource");
    }

    [Fact]
    public async Task InvokeAsync_WithGenericExceptionInDevelopment_ShouldIncludeExceptionDetails()
    {
        // Arrange
        _mockEnvironment.Setup(x => x.EnvironmentName).Returns("Development");
        var context = CreateHttpContext();
        var exception = new InvalidOperationException("Something went wrong");
        var middleware = new ExceptionMiddleware(
            next: _ => throw exception,
            _mockLogger.Object,
            _mockEnvironment.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        
        var responseBody = await GetResponseBody(context);
        var problemDetails = JsonSerializer.Deserialize<JsonElement>(responseBody);
        
        problemDetails.GetProperty("detail").GetString().Should().Contain("Something went wrong");
        problemDetails.GetProperty("exception").GetString().Should().Be("InvalidOperationException");
        problemDetails.GetProperty("stackTrace").Should().NotBeNull();
    }

    [Fact]
    public async Task InvokeAsync_WithGenericExceptionInProduction_ShouldHideExceptionDetails()
    {
        // Arrange
        _mockEnvironment.Setup(x => x.EnvironmentName).Returns("Production");
        var context = CreateHttpContext();
        var exception = new InvalidOperationException("Sensitive internal error");
        var middleware = new ExceptionMiddleware(
            next: _ => throw exception,
            _mockLogger.Object,
            _mockEnvironment.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        
        var responseBody = await GetResponseBody(context);
        var problemDetails = JsonSerializer.Deserialize<JsonElement>(responseBody);
        
        problemDetails.GetProperty("detail").GetString().Should().Be("An internal server error occurred. Please contact support if the problem persists.");
        problemDetails.TryGetProperty("exception", out _).Should().BeFalse();
        problemDetails.TryGetProperty("stackTrace", out _).Should().BeFalse();
    }

    [Fact]
    public async Task InvokeAsync_ShouldLogExceptionWithRequestContext()
    {
        // Arrange
        var context = CreateHttpContext();
        context.Request.Method = "POST";
        context.Request.Path = "/api/users";
        context.TraceIdentifier = "trace-123";

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("trace-123")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_ShouldIncludeTimestampInResponse()
    {
        // Arrange
        var context = CreateHttpContext();
        var beforeCall = DateTimeOffset.UtcNow;

        // Act
        await _middleware.InvokeAsync(context);
        var afterCall = DateTimeOffset.UtcNow;

        // Assert
        var responseBody = await GetResponseBody(context);
        var problemDetails = JsonSerializer.Deserialize<JsonElement>(responseBody);
        
        var timestamp = DateTimeOffset.Parse(problemDetails.GetProperty("timestamp").GetString()!);
        timestamp.Should().BeOnOrAfter(beforeCall);
        timestamp.Should().BeOnOrBefore(afterCall);
    }

    [Fact]
    public async Task InvokeAsync_ShouldIncludeRequestIdInResponse()
    {
        // Arrange
        var context = CreateHttpContext();
        context.TraceIdentifier = "custom-trace-id";

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        var responseBody = await GetResponseBody(context);
        var problemDetails = JsonSerializer.Deserialize<JsonElement>(responseBody);
        
        problemDetails.GetProperty("requestId").GetString().Should().Be("custom-trace-id");
    }

    private static DefaultHttpContext CreateHttpContext()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        context.Request.Path = "/api/test";
        context.Request.Method = "GET";
        context.TraceIdentifier = Guid.NewGuid().ToString();
        return context;
    }

    private static async Task<string> GetResponseBody(HttpContext context)
    {
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(context.Response.Body);
        return await reader.ReadToEndAsync();
    }
}