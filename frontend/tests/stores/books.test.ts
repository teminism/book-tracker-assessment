import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBooksStore } from '../../src/stores/books'

// Mock AuthService
vi.mock('../../src/services/authService', () => ({
  AuthService: {
    isAuthenticated: vi.fn(),
    getAuthHeaders: vi.fn()
  }
}))

// Mock fetch globally
global.fetch = vi.fn()

describe('Books Store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Default mock implementations
    const { AuthService } = await import('../../src/services/authService')
    vi.mocked(AuthService.isAuthenticated).mockReturnValue(true)
    vi.mocked(AuthService.getAuthHeaders).mockReturnValue({ 'Authorization': 'Bearer mock-token' })
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const store = useBooksStore()
      
      expect(store.books).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.totalCount).toBe(0)
      expect(store.currentPage).toBe(1)
      expect(store.pageSize).toBe(10)
      expect(store.allBooks).toEqual([])
      expect(store.analyticsLoading).toBe(false)
    })
  })

  describe('fetchBooks', () => {
    it('should fetch books successfully', async () => {
      const mockBooks = [
        { id: '1', title: 'Test Book', author: 'Test Author', rating: 4, hasNote: false, coverImageUrls: [], userId: 'user1', createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ]
      const mockResponse = {
        items: mockBooks,
        total: 1,
        page: 1
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const store = useBooksStore()
      await store.fetchBooks(1, 'test', 'title')

      expect(store.books).toEqual(mockBooks)
      expect(store.totalCount).toBe(1)
      expect(store.currentPage).toBe(1)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle fetch error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

      const store = useBooksStore()
      
      await expect(store.fetchBooks()).rejects.toThrow('Failed to fetch books')
      expect(store.error).toBe('Failed to fetch books')
      expect(store.loading).toBe(false)
    })

    it('should handle authentication error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401
      } as Response)

      const store = useBooksStore()
      
      await expect(store.fetchBooks()).rejects.toThrow('Authentication expired. Please login again.')
      expect(store.error).toBe('Authentication expired. Please login again.')
      expect(store.loading).toBe(false)
    })

    it('should throw error when not authenticated', async () => {
      const { AuthService } = await import('../../src/services/authService')
      vi.mocked(AuthService.isAuthenticated).mockReturnValue(false)

      const store = useBooksStore()
      
      await expect(store.fetchBooks()).rejects.toThrow('Authentication required')
    })
  })

  describe('addBook', () => {
    it('should add book successfully', async () => {
      const newBook = {
        title: 'New Book',
        author: 'New Author',
        rating: 5,
        hasNote: false,
        coverImageUrls: []
      }
      const mockResponse = {
        id: '2',
        ...newBook,
        userId: 'user1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const store = useBooksStore()
      store.books = [{ id: '1', title: 'Existing Book', author: 'Author', rating: 4, hasNote: false, coverImageUrls: [], userId: 'user1', createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
      store.totalCount = 1

      const result = await store.addBook(newBook)

      expect(result).toEqual(mockResponse)
      expect(store.books[0]).toEqual(mockResponse) // Should be added to the beginning
      expect(store.totalCount).toBe(2)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle add book error', async () => {
      const newBook = {
        title: 'New Book',
        author: 'New Author',
        rating: 5,
        hasNote: false,
        coverImageUrls: []
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid book data' })
      } as Response)

      const store = useBooksStore()
      
      await expect(store.addBook(newBook)).rejects.toThrow('Invalid book data')
      expect(store.error).toBe('Invalid book data')
      expect(store.loading).toBe(false)
    })
  })

  describe('updateBook', () => {
    it('should update book successfully', async () => {
      const updates = { rating: 5, comments: 'Great book!' }
      const mockResponse = {
        id: '1',
        title: 'Test Book',
        author: 'Test Author',
        rating: 5,
        comments: 'Great book!',
        hasNote: true,
        coverImageUrls: [],
        userId: 'user1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const store = useBooksStore()
      store.books = [{ id: '1', title: 'Test Book', author: 'Test Author', rating: 4, hasNote: false, coverImageUrls: [], userId: 'user1', createdAt: '2024-01-01', updatedAt: '2024-01-01' }]

      const result = await store.updateBook('1', updates)

      expect(result).toEqual(mockResponse)
      expect(store.books[0]).toEqual(mockResponse)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle update book error', async () => {
      const updates = { rating: 5, comments: 'Great book!' }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Book not found' })
      } as Response)

      const store = useBooksStore()
      
      await expect(store.updateBook('999', updates)).rejects.toThrow('Book not found')
      expect(store.error).toBe('Book not found')
      expect(store.loading).toBe(false)
    })
  })

  describe('removeBook', () => {
    it('should remove book successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true
      } as Response)

      const store = useBooksStore()
      store.books = [
        { id: '1', title: 'Book 1', author: 'Author 1', rating: 4, hasNote: false, coverImageUrls: [], userId: 'user1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', title: 'Book 2', author: 'Author 2', rating: 5, hasNote: false, coverImageUrls: [], userId: 'user1', createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ]
      store.totalCount = 2

      await store.removeBook('1')

      expect(store.books).toHaveLength(1)
      expect(store.books[0].id).toBe('2')
      expect(store.totalCount).toBe(1)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle remove book error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response)

      const store = useBooksStore()
      
      await expect(store.removeBook('999')).rejects.toThrow('Failed to delete book')
      expect(store.error).toBe('Failed to delete book')
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchAllBooks', () => {
    it('should fetch all books for analytics', async () => {
      const mockBooks = [
        { id: '1', title: 'Book 1', author: 'Author 1', rating: 4, hasNote: false, coverImageUrls: [], userId: 'user1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', title: 'Book 2', author: 'Author 2', rating: 5, hasNote: true, coverImageUrls: [], userId: 'user1', createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ]
      const mockResponse = {
        items: mockBooks,
        total: 2,
        page: 1
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const store = useBooksStore()
      const result = await store.fetchAllBooks()

      expect(result).toEqual(mockBooks)
      expect(store.allBooks).toEqual(mockBooks)
      expect(store.analyticsLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle fetch all books error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

      const store = useBooksStore()
      
      await expect(store.fetchAllBooks()).rejects.toThrow('Failed to fetch books for analytics')
      expect(store.error).toBe('Failed to fetch books for analytics')
      expect(store.analyticsLoading).toBe(false)
    })
  })

  describe('clearError', () => {
    it('should clear error state', () => {
      const store = useBooksStore()
      store.error = 'Some error'
      
      store.clearError()
      
      expect(store.error).toBeNull()
    })
  })
})
