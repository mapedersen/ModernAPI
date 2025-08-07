using AutoMapper;
using ModernAPI.Application.DTOs;
using ModernAPI.Domain.Entities;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Application.Mappings;

/// <summary>
/// AutoMapper profile for mapping between User domain objects and DTOs.
/// Handles the conversion between rich domain models and simple DTOs for API communication.
/// </summary>
public class UserMappingProfile : Profile
{
    /// <summary>
    /// Configures mapping rules for User-related objects.
    /// </summary>
    public UserMappingProfile()
    {
        CreateUserMappings();
        CreateValueObjectMappings();
    }

    /// <summary>
    /// Creates mappings between User entity and User DTOs.
    /// </summary>
    private void CreateUserMappings()
    {
        // User entity to UserDto
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.DisplayName))
            .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
            .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
            .ForMember(dest => dest.IsEmailVerified, opt => opt.MapFrom(src => src.IsEmailVerified))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt));

        // CreateUserRequest to User entity construction parameters
        // Note: We don't map directly to User because User constructor handles business logic
        CreateMap<CreateUserRequest, Email>()
            .ConstructUsing(src => new Email(src.Email));

        // For response wrapping
        CreateMap<User, UserResponse>()
            .ForMember(dest => dest.User, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.Message, opt => opt.Ignore());

        // Collection mappings
        CreateMap<IReadOnlyList<User>, IReadOnlyList<UserDto>>();
    }

    /// <summary>
    /// Creates mappings for value objects to primitive types and vice versa.
    /// </summary>
    private void CreateValueObjectMappings()
    {
        // Email value object mappings (still used in domain logic)
        CreateMap<Email, string>()
            .ConstructUsing(src => src.Value);

        CreateMap<string, Email>()
            .ConstructUsing(src => new Email(src));
    }
}

/// <summary>
/// Extension methods for common mapping operations to reduce boilerplate code.
/// </summary>
public static class MappingExtensions
{
    /// <summary>
    /// Maps a collection of User entities to UserDto collection with null checking.
    /// </summary>
    /// <param name="mapper">The AutoMapper instance</param>
    /// <param name="users">Collection of User entities</param>
    /// <returns>Collection of UserDto objects</returns>
    public static IReadOnlyList<UserDto> MapToUserDtos(this IMapper mapper, IReadOnlyList<User> users)
    {
        if (users is null || users.Count == 0)
            return Array.Empty<UserDto>();

        return users.Select(mapper.Map<UserDto>).ToList().AsReadOnly();
    }

    /// <summary>
    /// Maps a User entity to UserResponse with an optional message.
    /// </summary>
    /// <param name="mapper">The AutoMapper instance</param>
    /// <param name="user">The User entity</param>
    /// <param name="message">Optional success message</param>
    /// <returns>UserResponse DTO</returns>
    public static UserResponse MapToUserResponse(this IMapper mapper, User user, string? message = null)
    {
        var userDto = mapper.Map<UserDto>(user);
        return new UserResponse(userDto, message);
    }

    /// <summary>
    /// Creates a paginated UserListDto from users and pagination information.
    /// </summary>
    /// <param name="mapper">The AutoMapper instance</param>
    /// <param name="users">Collection of User entities for current page</param>
    /// <param name="totalCount">Total number of users across all pages</param>
    /// <param name="pageNumber">Current page number (1-based)</param>
    /// <param name="pageSize">Number of items per page</param>
    /// <returns>UserListDto with pagination information</returns>
    public static UserListDto MapToUserListDto(
        this IMapper mapper, 
        IReadOnlyList<User> users, 
        int totalCount, 
        int pageNumber, 
        int pageSize)
    {
        var userDtos = mapper.MapToUserDtos(users);
        return UserListDto.Create(userDtos, totalCount, pageNumber, pageSize);
    }
}