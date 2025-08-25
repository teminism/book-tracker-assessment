<script setup lang="ts">
import Modal from './Modal.vue'
import RatingStars from './RatingStars.vue'
import type { Book } from '../stores/books'

interface Props {
  open: boolean
  book: Book | null
}

interface Emits {
  close: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <Modal title="Book Details" :open="open" @close="emit('close')">
    <div v-if="book" class="content">
      <div class="cover-section">
        <img 
          class="cover" 
          :src="book.coverImageUrls?.[0] || 'https://placehold.co/120x160?text=📕'" 
          :alt="book.title" 
        />
        <div class="book-info">
          <h3>{{ book.title }}</h3>
          <p class="author">by {{ book.author }}</p>
          <p v-if="book.isbn" class="isbn">ISBN: {{ book.isbn }}</p>
          <div class="rating">
            <RatingStars :model-value="book.rating" readonly />
            <span class="rating-text">{{ book.rating }}/5 stars</span>
          </div>
        </div>
      </div>
      
      <div v-if="book.comments" class="comments">
        <h4>Comments</h4>
        <p>{{ book.comments }}</p>
      </div>
      
      <div class="form-actions">
        <button type="button" @click="emit('close')">Close</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.content { display: grid; gap: 16px; }
.cover-section { display: flex; gap: 16px; align-items: start; }
.cover { 
  width: 120px; 
  height: 160px; 
  object-fit: cover; 
  border-radius: 8px; 
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.book-info { display: grid; gap: 8px; }
.author { color: #94a3b8; font-style: italic; }
.isbn { color: #94a3b8; font-size: 14px; }
.rating { display: flex; align-items: center; gap: 8px; }
.rating-text { color: #94a3b8; font-size: 14px; }
.comments { 
  border-top: 1px solid #334155; 
  padding-top: 16px; 
}
.comments h4 { margin: 0 0 8px; }
.form-actions { display: flex; justify-content: end; }
</style>
