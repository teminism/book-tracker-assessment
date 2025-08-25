import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '../../src/services/authService'

// Mock fetch
global.fetch = vi.fn()

describe('AuthService', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('token management', () => {
    it('should get and set token', () => {
      AuthService.setToken('test-token')
      const token = AuthService.getToken()
      expect(token).toBe('test-token')
    })

    it('should return null when no token', () => {
      const token = AuthService.getToken()
      expect(token).toBeNull()
    })
  })

  describe('user management', () => {
    it('should get and set user', () => {
      const testUser = { id: '1', username: 'test', displayName: 'Test User', email: 'test@example.com' }
      AuthService.setUser(testUser)
      const user = AuthService.getUser()
      expect(user).toEqual(testUser)
    })

    it('should return null when no user', () => {
      const user = AuthService.getUser()
      expect(user).toBeNull()
    })
  })

  describe('authentication check', () => {
    it('should return true when token exists', () => {
      AuthService.setToken('test-token')
      const isAuthenticated = AuthService.isAuthenticated()
      expect(isAuthenticated).toBe(true)
    })

    it('should return false when no token', () => {
      const isAuthenticated = AuthService.isAuthenticated()
      expect(isAuthenticated).toBe(false)
    })
  })

  describe('auth headers', () => {
    it('should return headers with token', () => {
      AuthService.setToken('test-token')
      const headers = AuthService.getAuthHeaders()
      expect(headers).toEqual({
        'Authorization': 'Bearer test-token'
      })
    })

    it('should return empty headers when no token', () => {
      const headers = AuthService.getAuthHeaders()
      expect(headers).toEqual({})
    })
  })

  describe('logout', () => {
    it('should clear token and user', () => {
      AuthService.setToken('test-token')
      AuthService.setUser({ id: '1', username: 'test' })
      
      AuthService.logout()
      
      expect(AuthService.getToken()).toBeNull()
      expect(AuthService.getUser()).toBeNull()
    })
  })
})

