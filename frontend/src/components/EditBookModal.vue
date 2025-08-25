<script setup lang="ts">
import { reactive, watch } from 'vue'
import Modal from './Modal.vue'
import RatingStars from './RatingStars.vue'
import type { Book } from '../stores/books'

interface Props {
  open: boolean
  book: Book | null
}

interface Emits {
  close: []
  submit: [id: string, updates: { rating: number; comments?: string; coverImageUrls: string[] }]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const draft = reactive<{ title: string; author: string; rating: number; comments: string; isbn: string; coverUrl: string }>({
  title: '', author: '', rating: 3, comments: '', isbn: '', coverUrl: ''
})

watch(() => props.book, (book) => {
  if (book) {
    // Reset draft completely to avoid stale data
    draft.title = book.title
    draft.author = book.author
    draft.rating = book.rating
    draft.comments = book.comments ?? ''
    draft.isbn = book.isbn ?? ''
    draft.coverUrl = book.coverImageUrls?.[0] ?? ''
  }
}, { immediate: true, deep: true })

// Also watch for modal open state to ensure fresh data
watch(() => props.open, (isOpen) => {
  if (isOpen && props.book) {
    // Reset draft completely to avoid stale data
    draft.title = props.book.title
    draft.author = props.book.author
    draft.rating = props.book.rating
    draft.comments = props.book.comments ?? ''
    draft.isbn = props.book.isbn ?? ''
    draft.coverUrl = props.book.coverImageUrls?.[0] ?? ''
  }
})

function submit() {
  if (!props.book) return
  emit('submit', props.book.id, { 
    rating: draft.rating, 
    comments: draft.comments,
    coverImageUrls: draft.coverUrl ? [draft.coverUrl] : []
  })
  emit('close')
}
</script>

<template>
  <Modal title="Edit Book" :open="open" @close="emit('close')">
    <form class="form" @submit.prevent="submit" @click.stop>
      <label>
        <div>Title</div>
        <input :value="draft.title" readonly />
      </label>
      <label>
        <div>Author</div>
        <input :value="draft.author" readonly />
      </label>
      <label>
        <div>ISBN</div>
        <input :value="draft.isbn" readonly />
      </label>
      <label>
        <div>Cover URL</div>
        <input v-model="draft.coverUrl" @click.stop />
      </label>
      <label>
        <div>Rating</div>
        <RatingStars v-model="draft.rating" />
      </label>
      <label>
        <div>Comments</div>
        <textarea v-model="draft.comments" rows="4" @click.stop />
      </label>
      <div class="form-actions">
        <button type="button" @click="emit('close')">Cancel</button>
        <button type="submit">Save</button>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
.form { display: grid; gap: 12px; }
input, textarea { 
  padding: 8px 10px; 
  border-radius: 6px; 
  border: 1px solid #334155; 
  background: transparent; 
  color: inherit; 
}
.form-actions { display: flex; justify-content: end; gap: 8px; }
</style>
