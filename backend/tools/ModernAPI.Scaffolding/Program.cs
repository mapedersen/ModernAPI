using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ModernAPI.Scaffolding.Commands;
using ModernAPI.Scaffolding.Services;

var rootCommand = new RootCommand("ModernAPI Scaffolding Tool - Generate Clean Architecture boilerplate code");

// Configure services
var services = new ServiceCollection();
services.AddLogging(builder => builder.AddConsole());
services.AddSingleton<ITemplateEngine, HandlebarsTemplateEngine>();
services.AddSingleton<IFileGenerator, FileGenerator>();
services.AddSingleton<IProjectAnalyzer, ProjectAnalyzer>();

var serviceProvider = services.BuildServiceProvider();

// Add scaffold command
var scaffoldCommand = new Command("scaffold", "Generate code scaffolding");
rootCommand.Add(scaffoldCommand);

// Add entity scaffolding command
var entityCommand = new EntityScaffoldCommand(serviceProvider);
scaffoldCommand.Add(entityCommand.GetCommand());

// Add service scaffolding command
var serviceCommand = new ServiceScaffoldCommand(serviceProvider);
scaffoldCommand.Add(serviceCommand.GetCommand());

// Add controller scaffolding command
var controllerCommand = new ControllerScaffoldCommand(serviceProvider);
scaffoldCommand.Add(controllerCommand.GetCommand());

return await rootCommand.InvokeAsync(args);