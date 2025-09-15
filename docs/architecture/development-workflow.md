# Development Workflow

## Local Development Setup

### Prerequisites
```bash
# Install required tools
node -v  # 18.17.0 or higher
npm -v   # 9.0.0 or higher
docker --version  # 20.10.0 or higher
docker-compose --version  # 2.0.0 or higher

# Install PostgreSQL client tools (optional, for direct DB access)
psql --version  # 15.0 or higher
```

### Initial Setup
```bash
# Clone and setup the repository
git clone <repository-url> partnership-management-platform
cd partnership-management-platform

# Install all dependencies using npm workspaces
npm install

# Copy environment configuration
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Start the development environment
npm run dev:docker
```

### Development Commands
```bash
# Start all services with Docker
npm run dev:docker

# Start individual services for development
npm run dev:web        # Frontend only (port 3000)
npm run dev:api        # Backend only (port 8000)
npm run dev:db         # Database and Redis only

# Build commands
npm run build          # Build all applications
npm run build:web      # Build frontend only
npm run build:api      # Build backend only

# Testing commands
npm run test           # Run all tests
npm run test:web       # Frontend tests only
npm run test:api       # Backend tests only
npm run test:e2e       # End-to-end tests
npm run test:coverage  # Coverage report

# Database commands
npm run migrate        # Run database migrations
npm run migrate:rollback  # Rollback last migration
npm run seed           # Seed development data

# Linting and formatting
npm run lint           # Lint all code
npm run format         # Format all code
npm run type-check     # TypeScript type checking
```

## Environment Configuration

### Required Environment Variables

```bash
# Frontend (.env.local)
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_WS_URL=ws://localhost:8000
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0

# Backend (.env)
NODE_ENV=development
PORT=8000
API_VERSION=v1

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/partnership_platform
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=partnership_platform
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_SSL=false
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
SESSION_TTL=86400
BCRYPT_ROUNDS=12

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=debug
LOG_FORMAT=combined

# Shared
NODE_ENV=development
TZ=UTC
```
