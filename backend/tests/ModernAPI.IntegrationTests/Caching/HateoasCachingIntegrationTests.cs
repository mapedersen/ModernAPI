using FluentAssertions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ModernAPI.Application.DTOs;
using ModernAPI.Infrastructure.Data;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Xunit;

namespace ModernAPI.IntegrationTests.Caching;

/// <summary>
/// Integration tests to verify that HATEOAS responses include proper HTTP caching headers.
/// Ensures that hypermedia links are cached appropriately along with the primary resource data.
/// </summary>
public class HateoasCachingIntegrationTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly string _testDbName;

    public HateoasCachingIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _testDbName = $"TestDb_HateoasCaching_{Guid.NewGuid()}";

        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                if (descriptor != null)
                    services.Remove(descriptor);

                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase(_testDbName);
                });

                var serviceProvider = services.BuildServiceProvider();
                using var scope = serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                context.Database.EnsureCreated();
            });
        });

        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetUser_HateoasResponse_ShouldIncludeCacheHeaders()
    {
        // Arrange
        var userId = await CreateTestUserAsync();
        var token = await GetValidJwtTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync($"/api/v1/users/{userId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var userResponse = JsonSerializer.Deserialize<UserDto>(content, new JsonSerializerOptions 
        { 
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
        });

        // Verify HATEOAS links are present
        userResponse.Should().NotBeNull();
        userResponse!.Links.Should().NotBeEmpty();
        userResponse.Links.Should().ContainKey("self");

        // Verify caching headers are present on the entire response (including HATEOAS links)
        response.Headers.ETag.Should().NotBeNull();
        response.Headers.CacheControl.Should().NotBeNull();
        response.Headers.CacheControl!.Private.Should().BeTrue();
        response.Headers.Vary.Should().Contain("Authorization");
    }

    [Fact]
    public async Task GetUsers_HateoasCollectionResponse_ShouldIncludeCacheHeadersAndPaginationLinks()
    {
        // Arrange
        await CreateTestUserAsync("user1@example.com", "User One");
        await CreateTestUserAsync("user2@example.com", "User Two");
        var token = await GetValidJwtTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/v1/users?pageSize=1");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var collectionResponse = JsonSerializer.Deserialize<HateoasCollectionDto<UserDto>>(content, new JsonSerializerOptions 
        { 
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
        });

        // Verify HATEOAS collection links are present (pagination links)
        collectionResponse.Should().NotBeNull();
        collectionResponse!.Links.Should().NotBeEmpty();
        collectionResponse.Links.Should().ContainKey("self");
        collectionResponse.Links.Should().ContainKey("first");
        collectionResponse.Links.Should().ContainKey("last");
        
        // With pageSize=1 and multiple users, we should have a next link
        collectionResponse.HasNextPage.Should().BeTrue();
        collectionResponse.Links.Should().ContainKey("next");

        // Verify each user in the collection also has HATEOAS links
        collectionResponse.Items.Should().NotBeEmpty();
        foreach (var user in collectionResponse.Items)
        {
            user.Links.Should().NotBeEmpty();
            user.Links.Should().ContainKey("self");
        }

        // Verify caching headers are present on the collection response
        response.Headers.ETag.Should().NotBeNull();
        response.Headers.CacheControl.Should().NotBeNull();
        response.Headers.CacheControl!.Private.Should().BeTrue();
        
        // Collection should have shorter cache duration
        var maxAge = response.Headers.CacheControl!.MaxAge!.Value.TotalSeconds;
        maxAge.Should().BeLessOrEqualTo(120); // Collection cache duration
    }

    [Fact]
    public async Task GetUser_WithIfNoneMatch_ShouldReturn304WithETagButNoHateoasContent()
    {
        // Arrange
        var userId = await CreateTestUserAsync();
        var token = await GetValidJwtTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Get initial response to capture ETag
        var initialResponse = await _client.GetAsync($"/api/v1/users/{userId}");
        var etag = initialResponse.Headers.ETag!.Tag;

        // Act - Request with If-None-Match header
        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/v1/users/{userId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.IfNoneMatch.Add(new EntityTagHeaderValue(etag));

        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotModified);
        
        // 304 responses should have minimal content but preserve cache-related headers
        response.Headers.ETag.Should().NotBeNull();
        response.Headers.ETag!.Tag.Should().Be(etag);
        
        // Content should be empty for 304 responses
        var content = await response.Content.ReadAsStringAsync();
        content.Should().BeEmpty();
    }

    [Fact]
    public async Task SearchUsers_HateoasResponse_ShouldHaveShortCacheForDynamicContent()
    {
        // Arrange
        await CreateTestUserAsync("searchable@example.com", "Searchable User");
        var token = await GetValidJwtTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/v1/users/search?searchTerm=Searchable");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var searchResponse = JsonSerializer.Deserialize<HateoasCollectionDto<UserDto>>(content, new JsonSerializerOptions 
        { 
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
        });

        // Verify HATEOAS links are present in search results
        searchResponse.Should().NotBeNull();
        searchResponse!.Links.Should().NotBeEmpty();
        
        // Search results should have very short cache duration due to dynamic nature
        response.Headers.CacheControl.Should().NotBeNull();
        var maxAge = response.Headers.CacheControl!.MaxAge!.Value.TotalSeconds;
        maxAge.Should().BeLessOrEqualTo(60); // Search results cache duration
    }

    [Fact]
    public async Task UpdateUser_HateoasResponse_ShouldHaveNoCacheHeaders()
    {
        // Arrange
        var userId = await CreateTestUserAsync();
        var token = await GetValidJwtTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Get current ETag for conditional update
        var getResponse = await _client.GetAsync($"/api/v1/users/{userId}");
        var etag = getResponse.Headers.ETag!.Tag;

        var updateRequest = new UpdateUserProfileRequest(
            DisplayName: "Updated User",
            FirstName: "Updated",
            LastName: "User"
        );

        var json = JsonSerializer.Serialize(updateRequest, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act - Update with proper If-Match header
        var request = new HttpRequestMessage(HttpMethod.Put, $"/api/v1/users/{userId}")
        {
            Content = content
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.IfMatch.Add(new EntityTagHeaderValue(etag));

        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var userResponse = JsonSerializer.Deserialize<UserResponse>(responseContent, new JsonSerializerOptions 
        { 
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
        });

        // Verify HATEOAS links are present in update response
        userResponse.Should().NotBeNull();
        userResponse!.Links.Should().NotBeEmpty();
        userResponse.User.Links.Should().NotBeEmpty();

        // Update responses should have no-cache headers to ensure fresh data
        response.Headers.CacheControl.Should().NotBeNull();
        response.Headers.CacheControl!.NoCache.Should().BeTrue();
        response.Headers.CacheControl!.NoStore.Should().BeTrue();
    }

    private async Task<Guid> CreateTestUserAsync(string email = "test@example.com", string displayName = "Test User")
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var user = new ModernAPI.Domain.Entities.User(
            new ModernAPI.Domain.ValueObjects.Email(email),
            displayName,
            "Test",
            "User"
        );

        context.Users.Add(user);
        await context.SaveChangesAsync();
        
        return user.Id;
    }

    private async Task<string> GetValidJwtTokenAsync()
    {
        var registerRequest = new
        {
            Email = "test@example.com",
            DisplayName = "Test User",
            FirstName = "Test",
            LastName = "User",
            Password = "TestPassword123!",
            ConfirmPassword = "TestPassword123!"
        };

        var registerJson = JsonSerializer.Serialize(registerRequest, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        var registerContent = new StringContent(registerJson, Encoding.UTF8, "application/json");

        try
        {
            await _client.PostAsync("/api/v1/auth/register", registerContent);
        }
        catch
        {
            // User might already exist, ignore registration errors
        }

        var loginRequest = new
        {
            Email = "test@example.com",
            Password = "TestPassword123!"
        };

        var loginJson = JsonSerializer.Serialize(loginRequest, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        var loginContent = new StringContent(loginJson, Encoding.UTF8, "application/json");

        var loginResponse = await _client.PostAsync("/api/v1/auth/login", loginContent);
        loginResponse.EnsureSuccessStatusCode();

        var loginResponseContent = await loginResponse.Content.ReadAsStringAsync();
        var loginResult = JsonSerializer.Deserialize<JsonElement>(loginResponseContent);
        
        return loginResult.GetProperty("token").GetString() ?? throw new InvalidOperationException("Failed to get token");
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
        GC.SuppressFinalize(this);
    }
}