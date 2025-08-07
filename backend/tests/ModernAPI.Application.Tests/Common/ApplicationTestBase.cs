using AutoMapper;
using Bogus;
using FluentAssertions;
using ModernAPI.Application.DTOs;
using ModernAPI.Application.Interfaces;
using ModernAPI.Application.Mappings;
using ModernAPI.Domain.Entities;
using ModernAPI.Domain.Interfaces;
using ModernAPI.Domain.ValueObjects;
using Moq;

namespace ModernAPI.Application.Tests.Common;

/// <summary>
/// Base class for application layer tests providing common functionality for testing services, DTOs, and validators.
/// </summary>
public abstract class ApplicationTestBase : IDisposable
{
    protected readonly Mock<IUnitOfWork> MockUnitOfWork;
    protected readonly Mock<IUserRepository> MockUserRepository;
    protected readonly IMapper Mapper;
    protected readonly Faker Faker = new();

    protected ApplicationTestBase()
    {
        MockUnitOfWork = new Mock<IUnitOfWork>();
        MockUserRepository = new Mock<IUserRepository>();
        
        // Setup UnitOfWork to return mock repositories
        MockUnitOfWork.Setup(x => x.Users).Returns(MockUserRepository.Object);

        // Setup AutoMapper with real profiles
        var configuration = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<UserMappingProfile>();
        });
        
        Mapper = configuration.CreateMapper();
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
    /// Creates a test User entity with valid default values.
    /// </summary>
    /// <returns>A valid User entity for testing</returns>
    protected User CreateValidUser()
    {
        return new User(
            new Email(Faker.Internet.Email()),
            Faker.Name.FullName(),
            Faker.Name.FirstName(),
            Faker.Name.LastName());
    }

    /// <summary>
    /// Creates multiple test User entities.
    /// </summary>
    /// <param name="count">Number of users to create</param>
    /// <returns>List of User entities</returns>
    protected List<User> CreateValidUsers(int count = 3)
    {
        return Enumerable.Range(0, count)
            .Select(_ => CreateValidUser())
            .ToList();
    }

    /// <summary>
    /// Sets up the user repository to return a specific user when queried by ID.
    /// </summary>
    /// <param name="user">The user to return</param>
    protected void SetupUserRepositoryGetById(User user)
    {
        MockUserRepository
            .Setup(x => x.GetByIdAsync(user.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
    }

    /// <summary>
    /// Sets up the user repository to return null when queried by a specific ID (user not found).
    /// </summary>
    /// <param name="userId">The user ID that should return null</param>
    protected void SetupUserRepositoryGetByIdReturnsNull(Guid userId)
    {
        MockUserRepository
            .Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);
    }

    /// <summary>
    /// Sets up the user repository to return true when checking if email exists.
    /// </summary>
    /// <param name="email">The email that should exist</param>
    protected void SetupUserRepositoryEmailExists(Email email)
    {
        MockUserRepository
            .Setup(x => x.ExistsByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
    }

    /// <summary>
    /// Sets up the user repository to return false when checking if email exists.
    /// </summary>
    /// <param name="email">The email that should not exist</param>
    protected void SetupUserRepositoryEmailNotExists(Email email)
    {
        MockUserRepository
            .Setup(x => x.ExistsByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
    }

    /// <summary>
    /// Verifies that SaveChangesAsync was called on the unit of work.
    /// </summary>
    protected void VerifyUnitOfWorkSaveChangesWasCalled()
    {
        MockUnitOfWork.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    /// <summary>
    /// Verifies that a user was added to the repository.
    /// </summary>
    protected void VerifyUserWasAdded()
    {
        MockUserRepository.Verify(x => x.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    /// <summary>
    /// Verifies that a user was updated in the repository.
    /// </summary>
    protected void VerifyUserWasUpdated()
    {
        MockUserRepository.Verify(x => x.UpdateAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    public virtual void Dispose()
    {
        // Cleanup if needed
        GC.SuppressFinalize(this);
    }
}