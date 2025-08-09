using FluentAssertions;
using Xunit;
using Microsoft.AspNetCore.JsonPatch;
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
        result.User.Email.Should().Be(request.Email.ToLowerInvariant());
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
        
        exception.Message.Should().Be("A user with this email address already exists");
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
        result.Message.Should().Be("Profile updated successfully");
        
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
        result.User.Email.Should().Be(request.NewEmail.ToLowerInvariant());
        result.Message.Should().Be("Email changed successfully. Please verify your new email address.");
        
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
        // Mock that another user exists with this email
        var existingUser = CreateValidUser();
        MockUserRepository
            .Setup(x => x.GetByEmailAsync(newEmail, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() => 
            _userService.ChangeUserEmailAsync(user.Id, request));
        
        exception.Message.Should().Be("A user with this email address already exists");
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
        result.Message.Should().Be("Email verified successfully");
        
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
        result.Message.Should().Be("User account deactivated successfully");
        
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
        result.Message.Should().Be("User account reactivated successfully");
        
        VerifyUserWasUpdated();
        VerifyUnitOfWorkSaveChangesWasCalled();
    }

    [Fact]
    public async Task PatchUserProfileAsync_WithValidPatchDocument_ShouldUpdateUser()
    {
        // Arrange
        var user = CreateValidUser();
        var patchDocument = new JsonPatchDocument<PatchUserProfileRequest>();
        patchDocument.Replace(x => x.DisplayName, "Updated Display Name");
        patchDocument.Replace(x => x.FirstName, "Updated First");
        
        SetupUserRepositoryGetById(user);

        // Act
        var result = await _userService.PatchUserProfileAsync(user.Id, patchDocument);

        // Assert
        result.Should().NotBeNull();
        result.User.DisplayName.Should().Be("Updated Display Name");
        result.User.FirstName.Should().Be("Updated First");
        result.User.LastName.Should().Be(user.LastName); // Unchanged
        result.Message.Should().Be("Profile updated successfully");
        
        VerifyUserWasUpdated();
        VerifyUnitOfWorkSaveChangesWasCalled();
    }

    [Fact]
    public async Task PatchUserProfileAsync_WithInvalidOperation_ShouldThrowValidationException()
    {
        // Arrange
        var user = CreateValidUser();
        var patchDocument = new JsonPatchDocument<PatchUserProfileRequest>();
        patchDocument.Operations.Add(new Microsoft.AspNetCore.JsonPatch.Operations.Operation<PatchUserProfileRequest>("replace", "/invalidpath", null, "some value")); // Invalid path
        
        SetupUserRepositoryGetById(user);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ValidationException>(() => 
            _userService.PatchUserProfileAsync(user.Id, patchDocument));
        
        exception.ValidationErrors.Should().ContainKey("Path");
        exception.ValidationErrors["Path"].Should().Contain("Path '/invalidpath' is not allowed for patching");
    }

    [Fact]
    public async Task PatchUserProfileAsync_WithForbiddenOperation_ShouldThrowValidationException()
    {
        // Arrange
        var user = CreateValidUser();
        var patchDocument = new JsonPatchDocument<PatchUserProfileRequest>();
        patchDocument.Operations.Add(new Microsoft.AspNetCore.JsonPatch.Operations.Operation<PatchUserProfileRequest>("test", "/displayName", null, "test")); // Test operation not allowed
        
        SetupUserRepositoryGetById(user);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ValidationException>(() => 
            _userService.PatchUserProfileAsync(user.Id, patchDocument));
        
        exception.ValidationErrors.Should().ContainKey("Operation");
        exception.ValidationErrors["Operation"].Should().Contain("Operation 'test' is not allowed");
    }

    [Fact]
    public async Task PatchUserProfileAsync_WithNullDisplayName_ShouldThrowValidationException()
    {
        // Arrange
        var user = CreateValidUser();
        var patchDocument = new JsonPatchDocument<PatchUserProfileRequest>();
        patchDocument.Replace(x => x.DisplayName, null); // Null display name not allowed
        
        SetupUserRepositoryGetById(user);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ValidationException>(() => 
            _userService.PatchUserProfileAsync(user.Id, patchDocument));
        
        exception.ValidationErrors.Should().ContainKey("DisplayName");
        exception.ValidationErrors["DisplayName"].Should().Contain("DisplayName cannot be null");
    }

    [Fact]
    public async Task PatchUserProfileAsync_WithRemoveDisplayName_ShouldThrowValidationException()
    {
        // Arrange
        var user = CreateValidUser();
        var patchDocument = new JsonPatchDocument<PatchUserProfileRequest>();
        patchDocument.Remove(x => x.DisplayName); // Removing display name not allowed
        
        SetupUserRepositoryGetById(user);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ValidationException>(() => 
            _userService.PatchUserProfileAsync(user.Id, patchDocument));
        
        exception.ValidationErrors.Should().ContainKey("DisplayName");
        exception.ValidationErrors["DisplayName"].Should().Contain("DisplayName cannot be removed");
    }

    [Fact]
    public async Task PatchUserProfileAsync_WithInvalidResultingData_ShouldThrowValidationException()
    {
        // Arrange
        var user = CreateValidUser();
        var patchDocument = new JsonPatchDocument<PatchUserProfileRequest>();
        patchDocument.Replace(x => x.DisplayName, ""); // Empty display name is invalid
        
        SetupUserRepositoryGetById(user);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ValidationException>(() => 
            _userService.PatchUserProfileAsync(user.Id, patchDocument));
        
        exception.ValidationErrors.Should().NotBeEmpty();
        // The specific validation error content may vary, so just check that validation errors exist
        exception.Message.Should().Be("One or more validation errors occurred");
    }

    [Fact]
    public async Task PatchUserProfileAsync_WithNonExistentUser_ShouldThrowNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var patchDocument = new JsonPatchDocument<PatchUserProfileRequest>();
        patchDocument.Replace(x => x.DisplayName, "Updated Name");
        
        SetupUserRepositoryGetByIdReturnsNull(userId);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => 
            _userService.PatchUserProfileAsync(userId, patchDocument));
        
        exception.Message.Should().Contain("User");
        exception.Message.Should().Contain(userId.ToString());
    }

    [Fact]
    public async Task PatchUserProfileAsync_WithRemoveFirstName_ShouldSetFirstNameToNull()
    {
        // Arrange
        var user = CreateValidUser();
        var patchDocument = new JsonPatchDocument<PatchUserProfileRequest>();
        patchDocument.Remove(x => x.FirstName); // Removing first name is allowed
        
        SetupUserRepositoryGetById(user);

        // Act
        var result = await _userService.PatchUserProfileAsync(user.Id, patchDocument);

        // Assert
        result.Should().NotBeNull();
        result.User.FirstName.Should().BeNull();
        result.User.DisplayName.Should().Be(user.DisplayName); // Unchanged
        result.User.LastName.Should().Be(user.LastName); // Unchanged
        
        VerifyUserWasUpdated();
        VerifyUnitOfWorkSaveChangesWasCalled();
    }

    [Fact]
    public async Task PatchUserProfileAsync_WithAddLastName_ShouldAddLastName()
    {
        // Arrange
        var user = CreateValidUser();
        user.UpdateNames(user.FirstName, null); // Start with null last name
        var patchDocument = new JsonPatchDocument<PatchUserProfileRequest>();
        patchDocument.Add(x => x.LastName, "New Last Name");
        
        SetupUserRepositoryGetById(user);

        // Act
        var result = await _userService.PatchUserProfileAsync(user.Id, patchDocument);

        // Assert
        result.Should().NotBeNull();
        result.User.LastName.Should().Be("New Last Name");
        result.User.DisplayName.Should().Be(user.DisplayName); // Unchanged
        result.User.FirstName.Should().Be(user.FirstName); // Unchanged
        
        VerifyUserWasUpdated();
        VerifyUnitOfWorkSaveChangesWasCalled();
    }
}