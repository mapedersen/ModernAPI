using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using ModernAPI.Application.Common.Exceptions;
using ModernAPI.Application.DTOs;
using ModernAPI.Application.Interfaces;
using ModernAPI.Application.Mappings;
using ModernAPI.Domain.Entities;
using ModernAPI.Domain.Interfaces;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Application.Services;

/// <summary>
/// Service for managing user-related operations.
/// Orchestrates domain objects and coordinates with infrastructure to fulfill use cases.
/// </summary>
public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<UserService> _logger;

    /// <summary>
    /// Initializes a new instance of the UserService.
    /// </summary>
    /// <param name="unitOfWork">Unit of work for data access coordination</param>
    /// <param name="mapper">AutoMapper for object mapping</param>
    /// <param name="logger">Logger for service operations</param>
    public UserService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<UserService> logger)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public async Task<UserResponse> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating new user with email: {Email}", request.Email);

        // Check if user already exists
        var email = new Email(request.Email);
        if (await _unitOfWork.Users.ExistsByEmailAsync(email, cancellationToken))
        {
            _logger.LogWarning("Attempted to create user with existing email: {Email}", request.Email);
            throw new ConflictException("User", request.Email, "A user with this email address already exists");
        }

        // Create domain object (business logic is in the domain)
        var user = new User(email, request.DisplayName, request.FirstName, request.LastName);

        // Persist the user
        await _unitOfWork.Users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Successfully created user {UserId} with email {Email}", user.Id, request.Email);

        return _mapper.MapToUserResponse(user, "User created successfully");
    }

    /// <inheritdoc />
    public async Task<UserDto> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Retrieving user by ID: {UserId}", userId);

        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);

        if (user is null)
        {
            _logger.LogWarning("User not found with ID: {UserId}", userId);
            throw new NotFoundException("User", userId.ToString());
        }

        return _mapper.Map<UserDto>(user);
    }

    /// <inheritdoc />
    public async Task<UserDto> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Retrieving user by email: {Email}", email);

        var emailValue = new Email(email);
        var user = await _unitOfWork.Users.GetByEmailAsync(emailValue, cancellationToken);

        if (user is null)
        {
            _logger.LogWarning("User not found with email: {Email}", email);
            throw new NotFoundException("User", email);
        }

        return _mapper.Map<UserDto>(user);
    }

    /// <inheritdoc />
    public async Task<UserListDto> GetUsersAsync(GetUsersRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Retrieving users - Page: {PageNumber}, Size: {PageSize}, IncludeInactive: {IncludeInactive}",
            request.PageNumber, request.PageSize, request.IncludeInactive);

        var skip = (request.PageNumber - 1) * request.PageSize;

        // Get users for the current page
        var users = await _unitOfWork.Users.GetUsersPagedAsync(skip, request.PageSize, cancellationToken);

        // Get total count for pagination
        var totalCount = request.IncludeInactive 
            ? await _unitOfWork.Users.GetTotalCountAsync(cancellationToken)
            : await _unitOfWork.Users.GetActiveCountAsync(cancellationToken);

        return _mapper.MapToUserListDto(users, totalCount, request.PageNumber, request.PageSize);
    }

    /// <inheritdoc />
    public async Task<UserListDto> SearchUsersAsync(SearchUsersRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogDebug("Searching users with term: {SearchTerm}", request.SearchTerm);

        var users = await _unitOfWork.Users.SearchByDisplayNameAsync(request.SearchTerm, cancellationToken);

        // For simplicity, we're returning all results. In a real application, you'd implement pagination for search results too
        var userList = users.ToList().AsReadOnly();
        return _mapper.MapToUserListDto(userList, userList.Count, 1, userList.Count);
    }

    /// <inheritdoc />
    public async Task<UserResponse> UpdateUserProfileAsync(Guid userId, UpdateUserProfileRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating profile for user: {UserId}", userId);

        var user = await GetUserEntityAsync(userId, cancellationToken);

        // Update display name if changed
        if (user.DisplayName != request.DisplayName)
        {
            user.UpdateDisplayName(request.DisplayName);
        }

        // Update names if changed
        if (user.FirstName != request.FirstName || user.LastName != request.LastName)
        {
            user.UpdateNames(request.FirstName, request.LastName);
        }

        await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Successfully updated profile for user: {UserId}", userId);

        return _mapper.MapToUserResponse(user, "Profile updated successfully");
    }

    /// <inheritdoc />
    public async Task<UserResponse> ChangeUserEmailAsync(Guid userId, ChangeUserEmailRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Changing email for user: {UserId} to {NewEmail}", userId, request.NewEmail);

        var user = await GetUserEntityAsync(userId, cancellationToken);
        var newEmail = new Email(request.NewEmail);

        // Check if the new email is already in use by another user
        var existingUser = await _unitOfWork.Users.GetByEmailAsync(newEmail, cancellationToken);
        if (existingUser is not null && !existingUser.Id.Equals(user.Id))
        {
            _logger.LogWarning("Attempted to change user {UserId} email to existing email: {NewEmail}", userId, request.NewEmail);
            throw new ConflictException("User", request.NewEmail, "A user with this email address already exists");
        }

        // Domain handles the business logic of email change
        user.ChangeEmail(newEmail);

        await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Successfully changed email for user: {UserId}", userId);

        return _mapper.MapToUserResponse(user, "Email changed successfully. Please verify your new email address.");
    }

    /// <inheritdoc />
    public async Task<OperationResult> VerifyUserEmailAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Verifying email for user: {UserId}", userId);

        var user = await GetUserEntityAsync(userId, cancellationToken);

        // Domain handles the business logic of email verification
        user.VerifyEmail();

        await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Successfully verified email for user: {UserId}", userId);

        return OperationResult.CreateSuccess("Email verified successfully");
    }

    /// <inheritdoc />
    public async Task<OperationResult> DeactivateUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deactivating user: {UserId}", userId);

        var user = await GetUserEntityAsync(userId, cancellationToken);

        // Domain handles the business logic of deactivation
        user.Deactivate();

        await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Successfully deactivated user: {UserId}", userId);

        return OperationResult.CreateSuccess("User account deactivated successfully");
    }

    /// <inheritdoc />
    public async Task<OperationResult> ReactivateUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Reactivating user: {UserId}", userId);

        var user = await GetUserEntityAsync(userId, cancellationToken);

        // Domain handles the business logic of reactivation
        user.Reactivate();

        await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Successfully reactivated user: {UserId}", userId);

        return OperationResult.CreateSuccess("User account reactivated successfully");
    }

    /// <inheritdoc />
    public async Task<int> GetUserCountAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        return includeInactive 
            ? await _unitOfWork.Users.GetTotalCountAsync(cancellationToken)
            : await _unitOfWork.Users.GetActiveCountAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> UserExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var emailValue = new Email(email);
        return await _unitOfWork.Users.ExistsByEmailAsync(emailValue, cancellationToken);
    }

    /// <summary>
    /// Helper method to retrieve a user entity and throw NotFoundException if not found.
    /// </summary>
    /// <param name="userId">The user ID to retrieve</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The user entity</returns>
    /// <exception cref="NotFoundException">Thrown when user is not found</exception>
    private async Task<User> GetUserEntityAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);

        if (user is null)
        {
            _logger.LogWarning("User not found with ID: {UserId}", userId);
            throw new NotFoundException("User", userId.ToString());
        }

        return user;
    }
}