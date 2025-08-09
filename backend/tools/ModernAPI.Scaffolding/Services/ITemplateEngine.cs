using ModernAPI.Scaffolding.Models;

namespace ModernAPI.Scaffolding.Services;

public interface ITemplateEngine
{
    string ProcessTemplate(string templateName, object model);
    Task<string> ProcessTemplateAsync(string templateName, object model);
}

public interface IFileGenerator
{
    Task GenerateFileAsync(string templateName, object model, string outputPath);
    Task GenerateFilesAsync(Dictionary<string, (object model, string outputPath)> fileDefinitions);
}

public interface IProjectAnalyzer
{
    Task<ProjectStructure> AnalyzeProjectAsync(string projectPath);
    bool IsModernApiProject(string path);
    string? FindProjectRoot(string startPath);
}