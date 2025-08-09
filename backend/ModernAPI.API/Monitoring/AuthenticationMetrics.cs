using System.Diagnostics.Metrics;

namespace ModernAPI.API.Monitoring;

/// <summary>
/// Provides metrics collection for authentication-related operations.
/// </summary>
public class AuthenticationMetrics
{
    private readonly Counter<int> _loginAttempts;
    private readonly Counter<int> _loginSuccesses;
    private readonly Counter<int> _loginFailures;
    private readonly Counter<int> _registrations;
    private readonly Counter<int> _tokenRefreshes;
    private readonly Counter<int> _tokenRefreshFailures;
    private readonly Counter<int> _logouts;
    private readonly Histogram<double> _authenticationDuration;
    private readonly UpDownCounter<int> _activeSessions;

    public AuthenticationMetrics(IMeterFactory meterFactory)
    {
        var meter = meterFactory.Create("ModernAPI.Authentication", "1.0");

        // Counters for authentication events
        _loginAttempts = meter.CreateCounter<int>(
            "auth.login.attempts",
            unit: "attempts",
            description: "Total number of login attempts");

        _loginSuccesses = meter.CreateCounter<int>(
            "auth.login.successes",
            unit: "successes",
            description: "Total number of successful logins");

        _loginFailures = meter.CreateCounter<int>(
            "auth.login.failures",
            unit: "failures",
            description: "Total number of failed logins");

        _registrations = meter.CreateCounter<int>(
            "auth.registrations",
            unit: "registrations",
            description: "Total number of user registrations");

        _tokenRefreshes = meter.CreateCounter<int>(
            "auth.token.refreshes",
            unit: "refreshes",
            description: "Total number of token refresh operations");

        _tokenRefreshFailures = meter.CreateCounter<int>(
            "auth.token.refresh.failures",
            unit: "failures",
            description: "Total number of failed token refresh operations");

        _logouts = meter.CreateCounter<int>(
            "auth.logouts",
            unit: "logouts",
            description: "Total number of logout operations");

        // Histogram for tracking authentication duration
        _authenticationDuration = meter.CreateHistogram<double>(
            "auth.duration",
            unit: "ms",
            description: "Duration of authentication operations in milliseconds");

        // UpDownCounter for active sessions
        _activeSessions = meter.CreateUpDownCounter<int>(
            "auth.sessions.active",
            unit: "sessions",
            description: "Current number of active sessions");
    }

    public void RecordLoginAttempt(string method = "password")
    {
        _loginAttempts.Add(1, new KeyValuePair<string, object?>("method", method));
    }

    public void RecordLoginSuccess(string method = "password", double durationMs = 0)
    {
        _loginSuccesses.Add(1, new KeyValuePair<string, object?>("method", method));
        if (durationMs > 0)
        {
            _authenticationDuration.Record(durationMs, 
                new KeyValuePair<string, object?>("operation", "login"),
                new KeyValuePair<string, object?>("status", "success"));
        }
        _activeSessions.Add(1);
    }

    public void RecordLoginFailure(string method = "password", string reason = "invalid_credentials", double durationMs = 0)
    {
        _loginFailures.Add(1, 
            new KeyValuePair<string, object?>("method", method),
            new KeyValuePair<string, object?>("reason", reason));
        
        if (durationMs > 0)
        {
            _authenticationDuration.Record(durationMs,
                new KeyValuePair<string, object?>("operation", "login"),
                new KeyValuePair<string, object?>("status", "failure"));
        }
    }

    public void RecordRegistration(bool success = true, double durationMs = 0)
    {
        _registrations.Add(1, new KeyValuePair<string, object?>("status", success ? "success" : "failure"));
        if (durationMs > 0)
        {
            _authenticationDuration.Record(durationMs,
                new KeyValuePair<string, object?>("operation", "registration"),
                new KeyValuePair<string, object?>("status", success ? "success" : "failure"));
        }
    }

    public void RecordTokenRefresh(bool success = true)
    {
        if (success)
        {
            _tokenRefreshes.Add(1);
        }
        else
        {
            _tokenRefreshFailures.Add(1);
        }
    }

    public void RecordLogout()
    {
        _logouts.Add(1);
        _activeSessions.Add(-1);
    }

    public void RecordLogoutAll(int sessionCount)
    {
        _logouts.Add(1, new KeyValuePair<string, object?>("type", "all_devices"));
        _activeSessions.Add(-sessionCount);
    }
}

/// <summary>
/// Extension methods for registering metrics services.
/// </summary>
public static class MetricsServiceExtensions
{
    public static IServiceCollection AddApplicationMetrics(this IServiceCollection services)
    {
        services.AddSingleton<AuthenticationMetrics>();
        services.AddSingleton<ApiMetrics>();
        
        return services;
    }
}