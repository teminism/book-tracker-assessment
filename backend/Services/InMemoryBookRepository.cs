using backend.Models;

namespace backend.Services;

public class InMemoryBookRepository : IBookRepository
{
    private readonly List<Book> _books = new();

    public InMemoryBookRepository()
    {
        InitializeSampleBooks();
    }

    private void InitializeSampleBooks()
    {
        var sampleBooks = new[]
        {
            new Book(
                Id: Guid.NewGuid().ToString(),
                Title: "To Kill a Mockingbird",
                Author: "Harper Lee",
                Isbn: "978-0446310789",
                Rating: 5,
                Comments: "A powerful story about racial injustice and moral growth. Scout's perspective makes this classic accessible and moving.",
                HasNote: true,
                CoverImageUrls: new List<string> { "https://covers.openlibrary.org/b/id/12606566-L.jpg" },
                UserId: "demo123",
                CreatedAt: DateTime.UtcNow.AddDays(-30),
                UpdatedAt: DateTime.UtcNow.AddDays(-30)
            ),
            new Book(
                Id: Guid.NewGuid().ToString(),
                Title: "1984",
                Author: "George Orwell",
                Isbn: "978-0451524935",
                Rating: 4,
                Comments: "Disturbing but essential reading about surveillance and totalitarianism. Still relevant today.",
                HasNote: true,
                CoverImageUrls: new List<string> { "https://covers.openlibrary.org/b/id/14370404-L.jpg" },
                UserId: "demo123",
                CreatedAt: DateTime.UtcNow.AddDays(-25),
                UpdatedAt: DateTime.UtcNow.AddDays(-25)
            ),
            new Book(
                Id: Guid.NewGuid().ToString(),
                Title: "The Great Gatsby",
                Author: "F. Scott Fitzgerald",
                Isbn: "978-0743273565",
                Rating: 3,
                Comments: "Beautiful prose but the characters are hard to like. The American Dream theme is well explored.",
                HasNote: true,
                CoverImageUrls: new List<string> { "https://covers.openlibrary.org/b/id/12364437-L.jpg" },
                UserId: "demo123",
                CreatedAt: DateTime.UtcNow.AddDays(-20),
                UpdatedAt: DateTime.UtcNow.AddDays(-20)
            ),
            new Book(
                Id: Guid.NewGuid().ToString(),
                Title: "Pride and Prejudice",
                Author: "Jane Austen",
                Isbn: "978-0141439518",
                Rating: 5,
                Comments: "Timeless romance with sharp social commentary. Elizabeth Bennet is one of literature's greatest heroines.",
                HasNote: true,
                CoverImageUrls: new List<string> { "https://m.media-amazon.com/images/I/712P0p5cXIL._UF894,1000_QL80_.jpg" },
                UserId: "demo123",
                CreatedAt: DateTime.UtcNow.AddDays(-15),
                UpdatedAt: DateTime.UtcNow.AddDays(-15)
            ),
            new Book(
                Id: Guid.NewGuid().ToString(),
                Title: "The Catcher in the Rye",
                Author: "J.D. Salinger",
                Isbn: "978-0316769488",
                Rating: 2,
                Comments: "Holden Caulfield is annoying but the book captures teenage alienation perfectly.",
                HasNote: true,
                CoverImageUrls: new List<string> { "https://m.media-amazon.com/images/I/8125BDk3l9L.jpg" },
                UserId: "demo123",
                CreatedAt: DateTime.UtcNow.AddDays(-10),
                UpdatedAt: DateTime.UtcNow.AddDays(-10)
            ),
            new Book(
                Id: Guid.NewGuid().ToString(),
                Title: "Lord of the Flies",
                Author: "William Golding",
                Isbn: "978-0399501487",
                Rating: 4,
                Comments: "Dark exploration of human nature and civilization. The descent into savagery is compelling and disturbing.",
                HasNote: true,
                CoverImageUrls: new List<string> { "https://covers.openlibrary.org/b/id/14854809-L.jpg" },
                UserId: "demo123",
                CreatedAt: DateTime.UtcNow.AddDays(-5),
                UpdatedAt: DateTime.UtcNow.AddDays(-5)
            ),
            new Book(
                Id: Guid.NewGuid().ToString(),
                Title: "The Hobbit",
                Author: "J.R.R. Tolkien",
                Isbn: "978-0547928241",
                Rating: 0,
                Comments: "",
                HasNote: false,
                CoverImageUrls: new List<string> { "https://covers.openlibrary.org/b/id/14627222-L.jpg" },
                UserId: "demo123",
                CreatedAt: DateTime.UtcNow.AddDays(-1),
                UpdatedAt: DateTime.UtcNow.AddDays(-1)
            )
        };

        _books.AddRange(sampleBooks);
        Console.WriteLine($"🔍 Repository: Initialized with {_books.Count} sample books");
    }

    public Task<Book?> GetByIdAsync(string id, string userId)
    {
        var book = _books.FirstOrDefault(b => b.Id == id && b.UserId == userId);
        return Task.FromResult(book);
    }

    public Task<IEnumerable<Book>> GetAllAsync(string userId, int page = 1, int pageSize = 10, string? search = null, string sortBy = "title")
    {
        Console.WriteLine($"🔍 Repository: GetAllAsync called with userId: {userId}");
        Console.WriteLine($"🔍 Repository: Current _books count: {_books.Count}");
        Console.WriteLine($"🔍 Repository: All books in _books: {string.Join(", ", _books.Select(b => $"{b.Title}({b.UserId})"))}");
        var query = _books.Where(b => b.UserId == userId);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(b =>
                b.Title.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                b.Author.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                (b.Isbn != null && b.Isbn.Contains(search, StringComparison.OrdinalIgnoreCase))
            );
        }

        // Apply sorting
        query = sortBy.ToLower() switch
        {
            "title" => query.OrderBy(b => b.Title),
            "author" => query.OrderBy(b => b.Author),
            "rating" => query.OrderByDescending(b => b.Rating),
            "createdat" => query.OrderByDescending(b => b.CreatedAt),
            _ => query.OrderBy(b => b.Title)
        };

        // Apply pagination
        var books = query.Skip((page - 1) * pageSize).Take(pageSize);
        return Task.FromResult(books);
    }

    public Task<Book> AddAsync(Book book)
    {
        Console.WriteLine($"🔍 Repository: AddAsync called, current _books count: {_books.Count}");
        // Validate max 25 books limit
        if (_books.Count >= 25)
        {
            throw new InvalidOperationException("Maximum of 25 books allowed");
        }

        // Validate rating range (0 = no rating, 1-5 = valid ratings)
        if (book.Rating < 0 || book.Rating > 5)
        {
            throw new ArgumentException("Rating must be between 0 (no rating) and 5");
        }

        // Validate comments if rating is given (rating > 0)
        if (book.Rating > 0 && string.IsNullOrWhiteSpace(book.Comments))
        {
            throw new ArgumentException("Comments are required when rating is given");
        }

        // Validate comments don't contain "horrible"
        if (!string.IsNullOrEmpty(book.Comments) && book.Comments.Contains("horrible", StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Comments cannot contain the word 'horrible'");
        }

        // Validate string length limits
        if (book.Title.Length > 200)
        {
            throw new ArgumentException("Title cannot exceed 200 characters");
        }

        if (book.Author.Length > 100)
        {
            throw new ArgumentException("Author name cannot exceed 100 characters");
        }

        if (book.Comments?.Length > 1000)
        {
            throw new ArgumentException("Comments cannot exceed 1000 characters");
        }

        var newBook = book with { Id = Guid.NewGuid().ToString() };
        _books.Add(newBook);
        Console.WriteLine($"🔍 Repository: Book added, new _books count: {_books.Count}");
        Console.WriteLine($"🔍 Repository: All books in _books: {string.Join(", ", _books.Select(b => $"{b.Title}({b.UserId})"))}");
        return Task.FromResult(newBook);
    }

    public Task<Book?> UpdateAsync(Book book)
    {
        var existingBook = _books.FirstOrDefault(b => b.Id == book.Id && b.UserId == book.UserId);
        if (existingBook == null)
            return Task.FromResult<Book?>(null);

        // Validate rating range (0 = no rating, 1-5 = valid ratings)
        if (book.Rating < 0 || book.Rating > 5)
        {
            throw new ArgumentException("Rating must be between 0 (no rating) and 5");
        }

        // Validate comments if rating is given (rating > 0)
        if (book.Rating > 0 && string.IsNullOrWhiteSpace(book.Comments))
        {
            throw new ArgumentException("Comments are required when rating is given");
        }

        // Validate comments don't contain "horrible"
        if (!string.IsNullOrEmpty(book.Comments) && book.Comments.Contains("horrible", StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Book not added! Comments cannot contain the word 'horrible'");
        }

        // Validate string length limits
        if (book.Title.Length > 200)
        {
            throw new ArgumentException("Title cannot exceed 200 characters");
        }

        if (book.Author.Length > 100)
        {
            throw new ArgumentException("Author name cannot exceed 100 characters");
        }

        if (book.Comments?.Length > 1000)
        {
            throw new ArgumentException("Comments cannot exceed 1000 characters");
        }

        var index = _books.IndexOf(existingBook);
        var updatedBook = book with { UpdatedAt = DateTime.UtcNow };
        _books[index] = updatedBook;
        return Task.FromResult<Book?>(updatedBook);
    }

    public Task<bool> DeleteAsync(string id, string userId)
    {
        var book = _books.FirstOrDefault(b => b.Id == id && b.UserId == userId);
        if (book == null)
            return Task.FromResult(false);

        _books.Remove(book);
        return Task.FromResult(true);
    }

    public Task<int> GetTotalCountAsync(string userId, string? search = null)
    {
        var query = _books.Where(b => b.UserId == userId);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(b =>
                b.Title.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                b.Author.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                (b.Isbn != null && b.Isbn.Contains(search, StringComparison.OrdinalIgnoreCase))
            );
        }

        return Task.FromResult(query.Count());
    }
}
