using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace BackendTests;

public class BooksApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public BooksApiTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetBooks_WithValidToken_ReturnsBooksList()
    {
        // Arrange
        var token = GenerateTestToken("demo123");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/books");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var booksResponse = await response.Content.ReadFromJsonAsync<GetBooksResponse>();
        Assert.NotNull(booksResponse);
        Assert.NotNull(booksResponse.Books);
        Assert.True(booksResponse.TotalCount >= 0);
    }

    [Fact]
    public async Task AddBook_WithValidData_ReturnsCreatedBook()
    {
        // Arrange
        var token = GenerateTestToken("demo123");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var newBook = new AddBookRequest(
            Title: "Test Book for API",
            Author: "Test Author",
            Isbn: "978-1234567890",
            Rating: 4,
            Comments: "This is a test book added via API",
            CoverImageUrls: new List<string> { "https://example.com/cover.jpg" }
        );

        var jsonContent = JsonSerializer.Serialize(newBook);
        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/books", content);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var createdBook = await response.Content.ReadFromJsonAsync<Book>();
        Assert.NotNull(createdBook);
        Assert.Equal(newBook.Title, createdBook.Title);
        Assert.Equal(newBook.Author, createdBook.Author);
        Assert.Equal(newBook.Isbn, createdBook.Isbn);
        Assert.Equal(newBook.Rating, createdBook.Rating);
        Assert.Equal(newBook.Comments, createdBook.Comments);
        Assert.NotNull(createdBook.Id);
        Assert.NotEmpty(createdBook.Id);
    }

    private string GenerateTestToken(string userId)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, "testuser"),
            new Claim("email", "test@example.com"),
            new Claim("displayName", "Test User")
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your-super-secret-key-here-that-is-at-least-32-characters-long"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
            issuer: "BookTracker",
            audience: "BookTrackerUsers",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds
        );

        return new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(token);
    }
}

// Response model for GetBooks endpoint
public class GetBooksResponse
{
    public List<Book> Books { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
