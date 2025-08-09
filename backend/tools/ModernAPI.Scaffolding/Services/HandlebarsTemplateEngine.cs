using System.Reflection;
using System.Text;
using HandlebarsDotNet;
using Microsoft.Extensions.Logging;

namespace ModernAPI.Scaffolding.Services;

public class HandlebarsTemplateEngine : ITemplateEngine
{
    private readonly ILogger<HandlebarsTemplateEngine> _logger;
    private readonly IHandlebars _handlebars;

    public HandlebarsTemplateEngine(ILogger<HandlebarsTemplateEngine> logger)
    {
        _logger = logger;
        _handlebars = Handlebars.Create();
        RegisterHelpers();
    }

    public string ProcessTemplate(string templateName, object model)
    {
        try
        {
            var templateContent = GetEmbeddedTemplate(templateName);
            var template = _handlebars.Compile(templateContent);
            return template(model);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing template {TemplateName}", templateName);
            throw;
        }
    }

    public async Task<string> ProcessTemplateAsync(string templateName, object model)
    {
        return await Task.FromResult(ProcessTemplate(templateName, model));
    }

    private string GetEmbeddedTemplate(string templateName)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = $"ModernAPI.Scaffolding.Templates.{templateName}.hbs";

        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null)
        {
            throw new FileNotFoundException($"Template not found: {templateName}");
        }

        using var reader = new StreamReader(stream, Encoding.UTF8);
        return reader.ReadToEnd();
    }

    private void RegisterHelpers()
    {
        // Helper for PascalCase conversion
        _handlebars.RegisterHelper("pascalCase", (writer, context, parameters) =>
        {
            if (parameters.Length > 0 && parameters[0] != null)
            {
                var value = parameters[0].ToString();
                writer.WriteSafeString(ToPascalCase(value));
            }
        });

        // Helper for camelCase conversion
        _handlebars.RegisterHelper("camelCase", (writer, context, parameters) =>
        {
            if (parameters.Length > 0 && parameters[0] != null)
            {
                var value = parameters[0].ToString();
                writer.WriteSafeString(ToCamelCase(value));
            }
        });

        // Helper for pluralization
        _handlebars.RegisterHelper("plural", (writer, context, parameters) =>
        {
            if (parameters.Length > 0 && parameters[0] != null)
            {
                var value = parameters[0].ToString();
                writer.WriteSafeString(Pluralize(value));
            }
        });

        // Helper for checking if property is nullable
        _handlebars.RegisterHelper("isNullable", (writer, context, parameters) =>
        {
            if (parameters.Length > 0 && parameters[0] != null)
            {
                var type = parameters[0].ToString();
                writer.WriteSafeString(IsNullableType(type) ? "true" : "false");
            }
        });
    }

    private static string ToPascalCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        return char.ToUpper(input[0]) + input[1..];
    }

    private static string ToCamelCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        return char.ToLower(input[0]) + input[1..];
    }

    private static string Pluralize(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        
        // Simple pluralization rules - extend as needed
        if (input.EndsWith("y"))
            return input[..^1] + "ies";
        if (input.EndsWith("s") || input.EndsWith("x") || input.EndsWith("z") || 
            input.EndsWith("ch") || input.EndsWith("sh"))
            return input + "es";
        
        return input + "s";
    }

    private static bool IsNullableType(string type)
    {
        return type.EndsWith("?") || type.StartsWith("string") || type.StartsWith("DateTime?") || 
               type.StartsWith("decimal?") || type.StartsWith("int?") || type.StartsWith("bool?");
    }
}