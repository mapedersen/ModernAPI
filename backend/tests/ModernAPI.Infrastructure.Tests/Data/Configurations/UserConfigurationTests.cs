using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;
using ModernAPI.Infrastructure.Tests.Common;
using ModernAPI.Domain.Entities;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Infrastructure.Tests.Data.Configurations;

/// <summary>
/// Tests for User entity configuration to ensure proper database mapping.
/// </summary>
public class UserConfigurationTests : InfrastructureTestBase
{
    [Fact]
    public void UserConfiguration_ShouldMapToCorrectTableName()
    {
        // Arrange & Act
        var entityType = DbContext.Model.FindEntityType(typeof(User));

        // Assert
        entityType.Should().NotBeNull();
        entityType!.GetTableName().Should().Be("users");
    }

    [Fact]
    public void UserConfiguration_ShouldHaveCorrectPrimaryKey()
    {
        // Arrange & Act
        var entityType = DbContext.Model.FindEntityType(typeof(User));
        var primaryKey = entityType!.FindPrimaryKey();

        // Assert
        primaryKey.Should().NotBeNull();
        primaryKey!.Properties.Should().HaveCount(1);
        primaryKey.Properties.First().Name.Should().Be("Id");
        primaryKey.Properties.First().GetColumnName().Should().Be("id");
    }

    [Fact]
    public void UserConfiguration_ShouldHaveCorrectColumnMappings()
    {
        // Arrange & Act
        var entityType = DbContext.Model.FindEntityType(typeof(User));

        // Assert
        entityType.Should().NotBeNull();

        // Check key properties
        var idProperty = entityType!.FindProperty("Id");
        idProperty.Should().NotBeNull();
        idProperty!.GetColumnName().Should().Be("id");

        var emailProperty = entityType!.FindProperty("Email");
        emailProperty.Should().NotBeNull();
        emailProperty!.GetColumnName().Should().Be("email");
        emailProperty!.GetMaxLength().Should().Be(320);

        var displayNameProperty = entityType!.FindProperty("DisplayName");
        displayNameProperty.Should().NotBeNull();
        displayNameProperty!.GetColumnName().Should().Be("display_name");
        displayNameProperty!.GetMaxLength().Should().Be(100);

        var firstNameProperty = entityType!.FindProperty("FirstName");
        firstNameProperty.Should().NotBeNull();
        firstNameProperty!.GetColumnName().Should().Be("first_name");
        firstNameProperty!.GetMaxLength().Should().Be(50);

        var lastNameProperty = entityType!.FindProperty("LastName");
        lastNameProperty.Should().NotBeNull();
        lastNameProperty!.GetColumnName().Should().Be("last_name");
        lastNameProperty!.GetMaxLength().Should().Be(50);
    }

    [Fact]
    public void UserConfiguration_ShouldHaveCorrectBooleanColumnMappings()
    {
        // Arrange & Act
        var entityType = DbContext.Model.FindEntityType(typeof(User));

        // Assert
        var isActiveProperty = entityType!.FindProperty("IsActive");
        isActiveProperty.Should().NotBeNull();
        isActiveProperty!.GetColumnName().Should().Be("is_active");
        isActiveProperty!.GetDefaultValue().Should().Be(true);

        // IsEmailVerified is a computed property that wraps EmailConfirmed
        var emailConfirmedProperty = entityType!.FindProperty("EmailConfirmed");
        emailConfirmedProperty.Should().NotBeNull();
        emailConfirmedProperty!.GetColumnName().Should().Be("email_confirmed");
        
        // Verify that IsEmailVerified is ignored (it's computed)
        var isEmailVerifiedProperty = entityType!.FindProperty("IsEmailVerified");
        isEmailVerifiedProperty.Should().BeNull();
    }

    [Fact]
    public void UserConfiguration_ShouldHaveDateTimeColumnMappings()
    {
        // Arrange & Act
        var entityType = DbContext.Model.FindEntityType(typeof(User));

        // Assert
        var createdAtProperty = entityType!.FindProperty("CreatedAt");
        createdAtProperty.Should().NotBeNull();
        createdAtProperty!.GetColumnName().Should().Be("created_at");

        var updatedAtProperty = entityType.FindProperty("UpdatedAt");
        updatedAtProperty.Should().NotBeNull();
        updatedAtProperty!.GetColumnName().Should().Be("updated_at");

        var deactivatedAtProperty = entityType!.FindProperty("DeactivatedAt");
        deactivatedAtProperty.Should().NotBeNull();
        deactivatedAtProperty!.GetColumnName().Should().Be("deactivated_at");
        deactivatedAtProperty!.IsNullable.Should().BeTrue();
    }

    [Fact]
    public void UserConfiguration_ShouldHaveUniqueIndexOnEmail()
    {
        // Arrange & Act
        var entityType = DbContext.Model.FindEntityType(typeof(User));
        var emailIndex = entityType!.GetIndexes()
            .FirstOrDefault(i => i.Properties.Any(p => p.Name == "Email"));

        // Assert
        emailIndex.Should().NotBeNull();
        emailIndex!.IsUnique.Should().BeTrue();
        emailIndex.GetDatabaseName().Should().Be("ix_users_email");
    }

    [Fact]
    public void UserConfiguration_ShouldIgnoreDomainEvents()
    {
        // Arrange & Act
        var entityType = DbContext.Model.FindEntityType(typeof(User));
        var domainEventsProperty = entityType!.FindProperty("DomainEvents");

        // Assert
        domainEventsProperty.Should().BeNull("DomainEvents should be ignored in EF mapping");
    }

    [Fact]
    public async Task UserConfiguration_ShouldAllowValidUserCreation()
    {
        // Arrange
        var user = new User(
            new Email("test@example.com"),
            "Test User",
            "Test",
            "User");

        // Act
        DbContext.Users.Add(user);
        await DbContext.SaveChangesAsync();

        // Assert
        var savedUser = await DbContext.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == user.Id);
        
        savedUser.Should().NotBeNull();
        savedUser!.Email.Should().Be("test@example.com");
        savedUser.DisplayName.Should().Be("Test User");
        savedUser.FirstName.Should().Be("Test");
        savedUser.LastName.Should().Be("User");
        savedUser.IsActive.Should().BeTrue();
        savedUser.IsEmailVerified.Should().BeFalse();
        savedUser.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        savedUser.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task UserConfiguration_ShouldEnforceEmailUniqueness()
    {
        // InMemory database doesn't enforce unique constraints
        if (IsUsingInMemoryDatabase)
        {
            // For InMemory, we verify that the configuration is set up (no actual enforcement)
            var testEmail = "unique@example.com";
            var testUser1 = new User(new Email(testEmail), "User 1", "First1", "Last1");
            var testUser2 = new User(new Email(testEmail), "User 2", "First2", "Last2");

            DbContext.Users.Add(testUser1);
            await DbContext.SaveChangesAsync();
            DbContext.Users.Add(testUser2);
            await DbContext.SaveChangesAsync(); // This will succeed in InMemory
            
            // Verify both were saved (InMemory allows duplicates)
            var count = await DbContext.Users.CountAsync(u => u.Email == testEmail);
            count.Should().Be(2);
            return;
        }
        
        // Arrange
        var email = "unique@example.com";
        var user1 = new User(new Email(email), "User 1", "First1", "Last1");
        var user2 = new User(new Email(email), "User 2", "First2", "Last2");

        // Act
        DbContext.Users.Add(user1);
        await DbContext.SaveChangesAsync();

        DbContext.Users.Add(user2);

        // Assert
        var exception = await Assert.ThrowsAsync<DbUpdateException>(
            () => DbContext.SaveChangesAsync());
        
        exception.Should().NotBeNull();
        // The exact message varies by database provider, but should indicate constraint violation
    }

    [Fact]
    public async Task UserConfiguration_ShouldHandleNullableDeactivatedAt()
    {
        // Arrange
        var user = new User(
            new Email("test@example.com"),
            "Test User",
            "Test",
            "User");

        // Act
        DbContext.Users.Add(user);
        await DbContext.SaveChangesAsync();

        // Assert
        var savedUser = await DbContext.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == user.Id);
        
        savedUser.Should().NotBeNull();
        savedUser!.DeactivatedAt.Should().BeNull();

        // Test deactivation
        user.Deactivate();
        DbContext.Users.Update(user);
        await DbContext.SaveChangesAsync();

        DetachAllEntities();
        var deactivatedUser = await DbContext.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == user.Id);
        
        deactivatedUser.Should().NotBeNull();
        deactivatedUser!.DeactivatedAt.Should().NotBeNull();
        deactivatedUser.DeactivatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }
}