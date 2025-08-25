<script setup lang="ts">
import Modal from './Modal.vue'
import type { Book } from '../stores/books'

interface Props {
  open: boolean
  book: Book | null
}

interface Emits {
  close: []
  confirm: [id: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function confirm() {
  if (!props.book) return
  emit('confirm', props.book.id)
  emit('close')
}
</script>

<template>
  <Modal title="Delete Book" :open="open" @close="emit('close')">
    <div class="content">
      <p>Are you sure you want to delete "{{ book?.title }}"?</p>
      <p class="warning">This action cannot be undone.</p>
      <div class="form-actions">
        <button type="button" @click="emit('close')">Cancel</button>
        <button type="button" class="delete" @click="confirm">Delete</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.content { display: grid; gap: 12px; }
.warning { color: #ef4444; font-size: 14px; }
.form-actions { display: flex; justify-content: end; gap: 8px; }
.delete { color: #ef4444; }
</style>
