using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Moq;
using Xunit;
using ModernAPI.Infrastructure.Services;
using ModernAPI.Domain.Entities;

namespace ModernAPI.Infrastructure.Tests.Services;

/// <summary>
/// Tests for PasswordService to ensure proper password validation and lockout handling.
/// </summary>
public class PasswordServiceTests
{
    private readonly Mock<UserManager<User>> _mockUserManager;
    private readonly Mock<IPasswordHasher<User>> _mockPasswordHasher;
    private readonly PasswordService _passwordService;

    public PasswordServiceTests()
    {
        // Create mock UserManager with required constructor parameters
        var mockStore = new Mock<IUserStore<User>>();
        _mockUserManager = new Mock<UserManager<User>>(
            mockStore.Object, 
            null!, // IOptions<IdentityOptions>
            null!, // IPasswordHasher<User>
            null!, // IEnumerable<IUserValidator<User>>
            null!, // IEnumerable<IPasswordValidator<User>>
            null!, // ILookupNormalizer
            null!, // IdentityErrorDescriber
            null!, // IServiceProvider
            null!  // ILogger<UserManager<User>>
        );
        
        _mockPasswordHasher = new Mock<IPasswordHasher<User>>();
        _passwordService = new PasswordService(_mockUserManager.Object, _mockPasswordHasher.Object);
    }

    [Fact]
    public void Constructor_WithValidDependencies_ShouldCreateInstance()
    {
        // Act & Assert
        _passwordService.Should().NotBeNull();
    }

    [Fact]
    public void Constructor_WithNullUserManager_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var exception = Assert.Throws<ArgumentNullException>(
            () => new PasswordService(null!, _mockPasswordHasher.Object));
        exception.ParamName.Should().Be("userManager");
    }

    [Fact]
    public void Constructor_WithNullPasswordHasher_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var exception = Assert.Throws<ArgumentNullException>(
            () => new PasswordService(_mockUserManager.Object, null!));
        exception.ParamName.Should().Be("passwordHasher");
    }

    [Fact]
    public async Task ValidatePasswordAsync_WithNonExistentUser_ShouldReturnFalse()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _mockUserManager.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _passwordService.ValidatePasswordAsync(userId, "password");

        // Assert
        result.Should().BeFalse();
        _mockUserManager.Verify(x => x.FindByIdAsync(userId.ToString()), Times.Once);
    }

    [Fact]
    public async Task ValidatePasswordAsync_WithValidPasswordAndNotLockedOut_ShouldReturnTrueAndResetFailedAttempts()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = CreateTestUser(userId);
        var password = "valid-password";

        _mockUserManager.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync(user);
        _mockUserManager.Setup(x => x.CheckPasswordAsync(user, password))
            .ReturnsAsync(true);
        _mockUserManager.Setup(x => x.IsLockedOutAsync(user))
            .ReturnsAsync(false);
        _mockUserManager.Setup(x => x.ResetAccessFailedCountAsync(user))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _passwordService.ValidatePasswordAsync(userId, password);

        // Assert
        result.Should().BeTrue();
        _mockUserManager.Verify(x => x.CheckPasswordAsync(user, password), Times.Once);
        _mockUserManager.Verify(x => x.IsLockedOutAsync(user), Times.Once);
        _mockUserManager.Verify(x => x.ResetAccessFailedCountAsync(user), Times.Once);
        _mockUserManager.Verify(x => x.AccessFailedAsync(user), Times.Never);
    }

    [Fact]
    public async Task ValidatePasswordAsync_WithValidPasswordButLockedOut_ShouldReturnFalseAndIncrementFailedAttempts()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = CreateTestUser(userId);
        var password = "valid-password";

        _mockUserManager.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync(user);
        _mockUserManager.Setup(x => x.CheckPasswordAsync(user, password))
            .ReturnsAsync(true);
        _mockUserManager.Setup(x => x.IsLockedOutAsync(user))
            .ReturnsAsync(true);
        _mockUserManager.Setup(x => x.AccessFailedAsync(user))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _passwordService.ValidatePasswordAsync(userId, password);

        // Assert
        result.Should().BeFalse();
        _mockUserManager.Verify(x => x.CheckPasswordAsync(user, password), Times.Once);
        _mockUserManager.Verify(x => x.IsLockedOutAsync(user), Times.Once);
        _mockUserManager.Verify(x => x.AccessFailedAsync(user), Times.Once);
        _mockUserManager.Verify(x => x.ResetAccessFailedCountAsync(user), Times.Never);
    }

    [Fact]
    public async Task ValidatePasswordAsync_WithInvalidPassword_ShouldReturnFalseAndIncrementFailedAttempts()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = CreateTestUser(userId);
        var password = "invalid-password";

        _mockUserManager.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync(user);
        _mockUserManager.Setup(x => x.CheckPasswordAsync(user, password))
            .ReturnsAsync(false);
        _mockUserManager.Setup(x => x.AccessFailedAsync(user))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _passwordService.ValidatePasswordAsync(userId, password);

        // Assert
        result.Should().BeFalse();
        _mockUserManager.Verify(x => x.CheckPasswordAsync(user, password), Times.Once);
        _mockUserManager.Verify(x => x.AccessFailedAsync(user), Times.Once);
        _mockUserManager.Verify(x => x.IsLockedOutAsync(user), Times.Never);
        _mockUserManager.Verify(x => x.ResetAccessFailedCountAsync(user), Times.Never);
    }

    [Fact]
    public async Task IsLockedOutAsync_WithNonExistentUser_ShouldReturnFalse()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _mockUserManager.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _passwordService.IsLockedOutAsync(userId);

        // Assert
        result.Should().BeFalse();
        _mockUserManager.Verify(x => x.FindByIdAsync(userId.ToString()), Times.Once);
    }

    [Fact]
    public async Task IsLockedOutAsync_WithExistingUserNotLockedOut_ShouldReturnFalse()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = CreateTestUser(userId);

        _mockUserManager.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync(user);
        _mockUserManager.Setup(x => x.IsLockedOutAsync(user))
            .ReturnsAsync(false);

        // Act
        var result = await _passwordService.IsLockedOutAsync(userId);

        // Assert
        result.Should().BeFalse();
        _mockUserManager.Verify(x => x.FindByIdAsync(userId.ToString()), Times.Once);
        _mockUserManager.Verify(x => x.IsLockedOutAsync(user), Times.Once);
    }

    [Fact]
    public async Task IsLockedOutAsync_WithExistingUserLockedOut_ShouldReturnTrue()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = CreateTestUser(userId);

        _mockUserManager.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync(user);
        _mockUserManager.Setup(x => x.IsLockedOutAsync(user))
            .ReturnsAsync(true);

        // Act
        var result = await _passwordService.IsLockedOutAsync(userId);

        // Assert
        result.Should().BeTrue();
        _mockUserManager.Verify(x => x.FindByIdAsync(userId.ToString()), Times.Once);
        _mockUserManager.Verify(x => x.IsLockedOutAsync(user), Times.Once);
    }

    [Fact]
    public async Task ValidatePasswordAsync_WhenCheckPasswordAsyncThrows_ShouldPropagateException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = CreateTestUser(userId);
        var password = "test-password";

        _mockUserManager.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync(user);
        _mockUserManager.Setup(x => x.CheckPasswordAsync(user, password))
            .ThrowsAsync(new InvalidOperationException("Password validation failed"));

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _passwordService.ValidatePasswordAsync(userId, password));
        
        exception.Message.Should().Be("Password validation failed");
    }

    [Fact]
    public async Task IsLockedOutAsync_WhenUserManagerThrows_ShouldPropagateException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = CreateTestUser(userId);

        _mockUserManager.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync(user);
        _mockUserManager.Setup(x => x.IsLockedOutAsync(user))
            .ThrowsAsync(new InvalidOperationException("Lockout check failed"));

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _passwordService.IsLockedOutAsync(userId));
        
        exception.Message.Should().Be("Lockout check failed");
    }

    /// <summary>
    /// Creates a test user for testing purposes.
    /// </summary>
    private static User CreateTestUser(Guid userId)
    {
        var user = new User(
            new ModernAPI.Domain.ValueObjects.Email("test@example.com"),
            "Test User",
            "Test",
            "User");
        
        // Use reflection to set the ID since it's normally handled by EF Core
        var idProperty = typeof(User).GetProperty("Id");
        idProperty?.SetValue(user, userId);
        
        return user;
    }
}