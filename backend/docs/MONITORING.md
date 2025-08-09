# Monitoring and Observability Guide

## Overview

ModernAPI implements a comprehensive observability stack combining structured logging, metrics collection, and distributed tracing. The hybrid approach uses best-in-class tools for each aspect of observability.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       ModernAPI                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Serilog ──────────► Logs ────────► Seq                   │
│     │                                 │                     │
│     │                                 ▼                     │
│     │                            (Analysis UI)              │
│     │                                                       │
│  OpenTelemetry ────► Metrics ────► Prometheus             │
│     │                                 │                     │
│     │                                 ▼                     │
│     └──────────────► Traces ─────► Jaeger                 │
│                                       │                     │
│                                       ▼                     │
│                                   Grafana                  │
│                                (Unified Dashboards)         │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. **Seq** - Log Aggregation & Analysis
- **Purpose**: Centralized structured logging
- **Port**: 5341 (API), 8080 (Web UI)
- **URL**: http://localhost:8080
- **Features**:
  - Powerful query language
  - Real-time log streaming
  - Structured event data
  - Alert notifications

### 2. **Prometheus** - Metrics Storage
- **Purpose**: Time-series metrics database
- **Port**: 9090
- **URL**: http://localhost:9090
- **Features**:
  - Pull-based metrics collection
  - Powerful query language (PromQL)
  - Long-term storage
  - Alert rules

### 3. **Grafana** - Visualization
- **Purpose**: Unified dashboards and visualization
- **Port**: 3000
- **URL**: http://localhost:3000
- **Default Credentials**: admin/admin
- **Features**:
  - Custom dashboards
  - Multiple data sources
  - Alerting
  - Annotations

### 4. **Jaeger** - Distributed Tracing (Optional)
- **Purpose**: Request flow visualization
- **Port**: 16686
- **URL**: http://localhost:16686
- **Features**:
  - Trace visualization
  - Service dependencies
  - Performance analysis
  - Root cause analysis

### 5. **OpenTelemetry Collector** (Optional)
- **Purpose**: Telemetry data pipeline
- **Port**: 4317 (gRPC), 4318 (HTTP)
- **Features**:
  - Protocol translation
  - Data enrichment
  - Batching and retry
  - Multiple exporters

## Quick Start

### 1. Start the Monitoring Stack

```bash
# Start all monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

# Verify services are running
docker-compose -f docker-compose.monitoring.yml ps

# View logs
docker-compose -f docker-compose.monitoring.yml logs -f
```

### 2. Configure Your Application

Add these environment variables to your `.env` file:

```env
# Seq Configuration
SEQ_URL=http://localhost:5341
SEQ_API_KEY=your-api-key-here

# OpenTelemetry Configuration
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
OTEL_SERVICE_NAME=ModernAPI
OTEL_RESOURCE_ATTRIBUTES=environment=development

# Metrics Configuration
METRICS_ENABLED=true
METRICS_ENDPOINT=/metrics
```

### 3. Access the UIs

- **Seq**: http://localhost:8080
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Jaeger**: http://localhost:16686

## Structured Logging

### Log Levels

```csharp
// Log levels in order of severity
Log.Verbose("Detailed diagnostic information");
Log.Debug("Debug information for developers");
Log.Information("General informational messages");
Log.Warning("Warning messages for potential issues");
Log.Error(exception, "Error messages with exceptions");
Log.Fatal("Fatal errors that cause application termination");
```

### Structured Logging Examples

```csharp
// Basic structured logging
_logger.LogInformation("User {UserId} logged in from {IpAddress}", 
    userId, ipAddress);

// With custom properties
using (LogContext.PushProperty("CorrelationId", correlationId))
using (LogContext.PushProperty("UserId", userId))
{
    _logger.LogInformation("Processing order {OrderId}", orderId);
}

// Performance logging
using (_logger.BeginScope("OrderProcessing"))
{
    var stopwatch = Stopwatch.StartNew();
    // ... process order
    _logger.LogInformation("Order processed in {ElapsedMs}ms", 
        stopwatch.ElapsedMilliseconds);
}
```

### Correlation IDs

Every request is assigned a correlation ID for tracing:

```csharp
// Automatically added by RequestLoggingMiddleware
var correlationId = HttpContext.Items["CorrelationId"];

// Use in logs
_logger.LogInformation("Processing request {CorrelationId}", correlationId);
```

## Metrics Collection

### Available Metrics

#### HTTP Metrics
- `http_server_requests` - Total HTTP requests
- `http_server_duration` - Request duration histogram
- `http_server_errors` - Total HTTP errors
- `http_server_active_connections` - Active connections

#### Authentication Metrics
- `auth_login_attempts` - Login attempt counter
- `auth_login_successes` - Successful login counter
- `auth_login_failures` - Failed login counter
- `auth_registrations` - Registration counter
- `auth_token_refreshes` - Token refresh counter
- `auth_sessions_active` - Active sessions gauge
- `auth_duration` - Authentication operation duration

#### Database Metrics
- `db_queries` - Total database queries
- `db_query_duration` - Query duration histogram

#### Runtime Metrics
- `process_cpu_seconds_total` - CPU usage
- `process_working_set_bytes` - Memory usage
- `process_num_threads` - Thread count
- `dotnet_gc_heap_size_bytes` - GC heap size

### Custom Metrics

```csharp
public class OrderMetrics
{
    private readonly Counter<int> _ordersCreated;
    private readonly Histogram<double> _orderValue;
    
    public OrderMetrics(IMeterFactory meterFactory)
    {
        var meter = meterFactory.Create("ModernAPI.Orders");
        
        _ordersCreated = meter.CreateCounter<int>(
            "orders.created",
            unit: "orders",
            description: "Total orders created");
            
        _orderValue = meter.CreateHistogram<double>(
            "orders.value",
            unit: "USD",
            description: "Order value distribution");
    }
    
    public void RecordOrder(decimal value)
    {
        _ordersCreated.Add(1);
        _orderValue.Record((double)value);
    }
}
```

## Grafana Dashboards

### Pre-configured Dashboards

1. **ModernAPI Overview**
   - Request rate and latency
   - Error rate and status codes
   - Authentication metrics
   - Resource usage

2. **Performance Dashboard**
   - Response time percentiles
   - Database query performance
   - Cache hit rates
   - Throughput metrics

3. **Business Metrics**
   - User registrations
   - Active sessions
   - API usage by endpoint
   - Feature adoption

### Creating Custom Dashboards

1. Navigate to Grafana: http://localhost:3000
2. Click "+" → "Dashboard"
3. Add panels with PromQL queries:

```promql
# Request rate by endpoint
rate(http_server_requests_total[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(http_server_duration_bucket[5m]))

# Error rate
rate(http_server_errors_total[5m]) / rate(http_server_requests_total[5m])

# Authentication success rate
rate(auth_login_successes_total[5m]) / rate(auth_login_attempts_total[5m])
```

## Alerting

### Prometheus Alert Rules

Create alert rules in `/monitoring/prometheus/alerts/alerts.yml`:

```yaml
groups:
  - name: modernapi
    rules:
      - alert: HighErrorRate
        expr: rate(http_server_errors_total[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High error rate detected
          description: "Error rate is {{ $value }} errors per second"
      
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_server_duration_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High response time
          description: "95th percentile response time is {{ $value }} seconds"
      
      - alert: LoginFailureSpike
        expr: rate(auth_login_failures_total[5m]) > 10
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: Login failure spike detected
          description: "{{ $value }} login failures per second"
```

### Grafana Alerts

1. Open any panel in edit mode
2. Navigate to "Alert" tab
3. Configure conditions and notifications
4. Set up notification channels (Email, Slack, etc.)

## Querying Logs

### Seq Query Language

```sql
-- Find all errors
@Level = 'Error'

-- Find specific user activity
UserId = '123e4567-e89b-12d3-a456-426614174000'

-- Find slow requests
ElapsedMs > 1000

-- Authentication failures
@Message like '%login failed%' and Email = 'user@example.com'

-- Correlation tracking
CorrelationId = '550e8400-e29b-41d4-a716-446655440000'

-- Time range queries
@Timestamp > Now() - 1h and @Level in ['Warning', 'Error']
```

### Prometheus Query Language (PromQL)

```promql
# Request rate
rate(http_server_requests_total[5m])

# Error percentage
rate(http_server_errors_total[5m]) / rate(http_server_requests_total[5m]) * 100

# Average response time
rate(http_server_duration_sum[5m]) / rate(http_server_duration_count[5m])

# Memory usage in MB
process_working_set_bytes / 1024 / 1024

# Active sessions over time
auth_sessions_active
```

## Performance Optimization

### Log Sampling

For high-volume production environments:

```csharp
Log.Logger = new LoggerConfiguration()
    .WriteTo.Seq(
        serverUrl: seqUrl,
        restrictedToMinimumLevel: LogEventLevel.Information,
        batchPostingLimit: 100,
        period: TimeSpan.FromSeconds(2))
    .Filter.ByIncludingOnly(evt => 
        evt.Level >= LogEventLevel.Warning || 
        Random.Shared.Next(100) < 10) // Sample 10% of Info logs
    .CreateLogger();
```

### Metrics Cardinality

Avoid high-cardinality labels:

```csharp
// Bad - creates too many time series
_counter.Add(1, new("user_id", userId)); // Thousands of unique values

// Good - limited cardinality
_counter.Add(1, new("user_type", userType)); // Few distinct values
```

### Batching and Buffering

Configure appropriate batch sizes:

```yaml
# OpenTelemetry Collector
processors:
  batch:
    timeout: 10s
    send_batch_size: 1024
    send_batch_max_size: 2048
```

## Troubleshooting

### Common Issues

#### 1. Seq not receiving logs
- Check SEQ_URL environment variable
- Verify Seq container is running: `docker ps`
- Check application logs: `docker logs modernapi-seq`

#### 2. Metrics not appearing in Prometheus
- Verify `/metrics` endpoint: http://localhost:5000/metrics
- Check Prometheus targets: http://localhost:9090/targets
- Review scrape configuration in `prometheus.yml`

#### 3. Grafana dashboard empty
- Verify data source configuration
- Check time range selector
- Test queries directly in Prometheus

#### 4. High memory usage
- Adjust retention policies
- Implement log/metric sampling
- Scale monitoring infrastructure

### Debug Commands

```bash
# Check monitoring stack status
docker-compose -f docker-compose.monitoring.yml ps

# View recent logs
docker-compose -f docker-compose.monitoring.yml logs --tail=100

# Restart a specific service
docker-compose -f docker-compose.monitoring.yml restart seq

# Clean up volumes (WARNING: deletes all data)
docker-compose -f docker-compose.monitoring.yml down -v

# Test metrics endpoint
curl http://localhost:5000/metrics

# Test Seq API
curl http://localhost:5341/api/events -X POST \
  -H "Content-Type: application/json" \
  -d '{"@t":"2024-01-01T00:00:00.000Z","@m":"Test message","@l":"Information"}'
```

## Production Considerations

### Security

1. **Authentication**: Enable authentication for all monitoring tools
2. **Network Security**: Use internal networks, avoid exposing ports
3. **API Keys**: Use secure API keys for Seq
4. **TLS**: Enable HTTPS for all endpoints
5. **RBAC**: Implement role-based access control in Grafana

### Scaling

1. **Prometheus**: Consider Thanos or Cortex for HA
2. **Seq**: Use clustering for high availability
3. **Grafana**: Use database backend for team sharing
4. **Storage**: Implement retention policies

### Backup

```bash
# Backup Prometheus data
docker run --rm -v prometheus-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/prometheus-backup.tar.gz /data

# Backup Grafana dashboards
docker run --rm -v grafana-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/grafana-backup.tar.gz /data

# Backup Seq data
docker run --rm -v seq-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/seq-backup.tar.gz /data
```

## Integration Examples

### Azure Application Insights

```csharp
// Add to Program.cs for cloud deployment
builder.Services.AddApplicationInsightsTelemetry();
builder.Services.ConfigureTelemetryModule<DependencyTrackingTelemetryModule>(
    (module, o) => { module.EnableSqlCommandTextInstrumentation = true; });
```

### AWS CloudWatch

```csharp
// Configure AWS CloudWatch sink
.WriteTo.AmazonCloudWatch(
    logGroup: "/aws/modernapi",
    logStreamPrefix: DateTime.UtcNow.ToString("yyyyMMdd"),
    restrictedToMinimumLevel: LogEventLevel.Information)
```

### Datadog

```csharp
// Configure Datadog APM
builder.Services.AddSingleton<IConfigureOptions<DatadogOptions>>(
    new ConfigureOptions<DatadogOptions>(options =>
    {
        options.ServiceName = "modernapi";
        options.AgentHost = "localhost";
        options.AgentPort = 8126;
    }));
```

## Best Practices

1. **Use Structured Logging**: Always use structured logging with named parameters
2. **Add Context**: Include relevant context (userId, correlationId, etc.)
3. **Set Appropriate Levels**: Use correct log levels for different scenarios
4. **Monitor Key Metrics**: Focus on RED metrics (Rate, Errors, Duration)
5. **Create Actionable Alerts**: Avoid alert fatigue with meaningful thresholds
6. **Regular Review**: Periodically review logs and metrics for insights
7. **Document Runbooks**: Create runbooks for common alerts
8. **Test Monitoring**: Include monitoring in your testing strategy

## Resources

- [Seq Documentation](https://docs.datalust.co/docs)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [OpenTelemetry .NET](https://github.com/open-telemetry/opentelemetry-dotnet)
- [Serilog Documentation](https://serilog.net/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)