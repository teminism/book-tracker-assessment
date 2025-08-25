using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Models;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;

public class AuthService
{
    private readonly IConfiguration _configuration;
    private readonly List<User> _users = new();

    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
        // Add demo users that match the frontend expectations
        _users.Add(new User("user123", "testuser", "test@example.com", "Test User",
            BCrypt.Net.BCrypt.HashPassword("testpass"), null));
        _users.Add(new User("demo123", "demo", "demo@example.com", "Demo User",
            BCrypt.Net.BCrypt.HashPassword("demo123"), null));
        _users.Add(new User("admin123", "admin", "admin@example.com", "Admin User",
            BCrypt.Net.BCrypt.HashPassword("admin123"), null));
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = _users.FirstOrDefault(u => u.Username == request.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        var token = GenerateJwtToken(user);
        var userDto = new UserDto(user.Id, user.Username, user.DisplayName, user.Email, user.Avatar);

        return new LoginResponse(token, userDto);
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "your-super-secret-key-here-that-is-at-least-32-characters-long"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim("email", user.Email),
            new Claim("displayName", user.DisplayName)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "BookTracker",
            audience: _configuration["Jwt:Audience"] ?? "BookTrackerUsers",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
