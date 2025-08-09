using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;
using ModernAPI.Infrastructure.Repositories;
using ModernAPI.Infrastructure.Tests.Common;
using ModernAPI.Domain.Entities;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Infrastructure.Tests.Repositories;

/// <summary>
/// Tests for RefreshTokenRepository data access functionality.
/// </summary>
public class RefreshTokenRepositoryTests : InfrastructureTestBase
{
    private readonly RefreshTokenRepository _refreshTokenRepository;

    public RefreshTokenRepositoryTests()
    {
        _refreshTokenRepository = new RefreshTokenRepository(DbContext);
    }

    [Fact]
    public void Constructor_WithValidContext_ShouldCreateInstance()
    {
        // Act & Assert
        _refreshTokenRepository.Should().NotBeNull();
    }

    [Fact]
    public void Constructor_WithNullContext_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var exception = Assert.Throws<ArgumentNullException>(() => new RefreshTokenRepository(null!));
        exception.ParamName.Should().Be("context");
    }

    [Fact]
    public async Task AddAsync_WithValidRefreshToken_ShouldAddToDatabase()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        var refreshToken = CreateValidRefreshToken(user);

        // Act
        await _refreshTokenRepository.AddAsync(refreshToken);
        await DbContext.SaveChangesAsync();

        // Assert
        var savedToken = await GetRefreshTokenFromDatabase(refreshToken.Token);
        savedToken.Should().NotBeNull();
        savedToken!.Token.Should().Be(refreshToken.Token);
        savedToken.UserId.Should().Be(user.Id);
    }

    [Fact]
    public async Task AddAsync_WithNullRefreshToken_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentNullException>(
            () => _refreshTokenRepository.AddAsync(null!));
        exception.ParamName.Should().Be("refreshToken");
    }

    [Fact]
    public async Task GetByTokenAsync_WithExistingToken_ShouldReturnRefreshToken()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        var refreshToken = await AddRefreshTokenToDatabase(CreateValidRefreshToken(user));

        // Act
        var result = await _refreshTokenRepository.GetByTokenAsync(refreshToken.Token);

        // Assert
        result.Should().NotBeNull();
        result!.Token.Should().Be(refreshToken.Token);
        result.UserId.Should().Be(user.Id);
        result.User.Should().NotBeNull();
        result.User.Id.Should().Be(user.Id);
    }

    [Fact]
    public async Task GetByTokenAsync_WithNonExistentToken_ShouldReturnNull()
    {
        // Arrange
        var nonExistentToken = "non-existent-token";

        // Act
        var result = await _refreshTokenRepository.GetByTokenAsync(nonExistentToken);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByUserIdAsync_WithExistingUser_ShouldReturnUserTokens()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        var token1 = await AddRefreshTokenToDatabase(CreateValidRefreshToken(user));
        var token2 = await AddRefreshTokenToDatabase(CreateValidRefreshToken(user));
        
        // Add token for different user to ensure filtering works
        var otherUser = await AddUserToDatabase(CreateValidUser());
        await AddRefreshTokenToDatabase(CreateValidRefreshToken(otherUser));

        // Act
        var result = await _refreshTokenRepository.GetByUserIdAsync(user.Id);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(rt => rt.UserId == user.Id);
        result.Should().BeInDescendingOrder(rt => rt.CreatedAt);
    }

    [Fact]
    public async Task GetByUserIdAsync_WithNonExistentUser_ShouldReturnEmptyList()
    {
        // Arrange
        var nonExistentUserId = Guid.NewGuid();

        // Act
        var result = await _refreshTokenRepository.GetByUserIdAsync(nonExistentUserId);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetActiveByUserIdAsync_WithActiveTokens_ShouldReturnOnlyActiveTokens()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        
        // Create active token
        var activeToken = await AddRefreshTokenToDatabase(CreateValidRefreshToken(user, DateTime.UtcNow.AddDays(1)));
        
        // Create expired token
        var expiredToken = CreateValidRefreshToken(user, DateTime.UtcNow.AddDays(-1));
        await AddRefreshTokenToDatabase(expiredToken);
        
        // Create revoked token
        var revokedToken = CreateValidRefreshToken(user, DateTime.UtcNow.AddDays(1));
        revokedToken.Revoke("Test revocation");
        await AddRefreshTokenToDatabase(revokedToken);

        // Act
        var result = await _refreshTokenRepository.GetActiveByUserIdAsync(user.Id);

        // Assert
        result.Should().HaveCount(1);
        result.First().Token.Should().Be(activeToken.Token);
        result.First().IsRevoked.Should().BeFalse();
        result.First().ExpiresAt.Should().BeAfter(DateTime.UtcNow);
    }

    [Fact]
    public async Task GetActiveByUserIdAsync_WithNoActiveTokens_ShouldReturnEmptyList()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        
        // Create only expired/revoked tokens
        var expiredToken = CreateValidRefreshToken(user, DateTime.UtcNow.AddDays(-1));
        await AddRefreshTokenToDatabase(expiredToken);

        // Act
        var result = await _refreshTokenRepository.GetActiveByUserIdAsync(user.Id);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task UpdateAsync_WithValidRefreshToken_ShouldUpdateToken()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        var refreshToken = await AddRefreshTokenToDatabase(CreateValidRefreshToken(user));
        
        // Act
        refreshToken.Revoke("Test update");
        await _refreshTokenRepository.UpdateAsync(refreshToken);
        await DbContext.SaveChangesAsync();

        // Assert
        DetachAllEntities();
        var updatedToken = await GetRefreshTokenFromDatabase(refreshToken.Token);
        updatedToken.Should().NotBeNull();
        updatedToken!.IsRevoked.Should().BeTrue();
        updatedToken.RevokedAt.Should().NotBeNull();
        updatedToken.RevokedReason.Should().Be("Test update");
    }

    [Fact]
    public async Task UpdateAsync_WithNullRefreshToken_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentNullException>(
            () => _refreshTokenRepository.UpdateAsync(null!));
        exception.ParamName.Should().Be("refreshToken");
    }

    [Fact]
    public async Task RemoveExpiredTokensAsync_WithExpiredTokens_ShouldRemoveAndReturnCount()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        
        // Create expired tokens
        var expiredToken1 = CreateValidRefreshToken(user, DateTime.UtcNow.AddDays(-1));
        var expiredToken2 = CreateValidRefreshToken(user, DateTime.UtcNow.AddHours(-1));
        await AddRefreshTokenToDatabase(expiredToken1);
        await AddRefreshTokenToDatabase(expiredToken2);
        
        // Create active token
        var activeToken = CreateValidRefreshToken(user, DateTime.UtcNow.AddDays(1));
        await AddRefreshTokenToDatabase(activeToken);

        // Act
        var result = await _refreshTokenRepository.RemoveExpiredTokensAsync();
        await DbContext.SaveChangesAsync();

        // Assert
        result.Should().Be(2);
        
        var remainingTokens = await _refreshTokenRepository.GetByUserIdAsync(user.Id);
        remainingTokens.Should().HaveCount(1);
        remainingTokens.First().Token.Should().Be(activeToken.Token);
    }

    [Fact]
    public async Task RemoveExpiredTokensAsync_WithNoExpiredTokens_ShouldReturnZero()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        var activeToken = CreateValidRefreshToken(user, DateTime.UtcNow.AddDays(1));
        await AddRefreshTokenToDatabase(activeToken);

        // Act
        var result = await _refreshTokenRepository.RemoveExpiredTokensAsync();

        // Assert
        result.Should().Be(0);
        
        var remainingTokens = await _refreshTokenRepository.GetByUserIdAsync(user.Id);
        remainingTokens.Should().HaveCount(1);
    }

    [Fact]
    public async Task RevokeAllUserTokensAsync_WithActiveTokens_ShouldRevokeAndReturnCount()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        
        // Create active tokens
        var activeToken1 = CreateValidRefreshToken(user, DateTime.UtcNow.AddDays(1));
        var activeToken2 = CreateValidRefreshToken(user, DateTime.UtcNow.AddDays(2));
        await AddRefreshTokenToDatabase(activeToken1);
        await AddRefreshTokenToDatabase(activeToken2);
        
        // Create already revoked token
        var revokedToken = CreateValidRefreshToken(user, DateTime.UtcNow.AddDays(1));
        revokedToken.Revoke("Already revoked");
        await AddRefreshTokenToDatabase(revokedToken);

        var reason = "User requested logout";

        // Act
        var result = await _refreshTokenRepository.RevokeAllUserTokensAsync(user.Id, reason);
        await DbContext.SaveChangesAsync();

        // Assert
        result.Should().Be(2);
        
        DetachAllEntities();
        var userTokens = await _refreshTokenRepository.GetByUserIdAsync(user.Id);
        userTokens.Where(rt => rt.Token == activeToken1.Token || rt.Token == activeToken2.Token)
                  .Should().OnlyContain(rt => rt.IsRevoked && rt.RevokedReason == reason);
    }

    [Fact]
    public async Task RevokeAllUserTokensAsync_WithNoActiveTokens_ShouldReturnZero()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        
        // Create only expired/revoked tokens
        var expiredToken = CreateValidRefreshToken(user, DateTime.UtcNow.AddDays(-1));
        await AddRefreshTokenToDatabase(expiredToken);

        // Act
        var result = await _refreshTokenRepository.RevokeAllUserTokensAsync(user.Id);

        // Assert
        result.Should().Be(0);
    }

    #region Helper Methods

    /// <summary>
    /// Creates a valid refresh token for testing.
    /// </summary>
    private RefreshToken CreateValidRefreshToken(User user, DateTime? expiresAt = null)
    {
        var expires = expiresAt ?? DateTime.UtcNow.AddDays(7);
        return new RefreshToken(Faker.Random.AlphaNumeric(32), user.Id, expires);
    }

    /// <summary>
    /// Adds a refresh token to the database and saves changes.
    /// </summary>
    private async Task<RefreshToken> AddRefreshTokenToDatabase(RefreshToken refreshToken)
    {
        DbContext.RefreshTokens.Add(refreshToken);
        await DbContext.SaveChangesAsync();
        DbContext.ChangeTracker.Clear();
        return refreshToken;
    }

    /// <summary>
    /// Gets a refresh token from the database by token string.
    /// </summary>
    private async Task<RefreshToken?> GetRefreshTokenFromDatabase(string token)
    {
        return await DbContext.RefreshTokens.AsNoTracking()
            .FirstOrDefaultAsync(rt => rt.Token == token);
    }

    #endregion
}