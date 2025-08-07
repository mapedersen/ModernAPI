using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ModernAPI.Domain.Entities;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Infrastructure.Data;

/// <summary>
/// The main Entity Framework DbContext for the ModernAPI application.
/// Handles all database operations, entity configurations, and domain event processing.
/// Integrates with ASP.NET Core Identity using our custom User entity.
/// </summary>
public class ApplicationDbContext : IdentityDbContext<User, Microsoft.AspNetCore.Identity.IdentityRole<Guid>, Guid>
{
    /// <summary>
    /// Initializes a new instance of the ApplicationDbContext.
    /// </summary>
    /// <param name="options">Database context options</param>
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }


    /// <summary>
    /// Configures entity models and relationships.
    /// </summary>
    /// <param name="modelBuilder">The model builder used to configure entities</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Configure database-specific settings
        ConfigureDatabaseSpecifics(modelBuilder);
    }

    /// <summary>
    /// Overrides SaveChangesAsync to process domain events before persisting changes.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of entities saved</returns>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Update timestamps before saving
        UpdateTimestamps();

        // Get entities with domain events before clearing them
        var entitiesWithEvents = GetEntitiesWithDomainEvents();

        // Save changes to database first
        var result = await base.SaveChangesAsync(cancellationToken);

        // Process domain events after successful save
        // Note: In a full implementation, you'd use MediatR or similar to publish events
        // For now, we'll just clear the events to prevent memory leaks
        ClearDomainEvents(entitiesWithEvents);

        return result;
    }

    /// <summary>
    /// Overrides SaveChanges to process domain events before persisting changes.
    /// </summary>
    /// <returns>Number of entities saved</returns>
    public override int SaveChanges()
    {
        UpdateTimestamps();
        var entitiesWithEvents = GetEntitiesWithDomainEvents();
        var result = base.SaveChanges();
        ClearDomainEvents(entitiesWithEvents);
        return result;
    }

    /// <summary>
    /// Configures database-specific settings (PostgreSQL in this case).
    /// </summary>
    /// <param name="modelBuilder">The model builder</param>
    private static void ConfigureDatabaseSpecifics(ModelBuilder modelBuilder)
    {
        // Use snake_case naming convention for PostgreSQL
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            entity.SetTableName(entity.GetTableName()?.ToSnakeCase());

            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(property.GetColumnName().ToSnakeCase());
            }

            foreach (var key in entity.GetKeys())
            {
                key.SetName(key.GetName()?.ToSnakeCase());
            }

            foreach (var foreignKey in entity.GetForeignKeys())
            {
                foreignKey.SetConstraintName(foreignKey.GetConstraintName()?.ToSnakeCase());
            }

            foreach (var index in entity.GetIndexes())
            {
                index.SetDatabaseName(index.GetDatabaseName()?.ToSnakeCase());
            }
        }
    }

    /// <summary>
    /// Updates CreatedAt and UpdatedAt timestamps for tracked entities.
    /// </summary>
    private void UpdateTimestamps()
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<User>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    // CreatedAt is set in the User constructor
                    // We don't override it here to preserve domain logic
                    break;

                case EntityState.Modified:
                    // UpdatedAt is handled by the User entity itself
                    // We don't override it here to preserve domain logic
                    break;
            }
        }
    }

    /// <summary>
    /// Gets all User entities that have domain events.
    /// </summary>
    /// <returns>List of entities with domain events</returns>
    private List<User> GetEntitiesWithDomainEvents()
    {
        return ChangeTracker.Entries<User>()
            .Where(entry => entry.Entity.DomainEvents.Any())
            .Select(entry => entry.Entity)
            .ToList();
    }

    /// <summary>
    /// Clears domain events from entities after processing.
    /// </summary>
    /// <param name="entitiesWithEvents">Entities that had domain events</param>
    private static void ClearDomainEvents(IEnumerable<User> entitiesWithEvents)
    {
        foreach (var entity in entitiesWithEvents)
        {
            entity.ClearDomainEvents();
        }
    }
}

/// <summary>
/// Extension methods for string conversion utilities.
/// </summary>
public static class StringExtensions
{
    /// <summary>
    /// Converts a string to snake_case for PostgreSQL naming conventions.
    /// </summary>
    /// <param name="input">The input string</param>
    /// <returns>The snake_case version of the string</returns>
    public static string ToSnakeCase(this string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        var result = new System.Text.StringBuilder();
        
        for (int i = 0; i < input.Length; i++)
        {
            var currentChar = input[i];
            
            if (char.IsUpper(currentChar))
            {
                if (i > 0)
                    result.Append('_');
                    
                result.Append(char.ToLower(currentChar));
            }
            else
            {
                result.Append(currentChar);
            }
        }

        return result.ToString();
    }
}