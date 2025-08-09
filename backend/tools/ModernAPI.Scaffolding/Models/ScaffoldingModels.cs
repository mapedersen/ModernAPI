namespace ModernAPI.Scaffolding.Models;

public class ProjectStructure
{
    public string RootPath { get; set; } = string.Empty;
    public string? ApiProjectPath { get; set; }
    public string? ApplicationProjectPath { get; set; }
    public string? DomainProjectPath { get; set; }
    public string? InfrastructureProjectPath { get; set; }
    public string? TestsPath { get; set; }
    public bool IsModernApiProject { get; set; }
}

public class EntityModel
{
    public string Name { get; set; } = string.Empty;
    public string NamePlural { get; set; } = string.Empty;
    public string NameCamel { get; set; } = string.Empty;
    public List<PropertyModel> Properties { get; set; } = new();
    public bool RequiresAuth { get; set; } = true;
    public string Namespace { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

public class PropertyModel
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public bool IsNullable { get; set; }
    public List<string> Validations { get; set; } = new();
    public string? DefaultValue { get; set; }
    public bool IsForeignKey { get; set; }
    public string? RelatedEntity { get; set; }
}

public class ServiceModel
{
    public string Name { get; set; } = string.Empty;
    public string NameInterface { get; set; } = string.Empty;
    public ServiceLifetime Lifetime { get; set; } = ServiceLifetime.Scoped;
    public List<string> Dependencies { get; set; } = new();
    public string Namespace { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

public class ControllerModel
{
    public string Name { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public bool RequiresAuth { get; set; } = true;
    public List<string> Actions { get; set; } = new();
    public string? RelatedEntity { get; set; }
    public string Namespace { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

public enum ServiceLifetime
{
    Singleton,
    Scoped,
    Transient
}