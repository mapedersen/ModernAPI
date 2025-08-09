using ModernAPI.Domain.Entities;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Domain.Interfaces;

/// <summary>
/// Repository interface for User entity operations.
/// Defines the contract for user data access without specifying implementation details.
/// This belongs in the Domain layer to keep infrastructure dependencies abstract.
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Retrieves a user by their unique identifier.
    /// </summary>
    /// <param name="userId">The unique identifier of the user</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The user if found, null otherwise</returns>
    Task<User?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a user by their email address.
    /// </summary>
    /// <param name="email">The email address of the user</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The user if found, null otherwise</returns>
    Task<User?> GetByEmailAsync(Email email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all active users.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Collection of active users</returns>
    Task<IReadOnlyList<User>> GetActiveUsersAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves users with pagination.
    /// </summary>
    /// <param name="skip">Number of users to skip</param>
    /// <param name="take">Number of users to take</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated collection of users</returns>
    Task<IReadOnlyList<User>> GetUsersPagedAsync(int skip, int take, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the total count of users.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Total number of users</returns>
    Task<int> GetTotalCountAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the count of active users.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of active users</returns>
    Task<int> GetActiveCountAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a user exists with the specified email address.
    /// </summary>
    /// <param name="email">The email address to check</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if a user exists with that email, false otherwise</returns>
    Task<bool> ExistsByEmailAsync(Email email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches users by display name containing the specified term.
    /// </summary>
    /// <param name="searchTerm">The search term to look for in display names</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Collection of users matching the search term</returns>
    Task<IReadOnlyList<User>> SearchByDisplayNameAsync(string searchTerm, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new user to the repository.
    /// </summary>
    /// <param name="user">The user to add</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task representing the async operation</returns>
    Task AddAsync(User user, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing user in the repository.
    /// Note: In some implementations this might be a no-op if using change tracking.
    /// </summary>
    /// <param name="user">The user to update</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task representing the async operation</returns>
    Task UpdateAsync(User user, CancellationToken cancellationToken = default);

    /// <summary>
    /// Removes a user from the repository.
    /// Note: Consider using soft deletes (deactivation) instead of hard deletes for audit purposes.
    /// </summary>
    /// <param name="user">The user to remove</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task representing the async operation</returns>
    Task RemoveAsync(User user, CancellationToken cancellationToken = default);
}

/// <summary>
/// Unit of Work interface for coordinating changes across multiple repositories.
/// Ensures transactional consistency and provides a single point for committing changes.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    /// <summary>
    /// Repository for User entities.
    /// </summary>
    IUserRepository Users { get; }

    /// <summary>
    /// Repository for RefreshToken entities.
    /// </summary>
    IRefreshTokenRepository RefreshTokens { get; }

    // Additional repositories would be added here as the domain grows
    // IProductRepository Products { get; }
    // IOrderRepository Orders { get; }

    /// <summary>
    /// Saves all changes made in this unit of work to the underlying data store.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The number of state entries written to the data store</returns>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Begins a new transaction.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task representing the async operation</returns>
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Commits the current transaction.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task representing the async operation</returns>
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Rolls back the current transaction.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task representing the async operation</returns>
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}