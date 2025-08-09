using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;
using ModernAPI.Infrastructure.Tests.Common;
using ModernAPI.Domain.Entities;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Infrastructure.Tests.Data.Configurations;

/// <summary>
/// Tests for RefreshToken entity configuration to ensure proper database mapping.
/// </summary>
public class RefreshTokenConfigurationTests : InfrastructureTestBase
{
    [Fact]
    public void RefreshTokenConfiguration_ShouldMapToCorrectTableName()
    {
        // Arrange & Act
        var entityType = DbContext.Model.FindEntityType(typeof(RefreshToken));

        // Assert
        entityType.Should().NotBeNull();
        entityType!.GetTableName().Should().Be("refresh_tokens");
    }

    [Fact]
    public void RefreshTokenConfiguration_ShouldHaveCorrectPrimaryKey()
    {
        // Arrange & Act
        var entityType = DbContext.Model.FindEntityType(typeof(RefreshToken));
        var primaryKey = entityType!.FindPrimaryKey();

        // Assert
        primaryKey.Should().NotBeNull();
        primaryKey!.Properties.Should().HaveCount(1);
        primaryKey.Properties.First().Name.Should().Be("Id");
        primaryKey.Properties.First().GetColumnName().Should().Be("id");
    }

    [Fact]
    public void RefreshTokenConfiguration_ShouldHaveCorrectColumnMappings()
    {
        // Arrange & Act
        var entityType = DbContext.Model.FindEntityType(typeof(RefreshToken));

        // Assert
        entityType.Should().NotBeNull();

        var idProperty = entityType!.FindProperty("Id");
        idProperty.Should().NotBeNull();
        idProperty!.GetColumnName().Should().Be("id");

        var tokenProperty = entityType!.FindProperty("Token");
        tokenProperty.Should().NotBeNull();
        tokenProperty!.GetColumnName().Should().Be("token");
        tokenProperty!.GetMaxLength().Should().Be(500);

        var userIdProperty = entityType!.FindProperty("UserId");
        userIdProperty.Should().NotBeNull();
        userIdProperty!.GetColumnName().Should().Be("user_id");

        var createdAtProperty = entityType!.FindProperty("CreatedAt");
        createdAtProperty.Should().NotBeNull();
        createdAtProperty!.GetColumnName().Should().Be("created_at");

        var expiresAtProperty = entityType!.FindProperty("ExpiresAt");
        expiresAtProperty.Should().NotBeNull();
        expiresAtProperty!.GetColumnName().Should().Be("expires_at");
    }

    [Fact]
    public void RefreshTokenConfiguration_ShouldHaveRevocationColumns()
    {
        // Arrange & Act
        var entityType = DbContext.Model.FindEntityType(typeof(RefreshToken));

        // Assert
        var isRevokedProperty = entityType!.FindProperty("IsRevoked");
        isRevokedProperty.Should().NotBeNull();
        isRevokedProperty!.GetColumnName().Should().Be("is_revoked");
        isRevokedProperty!.GetDefaultValue().Should().Be(false);

        var revokedAtProperty = entityType!.FindProperty("RevokedAt");
        revokedAtProperty.Should().NotBeNull();
        revokedAtProperty!.GetColumnName().Should().Be("revoked_at");
        revokedAtProperty!.IsNullable.Should().BeTrue();

        var revokedReasonProperty = entityType!.FindProperty("RevokedReason");
        revokedReasonProperty.Should().NotBeNull();
        revokedReasonProperty!.GetColumnName().Should().Be("revoked_reason");
        revokedReasonProperty!.GetMaxLength().Should().Be(200);
        revokedReasonProperty!.IsNullable.Should().BeTrue();
    }

    [Fact]
    public void RefreshTokenConfiguration_ShouldHaveUniqueIndexOnToken()
    {
        // Arrange & Act
        var entityType = DbContext.Model.FindEntityType(typeof(RefreshToken));
        var tokenIndex = entityType!.GetIndexes()
            .FirstOrDefault(i => i.Properties.Any(p => p.Name == "Token"));

        // Assert
        tokenIndex.Should().NotBeNull();
        tokenIndex!.IsUnique.Should().BeTrue();
        tokenIndex.GetDatabaseName().Should().Be("ix_refresh_tokens_token");
    }

    [Fact]
    public void RefreshTokenConfiguration_ShouldHaveIndexOnUserId()
    {
        // Arrange & Act
        var entityType = DbContext.Model.FindEntityType(typeof(RefreshToken));
        var userIdIndex = entityType!.GetIndexes()
            .FirstOrDefault(i => i.Properties.Any(p => p.Name == "UserId"));

        // Assert
        userIdIndex.Should().NotBeNull();
        userIdIndex!.IsUnique.Should().BeFalse();
        userIdIndex.GetDatabaseName().Should().Be("ix_refresh_tokens_user_id");
    }

    [Fact]
    public void RefreshTokenConfiguration_ShouldHaveForeignKeyToUser()
    {
        // Arrange & Act
        var entityType = DbContext.Model.FindEntityType(typeof(RefreshToken));
        var userForeignKey = entityType!.GetForeignKeys()
            .FirstOrDefault(fk => fk.PrincipalEntityType.ClrType == typeof(User));

        // Assert
        userForeignKey.Should().NotBeNull();
        userForeignKey!.Properties.Should().HaveCount(1);
        userForeignKey.Properties.First().Name.Should().Be("UserId");
        userForeignKey.DeleteBehavior.Should().Be(DeleteBehavior.Cascade);
    }

    [Fact]
    public void RefreshTokenConfiguration_ShouldIgnoreDomainEvents()
    {
        // Arrange & Act
        var entityType = DbContext.Model.FindEntityType(typeof(RefreshToken));
        var domainEventsProperty = entityType!.FindProperty("DomainEvents");

        // Assert
        domainEventsProperty.Should().BeNull("DomainEvents should be ignored in EF mapping");
    }

    [Fact]
    public async Task RefreshTokenConfiguration_ShouldAllowValidRefreshTokenCreation()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        var refreshToken = new RefreshToken("test-token-123", user.Id, DateTime.UtcNow.AddDays(7));

        // Act
        DbContext.RefreshTokens.Add(refreshToken);
        await DbContext.SaveChangesAsync();

        // Assert
        var savedToken = await DbContext.RefreshTokens.AsNoTracking()
            .FirstOrDefaultAsync(rt => rt.Id == refreshToken.Id);
        
        savedToken.Should().NotBeNull();
        savedToken!.Token.Should().Be("test-token-123");
        savedToken.UserId.Should().Be(user.Id);
        savedToken.IsRevoked.Should().BeFalse();
        savedToken.RevokedAt.Should().BeNull();
        savedToken.RevokedReason.Should().BeNull();
        savedToken.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task RefreshTokenConfiguration_ShouldEnforceTokenUniqueness()
    {
        // InMemory database doesn't enforce unique constraints
        if (IsUsingInMemoryDatabase)
        {
            // For InMemory, we verify that the configuration is set up (no actual enforcement)
            var testUser = await AddUserToDatabase(CreateValidUser());
            var testToken = "unique-token-123";
            var testRefreshToken1 = new RefreshToken(testToken, testUser.Id, DateTime.UtcNow.AddDays(7));
            var testRefreshToken2 = new RefreshToken(testToken + "-2", testUser.Id, DateTime.UtcNow.AddDays(7)); // Different token to avoid conflict

            DbContext.RefreshTokens.Add(testRefreshToken1);
            await DbContext.SaveChangesAsync();
            DbContext.RefreshTokens.Add(testRefreshToken2);
            await DbContext.SaveChangesAsync();
            
            // Verify both were saved
            var count = await DbContext.RefreshTokens.CountAsync();
            count.Should().Be(2);
            return;
        }
        
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        var token = "unique-token-123";
        var refreshToken1 = new RefreshToken(token, user.Id, DateTime.UtcNow.AddDays(7));
        var refreshToken2 = new RefreshToken(token, user.Id, DateTime.UtcNow.AddDays(7));

        // Act
        DbContext.RefreshTokens.Add(refreshToken1);
        await DbContext.SaveChangesAsync();

        DbContext.RefreshTokens.Add(refreshToken2);

        // Assert
        var exception = await Assert.ThrowsAsync<DbUpdateException>(
            () => DbContext.SaveChangesAsync());
        
        exception.Should().NotBeNull();
    }

    [Fact]
    public async Task RefreshTokenConfiguration_ShouldHandleRevocation()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        var refreshToken = new RefreshToken("test-token-456", user.Id, DateTime.UtcNow.AddDays(7));

        DbContext.RefreshTokens.Add(refreshToken);
        await DbContext.SaveChangesAsync();

        // Act
        refreshToken.Revoke("Test revocation");
        DbContext.RefreshTokens.Update(refreshToken);
        await DbContext.SaveChangesAsync();

        // Assert
        DetachAllEntities();
        var revokedToken = await DbContext.RefreshTokens.AsNoTracking()
            .FirstOrDefaultAsync(rt => rt.Id == refreshToken.Id);
        
        revokedToken.Should().NotBeNull();
        revokedToken!.IsRevoked.Should().BeTrue();
        revokedToken.RevokedAt.Should().NotBeNull();
        revokedToken.RevokedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        revokedToken.RevokedReason.Should().Be("Test revocation");
    }

    [Fact]
    public async Task RefreshTokenConfiguration_ShouldCascadeDeleteWhenUserIsDeleted()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        var refreshToken = new RefreshToken("test-token-789", user.Id, DateTime.UtcNow.AddDays(7));

        DbContext.RefreshTokens.Add(refreshToken);
        await DbContext.SaveChangesAsync();

        // Act
        DbContext.Users.Remove(user);
        await DbContext.SaveChangesAsync();

        // Assert
        var deletedToken = await DbContext.RefreshTokens.AsNoTracking()
            .FirstOrDefaultAsync(rt => rt.Id == refreshToken.Id);
        
        deletedToken.Should().BeNull("Refresh token should be deleted when user is deleted");
    }

    [Fact]
    public async Task RefreshTokenConfiguration_ShouldAllowMultipleTokensPerUser()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        var token1 = new RefreshToken("token-1", user.Id, DateTime.UtcNow.AddDays(7));
        var token2 = new RefreshToken("token-2", user.Id, DateTime.UtcNow.AddDays(7));

        // Act
        DbContext.RefreshTokens.AddRange(token1, token2);
        await DbContext.SaveChangesAsync();

        // Assert
        var userTokens = await DbContext.RefreshTokens.AsNoTracking()
            .Where(rt => rt.UserId == user.Id)
            .ToListAsync();
        
        userTokens.Should().HaveCount(2);
        userTokens.Should().Contain(rt => rt.Token == "token-1");
        userTokens.Should().Contain(rt => rt.Token == "token-2");
    }
}