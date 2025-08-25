<script setup lang="ts">
import { Bar, Doughnut, Line } from 'vue-chartjs'
import { 
  Chart, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Legend, 
  Tooltip,
  ArcElement,
  PointElement,
  LineElement,
  Title
} from 'chart.js'
import { computed, onMounted } from 'vue'
import { useBooksStore } from '../stores/books'

Chart.register(
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Legend, 
  Tooltip,
  ArcElement,
  PointElement,
  LineElement,
  Title
)

const store = useBooksStore()

// Fetch all books for analytics when component mounts
onMounted(async () => {
  try {
    await store.fetchAllBooks()
  } catch (error) {
          console.error('Error loading analytics:', error)
  }
})

// Rating Distribution Chart
const ratingChartData = computed(() => {
  const buckets = new Map<number, number>([[1,0],[2,0],[3,0],[4,0],[5,0]])
  for (const b of store.allBooks) buckets.set(b.rating, (buckets.get(b.rating) || 0) + 1)
  return {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [{ 
      label: 'Books', 
      backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'],
      data: [1,2,3,4,5].map(n => buckets.get(n) || 0) 
    }]
  }
})

// Author Popularity Chart
const authorChartData = computed(() => {
  const authorCount = new Map<string, number>()
  for (const book of store.allBooks) {
    authorCount.set(book.author, (authorCount.get(book.author) || 0) + 1)
  }
  
  const sortedAuthors = Array.from(authorCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  
  return {
    labels: sortedAuthors.map(([author]) => author),
    datasets: [{
      label: 'Books by Author',
      backgroundColor: '#8b5cf6',
      data: sortedAuthors.map(([, count]) => count)
    }]
  }
})

// Books Added Over Time Chart
const timeChartData = computed(() => {
  const weeklyData = new Map<string, number>()
  const now = new Date()
  
  // Initialize last 8 weeks
  for (let i = 7; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000))
    const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)}`
    weeklyData.set(weekKey, 0)
  }
  
  // Count books by week
  for (const book of store.allBooks) {
    const bookDate = new Date(book.createdAt)
    const weekKey = `${bookDate.getFullYear()}-W${Math.ceil((bookDate.getDate() + new Date(bookDate.getFullYear(), bookDate.getMonth(), 1).getDay()) / 7)}`
    if (weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + 1)
    }
  }
  
  const sortedWeeks = Array.from(weeklyData.entries()).sort()
  
  return {
    labels: sortedWeeks.map(([week]) => `Week ${week.split('-W')[1]}`),
    datasets: [{
      label: 'Books Added',
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      data: sortedWeeks.map(([, count]) => count),
      tension: 0.4
    }]
  }
})

// Genre Distribution (based on ratings)
const genreChartData = computed(() => {
  const genreStats = {
    'Fiction': { count: 0, avgRating: 0 },
    'Non-Fiction': { count: 0, avgRating: 0 },
    'Classics': { count: 0, avgRating: 0 },
    'Science Fiction': { count: 0, avgRating: 0 }
  }
  
  // Simple genre classification based on book titles/authors
  for (const book of store.allBooks) {
    if (book.title.includes('1984') || book.title.includes('Brave New World') || book.title.includes('Handmaid')) {
      genreStats['Science Fiction'].count++
      genreStats['Science Fiction'].avgRating += book.rating
    } else if (book.author.includes('Tolkien') || book.title.includes('Dune')) {
      genreStats['Science Fiction'].count++
      genreStats['Science Fiction'].avgRating += book.rating
    } else if (book.author.includes('Austen') || book.author.includes('Dickens') || book.author.includes('Dostoevsky')) {
      genreStats['Classics'].count++
      genreStats['Classics'].avgRating += book.rating
    } else {
      genreStats['Fiction'].count++
      genreStats['Fiction'].avgRating += book.rating
    }
  }
  
  // Calculate averages
  Object.values(genreStats).forEach(genre => {
    if (genre.count > 0) {
      genre.avgRating = genre.avgRating / genre.count
    }
  })
  
  const labels = Object.keys(genreStats).filter(genre => genreStats[genre as keyof typeof genreStats].count > 0)
  const data = labels.map(genre => genreStats[genre as keyof typeof genreStats].count)
  
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: ['#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  }
})

// Chart options
const barOptions = { 
  responsive: true, 
  plugins: { 
    legend: { display: false },
    title: { display: true, text: 'Rating Distribution' }
  },
  scales: {
    y: { beginAtZero: true }
  }
}

const lineOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Books Added Over Time' }
  },
  scales: {
    y: { beginAtZero: true }
  }
}

const doughnutOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' as const },
    title: { display: true, text: 'Genre Distribution' }
  }
}

// Computed insights
const insights = computed(() => {
  const books = store.allBooks
  const totalBooks = books.length
  const avgRating = totalBooks > 0 ? books.reduce((sum, book) => sum + book.rating, 0) / totalBooks : 0
  const booksWithNotes = books.filter(book => book.hasNote).length
  const topAuthor = Array.from(new Map(books.map(book => [book.author, books.filter(b => b.author === book.author).length])).entries())
    .sort((a, b) => b[1] - a[1])[0]
  const recentBooks = books.filter(book => {
    const bookDate = new Date(book.createdAt)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return bookDate > weekAgo
  }).length
  
  return {
    totalBooks,
    avgRating: avgRating.toFixed(1),
    booksWithNotes,
    notesPercentage: ((booksWithNotes / totalBooks) * 100).toFixed(0),
    topAuthor: topAuthor ? `${topAuthor[0]} (${topAuthor[1]} books)` : 'N/A',
    recentBooks
  }
})
</script>

<template>
  <section class="analytics">
    <h1>Analytics</h1>
    
    <!-- Loading State -->
    <div v-if="store.analyticsLoading" class="loading-state" role="status" aria-live="polite">
      <div class="loading-spinner"></div>
      <p>Loading analytics data...</p>
    </div>
    
    <!-- Analytics Content -->
    <div v-else-if="store.allBooks.length > 0">
      <!-- Key Metrics -->
      <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ insights.totalBooks }}</div>
          <div class="stat-label">Total Books</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ insights.avgRating }}</div>
          <div class="stat-label">Average Rating</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ insights.notesPercentage }}%</div>
          <div class="stat-label">Books with Notes</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ insights.recentBooks }}</div>
          <div class="stat-label">Added This Week</div>
        </div>
      </div>
    </div>

    <!-- Insights Section -->
    <div class="insights-section">
      <h2>Reading Insights</h2>
      <div class="insights-grid">
        <div class="insight-card">
          <h3>Most Popular Author</h3>
          <p class="insight-value">{{ insights.topAuthor }}</p>
        </div>
        
        <div class="insight-card">
          <h3>Reading Activity</h3>
          <p class="insight-value">{{ insights.recentBooks > 0 ? 'Active reader' : 'Time to pick up a book!' }}</p>
        </div>
        
        <div class="insight-card">
                <h3>Notes</h3>
      <p class="insight-value">{{ insights.booksWithNotes }} of {{ insights.totalBooks }} books have notes</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <h2>Visual Analytics</h2>
      
      <div class="charts-grid">
        <!-- Rating Distribution -->
        <div class="chart-container">
          <Bar :options="barOptions" :data="ratingChartData" />
        </div>
        
        <!-- Author Popularity -->
        <div class="chart-container">
          <Bar 
            :options="{ 
              ...barOptions, 
              plugins: { 
                ...barOptions.plugins, 
                title: { display: true, text: 'Most Popular Authors' } 
              } 
            }" 
            :data="authorChartData" 
          />
        </div>
        
        <!-- Books Over Time -->
        <div class="chart-container">
          <Line :options="lineOptions" :data="timeChartData" />
        </div>
        
        <!-- Genre Distribution -->
        <div class="chart-container">
          <Doughnut :options="doughnutOptions" :data="genreChartData" />
        </div>
      </div>
    </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      </div>
      <h2>No Analytics Data Available</h2>
      <p>Add some books to your collection to see analytics and insights.</p>
    </div>
  </section>
</template>

<style scoped>
.analytics {
  max-width: 1200px;
}

.analytics h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 1.5rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
  color: var(--color-text-muted);
}

.empty-icon svg {
  flex-shrink: 0;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--color-text-secondary);
  font-size: 1rem;
}

.analytics h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-secondary);
  border-radius: 12px;
  color: var(--color-primary);
}

.stat-icon svg {
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

/* Insights Section */
.insights-section {
  margin-bottom: 2rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.insight-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.insight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.insight-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.insight-value {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Charts Section */
.charts-section {
  margin-bottom: 2rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.chart-container {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .analytics {
    max-width: 100%;
  }
  
  .analytics h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .analytics h2 {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  .insights-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
  }
  
  .stat-icon svg {
    width: 20px;
    height: 20px;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
  }
  
  .insight-card {
    padding: 1rem;
  }
  
  .insight-card h3 {
    font-size: 0.9rem;
  }
  
  .insight-value {
    font-size: 1rem;
  }
  
  .chart-container {
    padding: 1rem;
    min-height: 250px;
  }
}
</style>


