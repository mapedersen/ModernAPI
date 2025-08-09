using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using ModernAPI.Domain.Interfaces;
using ModernAPI.Infrastructure.Data;

namespace ModernAPI.Infrastructure.Repositories;

/// <summary>
/// Unit of Work implementation that coordinates changes across multiple repositories
/// and ensures transactional consistency using Entity Framework Core.
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _currentTransaction;
    private bool _disposed;

    /// <summary>
    /// Lazy-loaded user repository instance.
    /// </summary>
    private IUserRepository? _users;

    /// <summary>
    /// Lazy-loaded refresh token repository instance.
    /// </summary>
    private IRefreshTokenRepository? _refreshTokens;

    /// <summary>
    /// Initializes a new instance of the UnitOfWork.
    /// </summary>
    /// <param name="context">The application database context</param>
    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    /// <inheritdoc />
    public IUserRepository Users
    {
        get
        {
            // Lazy initialization of repository
            _users ??= new UserRepository(_context);
            return _users;
        }
    }

    /// <inheritdoc />
    public IRefreshTokenRepository RefreshTokens
    {
        get
        {
            // Lazy initialization of repository
            _refreshTokens ??= new RefreshTokenRepository(_context);
            return _refreshTokens;
        }
    }

    // Future repositories would be added here as the domain grows:
    // public IProductRepository Products => _products ??= new ProductRepository(_context);
    // public IOrderRepository Orders => _orders ??= new OrderRepository(_context);

    /// <inheritdoc />
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            // SaveChangesAsync will process domain events automatically
            // due to the override in ApplicationDbContext
            return await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            // Handle optimistic concurrency conflicts
            throw new InvalidOperationException(
                "The record being updated has been modified by another user. Please refresh and try again.",
                ex);
        }
        catch (DbUpdateException ex)
        {
            // Handle database constraint violations and other update issues
            throw new InvalidOperationException(
                "An error occurred while saving changes to the database. Please check your data and try again.",
                ex);
        }
    }

    /// <inheritdoc />
    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction is not null)
        {
            throw new InvalidOperationException("A transaction is already in progress.");
        }

        _currentTransaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction is null)
        {
            throw new InvalidOperationException("No transaction is in progress.");
        }

        try
        {
            await _currentTransaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            _currentTransaction?.Dispose();
            _currentTransaction = null;
        }
    }

    /// <inheritdoc />
    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction is null)
        {
            throw new InvalidOperationException("No transaction is in progress.");
        }

        try
        {
            await _currentTransaction.RollbackAsync(cancellationToken);
        }
        finally
        {
            _currentTransaction?.Dispose();
            _currentTransaction = null;
        }
    }

    /// <summary>
    /// Determines whether the Unit of Work has an active transaction.
    /// </summary>
    /// <returns>True if a transaction is active, false otherwise</returns>
    public bool HasActiveTransaction => _currentTransaction is not null;

    /// <summary>
    /// Gets the current transaction (if any) for advanced scenarios.
    /// </summary>
    /// <returns>The current database transaction or null</returns>
    public IDbContextTransaction? GetCurrentTransaction() => _currentTransaction;

    /// <summary>
    /// Executes a function within a database transaction.
    /// Automatically handles transaction lifecycle (begin, commit, rollback).
    /// </summary>
    /// <typeparam name="T">Return type of the function</typeparam>
    /// <param name="operation">The operation to execute within the transaction</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The result of the operation</returns>
    public async Task<T> ExecuteTransactionAsync<T>(
        Func<IUnitOfWork, Task<T>> operation,
        CancellationToken cancellationToken = default)
    {
        if (operation == null)
            throw new ArgumentNullException(nameof(operation));

        if (HasActiveTransaction)
        {
            // If we're already in a transaction, just execute the operation
            return await operation(this);
        }

        // Begin new transaction
        await BeginTransactionAsync(cancellationToken);

        try
        {
            var result = await operation(this);
            await CommitTransactionAsync(cancellationToken);
            return result;
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }

    /// <summary>
    /// Executes an action within a database transaction.
    /// Automatically handles transaction lifecycle (begin, commit, rollback).
    /// </summary>
    /// <param name="operation">The operation to execute within the transaction</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task representing the async operation</returns>
    public async Task ExecuteTransactionAsync(
        Func<IUnitOfWork, Task> operation,
        CancellationToken cancellationToken = default)
    {
        await ExecuteTransactionAsync<object?>(async unitOfWork =>
        {
            await operation(unitOfWork);
            return null;
        }, cancellationToken);
    }

    /// <summary>
    /// Disposes the Unit of Work and releases database resources.
    /// </summary>
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Protected dispose method for proper resource cleanup.
    /// </summary>
    /// <param name="disposing">Whether we're disposing managed resources</param>
    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            // Rollback any active transaction
            if (_currentTransaction is not null)
            {
                _currentTransaction.Dispose();
                _currentTransaction = null;
            }

            // Dispose the context
            _context.Dispose();
            _disposed = true;
        }
    }

    /// <summary>
    /// Finalizer to ensure resources are cleaned up if Dispose is not called.
    /// </summary>
    ~UnitOfWork()
    {
        Dispose(false);
    }
}