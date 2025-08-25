<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import AuthGuard from './components/AuthGuard.vue'
import { ref, watch } from 'vue'

const mobileOpen = ref(false)
const menuButton = ref<HTMLButtonElement>()

function toggleSidebar() { 
  mobileOpen.value = !mobileOpen.value 
}

// Update ARIA attributes when sidebar state changes
watch(mobileOpen, (isOpen) => {
  if (menuButton.value) {
    menuButton.value.setAttribute('aria-expanded', isOpen.toString())
  }
})
</script>

<template>
  <AuthGuard>
    <template #default>
      <div id="layout" role="application" aria-label="Book Tracker Application">
        <!-- Skip to main content link -->
        <a href="#main-content" class="skip-link">Skip to main content</a>
        
        <!-- Mobile backdrop -->
        <div 
          v-if="mobileOpen" 
          class="mobile-backdrop" 
          @click="mobileOpen = false"
          role="button"
          tabindex="0"
          aria-label="Close navigation menu"
          @keydown.enter="mobileOpen = false"
          @keydown.space="mobileOpen = false"
        ></div>
        
        <Sidebar :mobile-open="mobileOpen" @close="mobileOpen=false" />
        <main id="main-content" role="main" tabindex="-1">
          <header class="topbar" role="banner">
            <button 
              class="menu" 
              @click="toggleSidebar"
              aria-label="Toggle navigation menu"
              aria-expanded="false"
              aria-controls="sidebar-navigation"
              ref="menuButton"
            >
              <span aria-hidden="true">☰</span>
            </button>
            <h1 class="title">Book Tracker</h1>
          </header>
          <router-view />
        </main>
      </div>
    </template>
  </AuthGuard>
</template>

<style scoped>
/* Skip link for screen readers */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-primary);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}

/* Mobile-first approach */
#layout {
  min-height: 100vh;
  display: block;
  position: relative;
}

main {
  width: 100%;
  padding: 16px;
  min-height: 100vh;
  background-color: var(--color-background);
  overflow-x: hidden;
  margin-left: 0;
  box-sizing: border-box;
}

.topbar { 
  display: flex; 
  gap: 16px; 
  align-items: center; 
  margin-bottom: 20px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.menu {
  background: none;
  border: none;
  font-size: 18px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text-primary);
  background-color: var(--color-background-secondary);
  transition: all 0.2s ease;
}

.menu:hover {
  background-color: var(--color-border);
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.mobile-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
  display: block;
  pointer-events: auto;
}

/* Desktop Styles */
@media (min-width: 901px) {
  #layout {
    display: block;
    min-height: 100vh;
  }
  
  main {
    padding: 24px;
    margin-left: 240px;
    width: calc(100vw - 240px);
    box-sizing: border-box;
    overflow-x: hidden;
  }
  
  .topbar {
    display: none;
  }
  
  .mobile-backdrop {
    display: none;
  }
}
</style>
