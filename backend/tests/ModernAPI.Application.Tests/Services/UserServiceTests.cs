using FluentAssertions;
using Xunit;
using ModernAPI.Application.Common.Exceptions;
using ModernAPI.Application.DTOs;
using ModernAPI.Application.Services;
using ModernAPI.Application.Tests.Common;
using ModernAPI.Domain.ValueObjects;
using Moq;

namespace ModernAPI.Application.Tests.Services;

/// <summary>
/// Tests for UserService application layer logic.
/// </summary>
public class UserServiceTests : ApplicationTestBase
{
    private readonly UserService _userService;

    public UserServiceTests()
    {
        var mockLogger = new Mock<Microsoft.Extensions.Logging.ILogger<UserService>>();
        _userService = new UserService(MockUnitOfWork.Object, Mapper, mockLogger.Object);
    }

    [Fact]
    public async Task CreateUserAsync_WithValidRequest_ShouldCreateUser()
    {
        // Arrange
        var request = CreateValidCreateUserRequest();
        var email = new Email(request.Email);
        SetupUserRepositoryEmailNotExists(email);

        // Act
        var result = await _userService.CreateUserAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.User.Email.Should().Be(request.Email);
        result.User.DisplayName.Should().Be(request.DisplayName);
        result.User.FirstName.Should().Be(request.FirstName);
        result.User.LastName.Should().Be(request.LastName);
        result.Message.Should().Be("User created successfully");
        
        VerifyUserWasAdded();
        VerifyUnitOfWorkSaveChangesWasCalled();
    }

    [Fact]
    public async Task CreateUserAsync_WithExistingEmail_ShouldThrowConflictException()
    {
        // Arrange
        var request = CreateValidCreateUserRequest();
        var email = new Email(request.Email);
        SetupUserRepositoryEmailExists(email);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() => 
            _userService.CreateUserAsync(request));
        
        exception.Message.Should().Contain("User with email");
        exception.Message.Should().Contain(request.Email);
    }

    [Fact]
    public async Task GetUserByIdAsync_WithExistingUser_ShouldReturnUser()
    {
        // Arrange
        var user = CreateValidUser();
        SetupUserRepositoryGetById(user);

        // Act
        var result = await _userService.GetUserByIdAsync(user.Id);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(user.Id);
        result.Email.Should().Be(user.Email);
        result.DisplayName.Should().Be(user.DisplayName);
    }

    [Fact]
    public async Task GetUserByIdAsync_WithNonExistentUser_ShouldThrowNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        SetupUserRepositoryGetByIdReturnsNull(userId);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => 
            _userService.GetUserByIdAsync(userId));
        
        exception.Message.Should().Contain("User");
        exception.Message.Should().Contain(userId.ToString());
    }

    [Fact]
    public async Task UpdateUserProfileAsync_WithValidRequest_ShouldUpdateUser()
    {
        // Arrange
        var user = CreateValidUser();
        var request = CreateValidUpdateUserProfileRequest();
        SetupUserRepositoryGetById(user);

        // Act
        var result = await _userService.UpdateUserProfileAsync(user.Id, request);

        // Assert
        result.Should().NotBeNull();
        result.User.DisplayName.Should().Be(request.DisplayName);
        result.User.FirstName.Should().Be(request.FirstName);
        result.User.LastName.Should().Be(request.LastName);
        result.Message.Should().Be("User profile updated successfully");
        
        VerifyUserWasUpdated();
        VerifyUnitOfWorkSaveChangesWasCalled();
    }

    [Fact]
    public async Task UpdateUserProfileAsync_WithNonExistentUser_ShouldThrowNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var request = CreateValidUpdateUserProfileRequest();
        SetupUserRepositoryGetByIdReturnsNull(userId);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => 
            _userService.UpdateUserProfileAsync(userId, request));
        
        exception.Message.Should().Contain("User");
        exception.Message.Should().Contain(userId.ToString());
    }

    [Fact]
    public async Task ChangeUserEmailAsync_WithValidRequest_ShouldChangeEmail()
    {
        // Arrange
        var user = CreateValidUser();
        var request = CreateValidChangeUserEmailRequest();
        var newEmail = new Email(request.NewEmail);
        
        SetupUserRepositoryGetById(user);
        SetupUserRepositoryEmailNotExists(newEmail);

        // Act
        var result = await _userService.ChangeUserEmailAsync(user.Id, request);

        // Assert
        result.Should().NotBeNull();
        result.User.Email.Should().Be(request.NewEmail);
        result.Message.Should().Be("User email changed successfully");
        
        VerifyUserWasUpdated();
        VerifyUnitOfWorkSaveChangesWasCalled();
    }

    [Fact]
    public async Task ChangeUserEmailAsync_WithExistingEmail_ShouldThrowConflictException()
    {
        // Arrange
        var user = CreateValidUser();
        var request = CreateValidChangeUserEmailRequest();
        var newEmail = new Email(request.NewEmail);
        
        SetupUserRepositoryGetById(user);
        SetupUserRepositoryEmailExists(newEmail);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() => 
            _userService.ChangeUserEmailAsync(user.Id, request));
        
        exception.Message.Should().Contain("User with email");
        exception.Message.Should().Contain(request.NewEmail);
    }

    [Fact]
    public async Task VerifyUserEmailAsync_WithUnverifiedUser_ShouldVerifyEmail()
    {
        // Arrange
        var user = CreateValidUser();
        user.IsEmailVerified.Should().BeFalse(); // Precondition
        SetupUserRepositoryGetById(user);

        // Act
        var result = await _userService.VerifyUserEmailAsync(user.Id);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Message.Should().Be("User email verified successfully");
        
        VerifyUserWasUpdated();
        VerifyUnitOfWorkSaveChangesWasCalled();
    }

    [Fact]
    public async Task DeactivateUserAsync_WithActiveUser_ShouldDeactivateUser()
    {
        // Arrange
        var user = CreateValidUser();
        user.IsActive.Should().BeTrue(); // Precondition
        SetupUserRepositoryGetById(user);

        // Act
        var result = await _userService.DeactivateUserAsync(user.Id);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Message.Should().Be("User deactivated successfully");
        
        VerifyUserWasUpdated();
        VerifyUnitOfWorkSaveChangesWasCalled();
    }

    [Fact]
    public async Task ReactivateUserAsync_WithInactiveUser_ShouldReactivateUser()
    {
        // Arrange
        var user = CreateValidUser();
        user.Deactivate(); // Make inactive first
        SetupUserRepositoryGetById(user);

        // Act
        var result = await _userService.ReactivateUserAsync(user.Id);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Message.Should().Be("User reactivated successfully");
        
        VerifyUserWasUpdated();
        VerifyUnitOfWorkSaveChangesWasCalled();
    }
}