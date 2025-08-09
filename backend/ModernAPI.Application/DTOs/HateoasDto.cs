using System.Text.Json.Serialization;

namespace ModernAPI.Application.DTOs;

/// <summary>
/// Represents a hypermedia link in HATEOAS responses.
/// Provides self-descriptive links that guide client navigation.
/// </summary>
public record LinkDto
{
    /// <summary>
    /// The URI of the linked resource.
    /// </summary>
    public required string Href { get; init; }

    /// <summary>
    /// The relationship of the link to the current resource.
    /// Common values: "self", "edit", "delete", "next", "prev"
    /// </summary>
    public required string Rel { get; init; }

    /// <summary>
    /// The HTTP method to use for this link.
    /// </summary>
    public required string Method { get; init; }

    /// <summary>
    /// Human-readable description of what the link does.
    /// </summary>
    public string? Title { get; init; }

    /// <summary>
    /// Media type expected by the linked resource.
    /// </summary>
    public string? Type { get; init; }
}

/// <summary>
/// Base class for DTOs that include HATEOAS links.
/// Provides hypermedia navigation capabilities for REST Level 3 compliance.
/// </summary>
public abstract record HateoasDto
{
    /// <summary>
    /// Collection of hypermedia links related to this resource.
    /// These links enable clients to discover available actions dynamically.
    /// </summary>
    [JsonPropertyName("_links")]
    public Dictionary<string, LinkDto> Links { get; init; } = new();

    /// <summary>
    /// Adds a hypermedia link to the resource.
    /// </summary>
    /// <param name="rel">The link relationship</param>
    /// <param name="link">The link details</param>
    public virtual void AddLink(string rel, LinkDto link)
    {
        Links[rel] = link;
    }

    /// <summary>
    /// Adds multiple hypermedia links to the resource.
    /// </summary>
    /// <param name="links">Dictionary of links to add</param>
    public virtual void AddLinks(Dictionary<string, LinkDto> links)
    {
        if (links == null) return;
        
        foreach (var (rel, link) in links)
        {
            Links[rel] = link;
        }
    }

    /// <summary>
    /// Checks if a specific link relationship exists.
    /// </summary>
    /// <param name="rel">The link relationship to check</param>
    /// <returns>True if the link exists, false otherwise</returns>
    public bool HasLink(string rel) => Links.ContainsKey(rel);

    /// <summary>
    /// Gets a link by its relationship.
    /// </summary>
    /// <param name="rel">The link relationship</param>
    /// <returns>The link if found, null otherwise</returns>
    public LinkDto? GetLink(string rel) => Links.TryGetValue(rel, out var link) ? link : null;
}

/// <summary>
/// Collection wrapper that includes HATEOAS links for pagination and navigation.
/// Used for list endpoints to provide hypermedia-driven navigation.
/// </summary>
/// <typeparam name="T">The type of items in the collection</typeparam>
public record HateoasCollectionDto<T> : HateoasDto where T : class
{
    /// <summary>
    /// The collection of items.
    /// </summary>
    public required IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();

    /// <summary>
    /// Total number of items across all pages.
    /// </summary>
    public int TotalCount { get; init; }

    /// <summary>
    /// Current page number (1-based).
    /// </summary>
    public int CurrentPage { get; init; }

    /// <summary>
    /// Number of items per page.
    /// </summary>
    public int PageSize { get; init; }

    /// <summary>
    /// Total number of pages.
    /// </summary>
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;

    /// <summary>
    /// Indicates if there is a next page.
    /// </summary>
    public bool HasNextPage => CurrentPage < TotalPages;

    /// <summary>
    /// Indicates if there is a previous page.
    /// </summary>
    public bool HasPreviousPage => CurrentPage > 1;

    /// <summary>
    /// Metadata about the collection and pagination.
    /// </summary>
    [JsonPropertyName("_metadata")]
    public object Metadata => new
    {
        TotalCount,
        CurrentPage,
        PageSize,
        TotalPages,
        HasNextPage,
        HasPreviousPage
    };
}