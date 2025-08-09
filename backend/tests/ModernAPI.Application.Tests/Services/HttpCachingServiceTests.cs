using FluentAssertions;
using ModernAPI.Application.Services;
using Moq;
using Xunit;

namespace ModernAPI.Application.Tests.Services;

/// <summary>
/// Unit tests for the HttpCachingService class.
/// Tests Cache-Control header generation and conditional request handling using abstracted interfaces.
/// </summary>
public class HttpCachingServiceTests
{
    private readonly IHttpCachingService _cachingService;
    private readonly Mock<IHttpRequestHeaders> _mockRequestHeaders;
    private readonly Mock<IHttpResponseHeaders> _mockResponseHeaders;

    public HttpCachingServiceTests()
    {
        _cachingService = new HttpCachingService();
        _mockRequestHeaders = new Mock<IHttpRequestHeaders>();
        _mockResponseHeaders = new Mock<IHttpResponseHeaders>();
    }

    [Fact]
    public void SetUserResourceCacheHeaders_ForCurrentUser_ShouldSetPrivateCacheWithLongerTTL()
    {
        // Arrange
        var isCurrentUser = true;
        var expectedMaxAge = _cachingService.GetCacheDuration(CacheResourceType.UserResourceOwner);

        // Act
        _cachingService.SetUserResourceCacheHeaders(_mockResponseHeaders.Object, isCurrentUser);

        // Assert
        _mockResponseHeaders.VerifySet(h => h.CacheControl = $"private, max-age={expectedMaxAge}, must-revalidate", Times.Once);
        _mockResponseHeaders.VerifySet(h => h.Vary = "Authorization", Times.Once);
    }

    [Fact]
    public void SetUserResourceCacheHeaders_ForOtherUser_ShouldSetPrivateCacheWithShorterTTL()
    {
        // Arrange
        var isCurrentUser = false;
        var expectedMaxAge = _cachingService.GetCacheDuration(CacheResourceType.UserResourceOther);

        // Act
        _cachingService.SetUserResourceCacheHeaders(_mockResponseHeaders.Object, isCurrentUser);

        // Assert
        _mockResponseHeaders.VerifySet(h => h.CacheControl = $"private, max-age={expectedMaxAge}, must-revalidate", Times.Once);
        _mockResponseHeaders.VerifySet(h => h.Vary = "Authorization", Times.Once);
    }

    [Fact]
    public void SetUserResourceCacheHeaders_WithCustomMaxAge_ShouldUseProvidedValue()
    {
        // Arrange
        var customMaxAge = 600; // 10 minutes
        var isCurrentUser = true;

        // Act
        _cachingService.SetUserResourceCacheHeaders(_mockResponseHeaders.Object, isCurrentUser, customMaxAge);

        // Assert
        _mockResponseHeaders.VerifySet(h => h.CacheControl = $"private, max-age={customMaxAge}, must-revalidate", Times.Once);
    }

    [Fact]
    public void SetUserCollectionCacheHeaders_ShouldSetPrivateCacheWithCollectionTTL()
    {
        // Arrange
        var expectedMaxAge = _cachingService.GetCacheDuration(CacheResourceType.UserCollection);

        // Act
        _cachingService.SetUserCollectionCacheHeaders(_mockResponseHeaders.Object);

        // Assert
        _mockResponseHeaders.VerifySet(h => h.CacheControl = $"private, max-age={expectedMaxAge}, must-revalidate", Times.Once);
        _mockResponseHeaders.VerifySet(h => h.Vary = "Authorization", Times.Once);
    }

    [Fact]
    public void SetSearchResultsCacheHeaders_ShouldSetPrivateCacheWithShortTTL()
    {
        // Arrange
        var expectedMaxAge = _cachingService.GetCacheDuration(CacheResourceType.SearchResults);

        // Act
        _cachingService.SetSearchResultsCacheHeaders(_mockResponseHeaders.Object);

        // Assert
        _mockResponseHeaders.VerifySet(h => h.CacheControl = $"private, max-age={expectedMaxAge}, must-revalidate", Times.Once);
        _mockResponseHeaders.VerifySet(h => h.Vary = "Authorization", Times.Once);
    }

    [Fact]
    public void SetAdminResourceCacheHeaders_ShouldSetPrivateCacheWithNoStore()
    {
        // Arrange
        var expectedMaxAge = _cachingService.GetCacheDuration(CacheResourceType.AdminResource);

        // Act
        _cachingService.SetAdminResourceCacheHeaders(_mockResponseHeaders.Object);

        // Assert
        _mockResponseHeaders.VerifySet(h => h.CacheControl = $"private, max-age={expectedMaxAge}, must-revalidate, no-store", Times.Once);
        _mockResponseHeaders.VerifySet(h => h.Vary = "Authorization", Times.Once);
    }

    [Fact]
    public void SetNoCacheHeaders_ShouldSetNoCacheHeaders()
    {
        // Act
        _cachingService.SetNoCacheHeaders(_mockResponseHeaders.Object);

        // Assert
        _mockResponseHeaders.VerifySet(h => h.CacheControl = "no-cache, no-store, must-revalidate", Times.Once);
        _mockResponseHeaders.VerifySet(h => h.Pragma = "no-cache", Times.Once);
        _mockResponseHeaders.VerifySet(h => h.Expires = "0", Times.Once);
    }

    [Fact]
    public void SetEntityHeaders_ShouldSetETagAndLastModified()
    {
        // Arrange
        var etag = "\"abc123\"";
        var lastModified = new DateTime(2023, 12, 25, 10, 30, 45, DateTimeKind.Utc);
        var expectedLastModified = lastModified.ToString("R");

        // Act
        _cachingService.SetEntityHeaders(_mockResponseHeaders.Object, etag, lastModified);

        // Assert
        _mockResponseHeaders.VerifySet(h => h.ETag = etag, Times.Once);
        _mockResponseHeaders.VerifySet(h => h.LastModified = expectedLastModified, Times.Once);
    }

    [Fact]
    public void SetEntityHeaders_WithoutLastModified_ShouldOnlySetETag()
    {
        // Arrange
        var etag = "\"abc123\"";

        // Act
        _cachingService.SetEntityHeaders(_mockResponseHeaders.Object, etag);

        // Assert
        _mockResponseHeaders.VerifySet(h => h.ETag = etag, Times.Once);
        _mockResponseHeaders.VerifySet(h => h.LastModified = It.IsAny<string>(), Times.Never);
    }

    [Fact]
    public void GetCacheDuration_ShouldReturnCorrectDurations()
    {
        // Act & Assert
        _cachingService.GetCacheDuration(CacheResourceType.UserResourceOwner).Should().Be(300);
        _cachingService.GetCacheDuration(CacheResourceType.UserResourceOther).Should().Be(180);
        _cachingService.GetCacheDuration(CacheResourceType.UserCollection).Should().Be(120);
        _cachingService.GetCacheDuration(CacheResourceType.SearchResults).Should().Be(60);
        _cachingService.GetCacheDuration(CacheResourceType.AdminResource).Should().Be(120);
        _cachingService.GetCacheDuration(CacheResourceType.NoCache).Should().Be(0);
    }

    [Fact]
    public void HandleConditionalGet_WithMatchingIfNoneMatch_ShouldReturn304()
    {
        // Arrange
        var currentETag = "\"abc123\"";
        var ifNoneMatch = new[] { currentETag };
        _mockRequestHeaders.Setup(h => h.IfNoneMatch).Returns(ifNoneMatch);

        // Act
        var result = _cachingService.HandleConditionalGet(_mockRequestHeaders.Object, _mockResponseHeaders.Object, currentETag);

        // Assert
        result.Should().NotBeNull();
        result!.StatusCode.Should().Be(304);
    }

    [Fact]
    public void HandleConditionalGet_WithNonMatchingIfNoneMatch_ShouldReturnNull()
    {
        // Arrange
        var currentETag = "\"abc123\"";
        var ifNoneMatch = new[] { "\"different\"" };
        _mockRequestHeaders.Setup(h => h.IfNoneMatch).Returns(ifNoneMatch);

        // Act
        var result = _cachingService.HandleConditionalGet(_mockRequestHeaders.Object, _mockResponseHeaders.Object, currentETag);

        // Assert
        result.Should().BeNull(); // Should proceed with normal response
    }

    [Fact]
    public void HandleConditionalGet_WithMatchingIfModifiedSince_ShouldReturn304()
    {
        // Arrange
        var lastModified = new DateTime(2023, 12, 25, 10, 30, 45, DateTimeKind.Utc);
        var ifModifiedSince = lastModified.ToString("R");
        var ifModifiedSinceValues = new[] { ifModifiedSince };
        var currentETag = "\"abc123\"";

        _mockRequestHeaders.Setup(h => h.IfNoneMatch).Returns(Array.Empty<string>());
        _mockRequestHeaders.Setup(h => h.IfModifiedSince).Returns(ifModifiedSinceValues);

        // Act
        var result = _cachingService.HandleConditionalGet(_mockRequestHeaders.Object, _mockResponseHeaders.Object, currentETag, lastModified);

        // Assert
        result.Should().NotBeNull();
        result!.StatusCode.Should().Be(304);
    }

    [Fact]
    public void HandleConditionalGet_WithNoConditionalHeaders_ShouldReturnNull()
    {
        // Arrange
        var currentETag = "\"abc123\"";
        _mockRequestHeaders.Setup(h => h.IfNoneMatch).Returns(Array.Empty<string>());
        _mockRequestHeaders.Setup(h => h.IfModifiedSince).Returns(Array.Empty<string>());

        // Act
        var result = _cachingService.HandleConditionalGet(_mockRequestHeaders.Object, _mockResponseHeaders.Object, currentETag);

        // Assert
        result.Should().BeNull(); // No conditional headers, proceed normally
    }

    [Fact]
    public void ValidateConditionalUpdate_WithMatchingIfMatch_ShouldReturnNull()
    {
        // Arrange
        var currentETag = "\"abc123\"";
        var ifMatch = new[] { currentETag };
        _mockRequestHeaders.Setup(h => h.IfMatch).Returns(ifMatch);

        // Act
        var result = _cachingService.ValidateConditionalUpdate(_mockRequestHeaders.Object, currentETag);

        // Assert
        result.Should().BeNull(); // ETags match, proceed with update
    }

    [Fact]
    public void ValidateConditionalUpdate_WithNonMatchingIfMatch_ShouldReturn412()
    {
        // Arrange
        var currentETag = "\"abc123\"";
        var ifMatch = new[] { "\"different\"" };
        _mockRequestHeaders.Setup(h => h.IfMatch).Returns(ifMatch);

        // Act
        var result = _cachingService.ValidateConditionalUpdate(_mockRequestHeaders.Object, currentETag);

        // Assert
        result.Should().NotBeNull();
        result!.StatusCode.Should().Be(412);
    }

    [Fact]
    public void ValidateConditionalUpdate_WithNoIfMatchHeader_ShouldReturnNull()
    {
        // Arrange
        var currentETag = "\"abc123\"";
        _mockRequestHeaders.Setup(h => h.IfMatch).Returns(Array.Empty<string>());

        // Act
        var result = _cachingService.ValidateConditionalUpdate(_mockRequestHeaders.Object, currentETag);

        // Assert
        result.Should().BeNull(); // No If-Match header, proceed with update
    }

    [Fact]
    public void ValidateConditionalUpdate_WithWildcardIfMatch_ShouldReturnNull()
    {
        // Arrange
        var currentETag = "\"abc123\"";
        var ifMatch = new[] { "*" };
        _mockRequestHeaders.Setup(h => h.IfMatch).Returns(ifMatch);

        // Act
        var result = _cachingService.ValidateConditionalUpdate(_mockRequestHeaders.Object, currentETag);

        // Assert
        result.Should().BeNull(); // Wildcard matches, proceed with update
    }
}