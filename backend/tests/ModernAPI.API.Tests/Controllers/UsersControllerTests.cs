using FluentAssertions;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ModernAPI.API.Controllers;
using ModernAPI.API.Tests.Common;
using ModernAPI.Application.Common.Exceptions;
using ModernAPI.Application.DTOs;
using Moq;

namespace ModernAPI.API.Tests.Controllers;

/// <summary>
/// Tests for UsersController HTTP endpoints and response handling.
/// </summary>
public class UsersControllerTests : ApiTestBase
{
    private readonly UsersController _controller;
    private readonly Mock<ILogger<UsersController>> _mockLogger;

    public UsersControllerTests()
    {
        _mockLogger = MockLogger<UsersController>();
        _controller = new UsersController(MockUserService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task CreateUser_WithValidRequest_ShouldReturnCreatedResult()
    {
        // Arrange
        var request = CreateValidCreateUserRequest();
        var response = CreateValidUserResponse();
        SetupUserServiceCreateUser(request, response);

        // Act
        var result = await _controller.CreateUser(request);

        // Assert
        result.Should().BeOfType<CreatedAtActionResult>();
        var createdResult = result as CreatedAtActionResult;
        createdResult!.StatusCode.Should().Be(201);
        createdResult.Value.Should().BeEquivalentTo(response);
        createdResult.ActionName.Should().Be(nameof(UsersController.GetUser));
    }

    [Fact]
    public async Task CreateUser_WhenServiceThrowsConflictException_ShouldLetGlobalHandlerProcess()
    {
        // Arrange
        var request = CreateValidCreateUserRequest();
        MockUserService
            .Setup(x => x.CreateUserAsync(request, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ConflictException("User", request.Email));

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() => 
            _controller.CreateUser(request));
        
        // The global exception middleware will handle this and convert to proper HTTP response
        exception.Should().NotBeNull();
    }

    [Fact]
    public async Task GetUser_WithExistingUser_ShouldReturnOkResult()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var userDto = CreateValidUserDto();
        userDto.Id = userId;
        SetupUserServiceGetById(userId, userDto);
        
        var authenticatedUser = CreateAuthenticatedUser(userId.ToString(), userDto.Email);
        SetupControllerUser(_controller, authenticatedUser);

        // Act
        var result = await _controller.GetUser(userId);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.StatusCode.Should().Be(200);
        okResult.Value.Should().BeEquivalentTo(userDto);
    }

    [Fact]
    public async Task GetUser_WhenServiceThrowsNotFoundException_ShouldLetGlobalHandlerProcess()
    {
        // Arrange
        var userId = Guid.NewGuid();
        MockUserService
            .Setup(x => x.GetUserByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NotFoundException("User", userId.ToString()));
        
        var authenticatedUser = CreateAuthenticatedUser(userId.ToString(), "user@test.com");
        SetupControllerUser(_controller, authenticatedUser);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => 
            _controller.GetUser(userId));
        
        exception.Should().NotBeNull();
    }

    [Fact]
    public async Task GetCurrentUser_WithAuthenticatedUser_ShouldReturnCurrentUserProfile()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var userDto = CreateValidUserDto();
        userDto.Id = userId;
        SetupUserServiceGetById(userId, userDto);
        
        var authenticatedUser = CreateAuthenticatedUser(userId.ToString(), userDto.Email);
        SetupControllerUser(_controller, authenticatedUser);

        // Act
        var result = await _controller.GetCurrentUser();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().BeEquivalentTo(userDto);
        
        VerifyUserServiceGetByIdWasCalled(userId, Times.Once);
    }

    [Fact]
    public async Task GetCurrentUser_WithoutAuthentication_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        var anonymousUser = CreateAnonymousUser();
        SetupControllerUser(_controller, anonymousUser);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
            _controller.GetCurrentUser());
        
        exception.Message.Should().Contain("User ID not found in token claims");
    }

    [Fact]
    public async Task UpdateUser_WithValidRequestAndOwnership_ShouldReturnOkResult()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var request = CreateValidUpdateUserProfileRequest();
        var response = CreateValidUserResponse();
        
        MockUserService
            .Setup(x => x.UpdateUserProfileAsync(userId, request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);
        
        var authenticatedUser = CreateAuthenticatedUser(userId.ToString(), "user@test.com");
        SetupControllerUser(_controller, authenticatedUser);

        // Act
        var result = await _controller.UpdateUser(userId, request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().BeEquivalentTo(response);
    }

    [Fact]
    public async Task UpdateUser_WithDifferentUserAndNoAdminRole_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var differentUserId = Guid.NewGuid();
        var request = CreateValidUpdateUserProfileRequest();
        
        var authenticatedUser = CreateAuthenticatedUser(differentUserId.ToString(), "user@test.com");
        SetupControllerUser(_controller, authenticatedUser);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
            _controller.UpdateUser(userId, request));
        
        exception.Message.Should().Contain("can only access your own resources");
    }

    [Fact]
    public async Task UpdateUser_WithDifferentUserButAdminRole_ShouldReturnOkResult()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var adminUserId = Guid.NewGuid();
        var request = CreateValidUpdateUserProfileRequest();
        var response = CreateValidUserResponse();
        
        MockUserService
            .Setup(x => x.UpdateUserProfileAsync(userId, request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);
        
        var adminUser = CreateAuthenticatedUser(adminUserId.ToString(), "admin@test.com", "Administrator");
        SetupControllerUser(_controller, adminUser);

        // Act
        var result = await _controller.UpdateUser(userId, request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().BeEquivalentTo(response);
    }

    [Fact]
    public async Task GetUsers_WithValidParameters_ShouldReturnOkResult()
    {
        // Arrange
        var userListDto = CreateValidUserListDto(3);
        MockUserService
            .Setup(x => x.GetUsersAsync(It.IsAny<GetUsersRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(userListDto);
        
        var authenticatedUser = CreateAuthenticatedUser(Guid.NewGuid().ToString(), "user@test.com");
        SetupControllerUser(_controller, authenticatedUser);

        // Act
        var result = await _controller.GetUsers(page: 1, pageSize: 20, includeInactive: false);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().BeEquivalentTo(userListDto);
    }

    [Fact]
    public async Task SearchUsers_WithValidSearchTerm_ShouldReturnFilteredResults()
    {
        // Arrange
        var searchTerm = "john";
        var userListDto = CreateValidUserListDto(2);
        MockUserService
            .Setup(x => x.SearchUsersAsync(It.IsAny<SearchUsersRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(userListDto);
        
        var authenticatedUser = CreateAuthenticatedUser(Guid.NewGuid().ToString(), "user@test.com");
        SetupControllerUser(_controller, authenticatedUser);

        // Act
        var result = await _controller.SearchUsers(searchTerm, page: 1, pageSize: 20, includeInactive: false);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().BeEquivalentTo(userListDto);
        
        MockUserService.Verify(x => x.SearchUsersAsync(
            It.Is<SearchUsersRequest>(r => r.SearchTerm == searchTerm), 
            It.IsAny<CancellationToken>()), Times.Once);
    }
}