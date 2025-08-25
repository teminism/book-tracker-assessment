<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import AddBookModal from '../components/AddBookModal.vue'
import EditBookModal from '../components/EditBookModal.vue'
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue'
import ViewBookModal from '../components/ViewBookModal.vue'
import RatingStars from '../components/RatingStars.vue'
import BookCover from '../components/BookCover.vue'
import { useBooksStore, type Book } from '../stores/books'

const store = useBooksStore()

const search = ref('')
const sortBy = ref<'title' | 'author'>('title')
const view = ref<'list' | 'grid'>('list')

const addOpen = ref(false)
const editOpen = ref(false)
const deleteOpen = ref(false)
const viewOpen = ref(false)

const editing = ref<Book | null>(null)
const viewing = ref<Book | null>(null)
const listViewBtn = ref<HTMLButtonElement>()
const gridViewBtn = ref<HTMLButtonElement>()

// Load books on mount
onMounted(async () => {
  try {
    await store.fetchBooks(1, search.value, sortBy.value)
  } catch (error) {
          console.error('Error loading books:', error)
  }
})

// Watch for search and sort changes
watch([search, sortBy], async () => {
  try {
    await store.fetchBooks(1, search.value, sortBy.value)
  } catch (error) {
          console.error('Error fetching books:', error)
  }
})

// Watch for view changes to update aria-pressed attributes
watch(view, (newView) => {
  if (listViewBtn.value) {
    listViewBtn.value.setAttribute('aria-pressed', (newView === 'list').toString())
  }
  if (gridViewBtn.value) {
    gridViewBtn.value.setAttribute('aria-pressed', (newView === 'grid').toString())
  }
})

const handleSearch = async () => {
  try {
    await store.fetchBooks(1, search.value, sortBy.value)
  } catch (error) {
          console.error('Error searching books:', error)
  }
}

const handleSort = async () => {
  try {
    await store.fetchBooks(1, search.value, sortBy.value)
  } catch (error) {
          console.error('Error sorting books:', error)
  }
}

const loadPage = async (page: number) => {
  try {
    await store.fetchBooks(page, search.value, sortBy.value)
  } catch (error) {
          console.error('Error loading page:', error)
  }
}

function openAdd() {
  addOpen.value = true
}

async function handleAddSubmit(bookData: { title: string; author: string; isbn?: string; rating: number; comments?: string; coverUrl?: string }) {
  try {
    console.log('🔍 MyBooks: handleAddSubmit called with:', bookData);
    
    await store.addBook({ 
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn,
      rating: bookData.rating,
      comments: bookData.comments,
      hasNote: !!(bookData.comments?.trim()),
      coverImageUrls: bookData.coverUrl ? [bookData.coverUrl] : []
    })
    
    console.log('🔍 MyBooks: Book added successfully, refreshing page');
    // Refresh the current page
    await store.fetchBooks(store.currentPage, search.value, sortBy.value)
    console.log('🔍 MyBooks: Page refreshed');
    // Close the modal after successful add
    addOpen.value = false
    console.log('🔍 MyBooks: Modal closed');
  } catch (error) {
    console.error('🔍 MyBooks: Error adding book:', error)
  }
}

function openEdit(b: Book) {
  editing.value = b
  editOpen.value = true
}

async function handleEditSubmit(id: string, updates: { rating: number; comments?: string; coverImageUrls: string[] }) {
  try {
    await store.updateBook(id, updates)
    // Refresh the current page to ensure data is in sync
    await store.fetchBooks(store.currentPage, search.value, sortBy.value)
    // Close the modal after successful update
    editOpen.value = false
  } catch (error) {
    console.error('Error updating book:', error)
  }
}

function openDelete(b: Book) {
  editing.value = b
  deleteOpen.value = true
}

async function handleDeleteConfirm(id: string) {
  try {
    await store.removeBook(id)
    // Refresh the current page
    await store.fetchBooks(store.currentPage, search.value, sortBy.value)
  } catch (error) {
          console.error('Error deleting book:', error)
  }
}

function openView(b: Book) {
  viewing.value = b
  viewOpen.value = true
}
</script>

<template>
  <section class="books" role="main" aria-labelledby="books-title">
    <header class="page-header">
      <div class="header-content">
        <h1 id="books-title">My Books</h1>
        <p class="description">Keep track of your books and reading progress.</p>
        <button 
          class="primary" 
          @click="openAdd"
          aria-label="Add new book to collection"
        >
          + Add Book
        </button>
      </div>
      
      <div class="toolbar" role="toolbar" aria-label="Book collection tools">
        <div class="search-container">
          <label for="search-input" class="sr-only">Search books</label>
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            id="search-input"
            v-model="search" 
            placeholder="Search books..." 
            @input="handleSearch"
            aria-label="Search books by title or author"
            type="search"
          />
        </div>
        <label for="sort-select" class="sr-only">Sort books by</label>
        <select 
          id="sort-select"
          v-model="sortBy" 
          class="sort-select" 
          @change="handleSort"
          aria-label="Sort books by title or author"
        >
          <option value="title">Sort by Title</option>
          <option value="author">Sort by Author</option>
        </select>
        <div class="view-toggle" role="group" aria-label="View options">
          <button 
            :class="{ active: view==='list' }" 
            @click="view='list'" 
            aria-label="List view"
            aria-pressed="false"
            ref="listViewBtn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span class="sr-only">List view</span>
          </button>
          <button 
            :class="{ active: view==='grid' }" 
            @click="view='grid'" 
            aria-label="Grid view"
            aria-pressed="false"
            ref="gridViewBtn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span class="sr-only">Grid view</span>
          </button>
        </div>
      </div>
    </header>

    <div v-if="!store.books.length" class="empty" role="status" aria-live="polite">
      No books yet. Add your first book to get started.
    </div>

    <ul v-else-if="view==='list'" class="list" role="list" aria-label="Book list">
      <li v-for="b in store.books" :key="b.id" class="book-card" role="listitem">
        <BookCover :cover-url="b.coverImageUrls?.[0]" :title="b.title" size="medium" />
        <div class="book-info">
          <h3 class="book-title">{{ b.title }}</h3>
          <p class="book-author">by {{ b.author }}</p>
          <p class="book-isbn">ISBN: {{ b.isbn || 'Not available' }}</p>
        </div>
        <div class="book-rating">
          <RatingStars v-model="b.rating" readonly />
          <span v-if="b.hasNote" class="notes-pill" aria-label="This book has notes">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            Notes
          </span>
        </div>
        <div class="book-actions" role="group" :aria-label="`Actions for ${b.title}`">
          <button 
            class="action-btn" 
            @click="openView(b)" 
            :aria-label="`View details for ${b.title}`"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span class="sr-only">View</span>
          </button>
          <button 
            class="action-btn" 
            @click="openEdit(b)" 
            :aria-label="`Edit ${b.title}`"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span class="sr-only">Edit</span>
          </button>
          <button 
            class="action-btn delete" 
            @click="openDelete(b)" 
            :aria-label="`Delete ${b.title}`"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polyline points="3,6 5,6 21,6"/>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            <span class="sr-only">Delete</span>
          </button>
        </div>
      </li>
    </ul>

    <div v-else-if="view==='grid'" class="grid">
              <div v-for="b in store.books" :key="b.id" class="grid-card">
        <div class="grid-cover">
          <img :src="b.coverImageUrls?.[0] || 'https://placehold.co/120x160?text=📕'" :alt="b.title" />
        </div>
        <div class="grid-info">
          <h3 class="grid-title">{{ b.title }}</h3>
          <p class="grid-author">{{ b.author }}</p>
          <p v-if="b.isbn" class="grid-isbn">{{ b.isbn }}</p>
          <div class="grid-rating">
            <RatingStars v-model="b.rating" readonly />
          </div>
        </div>
        <div class="grid-actions">
          <button class="grid-action-btn" @click="openView(b)" title="View">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button class="grid-action-btn" @click="openEdit(b)" title="Edit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="grid-action-btn delete" @click="openDelete(b)" title="Delete">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <footer class="collection-info">
      <div class="pager" v-if="store.totalCount > store.pageSize">
        <button class="pager-btn" :disabled="store.currentPage===1" @click="loadPage(store.currentPage - 1)">Prev</button>
        <button class="pager-num" :class="{ active: n===store.currentPage }" v-for="n in Math.ceil(store.totalCount / store.pageSize)" :key="n" @click="loadPage(n)">{{ n }}</button>
        <button class="pager-btn" :disabled="store.currentPage>=Math.ceil(store.totalCount / store.pageSize)" @click="loadPage(store.currentPage + 1)">Next</button>
      </div>
      <span>{{ (store.currentPage-1)*store.pageSize + 1 }}–{{ Math.min(store.currentPage*store.pageSize, store.totalCount) }} of {{ store.totalCount }} books</span>
    </footer>

    <!-- Modal Components -->
    <AddBookModal :open="addOpen" @close="addOpen=false" @submit="handleAddSubmit" />
    <EditBookModal :open="editOpen" :book="editing" @close="editOpen=false" @submit="handleEditSubmit" />
    <DeleteConfirmModal :open="deleteOpen" :book="editing" @close="deleteOpen=false" @confirm="handleDeleteConfirm" />
    <ViewBookModal :open="viewOpen" :book="viewing" @close="viewOpen=false" />
  </section>
</template>

<style scoped>
/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.books {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.description {
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 400px;
}

.toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  font-size: 16px;
  pointer-events: none;
  z-index: 1;
}

.search-container input {
  width: 100%;
  height: 40px;
  padding: 0 12px 0 40px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text-primary);
  font-size: 14px;
  box-sizing: border-box;
}

.search-container input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-container input::placeholder {
  color: var(--color-text-muted);
}

.sort-select {
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text-primary);
  font-size: 14px;
  min-width: 140px;
  white-space: nowrap;
  cursor: pointer;
  box-sizing: border-box;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

.sort-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.view-toggle {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.view-toggle button {
  width: 44px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 120ms;
  box-sizing: border-box;
}

.view-toggle button:hover {
  background: var(--color-background-tertiary);
  border-color: var(--color-border-hover);
  color: var(--color-text-primary);
}

.view-toggle button.active {
  background: var(--color-accent);
  color: var(--color-background);
  border-color: var(--color-accent);
}

.view-toggle button.active:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 16px;
}

.book-card {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 20px;
  align-items: center;
  padding: 20px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: all 120ms;
}

.book-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.book-cover img {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.book-info {
  display: grid;
  gap: 4px;
}

.book-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.book-author {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 14px;
}

.book-isbn {
  color: var(--color-text-muted);
  margin: 0;
  font-size: 12px;
}

.book-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.book-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.notes-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 9999px;
  background: var(--color-background-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  font-size: 13px;
  line-height: 1;
}

.notes-pill svg {
  display: block;
}

.action-btn:hover {
  background: var(--color-background-tertiary);
  border-color: var(--color-border-hover);
  color: var(--color-text-primary);
}

.action-btn.delete:hover {
  background: var(--color-danger-bg);
  border-color: var(--color-danger-border);
  color: var(--color-danger);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.grid-card {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all 120ms;
  height: fit-content;
  min-height: 280px;
}

.grid-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.grid-cover {
  text-align: center;
  margin-bottom: 10px;
}

.grid-cover img {
  width: 100px;
  height: 140px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.grid-info {
  display: grid;
  gap: 4px;
  margin-bottom: 10px;
  flex: 1;
}

.grid-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
  line-height: 1.3;
}

.grid-author {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 13px;
  text-align: center;
}

.grid-isbn {
  color: var(--color-text-muted);
  margin: 0;
  font-size: 11px;
  text-align: center;
}

.grid-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.grid-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-top: auto;
}

.grid-action-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  border-radius: 4px;
  transition: all 120ms;
}

.grid-action-btn:hover {
  background: var(--color-background-tertiary);
  border-color: var(--color-border-hover);
  color: var(--color-text-primary);
  transform: scale(1.05);
}

.grid-action-btn.delete:hover {
  background: var(--color-danger-bg);
  border-color: var(--color-danger-border);
  color: var(--color-danger);
}

.collection-info {
  text-align: center;
  margin-top: 32px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.pager {
  display: inline-flex;
  gap: 6px;
  margin-right: 12px;
}

.pager-btn, .pager-num {
  border: 1px solid var(--color-border-secondary);
  background: var(--color-background);
  color: var(--color-text-primary);
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.pager-btn:disabled { opacity: 0.5; cursor: default; }
.pager-num.active { background: var(--color-accent); color: var(--color-background); border-color: var(--color-accent); }

.empty {
  text-align: center;
  padding: 48px;
  color: var(--color-text-secondary);
  font-size: 16px;
}

@media (max-width: 900px) {
  .books {
    padding: 16px;
  }
  
  .page-header {
    margin-bottom: 24px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-content h1 {
    font-size: 24px;
  }
  
  .description {
    font-size: 14px;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .search-container {
    max-width: none;
    min-width: auto;
  }
  
  .book-card {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: 12px;
    padding: 16px;
  }
  
  .book-cover {
    grid-row: 1 / 3;
  }
  
  .book-info {
    grid-column: 2;
    grid-row: 1;
  }
  
  .book-rating {
    grid-column: 1 / 3;
    grid-row: 2;
    justify-content: flex-start;
    margin-top: 8px;
  }
  
  .book-actions {
    grid-column: 1 / 3;
    grid-row: 3;
    justify-content: center;
    margin-top: 12px;
  }
  
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  
  .grid-card {
    padding: 12px;
    min-height: 240px;
  }
  
  .grid-cover img {
    width: 70px;
    height: 100px;
  }
  
  .grid-title {
    font-size: 13px;
  }
  
  .grid-author {
    font-size: 12px;
  }
}

@media (max-width: 600px) {
  .books {
    padding: 12px;
  }
  
  .header-content h1 {
    font-size: 20px;
  }
  
  .book-card {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    text-align: center;
  }
  
  .book-cover {
    grid-column: 1;
    grid-row: 1;
    display: flex;
    justify-content: center;
  }
  
  .book-info {
    grid-column: 1;
    grid-row: 2;
    text-align: center;
  }
  
  .book-rating {
    grid-column: 1;
    grid-row: 3;
    justify-content: center;
  }
  
  .book-actions {
    grid-column: 1;
    grid-row: 4;
  }
  
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
  }
  
  .grid-card {
    min-height: auto;
    padding: 8px;
  }
  
  .grid-cover img {
    width: 60px;
    height: 80px;
  }
  
  .grid-title {
    font-size: 12px;
  }
  
  .grid-author {
    font-size: 11px;
  }
}
</style>


