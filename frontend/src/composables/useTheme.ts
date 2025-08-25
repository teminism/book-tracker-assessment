import { ref, watchEffect } from 'vue'

const isDark = ref(false)

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
  const saved = localStorage.getItem('theme')
  if (saved !== null) {
    isDark.value = saved === 'dark'
  } else {
    // Use system preference as fallback
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
}

// Initialize immediately so state matches DOM and storage
initializeTheme()

// React to changes and apply them to the DOM + storage
watchEffect(() => {
  const root = document.documentElement
  if (isDark.value) {
    root.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
  }
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
})

export const useTheme = () => {
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  const setTheme = (dark: boolean) => {
    isDark.value = dark
  }

  return { isDark, toggleTheme, setTheme }
}
