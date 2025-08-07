# Infrastructure Layer - ModernAPI Template

## Overview
The Infrastructure layer contains **concrete implementations** of interfaces defined in the Domain layer. This layer handles all external concerns like databases, file systems, web services, and other I/O operations. It's the **"how"** to the Domain's **"what"**.

## Key Responsibilities

### 1. **Data Persistence**
- Implements repository interfaces using Entity Framework Core
- Manages database connections and transactions
- Handles data mapping between domain objects and database entities

### 2. **External Service Integration**
- Implements interfaces for external APIs, email services, etc.
- Manages HTTP clients and service communications
- Handles authentication and API key management

### 3. **Infrastructure Configuration**
- Database migrations and schema management
- Dependency injection registration
- Configuration of external service clients

### 4. **Cross-Cutting Concerns**
- Caching implementations
- File storage services
- Message queue implementations

## Architecture Principles

### **Dependency Inversion**
```
Domain Layer (Interfaces) ← Infrastructure Layer (Implementations)
```

The Infrastructure layer **depends on** and **implements** interfaces from the Domain layer:

```csharp
// Domain defines WHAT it needs
public interface IUserRepository 
{
    Task<User?> GetByIdAsync(UserId userId);
}

// Infrastructure implements HOW to do it
public class UserRepository : IUserRepository
{
    public async Task<User?> GetByIdAsync(UserId userId) 
    {
        return await _context.Users.FindAsync(userId.Value);
    }
}
```

### **Framework-Specific Code Lives Here**
All framework-specific code (Entity Framework, HTTP clients, etc.) belongs in Infrastructure:

```csharp
// ✅ GOOD: EF-specific code in Infrastructure
public class ApplicationDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // EF-specific configuration
    }
}

// ❌ BAD: EF code would NOT belong in Domain or Application
```

## Folder Structure

```
ModernAPI.Infrastructure/
├── Data/                  # Entity Framework related
│   ├── Configurations/    # Entity type configurations
│   ├── Migrations/       # EF Core migrations
│   └── ApplicationDbContext.cs
├── Repositories/         # Repository implementations
│   ├── UserRepository.cs
│   └── UnitOfWork.cs
├── Common/              # Shared infrastructure components
│   ├── DependencyInjection.cs
│   └── Extensions/
└── README.md            # This documentation
```

## Component Explanations

### **Data Layer** (`/Data/`)

#### **ApplicationDbContext**
The main Entity Framework DbContext that:
- Defines DbSets for all entities
- Configures entity relationships and constraints
- Handles domain event processing during SaveChanges
- Manages database transactions

```csharp
public class ApplicationDbContext : DbContext
{
    public DbSet<User> Users { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply all entity configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    // Handle domain events during save
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Process domain events before saving
        await ProcessDomainEventsAsync();
        return await base.SaveChangesAsync(cancellationToken);
    }
}
```

#### **Entity Configurations** (`/Data/Configurations/`)
Separate configuration files for each entity using `IEntityTypeConfiguration<T>`:

```csharp
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        
        // Value object mapping
        builder.Property(u => u.Id)
            .HasConversion(id => id.Value, value => new UserId(value));
            
        builder.Property(u => u.Email)
            .HasConversion(email => email.Value, value => new Email(value))
            .HasMaxLength(254);
    }
}
```

### **Repositories** (`/Repositories/`)

#### **Repository Pattern Implementation**
Concrete implementations of domain repository interfaces:

```csharp
public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public async Task<User?> GetByIdAsync(UserId userId, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
    }

    // Other repository methods...
}
```

#### **Unit of Work Pattern**
Coordinates changes across multiple repositories:

```csharp
public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public IUserRepository Users { get; }
    
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
    
    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        await _context.Database.BeginTransactionAsync(cancellationToken);
    }
}
```

## Entity Framework Configuration Strategy

### **Value Objects Mapping**
Map domain value objects to database columns:

```csharp
// UserId (strongly-typed ID) → Guid column
builder.Property(u => u.Id)
    .HasConversion(
        id => id.Value,           // To database
        value => new UserId(value) // From database
    );

// Email (value object) → string column with validation
builder.Property(u => u.Email)
    .HasConversion(
        email => email.Value,
        value => new Email(value)
    )
    .HasMaxLength(254)
    .IsRequired();
```

### **Domain Events Handling**
Process domain events during SaveChanges:

```csharp
public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
{
    // Get entities with domain events
    var entitiesWithEvents = ChangeTracker.Entries<Entity<object>>()
        .Where(e => e.Entity.DomainEvents.Any())
        .Select(e => e.Entity)
        .ToList();

    // Collect all events
    var events = entitiesWithEvents.SelectMany(e => e.DomainEvents).ToList();

    // Clear events before saving to prevent re-processing
    entitiesWithEvents.ForEach(e => e.ClearDomainEvents());

    // Save changes first
    var result = await base.SaveChangesAsync(cancellationToken);

    // Then process events (after successful save)
    foreach (var domainEvent in events)
    {
        await _mediator.Publish(domainEvent, cancellationToken);
    }

    return result;
}
```

## Repository Implementation Patterns

### **Query Optimization**
Use appropriate EF Core features for performance:

```csharp
public async Task<IReadOnlyList<User>> GetActiveUsersAsync(CancellationToken cancellationToken = default)
{
    return await _context.Users
        .Where(u => u.IsActive)
        .AsNoTracking()  // Read-only queries don't need change tracking
        .ToListAsync(cancellationToken);
}

public async Task<User?> GetUserWithOrdersAsync(UserId userId, CancellationToken cancellationToken = default)
{
    return await _context.Users
        .Include(u => u.Orders)  // Explicit loading of related data
        .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
}
```

### **Pagination Support**
Implement efficient pagination:

```csharp
public async Task<IReadOnlyList<User>> GetUsersPagedAsync(int skip, int take, CancellationToken cancellationToken = default)
{
    return await _context.Users
        .OrderBy(u => u.CreatedAt)  // Always order for consistent pagination
        .Skip(skip)
        .Take(take)
        .AsNoTracking()
        .ToListAsync(cancellationToken);
}
```

## Migration Strategy

### **Code-First Migrations**
Use EF Core migrations for schema evolution:

```bash
# Create migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update

# Generate SQL script for production
dotnet ef migrations script
```

### **Seeding Strategy**
Seed initial data in migrations or separate seed classes:

```csharp
public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (!context.Users.Any())
        {
            var adminUser = new User(
                new Email("admin@example.com"), 
                "Administrator"
            );
            
            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }
    }
}
```

## Testing Considerations

### **In-Memory Database for Tests**
Configure test-specific database:

```csharp
public static class TestDbContextFactory
{
    public static ApplicationDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }
}
```

### **Repository Testing**
Test repositories against real database behavior:

```csharp
[Test]
public async Task GetByIdAsync_WhenUserExists_ReturnsUser()
{
    // Arrange
    using var context = TestDbContextFactory.CreateInMemoryContext();
    var repository = new UserRepository(context);
    var userId = UserId.New();
    var user = new User(new Email("test@example.com"), "Test User");
    // Set user ID via reflection or test constructor
    
    context.Users.Add(user);
    await context.SaveChangesAsync();
    
    // Act
    var result = await repository.GetByIdAsync(userId);
    
    // Assert
    Assert.That(result, Is.Not.Null);
    Assert.That(result.Id, Is.EqualTo(userId));
}
```

## Key Benefits

- ✅ **Separation of Concerns**: Infrastructure details isolated from business logic
- ✅ **Testability**: Easy to swap implementations for testing
- ✅ **Flexibility**: Can change databases or external services without affecting domain
- ✅ **Performance**: Optimized data access with EF Core best practices
- ✅ **Maintainability**: Clear structure for data access code

## Common Patterns

### **Repository Base Class**
Avoid code duplication with base repository:

```csharp
public abstract class RepositoryBase<TEntity, TId> : IRepository<TEntity, TId>
    where TEntity : Entity<TId>
    where TId : IEquatable<TId>
{
    protected readonly ApplicationDbContext Context;

    protected RepositoryBase(ApplicationDbContext context)
    {
        Context = context;
    }

    public virtual async Task<TEntity?> GetByIdAsync(TId id, CancellationToken cancellationToken = default)
    {
        return await Context.Set<TEntity>().FindAsync([id], cancellationToken);
    }
    
    // Common repository methods...
}
```

---

**Next Layer**: Once Infrastructure is complete, we'll build the API layer that exposes our application services through HTTP endpoints with proper error handling and documentation.