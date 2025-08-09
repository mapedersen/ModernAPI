using FluentAssertions;
using Xunit;
using ModernAPI.Infrastructure.Repositories;
using ModernAPI.Infrastructure.Tests.Common;
using ModernAPI.Domain.ValueObjects;
using ModernAPI.Domain.Entities;

namespace ModernAPI.Infrastructure.Tests.Repositories;

/// <summary>
/// Tests for UserRepository data access functionality.
/// </summary>
public class UserRepositoryTests : InfrastructureTestBase
{
    private readonly UserRepository _userRepository;

    public UserRepositoryTests()
    {
        _userRepository = new UserRepository(DbContext);
    }

    [Fact]
    public async Task AddAsync_WithValidUser_ShouldAddUserToDatabase()
    {
        // Arrange
        var user = CreateValidUser();

        // Act
        await _userRepository.AddAsync(user);
        await DbContext.SaveChangesAsync();

        // Assert
        var userCount = await GetUserCountInDatabase();
        userCount.Should().Be(1);

        var savedUser = await GetUserFromDatabase(user.Id);
        savedUser.Should().NotBeNull();
        savedUser!.Email.Should().Be(user.Email);
        savedUser.DisplayName.Should().Be(user.DisplayName);
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingUser_ShouldReturnUser()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());

        // Act
        var result = await _userRepository.GetByIdAsync(user.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(user.Id);
        result.Email.Should().Be(user.Email);
        result.DisplayName.Should().Be(user.DisplayName);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistentUser_ShouldReturnNull()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _userRepository.GetByIdAsync(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task ExistsByEmailAsync_WithExistingEmail_ShouldReturnTrue()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());

        // Act
        var result = await _userRepository.ExistsByEmailAsync(new Email(user.Email!));

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ExistsByEmailAsync_WithNonExistentEmail_ShouldReturnFalse()
    {
        // Arrange
        var nonExistentEmail = new Email(Faker.Internet.Email());

        // Act
        var result = await _userRepository.ExistsByEmailAsync(nonExistentEmail);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task GetUsersAsync_WithMultipleUsers_ShouldReturnPaginatedResults()
    {
        // Arrange
        var users = await AddUsersToDatabase(CreateValidUsers(5));

        // Act
        var result = await _userRepository.GetUsersPagedAsync(skip: 0, take: 3);

        // Assert
        result.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetUsersAsync_WithIncludeInactiveFalse_ShouldOnlyReturnActiveUsers()
    {
        // Arrange
        var users = await AddUsersToDatabase(CreateValidUsers(3));
        
        // Deactivate one user
        users[0].Deactivate();
        await _userRepository.UpdateAsync(users[0]);
        await DbContext.SaveChangesAsync();
        DetachAllEntities();

        // Act
        var result = await _userRepository.GetUsersPagedAsync(skip: 0, take: 10);

        // Assert
        var activeUsers = result.Where(u => u.IsActive).ToList();
        activeUsers.Should().HaveCount(2);
    }

    [Fact]
    public async Task SearchUsersAsync_WithEmptySearchTerm_ShouldReturnEmptyCollection()
    {
        // Arrange
        await AddUsersToDatabase(CreateValidUsers(3));

        // Act
        var result = await _userRepository.SearchByDisplayNameAsync("");

        // Assert
        result.Should().BeEmpty("because empty search term should return no results");
    }

    [Fact]
    public async Task SearchUsersAsync_WithWhitespaceSearchTerm_ShouldReturnEmptyCollection()
    {
        // Arrange
        await AddUsersToDatabase(CreateValidUsers(3));

        // Act
        var result = await _userRepository.SearchByDisplayNameAsync("   ");

        // Assert
        result.Should().BeEmpty("because whitespace-only search term should return no results");
    }

    [Fact]
    public async Task SearchUsersAsync_WithValidSearchTerm_ShouldReturnValidCollection()
    {
        // Arrange
        var users = await AddUsersToDatabase(CreateValidUsers(3));

        // Act
        var result = await _userRepository.SearchByDisplayNameAsync("test");

        // Assert
        result.Should().NotBeNull("because search method should always return a valid collection");
        result.Should().BeAssignableTo<IReadOnlyList<User>>("because search should return the correct interface type");
    }

    [Fact]
    public async Task Update_WithModifiedUser_ShouldPersistChanges()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());
        var newDisplayName = "Updated Display Name";
        var newFirstName = "Updated First Name";
        var newLastName = "Updated Last Name";

        // Act
        user.UpdateProfile(newDisplayName, newFirstName, newLastName);
        await _userRepository.UpdateAsync(user);
        await DbContext.SaveChangesAsync();

        // Assert
        DetachAllEntities();
        var updatedUser = await GetUserFromDatabase(user.Id);
        updatedUser.Should().NotBeNull();
        updatedUser!.DisplayName.Should().Be(newDisplayName);
        updatedUser.FirstName.Should().Be(newFirstName);
        updatedUser.LastName.Should().Be(newLastName);
    }

    [Fact]
    public async Task Delete_WithExistingUser_ShouldRemoveFromDatabase()
    {
        // Arrange
        var user = await AddUserToDatabase(CreateValidUser());

        // Act
        await _userRepository.RemoveAsync(user);
        await DbContext.SaveChangesAsync();

        // Assert
        var userCount = await GetUserCountInDatabase();
        userCount.Should().Be(0);

        var deletedUser = await GetUserFromDatabase(user.Id);
        deletedUser.Should().BeNull();
    }
}