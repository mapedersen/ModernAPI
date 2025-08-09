using System.Diagnostics.Metrics;

namespace ModernAPI.API.Monitoring;

/// <summary>
/// Provides general API metrics collection.
/// </summary>
public class ApiMetrics
{
    private readonly Counter<int> _httpRequests;
    private readonly Histogram<double> _httpRequestDuration;
    private readonly Counter<int> _httpRequestErrors;
    private readonly UpDownCounter<int> _activeConnections;
    private readonly Counter<int> _databaseQueries;
    private readonly Histogram<double> _databaseQueryDuration;

    public ApiMetrics(IMeterFactory meterFactory)
    {
        var meter = meterFactory.Create("ModernAPI.Api", "1.0");

        // HTTP metrics
        _httpRequests = meter.CreateCounter<int>(
            "http.server.requests",
            unit: "requests",
            description: "Total number of HTTP requests");

        _httpRequestDuration = meter.CreateHistogram<double>(
            "http.server.duration",
            unit: "ms",
            description: "Duration of HTTP requests in milliseconds");

        _httpRequestErrors = meter.CreateCounter<int>(
            "http.server.errors",
            unit: "errors",
            description: "Total number of HTTP errors");

        _activeConnections = meter.CreateUpDownCounter<int>(
            "http.server.active_connections",
            unit: "connections",
            description: "Number of active HTTP connections");

        // Database metrics
        _databaseQueries = meter.CreateCounter<int>(
            "db.queries",
            unit: "queries",
            description: "Total number of database queries");

        _databaseQueryDuration = meter.CreateHistogram<double>(
            "db.query.duration",
            unit: "ms",
            description: "Duration of database queries in milliseconds");
    }

    public void RecordHttpRequest(string method, string endpoint, int statusCode, double durationMs)
    {
        var tags = new[]
        {
            new KeyValuePair<string, object?>("method", method),
            new KeyValuePair<string, object?>("endpoint", endpoint),
            new KeyValuePair<string, object?>("status_code", statusCode),
            new KeyValuePair<string, object?>("status_class", $"{statusCode / 100}xx")
        };

        _httpRequests.Add(1, tags);
        _httpRequestDuration.Record(durationMs, tags);

        if (statusCode >= 400)
        {
            _httpRequestErrors.Add(1, tags);
        }
    }

    public void RecordActiveConnection(int delta)
    {
        _activeConnections.Add(delta);
    }

    public void RecordDatabaseQuery(string operation, string table, double durationMs, bool success = true)
    {
        var tags = new[]
        {
            new KeyValuePair<string, object?>("operation", operation),
            new KeyValuePair<string, object?>("table", table),
            new KeyValuePair<string, object?>("status", success ? "success" : "failure")
        };

        _databaseQueries.Add(1, tags);
        _databaseQueryDuration.Record(durationMs, tags);
    }
}