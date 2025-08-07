using Bogus;
using FluentAssertions;
using ModernAPI.Domain.Entities;
using ModernAPI.Domain.Events;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Domain.Tests.Common;

/// <summary>
/// Base class for domain layer tests providing common functionality for testing entities, value objects, and domain events.
/// </summary>
public abstract class DomainTestBase
{
    protected readonly Faker Faker = new();

    /// <summary>
    /// Asserts that a domain event of the specified type was raised by the entity.
    /// </summary>
    /// <typeparam name="TEvent">The type of domain event to check for</typeparam>
    /// <param name="user">The user entity to check</param>
    /// <returns>The domain event instance for further assertions</returns>
    protected TEvent AssertDomainEventRaised<TEvent>(User user)
        where TEvent : IDomainEvent
    {
        var domainEvent = user.DomainEvents
            .OfType<TEvent>()
            .FirstOrDefault();

        domainEvent.Should().NotBeNull($"Expected domain event of type {typeof(TEvent).Name} was not raised");
        
        return domainEvent!;
    }

    /// <summary>
    /// Asserts that no domain events were raised by the entity.
    /// </summary>
    /// <param name="user">The user entity to check</param>
    protected void AssertNoDomainEventsRaised(User user)
    {
        user.DomainEvents.Should().BeEmpty("No domain events should have been raised");
    }

    /// <summary>
    /// Asserts that exactly the specified number of domain events were raised.
    /// </summary>
    /// <param name="user">The user entity to check</param>
    /// <param name="expectedCount">The expected number of domain events</param>
    protected void AssertDomainEventCount(User user, int expectedCount)
    {
        user.DomainEvents.Should().HaveCount(expectedCount, 
            $"Expected exactly {expectedCount} domain events to be raised");
    }

    /// <summary>
    /// Creates a valid test email address.
    /// </summary>
    /// <returns>A valid Email value object</returns>
    protected Email CreateValidEmail() => new(Faker.Internet.Email());

    /// <summary>
    /// Creates an invalid email address for testing validation.
    /// </summary>
    /// <returns>An invalid email string</returns>
    protected string CreateInvalidEmail() => Faker.Random.String2(10); // No @ symbol

    /// <summary>
    /// Creates a valid display name for testing.
    /// </summary>
    /// <returns>A valid display name</returns>
    protected string CreateValidDisplayName() => Faker.Name.FullName();

    /// <summary>
    /// Creates a valid first name for testing.
    /// </summary>
    /// <returns>A valid first name</returns>
    protected string CreateValidFirstName() => Faker.Name.FirstName();

    /// <summary>
    /// Creates a valid last name for testing.
    /// </summary>
    /// <returns>A valid last name</returns>
    protected string CreateValidLastName() => Faker.Name.LastName();

    /// <summary>
    /// Creates an invalid name (empty/null) for testing validation.
    /// </summary>
    /// <returns>An invalid name</returns>
    protected string CreateInvalidName() => string.Empty;

    /// <summary>
    /// Creates a test user with valid default values.
    /// </summary>
    /// <returns>A valid User entity for testing</returns>
    protected User CreateValidUser()
    {
        return new User(
            CreateValidEmail(),
            CreateValidDisplayName(),
            CreateValidFirstName(),
            CreateValidLastName());
    }
}