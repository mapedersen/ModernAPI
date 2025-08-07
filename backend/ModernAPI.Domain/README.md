# Domain Layer - ModernAPI Template

## Overview
The Domain layer is the **heart of Clean Architecture** and contains the core business logic of your application. This layer is framework-agnostic and should have **no dependencies** on external concerns like databases, web frameworks, or UI technologies.

## Key Principles

### 1. **Dependency Independence**
- No references to other layers or external frameworks
- Pure C# code with minimal dependencies
- Business rules are isolated and protected

### 2. **Rich Domain Model**
- Entities contain behavior, not just data
- Business logic lives in domain objects
- Validation rules are enforced at the domain level

### 3. **Immutability Where Possible**
- Value objects are immutable
- Entities encapsulate state changes through methods
- Events are immutable records of what happened

## Folder Structure

```
ModernAPI.Domain/
├── Entities/          # Core business entities with identity
├── ValueObjects/      # Immutable objects without identity
├── Interfaces/        # Domain service contracts and repository abstractions
├── Services/          # Domain services for business logic that doesn't belong to entities
├── Exceptions/        # Domain-specific exceptions
├── Events/            # Domain events for communicating changes
└── README.md          # This documentation
```

## Components Explained

### **Entities** (`/Entities/`)
Entities are objects with **identity** and **lifecycle**. They:
- Have a unique identifier (usually an Id property)
- Can change state over time
- Contain business logic and validation
- Raise domain events when important changes occur

**Example**: User, Product, Order

### **Value Objects** (`/ValueObjects/`)
Value objects are **immutable** objects without identity. They:
- Are defined by their properties, not by an ID
- Are compared by value equality
- Should be immutable once created
- Often used to wrap primitive types with business meaning

**Example**: Email, Money, Address, PhoneNumber

### **Interfaces** (`/Interfaces/`)
Domain interfaces define contracts without implementation:
- Repository abstractions (IUserRepository)
- Domain service contracts (IEmailService)
- External service contracts the domain needs

### **Services** (`/Services/`)
Domain services contain business logic that:
- Doesn't naturally belong to any single entity
- Operates on multiple entities
- Implements complex business rules
- Remains framework-agnostic

### **Exceptions** (`/Exceptions/`)
Domain-specific exceptions that represent business rule violations:
- Inherit from custom base exception classes
- Contain meaningful error messages
- Include relevant context for debugging

### **Events** (`/Events/`)
Domain events represent important business events:
- Immutable records of what happened
- Contain all necessary data about the event
- Used for decoupling and integration

## Design Guidelines

### ✅ **Do**
- Keep entities focused and cohesive
- Use value objects to wrap primitives with business meaning
- Validate business rules in the domain
- Use domain events for cross-cutting concerns
- Make value objects immutable
- Use meaningful names that reflect the business domain

### ❌ **Don't**
- Reference infrastructure concerns (databases, APIs)
- Use data annotations from System.ComponentModel.DataAnnotations
- Implement persistence logic in entities
- Create anemic domain models (entities with only properties)
- Use primitive obsession (prefer value objects)

## Code Quality Standards

This layer enforces strict code quality:
- **Warnings as Errors**: All compiler warnings become build errors
- **Nullable Reference Types**: Enabled for null safety
- **XML Documentation**: Required for all public APIs
- **Code Analysis**: Microsoft analyzers enabled

## Example Implementation

### Entity Example
```csharp
public class User : Entity<UserId>
{
    public Email Email { get; private set; }
    public string DisplayName { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public bool IsActive { get; private set; }

    private User() { } // For EF Core
    
    public User(Email email, string displayName)
    {
        Id = UserId.New();
        Email = email ?? throw new ArgumentNullException(nameof(email));
        DisplayName = displayName ?? throw new ArgumentNullException(nameof(displayName));
        CreatedAt = DateTime.UtcNow;
        IsActive = true;
        
        // Raise domain event
        RaiseDomainEvent(new UserCreatedEvent(Id, Email));
    }
    
    public void Deactivate()
    {
        if (!IsActive)
            throw new UserAlreadyDeactivatedException(Id);
            
        IsActive = false;
        RaiseDomainEvent(new UserDeactivatedEvent(Id));
    }
}
```

### Value Object Example
```csharp
public record Email
{
    public string Value { get; }
    
    public Email(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Email cannot be empty", nameof(value));
            
        if (!IsValidEmail(value))
            throw new ArgumentException("Invalid email format", nameof(value));
            
        Value = value.ToLowerInvariant();
    }
    
    private static bool IsValidEmail(string email)
    {
        // Email validation logic
        return email.Contains('@') && email.Contains('.');
    }
    
    public static implicit operator string(Email email) => email.Value;
    public static explicit operator Email(string email) => new(email);
}
```

## Learning Resources

### Books
- "Domain-Driven Design" by Eric Evans
- "Implementing Domain-Driven Design" by Vaughn Vernon
- "Clean Architecture" by Robert C. Martin

### Key Concepts to Study
- **Aggregate Design**: How to group entities and value objects
- **Domain Events**: Decoupling domain logic
- **Specification Pattern**: Complex business rule queries
- **Repository Pattern**: Data access abstraction

---

**Next Layer**: Once the Domain is solid, move to the Application layer which orchestrates domain objects to fulfill use cases.