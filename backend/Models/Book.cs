namespace backend.Models;

public record Book(
    string Id,
    string Title,
    string Author,
    string? Isbn,
    int Rating,
    string? Comments,
    bool HasNote,
    List<string> CoverImageUrls,
    string UserId,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record AddBookRequest(
    string Title,
    string Author,
    string? Isbn,
    int Rating,
    string? Comments,
    List<string>? CoverImageUrls
);

public record UpdateBookRequest(
    string Title,
    string Author,
    string? Isbn,
    int Rating,
    string? Comments,
    List<string>? CoverImageUrls
);
