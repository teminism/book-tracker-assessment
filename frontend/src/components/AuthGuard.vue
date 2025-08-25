<template>
  <div>
    <div v-if="!isAuthenticated" class="auth-required">
      <div class="auth-content">
        <h1>Welcome to Book Tracker</h1>
        <p>Please login to access your book collection.</p>
        <button @click="showLogin = true" class="login-btn">
          Login
        </button>
      </div>
    </div>
    
    <div v-else>
      <slot />
    </div>
    
    <LoginModal 
      v-if="showLogin" 
      @close="showLogin = false"
      @success="handleLoginSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import LoginModal from './LoginModal.vue'

const authStore = useAuthStore()
const showLogin = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)

const handleLoginSuccess = () => {
  showLogin.value = false
}

onMounted(() => {
  authStore.initializeAuth()
})
</script>

<style scoped>
.auth-required {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.auth-content {
  text-align: center;
  max-width: 400px;
}

.auth-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.auth-content p {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
  line-height: 1.6;
}

.login-btn {
  padding: 16px 32px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
</style>
