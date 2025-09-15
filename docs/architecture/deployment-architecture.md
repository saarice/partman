# Deployment Architecture

## Deployment Strategy

**Frontend Deployment:**
- **Platform**: Docker container with nginx serving static files
- **Build Command**: `npm run build:web`
- **Output Directory**: `apps/web/dist`
- **CDN/Edge**: nginx with gzip compression, future CloudFront/CDN integration

**Backend Deployment:**
- **Platform**: Docker container with Node.js runtime
- **Build Command**: `npm run build:api`
- **Deployment Method**: Rolling deployment with health checks

**Database Deployment:**
- **Platform**: PostgreSQL 15 with persistent volumes
- **Migration Strategy**: Automated migrations on deployment
- **Backup Strategy**: Daily automated backups with point-in-time recovery

## CI/CD Pipeline

```yaml
name: Build and Deploy Partnership Management Platform

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME_WEB: partnership-platform-web
  IMAGE_NAME_API: partnership-platform-api

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type checking
        run: npm run type-check

      - name: Run linting
        run: npm run lint

      - name: Run unit tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop')

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build applications
        run: npm run build

      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push frontend image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: infrastructure/docker/Dockerfile.frontend
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ github.repository }}/${{ env.IMAGE_NAME_WEB }}:latest
            ${{ env.REGISTRY }}/${{ github.repository }}/${{ env.IMAGE_NAME_WEB }}:${{ github.sha }}

      - name: Build and push backend image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: infrastructure/docker/Dockerfile.backend
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ github.repository }}/${{ env.IMAGE_NAME_API }}:latest
            ${{ env.REGISTRY }}/${{ github.repository }}/${{ env.IMAGE_NAME_API }}:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment..."
          # Add staging deployment logic here

      - name: Run integration tests
        run: |
          echo "Running integration tests against staging..."
          # Add integration test logic here

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production
        run: |
          echo "Deploying to production environment..."
          # Add production deployment logic here

      - name: Run smoke tests
        run: |
          echo "Running smoke tests against production..."
          # Add smoke test logic here
```

## Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:8000 | Local development and testing |
| Staging | https://staging.partnership-platform.com | https://api-staging.partnership-platform.com | Pre-production testing and QA |
| Production | https://partnership-platform.com | https://api.partnership-platform.com | Live customer environment |
