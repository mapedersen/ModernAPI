import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Progress } from '~/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Separator } from '~/components/ui/separator'
import { Switch } from '~/components/ui/switch'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { 
  Activity,
  AlertTriangle,
  BarChart3,
  Cpu,
  Database,
  Eye,
  EyeOff,
  Filter,
  Gauge,
  GitBranch,
  Globe,
  HardDrive,
  Heart,
  LineChart,
  Monitor,
  Network,
  Pause,
  Play,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  Timer,
  TrendingUp,
  Users,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Copy,
  AlertCircle,
  Thermometer,
  Wifi,
  Code,
  Terminal,
  Bug,
  Link2,
  Target,
  Layers,
  MapPin,
  RotateCcw,
  Bell,
  Smartphone
} from 'lucide-react'
import { useLearningStore } from '~/stores/learning'
import { ModuleNavigation, useModuleCompletion } from '~/components/learning/ModuleNavigation'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/docs/tools/monitoring')({
  component: MonitoringPage,
})

interface MetricData {
  id: string
  name: string
  value: number
  unit: string
  timestamp: Date
  status: 'healthy' | 'warning' | 'critical'
  threshold: {
    warning: number
    critical: number
  }
  trend: 'up' | 'down' | 'stable'
  category: 'performance' | 'infrastructure' | 'application' | 'business'
}

interface LogEntry {
  id: string
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  message: string
  source: string
  traceId?: string
  spanId?: string
  userId?: string
  requestId?: string
  duration?: number
  statusCode?: number
  method?: string
  path?: string
  exception?: string
  metadata: Record<string, unknown>
}

interface HealthCheck {
  id: string
  name: string
  component: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  lastCheck: Date
  responseTime: number
  uptime: number
  description: string
  tags: string[]
  endpoint?: string
  dependencies: string[]
}

interface TraceSpan {
  id: string
  traceId: string
  parentId?: string
  operationName: string
  service: string
  startTime: Date
  duration: number
  status: 'ok' | 'error' | 'timeout'
  tags: Record<string, string>
  logs: Array<{
    timestamp: Date
    level: string
    message: string
  }>
  children: TraceSpan[]
}

interface AlertRule {
  id: string
  name: string
  metric: string
  condition: 'gt' | 'lt' | 'eq'
  threshold: number
  duration: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  description: string
  channels: string[]
  runbook?: string
}

interface DashboardWidget {
  id: string
  title: string
  type: 'metric' | 'chart' | 'gauge' | 'table' | 'status'
  dataSource: string
  query: string
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  config: Record<string, unknown>
}

interface OpenTelemetryConfig {
  serviceName: string
  version: string
  environment: string
  exporters: {
    traces: string[]
    metrics: string[]
    logs: string[]
  }
  samplingRatio: number
  resourceAttributes: Record<string, string>
}

function MonitoringPage() {
  const [isRealTimeEnabled, setIsRealTimeEnabled] = React.useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = React.useState('1h')
  const [selectedService, setSelectedService] = React.useState('modernapi-api')
  const [selectedTrace, setSelectedTrace] = React.useState<string | null>(null)
  const [logFilter, setLogFilter] = React.useState('')
  const [logLevel, setLogLevel] = React.useState('all')
  const [selectedMetricCategory, setSelectedMetricCategory] = React.useState('all')
  const [showMetricDetails, setShowMetricDetails] = React.useState<Record<string, boolean>>({})
  const [simulationRunning, setSimulationRunning] = React.useState(false)
  const [alertsEnabled, setAlertsEnabled] = React.useState(true)
  const [selectedAlert, setSelectedAlert] = React.useState<string | null>(null)
  const [showConfigCode, setShowConfigCode] = React.useState<Record<string, boolean>>({})

  // Handle module completion and progression
  useModuleCompletion('monitoring')

  // Real-time metrics simulation
  const [metrics, setMetrics] = React.useState<MetricData[]>([
    {
      id: 'cpu-usage',
      name: 'CPU Usage',
      value: 45.2,
      unit: '%',
      timestamp: new Date(),
      status: 'healthy',
      threshold: { warning: 70, critical: 90 },
      trend: 'stable',
      category: 'infrastructure'
    },
    {
      id: 'memory-usage',
      name: 'Memory Usage',
      value: 68.7,
      unit: '%',
      timestamp: new Date(),
      status: 'healthy',
      threshold: { warning: 80, critical: 95 },
      trend: 'up',
      category: 'infrastructure'
    },
    {
      id: 'response-time',
      name: 'Avg Response Time',
      value: 127.3,
      unit: 'ms',
      timestamp: new Date(),
      status: 'healthy',
      threshold: { warning: 500, critical: 1000 },
      trend: 'down',
      category: 'performance'
    },
    {
      id: 'error-rate',
      name: 'Error Rate',
      value: 2.1,
      unit: '%',
      timestamp: new Date(),
      status: 'warning',
      threshold: { warning: 2, critical: 5 },
      trend: 'up',
      category: 'application'
    },
    {
      id: 'throughput',
      name: 'Requests/sec',
      value: 234.6,
      unit: 'req/s',
      timestamp: new Date(),
      status: 'healthy',
      threshold: { warning: 1000, critical: 1500 },
      trend: 'stable',
      category: 'performance'
    },
    {
      id: 'db-connections',
      name: 'Database Connections',
      value: 12,
      unit: 'connections',
      timestamp: new Date(),
      status: 'healthy',
      threshold: { warning: 80, critical: 95 },
      trend: 'stable',
      category: 'infrastructure'
    },
    {
      id: 'active-users',
      name: 'Active Users',
      value: 1847,
      unit: 'users',
      timestamp: new Date(),
      status: 'healthy',
      threshold: { warning: 5000, critical: 8000 },
      trend: 'up',
      category: 'business'
    }
  ])

  // Sample health checks
  const healthChecks: HealthCheck[] = [
    {
      id: 'api-health',
      name: 'API Service',
      component: 'ModernAPI.API',
      status: 'healthy',
      lastCheck: new Date(Date.now() - 30000),
      responseTime: 43,
      uptime: 99.97,
      description: 'Main API service health endpoint',
      tags: ['api', 'core', 'critical'],
      endpoint: '/health',
      dependencies: ['database', 'redis']
    },
    {
      id: 'database-health',
      name: 'PostgreSQL Database',
      component: 'PostgreSQL',
      status: 'healthy',
      lastCheck: new Date(Date.now() - 15000),
      responseTime: 12,
      uptime: 99.99,
      description: 'Primary database connection and query performance',
      tags: ['database', 'persistence', 'critical'],
      dependencies: []
    },
    {
      id: 'redis-health',
      name: 'Redis Cache',
      component: 'Redis',
      status: 'degraded',
      lastCheck: new Date(Date.now() - 45000),
      responseTime: 234,
      uptime: 98.2,
      description: 'Cache layer and session storage',
      tags: ['cache', 'session', 'performance'],
      dependencies: []
    },
    {
      id: 'email-service',
      name: 'Email Service',
      component: 'SendGrid',
      status: 'healthy',
      lastCheck: new Date(Date.now() - 60000),
      responseTime: 156,
      uptime: 99.8,
      description: 'Email delivery service integration',
      tags: ['email', 'external', 'notification'],
      dependencies: []
    },
    {
      id: 'file-storage',
      name: 'File Storage',
      component: 'AWS S3',
      status: 'unhealthy',
      lastCheck: new Date(Date.now() - 120000),
      responseTime: 2340,
      uptime: 94.5,
      description: 'File upload and storage service',
      tags: ['storage', 'files', 'external'],
      dependencies: []
    }
  ]

  // Sample log entries
  const logEntries: LogEntry[] = [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 60000),
      level: 'info',
      message: 'User authentication successful',
      source: 'ModernAPI.Application.Services.AuthService',
      traceId: 'trace-12345',
      spanId: 'span-auth-001',
      userId: 'user-789',
      requestId: 'req-abc123',
      duration: 87,
      statusCode: 200,
      method: 'POST',
      path: '/api/auth/login',
      metadata: {
        userAgent: 'Mozilla/5.0...',
        ipAddress: '192.168.1.100',
        sessionId: 'sess-xyz789'
      }
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 90000),
      level: 'error',
      message: 'Database connection timeout',
      source: 'ModernAPI.Infrastructure.Data.ApplicationDbContext',
      traceId: 'trace-12346',
      spanId: 'span-db-002',
      requestId: 'req-def456',
      duration: 5000,
      exception: 'System.TimeoutException: The operation has timed out.',
      metadata: {
        connectionString: 'Host=localhost;Database=modernapi_prod',
        queryType: 'SELECT',
        affectedRows: 0
      }
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 120000),
      level: 'warn',
      message: 'High memory usage detected',
      source: 'ModernAPI.API.Monitoring.HealthChecks',
      metadata: {
        currentUsage: 85.7,
        threshold: 80,
        availableMemory: '2.3GB',
        totalMemory: '16GB'
      }
    },
    {
      id: 'log-4',
      timestamp: new Date(Date.now() - 180000),
      level: 'debug',
      message: 'Cache miss for user preferences',
      source: 'ModernAPI.Infrastructure.Services.CacheService',
      traceId: 'trace-12347',
      userId: 'user-456',
      metadata: {
        key: 'user:456:preferences',
        ttl: 3600,
        fallbackUsed: true
      }
    }
  ]

  // Sample distributed trace
  const sampleTrace: TraceSpan = {
    id: 'span-root',
    traceId: 'trace-12345',
    operationName: 'POST /api/users',
    service: 'modernapi-api',
    startTime: new Date(Date.now() - 500),
    duration: 234,
    status: 'ok',
    tags: {
      'http.method': 'POST',
      'http.url': '/api/users',
      'http.status_code': '201',
      'user.id': 'user-789'
    },
    logs: [
      {
        timestamp: new Date(Date.now() - 490),
        level: 'info',
        message: 'Request received'
      },
      {
        timestamp: new Date(Date.now() - 300),
        level: 'info',
        message: 'User validation completed'
      }
    ],
    children: [
      {
        id: 'span-auth',
        traceId: 'trace-12345',
        parentId: 'span-root',
        operationName: 'AuthService.ValidateUser',
        service: 'modernapi-api',
        startTime: new Date(Date.now() - 480),
        duration: 45,
        status: 'ok',
        tags: {
          'operation.type': 'authentication',
          'user.email': 'user@example.com'
        },
        logs: [],
        children: []
      },
      {
        id: 'span-db',
        traceId: 'trace-12345',
        parentId: 'span-root',
        operationName: 'UserRepository.AddAsync',
        service: 'modernapi-api',
        startTime: new Date(Date.now() - 400),
        duration: 123,
        status: 'ok',
        tags: {
          'db.system': 'postgresql',
          'db.statement': 'INSERT INTO users...',
          'db.operation': 'insert'
        },
        logs: [
          {
            timestamp: new Date(Date.now() - 380),
            level: 'debug',
            message: 'Database connection acquired'
          }
        ],
        children: []
      }
    ]
  }

  // Alert rules
  const alertRules: AlertRule[] = [
    {
      id: 'high-cpu',
      name: 'High CPU Usage',
      metric: 'cpu_usage_percent',
      condition: 'gt',
      threshold: 85,
      duration: '5m',
      severity: 'high',
      enabled: true,
      description: 'Alert when CPU usage exceeds 85% for 5 minutes',
      channels: ['slack', 'email', 'pagerduty'],
      runbook: 'https://docs.example.com/runbooks/high-cpu'
    },
    {
      id: 'error-rate',
      name: 'High Error Rate',
      metric: 'error_rate_percent',
      condition: 'gt',
      threshold: 5,
      duration: '2m',
      severity: 'critical',
      enabled: true,
      description: 'Alert when error rate exceeds 5% for 2 minutes',
      channels: ['slack', 'pagerduty', 'oncall'],
      runbook: 'https://docs.example.com/runbooks/high-errors'
    },
    {
      id: 'response-time',
      name: 'Slow Response Time',
      metric: 'response_time_ms',
      condition: 'gt',
      threshold: 1000,
      duration: '3m',
      severity: 'medium',
      enabled: true,
      description: 'Alert when average response time exceeds 1000ms',
      channels: ['slack', 'email']
    }
  ]

  // OpenTelemetry configuration examples
  const openTelemetryConfigs: Record<string, OpenTelemetryConfig & { code: string }> = {
    dotnet: {
      serviceName: 'modernapi-api',
      version: '1.0.0',
      environment: 'production',
      exporters: {
        traces: ['otlp', 'jaeger'],
        metrics: ['otlp', 'prometheus'],
        logs: ['otlp', 'console']
      },
      samplingRatio: 0.1,
      resourceAttributes: {
        'service.name': 'modernapi-api',
        'service.version': '1.0.0',
        'deployment.environment': 'production'
      },
      code: `// Program.cs - OpenTelemetry Configuration
using OpenTelemetry;
using OpenTelemetry.Extensions.Docker;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// Configure OpenTelemetry
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(
            serviceName: "modernapi-api",
            serviceVersion: "1.0.0",
            serviceInstanceId: Environment.MachineName)
        .AddAttributes(new Dictionary<string, object>
        {
            ["deployment.environment"] = builder.Environment.EnvironmentName,
            ["service.namespace"] = "modernapi",
            ["service.instance.id"] = Environment.MachineName
        })
        .AddEnvironmentVariableDetector()
        .AddDockerDetector())
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation(options =>
        {
            options.RecordException = true;
            options.EnrichWithHttpRequest = (activity, request) =>
            {
                activity.SetTag("user.id", request.Headers["X-User-Id"]);
                activity.SetTag("correlation.id", request.Headers["X-Correlation-Id"]);
            };
        })
        .AddEntityFrameworkCoreInstrumentation(options =>
        {
            options.SetDbStatementForText = true;
            options.SetDbStatementForStoredProcedure = true;
        })
        .AddHttpClientInstrumentation()
        .AddRedisInstrumentation()
        .AddSource("ModernAPI.*")
        .SetSampler(new TraceIdRatioBasedSampler(0.1))
        .AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("http://otel-collector:4317");
        })
        .AddJaegerExporter())
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddRuntimeInstrumentation()
        .AddProcessInstrumentation()
        .AddMeter("ModernAPI.*")
        .AddPrometheusExporter()
        .AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("http://otel-collector:4317");
        }));

// Custom metrics
builder.Services.AddSingleton<Meter>(provider =>
    new Meter("ModernAPI.API", "1.0.0"));

var app = builder.Build();

// Custom middleware for correlation IDs
app.UseMiddleware<CorrelationMiddleware>();

// Prometheus metrics endpoint
app.MapPrometheusScrapingEndpoint();

app.Run();`
    },
    logging: {
      serviceName: 'modernapi-api',
      version: '1.0.0',
      environment: 'production',
      exporters: {
        traces: [],
        metrics: [],
        logs: ['otlp', 'console', 'file']
      },
      samplingRatio: 1.0,
      resourceAttributes: {},
      code: `// Serilog Configuration with OpenTelemetry
using Serilog;
using Serilog.Enrichers.OpenTelemetry;
using Serilog.Sinks.OpenTelemetry;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
builder.Host.UseSerilog((context, config) =>
{
    config
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithThreadId()
        .Enrich.WithCorrelationId()
        .Enrich.WithOpenTelemetrySpanId()
        .Enrich.WithOpenTelemetryTraceId()
        .Enrich.WithProperty("Service", "modernapi-api")
        .Enrich.WithProperty("Version", "1.0.0")
        .WriteTo.Console(new JsonFormatter())
        .WriteTo.File(
            path: "logs/modernapi-.log",
            rollingInterval: RollingInterval.Day,
            formatter: new JsonFormatter(),
            retainedFileCountLimit: 30)
        .WriteTo.OpenTelemetry(options =>
        {
            options.Endpoint = "http://otel-collector:4317";
            options.ResourceAttributes = new Dictionary<string, object>
            {
                ["service.name"] = "modernapi-api",
                ["service.version"] = "1.0.0"
            };
        })
        .WriteTo.Seq("http://seq:5341", apiKey: context.Configuration["Seq:ApiKey"]);
});

// Custom logging middleware
public class StructuredLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<StructuredLoggingMiddleware> _logger;

    public StructuredLoggingMiddleware(RequestDelegate next, ILogger<StructuredLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        
        using (_logger.BeginScope(new Dictionary<string, object>
        {
            ["RequestId"] = context.TraceIdentifier,
            ["CorrelationId"] = context.Request.Headers["X-Correlation-Id"].FirstOrDefault(),
            ["UserId"] = context.User.FindFirst("sub")?.Value,
            ["UserAgent"] = context.Request.Headers["User-Agent"].FirstOrDefault(),
            ["RemoteIpAddress"] = context.Connection.RemoteIpAddress?.ToString()
        }))
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, 
                    "Request failed for {Method} {Path} with status {StatusCode}",
                    context.Request.Method,
                    context.Request.Path,
                    context.Response.StatusCode);
                throw;
            }
            finally
            {
                stopwatch.Stop();
                
                _logger.LogInformation(
                    "Request completed for {Method} {Path} with status {StatusCode} in {Duration}ms",
                    context.Request.Method,
                    context.Request.Path,
                    context.Response.StatusCode,
                    stopwatch.ElapsedMilliseconds);
            }
        }
    }
}`
    },
    prometheus: {
      serviceName: 'modernapi-api',
      version: '1.0.0',
      environment: 'production',
      exporters: {
        traces: [],
        metrics: ['prometheus'],
        logs: []
      },
      samplingRatio: 1.0,
      resourceAttributes: {},
      code: `// Custom Prometheus Metrics
using Prometheus;
using System.Diagnostics.Metrics;

public class ApiMetrics
{
    private readonly Counter _requestsTotal;
    private readonly Histogram _requestDuration;
    private readonly Gauge _activeConnections;
    private readonly Counter _errorsTotal;
    private readonly Gauge _businessMetrics;

    public ApiMetrics()
    {
        // HTTP metrics
        _requestsTotal = Metrics
            .CreateCounter("modernapi_http_requests_total", "Total HTTP requests",
                new[] { "method", "endpoint", "status_code" });

        _requestDuration = Metrics
            .CreateHistogram("modernapi_http_request_duration_seconds", "HTTP request duration",
                new[] { "method", "endpoint" },
                new[] { 0.001, 0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0 });

        _activeConnections = Metrics
            .CreateGauge("modernapi_active_connections", "Active database connections");

        // Error metrics
        _errorsTotal = Metrics
            .CreateCounter("modernapi_errors_total", "Total application errors",
                new[] { "type", "service", "operation" });

        // Business metrics
        _businessMetrics = Metrics
            .CreateGauge("modernapi_business_metrics", "Business-specific metrics",
                new[] { "metric_name", "category" });
    }

    public void RecordRequest(string method, string endpoint, int statusCode, double duration)
    {
        _requestsTotal.WithLabels(method, endpoint, statusCode.ToString()).Inc();
        _requestDuration.WithLabels(method, endpoint).Observe(duration);
    }

    public void RecordError(string type, string service, string operation)
    {
        _errorsTotal.WithLabels(type, service, operation).Inc();
    }

    public void SetActiveConnections(int count)
    {
        _activeConnections.Set(count);
    }

    public void SetBusinessMetric(string name, string category, double value)
    {
        _businessMetrics.WithLabels(name, category).Set(value);
    }
}

// Middleware to collect metrics
public class PrometheusMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ApiMetrics _metrics;

    public PrometheusMiddleware(RequestDelegate next, ApiMetrics metrics)
    {
        _next = next;
        _metrics = metrics;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            
            _metrics.RecordRequest(
                context.Request.Method,
                context.Request.Path.Value ?? "unknown",
                context.Response.StatusCode,
                stopwatch.Elapsed.TotalSeconds);
        }
    }
}`
    }
  }

  // Real-time data simulation
  React.useEffect(() => {
    if (!isRealTimeEnabled || !simulationRunning) return

    const interval = setInterval(() => {
      setMetrics(prevMetrics => 
        prevMetrics.map(metric => {
          const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
          const newValue = Math.max(0, metric.value * (1 + variation))
          
          let status: 'healthy' | 'warning' | 'critical' = 'healthy'
          if (newValue >= metric.threshold.critical) {
            status = 'critical'
          } else if (newValue >= metric.threshold.warning) {
            status = 'warning'
          }

          return {
            ...metric,
            value: parseFloat(newValue.toFixed(1)),
            timestamp: new Date(),
            status,
            trend: newValue > metric.value ? 'up' : newValue < metric.value ? 'down' : 'stable'
          }
        })
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [isRealTimeEnabled, simulationRunning])

  const filteredMetrics = selectedMetricCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedMetricCategory)

  const filteredLogs = logEntries.filter(log => {
    const matchesLevel = logLevel === 'all' || log.level === logLevel
    const matchesFilter = !logFilter || 
      log.message.toLowerCase().includes(logFilter.toLowerCase()) ||
      log.source.toLowerCase().includes(logFilter.toLowerCase())
    return matchesLevel && matchesFilter
  })

  const toggleMetricDetails = (metricId: string) => {
    setShowMetricDetails(prev => ({
      ...prev,
      [metricId]: !prev[metricId]
    }))
  }

  const toggleConfigCode = (configId: string) => {
    setShowConfigCode(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }))
  }

  const startSimulation = () => {
    setSimulationRunning(true)
  }

  const stopSimulation = () => {
    setSimulationRunning(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': case 'degraded': return 'text-yellow-500'
      case 'critical': case 'unhealthy': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'warning': case 'degraded': return <AlertTriangle className="w-4 h-4" />
      case 'critical': case 'unhealthy': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Monitoring & Observability Masterclass</h1>
            <p className="text-muted-foreground">
              Master OpenTelemetry, APM, distributed tracing, and production monitoring strategies
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <Badge variant="secondary" className="gap-1">
            <Activity className="w-3 h-3" />
            Live Telemetry
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Target className="w-3 h-3" />
            Distributed Tracing
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <BarChart3 className="w-3 h-3" />
            Real-time Metrics
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Bell className="w-3 h-3" />
            Smart Alerting
          </Badge>
        </div>

        {/* Control Panel */}
        <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Switch
              id="realtime"
              checked={isRealTimeEnabled}
              onCheckedChange={setIsRealTimeEnabled}
            />
            <label htmlFor="realtime" className="text-sm">
              Real-time Updates
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="alerts"
              checked={alertsEnabled}
              onCheckedChange={setAlertsEnabled}
            />
            <label htmlFor="alerts" className="text-sm">
              Alert Notifications
            </label>
          </div>

          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15m">15 minutes</SelectItem>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="6h">6 hours</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={simulationRunning ? "secondary" : "default"}
              size="sm"
              onClick={simulationRunning ? stopSimulation : startSimulation}
              className="gap-2"
            >
              {simulationRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Stop Simulation
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Simulation
                </>
              )}
            </Button>
            
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Live Dashboard</TabsTrigger>
          <TabsTrigger value="logs">Log Analysis</TabsTrigger>
          <TabsTrigger value="traces">Distributed Tracing</TabsTrigger>
          <TabsTrigger value="health">Health Monitoring</TabsTrigger>
          <TabsTrigger value="alerts">Alert Management</TabsTrigger>
          <TabsTrigger value="config">OpenTelemetry Setup</TabsTrigger>
        </TabsList>

        {/* Live Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6">
            {/* Metrics Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Metrics Overview
                </CardTitle>
                <CardDescription>
                  Real-time system and application performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <Select value={selectedMetricCategory} onValueChange={setSelectedMetricCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Metrics</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="application">Application</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modernapi-api">ModernAPI API</SelectItem>
                      <SelectItem value="modernapi-worker">Background Worker</SelectItem>
                      <SelectItem value="modernapi-frontend">Frontend BFF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Metrics Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredMetrics.map((metric) => (
                    <Card 
                      key={metric.id}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md',
                        metric.status === 'critical' && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10',
                        metric.status === 'warning' && 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10',
                        metric.status === 'healthy' && 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
                      )}
                      onClick={() => toggleMetricDetails(metric.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {metric.category === 'infrastructure' && <Server className="w-4 h-4" />}
                            {metric.category === 'performance' && <Zap className="w-4 h-4" />}
                            {metric.category === 'application' && <Code className="w-4 h-4" />}
                            {metric.category === 'business' && <TrendingUp className="w-4 h-4" />}
                            <span className={cn('w-2 h-2 rounded-full', getStatusColor(metric.status))} />
                          </div>
                          <div className="flex items-center gap-1">
                            {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                            {metric.trend === 'down' && <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />}
                            {metric.trend === 'stable' && <div className="w-3 h-0.5 bg-gray-400 rounded" />}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-medium text-sm">{metric.name}</h4>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{metric.value}</span>
                            <span className="text-sm text-muted-foreground">{metric.unit}</span>
                          </div>
                        </div>

                        {metric.category === 'infrastructure' && (
                          <Progress 
                            value={metric.value} 
                            className="mt-3 h-1"
                            max={100}
                          />
                        )}

                        {showMetricDetails[metric.id] && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            <div className="flex justify-between text-xs">
                              <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                              <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last updated: {metric.timestamp.toLocaleTimeString()}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {metric.category}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Architecture Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  System Architecture & Data Flow
                </CardTitle>
                <CardDescription>
                  Visual representation of telemetry data flow and system components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative bg-muted/20 rounded-lg p-6 min-h-[400px]">
                  {/* Architecture Diagram */}
                  <div className="grid grid-cols-4 gap-6 h-full">
                    {/* Applications */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-center">Applications</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Server className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-sm">ModernAPI</span>
                          </div>
                          <div className="text-xs space-y-1">
                            <div>• OpenTelemetry SDK</div>
                            <div>• Structured Logging</div>
                            <div>• Custom Metrics</div>
                          </div>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-sm">Frontend BFF</span>
                          </div>
                          <div className="text-xs space-y-1">
                            <div>• Browser Telemetry</div>
                            <div>• User Experience</div>
                            <div>• Performance Metrics</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Collection */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-center">Collection</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-orange-600" />
                            <span className="font-medium text-sm">OTEL Collector</span>
                          </div>
                          <div className="text-xs space-y-1">
                            <div>• Data Aggregation</div>
                            <div>• Format Conversion</div>
                            <div>• Routing & Filtering</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Storage */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-center">Storage</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Database className="w-4 h-4 text-purple-600" />
                            <span className="font-medium text-sm">Prometheus</span>
                          </div>
                          <div className="text-xs">Metrics Storage</div>
                        </div>
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            <span className="font-medium text-sm">Jaeger</span>
                          </div>
                          <div className="text-xs">Trace Storage</div>
                        </div>
                        <div className="p-3 bg-teal-100 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-teal-600" />
                            <span className="font-medium text-sm">Loki</span>
                          </div>
                          <div className="text-xs">Log Aggregation</div>
                        </div>
                      </div>
                    </div>

                    {/* Visualization */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-center">Visualization</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div className="flex items-center gap-2 mb-2">
                            <LineChart className="w-4 h-4 text-red-600" />
                            <span className="font-medium text-sm">Grafana</span>
                          </div>
                          <div className="text-xs space-y-1">
                            <div>• Dashboards</div>
                            <div>• Alerting</div>
                            <div>• Data Exploration</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data flow arrows */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                    {/* Applications to Collector */}
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                              refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" className="fill-muted-foreground" />
                      </marker>
                    </defs>
                    <path d="M 200 200 L 280 200" stroke="currentColor" strokeWidth="2" 
                          markerEnd="url(#arrowhead)" className="text-muted-foreground" />
                    <path d="M 360 200 L 440 200" stroke="currentColor" strokeWidth="2" 
                          markerEnd="url(#arrowhead)" className="text-muted-foreground" />
                    <path d="M 520 200 L 600 200" stroke="currentColor" strokeWidth="2" 
                          markerEnd="url(#arrowhead)" className="text-muted-foreground" />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Log Analysis */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Structured Log Analysis
              </CardTitle>
              <CardDescription>
                Real-time log aggregation with filtering, searching, and correlation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Log Filters */}
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs by message or source..."
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={logLevel} onValueChange={setLogLevel}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="fatal">Fatal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Log Entries */}
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className={cn(
                        'p-3 border rounded-lg font-mono text-sm',
                        log.level === 'error' && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10',
                        log.level === 'warn' && 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10',
                        log.level === 'info' && 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10',
                        log.level === 'debug' && 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/10'
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={log.level === 'error' ? 'destructive' : 'secondary'}
                            className="text-xs uppercase"
                          >
                            {log.level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {log.timestamp.toISOString()}
                          </span>
                          {log.traceId && (
                            <Badge variant="outline" className="text-xs">
                              <Link2 className="w-3 h-3 mr-1" />
                              {log.traceId.substring(0, 8)}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(JSON.stringify(log, null, 2))}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="font-medium">{log.message}</div>
                        
                        <div className="text-xs text-muted-foreground">
                          <div>Source: {log.source}</div>
                          {log.userId && <div>User ID: {log.userId}</div>}
                          {log.requestId && <div>Request ID: {log.requestId}</div>}
                          {log.duration && <div>Duration: {log.duration}ms</div>}
                          {log.method && log.path && (
                            <div>{log.method} {log.path} - {log.statusCode}</div>
                          )}
                        </div>

                        {log.exception && (
                          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs">
                            <div className="font-medium text-red-700 dark:text-red-400">Exception:</div>
                            <div className="text-red-600 dark:text-red-500 mt-1">{log.exception}</div>
                          </div>
                        )}

                        {Object.keys(log.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer">
                              View Metadata ({Object.keys(log.metadata).length} fields)
                            </summary>
                            <div className="mt-1 p-2 bg-muted/50 rounded text-xs">
                              <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distributed Tracing */}
        <TabsContent value="traces" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Distributed Tracing Visualization
              </CardTitle>
              <CardDescription>
                End-to-end request tracing across microservices and components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Trace Overview */}
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium">Trace ID: {sampleTrace.traceId}</h4>
                      <p className="text-sm text-muted-foreground">
                        Total Duration: {sampleTrace.duration}ms • Status: {sampleTrace.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{sampleTrace.service}</Badge>
                      <Badge variant={sampleTrace.status === 'ok' ? 'default' : 'destructive'}>
                        {sampleTrace.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Timeline Visualization */}
                  <div className="space-y-2">
                    {/* Root Span */}
                    <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{sampleTrace.operationName}</span>
                          <div className="flex items-center gap-2 text-sm">
                            <span>{sampleTrace.duration}ms</span>
                            <Progress value={100} className="w-20 h-2" />
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {sampleTrace.service} • {Object.keys(sampleTrace.tags).length} tags • {sampleTrace.logs.length} logs
                        </div>
                      </div>
                    </div>

                    {/* Child Spans */}
                    {sampleTrace.children.map((span, index) => (
                      <div key={span.id} className="ml-6 flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/10 border border-gray-200 dark:border-gray-800 rounded">
                        <div className="w-3 h-3 bg-gray-400 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{span.operationName}</span>
                            <div className="flex items-center gap-2 text-sm">
                              <span>{span.duration}ms</span>
                              <Progress 
                                value={(span.duration / sampleTrace.duration) * 100} 
                                className="w-16 h-1" 
                              />
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {span.service} • Started +{Math.abs(new Date(span.startTime).getTime() - new Date(sampleTrace.startTime).getTime())}ms
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trace Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Tags */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tags & Metadata</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(sampleTrace.tags).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <span className="font-mono text-muted-foreground">{key}</span>
                            <span className="font-mono bg-muted px-2 py-1 rounded">{value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Logs */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Span Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {sampleTrace.logs.map((log, index) => (
                          <div key={index} className="text-sm p-2 bg-muted/50 rounded">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline" className="text-xs">
                                {log.level}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {log.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <div>{log.message}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Service Map */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="w-5 h-5" />
                      Service Dependency Map
                    </CardTitle>
                    <CardDescription>
                      Visual representation of service interactions and dependencies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center space-x-8 p-8 bg-muted/20 rounded-lg">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                          <Globe className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-sm font-medium">Frontend</div>
                        <div className="text-xs text-muted-foreground">React + BFF</div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-8 h-0.5 bg-blue-400" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2">
                          <Server className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-sm font-medium">API Gateway</div>
                        <div className="text-xs text-muted-foreground">ModernAPI</div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-8 h-0.5 bg-green-400" />
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                      </div>

                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-2">
                          <Database className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-sm font-medium">Database</div>
                        <div className="text-xs text-muted-foreground">PostgreSQL</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Monitoring */}
        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                System Health Dashboard
              </CardTitle>
              <CardDescription>
                Real-time health checks and system component monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {healthChecks.map((check) => (
                  <Card key={check.id} className={cn(
                    'transition-all',
                    check.status === 'healthy' && 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10',
                    check.status === 'degraded' && 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10',
                    check.status === 'unhealthy' && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn('p-2 rounded-full', getStatusColor(check.status))}>
                            {getStatusIcon(check.status)}
                          </div>
                          <div>
                            <h4 className="font-medium">{check.name}</h4>
                            <p className="text-sm text-muted-foreground">{check.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{check.uptime}%</div>
                          <div className="text-xs text-muted-foreground">Uptime</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{check.responseTime}ms</div>
                          <div className="text-xs text-muted-foreground">Response Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold capitalize">{check.status}</div>
                          <div className="text-xs text-muted-foreground">Status</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{check.dependencies.length}</div>
                          <div className="text-xs text-muted-foreground">Dependencies</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {Math.round((Date.now() - check.lastCheck.getTime()) / 1000)}s
                          </div>
                          <div className="text-xs text-muted-foreground">Last Check</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {check.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          {check.endpoint && (
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View Endpoint
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Terminal className="w-4 h-4 mr-1" />
                            Run Check
                          </Button>
                        </div>
                      </div>

                      {check.dependencies.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm text-muted-foreground mb-1">Dependencies:</div>
                          <div className="flex flex-wrap gap-1">
                            {check.dependencies.map((dep) => (
                              <Badge key={dep} variant="outline" className="text-xs">
                                <Link2 className="w-3 h-3 mr-1" />
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alert Management */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Alert Rules & Notifications
              </CardTitle>
              <CardDescription>
                Configure intelligent alerting based on metrics and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertRules.map((rule) => (
                  <Card key={rule.id} className={cn(
                    'transition-all',
                    rule.severity === 'critical' && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10',
                    rule.severity === 'high' && 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10',
                    rule.severity === 'medium' && 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10',
                    rule.severity === 'low' && 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{rule.name}</h4>
                            <Badge 
                              variant={rule.severity === 'critical' ? 'destructive' : 'secondary'}
                              className="text-xs uppercase"
                            >
                              {rule.severity}
                            </Badge>
                            <Switch 
                              checked={rule.enabled}
                              onCheckedChange={(checked) => {
                                // Update rule enabled state
                                rule.enabled = checked
                              }}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAlert(selectedAlert === rule.id ? null : rule.id)}
                        >
                          {selectedAlert === rule.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <div className="font-semibold">{rule.metric}</div>
                          <div className="text-xs text-muted-foreground">Metric</div>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <div className="font-semibold">{rule.condition} {rule.threshold}</div>
                          <div className="text-xs text-muted-foreground">Condition</div>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <div className="font-semibold">{rule.duration}</div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <div className="font-semibold">{rule.channels.length}</div>
                          <div className="text-xs text-muted-foreground">Channels</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {rule.channels.map((channel) => (
                          <Badge key={channel} variant="outline" className="text-xs">
                            {channel === 'slack' && <Smartphone className="w-3 h-3 mr-1" />}
                            {channel === 'email' && <FileText className="w-3 h-3 mr-1" />}
                            {channel === 'pagerduty' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {channel}
                          </Badge>
                        ))}
                      </div>

                      {selectedAlert === rule.id && (
                        <div className="mt-3 pt-3 border-t space-y-3">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-sm mb-2">Alert Configuration</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Metric:</span>
                                  <code className="bg-muted px-1 rounded">{rule.metric}</code>
                                </div>
                                <div className="flex justify-between">
                                  <span>Threshold:</span>
                                  <code className="bg-muted px-1 rounded">{rule.condition} {rule.threshold}</code>
                                </div>
                                <div className="flex justify-between">
                                  <span>For Duration:</span>
                                  <code className="bg-muted px-1 rounded">{rule.duration}</code>
                                </div>
                                <div className="flex justify-between">
                                  <span>Severity:</span>
                                  <Badge variant="secondary" className="text-xs">{rule.severity}</Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="font-medium text-sm mb-2">Notification Settings</h5>
                              <div className="space-y-2">
                                {rule.channels.map((channel) => (
                                  <div key={channel} className="flex items-center justify-between">
                                    <span className="text-sm">{channel}</span>
                                    <Switch defaultChecked />
                                  </div>
                                ))}
                              </div>
                              {rule.runbook && (
                                <div className="mt-2">
                                  <Button variant="outline" size="sm" className="w-full">
                                    <FileText className="w-4 h-4 mr-1" />
                                    View Runbook
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OpenTelemetry Configuration */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                OpenTelemetry Configuration Guide
              </CardTitle>
              <CardDescription>
                Complete setup examples for production-ready observability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="dotnet" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="dotnet">.NET Configuration</TabsTrigger>
                  <TabsTrigger value="logging">Structured Logging</TabsTrigger>
                  <TabsTrigger value="prometheus">Prometheus Metrics</TabsTrigger>
                </TabsList>

                {Object.entries(openTelemetryConfigs).map(([key, config]) => (
                  <TabsContent key={key} value={key} className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Code className="w-5 h-5" />
                            {key === 'dotnet' ? 'OpenTelemetry .NET SDK' : 
                             key === 'logging' ? 'Serilog with OpenTelemetry' :
                             'Prometheus Metrics Integration'}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleConfigCode(key)}
                          >
                            {showConfigCode[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </CardTitle>
                        <CardDescription>
                          {key === 'dotnet' ? 'Complete OpenTelemetry configuration for .NET applications' :
                           key === 'logging' ? 'Structured logging with correlation IDs and distributed tracing' :
                           'Custom metrics collection and Prometheus integration'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {!showConfigCode[key] ? (
                          <div className="space-y-4">
                            {/* Configuration Overview */}
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Configuration Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Service Name:</span>
                                    <code className="bg-muted px-1 rounded">{config.serviceName}</code>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Version:</span>
                                    <code className="bg-muted px-1 rounded">{config.version}</code>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Environment:</span>
                                    <code className="bg-muted px-1 rounded">{config.environment}</code>
                                  </div>
                                  {config.samplingRatio < 1 && (
                                    <div className="flex justify-between">
                                      <span>Sampling Ratio:</span>
                                      <code className="bg-muted px-1 rounded">{config.samplingRatio * 100}%</code>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Exporters</h4>
                                <div className="space-y-2">
                                  {config.exporters.traces.length > 0 && (
                                    <div>
                                      <span className="text-sm text-muted-foreground">Traces:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {config.exporters.traces.map((exporter) => (
                                          <Badge key={exporter} variant="secondary" className="text-xs">
                                            {exporter}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {config.exporters.metrics.length > 0 && (
                                    <div>
                                      <span className="text-sm text-muted-foreground">Metrics:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {config.exporters.metrics.map((exporter) => (
                                          <Badge key={exporter} variant="secondary" className="text-xs">
                                            {exporter}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {config.exporters.logs.length > 0 && (
                                    <div>
                                      <span className="text-sm text-muted-foreground">Logs:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {config.exporters.logs.map((exporter) => (
                                          <Badge key={exporter} variant="secondary" className="text-xs">
                                            {exporter}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Alert>
                              <Settings className="h-4 w-4" />
                              <AlertTitle>Configuration Features</AlertTitle>
                              <AlertDescription className="text-sm">
                                <ul className="space-y-1 mt-2">
                                  {key === 'dotnet' && (
                                    <>
                                      <li>• Automatic ASP.NET Core instrumentation</li>
                                      <li>• Entity Framework Core query tracing</li>
                                      <li>• HTTP client request tracing</li>
                                      <li>• Custom metrics and traces</li>
                                      <li>• Resource attribute enrichment</li>
                                    </>
                                  )}
                                  {key === 'logging' && (
                                    <>
                                      <li>• Structured JSON logging format</li>
                                      <li>• Correlation ID tracking</li>
                                      <li>• OpenTelemetry span correlation</li>
                                      <li>• Multiple output destinations</li>
                                      <li>• Request/response logging middleware</li>
                                    </>
                                  )}
                                  {key === 'prometheus' && (
                                    <>
                                      <li>• Custom business metrics</li>
                                      <li>• HTTP request metrics</li>
                                      <li>• Database connection metrics</li>
                                      <li>• Error rate tracking</li>
                                      <li>• Performance histograms</li>
                                    </>
                                  )}
                                </ul>
                              </AlertDescription>
                            </Alert>

                            <div className="flex gap-2">
                              <Button onClick={() => toggleConfigCode(key)}>
                                <Code className="w-4 h-4 mr-2" />
                                View Implementation Code
                              </Button>
                              <Button variant="outline">
                                <Copy className="w-4 h-4 mr-2" />
                                Copy to Clipboard
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">Implementation Code</h4>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText(config.code)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleConfigCode(key)}
                                >
                                  <EyeOff className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <ScrollArea className="h-96 w-full">
                              <pre className="text-xs bg-muted p-4 rounded-lg font-mono overflow-x-auto">
                                <code>{config.code}</code>
                              </pre>
                            </ScrollArea>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Production Monitoring Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Metrics Strategy</h4>
                  <div className="space-y-2">
                    {[
                      'Define SLIs (Service Level Indicators) early',
                      'Use the RED method: Rate, Errors, Duration',
                      'Implement proper cardinality limits',
                      'Create business-specific metrics',
                      'Set up proper retention policies'
                    ].map((practice, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{practice}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Alerting Strategy</h4>
                  <div className="space-y-2">
                    {[
                      'Alert on symptoms, not causes',
                      'Use multiple severity levels',
                      'Implement alert fatigue prevention',
                      'Create runbooks for each alert',
                      'Test alert channels regularly'
                    ].map((practice, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{practice}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Tracing Strategy</h4>
                  <div className="space-y-2">
                    {[
                      'Implement sampling for high-volume services',
                      'Add meaningful span names and attributes',
                      'Trace critical business operations',
                      'Include correlation IDs in all operations',
                      'Set up trace-based alerting'
                    ].map((practice, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{practice}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Log Management</h4>
                  <div className="space-y-2">
                    {[
                      'Use structured logging consistently',
                      'Implement proper log levels',
                      'Include context in all log entries',
                      'Set up centralized log aggregation',
                      'Create log-based metrics and alerts'
                    ].map((practice, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{practice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Module Navigation */}
      <ModuleNavigation moduleId="monitoring" />
    </div>
  )
}