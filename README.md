# Book Tracker Application

A modern book tracking app built with Vue 3 and .NET 8. Keep track of your reading collection with ratings, notes, and insights.

## About My Choices

I made several key architectural decisions to optimise the development experience and code quality. I chose the Composition API for its superior TypeScript support and better code organisation. For the backend, I went with Minimal APIs for their simplicity and performance benefits.

I selected Pinia for state management as it's the official Vue state management solution with excellent TypeScript integration. Vite was my choice for the build tool due to its lightning-fast development server and modern ES modules approach. For testing, I chose xUnit for the backend and Vitest for the frontend, both offering excellent developer experience and comprehensive testing capabilities.

The backend uses in-memory storage for simplicity during development. I designed the architecture with dependency injection to make it easy to swap in a real database later. I also implemented comprehensive validation rules and proper error handling to ensure data integrity and good user experience.

## Sample Books

The application comes pre-loaded with 7 sample books to help you get started:

1. **To Kill a Mockingbird** by Harper Lee (5 stars)
2. **1984** by George Orwell (4 stars) 
3. **The Great Gatsby** by F. Scott Fitzgerald (3 stars)
4. **Pride and Prejudice** by Jane Austen (5 stars)
5. **The Catcher in the Rye** by J.D. Salinger (2 stars)
6. **Lord of the Flies** by William Golding (4 stars)
7. **The Hobbit** by J.R.R. Tolkien (unrated)

These books include realistic ratings, comments, and cover images from OpenLibrary. You can edit, delete, or add to this collection as needed.

## What it does

- Add, edit, and remove books from your collection
- Search through your books and sort them how you want
- See reading analytics and charts
- Manage your profile and preferences
- Switch between light and dark themes
- Works great on both mobile and desktop

## Built with

### Frontend
- Vue 3 with Composition API
- Vite
- Pinia for state management
- TypeScript for type safety

### Backend
- .NET 8 Minimal APIs
- C# for server-side logic
- In-memory storage (easy to swap for a database later)

## Getting Started

### 🚀 Quick Start (Live Demo)
The application is already deployed and ready to use! Visit the live application at [https://book-tracker-assessment.vercel.app](https://book-tracker-assessment.vercel.app) and use the demo credentials above.

### 🛠️ Local Development

#### Prerequisites

You'll need:
- **Node.js** 20.19+ or 22.12+
- **.NET 8 SDK**
- **Git**

#### Setup

1. **Clone and navigate to the project**
   ```bash
   git clone https://github.com/teminism/book-tracker-assessment.git
   cd book-tracker-assessment
   ```

2. **Start the backend**
   ```bash
   cd backend
   dotnet restore
   dotnet run
   ```
   The API will be running at `http://localhost:5099`

3. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

4. **Open your browser** and go to `http://localhost:5173`

## API Reference

The backend provides these endpoints:

- `GET /api/books` - Get all your books
- `GET /api/books/{id}` - Get a specific book
- `POST /api/books` - Add a new book
- `PUT /api/books/{id}` - Update a book
- `DELETE /api/books/{id}` - Remove a book

You can also use query parameters like `page`, `pageSize`, `search`, and `sortBy` to filter and paginate results.

## How to use the app

- Click the "+ Add Book" button to add new books to your collection
- Use the search bar to find specific books
- Sort your collection by different criteria
- Edit ratings and add personal notes to books
- Check out the analytics section to see your reading patterns
- Toggle between light and dark themes using the theme switcher

## Development

### Running the app locally

```bash
# Frontend development server
npm run dev

# Backend API server
dotnet run

# Run tests
dotnet test
```

The test suite covers API endpoints, input validation, and core business logic.

### Frontend testing

```bash
cd frontend
npm run test
```

Component tests ensure the UI works as expected.

## Building for production

### Frontend build

```bash
cd frontend
npm run build
```

The production files will be in the `dist/` folder.

### Backend build

```bash
cd backend
dotnet publish --configuration Release
```

The published application is ready to deploy.

## Testing

The project includes comprehensive testing:

- **Backend tests**: 2 API integration tests covering book retrieval and creation
- **Frontend tests**: 14 test files with 175 total tests covering components, stores, and utilities
- **Test coverage**: Component testing, state management, authentication, and UI interactions

### Backend Tests
```bash
cd backend
dotnet test
```

**Test Files:**
- `BooksApiTests.cs` - API integration tests for book endpoints

### Frontend Tests
```bash
cd frontend
npm run test
```

**Test Files (14 total):**
- **Components:** `AddBookModal.test.ts`, `EditBookModal.test.ts`, `LoginModal.test.ts`, `Modal.test.ts`, `RatingStars.test.ts`, `Sidebar.test.ts`, `ViewBookModal.test.ts`, `DeleteConfirmModal.test.ts`, `AuthGuard.test.ts`
- **Stores:** `books.test.ts`, `auth.test.ts`
- **Services:** `authService.test.ts`
- **Utilities:** `useTheme.test.ts`, `basic.test.ts`

**Test Results:** 170 passing tests, 5 failing tests (mostly related to mock data structure)

## 🌐 Live Application

**Frontend:** [https://book-tracker-assessment.vercel.app](https://book-tracker-assessment.vercel.app)  
**Backend API:** [https://book-tracker-assessment.onrender.com](https://book-tracker-assessment.onrender.com)

**Demo Credentials:**
- Username: `demo` | Password: `demo123`
- Username: `admin` | Password: `admin123`

## Project structure

```
book-tracker-assessment/
├── backend/                 # .NET 8 API
│   ├── Models/             # Data models
│   ├── Services/           # Business logic
│   ├── Validators/         # Input validation
│   ├── Endpoints/          # API endpoints
│   └── BackendTests/       # Comprehensive test suite
├── frontend/               # Vue 3 application
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── stores/         # Pinia state management
│   │   └── services/       # API communication
│   └── tests/              # Frontend tests
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is for assessment purposes.

## Need help?

If you run into issues or have questions, check the documentation or create an issue in the repository.
