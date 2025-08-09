using FluentAssertions;
using ModernAPI.Application.DTOs;
using ModernAPI.Application.Services;
using Xunit;

namespace ModernAPI.Application.Tests.Services;

/// <summary>
/// Unit tests for the ETagService class.
/// Tests ETag generation, validation, and conditional request header parsing.
/// </summary>
public class ETagServiceTests
{
    private readonly IETagService _etagService;
    private readonly DateTime _testDateTime;
    private readonly Guid _testGuid;

    public ETagServiceTests()
    {
        _etagService = new ETagService();
        _testDateTime = new DateTime(2023, 12, 25, 10, 30, 45, DateTimeKind.Utc);
        _testGuid = new Guid("12345678-1234-1234-1234-123456789abc");
    }

    [Fact]
    public void GenerateETag_WithSameInputs_ShouldReturnSameETag()
    {
        // Act
        var etag1 = _etagService.GenerateETag(_testGuid, _testDateTime);
        var etag2 = _etagService.GenerateETag(_testGuid, _testDateTime);

        // Assert
        etag1.Should().Be(etag2);
    }

    [Fact]
    public void GenerateETag_WithDifferentIds_ShouldReturnDifferentETags()
    {
        // Arrange
        var guid1 = new Guid("12345678-1234-1234-1234-123456789abc");
        var guid2 = new Guid("87654321-4321-4321-4321-cba987654321");

        // Act
        var etag1 = _etagService.GenerateETag(guid1, _testDateTime);
        var etag2 = _etagService.GenerateETag(guid2, _testDateTime);

        // Assert
        etag1.Should().NotBe(etag2);
    }

    [Fact]
    public void GenerateETag_WithDifferentTimestamps_ShouldReturnDifferentETags()
    {
        // Arrange
        var time1 = new DateTime(2023, 12, 25, 10, 30, 45, DateTimeKind.Utc);
        var time2 = new DateTime(2023, 12, 25, 10, 30, 46, DateTimeKind.Utc); // 1 second later

        // Act
        var etag1 = _etagService.GenerateETag(_testGuid, time1);
        var etag2 = _etagService.GenerateETag(_testGuid, time2);

        // Assert
        etag1.Should().NotBe(etag2);
    }

    [Fact]
    public void GenerateETag_ShouldReturnQuotedString()
    {
        // Act
        var etag = _etagService.GenerateETag(_testGuid, _testDateTime);

        // Assert
        etag.Should().StartWith("\"").And.EndWith("\"");
        etag.Length.Should().BeGreaterThan(2); // More than just quotes
    }

    [Fact]
    public void GenerateETag_WithUserDto_ShouldUseIdAndUpdatedAt()
    {
        // Arrange
        var userDto = new UserDto(
            _testGuid,
            "test@example.com",
            "Test User",
            "Test",
            "User",
            true,
            true,
            DateTime.UtcNow,
            _testDateTime
        );

        // Act
        var etag1 = _etagService.GenerateETag(userDto);
        var etag2 = _etagService.GenerateETag(_testGuid, _testDateTime);

        // Assert
        etag1.Should().Be(etag2);
    }

    [Fact]
    public void GenerateCollectionETag_WithEmptyCollection_ShouldReturnConsistentETag()
    {
        // Arrange
        var emptyCollection = Array.Empty<(Guid Id, DateTime LastModified)>();

        // Act
        var etag1 = _etagService.GenerateCollectionETag(emptyCollection);
        var etag2 = _etagService.GenerateCollectionETag(emptyCollection);

        // Assert
        etag1.Should().Be(etag2);
        etag1.Should().StartWith("\"").And.EndWith("\"");
    }

    [Fact]
    public void GenerateCollectionETag_WithSameItems_ShouldReturnSameETag()
    {
        // Arrange
        var collection = new[]
        {
            (_testGuid, _testDateTime),
            (new Guid("87654321-4321-4321-4321-cba987654321"), _testDateTime.AddMinutes(1))
        };

        // Act
        var etag1 = _etagService.GenerateCollectionETag(collection);
        var etag2 = _etagService.GenerateCollectionETag(collection);

        // Assert
        etag1.Should().Be(etag2);
    }

    [Fact]
    public void GenerateCollectionETag_WithDifferentOrder_ShouldReturnSameETag()
    {
        // Arrange
        var guid1 = new Guid("12345678-1234-1234-1234-123456789abc");
        var guid2 = new Guid("87654321-4321-4321-4321-cba987654321");
        var time1 = _testDateTime;
        var time2 = _testDateTime.AddMinutes(1);

        var collection1 = new[] { (guid1, time1), (guid2, time2) };
        var collection2 = new[] { (guid2, time2), (guid1, time1) };

        // Act
        var etag1 = _etagService.GenerateCollectionETag(collection1);
        var etag2 = _etagService.GenerateCollectionETag(collection2);

        // Assert
        etag1.Should().Be(etag2); // Should be same because service sorts by ID
    }

    [Fact]
    public void GenerateCollectionETag_WithUserDtos_ShouldWork()
    {
        // Arrange
        var users = new[]
        {
            new UserDto(_testGuid, "test1@example.com", "User 1", "Test", "One", true, true, DateTime.UtcNow, _testDateTime),
            new UserDto(new Guid("87654321-4321-4321-4321-cba987654321"), "test2@example.com", "User 2", "Test", "Two", true, true, DateTime.UtcNow, _testDateTime.AddMinutes(1))
        };

        // Act
        var etag = _etagService.GenerateCollectionETag(users);

        // Assert
        etag.Should().StartWith("\"").And.EndWith("\"");
        etag.Length.Should().BeGreaterThan(2);
    }

    [Fact]
    public void ValidateETag_WithMatchingETag_ShouldReturnTrue()
    {
        // Arrange
        var currentETag = _etagService.GenerateETag(_testGuid, _testDateTime);

        // Act
        var isValid = _etagService.ValidateETag(currentETag, _testGuid, _testDateTime);

        // Assert
        isValid.Should().BeTrue();
    }

    [Fact]
    public void ValidateETag_WithNonMatchingETag_ShouldReturnFalse()
    {
        // Arrange
        var currentETag = _etagService.GenerateETag(_testGuid, _testDateTime);
        var differentTime = _testDateTime.AddSeconds(1);

        // Act
        var isValid = _etagService.ValidateETag(currentETag, _testGuid, differentTime);

        // Assert
        isValid.Should().BeFalse();
    }

    [Fact]
    public void ValidateETag_WithNullETag_ShouldReturnFalse()
    {
        // Act
        var isValid = _etagService.ValidateETag(null, _testGuid, _testDateTime);

        // Assert
        isValid.Should().BeFalse();
    }

    [Fact]
    public void ValidateETag_WithEmptyETag_ShouldReturnFalse()
    {
        // Act
        var isValid = _etagService.ValidateETag("", _testGuid, _testDateTime);

        // Assert
        isValid.Should().BeFalse();
    }

    [Theory]
    [InlineData("\"abc123\"", "abc123")]
    [InlineData("W/\"abc123\"", "abc123")]
    [InlineData("abc123", "abc123")]
    [InlineData("\"\"", "")]
    [InlineData("W/\"\"", "")]
    public void ParseETagHeader_WithVariousFormats_ShouldParseCorrectly(string input, string expected)
    {
        // Act
        var result = _etagService.ParseETagHeader(input);

        // Assert
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void ParseETagHeader_WithInvalidInput_ShouldReturnNull(string input)
    {
        // Act
        var result = _etagService.ParseETagHeader(input);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void ParseETagHeader_WithNullInput_ShouldReturnNull()
    {
        // Act
        var result = _etagService.ParseETagHeader(null);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void CheckIfNoneMatch_WithWildcard_ShouldReturnTrue()
    {
        // Arrange
        var currentETag = _etagService.GenerateETag(_testGuid, _testDateTime);

        // Act
        var result = _etagService.CheckIfNoneMatch("*", currentETag);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void CheckIfNoneMatch_WithMatchingETag_ShouldReturnTrue()
    {
        // Arrange
        var currentETag = _etagService.GenerateETag(_testGuid, _testDateTime);
        var parsedETag = _etagService.ParseETagHeader(currentETag);

        // Act
        var result = _etagService.CheckIfNoneMatch($"\"{parsedETag}\"", currentETag);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void CheckIfNoneMatch_WithNonMatchingETag_ShouldReturnFalse()
    {
        // Arrange
        var currentETag = _etagService.GenerateETag(_testGuid, _testDateTime);
        var differentETag = "\"different-etag\"";

        // Act
        var result = _etagService.CheckIfNoneMatch(differentETag, currentETag);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void CheckIfNoneMatch_WithMultipleETags_ShouldCheckAll()
    {
        // Arrange
        var currentETag = _etagService.GenerateETag(_testGuid, _testDateTime);
        var parsedETag = _etagService.ParseETagHeader(currentETag);
        var multipleETags = $"\"different1\", \"{parsedETag}\", \"different2\"";

        // Act
        var result = _etagService.CheckIfNoneMatch(multipleETags, currentETag);

        // Assert
        result.Should().BeTrue(); // Should find match in the list
    }

    [Fact]
    public void CheckIfNoneMatch_WithEmptyHeader_ShouldReturnFalse()
    {
        // Arrange
        var currentETag = _etagService.GenerateETag(_testGuid, _testDateTime);

        // Act
        var result = _etagService.CheckIfNoneMatch("", currentETag);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void CheckIfMatch_WithNoHeader_ShouldReturnTrue()
    {
        // Arrange
        var currentETag = _etagService.GenerateETag(_testGuid, _testDateTime);

        // Act
        var result = _etagService.CheckIfMatch(null, currentETag);

        // Assert
        result.Should().BeTrue(); // No If-Match header means proceed
    }

    [Fact]
    public void CheckIfMatch_WithWildcard_ShouldReturnTrue()
    {
        // Arrange
        var currentETag = _etagService.GenerateETag(_testGuid, _testDateTime);

        // Act
        var result = _etagService.CheckIfMatch("*", currentETag);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void CheckIfMatch_WithMatchingETag_ShouldReturnTrue()
    {
        // Arrange
        var currentETag = _etagService.GenerateETag(_testGuid, _testDateTime);
        var parsedETag = _etagService.ParseETagHeader(currentETag);

        // Act
        var result = _etagService.CheckIfMatch($"\"{parsedETag}\"", currentETag);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void CheckIfMatch_WithNonMatchingETag_ShouldReturnFalse()
    {
        // Arrange
        var currentETag = _etagService.GenerateETag(_testGuid, _testDateTime);
        var differentETag = "\"different-etag\"";

        // Act
        var result = _etagService.CheckIfMatch(differentETag, currentETag);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void CheckIfMatch_WithMultipleETags_ShouldCheckAll()
    {
        // Arrange
        var currentETag = _etagService.GenerateETag(_testGuid, _testDateTime);
        var parsedETag = _etagService.ParseETagHeader(currentETag);
        var multipleETags = $"\"different1\", \"{parsedETag}\", \"different2\"";

        // Act
        var result = _etagService.CheckIfMatch(multipleETags, currentETag);

        // Assert
        result.Should().BeTrue(); // Should find match in the list
    }

    [Fact]
    public void ValidateETag_WithUserDto_ShouldWork()
    {
        // Arrange
        var userDto = new UserDto(
            _testGuid,
            "test@example.com",
            "Test User",
            "Test",
            "User",
            true,
            true,
            DateTime.UtcNow,
            _testDateTime
        );
        var etag = _etagService.GenerateETag(userDto);

        // Act
        var isValid = _etagService.ValidateETag(etag, userDto);

        // Assert
        isValid.Should().BeTrue();
    }

    [Fact]
    public void ETag_ShouldBeConsistentAcrossTimezones()
    {
        // Arrange
        var utcTime = new DateTime(2023, 12, 25, 10, 30, 45, DateTimeKind.Utc);
        var localTime = utcTime.ToLocalTime();
        var unspecifiedTime = new DateTime(2023, 12, 25, 10, 30, 45, DateTimeKind.Unspecified);

        // Act
        var utcETag = _etagService.GenerateETag(_testGuid, utcTime);
        var localETag = _etagService.GenerateETag(_testGuid, localTime);
        var unspecifiedETag = _etagService.GenerateETag(_testGuid, unspecifiedTime);

        // Assert
        utcETag.Should().Be(localETag); // Should be same when converted to UTC
        // Unspecified time is treated as-is, so it may differ from UTC
    }
}