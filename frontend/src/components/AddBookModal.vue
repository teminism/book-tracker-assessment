<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
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

// Expose method to reset form and close modal
const resetAndClose = () => {
  draft.title = ''
  draft.author = ''
  draft.rating = 0
  draft.comments = ''
  draft.isbn = ''
  draft.coverUrl = ''
  // Clear errors
  errors.title = ''
  errors.author = ''
  errors.comments = ''
  emit('close')
  console.log('🔍 AddBookModal: Form reset and modal closed');
}

defineExpose({ resetAndClose })

const draft = reactive<{ title: string; author: string; rating: number; comments: string; isbn: string; coverUrl: string }>({
  title: '', author: '', rating: 0, comments: '', isbn: '', coverUrl: ''
})

// Validation state
const errors = reactive({
  title: '',
  author: '',
  comments: ''
})

// Computed validation
const isValid = computed(() => {
  return draft.title.trim() !== '' && 
         draft.author.trim() !== '' && 
         !(draft.rating > 0 && (!draft.comments || draft.comments.trim() === ''))
})

// Validation message
const validationMessage = computed(() => {
  if (!draft.title.trim()) return 'Please enter a book title'
  if (!draft.author.trim()) return 'Please enter an author name'
  if (draft.rating > 0 && (!draft.comments || draft.comments.trim() === '')) {
    return 'Please provide comments when giving a rating'
  }
  return 'Save this book to your collection'
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
    // Clear errors
    errors.title = ''
    errors.author = ''
    errors.comments = ''
  }
})

function submit() {
  console.log('🔍 AddBookModal: submit called with draft:', draft);
  
  // Clear previous errors
  errors.title = ''
  errors.author = ''
  errors.comments = ''
  
  // Validate fields
  let hasErrors = false
  
  if (!draft.title.trim()) {
    errors.title = 'Book title is required'
    hasErrors = true
  }
  
  if (!draft.author.trim()) {
    errors.author = 'Author name is required'
    hasErrors = true
  }
  
  if (draft.rating > 0 && (!draft.comments || draft.comments.trim() === '')) {
    errors.comments = 'Comments are required when giving a rating'
    hasErrors = true
  }
  
  if (hasErrors) {
    console.log('🔍 AddBookModal: Validation failed');
    return
  }
  
  console.log('🔍 AddBookModal: Validation passed, emitting submit event');
  emit('submit', { ...draft })
  // Don't reset form or close modal here - let parent handle success/failure
  console.log('🔍 AddBookModal: Submit event emitted, waiting for parent response');
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
            :aria-invalid="!!errors.title"
          />
          <div v-if="errors.title" id="title-error" class="error-message" role="alert">
            {{ errors.title }}
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
            :aria-invalid="!!errors.author"
          />
          <div v-if="errors.author" id="author-error" class="error-message" role="alert">
            {{ errors.author }}
          </div>
        </label>
      </div>
      
      <div class="form-group">
        <label for="book-isbn">
          <div>ISBN</div>
          <input 
            id="book-isbn"
            v-model="draft.isbn" 
            placeholder="ISBN"
            aria-describedby="isbn-help"
          />
          <div id="isbn-help" class="help-text">International Standard Book Number</div>
        </label>
      </div>
      
      <div class="form-group">
        <label for="book-cover">
          <div>Cover URL</div>
          <input 
            id="book-cover"
            v-model="draft.coverUrl" 
            type="url"
            placeholder="Cover image URL"
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
            aria-describedby="comments-error"
            :aria-invalid="!!errors.comments"
          />
          <div v-if="errors.comments" id="comments-error" class="error-message" role="alert">
            {{ errors.comments }}
          </div>
        </label>
      </div>
      
      <div class="form-actions" role="group" aria-label="Form actions">
        <div class="validation-message" :class="{ 'error': !isValid }">
          {{ validationMessage }}
        </div>
        <div class="button-group">
          <button 
            type="button" 
            @click="emit('close')"
            aria-label="Cancel adding book"
          >
            Cancel
          </button>
          <button 
            type="submit"
            :disabled="!isValid"
            aria-describedby="submit-help"
          >
            Save Book
          </button>
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
  flex-direction: column;
  gap: 12px; 
  margin-top: 8px;
}

.validation-message {
  color: var(--color-text-secondary);
  font-size: 13px;
  text-align: center;
  padding: 8px;
  border-radius: 6px;
  background: var(--color-background-secondary);
  transition: all 0.2s ease;
}

.validation-message.error {
  color: var(--color-danger);
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.button-group {
  display: flex;
  justify-content: end;
  gap: 8px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button:disabled:hover {
  background: var(--color-background-secondary);
}
</style>
