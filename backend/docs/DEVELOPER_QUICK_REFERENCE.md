# Developer Quick Reference

## Adding New Endpoints

### 1. Add to Controller
```csharp
[HttpGet("{id:guid}")]
[ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
public async Task<ActionResult<UserDto>> GetUser(Guid id)
{
    var user = await _userService.GetUserByIdAsync(id);
    
    // Add caching
    var conditionalResult = HandleConditionalGet(_cachingService, _etagService, user);
    if (conditionalResult != null) return conditionalResult;
    
    SetEntityHeaders(_cachingService, _etagService, user);
    
    // Add HATEOAS links
    var userWithLinks = AddLinksToUser(user);
    return Ok(userWithLinks);
}
```

### 2. HATEOAS Links
```csharp
private UserDto AddLinksToUser(UserDto user)
{
    var links = _linkGenerator.GenerateUserLinks(user.Id, GetUserId(), HasRole("Admin"));
    user.AddLinks(links);
    return user;
}
```

### 3. Status Codes Reference
- **200** - Successful GET/PUT/PATCH
- **201** - Created (with Location header)
- **204** - Successful DELETE
- **304** - Not Modified (caching)
- **400** - Bad Request (malformed)
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **412** - Precondition Failed (ETag mismatch)
- **422** - Validation Failed

### 4. Common Patterns

#### Create Resource
```csharp
[HttpPost]
public async Task<ActionResult<UserResponse>> CreateUser(CreateUserRequest request)
{
    var result = await _userService.CreateUserAsync(request);
    return CreatedAtAction(nameof(GetUser), new { id = result.User.Id }, result);
}
```

#### Update with ETag Validation
```csharp
[HttpPut("{id:guid}")]
public async Task<ActionResult<UserResponse>> UpdateUser(Guid id, UpdateUserRequest request)
{
    var currentUser = await _userService.GetUserByIdAsync(id);
    
    // Validate conditional update
    var conditionalResult = ValidateConditionalUpdate(_cachingService, _etagService, currentUser);
    if (conditionalResult != null) return conditionalResult;
    
    var result = await _userService.UpdateUserAsync(id, request);
    Response.SetNoCache(_cachingService);
    return Ok(result);
}
```

#### PATCH Operations
```csharp
[HttpPatch("{id:guid}")]
[Consumes("application/json-patch+json")]
public async Task<ActionResult<UserResponse>> PatchUser(Guid id, JsonPatchDocument<PatchUserProfileRequest> patchDoc)
{
    var result = await _userService.PatchUserProfileAsync(id, patchDoc);
    return Ok(result);
}
```

## Testing Patterns

### Controller Tests
```csharp
[Fact]
public async Task GetUser_WithValidId_ReturnsUserWithLinks()
{
    // Arrange
    var userId = Guid.NewGuid();
    MockUserService.Setup(x => x.GetUserByIdAsync(userId)).ReturnsAsync(CreateTestUser());

    // Act  
    var result = await _controller.GetUser(userId);

    // Assert
    var okResult = Assert.IsType<OkObjectResult>(result.Result);
    var userDto = Assert.IsType<UserDto>(okResult.Value);
    Assert.True(userDto.HasLink("self"));
}
```