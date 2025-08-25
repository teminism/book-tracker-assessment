import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AuthService } from '../services/authService'

export interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  rating: number
  comments?: string
  hasNote: boolean
  coverImageUrls: string[]
  userId: string
  createdAt: string
  updatedAt: string
}

const API_BASE = '/api/books';

export const useBooksStore = defineStore('books', () => {
  const books = ref<Book[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  
  // Analytics-specific state for ALL books
  const allBooks = ref<Book[]>([])
  const analyticsLoading = ref(false)

  const fetchBooks = async (page = 1, search?: string, sortBy = 'title') => {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.value.toString(),
        sortBy
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`${API_BASE}?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders()
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please login again.');
        }
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      console.log('🔍 BooksStore: fetchBooks received data:', data);
      console.log('🔍 BooksStore: fetchBooks - books array length:', data.books?.length || 0);
      books.value = data.books;
      totalCount.value = data.totalCount;
      currentPage.value = data.page;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addBook = async (input: Omit<Book, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    loading.value = true;
    error.value = null;

    try {
      console.log('🔍 BooksStore: addBook called with:', input);
      console.log('🔍 BooksStore: API_BASE:', API_BASE);
      
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders()
        },
        body: JSON.stringify(input)
      });

      console.log('🔍 BooksStore: Response status:', response.status);
      console.log('🔍 BooksStore: Response ok:', response.ok);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please login again.');
        }
        const errorData = await response.json();
        console.error('🔍 BooksStore: Error response:', errorData);
        throw new Error(errorData.error || 'Failed to add book');
      }

      const newBook = await response.json();
      console.log('🔍 BooksStore: New book received:', newBook);
      
      books.value.unshift(newBook);
      totalCount.value++;
      console.log('🔍 BooksStore: Book added to local state, total count:', totalCount.value);
      console.log('🔍 BooksStore: Current books:', books.value);
      
      return newBook;
    } catch (err) {
      console.error('🔍 BooksStore: Error in addBook:', err);
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBook = async (id: string, updates: { rating: number; comments?: string; coverImageUrls: string[] }) => {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    loading.value = true;
    error.value = null;

    try {
      // First get the current book to include all required fields
      const currentBook = books.value.find(b => b.id === id);
      if (!currentBook) {
        throw new Error('Book not found');
      }

      // Prepare the full update request
      const updateRequest = {
        title: currentBook.title,
        author: currentBook.author,
        isbn: currentBook.isbn,
        rating: updates.rating,
        comments: updates.comments,
        coverImageUrls: updates.coverImageUrls
      };

      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders()
        },
        body: JSON.stringify(updateRequest)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please login again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update book');
      }

      const updatedBook = await response.json();
      
      const index = books.value.findIndex(b => b.id === id);
      if (index !== -1) {
        books.value[index] = updatedBook;
      }
      return updatedBook;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const removeBook = async (id: string) => {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: AuthService.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication expired. Please login again.');
        }
        throw new Error('Failed to delete book');
      }

      books.value = books.value.filter(b => b.id !== id);
      totalCount.value--;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchAllBooks = async () => {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    analyticsLoading.value = true;
    error.value = null;

    try {
      let allFetchedBooks: Book[] = [];
      let currentPage = 1;
      const maxPageSize = 50; // Backend limit
      let hasMorePages = true;

      // Fetch books in batches until we get all of them
      while (hasMorePages) {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          pageSize: maxPageSize.toString(),
          sortBy: 'title'
        });

        const response = await fetch(`${API_BASE}?${params}`, {
          headers: {
            'Content-Type': 'application/json',
            ...AuthService.getAuthHeaders()
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication expired. Please login again.');
          }
          throw new Error('Failed to fetch books for analytics');
        }

        const data = await response.json();
        allFetchedBooks.push(...data.books);

        // Check if we have more pages
        const totalPages = Math.ceil(data.totalCount / maxPageSize);
        hasMorePages = currentPage < totalPages;
        currentPage++;

        // Safety break to avoid infinite loop
        if (currentPage > 100) {
          console.warn('Too many books to fetch');
          break;
        }
      }

      allBooks.value = allFetchedBooks;
      return allFetchedBooks;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      analyticsLoading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return { 
    books, 
    loading, 
    error, 
    totalCount, 
    currentPage, 
    pageSize,
    allBooks,
    analyticsLoading,
    fetchBooks, 
    fetchAllBooks,
    addBook, 
    updateBook, 
    removeBook, 
    clearError 
  };
});


