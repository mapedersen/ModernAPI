using FluentValidation;
using ModernAPI.Application.DTOs;
using ModernAPI.Domain.ValueObjects;

namespace ModernAPI.Application.Validators;

/// <summary>
/// Validator for CreateUserRequest DTOs.
/// Ensures all required fields are present and valid according to business rules.
/// </summary>
public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    /// <summary>
    /// Initializes validation rules for CreateUserRequest.
    /// </summary>
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email address is required")
            .EmailAddress()
            .WithMessage("Email address must be in a valid format")
            .MaximumLength(254) // RFC 5321 limit
            .WithMessage("Email address cannot exceed 254 characters")
            .Must(BeAValidEmail)
            .WithMessage("Email address is not valid according to business rules");

        RuleFor(x => x.DisplayName)
            .NotEmpty()
            .WithMessage("Display name is required")
            .Length(1, 100)
            .WithMessage("Display name must be between 1 and 100 characters")
            .Matches(@"^[a-zA-Z0-9\s\-_\.]+$")
            .WithMessage("Display name can only contain letters, numbers, spaces, hyphens, underscores, and periods");

        RuleFor(x => x.FirstName)
            .MaximumLength(50)
            .WithMessage("First name cannot exceed 50 characters")
            .Matches(@"^[a-zA-Z\s\-'\.]*$")
            .WithMessage("First name can only contain letters, spaces, hyphens, apostrophes, and periods")
            .When(x => !string.IsNullOrWhiteSpace(x.FirstName));

        RuleFor(x => x.LastName)
            .MaximumLength(50)
            .WithMessage("Last name cannot exceed 50 characters")
            .Matches(@"^[a-zA-Z\s\-'\.]*$")
            .WithMessage("Last name can only contain letters, spaces, hyphens, apostrophes, and periods")
            .When(x => !string.IsNullOrWhiteSpace(x.LastName));
    }

    /// <summary>
    /// Custom validation method that uses the domain's Email value object validation.
    /// This ensures consistency between API validation and domain validation.
    /// </summary>
    /// <param name="email">Email address to validate</param>
    /// <returns>True if valid, false otherwise</returns>
    private static bool BeAValidEmail(string email)
    {
        return Email.TryCreate(email, out _);
    }
}

/// <summary>
/// Validator for UpdateUserProfileRequest DTOs.
/// </summary>
public class UpdateUserProfileRequestValidator : AbstractValidator<UpdateUserProfileRequest>
{
    /// <summary>
    /// Initializes validation rules for UpdateUserProfileRequest.
    /// </summary>
    public UpdateUserProfileRequestValidator()
    {
        RuleFor(x => x.DisplayName)
            .NotEmpty()
            .WithMessage("Display name is required")
            .Length(1, 100)
            .WithMessage("Display name must be between 1 and 100 characters")
            .Matches(@"^[a-zA-Z0-9\s\-_\.]+$")
            .WithMessage("Display name can only contain letters, numbers, spaces, hyphens, underscores, and periods");

        RuleFor(x => x.FirstName)
            .MaximumLength(50)
            .WithMessage("First name cannot exceed 50 characters")
            .Matches(@"^[a-zA-Z\s\-'\.]*$")
            .WithMessage("First name can only contain letters, spaces, hyphens, apostrophes, and periods")
            .When(x => !string.IsNullOrWhiteSpace(x.FirstName));

        RuleFor(x => x.LastName)
            .MaximumLength(50)
            .WithMessage("Last name cannot exceed 50 characters")
            .Matches(@"^[a-zA-Z\s\-'\.]*$")
            .WithMessage("Last name can only contain letters, spaces, hyphens, apostrophes, and periods")
            .When(x => !string.IsNullOrWhiteSpace(x.LastName));
    }
}

/// <summary>
/// Validator for ChangeUserEmailRequest DTOs.
/// </summary>
public class ChangeUserEmailRequestValidator : AbstractValidator<ChangeUserEmailRequest>
{
    /// <summary>
    /// Initializes validation rules for ChangeUserEmailRequest.
    /// </summary>
    public ChangeUserEmailRequestValidator()
    {
        RuleFor(x => x.NewEmail)
            .NotEmpty()
            .WithMessage("New email address is required")
            .EmailAddress()
            .WithMessage("New email address must be in a valid format")
            .MaximumLength(254) // RFC 5321 limit
            .WithMessage("New email address cannot exceed 254 characters")
            .Must(BeAValidEmail)
            .WithMessage("New email address is not valid according to business rules");
    }

    /// <summary>
    /// Custom validation method that uses the domain's Email value object validation.
    /// </summary>
    /// <param name="email">Email address to validate</param>
    /// <returns>True if valid, false otherwise</returns>
    private static bool BeAValidEmail(string email)
    {
        return Email.TryCreate(email, out _);
    }
}

/// <summary>
/// Validator for SearchUsersRequest DTOs.
/// </summary>
public class SearchUsersRequestValidator : AbstractValidator<SearchUsersRequest>
{
    /// <summary>
    /// Initializes validation rules for SearchUsersRequest.
    /// </summary>
    public SearchUsersRequestValidator()
    {
        RuleFor(x => x.SearchTerm)
            .NotEmpty()
            .WithMessage("Search term is required")
            .MinimumLength(2)
            .WithMessage("Search term must be at least 2 characters long")
            .MaximumLength(100)
            .WithMessage("Search term cannot exceed 100 characters");

        RuleFor(x => x.PageNumber)
            .GreaterThan(0)
            .WithMessage("Page number must be greater than 0");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("Page size must be between 1 and 100");
    }
}

/// <summary>
/// Validator for GetUsersRequest DTOs.
/// </summary>
public class GetUsersRequestValidator : AbstractValidator<GetUsersRequest>
{
    /// <summary>
    /// Initializes validation rules for GetUsersRequest.
    /// </summary>
    public GetUsersRequestValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThan(0)
            .WithMessage("Page number must be greater than 0");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("Page size must be between 1 and 100");
    }
}