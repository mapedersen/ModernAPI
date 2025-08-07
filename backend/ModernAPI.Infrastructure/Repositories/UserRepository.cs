using Microsoft.EntityFrameworkCore;
using ModernAPI.Domain.Entities;
using ModernAPI.Domain.Interfaces;
using ModernAPI.Domain.ValueObjects;
using ModernAPI.Infrastructure.Data;

namespace ModernAPI.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for User entity using Entity Framework Core.
/// Provides concrete data access methods for user-related operations.
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    /// <summary>
    /// Initializes a new instance of the UserRepository.
    /// </summary>
    /// <param name="context">The application database context</param>
    public UserRepository(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    /// <inheritdoc />
    public async Task<User?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<User?> GetByEmailAsync(Email email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email.Value, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<User>> GetActiveUsersAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Where(u => u.IsActive)
            .OrderBy(u => u.DisplayName)
            .AsNoTracking()  // Read-only query, no change tracking needed
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<User>> GetUsersPagedAsync(int skip, int take, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .OrderBy(u => u.CreatedAt)  // Consistent ordering for pagination
            .Skip(skip)
            .Take(take)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<int> GetTotalCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<int> GetActiveCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .CountAsync(u => u.IsActive, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> ExistsByEmailAsync(Email email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AnyAsync(u => u.Email == email.Value, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<User>> SearchByDisplayNameAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return Array.Empty<User>();

        // Use case-insensitive search with LIKE operator
        var normalizedSearchTerm = searchTerm.Trim().ToLower();

        return await _context.Users
            .Where(u => EF.Functions.Like(u.DisplayName.ToLower(), $"%{normalizedSearchTerm}%"))
            .OrderBy(u => u.DisplayName)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        if (user == null)
            throw new ArgumentNullException(nameof(user));

        await _context.Users.AddAsync(user, cancellationToken);
    }

    /// <inheritdoc />
    public Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        if (user == null)
            throw new ArgumentNullException(nameof(user));

        // Entity Framework tracks changes automatically
        // This method exists for interface compliance and explicit intent
        _context.Users.Update(user);
        
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task RemoveAsync(User user, CancellationToken cancellationToken = default)
    {
        if (user == null)
            throw new ArgumentNullException(nameof(user));

        // Note: Consider using soft delete (deactivation) instead of hard delete
        // for better audit trails and data recovery options
        _context.Users.Remove(user);
        
        return Task.CompletedTask;
    }
}

/// <summary>
/// Extension methods for User repository operations to reduce code duplication.
/// </summary>
public static class UserRepositoryExtensions
{
    /// <summary>
    /// Gets users with advanced filtering options.
    /// </summary>
    /// <param name="repository">The user repository</param>
    /// <param name="includeInactive">Whether to include inactive users</param>
    /// <param name="searchTerm">Optional search term for display name</param>
    /// <param name="skip">Number of records to skip for pagination</param>
    /// <param name="take">Number of records to take for pagination</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Filtered list of users</returns>
    public static async Task<IReadOnlyList<User>> GetUsersWithFilterAsync(
        this IUserRepository repository,
        bool includeInactive = false,
        string? searchTerm = null,
        int skip = 0,
        int take = 20,
        CancellationToken cancellationToken = default)
    {
        // If we have a search term, use search functionality
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            return await repository.SearchByDisplayNameAsync(searchTerm, cancellationToken);
        }

        // For simple pagination without search
        if (includeInactive)
        {
            return await repository.GetUsersPagedAsync(skip, take, cancellationToken);
        }

        // For active users only (this could be optimized further with pagination)
        var activeUsers = await repository.GetActiveUsersAsync(cancellationToken);
        return activeUsers.Skip(skip).Take(take).ToList();
    }
}