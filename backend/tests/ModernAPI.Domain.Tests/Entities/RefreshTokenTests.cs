using FluentAssertions;
using Xunit;
using ModernAPI.Domain.Entities;
using ModernAPI.Domain.Tests.Common;

namespace ModernAPI.Domain.Tests.Entities;

/// <summary>
/// Tests for RefreshToken entity business logic and validation.
/// </summary>
public class RefreshTokenTests : DomainTestBase
{
    [Fact]
    public void Constructor_WithValidParameters_ShouldCreateRefreshToken()
    {
        // Arrange
        var token = CreateValidTokenString();
        var userId = Guid.NewGuid();
        var expiresAt = DateTime.UtcNow.AddDays(30);

        // Act
        var refreshToken = new RefreshToken(token, userId, expiresAt);

        // Assert
        refreshToken.Token.Should().Be(token);
        refreshToken.UserId.Should().Be(userId);
        refreshToken.ExpiresAt.Should().Be(expiresAt);
        refreshToken.IsRevoked.Should().BeFalse();
        refreshToken.RevokedAt.Should().BeNull();
        refreshToken.RevokedReason.Should().BeNull();
        refreshToken.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        refreshToken.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        refreshToken.Id.Should().NotBe(Guid.Empty);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void Constructor_WithInvalidToken_ShouldThrowArgumentException(string? invalidToken)
    {
        // Arrange
        var userId = Guid.NewGuid();
        var expiresAt = DateTime.UtcNow.AddDays(30);

        // Act & Assert
        var exception = Assert.Throws<ArgumentException>(() => 
            new RefreshToken(invalidToken!, userId, expiresAt));
        
        exception.Message.Should().Contain("Token cannot be null or empty");
    }

    [Fact]
    public void Constructor_WithEmptyUserId_ShouldThrowArgumentException()
    {
        // Arrange
        var token = CreateValidTokenString();
        var emptyUserId = Guid.Empty;
        var expiresAt = DateTime.UtcNow.AddDays(30);

        // Act & Assert
        var exception = Assert.Throws<ArgumentException>(() => 
            new RefreshToken(token, emptyUserId, expiresAt));
        
        exception.Message.Should().Contain("User ID cannot be empty");
    }

    [Fact]
    public void Constructor_WithPastExpirationDate_ShouldThrowArgumentException()
    {
        // Arrange
        var token = CreateValidTokenString();
        var userId = Guid.NewGuid();
        var pastExpirationDate = DateTime.UtcNow.AddDays(-1);

        // Act & Assert
        var exception = Assert.Throws<ArgumentException>(() => 
            new RefreshToken(token, userId, pastExpirationDate));
        
        exception.Message.Should().Contain("Token must expire in the future");
    }

    [Fact]
    public void Constructor_WithCurrentTime_ShouldThrowArgumentException()
    {
        // Arrange
        var token = CreateValidTokenString();
        var userId = Guid.NewGuid();
        var currentTime = DateTime.UtcNow;

        // Act & Assert
        var exception = Assert.Throws<ArgumentException>(() => 
            new RefreshToken(token, userId, currentTime));
        
        exception.Message.Should().Contain("Token must expire in the future");
    }

    [Fact]
    public void IsValid_WhenNotRevokedAndNotExpired_ShouldReturnTrue()
    {
        // Arrange
        var refreshToken = CreateValidRefreshToken();

        // Act
        var isValid = refreshToken.IsValid();

        // Assert
        isValid.Should().BeTrue();
    }

    [Fact]
    public void IsValid_WhenRevoked_ShouldReturnFalse()
    {
        // Arrange
        var refreshToken = CreateValidRefreshToken();
        refreshToken.Revoke();

        // Act
        var isValid = refreshToken.IsValid();

        // Assert
        isValid.Should().BeFalse();
    }

    [Fact]
    public void IsValid_WhenExpired_ShouldReturnFalse()
    {
        // Arrange
        var token = CreateValidTokenString();
        var userId = Guid.NewGuid();
        var expiresAt = DateTime.UtcNow.AddMilliseconds(1); // Very short expiration
        var refreshToken = new RefreshToken(token, userId, expiresAt);
        
        // Wait for expiration
        Thread.Sleep(2);

        // Act
        var isValid = refreshToken.IsValid();

        // Assert
        isValid.Should().BeFalse();
    }

    [Fact]
    public void IsExpired_WhenExpired_ShouldReturnTrue()
    {
        // Arrange
        var token = CreateValidTokenString();
        var userId = Guid.NewGuid();
        var expiresAt = DateTime.UtcNow.AddSeconds(1); // Short but safe expiration
        var refreshToken = new RefreshToken(token, userId, expiresAt);
        
        // Wait for expiration
        Thread.Sleep(1100); // Wait slightly longer than 1 second

        // Act
        var isExpired = refreshToken.IsExpired();

        // Assert
        isExpired.Should().BeTrue();
    }

    [Fact]
    public void IsExpired_WhenNotExpired_ShouldReturnFalse()
    {
        // Arrange
        var refreshToken = CreateValidRefreshToken();

        // Act
        var isExpired = refreshToken.IsExpired();

        // Assert
        isExpired.Should().BeFalse();
    }

    [Fact]
    public void Revoke_WhenNotRevoked_ShouldRevokeToken()
    {
        // Arrange
        var refreshToken = CreateValidRefreshToken();
        var reason = "User logout";
        var originalUpdatedAt = refreshToken.UpdatedAt;

        // Small delay to ensure different timestamp
        Thread.Sleep(1);

        // Act
        refreshToken.Revoke(reason);

        // Assert
        refreshToken.IsRevoked.Should().BeTrue();
        refreshToken.RevokedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        refreshToken.RevokedReason.Should().Be(reason);
        refreshToken.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    [Fact]
    public void Revoke_WithDefaultReason_ShouldUseDefaultMessage()
    {
        // Arrange
        var refreshToken = CreateValidRefreshToken();

        // Act
        refreshToken.Revoke();

        // Assert
        refreshToken.IsRevoked.Should().BeTrue();
        refreshToken.RevokedReason.Should().Be("Token revoked");
    }

    [Fact]
    public void Revoke_WhenAlreadyRevoked_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var refreshToken = CreateValidRefreshToken();
        refreshToken.Revoke(); // First revocation

        // Act & Assert
        var exception = Assert.Throws<InvalidOperationException>(() => refreshToken.Revoke());
        exception.Message.Should().Contain("Token is already revoked");
    }

    [Fact]
    public void Revoke_ShouldMakeTokenInvalid()
    {
        // Arrange
        var refreshToken = CreateValidRefreshToken();
        refreshToken.IsValid().Should().BeTrue(); // Precondition

        // Act
        refreshToken.Revoke();

        // Assert
        refreshToken.IsValid().Should().BeFalse();
    }

    [Fact]
    public void Id_ShouldBeUniqueForEachToken()
    {
        // Arrange & Act
        var refreshToken1 = CreateValidRefreshToken();
        var refreshToken2 = CreateValidRefreshToken();

        // Assert
        refreshToken1.Id.Should().NotBe(refreshToken2.Id);
        refreshToken1.Id.Should().NotBe(Guid.Empty);
        refreshToken2.Id.Should().NotBe(Guid.Empty);
    }

    // Helper methods

    private string CreateValidTokenString()
    {
        return Faker.Random.AlphaNumeric(64);
    }

    private RefreshToken CreateValidRefreshToken()
    {
        return new RefreshToken(
            CreateValidTokenString(), 
            Guid.NewGuid(), 
            DateTime.UtcNow.AddDays(30));
    }
}