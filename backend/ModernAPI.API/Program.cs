using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ModernAPI.Application.Common;
using ModernAPI.Infrastructure.Common;
using ModernAPI.Domain.Entities;
using ModernAPI.Infrastructure.Data;
using ModernAPI.API.Middleware;
using ModernAPI.API.Monitoring;
using ModernAPI.Application.Common.Settings;
using Scalar.AspNetCore;
using Serilog;
using Serilog.Events;
using Serilog.Exceptions;
using Serilog.Formatting.Compact;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Asp.Versioning;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using ModernAPI.API.OpenApi;

// Load environment variables from environment-specific .env files
var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

// Load environment-specific .env file (e.g., .env.development, .env.production)
var envFiles = new[]
{
    $".env.{environment.ToLower()}",  // .env.development, .env.production, etc.
    ".env"                            // fallback to base .env
};

foreach (var envFile in envFiles)
{
    var fullPath = Path.Combine(Directory.GetCurrentDirectory(), envFile);
    if (File.Exists(fullPath))
    {
        DotNetEnv.Env.Load(fullPath);
        Console.WriteLine($"Loaded environment file: {envFile}");
        break; // Load only the first matching file
    }
}

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog with enrichers and structured logging
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithEnvironmentName()
    .Enrich.WithThreadId()
    .Enrich.WithCorrelationId()
    .Enrich.WithExceptionDetails()
    .WriteTo.Console(new RenderedCompactJsonFormatter())
    .WriteTo.File(
        new CompactJsonFormatter(),
        "logs/modernapi-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7)
    .WriteTo.Seq(
        Environment.GetEnvironmentVariable("SEQ_URL") ?? "http://localhost:5341",
        apiKey: Environment.GetEnvironmentVariable("SEQ_API_KEY"))
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
ConfigureServices(builder.Services, builder.Configuration, builder.Environment);

var app = builder.Build();

// Configure the HTTP request pipeline
await ConfigurePipeline(app);

Log.Information("ModernAPI started successfully");
app.Run();

// Graceful shutdown
Log.CloseAndFlush();

static void ConfigureServices(IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
{
    // Identity Configuration
    services.AddIdentity<User, IdentityRole<Guid>>(options =>
    {
        // Password settings
        options.Password.RequireDigit = true;
        options.Password.RequiredLength = 8;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;

        // Lockout settings
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.AllowedForNewUsers = true;

        // User settings
        options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
        options.User.RequireUniqueEmail = true;

        // Sign-in settings
        options.SignIn.RequireConfirmedEmail = false; // Set to true in production
        options.SignIn.RequireConfirmedPhoneNumber = false;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

    // Add Application Services
    services.AddApplicationServices();

    // Add Infrastructure Services  
    services.AddInfrastructureServices(configuration);
    
    // Add Redis distributed caching
    var redisConnectionString = Environment.GetEnvironmentVariable("REDIS_CONNECTION_STRING") 
        ?? configuration.GetConnectionString("Redis");
    
    if (!string.IsNullOrEmpty(redisConnectionString))
    {
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisConnectionString;
            options.InstanceName = "ModernAPI";
        });
        
        services.AddSingleton<StackExchange.Redis.IConnectionMultiplexer>(sp =>
        {
            return StackExchange.Redis.ConnectionMultiplexer.Connect(redisConnectionString);
        });
        
        services.AddScoped<ModernAPI.Application.Services.IDistributedCacheService, 
            ModernAPI.Infrastructure.Services.RedisDistributedCacheService>();
        
        Log.Information("Redis distributed caching configured with connection: {Connection}", 
            redisConnectionString.Split(',')[0]); // Log only first part for security
    }
    else
    {
        Log.Warning("Redis connection string not found. Distributed caching will not be available.");
    }

    // Add Controllers with JSON Patch support
    services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.WriteIndented = true;
            options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        })
        .AddNewtonsoftJson(); // Add Newtonsoft.Json support for JsonPatch

    // Add HTTP context accessor for HATEOAS link generation
    services.AddHttpContextAccessor();
    
    // Add HATEOAS link generation service
    services.AddScoped<ModernAPI.API.Services.ILinkGenerator, ModernAPI.API.Services.LinkGeneratorService>();
    
    // Add Response Caching - for client-side HTTP caching
    services.AddResponseCaching();
    

    // Add API Versioning
    services.AddApiVersioning(options =>
    {
        // Default API version
        options.DefaultApiVersion = new ApiVersion(1, 0);
        options.AssumeDefaultVersionWhenUnspecified = true;
        
        // Support multiple versioning strategies
        options.ApiVersionReader = ApiVersionReader.Combine(
            new UrlSegmentApiVersionReader(),    // /api/v1/users
            new HeaderApiVersionReader("X-Version"),     // X-Version: 1.0
            new HeaderApiVersionReader("Api-Version"),   // Api-Version: 1.0
            new QueryStringApiVersionReader("version")   // ?version=1.0
        );
        
        // Report supported versions in response headers
        options.ReportApiVersions = true;
    })
    .AddMvc()  // Add MVC support for versioned controllers
    .AddApiExplorer(options =>
    {
        // Format version as "'v'major[.minor][-status]"
        options.GroupNameFormat = "'v'VVV";
        
        // Automatically substitute version in controller names
        options.SubstituteApiVersionInUrl = true;
    });

    // Add API Documentation with versioning support and comprehensive status code documentation
    services.AddOpenApi(options =>
    {
        // Configure OpenAPI document per API version
        options.AddDocumentTransformer<ApiVersionOpenApiTransformer>();
        
        // Add comprehensive HTTP status code documentation
        options.AddDocumentTransformer<HttpStatusCodeOpenApiTransformer>();
    });

    // Add CORS
    services.AddCors(options =>
    {
        var corsOrigins = Environment.GetEnvironmentVariable("CORS_ORIGINS");
        
        options.AddPolicy("AllowedOrigins", policy =>
        {
            if (!string.IsNullOrEmpty(corsOrigins))
            {
                var origins = corsOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(origin => origin.Trim())
                    .ToArray();
                    
                policy.WithOrigins(origins)
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            }
            else
            {
                // Development fallback - allow any origin
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            }
        });
    });

    // Configure JWT Settings
    var jwtSettings = new JwtSettings();
    configuration.GetSection(JwtSettings.SectionName).Bind(jwtSettings);
    
    // Override with environment variables if available
    jwtSettings.Secret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? jwtSettings.Secret;
    jwtSettings.Issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? jwtSettings.Issuer;
    jwtSettings.Audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? jwtSettings.Audience;
    
    services.Configure<JwtSettings>(options =>
    {
        configuration.GetSection(JwtSettings.SectionName).Bind(options);
        options.Secret = jwtSettings.Secret;
        options.Issuer = jwtSettings.Issuer;
        options.Audience = jwtSettings.Audience;
    });

    // Validate JWT settings
    if (string.IsNullOrEmpty(jwtSettings.Secret) || jwtSettings.Secret.Length < 32)
    {
        throw new InvalidOperationException("JWT Secret must be at least 32 characters long. Please set JWT_SECRET environment variable or configure JwtSettings:Secret in appsettings.json.");
    }

    // Add JWT Authentication
    services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !environment.IsDevelopment();
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
            ClockSkew = TimeSpan.Zero // Remove default 5-minute clock skew
        };

        // Add JWT events for debugging in development
        if (environment.IsDevelopment())
        {
            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    Log.Warning("JWT authentication failed: {Exception}", context.Exception.Message);
                    return Task.CompletedTask;
                },
                OnTokenValidated = context =>
                {
                    Log.Debug("JWT token validated for user: {UserId}", context.Principal?.Identity?.Name);
                    return Task.CompletedTask;
                }
            };
        }
    });
    
    services.AddAuthorizationBuilder();

    // Add Application Metrics
    services.AddApplicationMetrics();

    // Configure OpenTelemetry
    services.AddOpenTelemetry()
        .ConfigureResource(resource => resource
            .AddService(
                serviceName: "ModernAPI",
                serviceVersion: typeof(Program).Assembly.GetName().Version?.ToString() ?? "1.0.0",
                serviceInstanceId: Environment.MachineName))
        .WithMetrics(metrics => metrics
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddRuntimeInstrumentation()
            .AddMeter("ModernAPI.Authentication")
            .AddMeter("ModernAPI.Api")
            .AddPrometheusExporter())
        .WithTracing(tracing =>
        {
            tracing
                .AddAspNetCoreInstrumentation(options =>
                {
                    options.RecordException = true;
                    options.Filter = (httpContext) => !httpContext.Request.Path.StartsWithSegments("/health");
                })
                .AddHttpClientInstrumentation()
                .AddEntityFrameworkCoreInstrumentation(options =>
                {
                    options.SetDbStatementForText = true;
                    options.SetDbStatementForStoredProcedure = true;
                })
                .AddSource("ModernAPI");
            
            // Configure OTLP exporter if endpoint is configured
            var otlpEndpoint = Environment.GetEnvironmentVariable("OTEL_EXPORTER_OTLP_ENDPOINT");
            if (!string.IsNullOrEmpty(otlpEndpoint))
            {
                tracing.AddOtlpExporter(options =>
                {
                    options.Endpoint = new Uri(otlpEndpoint);
                });
            }
        });

    // Add Health Checks
    var connectionString = Environment.GetEnvironmentVariable("POSTGRES_CONNECTION_STRING")
        ?? configuration.GetConnectionString("DefaultConnection");
    
    var healthChecksBuilder = services.AddHealthChecks();
    
    // Add PostgreSQL health check
    if (!string.IsNullOrEmpty(connectionString))
    {
        healthChecksBuilder.AddNpgSql(connectionString, name: "postgresql", tags: new[] { "database", "ready" });
    }
    
    // Add Redis health check
    if (!string.IsNullOrEmpty(redisConnectionString))
    {
        healthChecksBuilder.AddRedis(redisConnectionString, name: "redis", tags: new[] { "cache", "ready" });
    }

    // Add Problem Details
    services.AddProblemDetails();
}

static async Task ConfigurePipeline(WebApplication app)
{
    // Request logging middleware (should be first)
    app.UseMiddleware<RequestLoggingMiddleware>();
    
    // Global exception handling - always use custom middleware
    app.UseGlobalExceptionHandling();
    
    // Security headers
    if (!app.Environment.IsDevelopment())
    {
        app.UseHsts();
    }

    // Security headers
    app.UseHttpsRedirection();
    
    // Response caching middleware (should come before CORS and Authentication)
    app.UseResponseCaching();
    
    // CORS
    app.UseCors("AllowedOrigins");

    // Authentication & Authorization
    app.UseAuthentication();
    app.UseAuthorization();

    // OpenTelemetry Prometheus metrics endpoint
    app.MapPrometheusScrapingEndpoint();

    // API Documentation
    if (app.Environment.IsDevelopment())
    {
        // Map OpenAPI documents for each version
        app.MapOpenApi();
        
        // Configure Scalar UI with version support
        app.MapScalarApiReference(options =>
        {
            options.Title = "ModernAPI Documentation";
            options.Theme = ScalarTheme.Purple;
            options.ShowSidebar = true;
            options.DefaultHttpClient = new(ScalarTarget.CSharp, ScalarClient.HttpClient);
            
            // Add custom configuration for better API documentation
            options.CustomCss = """
                .scalar-api-reference {
                    --scalar-font-size: 14px;
                    --scalar-line-height: 1.5;
                }
                .scalar-api-reference h1 {
                    color: #6366f1;
                    font-weight: 700;
                }
                """;
        });
        
        // Add version selector information
        app.MapGet("/api/versions", () => new
        {
            Versions = new[] { "v1" },
            Current = "v1",
            Supported = new[] { "v1" },
            Documentation = "/scalar/v1"
        }).WithTags("API Information").WithOpenApi();
    }

    // Map controllers
    app.MapControllers();

    // Map Identity endpoints
    // app.MapIdentityApi<User>(); // Commented out - User needs parameterless constructor

    // Health checks
    app.MapHealthChecks("/health");

    // Database migration and seeding
    await EnsureDatabaseAsync(app);
}

static async Task EnsureDatabaseAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    try
    {
        Log.Information("Applying database migrations...");
        await context.Database.MigrateAsync();
        Log.Information("Database migrations applied successfully");
        
        // Seed data if needed
        await SeedDataAsync(scope.ServiceProvider);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error occurred while applying database migrations");
        throw;
    }
}

static async Task SeedDataAsync(IServiceProvider serviceProvider)
{
    var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
    var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

    // Create default roles
    if (!await roleManager.RoleExistsAsync("Administrator"))
    {
        var adminRole = new IdentityRole<Guid>("Administrator");
        await roleManager.CreateAsync(adminRole);
        Log.Information("Created Administrator role");
    }

    if (!await roleManager.RoleExistsAsync("User"))
    {
        var userRole = new IdentityRole<Guid>("User");
        await roleManager.CreateAsync(userRole);
        Log.Information("Created User role");
    }

    // Create default admin user
    const string adminEmail = "admin@modernapi.dev";
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    
    if (adminUser == null)
    {
        adminUser = new User(
            new ModernAPI.Domain.ValueObjects.Email(adminEmail),
            "System Administrator",
            "Admin",
            "User"
        );

        var result = await userManager.CreateAsync(adminUser, "AdminPassword123!");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Administrator");
            Log.Information("Created default admin user: {Email}", adminEmail);
        }
        else
        {
            Log.Error("Failed to create admin user: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }
}

// Make Program class accessible to integration tests
/// <summary>
/// The main Program class for the ModernAPI application.
/// This class is made public and partial to support integration testing.
/// </summary>
public partial class Program { }