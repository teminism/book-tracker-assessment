using backend.Models;

namespace backend.Services;

public interface IBookRepository
{
    Task<Book?> GetByIdAsync(string id, string userId);
    Task<IEnumerable<Book>> GetAllAsync(string userId, int page = 1, int pageSize = 10, string? search = null, string sortBy = "title");
    Task<Book> AddAsync(Book book);
    Task<Book?> UpdateAsync(Book book);
    Task<bool> DeleteAsync(string id, string userId);
    Task<int> GetTotalCountAsync(string userId, string? search = null);
}
