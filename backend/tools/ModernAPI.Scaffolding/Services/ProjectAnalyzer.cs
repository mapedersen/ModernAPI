using Microsoft.Extensions.Logging;
using ModernAPI.Scaffolding.Models;

namespace ModernAPI.Scaffolding.Services;

public class ProjectAnalyzer : IProjectAnalyzer
{
    private readonly ILogger<ProjectAnalyzer> _logger;

    public ProjectAnalyzer(ILogger<ProjectAnalyzer> logger)
    {
        _logger = logger;
    }

    public async Task<ProjectStructure> AnalyzeProjectAsync(string projectPath)
    {
        _logger.LogInformation("Analyzing project structure at {ProjectPath}", projectPath);

        var structure = new ProjectStructure
        {
            RootPath = projectPath,
            IsModernApiProject = IsModernApiProject(projectPath)
        };

        if (!structure.IsModernApiProject)
        {
            throw new InvalidOperationException($"The path {projectPath} does not appear to be a ModernAPI project. " +
                "Please run this command from the root of a ModernAPI project.");
        }

        // Find project directories
        structure.ApiProjectPath = FindProjectDirectory(projectPath, "*.API");
        structure.ApplicationProjectPath = FindProjectDirectory(projectPath, "*.Application");
        structure.DomainProjectPath = FindProjectDirectory(projectPath, "*.Domain");
        structure.InfrastructureProjectPath = FindProjectDirectory(projectPath, "*.Infrastructure");
        structure.TestsPath = Path.Combine(projectPath, "tests");

        // Validate required directories exist
        ValidateProjectStructure(structure);

        _logger.LogInformation("Project analysis completed successfully");
        return structure;
    }

    public bool IsModernApiProject(string path)
    {
        // Check for key indicators of a ModernAPI project
        var indicators = new[]
        {
            "ModernAPI.sln",
            "*.API",
            "*.Application", 
            "*.Domain",
            "*.Infrastructure"
        };

        foreach (var indicator in indicators)
        {
            var pattern = Path.Combine(path, indicator);
            if (indicator.Contains("*"))
            {
                var searchPattern = Path.GetFileName(indicator);
                var directory = Path.GetDirectoryName(pattern) ?? path;
                if (Directory.GetDirectories(directory, searchPattern).Length > 0)
                    continue;
                return false;
            }
            else
            {
                if (File.Exists(pattern) || Directory.Exists(pattern))
                    continue;
                return false;
            }
        }

        return true;
    }

    public string? FindProjectRoot(string startPath)
    {
        var current = new DirectoryInfo(startPath);
        
        while (current != null)
        {
            if (IsModernApiProject(current.FullName))
            {
                return current.FullName;
            }
            current = current.Parent;
        }

        return null;
    }

    private string? FindProjectDirectory(string rootPath, string pattern)
    {
        var directories = Directory.GetDirectories(rootPath, pattern);
        return directories.FirstOrDefault();
    }

    private void ValidateProjectStructure(ProjectStructure structure)
    {
        var requiredPaths = new Dictionary<string, string?>
        {
            ["API Project"] = structure.ApiProjectPath,
            ["Application Project"] = structure.ApplicationProjectPath,
            ["Domain Project"] = structure.DomainProjectPath,
            ["Infrastructure Project"] = structure.InfrastructureProjectPath
        };

        var missingPaths = requiredPaths
            .Where(kvp => string.IsNullOrEmpty(kvp.Value) || !Directory.Exists(kvp.Value))
            .Select(kvp => kvp.Key)
            .ToList();

        if (missingPaths.Any())
        {
            throw new InvalidOperationException($"Missing required project directories: {string.Join(", ", missingPaths)}");
        }
    }
}