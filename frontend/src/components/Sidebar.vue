<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const props = defineProps<{ mobileOpen?: boolean }>()
const emit = defineEmits<{ close: [] }>()

const handleLogout = () => {
  authStore.logout()
}

// Generate default avatar or use uploaded one
const userAvatar = computed(() => {
  if (authStore.user?.avatar) {
    return authStore.user.avatar
  }
  
  // Generate default avatar with initials
  const name = authStore.user?.displayName || 'User'
  const initials = name.split(' ').map(n => n[0]?.toUpperCase()).join('').slice(0, 2) || 'U'
  const canvas = document.createElement('canvas')
  canvas.width = 80
  canvas.height = 80
  const ctx = canvas.getContext('2d')!
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 80, 80)
  gradient.addColorStop(0, '#3b82f6')
  gradient.addColorStop(1, '#1d4ed8')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 80, 80)
  
  // Text
  ctx.fillStyle = 'white'
  ctx.font = 'bold 32px system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initials, 40, 40)
  
  return canvas.toDataURL()
})
</script>

<template>
  <aside 
    id="sidebar-navigation"
    class="sidebar" 
    :class="{ open: props.mobileOpen }" 
    @click.self="emit('close')"
    role="navigation"
    aria-label="Main navigation"
  >
    <h2 class="brand">Book Tracker</h2>
    <nav role="navigation" aria-label="Primary navigation">
      <router-link 
        :class="{ active: route.name === 'books' }" 
        to="/books"
        :aria-current="route.name === 'books' ? 'page' : undefined"
      >
        <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <span>My Books</span>
      </router-link>
      <router-link 
        :class="{ active: route.name === 'analytics' }" 
        to="/analytics"
        :aria-current="route.name === 'analytics' ? 'page' : undefined"
      >
        <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M3 3v18h18"/>
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
        </svg>
        <span>Analytics</span>
      </router-link>
      <router-link 
        :class="{ active: route.name === 'settings' }" 
        to="/settings"
        :aria-current="route.name === 'settings' ? 'page' : undefined"
      >
        <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span>Settings</span>
      </router-link>
    </nav>
    
    <div class="user-section" role="complementary" aria-label="User information">
      <div class="user-info">
        <div class="user-avatar">
          <img 
            :src="userAvatar" 
            :alt="`${authStore.user?.displayName || 'User'}'s avatar`"
            class="avatar-small"
          />
        </div>
        <div class="user-details">
          <span class="user-name" aria-label="User name">{{ authStore.user?.displayName || 'User' }}</span>
          <span class="user-email" aria-label="User email">{{ authStore.user?.email }}</span>
        </div>
      </div>
      <button 
        @click="handleLogout" 
        class="logout-btn"
        aria-label="Logout from application"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16,17 21,12 16,7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Logout</span>
      </button>
    </div>
  </aside>
  
</template>

<style scoped>
.sidebar {
  height: 100vh;
  min-height: 600px;
  border-right: 1px solid var(--color-border);
  padding: 20px 16px;
  background: var(--color-background);
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  transform: translateX(-100%);
  transition: transform 300ms ease;
  z-index: 50;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
.brand {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
}
nav {
  display: grid;
  gap: 6px;
  flex: 1;
}
a {
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  transition: all 120ms;
}
a.active, a:hover {
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
}
.icon {
  font-size: 18px;
}

.user-section {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
  padding-bottom: 20px;
}

.user-info {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: block;
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-email {
  display: block;
  color: var(--color-text-secondary);
  font-size: 12px;
  margin-top: 2px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  width: 100%;
  padding: 10px 16px;
  background: var(--color-background-secondary);
  border: none;
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 120ms;
  margin-top: 8px;
}

.logout-btn:hover {
  background: var(--color-background-tertiary);
  color: var(--color-text-primary);
}

.sidebar.open { 
  transform: translateX(0%); 
}

/* Desktop Styles */
@media (min-width: 901px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 240px;
    height: 100vh;
    transform: none;
    transition: none;
    z-index: auto;
    box-shadow: none;
    border-right: 1px solid #e5e7eb;
  }
  
  .brand {
    margin-bottom: 24px;
    font-size: 24px;
  }
  
  nav a {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .user-section {
    padding-bottom: 20px;
  }
}
</style>


