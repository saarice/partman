# ISV Pipeline Tracker MVP - Technical Architecture

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Database Schema Design](#database-schema-design)
3. [API Architecture](#api-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Security Considerations](#security-considerations)
6. [Scalability Planning](#scalability-planning)
7. [Development Environment Setup](#development-environment-setup)
8. [Deployment Strategy](#deployment-strategy)
9. [Implementation Recommendations](#implementation-recommendations)

## System Architecture Overview

### High-Level Architecture

The ISV Pipeline Tracker MVP follows a containerized three-tier architecture optimized for local Docker deployment with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (nginx)                   │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐│
│  │   React SPA     │  │   Dashboard     │  │    Admin     ││
│  │   (Port 3000)   │  │   Components    │  │   Portal     ││
│  └─────────────────┘  └─────────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐│
│  │   REST API      │  │   Business      │  │   Auth       ││
│  │   (Port 8000)   │  │   Logic         │  │   Service    ││
│  │                 │  │   Services      │  │              ││
│  └─────────────────┘  └─────────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐│
│  │   PostgreSQL    │  │     Redis       │  │   File       ││
│  │   (Port 5432)   │  │   (Port 6379)   │  │   Storage    ││
│  │   Primary DB    │  │   Cache/Session │  │   (Volumes)  ││
│  └─────────────────┘  └─────────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Container Strategy

**Frontend Container (React)**
- Base Image: `node:18-alpine`
- Development: Hot reload enabled
- Production: Multi-stage build with nginx serving static files
- Port: 3000 (dev), 80 (prod)

**Backend Container (Node.js/Express)**
- Base Image: `node:18-alpine`
- RESTful API with business logic
- JWT-based authentication
- Port: 8000

**Database Container (PostgreSQL)**
- Base Image: `postgres:15-alpine`
- Persistent data volumes
- Port: 5432

**Cache Container (Redis)**
- Base Image: `redis:7-alpine`
- Session storage and caching
- Port: 6379

**Reverse Proxy (nginx)**
- Base Image: `nginx:alpine`
- Route distribution and SSL termination
- Port: 80/443

## Database Schema Design

### Core Entity Relationships

```sql
-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('vp', 'sales_manager', 'partnership_manager', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ISV Partners
CREATE TABLE isv_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL, -- FinOps, Security, Observability, DevOps, Data/Backup
    website VARCHAR(500),
    primary_contact_email VARCHAR(255),
    primary_contact_name VARCHAR(255),
    relationship_health VARCHAR(50) DEFAULT 'healthy' CHECK (relationship_health IN ('excellent', 'healthy', 'needs_attention', 'at_risk')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commission Structures
CREATE TABLE commission_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES isv_partners(id) ON DELETE CASCADE,
    structure_type VARCHAR(50) NOT NULL CHECK (structure_type IN ('referral', 'msp', 'reseller')),
    commission_percentage DECIMAL(5,2) NOT NULL CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
    is_lifetime BOOLEAN DEFAULT false,
    min_deal_size DECIMAL(12,2) DEFAULT 0,
    max_deal_size DECIMAL(12,2),
    effective_from DATE NOT NULL,
    effective_to DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pipeline Opportunities
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES isv_partners(id) ON DELETE CASCADE,
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_contact_email VARCHAR(255),
    deal_value DECIMAL(12,2) NOT NULL,
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('lead', 'demo', 'poc', 'proposal', 'closed_won', 'closed_lost')),
    probability DECIMAL(5,2) DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    actual_close_date DATE,
    commission_structure_id UUID REFERENCES commission_structures(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stage History Tracking
CREATE TABLE opportunity_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    from_stage VARCHAR(50),
    to_stage VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Weekly Status Updates
CREATE TABLE weekly_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    accomplishments TEXT,
    upcoming_tasks TEXT,
    blockers TEXT,
    kpi_metrics JSONB, -- Flexible structure for various KPIs
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_start_date)
);

-- Tasks and Rollover Management
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date DATE,
    completed_date DATE,
    rolled_over_from UUID REFERENCES tasks(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quarterly Goals
CREATE TABLE quarterly_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quarter INT NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
    year INT NOT NULL,
    revenue_target DECIMAL(12,2) NOT NULL,
    current_progress DECIMAL(12,2) DEFAULT 0,
    goal_type VARCHAR(50) DEFAULT 'revenue' CHECK (goal_type IN ('revenue', 'opportunities', 'partnerships')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, quarter, year, goal_type)
);

-- Alerts and Notifications
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('opportunity_due', 'relationship_maintenance', 'goal_milestone', 'task_overdue')),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('opportunity', 'partner', 'task', 'goal')),
    entity_id UUID NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_opportunities_partner_stage ON opportunities(partner_id, stage);
CREATE INDEX idx_opportunities_assigned_user ON opportunities(assigned_user_id);
CREATE INDEX idx_opportunities_close_date ON opportunities(expected_close_date);
CREATE INDEX idx_stage_history_opportunity ON opportunity_stage_history(opportunity_id);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_alerts_user_read ON alerts(user_id, is_read);
CREATE INDEX idx_weekly_status_user_date ON weekly_status(user_id, week_start_date);
```

### Database Design Principles

1. **UUID Primary Keys**: Future-proof for distributed systems
2. **Audit Trails**: `created_at` and `updated_at` on core entities
3. **Flexible JSON Storage**: JSONB for KPI metrics allowing schema evolution
4. **Referential Integrity**: Foreign keys with appropriate cascade rules
5. **Performance Optimization**: Strategic indexes on query patterns
6. **Data Validation**: CHECK constraints for data integrity

## API Architecture

### RESTful Endpoint Structure

**Base URL**: `http://localhost:8000/api/v1`

#### Authentication Endpoints
```
POST   /auth/login           # JWT token generation
POST   /auth/refresh         # Token refresh
POST   /auth/logout          # Token invalidation
GET    /auth/me             # Current user info
```

#### User Management
```
GET    /users               # List all users (admin only)
GET    /users/{id}          # Get user details
PUT    /users/{id}          # Update user
POST   /users               # Create user (admin only)
DELETE /users/{id}          # Deactivate user (admin only)
```

#### ISV Partners
```
GET    /partners            # List partners (with filtering)
POST   /partners            # Create partner
GET    /partners/{id}       # Get partner details
PUT    /partners/{id}       # Update partner
DELETE /partners/{id}       # Delete partner
GET    /partners/{id}/opportunities    # Partner opportunities
GET    /partners/{id}/commissions     # Commission history
```

#### Commission Structures
```
GET    /partners/{partnerId}/commissions        # List commission structures
POST   /partners/{partnerId}/commissions        # Create commission structure
PUT    /commissions/{id}                        # Update commission structure
DELETE /commissions/{id}                        # Delete commission structure
POST   /commissions/calculate                   # Calculate commission for deal
```

#### Opportunities (Pipeline)
```
GET    /opportunities                    # List opportunities (with filtering)
POST   /opportunities                    # Create opportunity
GET    /opportunities/{id}               # Get opportunity details
PUT    /opportunities/{id}               # Update opportunity
DELETE /opportunities/{id}               # Delete opportunity
POST   /opportunities/{id}/stage         # Update opportunity stage
GET    /opportunities/{id}/history       # Stage change history
GET    /opportunities/pipeline           # Pipeline summary/metrics
```

#### Weekly Status
```
GET    /status/weeks                     # List status weeks for user
POST   /status/weeks                     # Submit weekly status
GET    /status/weeks/{weekStart}         # Get specific week status
PUT    /status/weeks/{weekStart}         # Update week status
GET    /status/team/{weekStart}          # Team status for week (managers)
```

#### Tasks
```
GET    /tasks                           # List user tasks
POST   /tasks                           # Create task
GET    /tasks/{id}                      # Get task details
PUT    /tasks/{id}                      # Update task
DELETE /tasks/{id}                      # Delete task
POST   /tasks/rollover                  # Rollover incomplete tasks
```

#### Goals & KPIs
```
GET    /goals                           # List user goals
POST   /goals                           # Create goal
PUT    /goals/{id}                      # Update goal progress
GET    /goals/team                      # Team goals (managers)
GET    /dashboard/kpis                  # Executive KPI dashboard
GET    /dashboard/pipeline              # Pipeline dashboard
```

#### Alerts
```
GET    /alerts                          # List user alerts
PUT    /alerts/{id}/read                # Mark alert as read
POST   /alerts/bulk/read                # Mark multiple as read
DELETE /alerts/{id}                     # Delete alert
```

### API Response Format

**Success Response**:
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2025-09-14T10:30:00Z",
    "version": "1.0.0"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "meta": {
    "timestamp": "2025-09-14T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### API Security & Middleware

1. **JWT Authentication**: Stateless token-based auth
2. **Role-based Authorization**: VP, Manager, and User roles
3. **Rate Limiting**: Prevent API abuse
4. **Request Validation**: Schema validation with Joi/Yup
5. **CORS Configuration**: Controlled cross-origin access
6. **API Versioning**: URL-based versioning for evolution

## Frontend Architecture

### React Component Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   ├── UI/
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── Form/
│   │   │   └── DataTable/
│   │   └── Charts/
│   │       ├── PipelineChart.jsx
│   │       ├── RevenueChart.jsx
│   │       └── KPICard.jsx
│   ├── dashboard/
│   │   ├── ExecutiveDashboard.jsx
│   │   ├── PipelineDashboard.jsx
│   │   ├── TeamDashboard.jsx
│   │   └── KPIOverview.jsx
│   ├── partners/
│   │   ├── PartnerList.jsx
│   │   ├── PartnerDetail.jsx
│   │   ├── PartnerForm.jsx
│   │   └── CommissionCalculator.jsx
│   ├── opportunities/
│   │   ├── OpportunityList.jsx
│   │   ├── OpportunityDetail.jsx
│   │   ├── OpportunityForm.jsx
│   │   ├── PipelineView.jsx
│   │   └── StageHistory.jsx
│   ├── status/
│   │   ├── WeeklyStatusForm.jsx
│   │   ├── StatusHistory.jsx
│   │   └── TeamStatus.jsx
│   ├── tasks/
│   │   ├── TaskList.jsx
│   │   ├── TaskForm.jsx
│   │   └── TaskRollover.jsx
│   └── auth/
│       ├── LoginForm.jsx
│       └── ProtectedRoute.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useApi.js
│   ├── useDashboard.js
│   └── useWebSocket.js
├── services/
│   ├── api.js
│   ├── auth.js
│   ├── websocket.js
│   └── utils.js
├── contexts/
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── AlertContext.jsx
├── styles/
│   ├── theme.js
│   ├── globals.css
│   └── components.css
└── utils/
    ├── constants.js
    ├── helpers.js
    └── validation.js
```

### State Management Strategy

**Context API + Custom Hooks**:
- **AuthContext**: User authentication and authorization state
- **AlertContext**: Global notification/alert system
- **ThemeContext**: UI theme and preferences

**Local State**: Component-specific state with useState/useReducer
**Server State**: React Query for API data fetching and caching

### Key Frontend Features

1. **Executive Dashboard**:
   - Real-time KPI cards (revenue, pipeline, goals)
   - Interactive pipeline funnel chart
   - Team performance overview
   - Alert notifications center

2. **Pipeline Management**:
   - Kanban-style opportunity board
   - Drag-and-drop stage progression
   - Opportunity detail modals
   - Commission calculator integration

3. **Weekly Status Interface**:
   - Simple form with accomplishments/tasks/blockers
   - Auto-save functionality
   - Task rollover management
   - Team status aggregation view

4. **Partner Management**:
   - Partner directory with health indicators
   - Commission structure configuration
   - Relationship maintenance alerts
   - Performance analytics per partner

### UI/UX Principles

- **Clean, Minimalist Design**: VP executive focus
- **Mobile-Responsive**: Tablet and desktop optimization
- **Real-time Updates**: WebSocket for live dashboard updates
- **Accessibility**: WCAG 2.1 compliance
- **Performance**: Code splitting and lazy loading

## Security Considerations

### Authentication & Authorization

**JWT Token Strategy**:
```javascript
// Token Structure
{
  "sub": "user-uuid",
  "role": "vp|sales_manager|partnership_manager",
  "exp": 1640995200,
  "iat": 1640908800,
  "permissions": ["read:all", "write:opportunities", "admin:users"]
}
```

**Role-Based Access Control (RBAC)**:
- **VP**: Full system access, team oversight, admin functions
- **Sales Manager**: Opportunities, partners, own status/tasks
- **Partnership Manager**: Limited to assigned partners and opportunities
- **Admin**: User management, system configuration

### Data Protection

1. **Encryption**:
   - JWT tokens with HS256 signing
   - bcrypt for password hashing (12 rounds)
   - TLS 1.3 for data in transit
   - Environment variable secrets management

2. **Input Validation**:
   - Frontend: React Hook Form with Yup validation
   - Backend: Joi schema validation
   - SQL injection prevention with parameterized queries
   - XSS protection with output encoding

3. **Session Management**:
   - Redis-based session storage
   - Token refresh rotation
   - Automatic logout on inactivity
   - Concurrent session limits

### Network Security

```nginx
# nginx Security Headers
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
```

### Audit & Compliance

- **Activity Logging**: User actions, data changes, logins
- **Data Retention**: Configurable retention policies
- **Backup Strategy**: Automated daily PostgreSQL backups
- **GDPR Compliance**: Data export/deletion capabilities

## Scalability Planning

### Performance Optimization

**Database Level**:
- Connection pooling (pg-pool)
- Query optimization with EXPLAIN ANALYZE
- Strategic indexing on query patterns
- Read replicas for reporting (future)

**Application Level**:
- Redis caching for frequent queries
- API response compression
- Database query optimization
- Asynchronous processing for heavy operations

**Frontend Level**:
- Code splitting and lazy loading
- CDN for static assets (future)
- Service worker for offline capability
- Virtual scrolling for large lists

### Horizontal Scaling Path

**Phase 1 (Current MVP)**:
- Single Docker deployment
- Monolithic architecture
- Local PostgreSQL/Redis

**Phase 2 (Growth)**:
- Multi-container scaling
- Load balancer introduction
- External managed databases
- Microservices extraction

**Phase 3 (Enterprise)**:
- Kubernetes orchestration
- Service mesh (Istio)
- Auto-scaling policies
- Multi-region deployment

### Monitoring & Observability

```yaml
# Monitoring Stack
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"

  node-exporter:
    image: prom/node-exporter
    ports:
      - "9100:9100"
```

**Key Metrics**:
- API response times and error rates
- Database connection pool usage
- Redis cache hit/miss ratios
- User session metrics
- Pipeline conversion rates

## Development Environment Setup

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: isv_pipeline_tracker
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-development}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-development}@postgres:5432/isv_pipeline_tracker
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET:-dev-secret-key}
      PORT: 8000
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:8000/api/v1
      REACT_APP_WS_URL: ws://localhost:8000
      CHOKIDAR_USEPOLLING: true
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      backend:
        condition: service_healthy

  # Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/dev.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  redis_data:
```

### Environment Configuration

**.env.development**:
```env
# Database
DB_USER=postgres
DB_PASSWORD=development
DATABASE_URL=postgresql://postgres:development@localhost:5432/isv_pipeline_tracker

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# API
API_PORT=8000
API_RATE_LIMIT=1000

# Frontend
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_WS_URL=ws://localhost:8000

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json
```

### Development Workflow

```bash
# Initial Setup
git clone <repository>
cd isv-pipeline-tracker
cp .env.example .env.development

# Start Development Environment
docker-compose -f docker-compose.dev.yml up -d

# Database Setup
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed

# Development Commands
docker-compose exec backend npm run test        # Backend tests
docker-compose exec frontend npm run test       # Frontend tests
docker-compose exec backend npm run lint        # Code linting
docker-compose logs -f backend                  # View logs

# Database Management
docker-compose exec postgres psql -U postgres isv_pipeline_tracker
docker-compose exec backend npm run db:reset    # Reset database
```

## Deployment Strategy

### Production Docker Setup

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - internal

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_prod:/data
    networks:
      - internal

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    volumes:
      - ./logs:/app/logs
    networks:
      - internal
      - external
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    networks:
      - external

  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/ssl/certs:ro
      - ./logs/nginx:/var/log/nginx
    networks:
      - external
    depends_on:
      - frontend
      - backend

networks:
  internal:
    driver: bridge
  external:
    driver: bridge

volumes:
  postgres_prod:
  redis_prod:
```

### Deployment Automation

```bash
#!/bin/bash
# deploy.sh

set -e

echo "Starting ISV Pipeline Tracker deployment..."

# Environment setup
source .env.production

# Database backup
docker-compose exec postgres pg_dump -U $DB_USER $DB_NAME > "backups/backup-$(date +%Y%m%d-%H%M%S).sql"

# Pull latest changes
git pull origin main

# Build and deploy
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate

# Health check
echo "Waiting for services to be ready..."
sleep 30

# Verify deployment
curl -f http://localhost/api/v1/health || exit 1
echo "Deployment successful!"

# Cleanup old images
docker image prune -f
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database backup
docker-compose exec postgres pg_dump -U postgres isv_pipeline_tracker | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Redis backup
docker-compose exec redis redis-cli BGSAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb "$BACKUP_DIR/redis_backup_$DATE.rdb"

# File system backup
tar -czf "$BACKUP_DIR/files_backup_$DATE.tar.gz" ./uploads

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Monitoring Setup

```yaml
# monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/dashboards:/etc/grafana/provisioning/dashboards

  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml

volumes:
  prometheus_data:
  grafana_data:
```

## Implementation Recommendations

### Phase 1 (Weeks 1-2): Foundation
1. **Environment Setup**:
   - Docker development environment
   - Database schema implementation
   - Basic API structure with authentication

2. **Core MVP Features**:
   - User management and authentication
   - Partner CRUD operations
   - Basic opportunity tracking

### Phase 2 (Weeks 3-4): Core Functionality
1. **Pipeline Management**:
   - Complete opportunity lifecycle
   - Stage progression tracking
   - Commission calculation engine

2. **Dashboard Development**:
   - Executive KPI dashboard
   - Basic reporting capabilities
   - Alert system implementation

### Phase 3 (Weeks 5-6): User Experience
1. **Frontend Polish**:
   - React components completion
   - Real-time updates via WebSocket
   - Mobile responsiveness

2. **Weekly Status Integration**:
   - Status submission interface
   - Task management and rollover
   - Team aggregation views

### Development Team Structure

**Recommended Team**:
- **Full-Stack Developer (1)**: Primary implementation
- **VP Strategic Partnerships**: Requirements validation, UAT
- **DevOps Consultant (Optional)**: Production deployment guidance

### Technology Stack Decisions

**Backend**: Node.js + Express
- Rapid development for MVP
- Large ecosystem and community
- Easy Docker containerization
- Strong PostgreSQL integration

**Frontend**: React + Material-UI
- Component-based architecture
- Rich ecosystem for business dashboards
- Excellent TypeScript support
- Strong performance optimization tools

**Database**: PostgreSQL + Redis
- ACID compliance for financial data
- JSON support for flexible schemas
- Mature backup and scaling options
- Redis for session management and caching

### Quality Assurance Strategy

```javascript
// Backend Testing Strategy
// Unit Tests: Jest + Supertest
// Integration Tests: Database testing with test containers
// E2E Tests: API endpoint testing

// Frontend Testing Strategy
// Unit Tests: Jest + React Testing Library
// Integration Tests: Component integration testing
// E2E Tests: Cypress for user workflows
```

### Performance Targets

- **Page Load Time**: < 2 seconds (95th percentile)
- **API Response Time**: < 500ms (average)
- **Database Query Time**: < 100ms (average)
- **Concurrent Users**: 5-10 simultaneous users
- **Uptime**: 99.9% availability target

### Security Implementation Priority

1. **High Priority**: JWT authentication, RBAC, input validation
2. **Medium Priority**: HTTPS, security headers, audit logging
3. **Low Priority**: Advanced monitoring, intrusion detection

This technical architecture provides a solid foundation for the ISV Pipeline Tracker MVP while maintaining scalability paths for future growth. The Docker-first approach ensures consistent deployment across environments, and the clean separation of concerns enables maintainable code as the platform evolves.