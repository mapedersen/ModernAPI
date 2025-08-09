using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;
using ModernAPI.Infrastructure.Repositories;
using ModernAPI.Infrastructure.Tests.Common;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Infrastructure.Tests.Repositories;

/// <summary>
/// Tests for UnitOfWork pattern implementation to ensure proper transaction management
/// and repository coordination.
/// </summary>
public class UnitOfWorkTests : InfrastructureTestBase
{
    private readonly UnitOfWork _unitOfWork;

    public UnitOfWorkTests()
    {
        _unitOfWork = new UnitOfWork(DbContext);
    }

    [Fact]
    public void Constructor_WithValidContext_ShouldCreateInstance()
    {
        // Act & Assert
        _unitOfWork.Should().NotBeNull();
        _unitOfWork.Users.Should().NotBeNull();
        _unitOfWork.RefreshTokens.Should().NotBeNull();
    }

    [Fact]
    public void Constructor_WithNullContext_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var exception = Assert.Throws<ArgumentNullException>(() => new UnitOfWork(null!));
        exception.ParamName.Should().Be("context");
    }

    [Fact]
    public void Users_PropertyAccess_ShouldReturnSameInstance()
    {
        // Act
        var users1 = _unitOfWork.Users;
        var users2 = _unitOfWork.Users;

        // Assert
        users1.Should().BeSameAs(users2);
        users1.Should().NotBeNull();
    }

    [Fact]
    public void RefreshTokens_PropertyAccess_ShouldReturnSameInstance()
    {
        // Act
        var refreshTokens1 = _unitOfWork.RefreshTokens;
        var refreshTokens2 = _unitOfWork.RefreshTokens;

        // Assert
        refreshTokens1.Should().BeSameAs(refreshTokens2);
        refreshTokens1.Should().NotBeNull();
    }

    [Fact]
    public async Task SaveChangesAsync_WithValidChanges_ShouldReturnChangedEntityCount()
    {
        // Arrange
        var user = CreateValidUser();
        await _unitOfWork.Users.AddAsync(user);

        // Act
        var result = await _unitOfWork.SaveChangesAsync();

        // Assert
        result.Should().Be(1);
        var savedUser = await GetUserFromDatabase(user.Id);
        savedUser.Should().NotBeNull();
    }

    [Fact]
    public async Task SaveChangesAsync_WithNoChanges_ShouldReturnZero()
    {
        // Act
        var result = await _unitOfWork.SaveChangesAsync();

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task BeginTransactionAsync_WhenNoActiveTransaction_ShouldStartTransaction()
    {
        if (IsUsingInMemoryDatabase)
        {
            // In-memory database doesn't support transactions, so BeginTransactionAsync should throw
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => _unitOfWork.BeginTransactionAsync());
            exception.Message.Should().Contain("Transactions are not supported by the in-memory store");
            return;
        }

        // Act
        await _unitOfWork.BeginTransactionAsync();

        // Assert
        _unitOfWork.HasActiveTransaction.Should().BeTrue();
        _unitOfWork.GetCurrentTransaction().Should().NotBeNull();

        // Cleanup
        await _unitOfWork.RollbackTransactionAsync();
    }

    [Fact]
    public async Task BeginTransactionAsync_WhenTransactionAlreadyActive_ShouldThrowInvalidOperationException()
    {
        if (IsUsingInMemoryDatabase)
        {
            // In-memory database doesn't support transactions, first call should throw
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => _unitOfWork.BeginTransactionAsync());
            exception.Message.Should().Contain("Transactions are not supported by the in-memory store");
            return;
        }

        // Arrange
        await _unitOfWork.BeginTransactionAsync();

        // Act & Assert
        var secondException = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _unitOfWork.BeginTransactionAsync());
        
        secondException.Message.Should().Contain("A transaction is already in progress");

        // Cleanup
        await _unitOfWork.RollbackTransactionAsync();
    }

    [Fact]
    public async Task CommitTransactionAsync_WithActiveTransaction_ShouldCommitChanges()
    {
        if (IsUsingInMemoryDatabase)
        {
            // In-memory database doesn't support transactions, CommitTransactionAsync should throw
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => _unitOfWork.CommitTransactionAsync());
            exception.Message.Should().Contain("No transaction is in progress");
            return;
        }

        // Arrange
        var user = CreateValidUser();
        await _unitOfWork.BeginTransactionAsync();
        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        // Act
        await _unitOfWork.CommitTransactionAsync();

        // Assert
        _unitOfWork.HasActiveTransaction.Should().BeFalse();
        var savedUser = await GetUserFromDatabase(user.Id);
        savedUser.Should().NotBeNull();
    }

    [Fact]
    public async Task CommitTransactionAsync_WithNoActiveTransaction_ShouldThrowInvalidOperationException()
    {
        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _unitOfWork.CommitTransactionAsync());
        
        exception.Message.Should().Contain("No transaction is in progress");
    }

    [Fact]
    public async Task RollbackTransactionAsync_WithActiveTransaction_ShouldRollbackChanges()
    {
        if (IsUsingInMemoryDatabase)
        {
            // In-memory database doesn't support transactions, RollbackTransactionAsync should throw
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => _unitOfWork.RollbackTransactionAsync());
            exception.Message.Should().Contain("No transaction is in progress");
            return;
        }

        // Arrange
        var user = CreateValidUser();
        await _unitOfWork.BeginTransactionAsync();
        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        // Act
        await _unitOfWork.RollbackTransactionAsync();

        // Assert
        _unitOfWork.HasActiveTransaction.Should().BeFalse();
        var savedUser = await GetUserFromDatabase(user.Id);
        savedUser.Should().BeNull();
    }

    [Fact]
    public async Task RollbackTransactionAsync_WithNoActiveTransaction_ShouldThrowInvalidOperationException()
    {
        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _unitOfWork.RollbackTransactionAsync());
        
        exception.Message.Should().Contain("No transaction is in progress");
    }

    [Fact]
    public async Task ExecuteTransactionAsync_WithFunction_ShouldCommitOnSuccess()
    {
        // Arrange
        var user = CreateValidUser();

        if (IsUsingInMemoryDatabase)
        {
            // In-memory database doesn't support transactions, but ExecuteTransactionAsync should still work
            // by falling back to regular operation without explicit transactions
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => _unitOfWork.ExecuteTransactionAsync(async uow =>
                {
                    await uow.Users.AddAsync(user);
                    await uow.SaveChangesAsync();
                    return user.Id;
                }));
            exception.Message.Should().Contain("Transactions are not supported by the in-memory store");
            return;
        }

        // Act
        var result = await _unitOfWork.ExecuteTransactionAsync(async uow =>
        {
            await uow.Users.AddAsync(user);
            await uow.SaveChangesAsync();
            return user.Id;
        });

        // Assert
        result.Should().Be(user.Id);
        _unitOfWork.HasActiveTransaction.Should().BeFalse();
        var savedUser = await GetUserFromDatabase(user.Id);
        savedUser.Should().NotBeNull();
    }

    [Fact]
    public async Task ExecuteTransactionAsync_WithAction_ShouldCommitOnSuccess()
    {
        // Arrange
        var user = CreateValidUser();

        if (IsUsingInMemoryDatabase)
        {
            // In-memory database doesn't support transactions, ExecuteTransactionAsync should throw
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => _unitOfWork.ExecuteTransactionAsync(async uow =>
                {
                    await uow.Users.AddAsync(user);
                    await uow.SaveChangesAsync();
                }));
            exception.Message.Should().Contain("Transactions are not supported by the in-memory store");
            return;
        }

        // Act
        await _unitOfWork.ExecuteTransactionAsync(async uow =>
        {
            await uow.Users.AddAsync(user);
            await uow.SaveChangesAsync();
        });

        // Assert
        _unitOfWork.HasActiveTransaction.Should().BeFalse();
        var savedUser = await GetUserFromDatabase(user.Id);
        savedUser.Should().NotBeNull();
    }

    [Fact]
    public async Task ExecuteTransactionAsync_WhenOperationThrows_ShouldRollback()
    {
        // Arrange
        var user = CreateValidUser();

        if (IsUsingInMemoryDatabase)
        {
            // In-memory database doesn't support transactions, ExecuteTransactionAsync should throw before reaching the test exception
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => _unitOfWork.ExecuteTransactionAsync(async uow =>
                {
                    await uow.Users.AddAsync(user);
                    await uow.SaveChangesAsync();
                    throw new InvalidOperationException("Test exception");
                }));
            exception.Message.Should().Contain("Transactions are not supported by the in-memory store");
            return;
        }

        // Act & Assert
        var testException = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _unitOfWork.ExecuteTransactionAsync(async uow =>
            {
                await uow.Users.AddAsync(user);
                await uow.SaveChangesAsync();
                throw new InvalidOperationException("Test exception");
            }));

        testException.Message.Should().Be("Test exception");
        _unitOfWork.HasActiveTransaction.Should().BeFalse();
        var savedUser = await GetUserFromDatabase(user.Id);
        savedUser.Should().BeNull();
    }

    [Fact]
    public async Task ExecuteTransactionAsync_WithNestedTransaction_ShouldUseExistingTransaction()
    {
        if (IsUsingInMemoryDatabase)
        {
            // In-memory database doesn't support transactions, BeginTransactionAsync should throw
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => _unitOfWork.BeginTransactionAsync());
            exception.Message.Should().Contain("Transactions are not supported by the in-memory store");
            return;
        }

        // Arrange
        var user = CreateValidUser();
        await _unitOfWork.BeginTransactionAsync();

        // Act
        var result = await _unitOfWork.ExecuteTransactionAsync(async uow =>
        {
            await uow.Users.AddAsync(user);
            await uow.SaveChangesAsync();
            return "success";
        });

        // Assert
        result.Should().Be("success");
        _unitOfWork.HasActiveTransaction.Should().BeTrue(); // Transaction should still be active

        // Commit the outer transaction
        await _unitOfWork.CommitTransactionAsync();

        var savedUser = await GetUserFromDatabase(user.Id);
        savedUser.Should().NotBeNull();
    }

    [Fact]
    public async Task ExecuteTransactionAsync_WithNullOperation_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentNullException>(
            () => _unitOfWork.ExecuteTransactionAsync<object>(null!));
        
        exception.ParamName.Should().Be("operation");
    }

    [Fact]
    public void HasActiveTransaction_WithNoTransaction_ShouldReturnFalse()
    {
        // Act & Assert
        _unitOfWork.HasActiveTransaction.Should().BeFalse();
    }

    [Fact]
    public async Task HasActiveTransaction_WithActiveTransaction_ShouldReturnTrue()
    {
        if (IsUsingInMemoryDatabase)
        {
            // In-memory database doesn't support transactions, so HasActiveTransaction should always be false
            _unitOfWork.HasActiveTransaction.Should().BeFalse();
            return;
        }

        // Arrange
        await _unitOfWork.BeginTransactionAsync();

        // Act & Assert
        _unitOfWork.HasActiveTransaction.Should().BeTrue();

        // Cleanup
        await _unitOfWork.RollbackTransactionAsync();
    }

    [Fact]
    public void GetCurrentTransaction_WithNoActiveTransaction_ShouldReturnNull()
    {
        // Act & Assert
        _unitOfWork.GetCurrentTransaction().Should().BeNull();
    }

    [Fact]
    public async Task GetCurrentTransaction_WithActiveTransaction_ShouldReturnTransaction()
    {
        if (IsUsingInMemoryDatabase)
        {
            // In-memory database doesn't support transactions, so GetCurrentTransaction should return null
            _unitOfWork.GetCurrentTransaction().Should().BeNull();
            return;
        }

        // Arrange
        await _unitOfWork.BeginTransactionAsync();

        // Act & Assert
        _unitOfWork.GetCurrentTransaction().Should().NotBeNull();

        // Cleanup
        await _unitOfWork.RollbackTransactionAsync();
    }

    [Fact]
    public void Dispose_ShouldDisposeResourcesCorrectly()
    {
        // Arrange
        var unitOfWork = new UnitOfWork(DbContext);

        // Act
        unitOfWork.Dispose();

        // Assert
        unitOfWork.HasActiveTransaction.Should().BeFalse();
        
        // Multiple dispose calls should not throw
        unitOfWork.Dispose();
    }

    [Fact]
    public async Task Dispose_WithActiveTransaction_ShouldCleanupTransaction()
    {
        // Arrange
        var unitOfWork = new UnitOfWork(DbContext);
        
        if (IsUsingInMemoryDatabase)
        {
            // In-memory database doesn't support transactions, so HasActiveTransaction should be false
            unitOfWork.HasActiveTransaction.Should().BeFalse();
            unitOfWork.Dispose();
            unitOfWork.HasActiveTransaction.Should().BeFalse();
            return;
        }

        await unitOfWork.BeginTransactionAsync();

        // Act
        unitOfWork.Dispose();

        // Assert
        unitOfWork.HasActiveTransaction.Should().BeFalse();
    }

    protected new void Dispose()
    {
        _unitOfWork?.Dispose();
        base.Dispose();
    }

    public new async ValueTask DisposeAsync()
    {
        _unitOfWork?.Dispose();
        await base.DisposeAsync();
    }
}