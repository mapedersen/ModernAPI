using ModernAPI.Application.DTOs;
using ModernAPI.Application.Common.Exceptions;

namespace ModernAPI.Application.Interfaces;

/// <summary>
/// Service interface for user-related operations.
/// Defines the contract for user management use cases.
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Creates a new user with the provided information.
    /// </summary>
    /// <param name="request">The user creation request containing user details</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The created user as a UserResponse</returns>
    /// <exception cref="ValidationException">Thrown when the request is invalid</exception>
    /// <exception cref="ConflictException">Thrown when a user with the same email already exists</exception>
    Task<UserResponse> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a user by their unique identifier.
    /// </summary>
    /// <param name="userId">The unique identifier of the user</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The user if found</returns>
    /// <exception cref="NotFoundException">Thrown when the user is not found</exception>
    Task<UserDto> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a user by their email address.
    /// </summary>
    /// <param name="email">The email address of the user</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The user if found</returns>
    /// <exception cref="NotFoundException">Thrown when the user is not found</exception>
    Task<UserDto> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a paginated list of users.
    /// </summary>
    /// <param name="request">The pagination and filtering request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>A paginated list of users</returns>
    /// <exception cref="ValidationException">Thrown when the request is invalid</exception>
    Task<UserListDto> GetUsersAsync(GetUsersRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches for users by display name.
    /// </summary>
    /// <param name="request">The search request containing search term and pagination</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>A paginated list of users matching the search criteria</returns>
    /// <exception cref="ValidationException">Thrown when the request is invalid</exception>
    Task<UserListDto> SearchUsersAsync(SearchUsersRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates a user's profile information.
    /// </summary>
    /// <param name="userId">The unique identifier of the user to update</param>
    /// <param name="request">The update request containing new profile information</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The updated user as a UserResponse</returns>
    /// <exception cref="NotFoundException">Thrown when the user is not found</exception>
    /// <exception cref="ValidationException">Thrown when the request is invalid</exception>
    Task<UserResponse> UpdateUserProfileAsync(Guid userId, UpdateUserProfileRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Changes a user's email address.
    /// This will require re-verification of the new email.
    /// </summary>
    /// <param name="userId">The unique identifier of the user</param>
    /// <param name="request">The email change request containing the new email</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The updated user as a UserResponse</returns>
    /// <exception cref="NotFoundException">Thrown when the user is not found</exception>
    /// <exception cref="ValidationException">Thrown when the request is invalid</exception>
    /// <exception cref="ConflictException">Thrown when the new email is already in use</exception>
    Task<UserResponse> ChangeUserEmailAsync(Guid userId, ChangeUserEmailRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Verifies a user's email address.
    /// </summary>
    /// <param name="userId">The unique identifier of the user</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Operation result indicating success</returns>
    /// <exception cref="NotFoundException">Thrown when the user is not found</exception>
    Task<OperationResult> VerifyUserEmailAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deactivates a user account.
    /// </summary>
    /// <param name="userId">The unique identifier of the user to deactivate</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Operation result indicating success</returns>
    /// <exception cref="NotFoundException">Thrown when the user is not found</exception>
    Task<OperationResult> DeactivateUserAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Reactivates a user account.
    /// </summary>
    /// <param name="userId">The unique identifier of the user to reactivate</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Operation result indicating success</returns>
    /// <exception cref="NotFoundException">Thrown when the user is not found</exception>
    Task<OperationResult> ReactivateUserAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the total count of users in the system.
    /// </summary>
    /// <param name="includeInactive">Whether to include inactive users in the count</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The total number of users</returns>
    Task<int> GetUserCountAsync(bool includeInactive = false, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a user exists with the specified email address.
    /// </summary>
    /// <param name="email">The email address to check</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if a user exists with that email, false otherwise</returns>
    Task<bool> UserExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
}