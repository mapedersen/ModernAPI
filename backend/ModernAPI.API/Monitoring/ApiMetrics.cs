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

    /// <summary>
    /// Initializes a new instance of the ApiMetrics class.
    /// </summary>
    /// <param name="meterFactory">Factory for creating meters</param>
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

    /// <summary>
    /// Records metrics for an HTTP request.
    /// </summary>
    /// <param name="method">The HTTP method (GET, POST, etc.)</param>
    /// <param name="endpoint">The endpoint being accessed</param>
    /// <param name="statusCode">The HTTP status code returned</param>
    /// <param name="durationMs">The request duration in milliseconds</param>
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

    /// <summary>
    /// Records the change in active connections.
    /// </summary>
    /// <param name="delta">The change in active connections (positive for new connections, negative for closed connections)</param>
    public void RecordActiveConnection(int delta)
    {
        _activeConnections.Add(delta);
    }

    /// <summary>
    /// Records metrics for a database query.
    /// </summary>
    /// <param name="operation">The type of database operation (SELECT, INSERT, etc.)</param>
    /// <param name="table">The database table involved in the operation</param>
    /// <param name="durationMs">The query duration in milliseconds</param>
    /// <param name="success">Whether the query was successful</param>
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