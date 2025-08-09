using Microsoft.Extensions.Logging;

namespace ModernAPI.Scaffolding.Services;

public class FileGenerator : IFileGenerator
{
    private readonly ITemplateEngine _templateEngine;
    private readonly ILogger<FileGenerator> _logger;

    public FileGenerator(ITemplateEngine templateEngine, ILogger<FileGenerator> logger)
    {
        _templateEngine = templateEngine;
        _logger = logger;
    }

    public async Task GenerateFileAsync(string templateName, object model, string outputPath)
    {
        try
        {
            _logger.LogInformation("Generating file {OutputPath} from template {TemplateName}", outputPath, templateName);

            var content = await _templateEngine.ProcessTemplateAsync(templateName, model);
            
            // Ensure directory exists
            var directory = Path.GetDirectoryName(outputPath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
                _logger.LogDebug("Created directory {Directory}", directory);
            }

            // Write file
            await File.WriteAllTextAsync(outputPath, content);
            _logger.LogInformation("Successfully generated {OutputPath}", outputPath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating file {OutputPath}", outputPath);
            throw;
        }
    }

    public async Task GenerateFilesAsync(Dictionary<string, (object model, string outputPath)> fileDefinitions)
    {
        var tasks = fileDefinitions.Select(async kvp =>
        {
            var (templateName, (model, outputPath)) = (kvp.Key, kvp.Value);
            await GenerateFileAsync(templateName, model, outputPath);
        });

        await Task.WhenAll(tasks);
        _logger.LogInformation("Successfully generated {Count} files", fileDefinitions.Count);
    }
}