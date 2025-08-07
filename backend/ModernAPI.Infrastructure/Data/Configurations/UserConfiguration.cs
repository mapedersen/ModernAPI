using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ModernAPI.Domain.Entities;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Infrastructure.Data.Configurations;

/// <summary>
/// Entity Framework configuration for the User entity.
/// Configures the User domain object that extends IdentityUser for database mapping.
/// </summary>
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    /// <summary>
    /// Configures the User entity mapping to the database.
    /// </summary>
    /// <param name="builder">Entity type builder for User</param>
    public void Configure(EntityTypeBuilder<User> builder)
    {
        ConfigureTable(builder);
        ConfigureDomainProperties(builder);
        ConfigureIndexes(builder);
        ConfigureIgnoredProperties(builder);
    }

    /// <summary>
    /// Configures the table name and schema.
    /// </summary>
    /// <param name="builder">Entity type builder</param>
    private static void ConfigureTable(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
    }

    /// <summary>
    /// Configures domain-specific properties that extend IdentityUser.
    /// </summary>
    /// <param name="builder">Entity type builder</param>
    private static void ConfigureDomainProperties(EntityTypeBuilder<User> builder)
    {
        // Display name
        builder.Property(u => u.DisplayName)
            .HasColumnName("display_name")
            .HasMaxLength(100)
            .IsRequired();

        // First name (nullable)
        builder.Property(u => u.FirstName)
            .HasColumnName("first_name")
            .HasMaxLength(50)
            .IsRequired(false);

        // Last name (nullable)
        builder.Property(u => u.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(50)
            .IsRequired(false);

        // Domain timestamps
        builder.Property(u => u.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.Property(u => u.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        // Domain boolean flags
        builder.Property(u => u.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true)
            .IsRequired();

        // Nullable timestamps
        builder.Property(u => u.DeactivatedAt)
            .HasColumnName("deactivated_at")
            .HasColumnType("timestamp with time zone")
            .IsRequired(false);

        builder.Property(u => u.EmailVerifiedAt)
            .HasColumnName("email_verified_at")
            .HasColumnType("timestamp with time zone")
            .IsRequired(false);

        // Configure Identity properties with snake_case column names
        builder.Property(u => u.Email)
            .HasColumnName("email")
            .HasMaxLength(254); // RFC 5321 email length limit

        builder.Property(u => u.UserName)
            .HasColumnName("user_name")
            .HasMaxLength(256);

        builder.Property(u => u.NormalizedUserName)
            .HasColumnName("normalized_user_name")
            .HasMaxLength(256);

        builder.Property(u => u.NormalizedEmail)
            .HasColumnName("normalized_email")
            .HasMaxLength(254);

        builder.Property(u => u.EmailConfirmed)
            .HasColumnName("email_confirmed");

        builder.Property(u => u.PasswordHash)
            .HasColumnName("password_hash");

        builder.Property(u => u.SecurityStamp)
            .HasColumnName("security_stamp");

        builder.Property(u => u.ConcurrencyStamp)
            .HasColumnName("concurrency_stamp")
            .IsConcurrencyToken();

        builder.Property(u => u.PhoneNumber)
            .HasColumnName("phone_number");

        builder.Property(u => u.PhoneNumberConfirmed)
            .HasColumnName("phone_number_confirmed");

        builder.Property(u => u.TwoFactorEnabled)
            .HasColumnName("two_factor_enabled");

        builder.Property(u => u.LockoutEnd)
            .HasColumnName("lockout_end")
            .HasColumnType("timestamp with time zone");

        builder.Property(u => u.LockoutEnabled)
            .HasColumnName("lockout_enabled");

        builder.Property(u => u.AccessFailedCount)
            .HasColumnName("access_failed_count");
    }

    /// <summary>
    /// Configures database indexes for performance.
    /// </summary>
    /// <param name="builder">Entity type builder</param>
    private static void ConfigureIndexes(EntityTypeBuilder<User> builder)
    {
        // Unique index on email for fast lookups and uniqueness constraint
        builder.HasIndex(u => u.Email)
            .HasDatabaseName("ix_users_email")
            .IsUnique();

        // Unique index on normalized email (Identity requirement)
        builder.HasIndex(u => u.NormalizedEmail)
            .HasDatabaseName("ix_users_normalized_email")
            .IsUnique();

        // Unique index on normalized username (Identity requirement)  
        builder.HasIndex(u => u.NormalizedUserName)
            .HasDatabaseName("ix_users_normalized_user_name")
            .IsUnique();

        // Index on IsActive for filtering active users
        builder.HasIndex(u => u.IsActive)
            .HasDatabaseName("ix_users_is_active");

        // Composite index for active users by creation date (for pagination)
        builder.HasIndex(u => new { u.IsActive, u.CreatedAt })
            .HasDatabaseName("ix_users_active_created");

        // Index on display name for search functionality
        builder.HasIndex(u => u.DisplayName)
            .HasDatabaseName("ix_users_display_name");
    }

    /// <summary>
    /// Configures properties that should be ignored by EF Core.
    /// </summary>
    /// <param name="builder">Entity type builder</param>
    private static void ConfigureIgnoredProperties(EntityTypeBuilder<User> builder)
    {
        // Ignore domain events - they shouldn't be persisted
        builder.Ignore(u => u.DomainEvents);

        // Ignore computed properties
        builder.Ignore(u => u.IsEmailVerified); // This is mapped to EmailConfirmed
    }
}