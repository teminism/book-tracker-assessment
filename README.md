# Book Tracker Application

A modern book tracking app built with Vue 3 and .NET 8. Keep track of your reading collection with ratings, notes, and insights.

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

### Prerequisites

You'll need:
- **Node.js** 20.19+ or 22.12+
- **.NET 8 SDK**
- **Git**

### Setup

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

- **Backend tests**: 22 tests covering models, validators, services, and repository operations
- **Frontend tests**: Component tests ensuring UI functionality
- **Integration tests**: API endpoint testing

To run all tests:
```bash
# Backend tests
cd backend/BackendTests
dotnet run

# Frontend tests
cd frontend
npm run test
```

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
