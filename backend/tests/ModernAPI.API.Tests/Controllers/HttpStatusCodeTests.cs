using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ModernAPI.API.Controllers;
using ModernAPI.API.Middleware;
using ModernAPI.API.Monitoring;
using ModernAPI.API.Services;
using ModernAPI.API.Tests.Common;
using ModernAPI.Application.Common.Exceptions;
using ModernAPI.Application.DTOs;
using ModernAPI.Application.Interfaces;
using ModernAPI.Application.Services;
using ModernAPI.Domain.Exceptions;
using Moq;
using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Xunit;

namespace ModernAPI.API.Tests.Controllers;

/// <summary>
/// Comprehensive tests for HTTP status code standardization across all API endpoints.
/// Ensures compliance with REST principles and RFC 7807 Problem Details format.
/// </summary>
public class HttpStatusCodeTests : ApiTestBase
{
    private readonly UsersController _usersController;
    private readonly AuthController _authController;
    private readonly Mock<ILogger<UsersController>> _mockUsersLogger;
    private readonly Mock<ILogger<AuthController>> _mockAuthLogger;
    private readonly Mock<ILinkGenerator> _mockLinkGenerator;
    private readonly Mock<IHttpCachingService> _mockCachingService;
    private readonly Mock<IETagService> _mockETagService;
    private readonly Mock<IAuthService> _mockAuthService;

    public HttpStatusCodeTests()
    {
        _mockUsersLogger = CreateMockLogger<UsersController>();
        _mockAuthLogger = CreateMockLogger<AuthController>();
        _mockLinkGenerator = new Mock<ILinkGenerator>();
        _mockCachingService = new Mock<IHttpCachingService>();
        _mockETagService = new Mock<IETagService>();
        _mockAuthService = new Mock<IAuthService>();

        _usersController = new UsersController(
            MockUserService.Object, 
            _mockUsersLogger.Object, 
            _mockLinkGenerator.Object,
            _mockCachingService.Object,
            _mockETagService.Object);

        _authController = new AuthController(
            _mockAuthService.Object,
            _mockAuthLogger.Object,
            new Mock<AuthenticationMetrics>().Object);

        // Set up HTTP context for controllers
        SetupControllerContext(_usersController);
        SetupControllerContext(_authController);
    }

    #region Success Status Code Tests (2xx)

    [Fact]
    public async Task GetUser_WithValidId_ShouldReturn200OK()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var userDto = CreateValidUserDto(userId);
        MockUserService.Setup(x => x.GetUserByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userDto);

        // Act
        var result = await _usersController.GetUser(userId);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        okResult.Value.Should().BeEquivalentTo(userDto);
    }

    [Fact]
    public async Task CreateUser_WithValidRequest_ShouldReturn201Created()
    {
        // Arrange
        var request = CreateValidCreateUserRequest();
        var response = CreateValidUserResponse();
        MockUserService.Setup(x => x.CreateUserAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);

        // Act
        var result = await _usersController.CreateUser(request);

        // Assert
        result.Result.Should().BeOfType<CreatedAtActionResult>();
        var createdResult = result.Result as CreatedAtActionResult;
        createdResult!.StatusCode.Should().Be(StatusCodes.Status201Created);
        createdResult.ActionName.Should().Be(nameof(UsersController.GetUser));
        createdResult.Value.Should().BeEquivalentTo(response);
        
        // Verify Location header is set
        createdResult.RouteValues.Should().ContainKey("id");
        createdResult.RouteValues!["id"].Should().Be(response.User.Id);
    }

    [Fact]
    public async Task DeleteUser_WithValidId_ShouldReturn204NoContent()
    {
        // Arrange
        var userId = Guid.NewGuid();
        MockUserService.Setup(x => x.DeactivateUserAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(CreateValidOperationResult());

        // Act
        var result = await _usersController.DeleteUser(userId);

        // Assert
        result.Should().BeOfType<NoContentResult>();
        var noContentResult = result as NoContentResult;
        noContentResult!.StatusCode.Should().Be(StatusCodes.Status204NoContent);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturn200OK()
    {
        // Arrange
        var request = new LoginRequest("test@example.com", "password123");
        var response = CreateValidAuthResponse();
        _mockAuthService.Setup(x => x.LoginAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);

        // Act
        var result = await _authController.Login(request, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
        var okResult = result.Result as OkObjectResult;
        okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);
        okResult.Value.Should().BeEquivalentTo(response);
    }

    [Fact]
    public async Task Register_WithValidRequest_ShouldReturn201Created()
    {
        // Arrange
        var request = new RegisterRequest("newuser@example.com", "Password123!", "Password123!", "New User", null, null);
        var response = CreateValidAuthResponse();
        _mockAuthService.Setup(x => x.RegisterAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);

        // Act
        var result = await _authController.Register(request, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<CreatedAtActionResult>();
        var createdResult = result.Result as CreatedAtActionResult;
        createdResult!.StatusCode.Should().Be(StatusCodes.Status201Created);
        createdResult.ActionName.Should().Be(nameof(AuthController.GetCurrentUser));
        createdResult.Value.Should().BeEquivalentTo(response);
    }

    #endregion

    #region Client Error Status Code Tests (4xx)

    [Fact]
    public async Task GetUser_WithNonExistentId_ShouldReturn404NotFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
        MockUserService.Setup(x => x.GetUserByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NotFoundException("User", userId.ToString()));

        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => 
            _usersController.GetUser(userId));
        
        exception.ResourceType.Should().Be("User");
        exception.ResourceId.Should().Be(userId.ToString());
    }

    [Fact]
    public async Task CreateUser_WithDuplicateEmail_ShouldReturn409Conflict()
    {
        // Arrange
        var request = CreateValidCreateUserRequest();
        MockUserService.Setup(x => x.CreateUserAsync(request, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ConflictException("User", request.Email, "A user with this email already exists"));

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() =>
            _usersController.CreateUser(request));
        
        exception.Resource.Should().Be("User");
        exception.ConflictingValue.Should().Be(request.Email);
    }

    [Fact]
    public async Task CreateUser_WithValidationErrors_ShouldReturn422UnprocessableEntity()
    {
        // Arrange
        var request = CreateValidCreateUserRequest();
        var validationErrors = new Dictionary<string, string[]>
        {
            ["Email"] = ["Email is required", "Email format is invalid"],
            ["DisplayName"] = ["Display name must be between 2 and 50 characters"]
        };
        
        MockUserService.Setup(x => x.CreateUserAsync(request, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ValidationException(validationErrors));

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            _usersController.CreateUser(request));
        
        exception.ValidationErrors.Should().BeEquivalentTo(validationErrors);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ShouldReturn401Unauthorized()
    {
        // Arrange
        var request = new LoginRequest("test@example.com", "wrongpassword");
        _mockAuthService.Setup(x => x.LoginAsync(request, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid credentials"));

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _authController.Login(request, CancellationToken.None));
        
        exception.Message.Should().Be("Invalid credentials");
    }

    [Fact]
    public async Task UpdateUser_WithETagMismatch_ShouldReturn412PreconditionFailed()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var request = new UpdateUserProfileRequest("Updated Name");
        var currentUser = CreateValidUserDto(userId);
        
        MockUserService.Setup(x => x.GetUserByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentUser);
        
        MockUserService.Setup(x => x.UpdateUserProfileAsync(userId, request, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new PreconditionFailedException("User", "ETag mismatch - resource has been modified"));

        // Setup conditional update validation to return precondition failed
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Headers["If-Match"] = "\"outdated-etag\"";
        _usersController.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<PreconditionFailedException>(() =>
            _usersController.UpdateUser(userId, request));
        
        exception.Resource.Should().Be("User");
        exception.Message.Should().Contain("ETag mismatch");
    }

    [Fact]
    public void BaseController_BadRequestResult_ShouldReturnProblemDetails()
    {
        // Arrange
        var controller = new TestableBaseController();
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Path = "/api/v1/test";
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        // Act
        var result = controller.TestBadRequestResult("Invalid request data");

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
        var badRequestResult = result as BadRequestObjectResult;
        badRequestResult!.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        
        var problemDetails = badRequestResult.Value as ProblemDetails;
        problemDetails.Should().NotBeNull();
        problemDetails!.Type.Should().Be("https://tools.ietf.org/html/rfc7231#section-6.5.1");
        problemDetails.Title.Should().Be("Bad Request");
        problemDetails.Status.Should().Be(StatusCodes.Status400BadRequest);
        problemDetails.Detail.Should().Be("Invalid request data");
        problemDetails.Instance.Should().Be("/api/v1/test");
    }

    [Fact]
    public void BaseController_ValidationErrorResult_ShouldReturn422WithValidationProblemDetails()
    {
        // Arrange
        var controller = new TestableBaseController();
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Path = "/api/v1/test";
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        var errors = new Dictionary<string, string[]>
        {
            ["Email"] = ["Email is required"],
            ["Password"] = ["Password must be at least 8 characters"]
        };

        // Act
        var result = controller.TestValidationErrorResult(errors);

        // Assert
        result.StatusCode.Should().Be(StatusCodes.Status422UnprocessableEntity);
        
        var validationProblemDetails = result.Value as ValidationProblemDetails;
        validationProblemDetails.Should().NotBeNull();
        validationProblemDetails!.Type.Should().Be("https://tools.ietf.org/html/rfc4918#section-11.2");
        validationProblemDetails.Title.Should().Be("One or more validation errors occurred");
        validationProblemDetails.Status.Should().Be(StatusCodes.Status422UnprocessableEntity);
        validationProblemDetails.Instance.Should().Be("/api/v1/test");
        validationProblemDetails.Errors.Should().BeEquivalentTo(errors);
    }

    [Fact]
    public void BaseController_ConflictResult_ShouldReturnProblemDetails()
    {
        // Arrange
        var controller = new TestableBaseController();
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Path = "/api/v1/test";
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        // Act
        var result = controller.TestConflictResult("Resource already exists");

        // Assert
        result.Should().BeOfType<ConflictObjectResult>();
        var conflictResult = result as ConflictObjectResult;
        conflictResult!.StatusCode.Should().Be(StatusCodes.Status409Conflict);
        
        var problemDetails = conflictResult.Value as ProblemDetails;
        problemDetails.Should().NotBeNull();
        problemDetails!.Type.Should().Be("https://tools.ietf.org/html/rfc7231#section-6.5.8");
        problemDetails.Title.Should().Be("Conflict");
        problemDetails.Status.Should().Be(StatusCodes.Status409Conflict);
        problemDetails.Detail.Should().Be("Resource already exists");
        problemDetails.Instance.Should().Be("/api/v1/test");
    }

    [Fact]
    public void BaseController_UnauthorizedResult_ShouldReturnProblemDetails()
    {
        // Arrange
        var controller = new TestableBaseController();
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Path = "/api/v1/test";
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        // Act
        var result = controller.TestUnauthorizedResult("Authentication required");

        // Assert
        result.Should().BeOfType<UnauthorizedObjectResult>();
        var unauthorizedResult = result as UnauthorizedObjectResult;
        unauthorizedResult!.StatusCode.Should().Be(StatusCodes.Status401Unauthorized);
        
        var problemDetails = unauthorizedResult.Value as ProblemDetails;
        problemDetails.Should().NotBeNull();
        problemDetails!.Type.Should().Be("https://tools.ietf.org/html/rfc7235#section-3.1");
        problemDetails.Title.Should().Be("Unauthorized");
        problemDetails.Status.Should().Be(StatusCodes.Status401Unauthorized);
        problemDetails.Detail.Should().Be("Authentication required");
        problemDetails.Instance.Should().Be("/api/v1/test");
    }

    [Fact]
    public void BaseController_ForbiddenResult_ShouldReturnProblemDetails()
    {
        // Arrange
        var controller = new TestableBaseController();
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Path = "/api/v1/test";
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        // Act
        var result = controller.TestForbiddenResult("Insufficient permissions");

        // Assert
        result.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        
        var problemDetails = result.Value as ProblemDetails;
        problemDetails.Should().NotBeNull();
        problemDetails!.Type.Should().Be("https://tools.ietf.org/html/rfc7231#section-6.5.3");
        problemDetails.Title.Should().Be("Forbidden");
        problemDetails.Status.Should().Be(StatusCodes.Status403Forbidden);
        problemDetails.Detail.Should().Be("Insufficient permissions");
        problemDetails.Instance.Should().Be("/api/v1/test");
    }

    [Fact]
    public void BaseController_PreconditionFailedResult_ShouldReturnProblemDetails()
    {
        // Arrange
        var controller = new TestableBaseController();
        var httpContext = new DefaultHttpContext();
        httpContext.Request.Path = "/api/v1/test";
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

        // Act
        var result = controller.TestPreconditionFailedResult("ETag mismatch");

        // Assert
        result.StatusCode.Should().Be(StatusCodes.Status412PreconditionFailed);
        
        var problemDetails = result.Value as ProblemDetails;
        problemDetails.Should().NotBeNull();
        problemDetails!.Type.Should().Be("https://tools.ietf.org/html/rfc7231#section-6.5.10");
        problemDetails.Title.Should().Be("Precondition Failed");
        problemDetails.Status.Should().Be(StatusCodes.Status412PreconditionFailed);
        problemDetails.Detail.Should().Be("ETag mismatch");
        problemDetails.Instance.Should().Be("/api/v1/test");
    }

    #endregion

    #region Exception Middleware Tests

    [Fact]
    public async Task ExceptionMiddleware_WithNotFoundException_ShouldReturn404WithProblemDetails()
    {
        // Arrange
        var exception = new NotFoundException("User", "123");
        var middleware = CreateExceptionMiddleware();
        var context = CreateHttpContext();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
        context.Response.ContentType.Should().Be("application/problem+json");
        
        // Verify response body contains Problem Details
        var responseBody = await GetResponseBody(context);
        var problemDetails = JsonSerializer.Deserialize<ProblemDetails>(responseBody, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        
        problemDetails.Should().NotBeNull();
        problemDetails!.Type.Should().Be("https://tools.ietf.org/html/rfc7231#section-6.5.4");
        problemDetails.Title.Should().Be("Resource not found");
        problemDetails.Status.Should().Be(404);
        problemDetails.Detail.Should().Contain("User with identifier '123' was not found");
    }

    [Fact]
    public async Task ExceptionMiddleware_WithValidationException_ShouldReturn422WithValidationProblemDetails()
    {
        // Arrange
        var validationErrors = new Dictionary<string, string[]>
        {
            ["Email"] = ["Email is required"],
            ["Password"] = ["Password is too short"]
        };
        var exception = new ValidationException(validationErrors);
        var middleware = CreateExceptionMiddleware();
        var context = CreateHttpContext();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.UnprocessableEntity);
        context.Response.ContentType.Should().Be("application/problem+json");
    }

    [Fact]
    public async Task ExceptionMiddleware_WithConflictException_ShouldReturn409WithProblemDetails()
    {
        // Arrange
        var exception = new ConflictException("User", "test@example.com");
        var middleware = CreateExceptionMiddleware();
        var context = CreateHttpContext();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.Conflict);
        context.Response.ContentType.Should().Be("application/problem+json");
    }

    [Fact]
    public async Task ExceptionMiddleware_WithPreconditionFailedException_ShouldReturn412WithProblemDetails()
    {
        // Arrange
        var exception = new PreconditionFailedException("User", "Resource has been modified");
        var middleware = CreateExceptionMiddleware();
        var context = CreateHttpContext();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.PreconditionFailed);
        context.Response.ContentType.Should().Be("application/problem+json");
    }

    [Fact]
    public async Task ExceptionMiddleware_WithUnauthorizedAccessException_ShouldReturn401WithProblemDetails()
    {
        // Arrange
        var exception = new UnauthorizedAccessException("Authentication required");
        var middleware = CreateExceptionMiddleware();
        var context = CreateHttpContext();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.Unauthorized);
        context.Response.ContentType.Should().Be("application/problem+json");
    }

    #endregion

    #region Helper Methods

    private void SetupControllerContext(ControllerBase controller)
    {
        var httpContext = new DefaultHttpContext();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity([
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Email, "test@example.com")
        ]));
        
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext
        };
    }

    private AuthResponse CreateValidAuthResponse()
    {
        var user = new UserDto(
            Guid.NewGuid(),
            "test@example.com",
            "Test User",
            "Test",
            "User",
            true,
            true,
            DateTime.UtcNow.AddDays(-30),
            DateTime.UtcNow
        );

        return new AuthResponse(
            "valid-access-token",
            "valid-refresh-token",
            DateTime.UtcNow.AddHours(1),
            DateTime.UtcNow.AddDays(7),
            user
        );
    }

    private UserDto CreateValidUserDto(Guid? id = null)
    {
        return new UserDto(
            id ?? Guid.NewGuid(),
            "test@example.com",
            "Test User",
            "Test",
            "User",
            true,
            true,
            DateTime.UtcNow.AddDays(-30),
            DateTime.UtcNow
        );
    }


    private OperationResult CreateValidOperationResult()
    {
        return new OperationResult(true, "Operation completed successfully");
    }

    private ExceptionMiddleware CreateExceptionMiddleware()
    {
        var requestDelegate = new RequestDelegate(_ => throw new NotImplementedException());
        var logger = new Mock<ILogger<ExceptionMiddleware>>().Object;
        var environment = new Mock<IWebHostEnvironment>().Object;
        
        return new ExceptionMiddleware(requestDelegate, logger, environment);
    }

    private DefaultHttpContext CreateHttpContext()
    {
        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/test";
        context.Request.Method = "GET";
        return context;
    }

    private async Task<string> GetResponseBody(HttpContext context)
    {
        context.Response.Body.Position = 0;
        using var reader = new StreamReader(context.Response.Body);
        return await reader.ReadToEndAsync();
    }

    #endregion
}

/// <summary>
/// Testable wrapper for BaseController to expose protected methods for testing.
/// </summary>
public class TestableBaseController : BaseController
{
    public BadRequestObjectResult TestBadRequestResult(string message) => BadRequestResult(message);
    public ObjectResult TestValidationErrorResult(IDictionary<string, string[]> errors) => ValidationErrorResult(errors);
    public ConflictObjectResult TestConflictResult(string message) => ConflictResult(message);
    public UnauthorizedObjectResult TestUnauthorizedResult(string message) => UnauthorizedResult(message);
    public ObjectResult TestForbiddenResult(string message) => ForbiddenResult(message);
    public ObjectResult TestPreconditionFailedResult(string message) => PreconditionFailedResult(message);
}