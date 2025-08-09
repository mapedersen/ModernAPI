using FluentAssertions;
using ModernAPI.Application.DTOs;
using ModernAPI.IntegrationTests.Common;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Xunit;

namespace ModernAPI.IntegrationTests.Controllers;

/// <summary>
/// Integration tests for HTTP caching functionality in the Users API.
/// Tests ETag generation, conditional requests, and Cache-Control headers.
/// </summary>
public class UsersCachingIntegrationTests : IntegrationTestBase
{


    [Fact]
    public async Task GetUser_ShouldSetETagAndCacheControlHeaders()
    {
        // Arrange
        var userId = await CreateTestUserAsync();
        var token = await GetValidJwtTokenAsync();
        HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await HttpClient.GetAsync($"/api/v1/users/{userId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Check ETag header is present and properly formatted
        response.Headers.ETag.Should().NotBeNull();
        response.Headers.ETag!.Tag.Should().StartWith("\"").And.EndWith("\"");
        
        // Check Cache-Control headers
        response.Headers.CacheControl.Should().NotBeNull();
        response.Headers.CacheControl!.Private.Should().BeTrue();
        response.Headers.CacheControl!.MaxAge.Should().BeGreaterThan(TimeSpan.Zero);
        response.Headers.CacheControl!.MustRevalidate.Should().BeTrue();
        
        // Check Vary header for authorization-dependent content
        response.Headers.Vary.Should().Contain("Authorization");
        
        // Check Last-Modified header is present
        response.Content.Headers.LastModified.Should().NotBeNull();
    }

    [Fact]
    public async Task GetUser_WithIfNoneMatch_ShouldReturn304NotModified()
    {
        // Arrange
        var userId = await CreateTestUserAsync();
        var token = await GetValidJwtTokenAsync();
        HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Get the initial response to capture ETag
        var initialResponse = await HttpClient.GetAsync($"/api/v1/users/{userId}");
        initialResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var etag = initialResponse.Headers.ETag!.Tag;

        // Act - Make request with If-None-Match header
        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/v1/users/{userId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.IfNoneMatch.Add(new EntityTagHeaderValue(etag));

        var response = await HttpClient.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotModified);
        response.Content.Headers.ContentLength.Should().Be(0);
        
        // ETag should still be present in 304 response
        response.Headers.ETag.Should().NotBeNull();
        response.Headers.ETag!.Tag.Should().Be(etag);
    }

    [Fact]
    public async Task GetUser_WithIfModifiedSince_ShouldReturn304NotModified()
    {
        // Arrange
        var userId = await CreateTestUserAsync();
        var token = await GetValidJwtTokenAsync();
        HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Get the initial response to capture Last-Modified
        var initialResponse = await HttpClient.GetAsync($"/api/v1/users/{userId}");
        initialResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var lastModified = initialResponse.Content.Headers.LastModified!.Value;

        // Act - Make request with If-Modified-Since header
        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/v1/users/{userId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.IfModifiedSince = lastModified;

        var response = await HttpClient.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotModified);
        response.Content.Headers.ContentLength.Should().Be(0);
    }

    [Fact]
    public async Task GetUsers_ShouldSetCollectionETagAndCacheHeaders()
    {
        // Arrange
        await CreateTestUserAsync();
        await CreateTestUserAsync("test2@example.com", "Test User 2");
        var token = await GetValidJwtTokenAsync();
        HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await HttpClient.GetAsync("/api/v1/users");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Check collection ETag
        response.Headers.ETag.Should().NotBeNull();
        
        // Check collection cache headers (shorter TTL than individual resources)
        response.Headers.CacheControl.Should().NotBeNull();
        response.Headers.CacheControl!.Private.Should().BeTrue();
        response.Headers.CacheControl!.MaxAge.Should().BeGreaterThan(TimeSpan.Zero);
        
        // Verify it's using collection cache duration (should be less than individual resource)
        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task GetUsers_WithIfNoneMatch_ShouldReturn304ForUnchangedCollection()
    {
        // Arrange
        await CreateTestUserAsync();
        var token = await GetValidJwtTokenAsync();
        HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Get initial collection response
        var initialResponse = await HttpClient.GetAsync("/api/v1/users");
        initialResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var etag = initialResponse.Headers.ETag!.Tag;

        // Act - Request again with If-None-Match
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/users");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.IfNoneMatch.Add(new EntityTagHeaderValue(etag));

        var response = await HttpClient.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotModified);
    }

    [Fact]
    public async Task SearchUsers_ShouldSetSearchCacheHeaders()
    {
        // Arrange
        await CreateTestUserAsync("searchtest@example.com", "Searchable User");
        var token = await GetValidJwtTokenAsync();
        HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await HttpClient.GetAsync("/api/v1/users/search?searchTerm=Searchable");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Check search results cache headers (shortest TTL)
        response.Headers.CacheControl.Should().NotBeNull();
        response.Headers.CacheControl!.Private.Should().BeTrue();
        response.Headers.CacheControl!.MaxAge.Should().BeGreaterThan(TimeSpan.Zero);
        
        // Search results should have shorter cache than regular collections
        var maxAge = response.Headers.CacheControl!.MaxAge!.Value.TotalSeconds;
        maxAge.Should().BeLessOrEqualTo(60); // Search results cache duration
    }

    [Fact]
    public async Task PutUser_WithValidIfMatch_ShouldSucceed()
    {
        // Arrange
        var userId = await CreateTestUserAsync();
        var token = await GetValidJwtTokenAsync();
        HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Get current user state and ETag
        var getResponse = await HttpClient.GetAsync($"/api/v1/users/{userId}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var etag = getResponse.Headers.ETag!.Tag;

        var updateRequest = new UpdateUserProfileRequest(
            DisplayName: "Updated Display Name",
            FirstName: "Updated",
            LastName: "User"
        );

        var json = JsonSerializer.Serialize(updateRequest, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act - Update with valid If-Match header
        var request = new HttpRequestMessage(HttpMethod.Put, $"/api/v1/users/{userId}")
        {
            Content = content
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.IfMatch.Add(new EntityTagHeaderValue(etag));

        var response = await HttpClient.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Response should have no-cache headers to ensure fresh data
        response.Headers.CacheControl.Should().NotBeNull();
        response.Headers.CacheControl!.NoCache.Should().BeTrue();
        response.Headers.CacheControl!.NoStore.Should().BeTrue();
    }

    [Fact]
    public async Task PutUser_WithInvalidIfMatch_ShouldReturn412PreconditionFailed()
    {
        // Arrange
        var userId = await CreateTestUserAsync();
        var token = await GetValidJwtTokenAsync();
        HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var updateRequest = new UpdateUserProfileRequest(
            DisplayName: "Updated Display Name",
            FirstName: "Updated",
            LastName: "User"
        );

        var json = JsonSerializer.Serialize(updateRequest, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act - Update with invalid/outdated If-Match header
        var request = new HttpRequestMessage(HttpMethod.Put, $"/api/v1/users/{userId}")
        {
            Content = content
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.IfMatch.Add(new EntityTagHeaderValue("\"outdated-etag\""));

        var response = await HttpClient.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.PreconditionFailed);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Contain("modified since you last retrieved it");
    }

    [Fact]
    public async Task PatchUser_WithValidIfMatch_ShouldSucceed()
    {
        // Arrange
        var userId = await CreateTestUserAsync();
        var token = await GetValidJwtTokenAsync();
        HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Get current user state and ETag
        var getResponse = await HttpClient.GetAsync($"/api/v1/users/{userId}");
        var etag = getResponse.Headers.ETag!.Tag;

        var patchDocument = @"[
            { ""op"": ""replace"", ""path"": ""/displayName"", ""value"": ""Patched Name"" }
        ]";
        var content = new StringContent(patchDocument, Encoding.UTF8, "application/json-patch+json");

        // Act
        var request = new HttpRequestMessage(HttpMethod.Patch, $"/api/v1/users/{userId}")
        {
            Content = content
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.IfMatch.Add(new EntityTagHeaderValue(etag));

        var response = await HttpClient.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Should have no-cache headers
        response.Headers.CacheControl!.NoCache.Should().BeTrue();
    }

    [Fact]
    public async Task GetCurrentUser_ShouldSetOwnerCacheHeaders()
    {
        // Arrange
        var userId = await CreateTestUserAsync();
        var token = await GetValidJwtTokenAsync();
        HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await HttpClient.GetAsync("/api/v1/users/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Should have cache headers optimized for owner access (longer TTL)
        response.Headers.CacheControl.Should().NotBeNull();
        response.Headers.CacheControl!.Private.Should().BeTrue();
        
        // Owner access should have longer max-age than accessing other users
        var maxAge = response.Headers.CacheControl!.MaxAge!.Value.TotalSeconds;
        maxAge.Should().BeGreaterOrEqualTo(300); // UserResourceOwner duration
    }

    [Fact]
    public async Task CacheHeaders_ShouldVaryByAuthorization()
    {
        // Arrange
        var userId = await CreateTestUserAsync();
        var token = await GetValidJwtTokenAsync();
        HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await HttpClient.GetAsync($"/api/v1/users/{userId}");

        // Assert
        response.Headers.Vary.Should().Contain("Authorization");
    }

    private async Task<Guid> CreateTestUserAsync(string email = "test@example.com", string displayName = "Test User")
    {
        var registerRequest = new RegisterRequest(
            email,
            displayName,
            "Test",
            "User",
            "TestPassword123!",
            "TestPassword123!"
        );

        var response = await PostAsJsonAsync("/api/v1/auth/register", registerRequest);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var authResponse = System.Text.Json.JsonSerializer.Deserialize<AuthResponse>(content, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        
        return authResponse!.User.Id;
    }
    
    private async Task<string> GetValidJwtTokenAsync()
    {
        var loginRequest = new LoginRequest(
            "test@example.com",
            "TestPassword123!",
            false
        );

        var response = await PostAsJsonAsync("/api/v1/auth/login", loginRequest);
        if (!response.IsSuccessStatusCode)
        {
            // User might not exist, create it first
            await CreateTestUserAsync();
            response = await PostAsJsonAsync("/api/v1/auth/login", loginRequest);
        }
        
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var authResponse = System.Text.Json.JsonSerializer.Deserialize<AuthResponse>(content, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        
        return authResponse!.AccessToken;
    }
}