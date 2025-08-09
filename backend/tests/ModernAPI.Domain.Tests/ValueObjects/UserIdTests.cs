using FluentAssertions;
using Xunit;
using ModernAPI.Domain.Tests.Common;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Domain.Tests.ValueObjects;

/// <summary>
/// Tests for UserId value object validation and behavior.
/// </summary>
public class UserIdTests : DomainTestBase
{
    [Fact]
    public void Constructor_WithValidGuid_ShouldCreateUserId()
    {
        // Arrange
        var guidValue = Guid.NewGuid();

        // Act
        var userId = new UserId(guidValue);

        // Assert
        userId.Value.Should().Be(guidValue);
    }

    [Fact]
    public void Constructor_WithEmptyGuid_ShouldThrowArgumentException()
    {
        // Arrange
        var emptyGuid = Guid.Empty;

        // Act & Assert
        var exception = Assert.Throws<ArgumentException>(() => new UserId(emptyGuid));
        exception.Message.Should().Contain("User ID cannot be empty");
    }

    [Fact]
    public void New_ShouldCreateUniqueUserIds()
    {
        // Act
        var userId1 = UserId.New();
        var userId2 = UserId.New();

        // Assert
        userId1.Should().NotBe(userId2);
        userId1.Value.Should().NotBe(Guid.Empty);
        userId2.Value.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public void FromString_WithValidGuidString_ShouldCreateUserId()
    {
        // Arrange
        var guid = Guid.NewGuid();
        var guidString = guid.ToString();

        // Act
        var userId = UserId.FromString(guidString);

        // Assert
        userId.Value.Should().Be(guid);
    }

    [Theory]
    [InlineData("invalid-guid")]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("12345")]
    public void FromString_WithInvalidGuidString_ShouldThrowFormatException(string invalidGuidString)
    {
        // Act & Assert
        Assert.Throws<FormatException>(() => UserId.FromString(invalidGuidString));
    }

    [Fact]
    public void TryFromString_WithValidGuidString_ShouldReturnTrueAndUserId()
    {
        // Arrange
        var guid = Guid.NewGuid();
        var guidString = guid.ToString();

        // Act
        var result = UserId.TryFromString(guidString, out var userId);

        // Assert
        result.Should().BeTrue();
        userId.Should().NotBeNull();
        userId!.Value.Should().Be(guid);
    }

    [Theory]
    [InlineData("invalid-guid")]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("12345")]
    public void TryFromString_WithInvalidGuidString_ShouldReturnFalseAndNull(string invalidGuidString)
    {
        // Act
        var result = UserId.TryFromString(invalidGuidString, out var userId);

        // Assert
        result.Should().BeFalse();
        userId.Should().BeNull();
    }

    [Fact]
    public void TryFromString_WithEmptyGuid_ShouldReturnFalseAndNull()
    {
        // Arrange
        var emptyGuidString = Guid.Empty.ToString();

        // Act
        var result = UserId.TryFromString(emptyGuidString, out var userId);

        // Assert
        result.Should().BeFalse();
        userId.Should().BeNull();
    }

    [Fact]
    public void Equals_WithSameValue_ShouldReturnTrue()
    {
        // Arrange
        var guid = Guid.NewGuid();
        var userId1 = new UserId(guid);
        var userId2 = new UserId(guid);

        // Act & Assert
        userId1.Should().Be(userId2);
        userId1.GetHashCode().Should().Be(userId2.GetHashCode());
    }

    [Fact]
    public void Equals_WithDifferentValue_ShouldReturnFalse()
    {
        // Arrange
        var userId1 = UserId.New();
        var userId2 = UserId.New();

        // Act & Assert
        userId1.Should().NotBe(userId2);
    }

    [Fact]
    public void ImplicitConversion_ToGuid_ShouldReturnGuidValue()
    {
        // Arrange
        var guid = Guid.NewGuid();
        var userId = new UserId(guid);

        // Act
        Guid convertedGuid = userId;

        // Assert
        convertedGuid.Should().Be(guid);
    }

    [Fact]
    public void ExplicitConversion_FromGuid_ShouldCreateUserId()
    {
        // Arrange
        var guid = Guid.NewGuid();

        // Act
        var userId = (UserId)guid;

        // Assert
        userId.Value.Should().Be(guid);
    }

    [Fact]
    public void ExplicitConversion_FromEmptyGuid_ShouldThrowArgumentException()
    {
        // Arrange
        var emptyGuid = Guid.Empty;

        // Act & Assert
        var exception = Assert.Throws<ArgumentException>(() => (UserId)emptyGuid);
        exception.Message.Should().Contain("User ID cannot be empty");
    }

    [Fact]
    public void ToString_ShouldReturnGuidString()
    {
        // Arrange
        var guid = Guid.NewGuid();
        var userId = new UserId(guid);

        // Act
        var result = userId.ToString();

        // Assert
        result.Should().Be(guid.ToString());
    }
}