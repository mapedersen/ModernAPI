using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Models;

namespace ModernAPI.API.OpenApi;

/// <summary>
/// OpenAPI document transformer that adds API versioning information to generated documentation.
/// This enhances the OpenAPI spec with version-specific metadata for better documentation.
/// </summary>
public sealed class ApiVersionOpenApiTransformer : IOpenApiDocumentTransformer
{
    /// <summary>
    /// Transforms the OpenAPI document to include API version information.
    /// </summary>
    /// <param name="document">The OpenAPI document to transform</param>
    /// <param name="context">The transformation context containing API version info</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completed task</returns>
    public Task TransformAsync(OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        // Get the API version from the context
        var apiDescription = context.ApplicationServices.GetService<IApiVersionDescriptionProvider>();
        
        // Find the version for this document
        var apiVersion = context.DocumentName;
        
        // Update document info with version details
        document.Info.Title = "ModernAPI";
        document.Info.Description = "A modern .NET API template with Clean Architecture, DDD, and REST Level 3 compliance.";
        document.Info.Version = apiVersion ?? "1.0";
        
        // Add version-specific information
        if (apiVersion != null)
        {
            document.Info.Title = $"ModernAPI v{apiVersion}";
            document.Info.Description += $"\n\nAPI Version: {apiVersion}";
        }
        
        // Add contact information
        document.Info.Contact = new OpenApiContact
        {
            Name = "ModernAPI Development Team",
            Email = "api@modernapi.dev",
            Url = new Uri("https://github.com/modernapi/template")
        };
        
        // Add license information
        document.Info.License = new OpenApiLicense
        {
            Name = "MIT",
            Url = new Uri("https://github.com/modernapi/template/blob/main/LICENSE")
        };
        
        // Add servers information
        document.Servers = new List<OpenApiServer>
        {
            new()
            {
                Url = "http://localhost:5051",
                Description = "Development server"
            },
            new()
            {
                Url = "https://api.modernapi.dev",
                Description = "Production server"
            }
        };
        
        // Add API versioning information to the document
        if (document.Extensions.ContainsKey("x-api-version") == false)
        {
            document.Extensions.Add("x-api-version", new Microsoft.OpenApi.Any.OpenApiString(apiVersion ?? "1.0"));
        }
        
        return Task.CompletedTask;
    }
}