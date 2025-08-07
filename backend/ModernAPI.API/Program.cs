using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ModernAPI.Application.Common;
using ModernAPI.Infrastructure.Common;
using ModernAPI.Domain.Entities;
using ModernAPI.Infrastructure.Data;
using Scalar.AspNetCore;
using Serilog;
using System.Text.Json.Serialization;

// Load environment variables from .env file for development
if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development" || 
    Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == null)
{
    DotNetEnv.Env.Load("../.env");
}

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/modernapi-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
ConfigureServices(builder.Services, builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline
await ConfigurePipeline(app);

Log.Information("ModernAPI started successfully");
app.Run();

// Graceful shutdown
Log.CloseAndFlush();

static void ConfigureServices(IServiceCollection services, IConfiguration configuration)
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

    // Add Controllers
    services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.WriteIndented = true;
            options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });

    // Add API Documentation
    services.AddOpenApi();

    // Add CORS
    services.AddCors(options =>
    {
        options.AddPolicy("AllowedOrigins", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    // Add Authentication & Authorization
    services.AddAuthentication()
        .AddBearerToken(IdentityConstants.BearerScheme);
    
    services.AddAuthorizationBuilder();

    // Add Health Checks
    var connectionString = Environment.GetEnvironmentVariable("POSTGRES_CONNECTION_STRING");
    if (!string.IsNullOrEmpty(connectionString))
    {
        services.AddHealthChecks()
            .AddNpgSql(connectionString);
    }

    // Add Problem Details
    services.AddProblemDetails();
}

static async Task ConfigurePipeline(WebApplication app)
{
    // Exception handling
    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }
    else
    {
        app.UseExceptionHandler("/Error");
        app.UseHsts();
    }

    // Security headers
    app.UseHttpsRedirection();
    
    // CORS
    app.UseCors("AllowedOrigins");

    // Authentication & Authorization
    app.UseAuthentication();
    app.UseAuthorization();

    // API Documentation
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference(options =>
        {
            options.Title = "ModernAPI Documentation";
            options.Theme = ScalarTheme.Purple;
            options.ShowSidebar = true;
            options.DefaultHttpClient = new(ScalarTarget.CSharp, ScalarClient.HttpClient);
        });
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

        var result = await userManager.CreateAsync(adminUser, "Admin@123!");
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