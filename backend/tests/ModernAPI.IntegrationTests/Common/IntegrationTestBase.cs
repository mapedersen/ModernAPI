using System.Net.Http.Json;
using System.Text;
using Bogus;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ModernAPI.Application.DTOs;
using ModernAPI.Infrastructure.Data;
using Newtonsoft.Json;
using Respawn;
using Testcontainers.PostgreSql;
using Npgsql;

namespace ModernAPI.IntegrationTests.Common;

/// <summary>
/// Base class for integration tests providing full application testing with real database and HTTP client.
/// </summary>
public abstract class IntegrationTestBase : IAsyncDisposable, IDisposable
{
    private readonly PostgreSqlContainer _postgresContainer;
    private readonly WebApplicationFactory<Program> _factory;
    protected readonly HttpClient HttpClient;
    protected readonly IServiceScope ServiceScope;
    protected readonly ApplicationDbContext DbContext;
    protected readonly Faker Faker = new();
    private Respawner? _respawner;

    protected IntegrationTestBase()
    {
        // Start PostgreSQL container
        _postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgres:16")
            .WithDatabase("modernapi_test")
            .WithUsername("postgres")
            .WithPassword("password")
            .WithCleanUp(true)
            .Build();

        Task.Run(async () => await _postgresContainer.StartAsync()).Wait();

        // Create test web application factory
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
                
                // Set environment variables for tests before services are configured
                Environment.SetEnvironmentVariable("POSTGRES_CONNECTION_STRING", _postgresContainer.GetConnectionString());
                Environment.SetEnvironmentVariable("JWT_SECRET", "test-jwt-secret-for-integration-tests-32-chars-minimum");
                
                builder.ConfigureAppConfiguration(config =>
                {
                    config.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["ConnectionStrings:DefaultConnection"] = _postgresContainer.GetConnectionString(),
                        ["JwtSettings:Secret"] = "test-jwt-secret-for-integration-tests-32-chars-minimum",
                        ["JwtSettings:Issuer"] = "ModernAPI.Test",
                        ["JwtSettings:Audience"] = "ModernAPI.Test",
                        ["JwtSettings:ExpiryInMinutes"] = "60",
                        ["Logging:LogLevel:Default"] = "Warning"
                    });
                });

                builder.ConfigureServices(services =>
                {
                    // Remove the existing DbContext registration
                    var descriptors = services.Where(
                        d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>) ||
                             d.ServiceType == typeof(ApplicationDbContext)).ToList();
                    
                    foreach (var descriptor in descriptors)
                    {
                        services.Remove(descriptor);
                    }

                    // Add new DbContext with test connection string
                    services.AddDbContext<ApplicationDbContext>(options =>
                    {
                        options.UseNpgsql(_postgresContainer.GetConnectionString());
                    });
                });
            });

        HttpClient = _factory.CreateClient();
        ServiceScope = _factory.Services.CreateScope();
        DbContext = ServiceScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Ensure database is created and migrations are applied
        Task.Run(async () =>
        {
            await DbContext.Database.MigrateAsync(); // Apply all migrations
            await InitializeRespawner();
        }).Wait();
    }

    /// <summary>
    /// Initialize Respawner for database cleanup between tests.
    /// </summary>
    private async Task InitializeRespawner()
    {
        using var connection = new NpgsqlConnection(_postgresContainer.GetConnectionString());
        await connection.OpenAsync();
        _respawner = await Respawner.CreateAsync(connection, new RespawnerOptions
        {
            DbAdapter = DbAdapter.Postgres,
            SchemasToInclude = ["public"],
            TablesToIgnore = ["__EFMigrationsHistory"]
        });
    }

    /// <summary>
    /// Resets the database to a clean state between tests.
    /// </summary>
    protected async Task ResetDatabase()
    {
        if (_respawner != null)
        {
            using var connection = new NpgsqlConnection(_postgresContainer.GetConnectionString());
            await connection.OpenAsync();
            await _respawner.ResetAsync(connection);
        }
    }

    /// <summary>
    /// Creates a valid CreateUserRequest for testing.
    /// </summary>
    /// <returns>A valid CreateUserRequest DTO</returns>
    protected CreateUserRequest CreateValidCreateUserRequest()
    {
        return new CreateUserRequest(
            Faker.Internet.Email(),
            Faker.Name.FullName(),
            Faker.Name.FirstName(),
            Faker.Name.LastName()
        );
    }

    /// <summary>
    /// Creates a valid UpdateUserProfileRequest for testing.
    /// </summary>
    /// <returns>A valid UpdateUserProfileRequest DTO</returns>
    protected UpdateUserProfileRequest CreateValidUpdateUserProfileRequest()
    {
        return new UpdateUserProfileRequest(
            Faker.Name.FullName(),
            Faker.Name.FirstName(),
            Faker.Name.LastName()
        );
    }

    /// <summary>
    /// Sends a POST request with JSON content.
    /// </summary>
    /// <typeparam name="T">The type of the request object</typeparam>
    /// <param name="requestUri">The URI to send the request to</param>
    /// <param name="content">The request content object</param>
    /// <returns>HTTP response message</returns>
    protected async Task<HttpResponseMessage> PostAsJsonAsync<T>(string requestUri, T content)
    {
        var json = JsonConvert.SerializeObject(content);
        var stringContent = new StringContent(json, Encoding.UTF8, "application/json");
        return await HttpClient.PostAsync(requestUri, stringContent);
    }

    /// <summary>
    /// Sends a PUT request with JSON content.
    /// </summary>
    /// <typeparam name="T">The type of the request object</typeparam>
    /// <param name="requestUri">The URI to send the request to</param>
    /// <param name="content">The request content object</param>
    /// <returns>HTTP response message</returns>
    protected async Task<HttpResponseMessage> PutAsJsonAsync<T>(string requestUri, T content)
    {
        var json = JsonConvert.SerializeObject(content);
        var stringContent = new StringContent(json, Encoding.UTF8, "application/json");
        return await HttpClient.PutAsync(requestUri, stringContent);
    }

    /// <summary>
    /// Deserializes response content to the specified type.
    /// </summary>
    /// <typeparam name="T">The type to deserialize to</typeparam>
    /// <param name="response">The HTTP response</param>
    /// <returns>Deserialized object</returns>
    protected async Task<T?> DeserializeResponseAsync<T>(HttpResponseMessage response)
    {
        var content = await response.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject<T>(content);
    }

    /// <summary>
    /// Gets the response content as a string.
    /// </summary>
    /// <param name="response">The HTTP response</param>
    /// <returns>Response content as string</returns>
    protected async Task<string> GetResponseContentAsync(HttpResponseMessage response)
    {
        return await response.Content.ReadAsStringAsync();
    }

    /// <summary>
    /// Sets the Authorization header with a Bearer token.
    /// </summary>
    /// <param name="token">The JWT token</param>
    protected void SetAuthorizationHeader(string token)
    {
        HttpClient.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }

    /// <summary>
    /// Removes the Authorization header.
    /// </summary>
    protected void ClearAuthorizationHeader()
    {
        HttpClient.DefaultRequestHeaders.Authorization = null;
    }

    public async ValueTask DisposeAsync()
    {
        ServiceScope.Dispose();
        HttpClient.Dispose();
        _factory.Dispose();
        await _postgresContainer.DisposeAsync();
        
        // Clean up environment variables
        Environment.SetEnvironmentVariable("POSTGRES_CONNECTION_STRING", null);
        Environment.SetEnvironmentVariable("JWT_SECRET", null);
        
        GC.SuppressFinalize(this);
    }

    public void Dispose()
    {
        ServiceScope.Dispose();
        HttpClient.Dispose();
        _factory.Dispose();
        Task.Run(async () => await _postgresContainer.DisposeAsync()).Wait();
        
        // Clean up environment variables
        Environment.SetEnvironmentVariable("POSTGRES_CONNECTION_STRING", null);
        Environment.SetEnvironmentVariable("JWT_SECRET", null);
        
        GC.SuppressFinalize(this);
    }
}