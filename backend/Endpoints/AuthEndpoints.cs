using backend.Models;
using backend.Services;

namespace backend.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth")
            .WithTags("Authentication");

        group.MapPost("/login", async (LoginRequest request, AuthService authService) =>
        {
            var response = await authService.LoginAsync(request);
            if (response == null)
                return Results.Unauthorized();

            return Results.Ok(response);
        })
        .WithName("Login")
        .WithOpenApi();
    }
}
