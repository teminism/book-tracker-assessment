namespace backend.Models;

public record User(
    string Id,
    string Username,
    string Email,
    string DisplayName,
    string PasswordHash,
    string? Avatar
);

public record UserDto(
    string Id,
    string Username,
    string DisplayName,
    string Email,
    string? Avatar
);

public record LoginRequest(
    string Username,
    string Password
);

public record LoginResponse(
    string Token,
    UserDto User
);
