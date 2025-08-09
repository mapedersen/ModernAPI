using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using ModernAPI.Application.DTOs;
using ModernAPI.IntegrationTests.Common;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Xunit;

namespace ModernAPI.IntegrationTests.Controllers;

/// <summary>
/// Integration tests for HTTP status code compliance across the entire API pipeline.
/// Tests the complete request/response cycle including middleware, controllers, and exception handling.
/// </summary>
public class HttpStatusCodeIntegrationTests : IntegrationTestBase
{
    public HttpStatusCodeIntegrationTests(IntegrationTestWebApplicationFactory factory) : base(factory)
    {
    }

    #region Success Status Codes (2xx)

    [Fact]
    public async Task GET_Users_WithValidAuth_ShouldReturn200OK()
    {
        // Arrange
        await AuthenticateAsync();

        // Act
        var response = await HttpClient.GetAsync("/api/v1/users");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/json");
        
        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNullOrEmpty();
        
        // Verify response structure
        var hateoasCollection = JsonSerializer.Deserialize<HateoasCollectionDto<UserDto>>(content, JsonOptions);
        hateoasCollection.Should().NotBeNull();
        hateoasCollection!.Items.Should().NotBeNull();
    }

    [Fact]
    public async Task POST_Users_WithValidData_ShouldReturn201Created()
    {
        // Arrange
        var createRequest = new CreateUserRequest
        {
            Email = $"integration-test-{Guid.NewGuid():N}@example.com",
            DisplayName = "Integration Test User",
            Password = "TestPassword123!"
        };

        // Act
        var response = await HttpClient.PostAsJsonAsync("/api/v1/users", createRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        // Verify Location header is set
        response.Headers.Location.Should().NotBeNull();
        response.Headers.Location!.ToString().Should().Contain("/api/v1/users/");
        
        // Verify response body
        var content = await response.Content.ReadAsStringAsync();
        var userResponse = JsonSerializer.Deserialize<UserResponse>(content, JsonOptions);
        userResponse.Should().NotBeNull();
        userResponse!.User.Email.Should().Be(createRequest.Email);
        userResponse.User.DisplayName.Should().Be(createRequest.DisplayName);
    }

    [Fact]
    public async Task POST_Auth_Register_WithValidData_ShouldReturn201Created()
    {
        // Arrange
        var registerRequest = new RegisterRequest
        {
            Email = $"register-test-{Guid.NewGuid():N}@example.com",
            DisplayName = "Register Test User",
            Password = "RegisterPassword123!"
        };

        // Act
        var response = await HttpClient.PostAsJsonAsync("/api/v1/auth/register", registerRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        // Verify Location header is set for created resource
        response.Headers.Location.Should().NotBeNull();
        
        // Verify response body contains auth tokens
        var content = await response.Content.ReadAsStringAsync();
        var authResponse = JsonSerializer.Deserialize<AuthResponse>(content, JsonOptions);
        authResponse.Should().NotBeNull();
        authResponse!.AccessToken.Should().NotBeNullOrEmpty();
        authResponse.RefreshToken.Should().NotBeNullOrEmpty();
        authResponse.User.Email.Should().Be(registerRequest.Email);
    }

    [Fact]
    public async Task POST_Auth_Login_WithValidCredentials_ShouldReturn200OK()
    {
        // Arrange - First create a user
        var email = $"login-test-{Guid.NewGuid():N}@example.com";
        var password = "LoginPassword123!";
        
        await CreateTestUserAsync(email, "Login Test User", password);
        
        var loginRequest = new LoginRequest
        {
            Email = email,
            Password = password
        };

        // Act
        var response = await HttpClient.PostAsJsonAsync("/api/v1/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var authResponse = JsonSerializer.Deserialize<AuthResponse>(content, JsonOptions);
        authResponse.Should().NotBeNull();
        authResponse!.AccessToken.Should().NotBeNullOrEmpty();
        authResponse.RefreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task PUT_Users_WithValidData_ShouldReturn200OK()
    {
        // Arrange
        await AuthenticateAsync();
        var userId = await GetCurrentUserIdAsync();
        
        var updateRequest = new UpdateUserProfileRequest
        {
            DisplayName = "Updated Integration Test User"
        };

        // Act
        var response = await HttpClient.PutAsJsonAsync($"/api/v1/users/{userId}", updateRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var userResponse = JsonSerializer.Deserialize<UserResponse>(content, JsonOptions);
        userResponse.Should().NotBeNull();
        userResponse!.User.DisplayName.Should().Be(updateRequest.DisplayName);
    }

    #endregion

    #region Client Error Status Codes (4xx)

    [Fact]
    public async Task GET_Users_WithoutAuth_ShouldReturn401Unauthorized()
    {
        // Act (no authentication)
        var response = await HttpClient.GetAsync("/api/v1/users");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
        
        // Verify Problem Details format
        var content = await response.Content.ReadAsStringAsync();
        var problemDetails = JsonSerializer.Deserialize<ProblemDetails>(content, JsonOptions);
        problemDetails.Should().NotBeNull();
        problemDetails!.Type.Should().Be("https://tools.ietf.org/html/rfc7235#section-3.1");
        problemDetails.Title.Should().Be("Unauthorized");
        problemDetails.Status.Should().Be(401);
    }

    [Fact]
    public async Task GET_Users_WithNonExistentId_ShouldReturn404NotFound()
    {
        // Arrange
        await AuthenticateAsync();
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await HttpClient.GetAsync($"/api/v1/users/{nonExistentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
        
        // Verify Problem Details format
        var content = await response.Content.ReadAsStringAsync();
        var problemDetails = JsonSerializer.Deserialize<ProblemDetails>(content, JsonOptions);
        problemDetails.Should().NotBeNull();
        problemDetails!.Type.Should().Be("https://tools.ietf.org/html/rfc7231#section-6.5.4");
        problemDetails.Title.Should().Be("Resource not found");
        problemDetails.Status.Should().Be(404);
        problemDetails.Detail.Should().Contain(nonExistentId.ToString());
    }

    [Fact]
    public async Task POST_Users_WithDuplicateEmail_ShouldReturn409Conflict()
    {
        // Arrange
        var email = $"duplicate-test-{Guid.NewGuid():N}@example.com";
        
        // Create first user
        await CreateTestUserAsync(email, "First User", "Password123!");
        
        // Attempt to create second user with same email
        var duplicateRequest = new CreateUserRequest
        {
            Email = email,
            DisplayName = "Duplicate User",
            Password = "Password123!"
        };

        // Act
        var response = await HttpClient.PostAsJsonAsync("/api/v1/users", duplicateRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
        
        // Verify Problem Details format
        var content = await response.Content.ReadAsStringAsync();
        var problemDetails = JsonSerializer.Deserialize<ProblemDetails>(content, JsonOptions);
        problemDetails.Should().NotBeNull();
        problemDetails!.Type.Should().Be("https://tools.ietf.org/html/rfc7231#section-6.5.8");
        problemDetails.Title.Should().Be("Conflict");
        problemDetails.Status.Should().Be(409);
        problemDetails.Detail.Should().Contain("already exists");
    }

    [Fact]
    public async Task POST_Users_WithInvalidData_ShouldReturn422UnprocessableEntity()
    {
        // Arrange
        var invalidRequest = new CreateUserRequest
        {
            Email = "invalid-email", // Invalid email format
            DisplayName = "", // Empty display name
            Password = "123" // Password too short
        };

        // Act
        var response = await HttpClient.PostAsJsonAsync("/api/v1/users", invalidRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
        
        // Verify ValidationProblemDetails format
        var content = await response.Content.ReadAsStringAsync();
        var validationProblemDetails = JsonSerializer.Deserialize<ValidationProblemDetails>(content, JsonOptions);
        validationProblemDetails.Should().NotBeNull();
        validationProblemDetails!.Type.Should().Be("https://tools.ietf.org/html/rfc4918#section-11.2");
        validationProblemDetails.Title.Should().Be("One or more validation errors occurred");
        validationProblemDetails.Status.Should().Be(422);
        validationProblemDetails.Errors.Should().NotBeEmpty();
    }

    [Fact]
    public async Task POST_Auth_Login_WithInvalidCredentials_ShouldReturn401Unauthorized()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Email = "nonexistent@example.com",
            Password = "WrongPassword123!"
        };

        // Act
        var response = await HttpClient.PostAsJsonAsync("/api/v1/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
        
        // Verify Problem Details format
        var content = await response.Content.ReadAsStringAsync();
        var problemDetails = JsonSerializer.Deserialize<ProblemDetails>(content, JsonOptions);
        problemDetails.Should().NotBeNull();
        problemDetails!.Type.Should().Be("https://tools.ietf.org/html/rfc7235#section-3.1");
        problemDetails.Status.Should().Be(401);
    }

    [Fact]
    public async Task POST_Request_WithMalformedJson_ShouldReturn400BadRequest()
    {
        // Arrange
        var malformedJson = "{ \"email\": \"test@example.com\", \"displayName\": }"; // Missing value
        var content = new StringContent(malformedJson, Encoding.UTF8, "application/json");

        // Act
        var response = await HttpClient.PostAsync("/api/v1/users", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task PUT_Users_WithETagMismatch_ShouldReturn412PreconditionFailed()
    {
        // Arrange
        await AuthenticateAsync();
        var userId = await GetCurrentUserIdAsync();
        
        // Get current user to get ETag
        var getCurrentResponse = await HttpClient.GetAsync($"/api/v1/users/{userId}");
        getCurrentResponse.EnsureSuccessStatusCode();
        
        var updateRequest = new UpdateUserProfileRequest
        {
            DisplayName = "Updated Name"
        };

        // Add outdated If-Match header
        HttpClient.DefaultRequestHeaders.Add("If-Match", "\"outdated-etag-value\"");

        // Act
        var response = await HttpClient.PutAsJsonAsync($"/api/v1/users/{userId}", updateRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.PreconditionFailed);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
        
        // Verify Problem Details format
        var content = await response.Content.ReadAsStringAsync();
        var problemDetails = JsonSerializer.Deserialize<ProblemDetails>(content, JsonOptions);
        problemDetails.Should().NotBeNull();
        problemDetails!.Type.Should().Be("https://tools.ietf.org/html/rfc7231#section-6.5.10");
        problemDetails.Title.Should().Be("Precondition Failed");
        problemDetails.Status.Should().Be(412);
        
        // Clean up
        HttpClient.DefaultRequestHeaders.Remove("If-Match");
    }

    [Fact]
    public async Task PUT_Users_AccessingOtherUser_ShouldReturn403Forbidden()
    {
        // Arrange
        await AuthenticateAsync();
        var otherUserId = Guid.NewGuid(); // Different user ID
        
        var updateRequest = new UpdateUserProfileRequest
        {
            DisplayName = "Unauthorized Update"
        };

        // Act
        var response = await HttpClient.PutAsJsonAsync($"/api/v1/users/{otherUserId}", updateRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
        
        // Verify Problem Details format
        var content = await response.Content.ReadAsStringAsync();
        var problemDetails = JsonSerializer.Deserialize<ProblemDetails>(content, JsonOptions);
        problemDetails.Should().NotBeNull();
        problemDetails!.Type.Should().Be("https://tools.ietf.org/html/rfc7231#section-6.5.3");
        problemDetails.Title.Should().Be("Forbidden");
        problemDetails.Status.Should().Be(403);
    }

    #endregion

    #region Caching Status Codes (3xx)

    [Fact]
    public async Task GET_Users_WithMatchingETag_ShouldReturn304NotModified()
    {
        // Arrange
        await AuthenticateAsync();
        
        // First request to get ETag
        var initialResponse = await HttpClient.GetAsync("/api/v1/users");
        initialResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var etag = initialResponse.Headers.ETag;
        etag.Should().NotBeNull();

        // Add If-None-Match header with the ETag
        HttpClient.DefaultRequestHeaders.Add("If-None-Match", etag!.ToString());

        // Act - Second request with matching ETag
        var response = await HttpClient.GetAsync("/api/v1/users");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotModified);
        
        // Response body should be empty for 304
        var content = await response.Content.ReadAsStringAsync();
        content.Should().BeEmpty();
        
        // Clean up
        HttpClient.DefaultRequestHeaders.Remove("If-None-Match");
    }

    #endregion

    #region Problem Details Compliance Tests

    [Fact]
    public async Task AllErrorResponses_ShouldContainRequiredProblemDetailsFields()
    {
        // Test various error scenarios to ensure all contain required Problem Details fields
        var testCases = new[]
        {
            new { Url = "/api/v1/users", Method = HttpMethod.Get, Auth = false, ExpectedStatus = HttpStatusCode.Unauthorized },
            new { Url = $"/api/v1/users/{Guid.NewGuid()}", Method = HttpMethod.Get, Auth = true, ExpectedStatus = HttpStatusCode.NotFound }
        };

        foreach (var testCase in testCases)
        {
            // Arrange
            if (testCase.Auth)
            {
                await AuthenticateAsync();
            }
            else
            {
                // Clear authentication
                HttpClient.DefaultRequestHeaders.Authorization = null;
            }

            // Act
            var response = await HttpClient.SendAsync(new HttpRequestMessage(testCase.Method, testCase.Url));

            // Assert
            response.StatusCode.Should().Be(testCase.ExpectedStatus);
            response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
            
            var content = await response.Content.ReadAsStringAsync();
            var problemDetails = JsonSerializer.Deserialize<ProblemDetails>(content, JsonOptions);
            
            // Verify required Problem Details fields
            problemDetails.Should().NotBeNull();
            problemDetails!.Type.Should().NotBeNullOrEmpty();
            problemDetails.Title.Should().NotBeNullOrEmpty();
            problemDetails.Status.Should().Be((int)testCase.ExpectedStatus);
            problemDetails.Instance.Should().NotBeNullOrEmpty();
            
            // Verify custom extensions
            problemDetails.Extensions.Should().ContainKey("requestId");
            problemDetails.Extensions.Should().ContainKey("timestamp");
        }
    }

    [Fact]
    public async Task ValidationErrors_ShouldUseValidationProblemDetailsFormat()
    {
        // Arrange
        var invalidRequest = new CreateUserRequest
        {
            Email = "invalid",
            DisplayName = "",
            Password = "123"
        };

        // Act
        var response = await HttpClient.PostAsJsonAsync("/api/v1/users", invalidRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
        
        var content = await response.Content.ReadAsStringAsync();
        var validationProblemDetails = JsonSerializer.Deserialize<ValidationProblemDetails>(content, JsonOptions);
        
        // Verify ValidationProblemDetails specific fields
        validationProblemDetails.Should().NotBeNull();
        validationProblemDetails!.Type.Should().Be("https://tools.ietf.org/html/rfc4918#section-11.2");
        validationProblemDetails.Title.Should().Be("One or more validation errors occurred");
        validationProblemDetails.Status.Should().Be(422);
        validationProblemDetails.Errors.Should().NotBeEmpty();
        
        // Verify common Problem Details fields
        validationProblemDetails.Instance.Should().NotBeNullOrEmpty();
        validationProblemDetails.Extensions.Should().ContainKey("requestId");
        validationProblemDetails.Extensions.Should().ContainKey("timestamp");
    }

    #endregion

    #region Helper Methods

    private async Task<UserResponse> CreateTestUserAsync(string email, string displayName, string password)
    {
        var createRequest = new CreateUserRequest
        {
            Email = email,
            DisplayName = displayName,
            Password = password
        };

        var response = await HttpClient.PostAsJsonAsync("/api/v1/users", createRequest);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<UserResponse>(content, JsonOptions)!;
    }

    private async Task<Guid> GetCurrentUserIdAsync()
    {
        var response = await HttpClient.GetAsync("/api/v1/users/me");
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var userDto = JsonSerializer.Deserialize<UserDto>(content, JsonOptions);
        return userDto!.Id;
    }

    #endregion
}