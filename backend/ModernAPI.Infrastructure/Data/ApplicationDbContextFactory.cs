using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ModernAPI.Infrastructure.Data;

/// <summary>
/// Design-time factory for ApplicationDbContext.
/// Used by EF Core migrations when the application isn't running.
/// </summary>
public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // Load .env file for design-time operations
        DotNetEnv.Env.Load("../.env");
        
        var connectionString = Environment.GetEnvironmentVariable("POSTGRES_CONNECTION_STRING")
            ?? "Host=localhost;Port=5432;Database=modernapi;Username=modernapi_user;Password=dev_password_123;";

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.MigrationsAssembly("ModernAPI.Infrastructure");
        });

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}