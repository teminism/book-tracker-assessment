import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../src/stores/auth'

// Mock AuthService
vi.mock('../../src/services/authService', () => ({
  AuthService: {
    login: vi.fn(),
    logout: vi.fn(),
    getToken: vi.fn(),
    setToken: vi.fn(),
    getUser: vi.fn(),
    setUser: vi.fn(),
    isAuthenticated: vi.fn()
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const store = useAuthStore()
      
      expect(store.user).toBeUndefined()
      expect(store.token).toBeUndefined()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should initialize auth from localStorage', async () => {
      const mockUser = { id: '1', username: 'test', displayName: 'Test User', email: 'test@example.com' }
      const mockToken = 'mock-token'
      
      const { AuthService } = await import('../../src/services/authService')
      vi.mocked(AuthService.getToken).mockReturnValue(mockToken)
      vi.mocked(AuthService.getUser).mockReturnValue(mockUser)
      
      const store = useAuthStore()
      store.initializeAuth()
      
      expect(store.token).toBe(mockToken)
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = { id: '1', username: 'test', displayName: 'Test User', email: 'test@example.com' }
      const mockToken = 'mock-token'
      const loginResponse = { token: mockToken, user: mockUser }
      
      const { AuthService } = await import('../../src/services/authService')
      vi.mocked(AuthService.login).mockResolvedValue(loginResponse)
      
      const store = useAuthStore()
      const result = await store.login({ username: 'test', password: 'password' })
      
      expect(result).toEqual(loginResponse)
      expect(store.user).toEqual(mockUser)
      expect(store.token).toBe(mockToken)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should handle login failure', async () => {
      const { AuthService } = await import('../../src/services/authService')
      vi.mocked(AuthService.login).mockRejectedValue(new Error('Login failed'))
      
      const store = useAuthStore()
      
      await expect(store.login({ username: 'test', password: 'wrong-password' }))
        .rejects.toThrow('Login failed')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      const { AuthService } = await import('../../src/services/authService')
      vi.mocked(AuthService.logout).mockImplementation(() => {})
      
      const store = useAuthStore()
      store.user = { id: '1', username: 'test', displayName: 'Test User', email: 'test@example.com' }
      store.token = 'mock-token'
      
      store.logout()
      
      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(AuthService.logout).toHaveBeenCalled()
    })
  })

  describe('updateDisplayName', () => {
    it('should update display name', async () => {
      const { AuthService } = await import('../../src/services/authService')
      vi.mocked(AuthService.setUser).mockImplementation(() => {})
      
      const store = useAuthStore()
      store.user = { id: '1', username: 'test', displayName: 'Old Name', email: 'test@example.com' }
      
      store.updateDisplayName('New Name')
      
      expect(store.user?.displayName).toBe('New Name')
      expect(AuthService.setUser).toHaveBeenCalledWith(store.user)
    })
  })

  describe('updateAvatar', () => {
    it('should update avatar', async () => {
      const { AuthService } = await import('../../src/services/authService')
      vi.mocked(AuthService.setUser).mockImplementation(() => {})
      
      const store = useAuthStore()
      store.user = { id: '1', username: 'test', displayName: 'Test User', email: 'test@example.com' }
      
      store.updateAvatar('new-avatar.jpg')
      
      expect(store.user?.avatar).toBe('new-avatar.jpg')
      expect(AuthService.setUser).toHaveBeenCalledWith(store.user)
    })
  })
})
