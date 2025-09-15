# Technical Requirements Integration

## System Architecture Overview

**Container Strategy:**
```yaml
Services:
  - Frontend: React SPA (Port 3000)
  - Backend: Node.js/Express API (Port 8000)
  - Database: PostgreSQL 15 (Port 5432)
  - Cache: Redis 7 (Port 6379)
  - Proxy: nginx reverse proxy (Port 80/443)
```

**Technology Stack:**
- **Frontend**: React 18, Material-UI 5, React Query, WebSocket client
- **Backend**: Node.js 18, Express 4, JWT authentication, WebSocket server
- **Database**: PostgreSQL 15 with JSON support, Redis for sessions/cache
- **Infrastructure**: Docker Compose, nginx, SSL/TLS termination

## Database Schema Integration

**Core Tables:**
1. `users` - Team member authentication and roles
2. `isv_partners` - Partner information and relationship health
3. `commission_structures` - Complex commission calculation rules
4. `opportunities` - Pipeline tracking with stage management
5. `opportunity_stage_history` - Audit trail for pipeline changes
6. `weekly_status` - Team status submissions and KPI tracking
7. `tasks` - Task management with rollover logic
8. `quarterly_goals` - Goal setting and progress tracking
9. `alerts` - Notification system for proactive management

**Performance Optimization:**
- Strategic indexes on query patterns (partner_id, stage, user_id)
- Connection pooling for database efficiency
- Redis caching for dashboard aggregations
- Query optimization with EXPLAIN ANALYZE monitoring

## API Architecture Integration

**RESTful Design:**
- Base URL: `http://localhost:8000/api/v1`
- JWT-based authentication with role-based access control
- Consistent response format with error handling
- API versioning for future evolution
- Rate limiting and request validation

**Key Endpoint Categories:**
1. Authentication (`/auth/*`) - Login, logout, token refresh
2. Partners (`/partners/*`) - Partner CRUD and commission management
3. Opportunities (`/opportunities/*`) - Pipeline management and forecasting
4. Status (`/status/*`) - Weekly submissions and team aggregation
5. Dashboard (`/dashboard/*`) - KPI aggregation and real-time metrics

## Security Implementation

**Authentication & Authorization:**
- JWT tokens with HS256 signing and 24-hour expiration
- Role-based permissions (VP, Sales Manager, Partnership Manager)
- Session management with Redis storage
- Password hashing with bcrypt (12 rounds)

**Data Protection:**
- HTTPS enforcement with TLS 1.3
- Input validation with Joi schema validation
- SQL injection prevention with parameterized queries
- XSS protection with output encoding
- CORS configuration for controlled access

## Performance Requirements

**Response Time Targets:**
- Dashboard load: <2 seconds (95th percentile)
- API responses: <500ms average
- Database queries: <100ms average
- Real-time updates: <200ms WebSocket latency

**Scalability Planning:**
- Support for 5-10 concurrent users (MVP)
- Database connection pooling (max 20 connections)
- Redis caching for frequent queries
- Horizontal scaling path with load balancer ready

---
