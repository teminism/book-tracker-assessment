using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace backend.Endpoints;

public static class BooksEndpoints
{
    public static void MapBooksEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/books")
            .WithTags("Books")
            .RequireAuthorization();

        group.MapGet("/", async (IBookRepository repository, HttpContext context,
            int page = 1, int pageSize = 10,
            string? search = null, string sortBy = "title") =>
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "demo123";
            Console.WriteLine($"🔍 Backend: GetBooks called with userId: {userId}");
            var books = await repository.GetAllAsync(userId, page, pageSize, search, sortBy);
            var totalCount = await repository.GetTotalCountAsync(userId, search);
            Console.WriteLine($"🔍 Backend: GetBooks returning {books.Count()} books, totalCount: {totalCount}");

            return Results.Ok(new { books, totalCount, page, pageSize });
        })
        .WithName("GetBooks")
        .WithOpenApi();

        group.MapGet("/{id}", async (string id, IBookRepository repository, HttpContext context) =>
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "demo123";
            var book = await repository.GetByIdAsync(id, userId);
            if (book == null)
                return Results.NotFound();

            return Results.Ok(book);
        })
        .WithName("GetBook")
        .WithOpenApi();

        group.MapPost("/", async (AddBookRequest request, IBookRepository repository,
            HttpContext context) =>
        {
            try
            {
                var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "demo123";
                Console.WriteLine($"🔍 Backend: AddBook called with userId: {userId}");
                var book = new Book(
                    Id: "", // Will be set by repository
                    Title: request.Title,
                    Author: request.Author,
                    Isbn: request.Isbn,
                    Rating: request.Rating,
                    Comments: request.Comments,
                    HasNote: !string.IsNullOrEmpty(request.Comments),
                    CoverImageUrls: request.CoverImageUrls ?? new List<string>(),
                    UserId: userId,
                    CreatedAt: DateTime.UtcNow,
                    UpdatedAt: DateTime.UtcNow
                );

                var addedBook = await repository.AddAsync(book);
                Console.WriteLine($"🔍 Backend: Book added with ID: {addedBook.Id}, UserId: {addedBook.UserId}");
                return Results.CreatedAtRoute("GetBook", new { id = addedBook.Id }, addedBook);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Internal server error: {ex.Message}");
            }
        })
        .WithName("AddBook")
        .WithOpenApi();

        group.MapPut("/{id}", async (string id, UpdateBookRequest request, IBookRepository repository,
            HttpContext context) =>
        {
            try
            {
                var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "demo123";
                var existingBook = await repository.GetByIdAsync(id, userId);
                if (existingBook == null)
                    return Results.NotFound();

                var updatedBook = existingBook with
                {
                    Title = request.Title,
                    Author = request.Author,
                    Isbn = request.Isbn,
                    Rating = request.Rating,
                    Comments = request.Comments,
                    HasNote = !string.IsNullOrEmpty(request.Comments),
                    CoverImageUrls = request.CoverImageUrls ?? existingBook.CoverImageUrls,
                    UpdatedAt = DateTime.UtcNow
                };

                var result = await repository.UpdateAsync(updatedBook);
                if (result == null)
                    return Results.NotFound();

                return Results.Ok(result);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Internal server error: {ex.Message}");
            }
        })
        .WithName("UpdateBook")
        .WithOpenApi();

        group.MapDelete("/{id}", async (string id, IBookRepository repository, HttpContext context) =>
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "demo123";
            var deleted = await repository.DeleteAsync(id, userId);

            if (!deleted)
                return Results.NotFound();

            return Results.NoContent();
        })
        .WithName("DeleteBook")
        .WithOpenApi();
    }
}
