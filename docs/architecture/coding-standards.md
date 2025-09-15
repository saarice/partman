# Coding Standards

## Critical Fullstack Rules

- **Configuration-First Development**: All business logic must check configuration before applying hardcoded defaults - enables multi-tenant customization
- **Organization Context Isolation**: Every database query must include organization filtering - prevents tenant data leakage
- **Type Sharing**: Always define types in packages/shared and import from there - ensures consistency between frontend and backend
- **API Error Handling**: All API routes must use the standard error handler with proper HTTP status codes and error formatting
- **State Management**: Never mutate state directly - use proper Zustand patterns with immutable updates
- **Authentication Required**: All protected routes must validate JWT tokens and set organization context
- **Input Validation**: All API inputs must be validated using Joi schemas - prevents security vulnerabilities
- **Audit Trail**: All configuration changes must be logged with user attribution and timestamp
- **Cache Invalidation**: Configuration updates must invalidate related Redis cache entries
- **Database Migrations**: All schema changes must be applied through versioned migrations

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `ConfigurationPanel.tsx` |
| Hooks | camelCase with 'use' | - | `useConfiguration.ts` |
| API Routes | - | kebab-case | `/api/v1/partner-configurations` |
| Database Tables | - | snake_case | `partner_configurations` |
| Configuration Keys | - | snake_case | `default_referral_commission_rate` |
| Service Methods | camelCase | camelCase | `calculateCommission()` |
| Environment Variables | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `DATABASE_URL` |
