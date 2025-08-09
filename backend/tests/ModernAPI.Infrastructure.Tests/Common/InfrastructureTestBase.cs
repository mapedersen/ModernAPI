using Bogus;
using Microsoft.EntityFrameworkCore;
using ModernAPI.Domain.Entities;
using ModernAPI.Domain.ValueObjects;
using ModernAPI.Infrastructure.Data;

namespace ModernAPI.Infrastructure.Tests.Common;

/// <summary>
/// Base class for infrastructure layer tests providing common functionality for testing repositories and data access.
/// </summary>
public abstract class InfrastructureTestBase : IAsyncDisposable, IDisposable
{
    protected readonly ApplicationDbContext DbContext;
    protected readonly Faker Faker = new();

    protected InfrastructureTestBase()
    {
        DbContext = CreateInMemoryDbContext();
    }

    /// <summary>
    /// Creates an in-memory database context for testing.
    /// </summary>
    /// <returns>ApplicationDbContext configured for in-memory testing</returns>
    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .EnableSensitiveDataLogging()
            .Options;

        return new ApplicationDbContext(options);
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
    /// Adds a user to the database and saves changes.
    /// </summary>
    /// <param name="user">The user to add</param>
    /// <returns>The added user</returns>
    protected async Task<User> AddUserToDatabase(User user)
    {
        DbContext.Users.Add(user);
        await DbContext.SaveChangesAsync();
        
        // Clear change tracker to ensure fresh queries
        DbContext.ChangeTracker.Clear();
        
        return user;
    }

    /// <summary>
    /// Adds multiple users to the database and saves changes.
    /// </summary>
    /// <param name="users">The users to add</param>
    /// <returns>The added users</returns>
    protected async Task<List<User>> AddUsersToDatabase(List<User> users)
    {
        DbContext.Users.AddRange(users);
        await DbContext.SaveChangesAsync();
        
        // Clear change tracker to ensure fresh queries
        DbContext.ChangeTracker.Clear();
        
        return users;
    }

    /// <summary>
    /// Clears all data from the database.
    /// </summary>
    protected async Task ClearDatabase()
    {
        DbContext.Users.RemoveRange(DbContext.Users);
        await DbContext.SaveChangesAsync();
        DbContext.ChangeTracker.Clear();
    }

    /// <summary>
    /// Gets the total count of users in the database.
    /// </summary>
    /// <returns>The number of users in the database</returns>
    protected async Task<int> GetUserCountInDatabase()
    {
        return await DbContext.Users.CountAsync();
    }

    /// <summary>
    /// Gets a user from the database by ID, bypassing the change tracker.
    /// </summary>
    /// <param name="userId">The user ID to find</param>
    /// <returns>The user if found, null otherwise</returns>
    protected async Task<User?> GetUserFromDatabase(Guid userId)
    {
        return await DbContext.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    /// <summary>
    /// Detaches all tracked entities to ensure clean state for tests.
    /// </summary>
    protected void DetachAllEntities()
    {
        DbContext.ChangeTracker.Clear();
    }

    public async ValueTask DisposeAsync()
    {
        await DbContext.DisposeAsync();
        GC.SuppressFinalize(this);
    }

    public void Dispose()
    {
        DbContext.Dispose();
        GC.SuppressFinalize(this);
    }
}

/// <summary>
/// Base class for infrastructure tests using PostgreSQL test containers.
/// Use this for tests that need to verify database-specific functionality like migrations, constraints, etc.
/// </summary>
public abstract class PostgreSqlInfrastructureTestBase : IAsyncDisposable, IDisposable
{
    protected readonly Faker Faker = new();
    
    // Note: TestContainers setup would be implemented here for tests that need actual PostgreSQL
    // For now, using in-memory database is sufficient for most repository tests
    
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

    public async ValueTask DisposeAsync()
    {
        // Cleanup TestContainer resources
        await Task.CompletedTask;
        GC.SuppressFinalize(this);
    }

    public void Dispose()
    {
        // Cleanup TestContainer resources
        GC.SuppressFinalize(this);
    }
}