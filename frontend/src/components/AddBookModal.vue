<script setup lang="ts">
import { reactive, watch } from 'vue'
import Modal from './Modal.vue'
import RatingStars from './RatingStars.vue'

interface Props {
  open: boolean
}

interface Emits {
  close: []
  submit: [book: { title: string; author: string; isbn?: string; rating: number; comments?: string; coverUrl?: string }]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const draft = reactive<{ title: string; author: string; rating: number; comments: string; isbn: string; coverUrl: string }>({
  title: '', author: '', rating: 0, comments: '', isbn: '', coverUrl: ''
})

// Reset form when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    draft.title = ''
    draft.author = ''
    draft.rating = 0
    draft.comments = ''
    draft.isbn = ''
    draft.coverUrl = ''
  }
})

function submit() {
  console.log('🔍 AddBookModal: submit called with draft:', draft);
  
  if (!draft.title || !draft.author) {
    console.log('🔍 AddBookModal: Validation failed - missing title or author');
    return
  }
  
  // Validate that comments are provided if rating is given (rating > 0)
  if (draft.rating > 0 && (!draft.comments || draft.comments.trim() === '')) {
    console.log('🔍 AddBookModal: Validation failed - rating given but no comments');
    alert('Please provide comments when giving a rating')
    return
  }
  
  console.log('🔍 AddBookModal: Validation passed, emitting submit event');
  emit('submit', { ...draft })
  
  // Reset the form after submission
  draft.title = ''
  draft.author = ''
  draft.rating = 0
  draft.comments = ''
  draft.isbn = ''
  draft.coverUrl = ''
  emit('close')
  console.log('🔍 AddBookModal: Form reset and modal closed');
}
</script>

<template>
  <Modal title="Add Book" :open="open" @close="emit('close')">
    <form class="form" @submit.prevent="submit" role="form" aria-labelledby="add-book-title">
      <div class="form-group">
        <label for="book-title">
          <div>Title <span class="required" aria-label="required">*</span></div>
          <input 
            id="book-title"
            v-model="draft.title" 
            required 
            aria-required="true"
            aria-describedby="title-error"
            :aria-invalid="!draft.title && draft.title !== ''"
          />
          <div v-if="!draft.title && draft.title !== ''" id="title-error" class="error-message" role="alert">
            Book title is required
          </div>
        </label>
      </div>
      
      <div class="form-group">
        <label for="book-author">
          <div>Author <span class="required" aria-label="required">*</span></div>
          <input 
            id="book-author"
            v-model="draft.author" 
            required 
            aria-required="true"
            aria-describedby="author-error"
            :aria-invalid="!draft.author && draft.author !== ''"
          />
          <div v-if="!draft.author && draft.author !== ''" id="author-error" class="error-message" role="alert">
            Author name is required
          </div>
        </label>
      </div>
      
      <div class="form-group">
        <label for="book-isbn">
          <div>ISBN (optional)</div>
          <input 
            id="book-isbn"
            v-model="draft.isbn" 
            placeholder="ISBN (optional)"
            aria-describedby="isbn-help"
          />
          <div id="isbn-help" class="help-text">International Standard Book Number</div>
        </label>
      </div>
      
      <div class="form-group">
        <label for="book-cover">
          <div>Cover URL (optional)</div>
          <input 
            id="book-cover"
            v-model="draft.coverUrl" 
            type="url"
            placeholder="Cover image URL (optional)"
            aria-describedby="cover-help"
          />
          <div id="cover-help" class="help-text">Direct link to book cover image</div>
        </label>
      </div>
      
      <div class="form-group">
        <label for="book-rating">
          <div>Rating</div>
          <RatingStars v-model="draft.rating" />
        </label>
      </div>
      
      <div class="form-group">
        <label for="book-comments">
          <div>Comments (optional)</div>
          <textarea 
            id="book-comments"
            v-model="draft.comments" 
            rows="4" 
            placeholder="Your thoughts (optional)"
            aria-describedby="comments-help"
          />
          <div id="comments-help" class="help-text">Optional notes about the book</div>
        </label>
      </div>
      
      <div class="form-actions" role="group" aria-label="Form actions">
        <button 
          type="button" 
          @click="emit('close')"
          aria-label="Cancel adding book"
        >
          Cancel
        </button>
        <button 
          type="submit"
          :disabled="!draft.title || !draft.author || (draft.rating > 0 && (!draft.comments || draft.comments.trim() === ''))"
          aria-describedby="submit-help"
        >
          Save Book
        </button>
        <div id="submit-help" class="help-text">
          {{ !draft.title || !draft.author ? 'Please fill in title and author to save' : 
             (draft.rating > 0 && (!draft.comments || draft.comments.trim() === '')) ? 'Please provide comments when giving a rating' : 
             'Save this book to your collection' }}
        </div>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
.form { 
  display: grid; 
  gap: 16px; 
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

input, textarea { 
  padding: 8px 10px; 
  border-radius: 6px; 
  border: 1px solid var(--color-border); 
  background: var(--color-background); 
  color: var(--color-text-primary);
  font-size: 14px;
  transition: border-color 0.2s ease;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input[aria-invalid="true"], textarea[aria-invalid="true"] {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.required {
  color: var(--color-danger);
  font-weight: bold;
}

.error-message {
  color: var(--color-danger);
  font-size: 12px;
  margin-top: 4px;
}

.help-text {
  color: var(--color-text-secondary);
  font-size: 12px;
  margin-top: 4px;
}

.form-actions { 
  display: flex; 
  justify-content: end; 
  gap: 8px; 
  margin-top: 8px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button:disabled:hover {
  background: var(--color-background-secondary);
}
</style>
