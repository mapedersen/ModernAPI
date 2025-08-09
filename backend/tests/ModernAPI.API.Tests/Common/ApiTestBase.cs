using System.Security.Claims;
using Bogus;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ModernAPI.Application.DTOs;
using ModernAPI.Application.Interfaces;
using ModernAPI.Domain.Entities;
using ModernAPI.Domain.ValueObjects;
using Moq;

namespace ModernAPI.API.Tests.Common;

/// <summary>
/// Base class for API layer tests providing common functionality for testing controllers and middleware.
/// </summary>
public abstract class ApiTestBase : IDisposable
{
    protected readonly Mock<IUserService> MockUserService;
    protected readonly Faker Faker = new();

    protected ApiTestBase()
    {
        MockUserService = new Mock<IUserService>();
    }

    /// <summary>
    /// Creates a mock logger for the specified type.
    /// </summary>
    /// <typeparam name="T">The type to create a logger for</typeparam>
    /// <returns>Mock logger instance</returns>
    protected Mock<ILogger<T>> CreateMockLogger<T>()
    {
        return new Mock<ILogger<T>>();
    }

    /// <summary>
    /// Creates a ClaimsPrincipal for testing authenticated requests.
    /// </summary>
    /// <param name="userId">The user ID to include in claims</param>
    /// <param name="email">The email to include in claims</param>
    /// <param name="roles">The roles to include in claims</param>
    /// <returns>ClaimsPrincipal for testing</returns>
    protected ClaimsPrincipal CreateAuthenticatedUser(string userId, string email, params string[] roles)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Email, email)
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        return new ClaimsPrincipal(new ClaimsIdentity(claims, "test"));
    }

    /// <summary>
    /// Creates an anonymous (unauthenticated) ClaimsPrincipal for testing.
    /// </summary>
    /// <returns>Anonymous ClaimsPrincipal</returns>
    protected ClaimsPrincipal CreateAnonymousUser()
    {
        return new ClaimsPrincipal(new ClaimsIdentity());
    }

    /// <summary>
    /// Sets up the controller's User property with the specified claims principal.
    /// </summary>
    /// <param name="controller">The controller to setup</param>
    /// <param name="user">The claims principal to assign</param>
    protected void SetupControllerUser(ControllerBase controller, ClaimsPrincipal user)
    {
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
    }

    /// <summary>
    /// Creates a valid CreateUserRequest for testing.
    /// </summary>
    /// <returns>A valid CreateUserRequest DTO</returns>
    protected CreateUserRequest CreateValidCreateUserRequest()
    {
        return new CreateUserRequest(
            Faker.Internet.Email(),
            Faker.Name.FullName(),
            Faker.Name.FirstName(),
            Faker.Name.LastName()
        );
    }

    /// <summary>
    /// Creates a valid UpdateUserProfileRequest for testing.
    /// </summary>
    /// <returns>A valid UpdateUserProfileRequest DTO</returns>
    protected UpdateUserProfileRequest CreateValidUpdateUserProfileRequest()
    {
        return new UpdateUserProfileRequest(
            Faker.Name.FullName(),
            Faker.Name.FirstName(),
            Faker.Name.LastName()
        );
    }

    /// <summary>
    /// Creates a valid ChangeUserEmailRequest for testing.
    /// </summary>
    /// <returns>A valid ChangeUserEmailRequest DTO</returns>
    protected ChangeUserEmailRequest CreateValidChangeUserEmailRequest()
    {
        return new ChangeUserEmailRequest(
            Faker.Internet.Email()
        );
    }

    /// <summary>
    /// Creates a test UserDto for testing.
    /// </summary>
    /// <returns>A valid UserDto for testing</returns>
    protected UserDto CreateValidUserDto()
    {
        return new UserDto(
            Guid.NewGuid(),
            Faker.Internet.Email(),
            Faker.Name.FullName(),
            Faker.Name.FirstName(),
            Faker.Name.LastName(),
            true,
            false,
            DateTime.UtcNow,
            DateTime.UtcNow
        );
    }

    /// <summary>
    /// Creates a test UserResponse for testing.
    /// </summary>
    /// <returns>A valid UserResponse for testing</returns>
    protected UserResponse CreateValidUserResponse()
    {
        return new UserResponse(
            CreateValidUserDto(),
            "Operation completed successfully"
        );
    }

    /// <summary>
    /// Creates a test UserListDto for testing.
    /// </summary>
    /// <param name="userCount">Number of users to include in the list</param>
    /// <returns>A valid UserListDto for testing</returns>
    protected UserListDto CreateValidUserListDto(int userCount = 3)
    {
        var users = Enumerable.Range(0, userCount).Select(_ => CreateValidUserDto()).ToList().AsReadOnly();
        return UserListDto.Create(users, userCount, 1, 20);
    }

    /// <summary>
    /// Sets up the user service to return a specific user when queried by ID.
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="userDto">The user DTO to return</param>
    protected void SetupUserServiceGetById(Guid userId, UserDto userDto)
    {
        MockUserService
            .Setup(x => x.GetUserByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userDto);
    }

    /// <summary>
    /// Sets up the user service to return a successful user creation result.
    /// </summary>
    /// <param name="request">The create user request</param>
    /// <param name="response">The user response to return</param>
    protected void SetupUserServiceCreateUser(CreateUserRequest request, UserResponse response)
    {
        MockUserService
            .Setup(x => x.CreateUserAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);
    }

    /// <summary>
    /// Verifies that a specific method was called on the user service.
    /// </summary>
    /// <param name="times">The expected number of times the method should be called</param>
    protected void VerifyUserServiceGetByIdWasCalled(Guid userId, Times times)
    {
        MockUserService.Verify(x => x.GetUserByIdAsync(userId, It.IsAny<CancellationToken>()), times);
    }

    public virtual void Dispose()
    {
        // Cleanup if needed
        GC.SuppressFinalize(this);
    }
}