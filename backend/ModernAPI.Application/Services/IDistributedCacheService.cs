using System.Text.Json;

namespace ModernAPI.Application.Services;

/// <summary>
/// Service for distributed caching operations using Redis.
/// Provides high-level caching methods for API responses and data.
/// </summary>
public interface IDistributedCacheService
{
    /// <summary>
    /// Gets a cached value by key and deserializes it to the specified type.
    /// </summary>
    /// <typeparam name="T">The type to deserialize to</typeparam>
    /// <param name="key">The cache key</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The cached value or null if not found</returns>
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class;

    /// <summary>
    /// Sets a cached value with the specified expiration.
    /// </summary>
    /// <typeparam name="T">The type of value to cache</typeparam>
    /// <param name="key">The cache key</param>
    /// <param name="value">The value to cache</param>
    /// <param name="expiration">The expiration time</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task SetAsync<T>(string key, T value, TimeSpan expiration, CancellationToken cancellationToken = default) where T : class;

    /// <summary>
    /// Sets a cached value with the specified absolute expiration time.
    /// </summary>
    /// <typeparam name="T">The type of value to cache</typeparam>
    /// <param name="key">The cache key</param>
    /// <param name="value">The value to cache</param>
    /// <param name="absoluteExpiration">The absolute expiration time</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task SetAsync<T>(string key, T value, DateTimeOffset absoluteExpiration, CancellationToken cancellationToken = default) where T : class;

    /// <summary>
    /// Removes a cached value by key.
    /// </summary>
    /// <param name="key">The cache key</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);

    /// <summary>
    /// Removes multiple cached values by key pattern.
    /// </summary>
    /// <param name="pattern">The pattern to match keys (e.g., "users:*")</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a key exists in the cache.
    /// </summary>
    /// <param name="key">The cache key</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if the key exists, false otherwise</returns>
    Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the remaining time to live for a cached key.
    /// </summary>
    /// <param name="key">The cache key</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The remaining time to live, or null if key doesn't exist</returns>
    Task<TimeSpan?> GetTimeToLiveAsync(string key, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets or sets a cached value. If the key doesn't exist, the factory method is called to create the value.
    /// </summary>
    /// <typeparam name="T">The type of value to cache</typeparam>
    /// <param name="key">The cache key</param>
    /// <param name="factory">Factory method to create the value if not cached</param>
    /// <param name="expiration">The expiration time</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The cached or newly created value</returns>
    Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan expiration, CancellationToken cancellationToken = default) where T : class;

    /// <summary>
    /// Refreshes the expiration time for a cached key.
    /// </summary>
    /// <param name="key">The cache key</param>
    /// <param name="expiration">The new expiration time</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if the key was found and refreshed, false otherwise</returns>
    Task<bool> RefreshAsync(string key, TimeSpan expiration, CancellationToken cancellationToken = default);
}