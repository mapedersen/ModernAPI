using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using ModernAPI.Application.Services;
using StackExchange.Redis;

namespace ModernAPI.Infrastructure.Services;

/// <summary>
/// Redis implementation of IDistributedCacheService.
/// Provides distributed caching capabilities using Redis as the backing store.
/// </summary>
public class RedisDistributedCacheService : IDistributedCacheService
{
    private readonly IDistributedCache _distributedCache;
    private readonly IDatabase _redisDatabase;
    private readonly ILogger<RedisDistributedCacheService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public RedisDistributedCacheService(
        IDistributedCache distributedCache,
        IConnectionMultiplexer connectionMultiplexer,
        ILogger<RedisDistributedCacheService> logger)
    {
        _distributedCache = distributedCache;
        _redisDatabase = connectionMultiplexer.GetDatabase();
        _logger = logger;
        
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class
    {
        try
        {
            var cachedValue = await _distributedCache.GetStringAsync(key, cancellationToken);
            
            if (string.IsNullOrEmpty(cachedValue))
            {
                _logger.LogDebug("Cache miss for key: {Key}", key);
                return null;
            }

            var deserializedValue = JsonSerializer.Deserialize<T>(cachedValue, _jsonOptions);
            _logger.LogDebug("Cache hit for key: {Key}", key);
            return deserializedValue;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error getting cached value for key: {Key}", key);
            return null;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan expiration, CancellationToken cancellationToken = default) where T : class
    {
        try
        {
            var serializedValue = JsonSerializer.Serialize(value, _jsonOptions);
            
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration
            };

            await _distributedCache.SetStringAsync(key, serializedValue, options, cancellationToken);
            _logger.LogDebug("Cached value for key: {Key} with expiration: {Expiration}", key, expiration);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error setting cached value for key: {Key}", key);
        }
    }

    public async Task SetAsync<T>(string key, T value, DateTimeOffset absoluteExpiration, CancellationToken cancellationToken = default) where T : class
    {
        try
        {
            var serializedValue = JsonSerializer.Serialize(value, _jsonOptions);
            
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpiration = absoluteExpiration
            };

            await _distributedCache.SetStringAsync(key, serializedValue, options, cancellationToken);
            _logger.LogDebug("Cached value for key: {Key} with absolute expiration: {AbsoluteExpiration}", key, absoluteExpiration);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error setting cached value for key: {Key}", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            await _distributedCache.RemoveAsync(key, cancellationToken);
            _logger.LogDebug("Removed cached value for key: {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error removing cached value for key: {Key}", key);
        }
    }

    public async Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default)
    {
        try
        {
            var server = _redisDatabase.Multiplexer.GetServers().FirstOrDefault();
            if (server == null)
            {
                _logger.LogWarning("No Redis server found for pattern removal");
                return;
            }

            var keys = server.Keys(pattern: pattern);
            var keyArray = keys.ToArray();
            
            if (keyArray.Length > 0)
            {
                await _redisDatabase.KeyDeleteAsync(keyArray);
                _logger.LogDebug("Removed {Count} cached values matching pattern: {Pattern}", keyArray.Length, pattern);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error removing cached values by pattern: {Pattern}", pattern);
        }
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _redisDatabase.KeyExistsAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error checking if key exists: {Key}", key);
            return false;
        }
    }

    public async Task<TimeSpan?> GetTimeToLiveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var ttl = await _redisDatabase.KeyTimeToLiveAsync(key);
            return ttl;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error getting TTL for key: {Key}", key);
            return null;
        }
    }

    public async Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan expiration, CancellationToken cancellationToken = default) where T : class
    {
        // Try to get from cache first
        var cachedValue = await GetAsync<T>(key, cancellationToken);
        if (cachedValue != null)
        {
            return cachedValue;
        }

        try
        {
            // Create the value using the factory
            var newValue = await factory();
            
            // Cache the new value
            await SetAsync(key, newValue, expiration, cancellationToken);
            
            return newValue;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetOrSetAsync factory for key: {Key}", key);
            throw;
        }
    }

    public async Task<bool> RefreshAsync(string key, TimeSpan expiration, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _redisDatabase.KeyExpireAsync(key, expiration);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error refreshing expiration for key: {Key}", key);
            return false;
        }
    }
}