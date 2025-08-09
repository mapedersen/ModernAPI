using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ModernAPI.Scaffolding.Commands;

public class ServiceScaffoldCommand
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ServiceScaffoldCommand> _logger;

    public ServiceScaffoldCommand(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
        _logger = serviceProvider.GetRequiredService<ILogger<ServiceScaffoldCommand>>();
    }

    public Command GetCommand()
    {
        var serviceCommand = new Command("service", "Generate a service class with interface");

        var nameArgument = new Argument<string>(
            name: "name",
            description: "The name of the service (e.g., 'EmailService', 'PaymentService')"
        );

        var lifetimeOption = new Option<string>(
            aliases: new[] { "--lifetime", "-l" },
            description: "Service lifetime: Singleton, Scoped, or Transient (default: Scoped)"
        ) { IsRequired = false };

        serviceCommand.AddArgument(nameArgument);
        serviceCommand.AddOption(lifetimeOption);

        serviceCommand.SetHandler(async (string name, string? lifetime) =>
        {
            await HandleServiceScaffold(name, lifetime ?? "Scoped");
        }, nameArgument, lifetimeOption);

        return serviceCommand;
    }

    private async Task HandleServiceScaffold(string name, string lifetime)
    {
        _logger.LogInformation("Service scaffolding for {ServiceName} with {Lifetime} lifetime", name, lifetime);
        
        Console.WriteLine($"🚧 Service scaffolding for '{name}' is not yet implemented.");
        Console.WriteLine("📋 This feature will generate:");
        Console.WriteLine($"   • Application/Interfaces/I{name}.cs");
        Console.WriteLine($"   • Application/Services/{name}.cs");
        Console.WriteLine($"   • DI registration code snippet");
        
        await Task.CompletedTask;
    }
}