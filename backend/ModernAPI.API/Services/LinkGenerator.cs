using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using ModernAPI.Application.DTOs;

namespace ModernAPI.API.Services;

/// <summary>
/// Service for generating HATEOAS hypermedia links.
/// Provides standardized link creation for REST Level 3 compliance.
/// </summary>
public interface ILinkGenerator
{
    /// <summary>
    /// Generates a link to a specific action.
    /// </summary>
    /// <param name="action">The action name</param>
    /// <param name="controller">The controller name</param>
    /// <param name="values">Route values</param>
    /// <param name="rel">Link relationship</param>
    /// <param name="method">HTTP method</param>
    /// <param name="title">Optional link title</param>
    /// <returns>The generated link</returns>
    LinkDto GenerateLink(string action, string controller, object? values = null, 
        string rel = "self", string method = "GET", string? title = null);

    /// <summary>
    /// Generates standard CRUD links for a user resource.
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="currentUserId">The current authenticated user ID</param>
    /// <param name="isAdmin">Whether the current user is an admin</param>
    /// <returns>Dictionary of available links</returns>
    Dictionary<string, LinkDto> GenerateUserLinks(Guid userId, string? currentUserId = null, bool isAdmin = false);

    /// <summary>
    /// Generates pagination links for a collection.
    /// </summary>
    /// <param name="controller">The controller name</param>
    /// <param name="action">The action name</param>
    /// <param name="currentPage">Current page number</param>
    /// <param name="totalPages">Total number of pages</param>
    /// <param name="pageSize">Items per page</param>
    /// <param name="additionalRouteValues">Additional route parameters</param>
    /// <returns>Dictionary of pagination links</returns>
    Dictionary<string, LinkDto> GeneratePaginationLinks(string controller, string action, 
        int currentPage, int totalPages, int pageSize, object? additionalRouteValues = null);

    /// <summary>
    /// Generates authentication-related links.
    /// </summary>
    /// <param name="isAuthenticated">Whether the user is authenticated</param>
    /// <returns>Dictionary of auth-related links</returns>
    Dictionary<string, LinkDto> GenerateAuthLinks(bool isAuthenticated = false);
}

/// <summary>
/// Implementation of HATEOAS link generation service.
/// Creates hypermedia links based on application context and user permissions.
/// </summary>
public class LinkGeneratorService : ILinkGenerator
{
    private readonly LinkGenerator _linkGenerator;
    private readonly IHttpContextAccessor _httpContextAccessor;

    /// <summary>
    /// Initializes a new instance of the LinkGeneratorService.
    /// </summary>
    /// <param name="linkGenerator">ASP.NET Core link generator for URL generation</param>
    /// <param name="httpContextAccessor">HTTP context accessor for current request context</param>
    public LinkGeneratorService(LinkGenerator linkGenerator, IHttpContextAccessor httpContextAccessor)
    {
        _linkGenerator = linkGenerator ?? throw new ArgumentNullException(nameof(linkGenerator));
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    /// <inheritdoc />
    public LinkDto GenerateLink(string action, string controller, object? values = null, 
        string rel = "self", string method = "GET", string? title = null)
    {
        var httpContext = _httpContextAccessor.HttpContext 
            ?? throw new InvalidOperationException("HttpContext not available");

        var url = _linkGenerator.GetUriByAction(httpContext, action, controller, values)
            ?? throw new InvalidOperationException($"Could not generate URL for action '{action}' in controller '{controller}'");

        return new LinkDto
        {
            Href = url,
            Rel = rel,
            Method = method.ToUpperInvariant(),
            Title = title,
            Type = method.ToUpperInvariant() switch
            {
                "GET" => "application/json",
                "PATCH" => "application/json-patch+json",
                _ => "application/json"
            }
        };
    }

    /// <inheritdoc />
    public Dictionary<string, LinkDto> GenerateUserLinks(Guid userId, string? currentUserId = null, bool isAdmin = false)
    {
        var links = new Dictionary<string, LinkDto>
        {
            ["self"] = GenerateLink("GetUser", "Users", new { id = userId, version = "1.0" }, "self", "GET", "Get user details")
        };

        // Add edit link if user can modify this resource
        if (currentUserId == userId.ToString() || isAdmin)
        {
            links["edit"] = GenerateLink("UpdateUser", "Users", new { id = userId, version = "1.0" }, "edit", "PUT", "Update user profile");
            links["patch"] = GenerateLink("PatchUser", "Users", new { id = userId, version = "1.0" }, "patch", "PATCH", "Partially update user profile");
            links["change-email"] = GenerateLink("ChangeEmail", "Users", new { id = userId, version = "1.0" }, "change-email", "PUT", "Change email address");
        }

        // Add admin-only links
        if (isAdmin)
        {
            links["deactivate"] = GenerateLink("DeactivateUser", "Users", new { id = userId, version = "1.0" }, "deactivate", "POST", "Deactivate user account");
            links["delete"] = GenerateLink("DeleteUser", "Users", new { id = userId, version = "1.0" }, "delete", "DELETE", "Permanently delete user");
        }

        // Add collection link
        links["users"] = GenerateLink("GetUsers", "Users", new { version = "1.0" }, "users", "GET", "Get all users");

        return links;
    }

    /// <inheritdoc />
    public Dictionary<string, LinkDto> GeneratePaginationLinks(string controller, string action, 
        int currentPage, int totalPages, int pageSize, object? additionalRouteValues = null)
    {
        var links = new Dictionary<string, LinkDto>();

        // Build route values
        var routeValues = new RouteValueDictionary(additionalRouteValues ?? new { })
        {
            ["version"] = "1.0",
            ["pageSize"] = pageSize
        };

        // Self link
        routeValues["page"] = currentPage;
        links["self"] = GenerateLink(action, controller, routeValues, "self", "GET", $"Current page ({currentPage})");

        // First page link
        routeValues["page"] = 1;
        links["first"] = GenerateLink(action, controller, routeValues, "first", "GET", "First page");

        // Last page link
        routeValues["page"] = totalPages;
        links["last"] = GenerateLink(action, controller, routeValues, "last", "GET", "Last page");

        // Previous page link
        if (currentPage > 1)
        {
            routeValues["page"] = currentPage - 1;
            links["prev"] = GenerateLink(action, controller, routeValues, "prev", "GET", "Previous page");
        }

        // Next page link
        if (currentPage < totalPages)
        {
            routeValues["page"] = currentPage + 1;
            links["next"] = GenerateLink(action, controller, routeValues, "next", "GET", "Next page");
        }

        return links;
    }

    /// <inheritdoc />
    public Dictionary<string, LinkDto> GenerateAuthLinks(bool isAuthenticated = false)
    {
        var links = new Dictionary<string, LinkDto>();

        if (isAuthenticated)
        {
            links["profile"] = GenerateLink("GetCurrentUser", "Auth", new { version = "1.0" }, "profile", "GET", "Get current user profile");
            links["logout"] = GenerateLink("Logout", "Auth", new { version = "1.0" }, "logout", "POST", "Logout from current session");
            links["logout-all"] = GenerateLink("LogoutFromAllDevices", "Auth", new { version = "1.0" }, "logout-all", "POST", "Logout from all devices");
            links["change-password"] = GenerateLink("ChangePassword", "Auth", new { version = "1.0" }, "change-password", "POST", "Change password");
        }
        else
        {
            links["login"] = GenerateLink("Login", "Auth", new { version = "1.0" }, "login", "POST", "Login to get access token");
            links["register"] = GenerateLink("Register", "Auth", new { version = "1.0" }, "register", "POST", "Register a new account");
        }

        links["refresh"] = GenerateLink("RefreshToken", "Auth", new { version = "1.0" }, "refresh", "POST", "Refresh access token");

        return links;
    }
}