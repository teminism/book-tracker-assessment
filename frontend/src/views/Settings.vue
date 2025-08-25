<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useAuthStore } from '../stores/auth'
import { useBooksStore } from '../stores/books'

const authStore = useAuthStore()
const booksStore = useBooksStore()
const { isDark, toggleTheme } = useTheme()

// File input reference
const fileInput = ref<HTMLInputElement>()
const isUploading = ref(false)
const uploadError = ref<string | null>(null)

// Use computed property to get/set display name from auth store
const displayName = computed({
  get: () => authStore.user?.displayName || 'Reader',
  set: (value: string) => {
    authStore.updateDisplayName(value)
  }
})

// Get current avatar or default
const currentAvatar = computed(() => {
  return authStore.user?.avatar || generateDefaultAvatar(authStore.user?.displayName || 'User')
})

// Generate a default avatar with initials
const generateDefaultAvatar = (name: string): string => {
  const initials = name.split(' ').map(n => n[0]?.toUpperCase()).join('').slice(0, 2) || 'U'
  const canvas = document.createElement('canvas')
  canvas.width = 120
  canvas.height = 120
  const ctx = canvas.getContext('2d')!
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 120, 120)
  gradient.addColorStop(0, '#3b82f6')
  gradient.addColorStop(1, '#1d4ed8')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 120, 120)
  
  // Text
  ctx.fillStyle = 'white'
  ctx.font = 'bold 48px system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initials, 60, 60)
  
  return canvas.toDataURL()
}

// Handle file selection
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Please select an image file'
    return
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'File size must be less than 5MB'
    return
  }
  
  uploadError.value = null
  isUploading.value = true
  
  // Read and resize the file
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      // Create canvas to resize image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      // Resize image
      const maxSize = 200
      let { width, height } = img
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      
      // Update avatar
      authStore.updateAvatar(compressedDataUrl)
      isUploading.value = false
    }
    img.src = e.target?.result as string
  }
  
  reader.onerror = () => {
    uploadError.value = 'Failed to read file'
    isUploading.value = false
  }
  
  reader.readAsDataURL(file)
}

// Trigger file input
const selectFile = () => {
  fileInput.value?.click()
}

// Remove avatar
const removeAvatar = () => {
  authStore.updateAvatar('')
}

// Data export functionality
const isExporting = ref(false)
const exportError = ref<string | null>(null)

// Fetch all user's books for export
const getAllBooksForExport = async () => {
  try {
    // Use the existing fetchAllBooks method that gets ALL books
    await booksStore.fetchAllBooks()
    return booksStore.allBooks
  } catch (error) {
          console.error('Error fetching books:', error)
          throw new Error('Could not get book data')
  }
}

// Export to JSON
const exportToJSON = async () => {
  isExporting.value = true
  exportError.value = null
  
  try {
    const books = await getAllBooksForExport()
    
    const exportData = {
      user: {
        displayName: authStore.user?.displayName || 'Unknown',
        email: authStore.user?.email || 'Unknown',
        username: authStore.user?.username || 'Unknown'
      },
      books: books.map(book => ({
        title: book.title,
        author: book.author,
        isbn: book.isbn || '',
        rating: book.rating,
        comments: book.comments || '',
        hasNote: book.hasNote,
        coverImageUrls: book.coverImageUrls || [],
        createdAt: book.createdAt,
        updatedAt: book.updatedAt
      })),
      exportInfo: {
        exportDate: new Date().toISOString(),
        totalBooks: books.length,
        format: 'JSON'
      }
    }
    
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `my-books-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
  } catch (error) {
    exportError.value = error instanceof Error ? error.message : 'Export failed'
  } finally {
    isExporting.value = false
  }
}

// Export to CSV
const exportToCSV = async () => {
  isExporting.value = true
  exportError.value = null
  
  try {
    const books = await getAllBooksForExport()
    
    // CSV headers
    const headers = [
      'Title',
      'Author', 
      'ISBN',
      'Rating',
      'Comments',
      'Has Notes',
      'Cover Image URLs',
      'Date Added',
      'Last Updated'
    ]
    
    // Convert books to CSV rows
    const rows = books.map(book => [
      `"${(book.title || '').replace(/"/g, '""')}"`,
      `"${(book.author || '').replace(/"/g, '""')}"`,
      `"${(book.isbn || '').replace(/"/g, '""')}"`,
      book.rating.toString(),
      `"${(book.comments || '').replace(/"/g, '""')}"`,
      book.hasNote ? 'Yes' : 'No',
      `"${(book.coverImageUrls || []).join('; ').replace(/"/g, '""')}"`,
      `"${new Date(book.createdAt).toLocaleDateString()}"`,
      `"${new Date(book.updatedAt).toLocaleDateString()}"`
    ])
    
    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `my-books-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
  } catch (error) {
    exportError.value = error instanceof Error ? error.message : 'Export failed'
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <section class="settings-page">
    <h1>Settings</h1>
    <div class="settings-content">
      <!-- Personal Information Section -->
      <div class="section-group">
        <div class="section-header">
          <h2>Profile</h2>
          <p class="section-description">Update your profile and preferences</p>
        </div>
        
        <!-- Display Name -->
        <label class="form-group">
          <div class="label-text">Display name</div>
          <input v-model="displayName" placeholder="Your name" class="text-input" />
        </label>
        
        <!-- Profile Picture -->
        <div class="form-group">
          <div class="label-text">Profile picture</div>
          <div class="avatar-container">
            <div class="avatar-preview">
              <img 
                :src="currentAvatar" 
                alt="Profile picture"
                class="avatar-image"
              />
              <div v-if="isUploading" class="upload-overlay">
                <div class="upload-spinner"></div>
              </div>
            </div>
            
            <div class="avatar-actions">
              <button @click="selectFile" class="upload-btn" :disabled="isUploading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {{ isUploading ? 'Uploading...' : 'Upload Photo' }}
              </button>
              
              <button 
                v-if="authStore.user?.avatar" 
                @click="removeAvatar" 
                class="remove-btn"
                :disabled="isUploading"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                </svg>
                Remove
              </button>
            </div>
            
            <input 
              ref="fileInput"
              type="file" 
              accept="image/*" 
              @change="handleFileSelect"
              class="file-input"
            />
            
            <p v-if="uploadError" class="error-message">{{ uploadError }}</p>
            <p class="upload-hint">JPG, PNG or GIF up to 5MB</p>
          </div>
        </div>
      </div>

      <!-- Preferences Section -->
      <div class="section-group">
        <div class="section-header">
          <h2>Theme</h2>
                      <p class="section-description">Choose light or dark theme</p>
        </div>
        
        <!-- Theme Setting -->
        <div class="toggle-group">
          <div class="toggle-content">
            <div class="toggle-title">Dark theme</div>
            <div class="toggle-description">Use dark colors throughout the app</div>
          </div>
          <button 
            @click="toggleTheme" 
            class="toggle-switch"
            :class="{ 'active': isDark }"
            type="button"
            :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
            :aria-pressed="isDark"
          >
            <div class="toggle-slider"></div>
          </button>
        </div>
      </div>

      <!-- Data & Privacy Section -->
      <div class="section-group">
        <div class="section-header">
          <h2>Export Data</h2>
                      <p class="section-description">Download your book data</p>
        </div>
        
        <!-- Data Export -->
        <div class="form-group">
          <div class="label-text">Export my data</div>
          <p class="help-text">Download your complete book collection and reading data</p>
          
          <div class="export-options">
            <div class="export-buttons">
              <button 
                @click="exportToJSON" 
                class="export-btn json-btn"
                :disabled="isExporting"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                {{ isExporting ? 'Exporting...' : 'Download JSON' }}
              </button>
              
              <button 
                @click="exportToCSV" 
                class="export-btn csv-btn"
                :disabled="isExporting"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                {{ isExporting ? 'Exporting...' : 'Download CSV' }}
              </button>
            </div>
            
            <div class="export-details">
              <p class="export-hint">
                <strong>JSON:</strong> Complete data with structure, ideal for backups<br>
                <strong>CSV:</strong> Spreadsheet format, ideal for analysis
              </p>
              
              <details class="export-info">
                <summary>What's included?</summary>
                <ul class="export-features">
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    All your books
                  </li>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    Ratings and reviews
                  </li>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                    Your notes
                  </li>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                    Cover images
                  </li>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Dates
                  </li>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Profile info
                  </li>
                </ul>
              </details>
            </div>
            
            <p v-if="exportError" class="export-error">{{ exportError }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.settings-page {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 24px;
}

.settings-page h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 24px;
}

.settings-content {
  max-width: 600px;
  display: grid;
  gap: 48px;
}

/* Section Groups */
.section-group {
  display: grid;
  gap: 24px;
}

.section-header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
}

.section-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.avatar-container {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.avatar-preview {
  position: relative;
  flex-shrink: 0;
}

.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-border);
  background: var(--color-background-secondary);
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-width: 200px;
}

.upload-btn, .remove-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-primary);
  cursor: pointer;
  min-height: 44px;
}

.upload-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.remove-btn {
  color: var(--color-danger);
  border-color: var(--color-danger-border);
  background: var(--color-danger-bg);
}

.remove-btn:hover:not(:disabled) {
  background: var(--color-danger);
  color: white;
  border-color: var(--color-danger);
}

.upload-btn:disabled, .remove-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.file-input {
  display: none;
}

.error-message {
  color: var(--color-danger);
  font-size: 14px;
  margin: 0;
}

.upload-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

/* Form Groups */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label-text {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
}

.text-input {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
}

.text-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Data Export */
.export-options {
  display: grid;
  gap: 16px;
}

.export-details {
  display: grid;
  gap: 12px;
}

.export-info {
  cursor: pointer;
}

.export-info summary {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  padding: 8px 0;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-info summary::-webkit-details-marker {
  display: none;
}

.export-info summary::before {
  content: '▶';
  transition: transform 0.2s ease;
  font-size: 10px;
  color: var(--color-text-muted);
}

.export-info[open] summary::before {
  transform: rotate(90deg);
}

.help-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.export-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-primary);
  cursor: pointer;
  min-height: 44px;
  min-width: 160px;
  justify-content: center;
}

.json-btn:hover:not(:disabled) {
  background: #059669;
  color: white;
  border-color: #059669;
}

.csv-btn:hover:not(:disabled) {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.export-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

.export-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 6px;
}

.export-features li {
  font-size: 14px;
  color: var(--color-text-secondary);
  padding-left: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-features li svg {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.export-error {
  color: var(--color-danger);
  font-size: 14px;
  margin: 12px 0 0 0;
  padding: 8px 12px;
  background: var(--color-danger-bg);
  border: 1px solid var(--color-danger-border);
  border-radius: 6px;
}

.export-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 12px 0 0 0;
  line-height: 1.5;
}

.settings-content label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.checkbox-label {
  display: flex;
  flex-direction: row !important;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.checkbox-content {
  flex: 1;
}

.checkbox-title {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
  margin-bottom: 2px;
}

.checkbox-description {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

/* Toggle Switch */
.toggle-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.toggle-content {
  flex: 1;
}

.toggle-title {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
  margin-bottom: 2px;
}

.toggle-description {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 22px;
  background: #d1d5db;
  border: 2px solid #9ca3af;
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.toggle-switch:hover {
  background: #9ca3af;
  border-color: #6b7280;
}

.toggle-switch.active {
  background: #3b82f6;
  border-color: #3b82f6;
}

.toggle-switch.active:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.toggle-switch:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(22px);
}

input[type="text"] {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
}

input[type="text"]:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
}

/* Mobile Styles */
@media (max-width: 768px) {
  .settings-page {
    padding: 16px;
  }
  
  .settings-page h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .settings-content {
    gap: 32px;
    max-width: 100%;
  }
  
  .section-group {
    gap: 20px;
  }
  
  .section-header {
    padding-bottom: 12px;
  }
  
  .section-header h2 {
    font-size: 18px;
  }
  
  .avatar-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }
  
  .avatar-actions {
    width: 100%;
    min-width: auto;
  }
  
  .export-buttons {
    flex-direction: column;
  }
  
  .export-btn {
    width: 100%;
    min-width: auto;
  }
  
  .text-input {
    padding: 10px 12px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .upload-btn, .remove-btn, .export-btn {
    padding: 14px 16px;
    font-size: 16px; /* Better touch target */
  }
  
  .toggle-group {
    gap: 12px;
  }
  
  .toggle-switch {
    width: 40px;
    height: 20px;
  }
  
  .toggle-slider {
    width: 16px;
    height: 16px;
  }
  
  .toggle-switch.active .toggle-slider {
    transform: translateX(20px);
  }
}
</style>


