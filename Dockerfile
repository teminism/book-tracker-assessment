# Use the official .NET 8.0 SDK image
FROM mcr.microsoft.com/dotnet/sdk:8.0.100 AS build

# Set working directory
WORKDIR /app

# Copy global.json first to set SDK version
COPY global.json ./

# Copy project files
COPY backend/backend.csproj ./backend/
COPY backend/BackendTests/BackendTests.csproj ./backend/BackendTests/

# Restore dependencies
RUN dotnet restore backend/backend.csproj

# Copy the rest of the source code
COPY backend/ ./backend/

# Build the application
RUN dotnet build backend/backend.csproj -c Release -o /app/build

# Publish the application
RUN dotnet publish backend/backend.csproj -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0.100 AS runtime

# Set working directory
WORKDIR /app

# Copy published app
COPY --from=build /app/publish .

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application
ENTRYPOINT ["dotnet", "backend.dll"]
