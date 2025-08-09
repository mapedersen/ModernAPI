using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Application.DTOs;

/// <summary>
/// Data Transfer Object representing a user for API responses with HATEOAS links.
/// Provides hypermedia navigation based on user permissions and current context.
/// </summary>
/// <param name="Id">The unique identifier of the user</param>
/// <param name="Email">The user's email address</param>
/// <param name="DisplayName">The user's display name</param>
/// <param name="FirstName">The user's first name (optional)</param>
/// <param name="LastName">The user's last name (optional)</param>
/// <param name="IsActive">Whether the user account is active</param>
/// <param name="IsEmailVerified">Whether the user's email is verified</param>
/// <param name="CreatedAt">When the user account was created</param>
/// <param name="UpdatedAt">When the user account was last updated</param>
public record UserDto(
    Guid Id,
    string Email,
    string DisplayName,
    string? FirstName,
    string? LastName,
    bool IsActive,
    bool IsEmailVerified,
    DateTime CreatedAt,
    DateTime UpdatedAt
) : HateoasDto;

/// <summary>
/// Request DTO for creating a new user.
/// </summary>
/// <param name="Email">The user's email address</param>
/// <param name="DisplayName">The user's display name</param>
/// <param name="FirstName">The user's first name (optional)</param>
/// <param name="LastName">The user's last name (optional)</param>
public record CreateUserRequest(
    string Email,
    string DisplayName,
    string? FirstName = null,
    string? LastName = null
);

/// <summary>
/// Request DTO for updating a user's profile information.
/// </summary>
/// <param name="DisplayName">The new display name</param>
/// <param name="FirstName">The new first name (optional)</param>
/// <param name="LastName">The new last name (optional)</param>
public record UpdateUserProfileRequest(
    string DisplayName,
    string? FirstName = null,
    string? LastName = null
);

/// <summary>
/// DTO for partial updates using JSON Patch operations.
/// This class represents the target object that patch operations are applied to.
/// Only includes properties that are allowed to be patched for security.
/// </summary>
public class PatchUserProfileRequest
{
    /// <summary>
    /// The user's display name.
    /// </summary>
    public string? DisplayName { get; set; }
    
    /// <summary>
    /// The user's first name.
    /// </summary>
    public string? FirstName { get; set; }
    
    /// <summary>
    /// The user's last name.
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// Validates that the patch request contains valid data.
    /// </summary>
    /// <returns>True if valid, false otherwise</returns>
    public bool IsValid()
    {
        // DisplayName is required if being updated
        if (DisplayName != null && string.IsNullOrWhiteSpace(DisplayName))
            return false;

        // FirstName and LastName can be null or valid strings
        if (FirstName != null && FirstName.Length > 100)
            return false;
            
        if (LastName != null && LastName.Length > 100)
            return false;

        return true;
    }

    /// <summary>
    /// Converts the patch request to an UpdateUserProfileRequest for processing.
    /// Note: This assumes all properties have been properly set by patch operations.
    /// Null values indicate the property was removed/set to null by patch operations.
    /// </summary>
    /// <param name="currentUser">Current user data (not used - patch target already has correct values)</param>
    /// <returns>An UpdateUserProfileRequest</returns>
    public UpdateUserProfileRequest ToUpdateRequest(UserDto currentUser)
    {
        return new UpdateUserProfileRequest(
            DisplayName ?? currentUser.DisplayName, // DisplayName is required, fall back if null
            FirstName, // Use patched value directly (null if removed)
            LastName   // Use patched value directly (null if removed)
        );
    }
}

/// <summary>
/// Request DTO for changing a user's email address.
/// </summary>
/// <param name="NewEmail">The new email address</param>
public record ChangeUserEmailRequest(
    string NewEmail
);

/// <summary>
/// Response DTO for paginated user lists.
/// </summary>
/// <param name="Users">The list of users for the current page</param>
/// <param name="TotalCount">The total number of users across all pages</param>
/// <param name="PageNumber">The current page number (1-based)</param>
/// <param name="PageSize">The number of items per page</param>
/// <param name="TotalPages">The total number of pages</param>
/// <param name="HasNextPage">Whether there are more pages after this one</param>
/// <param name="HasPreviousPage">Whether there are pages before this one</param>
public record UserListDto(
    IReadOnlyList<UserDto> Users,
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages,
    bool HasNextPage,
    bool HasPreviousPage
)
{
    /// <summary>
    /// Creates a UserListDto from a list of users and pagination information.
    /// </summary>
    /// <param name="users">The users for the current page</param>
    /// <param name="totalCount">Total number of users</param>
    /// <param name="pageNumber">Current page number (1-based)</param>
    /// <param name="pageSize">Number of items per page</param>
    /// <returns>A new UserListDto with calculated pagination properties</returns>
    public static UserListDto Create(IReadOnlyList<UserDto> users, int totalCount, int pageNumber, int pageSize)
    {
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        var hasNextPage = pageNumber < totalPages;
        var hasPreviousPage = pageNumber > 1;

        return new UserListDto(
            users,
            totalCount,
            pageNumber,
            pageSize,
            totalPages,
            hasNextPage,
            hasPreviousPage
        );
    }
}

/// <summary>
/// Request DTO for user search operations.
/// </summary>
/// <param name="SearchTerm">The term to search for in user display names</param>
/// <param name="PageNumber">Page number for pagination (1-based)</param>
/// <param name="PageSize">Number of items per page</param>
/// <param name="IncludeInactive">Whether to include inactive users in results</param>
public record SearchUsersRequest(
    string SearchTerm,
    int PageNumber = 1,
    int PageSize = 20,
    bool IncludeInactive = false
);

/// <summary>
/// Request DTO for getting users with pagination.
/// </summary>
/// <param name="PageNumber">Page number for pagination (1-based)</param>
/// <param name="PageSize">Number of items per page</param>
/// <param name="IncludeInactive">Whether to include inactive users in results</param>
public record GetUsersRequest(
    int PageNumber = 1,
    int PageSize = 20,
    bool IncludeInactive = false
);

/// <summary>
/// Response DTO for user operations that includes success status and optional message with HATEOAS links.
/// </summary>
/// <param name="User">The user data</param>
/// <param name="Message">Optional success message</param>
public record UserResponse(
    UserDto User,
    string? Message = null
) : HateoasDto;

/// <summary>
/// Response DTO for operations that don't return user data but need to indicate success.
/// </summary>
/// <param name="Success">Whether the operation was successful</param>
/// <param name="Message">Success or informational message</param>
public record OperationResult(
    bool Success,
    string Message
)
{
    /// <summary>
    /// Creates a successful operation result.
    /// </summary>
    /// <param name="message">Success message</param>
    /// <returns>A successful OperationResult</returns>
    public static OperationResult CreateSuccess(string message) => new(true, message);

    /// <summary>
    /// Creates a failed operation result.
    /// </summary>
    /// <param name="message">Error message</param>
    /// <returns>A failed OperationResult</returns>
    public static OperationResult CreateFailure(string message) => new(false, message);
}