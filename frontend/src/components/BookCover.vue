<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  coverUrl?: string
  title: string
  size?: 'small' | 'medium' | 'large'
}>()

const imageError = ref(false)

const fallbackCover = () => {
  // Generate a simple colored background with book emoji
  const canvas = document.createElement('canvas')
  const size = props.size === 'large' ? 120 : props.size === 'medium' ? 100 : 80
  canvas.width = size
  canvas.height = size * 1.25 // Book aspect ratio
  
  const ctx = canvas.getContext('2d')!
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#3b82f6')
  gradient.addColorStop(1, '#1d4ed8')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size * 1.25)
  
  // Add book emoji
  ctx.font = `${size * 0.3}px system-ui`
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('📚', size / 2, size * 0.625)
  
  return canvas.toDataURL()
}

const coverSrc = computed(() => {
  if (imageError.value || !props.coverUrl) {
    return fallbackCover()
  }
  return props.coverUrl
})
</script>

<template>
  <div class="book-cover" :class="size">
    <img 
      :src="coverSrc" 
      :alt="`Cover of ${title}`"
      @error="imageError = true"
      loading="lazy"
    />
  </div>
</template>

<style scoped>
.book-cover {
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: var(--color-background-tertiary);
}

.book-cover.small {
  width: 60px;
  height: 75px;
}

.book-cover.medium {
  width: 80px;
  height: 100px;
}

.book-cover.large {
  width: 120px;
  height: 150px;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
