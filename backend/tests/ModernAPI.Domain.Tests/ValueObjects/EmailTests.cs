using FluentAssertions;
using Xunit;
using ModernAPI.Domain.Exceptions;
using ModernAPI.Domain.Tests.Common;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Domain.Tests.ValueObjects;

/// <summary>
/// Tests for Email value object validation and behavior.
/// </summary>
public class EmailTests : DomainTestBase
{
    [Theory]
    [InlineData("user@example.com")]
    [InlineData("test.email@domain.co.uk")]
    [InlineData("user+tag@example.org")]
    [InlineData("firstname.lastname@company.com")]
    public void Constructor_WithValidEmail_ShouldCreateEmail(string validEmailAddress)
    {
        // Act
        var email = new Email(validEmailAddress);

        // Assert
        email.Value.Should().Be(validEmailAddress.ToLowerInvariant());
    }

    [Theory]
    [InlineData("invalid-email")]
    [InlineData("@domain.com")]
    [InlineData("user@")]
    [InlineData("user..name@domain.com")]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void Constructor_WithInvalidEmail_ShouldThrowArgumentException(string? invalidEmailAddress)
    {
        // Act & Assert
        var exception = Assert.Throws<ArgumentException>(() => new Email(invalidEmailAddress!));
        exception.Message.Should().Contain("address");
    }

    [Fact]
    public void Constructor_ShouldNormalizeEmailToLowercase()
    {
        // Arrange
        var mixedCaseEmail = "User@EXAMPLE.COM";

        // Act
        var email = new Email(mixedCaseEmail);

        // Assert
        email.Value.Should().Be("user@example.com");
    }

    [Fact]
    public void Equals_WithSameValue_ShouldReturnTrue()
    {
        // Arrange
        var email1 = new Email("user@example.com");
        var email2 = new Email("USER@EXAMPLE.COM"); // Different case

        // Act & Assert
        email1.Should().Be(email2);
        email1.GetHashCode().Should().Be(email2.GetHashCode());
    }

    [Fact]
    public void Equals_WithDifferentValue_ShouldReturnFalse()
    {
        // Arrange
        var email1 = new Email("user1@example.com");
        var email2 = new Email("user2@example.com");

        // Act & Assert
        email1.Should().NotBe(email2);
    }

    [Fact]
    public void ToString_ShouldReturnEmailValue()
    {
        // Arrange
        var emailValue = "user@example.com";
        var email = new Email(emailValue);

        // Act
        var result = email.ToString();

        // Assert
        result.Should().Be(emailValue);
    }

    [Fact]
    public void ImplicitConversion_FromString_ShouldCreateEmail()
    {
        // Arrange
        var emailValue = "user@example.com";

        // Act
        Email email = new Email(emailValue);

        // Assert
        email.Value.Should().Be(emailValue);
    }

    [Fact]
    public void ImplicitConversion_ToString_ShouldReturnEmailValue()
    {
        // Arrange
        var email = new Email("user@example.com");

        // Act
        string emailValue = email;

        // Assert
        emailValue.Should().Be("user@example.com");
    }
}