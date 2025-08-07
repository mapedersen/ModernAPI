using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ModernAPI.Domain.Interfaces;
using ModernAPI.Infrastructure.Data;
using ModernAPI.Infrastructure.Repositories;

namespace ModernAPI.Infrastructure.Common;

/// <summary>
/// Extension methods for registering Infrastructure layer services in the dependency injection container.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Registers all Infrastructure layer services including Entity Framework, repositories, and Unit of Work.
    /// </summary>
    /// <param name="services">The service collection to register services with</param>
    /// <param name="configuration">The application configuration</param>
    /// <returns>The service collection for method chaining</returns>
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Register Entity Framework DbContext
        services.AddDbContext(configuration);

        // Register repositories and Unit of Work
        services.AddRepositories();

        // Register other infrastructure services as they are added
        // services.AddCaching(configuration);
        // services.AddMessageQueue(configuration);
        // services.AddExternalServices(configuration);

        return services;
    }

    /// <summary>
    /// Registers Entity Framework DbContext with PostgreSQL provider.
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <param name="configuration">The application configuration</param>
    /// <returns>The service collection for method chaining</returns>
    public static IServiceCollection AddDbContext(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = Environment.GetEnvironmentVariable("POSTGRES_CONNECTION_STRING")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Database connection string not found. Set POSTGRES_CONNECTION_STRING environment variable or DefaultConnection in appsettings.");

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                // Configure PostgreSQL-specific options
                npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorCodesToAdd: null);
            });

            // Configure EF Core options based on environment
            var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            
            if (environment == "Development")
            {
                options.EnableSensitiveDataLogging();
                options.EnableDetailedErrors();
            }

            // Configure query behavior
            options.ConfigureWarnings(warnings =>
            {
                // Configure any specific warning handling here
            });
        });


        return services;
    }

    /// <summary>
    /// Registers repository implementations and Unit of Work.
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <returns>The service collection for method chaining</returns>
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        // Register Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Register individual repositories
        services.AddScoped<IUserRepository, UserRepository>();

        // Future repositories would be registered here:
        // services.AddScoped<IProductRepository, ProductRepository>();
        // services.AddScoped<IOrderRepository, OrderRepository>();

        return services;
    }

    /// <summary>
    /// Registers health checks for the database and other infrastructure components.
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <param name="configuration">The application configuration</param>
    /// <returns>The service collection for method chaining</returns>
    public static IServiceCollection AddInfrastructureHealthChecks(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddHealthChecks()
            .AddNpgSql(
                connectionString!,
                name: "postgresql",
                tags: ["database", "postgresql"])
            .AddDbContextCheck<ApplicationDbContext>(
                name: "application-dbcontext",
                tags: ["database", "ef-core"]);

        return services;
    }

    /// <summary>
    /// Configures database-related options such as connection resilience and timeout settings.
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <param name="configuration">The application configuration</param>
    /// <returns>The service collection for method chaining</returns>
    public static IServiceCollection ConfigureDatabaseOptions(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Configure database-specific options
        services.Configure<DatabaseOptions>(configuration.GetSection(DatabaseOptions.SectionKey));

        return services;
    }
}

/// <summary>
/// Configuration options for database behavior.
/// </summary>
public class DatabaseOptions
{
    /// <summary>
    /// The configuration section key for database options.
    /// </summary>
    public const string SectionKey = "Database";

    /// <summary>
    /// Command timeout in seconds for database operations.
    /// </summary>
    public int CommandTimeout { get; set; } = 30;

    /// <summary>
    /// Whether to enable automatic migrations on startup.
    /// </summary>
    public bool EnableAutomaticMigrations { get; set; } = false;

    /// <summary>
    /// Whether to seed initial data on startup.
    /// </summary>
    public bool EnableDataSeeding { get; set; } = true;

    /// <summary>
    /// Maximum number of retry attempts for transient failures.
    /// </summary>
    public int MaxRetryCount { get; set; } = 3;

    /// <summary>
    /// Maximum delay between retry attempts.
    /// </summary>
    public TimeSpan MaxRetryDelay { get; set; } = TimeSpan.FromSeconds(5);
}

/// <summary>
/// Extension methods for database initialization and seeding.
/// </summary>
public static class DatabaseExtensions
{
    /// <summary>
    /// Ensures the database is created and optionally applies migrations and seeds data.
    /// </summary>
    /// <param name="serviceProvider">The service provider</param>
    /// <param name="applyMigrations">Whether to apply pending migrations</param>
    /// <param name="seedData">Whether to seed initial data</param>
    /// <returns>Task representing the async operation</returns>
    public static async Task InitializeDatabaseAsync(
        this IServiceProvider serviceProvider,
        bool applyMigrations = false,
        bool seedData = false)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Ensure database is created
        await context.Database.EnsureCreatedAsync();

        // Apply migrations if requested
        if (applyMigrations)
        {
            await context.Database.MigrateAsync();
        }

        // Seed data if requested
        if (seedData)
        {
            await SeedDataAsync(context);
        }
    }

    /// <summary>
    /// Seeds initial data into the database.
    /// </summary>
    /// <param name="context">The database context</param>
    /// <returns>Task representing the async operation</returns>
    private static async Task SeedDataAsync(ApplicationDbContext context)
    {
        // Check if data already exists
        if (await context.Users.AnyAsync())
        {
            return; // Database has been seeded
        }

        // Add seed data here
        // Example:
        // var adminUser = new User(new Email("admin@example.com"), "Administrator");
        // context.Users.Add(adminUser);
        
        await context.SaveChangesAsync();
    }
}