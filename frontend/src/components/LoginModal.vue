<template>
  <Modal title="Login" :open="true" @close="$emit('close')">
    <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            placeholder="Enter username"
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="Enter password"
            :disabled="loading"
          />
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Username: <code>demo</code> | Password: <code>demo123</code></p>
          <p>Username: <code>admin</code> | Password: <code>admin123</code></p>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="$emit('close')" :disabled="loading">
            Cancel
          </button>
          <button type="submit" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </div>
      </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from './Modal.vue'
import { useAuthStore } from '../stores/auth'

const emit = defineEmits<{
  close: []
  success: []
}>()

const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')

const form = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await authStore.login(form.value)
    emit('success')
    emit('close')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-group input {
  padding: 12px;
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  font-size: 16px;
  background: var(--color-background);
  color: var(--color-text-primary);
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 12px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
}

.demo-credentials {
  padding: 16px;
  background: var(--color-background-secondary);
  border-radius: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.demo-credentials p {
  margin: 4px 0;
}

.demo-credentials code {
  background: var(--color-background);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.form-actions button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.form-actions button:first-child {
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
}

.form-actions button:last-child {
  background: var(--color-primary);
  color: white;
}

.form-actions button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.form-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
