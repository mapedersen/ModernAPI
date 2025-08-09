using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ModernAPI.Scaffolding.Models;
using ModernAPI.Scaffolding.Services;

namespace ModernAPI.Scaffolding.Commands;

public class EntityScaffoldCommand
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EntityScaffoldCommand> _logger;

    public EntityScaffoldCommand(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
        _logger = serviceProvider.GetRequiredService<ILogger<EntityScaffoldCommand>>();
    }

    public Command GetCommand()
    {
        var entityCommand = new Command("entity", "Generate a complete entity with all Clean Architecture layers");

        var nameArgument = new Argument<string>(
            name: "name",
            description: "The name of the entity (e.g., 'Product', 'Order')"
        );

        var propertiesOption = new Option<string[]>(
            aliases: new[] { "--properties", "-p" },
            description: "Properties in format 'Name:Type:Validations' (e.g., 'Name:string:required,MaxLength(100)')"
        );

        var noAuthOption = new Option<bool>(
            aliases: new[] { "--no-auth", "-n" },
            description: "Generate entity without authentication requirements"
        );

        var outputOption = new Option<string?>(
            aliases: new[] { "--output", "-o" },
            description: "Output directory (defaults to current directory)"
        );

        entityCommand.AddArgument(nameArgument);
        entityCommand.AddOption(propertiesOption);
        entityCommand.AddOption(noAuthOption);
        entityCommand.AddOption(outputOption);

        entityCommand.SetHandler(async (string name, string[] properties, bool noAuth, string? output) =>
        {
            await HandleEntityScaffold(name, properties, noAuth, output);
        }, nameArgument, propertiesOption, noAuthOption, outputOption);

        return entityCommand;
    }

    private async Task HandleEntityScaffold(string name, string[] properties, bool noAuth, string? outputPath)
    {
        try
        {
            _logger.LogInformation("Starting entity scaffolding for {EntityName}", name);

            var projectAnalyzer = _serviceProvider.GetRequiredService<IProjectAnalyzer>();
            var fileGenerator = _serviceProvider.GetRequiredService<IFileGenerator>();

            // Find project root
            var currentPath = outputPath ?? Directory.GetCurrentDirectory();
            var projectRoot = projectAnalyzer.FindProjectRoot(currentPath);
            
            if (projectRoot == null)
            {
                throw new InvalidOperationException("Could not find ModernAPI project root. Please run this command from within a ModernAPI project.");
            }

            // Analyze project structure
            var projectStructure = await projectAnalyzer.AnalyzeProjectAsync(projectRoot);

            // Parse properties
            var parsedProperties = ParseProperties(properties);

            // Create entity model
            var entityModel = new EntityModel
            {
                Name = name,
                NamePlural = Pluralize(name),
                NameCamel = ToCamelCase(name),
                Properties = parsedProperties,
                RequiresAuth = !noAuth,
                Namespace = "ModernAPI"
            };

            // Generate all files
            await GenerateEntityFiles(entityModel, projectStructure, fileGenerator);

            Console.WriteLine($"✅ Successfully generated entity '{name}' with {parsedProperties.Count} properties");
            Console.WriteLine("📝 Generated files:");
            Console.WriteLine($"   • Domain/Entities/{name}.cs");
            Console.WriteLine($"   • Domain/Interfaces/I{name}Repository.cs");
            Console.WriteLine($"   • Infrastructure/Repositories/{name}Repository.cs");
            Console.WriteLine($"   • Infrastructure/Data/Configurations/{name}Configuration.cs");
            Console.WriteLine($"   • Application/DTOs/{name}Dtos.cs");
            Console.WriteLine($"   • Application/Interfaces/I{name}Service.cs");
            Console.WriteLine($"   • Application/Services/{name}Service.cs");
            Console.WriteLine($"   • Application/Validators/{name}Validators.cs");
            Console.WriteLine($"   • API/Controllers/{entityModel.NamePlural}Controller.cs");
            Console.WriteLine();
            Console.WriteLine("🔧 Next steps:");
            Console.WriteLine($"   1. Add DbSet<{name}> to ApplicationDbContext.cs");
            Console.WriteLine($"   2. Register I{name}Repository and I{name}Service in DI container");
            Console.WriteLine($"   3. Create and run database migration: dotnet ef migrations add Add{name}");
            Console.WriteLine($"   4. Write unit tests for {name} entity and services");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during entity scaffolding");
            Console.WriteLine($"❌ Error: {ex.Message}");
            Environment.Exit(1);
        }
    }

    private List<PropertyModel> ParseProperties(string[] properties)
    {
        var result = new List<PropertyModel>();

        foreach (var prop in properties)
        {
            var parts = prop.Split(':');
            if (parts.Length < 2)
            {
                throw new ArgumentException($"Invalid property format: {prop}. Expected format: 'Name:Type' or 'Name:Type:Validations'");
            }

            var propertyModel = new PropertyModel
            {
                Name = parts[0].Trim(),
                Type = parts[1].Trim(),
                IsRequired = false,
                IsNullable = IsNullableType(parts[1].Trim())
            };

            // Parse validations
            if (parts.Length > 2)
            {
                var validations = parts[2].Split(',');
                foreach (var validation in validations)
                {
                    var trimmed = validation.Trim();
                    propertyModel.Validations.Add(trimmed);

                    if (trimmed.Equals("required", StringComparison.OrdinalIgnoreCase))
                    {
                        propertyModel.IsRequired = true;
                        propertyModel.IsNullable = false;
                    }

                    if (trimmed.StartsWith("foreign", StringComparison.OrdinalIgnoreCase))
                    {
                        propertyModel.IsForeignKey = true;
                        // Extract related entity from foreign(EntityName)
                        var match = System.Text.RegularExpressions.Regex.Match(trimmed, @"foreign\((\w+)\)");
                        if (match.Success)
                        {
                            propertyModel.RelatedEntity = match.Groups[1].Value;
                        }
                    }
                }
            }

            result.Add(propertyModel);
        }

        return result;
    }

    private async Task GenerateEntityFiles(EntityModel model, ProjectStructure structure, IFileGenerator generator)
    {
        var files = new Dictionary<string, (object model, string outputPath)>
        {
            // Domain Layer
            ["Entity"] = (model, Path.Combine(structure.DomainProjectPath!, "Entities", $"{model.Name}.cs")),
            ["Repository.Interface"] = (model, Path.Combine(structure.DomainProjectPath!, "Interfaces", $"I{model.Name}Repository.cs")),

            // Infrastructure Layer
            ["Repository.Implementation"] = (model, Path.Combine(structure.InfrastructureProjectPath!, "Repositories", $"{model.Name}Repository.cs")),
            ["EntityConfiguration"] = (model, Path.Combine(structure.InfrastructureProjectPath!, "Data", "Configurations", $"{model.Name}Configuration.cs")),

            // Application Layer
            ["DTOs"] = (model, Path.Combine(structure.ApplicationProjectPath!, "DTOs", $"{model.Name}Dtos.cs")),
            ["Service.Interface"] = (model, Path.Combine(structure.ApplicationProjectPath!, "Interfaces", $"I{model.Name}Service.cs")),
            ["Service.Implementation"] = (model, Path.Combine(structure.ApplicationProjectPath!, "Services", $"{model.Name}Service.cs")),
            ["Validators"] = (model, Path.Combine(structure.ApplicationProjectPath!, "Validators", $"{model.Name}Validators.cs")),

            // API Layer
            ["Controller"] = (model, Path.Combine(structure.ApiProjectPath!, "Controllers", $"{model.NamePlural}Controller.cs"))
        };

        await generator.GenerateFilesAsync(files);
    }

    private static string Pluralize(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        
        if (input.EndsWith("y"))
            return input[..^1] + "ies";
        if (input.EndsWith("s") || input.EndsWith("x") || input.EndsWith("z") || 
            input.EndsWith("ch") || input.EndsWith("sh"))
            return input + "es";
        
        return input + "s";
    }

    private static string ToCamelCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        return char.ToLower(input[0]) + input[1..];
    }

    private static bool IsNullableType(string type)
    {
        return type.EndsWith("?") || type.StartsWith("string") || 
               type.Contains("DateTime?") || type.Contains("decimal?") || 
               type.Contains("int?") || type.Contains("bool?");
    }
}