import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { 
  Zap, 
  Database, 
  Clock, 
  TrendingUp, 
  Server, 
  Layers, 
  RefreshCw,
  Settings,
  BarChart3,
  Timer,
  CheckCircle,
  AlertTriangle,
  Code,
  Play,
  Activity
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/learn/caching')({
  component: CachingPage,
})

function CachingPage() {
  const [activePattern, setActivePattern] = useState<string>('cache-aside')

  const cachingPatterns = [
    {
      id: 'cache-aside',
      name: 'Cache-Aside (Lazy Loading)',
      description: 'Application manages both cache and database operations',
      pros: ['Simple to implement', 'Cache miss penalty only on first read', 'Cache stays consistent'],
      cons: ['Write penalty', 'Cache miss penalty', 'Stale data possible'],
      useCase: 'Read-heavy workloads, user profiles, product catalogs'
    },
    {
      id: 'write-through',
      name: 'Write-Through',
      description: 'Data is written to cache and database simultaneously',
      pros: ['No data loss risk', 'Always consistent', 'Good for write-heavy apps'],
      cons: ['Write latency', 'Wasted writes to cache', 'More complex'],
      useCase: 'Critical data that must be immediately consistent'
    },
    {
      id: 'write-behind',
      name: 'Write-Behind (Write-Back)',
      description: 'Data written to cache first, database updated asynchronously',
      pros: ['Low write latency', 'Reduced database load', 'Batch writes possible'],
      cons: ['Risk of data loss', 'Complex error handling', 'Eventual consistency'],
      useCase: 'High write volumes, analytics data, logging'
    },
    {
      id: 'refresh-ahead',
      name: 'Refresh-Ahead',
      description: 'Cache proactively refreshes data before expiration',
      pros: ['No cache miss penalty', 'Always fresh data', 'Better user experience'],
      cons: ['Complex implementation', 'Wasted refreshes', 'Higher resource usage'],
      useCase: 'Frequently accessed data with predictable patterns'
    }
  ]

  const redisFeatures = [
    {
      title: 'Distributed Caching',
      description: 'Shared cache across multiple application instances',
      icon: <Server className="w-6 h-6" />,
      benefits: ['Horizontal scaling', 'Session sharing', 'Consistent cache hits']
    },
    {
      title: 'Data Structures',
      description: 'Rich data types beyond simple key-value pairs',
      icon: <Database className="w-6 h-6" />,
      benefits: ['Lists, Sets, Hashes', 'Atomic operations', 'Complex queries']
    },
    {
      title: 'Persistence',
      description: 'Optional data persistence for durability',
      icon: <Activity className="w-6 h-6" />,
      benefits: ['RDB snapshots', 'AOF logging', 'Recovery options']
    },
    {
      title: 'High Performance',
      description: 'Sub-millisecond latency with high throughput',
      icon: <Zap className="w-6 h-6" />,
      benefits: ['In-memory storage', 'Optimized protocols', 'Pipelining support']
    }
  ]

  const performanceMetrics = [
    { metric: 'Cache Hit Ratio', target: '> 90%', impact: 'Response time reduction' },
    { metric: 'Average Response Time', target: '< 100ms', impact: 'User experience' },
    { metric: 'Cache Miss Penalty', target: '< 500ms', impact: 'Fallback performance' },
    { metric: 'Memory Usage', target: '< 80%', impact: 'Cost optimization' },
    { metric: 'Eviction Rate', target: '< 5%', impact: 'Cache effectiveness' }
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Redis Caching & Performance</h1>
            <p className="text-muted-foreground">
              Enterprise caching strategies, Redis implementation, and performance optimization
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            <Database className="w-3 h-3 mr-1" />
            Redis
          </Badge>
          <Badge variant="secondary">
            <TrendingUp className="w-3 h-3 mr-1" />
            Performance
          </Badge>
          <Badge variant="secondary">
            <Settings className="w-3 h-3 mr-1" />
            Distributed Systems
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Cache Patterns</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Redis Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Why Redis in ModernAPI?
              </CardTitle>
              <CardDescription>
                Redis provides enterprise-grade caching capabilities that dramatically improve application performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {redisFeatures.map((feature, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <div className="text-primary">{feature.icon}</div>
                      </div>
                      <div>
                        <h4 className="font-semibold">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      <div className="space-y-1">
                        {feature.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Architecture Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Cache Layer in Clean Architecture
              </CardTitle>
              <CardDescription>
                How caching integrates with Clean Architecture principles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-6">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <h4 className="font-medium text-blue-700 dark:text-blue-300">Application Layer</h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Cache-aware services and DTOs</p>
                    </div>
                    <div className="flex justify-center">
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                      <h4 className="font-medium text-orange-700 dark:text-orange-300">Infrastructure Layer</h4>
                      <p className="text-xs text-orange-600 dark:text-orange-400">Redis client, cache implementations</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cache abstracted behind interfaces, maintaining dependency inversion
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Cache Interface (Domain)</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <pre className="text-xs"><code>{`public interface ICacheService
{
    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null);
    Task RemoveAsync(string key);
    Task RemovePatternAsync(string pattern);
}`}</code></pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Redis Implementation (Infrastructure)</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <pre className="text-xs"><code>{`public class RedisCacheService : ICacheService
{
    private readonly IDatabase _database;
    
    public async Task<T?> GetAsync<T>(string key)
    {
        var value = await _database.StringGetAsync(key);
        return value.HasValue 
            ? JsonSerializer.Deserialize<T>(value!) 
            : default;
    }
}`}</code></pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Impact
              </CardTitle>
              <CardDescription>
                Measurable improvements with proper caching implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">90%</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Faster Response Times</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">75%</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Reduced Database Load</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">50%</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Lower Infrastructure Costs</div>
                  </div>
                </div>
                
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Real-world impact:</strong> API endpoints with caching average 50-100ms response times 
                    versus 300-800ms without caching for database-heavy operations.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          {/* Caching Patterns Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Caching Patterns in ModernAPI</CardTitle>
              <CardDescription>
                Different strategies for different use cases - click on each pattern to explore
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {cachingPatterns.map((pattern) => (
                  <Card 
                    key={pattern.id} 
                    className={`cursor-pointer transition-all duration-200 ${
                      activePattern === pattern.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md hover:bg-muted/30'
                    }`}
                    onClick={() => setActivePattern(pattern.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{pattern.name}</CardTitle>
                      <CardDescription className="text-sm">{pattern.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-xs">
                          {pattern.useCase}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pattern Details */}
              {activePattern && (
                <div className="mt-6 p-6 bg-muted/30 rounded-lg">
                  {cachingPatterns
                    .filter(p => p.id === activePattern)
                    .map(pattern => (
                      <div key={pattern.id} className="space-y-4">
                        <h3 className="text-xl font-semibold">{pattern.name}</h3>
                        <p className="text-muted-foreground">{pattern.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium text-green-700 dark:text-green-300">✓ Advantages</h4>
                            <ul className="space-y-1">
                              {pattern.pros.map((pro, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium text-red-700 dark:text-red-300">⚠ Disadvantages</h4>
                            <ul className="space-y-1">
                              {pattern.cons.map((con, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <AlertTriangle className="w-3 h-3 text-red-500" />
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Best Use Case</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{pattern.useCase}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-6">
          {/* Service Implementation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Cache-Aware Service Implementation
              </CardTitle>
              <CardDescription>
                How to implement caching in your application services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">User Service with Cache-Aside Pattern</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="text-sm"><code>{`public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;
    private readonly ILogger<UserService> _logger;
    
    private const string UserCacheKeyPrefix = "user:";
    private readonly TimeSpan _userCacheExpiry = TimeSpan.FromMinutes(30);

    public async Task<UserDto> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"{UserCacheKeyPrefix}{userId}";
        
        // Try cache first (Cache-Aside pattern)
        var cachedUser = await _cache.GetAsync<UserDto>(cacheKey);
        if (cachedUser != null)
        {
            _logger.LogDebug("Cache hit for user {UserId}", userId);
            return cachedUser;
        }
        
        // Cache miss - fetch from database
        _logger.LogDebug("Cache miss for user {UserId}", userId);
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("User", userId.ToString());
        }
        
        var userDto = _mapper.Map<UserDto>(user);
        
        // Update cache for next time
        await _cache.SetAsync(cacheKey, userDto, _userCacheExpiry);
        
        return userDto;
    }
    
    public async Task<UserResponse> UpdateUserAsync(Guid userId, UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("User", userId.ToString());
        }
        
        user.UpdateProfile(request.DisplayName, request.FirstName, request.LastName);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Invalidate cache after update
        var cacheKey = $"{UserCacheKeyPrefix}{userId}";
        await _cache.RemoveAsync(cacheKey);
        
        var userDto = _mapper.Map<UserDto>(user);
        return new UserResponse(userDto, "User updated successfully");
    }
}`}</code></pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Redis Configuration</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="text-sm"><code>{`// appsettings.json
{
  "Redis": {
    "ConnectionString": "localhost:6379",
    "Database": 0,
    "KeyPrefix": "modernapi:",
    "DefaultExpiry": "00:30:00",
    "CommandFlags": {
      "HighPriority": false,
      "FireAndForget": false
    }
  }
}

// Program.cs - Service Registration
builder.Services.Configure<RedisSettings>(builder.Configuration.GetSection("Redis"));

builder.Services.AddStackExchangeRedisCache(options =>
{
    var redisSettings = builder.Configuration.GetSection("Redis").Get<RedisSettings>();
    options.Configuration = redisSettings.ConnectionString;
    options.InstanceName = redisSettings.KeyPrefix;
});

builder.Services.AddSingleton<IConnectionMultiplexer>(provider =>
{
    var redisSettings = provider.GetService<IOptions<RedisSettings>>()!.Value;
    return ConnectionMultiplexer.Connect(redisSettings.ConnectionString);
});

builder.Services.AddScoped<ICacheService, RedisCacheService>();`}</code></pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cache Key Strategies */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Key Strategies</CardTitle>
              <CardDescription>
                Consistent and maintainable cache key patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Key Naming Conventions</h4>
                  <div className="bg-muted rounded-lg p-3 space-y-2">
                    <div className="text-sm">
                      <code className="text-blue-600">user:&#123;userId&#125;</code>
                      <span className="text-muted-foreground ml-2">- Single user</span>
                    </div>
                    <div className="text-sm">
                      <code className="text-blue-600">users:page:&#123;pageNumber&#125;:&#123;pageSize&#125;</code>
                      <span className="text-muted-foreground ml-2">- Paginated list</span>
                    </div>
                    <div className="text-sm">
                      <code className="text-blue-600">user:&#123;userId&#125;:profile</code>
                      <span className="text-muted-foreground ml-2">- User profile data</span>
                    </div>
                    <div className="text-sm">
                      <code className="text-blue-600">stats:daily:&#123;date&#125;</code>
                      <span className="text-muted-foreground ml-2">- Time-based data</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Cache Key Helper</h4>
                  <div className="bg-muted rounded-lg p-3">
                    <pre className="text-xs"><code>{`public static class CacheKeys
{
    private const string Prefix = "modernapi:";
    
    public static class Users
    {
        public static string ById(Guid id) => $"{Prefix}user:{id}";
        public static string Profile(Guid id) => $"{Prefix}user:{id}:profile";
        public static string Page(int page, int size) => $"{Prefix}users:page:{page}:{size}";
        public static string Pattern => $"{Prefix}user:*";
    }
    
    public static class Products
    {
        public static string ById(Guid id) => $"{Prefix}product:{id}";
        public static string BySku(string sku) => $"{Prefix}product:sku:{sku}";
        public static string Category(string category) => $"{Prefix}products:category:{category}";
    }
}`}</code></pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Key Performance Metrics
              </CardTitle>
              <CardDescription>
                Monitor these metrics to ensure optimal cache performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{metric.metric}</div>
                      <div className="text-sm text-muted-foreground">{metric.impact}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{metric.target}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <Alert className="mt-4">
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  <strong>Monitoring Tools:</strong> Use Redis CLI, RedisInsight, or application metrics 
                  to track these KPIs and identify optimization opportunities.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Health Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Redis Health Monitoring
              </CardTitle>
              <CardDescription>
                Built-in health checks for Redis connectivity and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm"><code>{`public class RedisHealthCheck : IHealthCheck
{
    private readonly IConnectionMultiplexer _connectionMultiplexer;
    
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            var database = _connectionMultiplexer.GetDatabase();
            
            // Test basic connectivity
            await database.PingAsync();
            
            // Test read/write operations
            var testKey = "health-check-test";
            await database.StringSetAsync(testKey, "test", TimeSpan.FromSeconds(5));
            var testValue = await database.StringGetAsync(testKey);
            await database.KeyDeleteAsync(testKey);
            
            if (testValue != "test")
            {
                return HealthCheckResult.Degraded("Redis read/write test failed");
            }
            
            // Check memory usage
            var info = await _connectionMultiplexer.GetServer(_connectionMultiplexer.GetEndPoints().First())
                .InfoAsync("memory");
            
            var memoryData = info.ToDictionary();
            if (memoryData.ContainsKey("used_memory_rss_human"))
            {
                return HealthCheckResult.Healthy($"Redis healthy - Memory: {memoryData["used_memory_rss_human"]}");
            }
            
            return HealthCheckResult.Healthy("Redis is healthy");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Redis health check failed", ex);
        }
    }
}`}</code></pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {/* Optimization Strategies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Cache Optimization Strategies
              </CardTitle>
              <CardDescription>
                Advanced techniques for maximizing cache effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Memory Optimization</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <strong>Data Compression:</strong> Use compression for large objects to reduce memory usage
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <strong>Selective Caching:</strong> Cache only frequently accessed data
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <strong>TTL Optimization:</strong> Set appropriate expiration times based on data volatility
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <strong>Memory Policies:</strong> Configure Redis eviction policies (LRU, LFU)
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Performance Optimization</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <strong>Connection Pooling:</strong> Reuse Redis connections efficiently
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <strong>Pipelining:</strong> Batch multiple commands for better throughput
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <strong>Async Operations:</strong> Use async/await for non-blocking cache operations
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <strong>Cache Warming:</strong> Pre-populate cache with critical data
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle>Redis Best Practices</CardTitle>
              <CardDescription>
                Production-ready guidelines for Redis implementation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✓ Do</h4>
                  <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                    <li>Use consistent key naming</li>
                    <li>Set appropriate TTL values</li>
                    <li>Monitor cache hit ratios</li>
                    <li>Handle cache failures gracefully</li>
                    <li>Use compression for large data</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">✗ Don't</h4>
                  <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                    <li>Cache everything blindly</li>
                    <li>Use blocking operations</li>
                    <li>Ignore memory limits</li>
                    <li>Store sensitive data unencrypted</li>
                    <li>Forget error handling</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">⚡ Optimize</h4>
                  <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <li>Batch operations when possible</li>
                    <li>Use appropriate data structures</li>
                    <li>Configure memory policies</li>
                    <li>Monitor performance metrics</li>
                    <li>Plan for cache invalidation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}