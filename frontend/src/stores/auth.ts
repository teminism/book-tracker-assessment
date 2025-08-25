import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AuthService } from '../services/authService';
import type { LoginRequest, UserDto } from '../types/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserDto | null>(AuthService.getUser());
  const token = ref<string | null>(AuthService.getToken());

  const isAuthenticated = computed(() => !!token.value);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await AuthService.login(credentials);
      user.value = response.user;
      token.value = response.token;
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    user.value = null;
    token.value = null;
  };

  const initializeAuth = () => {
    const savedUser = AuthService.getUser();
    const savedToken = AuthService.getToken();
    
    if (savedUser && savedToken) {
      user.value = savedUser;
      token.value = savedToken;
    }
  };

  const updateDisplayName = (newDisplayName: string) => {
    if (user.value) {
      user.value.displayName = newDisplayName;
      // Save to localStorage for persistence
      AuthService.setUser(user.value);
    }
  };

  const updateAvatar = (newAvatar: string) => {
    if (user.value) {
      user.value.avatar = newAvatar;
      // Save to localStorage for persistence
      AuthService.setUser(user.value);
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    initializeAuth,
    updateDisplayName,
    updateAvatar,
  };
});
