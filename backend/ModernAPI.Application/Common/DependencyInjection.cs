using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using ModernAPI.Application.Interfaces;
using ModernAPI.Application.Services;
using System.Reflection;

namespace ModernAPI.Application.Common;

/// <summary>
/// Extension methods for registering Application layer services in the dependency injection container.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Registers all Application layer services, validators, and mapping profiles.
    /// </summary>
    /// <param name="services">The service collection to register services with</param>
    /// <returns>The service collection for method chaining</returns>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register AutoMapper with all profiles from this assembly
        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        // Register FluentValidation validators from this assembly
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // Register application services
        services.AddScoped<IUserService, UserService>();

        // Add other application services here as they are created
        // services.AddScoped<IProductService, ProductService>();
        // services.AddScoped<IOrderService, OrderService>();

        return services;
    }

    /// <summary>
    /// Registers FluentValidation with additional configuration options.
    /// </summary>
    /// <param name="services">The service collection to register services with</param>
    /// <returns>The service collection for method chaining</returns>
    public static IServiceCollection AddFluentValidation(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly(), includeInternalTypes: true);

        // Configure FluentValidation options
        ValidatorOptions.Global.DefaultRuleLevelCascadeMode = CascadeMode.Stop;
        ValidatorOptions.Global.DefaultClassLevelCascadeMode = CascadeMode.Continue;

        return services;
    }
}

/// <summary>
/// Constants for Application layer configuration.
/// </summary>
public static class ApplicationConstants
{
    /// <summary>
    /// Default page size for paginated results.
    /// </summary>
    public const int DefaultPageSize = 20;

    /// <summary>
    /// Maximum page size for paginated results.
    /// </summary>
    public const int MaxPageSize = 100;

    /// <summary>
    /// Minimum search term length for search operations.
    /// </summary>
    public const int MinSearchTermLength = 2;

    /// <summary>
    /// Maximum search term length for search operations.
    /// </summary>
    public const int MaxSearchTermLength = 100;

    /// <summary>
    /// Maximum display name length.
    /// </summary>
    public const int MaxDisplayNameLength = 100;

    /// <summary>
    /// Maximum first/last name length.
    /// </summary>
    public const int MaxNameLength = 50;

    /// <summary>
    /// Maximum email length according to RFC 5321.
    /// </summary>
    public const int MaxEmailLength = 254;
}