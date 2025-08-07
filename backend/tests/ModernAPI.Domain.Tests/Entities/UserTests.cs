using FluentAssertions;
using Xunit;
using ModernAPI.Domain.Entities;
using ModernAPI.Domain.Events;
using ModernAPI.Domain.Exceptions;
using ModernAPI.Domain.Tests.Common;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Domain.Tests.Entities;

/// <summary>
/// Tests for User entity business logic, validation, and domain events.
/// </summary>
public class UserTests : DomainTestBase
{
    [Fact]
    public void Constructor_WithValidParameters_ShouldCreateUser()
    {
        // Arrange
        var email = CreateValidEmail();
        var displayName = CreateValidDisplayName();
        var firstName = CreateValidFirstName();
        var lastName = CreateValidLastName();

        // Act
        var user = new User(email, displayName, firstName, lastName);

        // Assert
        user.Email.Should().Be(email.Value);
        user.DisplayName.Should().Be(displayName);
        user.FirstName.Should().Be(firstName);
        user.LastName.Should().Be(lastName);
        user.IsActive.Should().BeTrue();
        user.IsEmailVerified.Should().BeFalse();
        user.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        user.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Constructor_WithValidParameters_ShouldRaiseUserCreatedEvent()
    {
        // Arrange
        var email = CreateValidEmail();
        var displayName = CreateValidDisplayName();
        var firstName = CreateValidFirstName();
        var lastName = CreateValidLastName();

        // Act
        var user = new User(email, displayName, firstName, lastName);

        // Assert
        var domainEvent = AssertDomainEventRaised<UserCreatedEvent>(user);
        domainEvent.UserId.Should().Be(user.Id);
        domainEvent.Email.Should().Be(email);
        domainEvent.DisplayName.Should().Be(displayName);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void Constructor_WithInvalidDisplayName_ShouldThrowArgumentException(string? invalidDisplayName)
    {
        // Arrange
        var email = CreateValidEmail();
        var firstName = CreateValidFirstName();
        var lastName = CreateValidLastName();

        // Act & Assert
        var exception = Assert.Throws<ArgumentException>(() => 
            new User(email, invalidDisplayName!, firstName, lastName));
        
        exception.Message.Should().Contain("Display name");
    }

    [Fact]
    public void Constructor_WithNullFirstName_ShouldSucceed()
    {
        // Arrange
        var email = CreateValidEmail();
        var displayName = CreateValidDisplayName();
        var lastName = CreateValidLastName();

        // Act & Assert (should not throw)
        var user = new User(email, displayName, null, lastName);
        user.FirstName.Should().BeNull();
        user.LastName.Should().Be(lastName);
    }

    [Fact]
    public void UpdateProfile_WithValidData_ShouldUpdateProperties()
    {
        // Arrange
        var user = CreateValidUser();
        var newDisplayName = CreateValidDisplayName();
        var newFirstName = CreateValidFirstName();
        var newLastName = CreateValidLastName();
        var originalUpdatedAt = user.UpdatedAt;

        // Act
        user.UpdateProfile(newDisplayName, newFirstName, newLastName);

        // Assert
        user.DisplayName.Should().Be(newDisplayName);
        user.FirstName.Should().Be(newFirstName);
        user.LastName.Should().Be(newLastName);
        user.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    [Fact]
    public void UpdateProfile_WithValidData_ShouldRaiseUserDisplayNameUpdatedEvent()
    {
        // Arrange
        var user = CreateValidUser();
        user.ClearDomainEvents(); // Clear creation event
        var newDisplayName = CreateValidDisplayName();
        var newFirstName = CreateValidFirstName();
        var newLastName = CreateValidLastName();

        // Act
        user.UpdateProfile(newDisplayName, newFirstName, newLastName);

        // Assert - Should raise display name updated event
        var displayNameEvent = AssertDomainEventRaised<UserDisplayNameUpdatedEvent>(user);
        displayNameEvent.UserId.Should().Be(user.Id);
        displayNameEvent.NewDisplayName.Should().Be(newDisplayName);

        // Assert - Should also raise names updated event
        var namesEvent = AssertDomainEventRaised<UserNamesUpdatedEvent>(user);
        namesEvent.UserId.Should().Be(user.Id);
        namesEvent.FirstName.Should().Be(newFirstName);
        namesEvent.LastName.Should().Be(newLastName);
    }

    [Fact]
    public void ChangeEmail_WithValidEmail_ShouldUpdateEmail()
    {
        // Arrange
        var user = CreateValidUser();
        var newEmail = CreateValidEmail();
        var originalUpdatedAt = user.UpdatedAt;

        // Act
        user.ChangeEmail(newEmail);

        // Assert
        user.Email.Should().Be(newEmail.Value);
        user.IsEmailVerified.Should().BeFalse(); // Should reset verification status
        user.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    [Fact]
    public void ChangeEmail_WithValidEmail_ShouldRaiseUserEmailChangedEvent()
    {
        // Arrange
        var user = CreateValidUser();
        user.ClearDomainEvents(); // Clear creation event
        var newEmail = CreateValidEmail();

        // Act
        user.ChangeEmail(newEmail);

        // Assert
        var domainEvent = AssertDomainEventRaised<UserEmailChangedEvent>(user);
        domainEvent.UserId.Should().Be(user.Id);
        domainEvent.NewEmail.Should().Be(newEmail);
    }

    [Fact]
    public void VerifyEmail_WhenNotVerified_ShouldSetEmailVerified()
    {
        // Arrange
        var user = CreateValidUser();
        user.IsEmailVerified.Should().BeFalse(); // Precondition
        var originalUpdatedAt = user.UpdatedAt;

        // Act
        user.VerifyEmail();

        // Assert
        user.IsEmailVerified.Should().BeTrue();
        user.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    [Fact]
    public void VerifyEmail_WhenNotVerified_ShouldRaiseUserEmailVerifiedEvent()
    {
        // Arrange
        var user = CreateValidUser();
        user.ClearDomainEvents(); // Clear creation event

        // Act
        user.VerifyEmail();

        // Assert
        var domainEvent = AssertDomainEventRaised<UserEmailVerifiedEvent>(user);
        domainEvent.UserId.Should().Be(user.Id);
    }

    [Fact]
    public void VerifyEmail_WhenAlreadyVerified_ShouldThrowDomainException()
    {
        // Arrange
        var user = CreateValidUser();
        user.VerifyEmail(); // First verification
        user.ClearDomainEvents();

        // Act & Assert
        var exception = Assert.Throws<EmailAlreadyVerifiedException>(() => user.VerifyEmail());
        
        // Should not raise additional events
        AssertNoDomainEventsRaised(user);
    }

    [Fact]
    public void Deactivate_WhenActive_ShouldSetInactive()
    {
        // Arrange
        var user = CreateValidUser();
        user.IsActive.Should().BeTrue(); // Precondition
        var originalUpdatedAt = user.UpdatedAt;

        // Act
        user.Deactivate();

        // Assert
        user.IsActive.Should().BeFalse();
        user.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    [Fact]
    public void Deactivate_WhenActive_ShouldRaiseUserDeactivatedEvent()
    {
        // Arrange
        var user = CreateValidUser();
        user.ClearDomainEvents(); // Clear creation event

        // Act
        user.Deactivate();

        // Assert
        var domainEvent = AssertDomainEventRaised<UserDeactivatedEvent>(user);
        domainEvent.UserId.Should().Be(user.Id);
    }

    [Fact]
    public void Deactivate_WhenAlreadyInactive_ShouldThrowDomainException()
    {
        // Arrange
        var user = CreateValidUser();
        user.Deactivate(); // First deactivation
        user.ClearDomainEvents();

        // Act & Assert
        var exception = Assert.Throws<UserAlreadyDeactivatedException>(() => user.Deactivate());
        
        // Should not raise additional events
        AssertNoDomainEventsRaised(user);
    }

    [Fact]
    public void Reactivate_WhenInactive_ShouldSetActive()
    {
        // Arrange
        var user = CreateValidUser();
        user.Deactivate();
        user.ClearDomainEvents();
        var originalUpdatedAt = user.UpdatedAt;

        // Act
        user.Reactivate();

        // Assert
        user.IsActive.Should().BeTrue();
        user.UpdatedAt.Should().BeOnOrAfter(originalUpdatedAt);
    }

    [Fact]
    public void Reactivate_WhenInactive_ShouldRaiseUserReactivatedEvent()
    {
        // Arrange
        var user = CreateValidUser();
        user.Deactivate();
        user.ClearDomainEvents();

        // Act
        user.Reactivate();

        // Assert
        var domainEvent = AssertDomainEventRaised<UserReactivatedEvent>(user);
        domainEvent.UserId.Should().Be(user.Id);
    }

    [Fact]
    public void Reactivate_WhenAlreadyActive_ShouldThrowDomainException()
    {
        // Arrange
        var user = CreateValidUser();
        user.IsActive.Should().BeTrue(); // Precondition

        // Act & Assert
        var exception = Assert.Throws<UserAlreadyActiveException>(() => user.Reactivate());
    }
}