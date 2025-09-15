# Partnership Management Platform - Fullstack Architecture Document

## Introduction

This document outlines the complete fullstack architecture for the Partnership Management Platform, a configurable multi-tenant system for managing strategic partnerships, revenue tracking, and team oversight. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines frontend, backend, and infrastructure concerns with configuration-first design principles, enabling deployment for organizations of any size with customizable team structures, revenue targets, and partnership models.

### Starter Template Decision

**Selected Approach**: Custom Docker-based architecture with configuration-first design

**Rationale**:
- Enables complete control over multi-tenant configuration architecture
- Docker containerization provides deployment flexibility (local → cloud)
- Custom design allows optimization for partnership management domain
- Supports future scaling to external sales/multi-customer scenarios

**Constraints**:
- Custom development required for all configuration management features
- Full responsibility for security and scalability patterns
- Longer initial development timeline compared to starter templates

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-01-14 | 1.0 | Initial fullstack architecture with configuration-first design | Winston (Architect) |

## High Level Architecture

### Technical Summary

The Partnership Management Platform follows a containerized three-tier architecture with configuration-first design, deployed via Docker containers for maximum flexibility. The React frontend communicates with a Node.js/Express backend through RESTful APIs, while PostgreSQL serves as the primary database with Redis for caching and real-time features. The architecture prioritizes multi-tenant configuration capabilities, allowing organizations to customize team sizes, revenue targets, commission structures, and partnership workflows. All components are designed for horizontal scaling with clear service boundaries, supporting both single-tenant local deployment and future multi-tenant cloud deployment.

### Platform and Infrastructure Choice

**Platform**: Docker-first with cloud-agnostic design
**Key Services**:
- Frontend: React SPA with Material-UI
- Backend: Node.js/Express REST API
- Database: PostgreSQL 15 with JSON support
- Cache/Sessions: Redis 7
- Reverse Proxy: nginx
- Container Orchestration: Docker Compose (local), Kubernetes-ready

**Deployment Host and Regions**: Initially local Docker deployment, architected for seamless migration to AWS/GCP/Azure with multi-region support

### Repository Structure

**Structure**: Monorepo with clear package boundaries
**Monorepo Tool**: npm workspaces (lightweight, built-in)
**Package Organization**: Frontend, backend, shared types, and configuration packages with clear dependency management

### High Level Architecture Diagram

```mermaid
graph TB
    U[Users] --> LB[Load Balancer<br/>nginx]
    LB --> FE[Frontend Layer<br/>React SPA]
    FE --> API[API Gateway<br/>Node.js/Express]

    API --> AUTH[Auth Service]
    API --> CONFIG[Configuration Service]
    API --> PARTNER[Partner Service]
    API --> PIPELINE[Pipeline Service]
    API --> REPORTING[Reporting Service]

    AUTH --> DB[(PostgreSQL<br/>Primary Database)]
    CONFIG --> DB
    PARTNER --> DB
    PIPELINE --> DB
    REPORTING --> DB

    API --> CACHE[(Redis<br/>Cache & Sessions)]

    CONFIG --> ADMIN[Admin Interface<br/>Configuration Management]

    DB --> BACKUP[Automated Backups]

    style CONFIG fill:#e1f5fe
    style ADMIN fill:#e1f5fe
    style DB fill:#f3e5f5
    style CACHE fill:#fff3e0
```

### Architectural Patterns

- **Configuration-First Architecture**: All business logic driven by configurable settings stored in database - _Rationale:_ Enables multi-tenant deployment and customization without code changes
- **Domain-Driven Design**: Clear service boundaries around business domains (Partners, Pipeline, Configuration) - _Rationale:_ Maintains scalability and allows independent service evolution
- **Repository Pattern**: Abstract data access layer with configuration-aware queries - _Rationale:_ Enables testing and supports multi-tenant data isolation
- **API Gateway Pattern**: Single entry point with tenant-aware routing and authentication - _Rationale:_ Centralizes cross-cutting concerns and simplifies client integration
- **Event-Driven Updates**: Real-time dashboard updates via WebSocket events - _Rationale:_ Provides immediate visibility for executive-level decision making
- **Configuration Inheritance**: Tenant → Organization → Global configuration hierarchy - _Rationale:_ Balances customization with sensible defaults

## Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3+ | Type-safe frontend development | Strong typing prevents configuration-related runtime errors |
| Frontend Framework | React | 18.2+ | Component-based UI framework | Mature ecosystem, excellent for dashboard interfaces |
| UI Component Library | Material-UI (MUI) | 5.14+ | Professional executive-grade components | Corporate appearance, accessibility built-in |
| State Management | Zustand | 4.4+ | Lightweight state management | Simple API, perfect for configuration state |
| Backend Language | TypeScript | 5.3+ | Type-safe backend development | Shared types between frontend/backend |
| Backend Framework | Express.js | 4.18+ | Flexible REST API framework | Middleware ecosystem, configuration-friendly |
| API Style | REST | OpenAPI 3.0 | RESTful API with OpenAPI documentation | Industry standard, excellent tooling |
| Database | PostgreSQL | 15+ | Primary data store with JSON support | JSONB for flexible configuration storage |
| Cache | Redis | 7.2+ | Session storage and real-time features | WebSocket support, configuration caching |
| File Storage | Local Volumes | - | Document and backup storage | Simple for MVP, cloud-ready for scaling |
| Authentication | JWT + bcrypt | - | Token-based auth with password hashing | Stateless, multi-tenant friendly |
| Frontend Testing | Jest + RTL | 29+ | Unit and integration testing | React ecosystem standard |
| Backend Testing | Jest + Supertest | 29+ | API and service testing | Node.js testing standard |
| E2E Testing | Cypress | 13+ | End-to-end workflow testing | Configuration workflow validation |
| Build Tool | Vite | 4.5+ | Fast frontend builds | Development speed optimization |
| Bundler | Rollup (via Vite) | 3+ | Production frontend bundling | Tree shaking, code splitting |
| IaC Tool | Docker Compose | 2.0+ | Infrastructure as Code | Container orchestration |
| CI/CD | GitHub Actions | - | Automated testing and deployment | Git-native, configuration validation |
| Monitoring | Prometheus + Grafana | Latest | System and business metrics | Configuration-aware dashboards |
| Logging | Winston + Morgan | Latest | Structured logging with request tracing | Multi-tenant log isolation |
| CSS Framework | Styled Components | 6+ | Component-scoped styling | Dynamic theming support |

## Data Models

### Configuration Model

**Purpose**: Core configuration entity supporting multi-tenant customization of all system behavior

**Key Attributes**:
- organizationId: UUID - Tenant identifier for configuration isolation
- category: String - Configuration category (team, revenue, commission, pipeline)
- key: String - Specific configuration key
- value: JSONB - Flexible configuration value storage
- defaultValue: JSONB - System default when organization value not set
- dataType: String - Value type validation (string, number, boolean, object)
- isRequired: Boolean - Whether configuration must have a value
- validationRules: JSONB - JSON schema for value validation

#### TypeScript Interface
```typescript
interface Configuration {
  id: string;
  organizationId: string;
  category: 'organization' | 'team' | 'revenue' | 'commission' | 'pipeline' | 'integration';
  key: string;
  value: any;
  defaultValue?: any;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  isRequired: boolean;
  validationRules?: JSONSchema7;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Relationships
- One-to-many with Organizations
- Referenced by all other models for configuration-driven behavior

### Organization Model

**Purpose**: Multi-tenant organization entity containing all business configuration and user management

**Key Attributes**:
- name: String - Organization display name
- subdomain: String - Unique tenant identifier for routing
- settings: JSONB - Organization-specific settings cache
- isActive: Boolean - Tenant activation status
- subscriptionTier: String - Feature access level
- maxUsers: Number - User limit for organization

#### TypeScript Interface
```typescript
interface Organization {
  id: string;
  name: string;
  subdomain: string;
  settings: {
    teamSize?: number;
    quarterlyRevenueTarget?: number;
    baseCurrency?: string;
    timeZone?: string;
    businessHours?: { start: string; end: string };
    allowedDomains?: string[];
  };
  isActive: boolean;
  subscriptionTier: 'basic' | 'professional' | 'enterprise';
  maxUsers: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Relationships
- One-to-many with Users, Partners, Opportunities
- One-to-many with Configurations

### Partner Model

**Purpose**: Configurable partner/vendor entity with flexible commission and relationship structures

**Key Attributes**:
- organizationId: UUID - Tenant isolation
- name: String - Partner company name
- domain: String - Business domain category (configurable)
- commissionStructure: JSONB - Flexible commission configuration
- relationshipHealth: Number - Calculated health score
- primaryContact: JSONB - Contact information
- agreementDetails: JSONB - Configurable agreement terms

#### TypeScript Interface
```typescript
interface Partner {
  id: string;
  organizationId: string;
  name: string;
  domain: string; // Configurable domains like 'FinOps', 'Security', etc.
  website?: string;
  commissionStructure: {
    type: 'referral' | 'reseller' | 'msp' | 'custom';
    percentage: number;
    paymentModel: 'one-time' | 'recurring' | 'hybrid';
    minimumDeal?: number;
    maximumDeal?: number;
    tiers?: Array<{ threshold: number; percentage: number }>;
  };
  relationshipHealth: number; // 0-100 calculated score
  primaryContact: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  };
  agreementDetails: {
    startDate?: Date;
    endDate?: Date;
    renewalDate?: Date;
    terms?: string;
  };
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}
```

#### Relationships
- Many-to-one with Organization
- One-to-many with Opportunities
- One-to-many with PartnerInteractions

### Opportunity Model

**Purpose**: Configurable sales opportunity with flexible pipeline stages and commission calculations

**Key Attributes**:
- organizationId: UUID - Tenant isolation
- partnerId: UUID - Associated partner
- customerId: String - Customer identifier
- dealValue: Number - Opportunity value
- stage: String - Current pipeline stage (configurable)
- probability: Number - Close probability percentage
- expectedCloseDate: Date - Forecasted close date
- commissionDetails: JSONB - Calculated commission information

#### TypeScript Interface
```typescript
interface Opportunity {
  id: string;
  organizationId: string;
  partnerId: string;
  assignedUserId?: string;
  customerName: string;
  customerContact?: {
    name?: string;
    email?: string;
    company?: string;
  };
  dealValue: number;
  currency: string;
  stage: string; // Configurable stages like 'lead', 'demo', 'poc', 'proposal', 'closed'
  probability: number; // 0-100
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  commissionDetails: {
    calculatedCommission: number;
    commissionPercentage: number;
    paymentSchedule?: string;
    overrideReason?: string;
  };
  notes?: string;
  attachments?: string[];
  status: 'open' | 'closed_won' | 'closed_lost';
  createdAt: Date;
  updatedAt: Date;
}
```

#### Relationships
- Many-to-one with Organization and Partner
- One-to-many with OpportunityStageHistory
- Many-to-one with User (assigned)

### User Model

**Purpose**: Multi-tenant user management with configurable roles and permissions

**Key Attributes**:
- organizationId: UUID - Tenant isolation
- email: String - Authentication identifier
- role: String - Configurable role name
- permissions: JSONB - Role-based permissions
- personalSettings: JSONB - User customization preferences

#### TypeScript Interface
```typescript
interface User {
  id: string;
  organizationId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string; // Configurable roles like 'vp', 'sales_manager', 'partnership_manager'
  permissions: {
    canViewDashboard: boolean;
    canEditPartners: boolean;
    canCreateOpportunities: boolean;
    canViewReports: boolean;
    canEditConfiguration?: boolean; // Admin permission
  };
  personalSettings: {
    theme?: 'light' | 'dark';
    dashboardLayout?: string;
    notifications?: {
      email: boolean;
      inApp: boolean;
      frequency: 'immediate' | 'daily' | 'weekly';
    };
  };
  lastLoginAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Relationships
- Many-to-one with Organization
- One-to-many with Opportunities (assigned)
- One-to-many with WeeklyStatus

## API Specification

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: Partnership Management Platform API
  version: 1.0.0
  description: Configuration-first partnership management and revenue tracking API

servers:
  - url: http://localhost:8000/api/v1
    description: Local development server

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Configuration:
      type: object
      required: [organizationId, category, key, value, dataType]
      properties:
        id:
          type: string
          format: uuid
        organizationId:
          type: string
          format: uuid
        category:
          type: string
          enum: [organization, team, revenue, commission, pipeline, integration]
        key:
          type: string
        value:
          oneOf:
            - type: string
            - type: number
            - type: boolean
            - type: object
            - type: array
        defaultValue:
          oneOf:
            - type: string
            - type: number
            - type: boolean
            - type: object
            - type: array
        dataType:
          type: string
          enum: [string, number, boolean, object, array]
        isRequired:
          type: boolean
        validationRules:
          type: object

    Partner:
      type: object
      required: [organizationId, name, domain, commissionStructure]
      properties:
        id:
          type: string
          format: uuid
        organizationId:
          type: string
          format: uuid
        name:
          type: string
        domain:
          type: string
        commissionStructure:
          type: object
          properties:
            type:
              type: string
              enum: [referral, reseller, msp, custom]
            percentage:
              type: number
              minimum: 0
              maximum: 100
            paymentModel:
              type: string
              enum: [one-time, recurring, hybrid]

    Opportunity:
      type: object
      required: [organizationId, partnerId, customerName, dealValue, stage]
      properties:
        id:
          type: string
          format: uuid
        organizationId:
          type: string
          format: uuid
        partnerId:
          type: string
          format: uuid
        customerName:
          type: string
        dealValue:
          type: number
          minimum: 0
        stage:
          type: string
        probability:
          type: number
          minimum: 0
          maximum: 100

paths:
  /auth/login:
    post:
      tags: [Authentication]
      summary: User login
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                organizationSubdomain:
                  type: string
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'
                  organization:
                    $ref: '#/components/schemas/Organization'

  /configurations:
    get:
      tags: [Configuration]
      summary: Get organization configurations
      parameters:
        - name: category
          in: query
          schema:
            type: string
            enum: [organization, team, revenue, commission, pipeline]
      responses:
        '200':
          description: Configuration list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Configuration'

    post:
      tags: [Configuration]
      summary: Create or update configuration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Configuration'
      responses:
        '201':
          description: Configuration created/updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Configuration'

  /partners:
    get:
      tags: [Partners]
      summary: Get organization partners
      parameters:
        - name: domain
          in: query
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
            enum: [active, inactive, pending]
      responses:
        '200':
          description: Partner list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Partner'

    post:
      tags: [Partners]
      summary: Create new partner
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Partner'
      responses:
        '201':
          description: Partner created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Partner'

  /partners/{id}:
    get:
      tags: [Partners]
      summary: Get partner by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Partner details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Partner'

    put:
      tags: [Partners]
      summary: Update partner
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Partner'
      responses:
        '200':
          description: Partner updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Partner'

  /opportunities:
    get:
      tags: [Opportunities]
      summary: Get opportunities with filtering
      parameters:
        - name: stage
          in: query
          schema:
            type: string
        - name: partnerId
          in: query
          schema:
            type: string
            format: uuid
        - name: assignedUserId
          in: query
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Opportunity list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Opportunity'

    post:
      tags: [Opportunities]
      summary: Create new opportunity
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Opportunity'
      responses:
        '201':
          description: Opportunity created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Opportunity'

  /dashboard/kpis:
    get:
      tags: [Dashboard]
      summary: Get executive KPI dashboard data
      parameters:
        - name: period
          in: query
          schema:
            type: string
            enum: [current_quarter, last_quarter, ytd]
            default: current_quarter
      responses:
        '200':
          description: KPI dashboard data
          content:
            application/json:
              schema:
                type: object
                properties:
                  revenueProgress:
                    type: object
                    properties:
                      current:
                        type: number
                      target:
                        type: number
                      percentage:
                        type: number
                  pipelineHealth:
                    type: object
                    properties:
                      totalValue:
                        type: number
                      stageDistribution:
                        type: object
                      conversionRates:
                        type: object
                  teamPerformance:
                    type: array
                    items:
                      type: object
                      properties:
                        userId:
                          type: string
                        name:
                          type: string
                        revenue:
                          type: number
                        opportunities:
                          type: number
```

## Components

### Configuration Service

**Responsibility**: Manages all configuration data with tenant isolation, validation, and caching for optimal performance

**Key Interfaces**:
- GET /configurations - Retrieve configurations by category with inheritance resolution
- POST /configurations - Create/update configuration with validation
- GET /configurations/schema - Return configuration schema for admin UI generation

**Dependencies**: PostgreSQL for persistence, Redis for configuration caching, ValidationService for schema validation

**Technology Stack**: Express.js middleware with JSON Schema validation, Redis TTL caching, PostgreSQL JSONB queries

### Partner Management Service

**Responsibility**: Handles partner lifecycle, commission structure management, and relationship health calculations with full configurability

**Key Interfaces**:
- CRUD operations for partners with commission structure validation
- Commission calculation engine with configurable rules
- Relationship health scoring based on configurable metrics

**Dependencies**: Configuration Service for commission rules, Database for partner data, EventService for relationship updates

**Technology Stack**: Express.js routes with TypeScript validation, custom commission calculation engine, PostgreSQL with JSONB for flexible partner data

### Pipeline Management Service

**Responsibility**: Manages opportunity lifecycle with configurable pipeline stages, probability calculations, and forecasting

**Key Interfaces**:
- Opportunity CRUD with stage progression validation
- Pipeline analytics and forecasting with configurable parameters
- Stage transition workflows with configurable approval rules

**Dependencies**: Configuration Service for pipeline stages, Partner Service for commission calculations, User Service for assignments

**Technology Stack**: Express.js with state machine pattern for stage transitions, PostgreSQL for opportunity data, Redis for real-time pipeline updates

### Dashboard Service

**Responsibility**: Aggregates data from all services to provide executive-level KPIs and team performance metrics with configurable dashboards

**Key Interfaces**:
- Real-time KPI calculation with configurable metrics
- Team performance aggregation with configurable goals
- Revenue forecasting with configurable targets and timelines

**Dependencies**: All business services for data aggregation, Configuration Service for KPI definitions, WebSocket for real-time updates

**Technology Stack**: Express.js with complex aggregation queries, Redis for dashboard caching, WebSocket.io for real-time updates, configurable report generation

### Authentication & Authorization Service

**Responsibility**: Multi-tenant authentication with configurable role-based access control and organization isolation

**Key Interfaces**:
- JWT-based authentication with organization context
- Role-based authorization with configurable permissions
- Organization user management with configurable user limits

**Dependencies**: User Service for user data, Configuration Service for role definitions, Redis for session management

**Technology Stack**: Express.js with JWT middleware, bcrypt for password hashing, Redis for session storage, configurable RBAC system

### Component Diagrams

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[React SPA]
        DASH[Dashboard Components]
        CONFIG_UI[Configuration UI]
        PARTNER_UI[Partner Management]
    end

    subgraph "API Layer"
        GATEWAY[API Gateway]
        AUTH[Auth Service]
    end

    subgraph "Business Services"
        CONFIG_SVC[Configuration Service]
        PARTNER_SVC[Partner Service]
        PIPELINE_SVC[Pipeline Service]
        DASHBOARD_SVC[Dashboard Service]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL)]
        CACHE[(Redis)]
    end

    FE --> GATEWAY
    DASH --> GATEWAY
    CONFIG_UI --> GATEWAY
    PARTNER_UI --> GATEWAY

    GATEWAY --> AUTH
    GATEWAY --> CONFIG_SVC
    GATEWAY --> PARTNER_SVC
    GATEWAY --> PIPELINE_SVC
    GATEWAY --> DASHBOARD_SVC

    CONFIG_SVC --> DB
    CONFIG_SVC --> CACHE
    PARTNER_SVC --> DB
    PARTNER_SVC --> CONFIG_SVC
    PIPELINE_SVC --> DB
    PIPELINE_SVC --> PARTNER_SVC
    DASHBOARD_SVC --> DB
    DASHBOARD_SVC --> CACHE
    DASHBOARD_SVC --> CONFIG_SVC

    AUTH --> DB
    AUTH --> CACHE
```

## External APIs

No external APIs are required for the MVP deployment. The system is designed to be self-contained with all functionality provided by internal services.

**Future External API Integration Points**:
- CRM integrations (HubSpot, Salesforce) - Phase 2
- Communication APIs (Slack, Email) - Phase 2
- Cloud provider APIs (AWS Partner Central, GCP) - Phase 3
- Payment processing APIs - Phase 3

## Core Workflows

### Configuration Management Workflow

```mermaid
sequenceDiagram
    participant A as Admin User
    participant F as Frontend
    participant API as API Gateway
    participant C as Config Service
    participant V as Validation Service
    participant DB as Database
    participant Cache as Redis

    A->>F: Access Configuration UI
    F->>API: GET /configurations?category=commission
    API->>C: Get configurations with inheritance
    C->>Cache: Check cached configs
    Cache-->>C: Cache miss
    C->>DB: Query configurations with defaults
    DB-->>C: Configuration data
    C->>Cache: Cache results (TTL: 5min)
    C-->>API: Resolved configurations
    API-->>F: Configuration schema + values
    F-->>A: Render configuration form

    A->>F: Update commission percentage
    F->>API: POST /configurations {key: "default_referral_rate", value: 18}
    API->>V: Validate configuration value
    V-->>API: Validation success
    API->>C: Update configuration
    C->>DB: Store new configuration
    C->>Cache: Invalidate related cache
    C-->>API: Update success
    API-->>F: Success response
    F-->>A: Configuration updated
```

### Opportunity Management Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Gateway
    participant P as Pipeline Service
    participant PS as Partner Service
    participant C as Config Service
    participant DB as Database
    participant WS as WebSocket

    U->>F: Create new opportunity
    F->>API: POST /opportunities {partnerId, dealValue, stage}
    API->>C: Get pipeline stage configuration
    C-->>API: Stage definitions and probabilities
    API->>PS: Get partner commission structure
    PS-->>API: Commission configuration
    API->>P: Create opportunity with calculations
    P->>DB: Store opportunity record
    P->>WS: Broadcast pipeline update
    WS-->>F: Real-time dashboard update
    P-->>API: Created opportunity
    API-->>F: Success + opportunity data
    F-->>U: Opportunity created

    Note over U,WS: Stage Progression
    U->>F: Advance opportunity to "Demo"
    F->>API: PUT /opportunities/{id} {stage: "demo"}
    API->>C: Get stage transition rules
    C-->>API: Validation rules for demo stage
    API->>P: Update opportunity stage
    P->>DB: Update stage + create history record
    P->>WS: Broadcast stage change event
    WS-->>F: Update dashboard + notifications
    P-->>API: Update success
    API-->>F: Updated opportunity
    F-->>U: Stage updated
```

## Database Schema

```sql
-- Configuration-first multi-tenant database schema

-- Organizations (Tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    max_users INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuration management (core of the system)
CREATE TABLE configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'organization', 'team', 'revenue', 'commission', 'pipeline'
    key VARCHAR(255) NOT NULL,
    value JSONB NOT NULL,
    default_value JSONB,
    data_type VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'object', 'array'
    is_required BOOLEAN DEFAULT false,
    validation_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(organization_id, category, key)
);

-- Users with configurable roles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL, -- Configurable: 'vp', 'sales_manager', 'partnership_manager'
    permissions JSONB DEFAULT '{}',
    personal_settings JSONB DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(organization_id, email)
);

-- Partners with flexible commission structures
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) NOT NULL, -- Configurable domains
    website VARCHAR(500),
    commission_structure JSONB NOT NULL, -- Flexible commission configuration
    relationship_health INTEGER DEFAULT 50, -- 0-100 calculated score
    primary_contact JSONB DEFAULT '{}',
    agreement_details JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities with configurable pipeline stages
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_contact JSONB DEFAULT '{}',
    deal_value DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    stage VARCHAR(100) NOT NULL, -- Configurable pipeline stages
    probability INTEGER DEFAULT 10, -- 0-100
    expected_close_date DATE NOT NULL,
    actual_close_date DATE,
    commission_details JSONB DEFAULT '{}',
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunity stage history for auditing
CREATE TABLE opportunity_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    from_stage VARCHAR(100),
    to_stage VARCHAR(100) NOT NULL,
    changed_by_user_id UUID REFERENCES users(id),
    change_reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partner interactions for relationship health
CREATE TABLE partner_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(100) NOT NULL, -- 'meeting', 'call', 'email', 'event'
    description TEXT,
    interaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly status submissions
CREATE TABLE weekly_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_ending DATE NOT NULL,
    accomplishments JSONB DEFAULT '[]',
    upcoming_tasks JSONB DEFAULT '[]',
    blockers JSONB DEFAULT '[]',
    kpi_data JSONB DEFAULT '{}',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(organization_id, user_id, week_ending)
);

-- Task management with rollover
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quarterly goals with configurable targets
CREATE TABLE quarterly_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for org-wide goals
    quarter INTEGER NOT NULL, -- 1, 2, 3, 4
    year INTEGER NOT NULL,
    goal_type VARCHAR(100) NOT NULL, -- Configurable: 'revenue', 'opportunities', 'partners'
    target_value DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(organization_id, user_id, quarter, year, goal_type)
);

-- Alerts and notifications
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for org-wide alerts
    alert_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL, -- 'opportunity', 'partner', 'goal', 'task'
    entity_id UUID,
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'acknowledged', 'resolved'
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance optimization
CREATE INDEX idx_organizations_subdomain ON organizations(subdomain);
CREATE INDEX idx_configurations_org_category ON configurations(organization_id, category);
CREATE INDEX idx_users_org_email ON users(organization_id, email);
CREATE INDEX idx_partners_org_domain ON partners(organization_id, domain);
CREATE INDEX idx_opportunities_org_stage ON opportunities(organization_id, stage);
CREATE INDEX idx_opportunities_partner ON opportunities(partner_id);
CREATE INDEX idx_opportunities_assigned_user ON opportunities(assigned_user_id);
CREATE INDEX idx_opportunity_history_opp_id ON opportunity_stage_history(opportunity_id);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_alerts_user_status ON alerts(user_id, status);
CREATE INDEX idx_weekly_status_user_week ON weekly_status(user_id, week_ending);

-- Row Level Security for multi-tenant isolation
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (to be completed in implementation)
-- CREATE POLICY tenant_isolation_users ON users
--   FOR ALL TO authenticated
--   USING (organization_id = current_setting('app.current_organization_id')::uuid);
```

## Frontend Architecture

### Component Architecture

#### Component Organization
```
src/
├── components/
│   ├── common/              # Reusable components
│   │   ├── Layout/
│   │   ├── Navigation/
│   │   ├── DataTable/
│   │   └── Charts/
│   ├── dashboard/           # Executive dashboard components
│   │   ├── KPICards/
│   │   ├── PipelineFunnel/
│   │   └── TeamPerformance/
│   ├── partners/            # Partner management components
│   │   ├── PartnerList/
│   │   ├── PartnerForm/
│   │   └── CommissionCalculator/
│   ├── opportunities/       # Pipeline management components
│   │   ├── OpportunityKanban/
│   │   ├── OpportunityForm/
│   │   └── PipelineAnalytics/
│   ├── configuration/       # Configuration management UI
│   │   ├── ConfigurationPanel/
│   │   ├── SchemaEditor/
│   │   └── TenantSettings/
│   └── auth/               # Authentication components
│       ├── LoginForm/
│       └── ProtectedRoute/
├── pages/
│   ├── Dashboard/
│   ├── Partners/
│   ├── Pipeline/
│   ├── Configuration/
│   └── Reports/
├── hooks/
│   ├── useConfiguration.ts  # Configuration management hook
│   ├── useAuth.ts
│   ├── usePartners.ts
│   └── useOpportunities.ts
├── services/
│   ├── api.ts              # Base API client
│   ├── configurationService.ts
│   ├── partnerService.ts
│   └── authService.ts
├── stores/
│   ├── authStore.ts
│   ├── configurationStore.ts
│   └── uiStore.ts
└── types/
    ├── api.ts              # API response types
    ├── configuration.ts
    ├── partner.ts
    └── opportunity.ts
```

#### Component Template
```typescript
import React from 'react';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { useConfiguration } from '../../hooks/useConfiguration';

interface ConfigurableComponentProps {
  organizationId: string;
  category: string;
  children?: React.ReactNode;
}

export const ConfigurableComponent: React.FC<ConfigurableComponentProps> = ({
  organizationId,
  category,
  children
}) => {
  const theme = useTheme();
  const { getConfigValue, loading } = useConfiguration(organizationId);

  // Get component-specific configuration
  const componentConfig = getConfigValue(category, 'component_settings', {
    showHeader: true,
    allowEdit: false,
    refreshInterval: 30000
  });

  if (loading) {
    return <Box>Loading configuration...</Box>;
  }

  return (
    <Card elevation={2}>
      {componentConfig.showHeader && (
        <CardContent>
          <Typography variant="h6" component="h2">
            Configurable Component
          </Typography>
        </CardContent>
      )}
      <Box sx={{ p: 2 }}>
        {children}
      </Box>
    </Card>
  );
};
```

### State Management Architecture

#### State Structure
```typescript
// Zustand store with configuration-driven state
interface ConfigurationState {
  configurations: Record<string, any>;
  loading: boolean;
  error: string | null;

  // Actions
  loadConfigurations: (organizationId: string, category?: string) => Promise<void>;
  updateConfiguration: (config: Configuration) => Promise<void>;
  getConfigValue: (category: string, key: string, defaultValue?: any) => any;
  resetConfiguration: () => void;
}

interface AuthState {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string, subdomain: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

interface UIState {
  theme: 'light' | 'dark';
  dashboardLayout: string;
  sidebarOpen: boolean;

  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setDashboardLayout: (layout: string) => void;
  toggleSidebar: () => void;
}
```

#### State Management Patterns
- **Configuration-driven UI**: All UI behavior controlled by configuration store
- **Optimistic Updates**: Update UI immediately, rollback on server error
- **Real-time Sync**: WebSocket integration for live configuration updates
- **Local Persistence**: Cache critical configuration for offline resilience

### Routing Architecture

#### Route Organization
```
/
├── /login                   # Authentication
├── /dashboard              # Executive overview (protected)
├── /partners               # Partner management (protected)
│   ├── /partners/new
│   └── /partners/:id
├── /opportunities          # Pipeline management (protected)
│   ├── /opportunities/new
│   └── /opportunities/:id
├── /reports               # Analytics and reporting (protected)
├── /configuration         # System configuration (admin only)
│   ├── /configuration/organization
│   ├── /configuration/users
│   ├── /configuration/pipeline
│   └── /configuration/commissions
└── /settings              # Personal settings (protected)
```

#### Protected Route Pattern
```typescript
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useConfiguration } from '../../hooks/useConfiguration';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  adminOnly = false
}) => {
  const { isAuthenticated, user } = useAuth();
  const { hasPermission } = useConfiguration(user?.organizationId);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !hasPermission('admin', 'system_configuration')) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPermission && !hasPermission(user?.role, requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
```

### Frontend Services Layer

#### API Client Setup
```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getAuthToken, logout } from './authService';

class ApiClient {
  private client: AxiosInstance;
  private organizationId: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth and organization context
    this.client.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add organization context for multi-tenant requests
        if (this.organizationId) {
          config.headers['X-Organization-Id'] = this.organizationId;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setOrganizationContext(organizationId: string) {
    this.organizationId = organizationId;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

#### Service Example
```typescript
import { apiClient } from './api';
import { Configuration, Partner, Opportunity } from '../types';

export class ConfigurationService {
  async getConfigurations(organizationId: string, category?: string): Promise<Configuration[]> {
    const params = category ? { category } : {};
    return apiClient.get<Configuration[]>('/configurations', { params });
  }

  async updateConfiguration(config: Partial<Configuration>): Promise<Configuration> {
    if (config.id) {
      return apiClient.put<Configuration>(`/configurations/${config.id}`, config);
    } else {
      return apiClient.post<Configuration>('/configurations', config);
    }
  }

  async getConfigValue<T>(
    organizationId: string,
    category: string,
    key: string,
    defaultValue?: T
  ): Promise<T> {
    try {
      const configs = await this.getConfigurations(organizationId, category);
      const config = configs.find(c => c.key === key);
      return config ? config.value : defaultValue;
    } catch (error) {
      console.warn(`Configuration not found: ${category}.${key}`, error);
      return defaultValue as T;
    }
  }

  async validateConfiguration(config: Configuration): Promise<boolean> {
    try {
      await apiClient.post('/configurations/validate', config);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const configurationService = new ConfigurationService();
```

## Backend Architecture

### Service Architecture

#### Function Organization
```
src/
├── controllers/
│   ├── authController.ts
│   ├── configurationController.ts
│   ├── partnerController.ts
│   ├── opportunityController.ts
│   └── dashboardController.ts
├── services/
│   ├── authService.ts
│   ├── configurationService.ts
│   ├── partnerService.ts
│   ├── opportunityService.ts
│   ├── commissionService.ts
│   └── dashboardService.ts
├── middleware/
│   ├── authentication.ts
│   ├── authorization.ts
│   ├── organizationContext.ts
│   ├── validation.ts
│   └── errorHandler.ts
├── models/
│   ├── Configuration.ts
│   ├── Partner.ts
│   ├── Opportunity.ts
│   └── User.ts
├── repositories/
│   ├── configurationRepository.ts
│   ├── partnerRepository.ts
│   ├── opportunityRepository.ts
│   └── userRepository.ts
├── utils/
│   ├── database.ts
│   ├── redis.ts
│   ├── validation.ts
│   └── logger.ts
└── routes/
    ├── auth.ts
    ├── configurations.ts
    ├── partners.ts
    ├── opportunities.ts
    └── dashboard.ts
```

#### Controller Template
```typescript
import { Request, Response, NextFunction } from 'express';
import { ConfigurationService } from '../services/configurationService';
import { validateConfiguration } from '../utils/validation';
import { AuthenticatedRequest } from '../types/auth';

export class ConfigurationController {
  private configurationService: ConfigurationService;

  constructor() {
    this.configurationService = new ConfigurationService();
  }

  async getConfigurations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { organizationId } = req.user!;
      const { category } = req.query;

      const configurations = await this.configurationService.getConfigurations(
        organizationId,
        category as string
      );

      res.json(configurations);
    } catch (error) {
      next(error);
    }
  }

  async updateConfiguration(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { organizationId } = req.user!;
      const configurationData = { ...req.body, organizationId };

      // Validate configuration data
      const validationResult = await validateConfiguration(configurationData);
      if (!validationResult.valid) {
        return res.status(400).json({ error: 'Invalid configuration', details: validationResult.errors });
      }

      const configuration = await this.configurationService.updateConfiguration(configurationData);

      res.status(201).json(configuration);
    } catch (error) {
      next(error);
    }
  }

  async getConfigValue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { organizationId } = req.user!;
      const { category, key } = req.params;
      const { defaultValue } = req.query;

      const value = await this.configurationService.getConfigValue(
        organizationId,
        category,
        key,
        defaultValue
      );

      res.json({ value });
    } catch (error) {
      next(error);
    }
  }
}
```

### Database Architecture

#### Schema Design
```sql
-- Configuration-first schema already defined above in Database Schema section
-- Key points for backend architecture:

-- 1. Row Level Security (RLS) for multi-tenant isolation
-- 2. JSONB columns for flexible configuration storage
-- 3. Indexed queries for performance optimization
-- 4. Foreign key constraints for data integrity
-- 5. Audit trails for configuration changes
```

#### Data Access Layer
```typescript
import { Pool, PoolClient } from 'pg';
import { Redis } from 'ioredis';
import { Configuration } from '../types';

export class ConfigurationRepository {
  private db: Pool;
  private cache: Redis;

  constructor(db: Pool, cache: Redis) {
    this.db = db;
    this.cache = cache;
  }

  async findByOrganizationAndCategory(
    organizationId: string,
    category?: string
  ): Promise<Configuration[]> {
    const cacheKey = `configs:${organizationId}:${category || 'all'}`;

    // Check cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Query database with RLS context
    const client = await this.db.connect();
    try {
      // Set organization context for RLS
      await client.query('SELECT set_config($1, $2, true)', [
        'app.current_organization_id',
        organizationId
      ]);

      const query = category
        ? 'SELECT * FROM configurations WHERE category = $1 ORDER BY key'
        : 'SELECT * FROM configurations ORDER BY category, key';

      const params = category ? [category] : [];
      const result = await client.query(query, params);

      const configurations = result.rows.map(this.mapRowToConfiguration);

      // Cache result for 5 minutes
      await this.cache.setex(cacheKey, 300, JSON.stringify(configurations));

      return configurations;
    } finally {
      client.release();
    }
  }

  async upsert(configuration: Partial<Configuration>): Promise<Configuration> {
    const client = await this.db.connect();
    try {
      await client.query('SELECT set_config($1, $2, true)', [
        'app.current_organization_id',
        configuration.organizationId
      ]);

      const query = `
        INSERT INTO configurations (
          organization_id, category, key, value, default_value,
          data_type, is_required, validation_rules
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (organization_id, category, key)
        DO UPDATE SET
          value = EXCLUDED.value,
          data_type = EXCLUDED.data_type,
          is_required = EXCLUDED.is_required,
          validation_rules = EXCLUDED.validation_rules,
          updated_at = NOW()
        RETURNING *
      `;

      const params = [
        configuration.organizationId,
        configuration.category,
        configuration.key,
        JSON.stringify(configuration.value),
        configuration.defaultValue ? JSON.stringify(configuration.defaultValue) : null,
        configuration.dataType,
        configuration.isRequired || false,
        configuration.validationRules ? JSON.stringify(configuration.validationRules) : null
      ];

      const result = await client.query(query, params);

      // Invalidate cache
      const cachePattern = `configs:${configuration.organizationId}:*`;
      const keys = await this.cache.keys(cachePattern);
      if (keys.length > 0) {
        await this.cache.del(...keys);
      }

      return this.mapRowToConfiguration(result.rows[0]);
    } finally {
      client.release();
    }
  }

  private mapRowToConfiguration(row: any): Configuration {
    return {
      id: row.id,
      organizationId: row.organization_id,
      category: row.category,
      key: row.key,
      value: row.value,
      defaultValue: row.default_value,
      dataType: row.data_type,
      isRequired: row.is_required,
      validationRules: row.validation_rules,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
```

### Authentication and Authorization

#### Auth Flow
```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Gateway
    participant Auth as Auth Service
    participant DB as Database
    participant Cache as Redis

    C->>API: POST /auth/login {email, password, subdomain}
    API->>Auth: Authenticate user
    Auth->>DB: Query user by email + organization
    DB-->>Auth: User data + organization
    Auth->>Auth: Verify password hash
    Auth->>Cache: Store session data
    Auth->>Auth: Generate JWT token
    Auth-->>API: Auth success + token + user data
    API-->>C: Login success response

    Note over C,Cache: Protected Request
    C->>API: GET /partners (Authorization: Bearer token)
    API->>Auth: Validate JWT token
    Auth->>Cache: Check session validity
    Cache-->>Auth: Session valid
    Auth->>Auth: Extract organization context
    Auth-->>API: Auth success + organization context
    API->>API: Set RLS context for database queries
    API->>DB: Query partners with organization isolation
    DB-->>API: Filtered partner data
    API-->>C: Partners response
```

#### Middleware/Guards
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';
import { AuthenticatedRequest, JWTPayload } from '../types/auth';

export class AuthenticationMiddleware {
  private cache: Redis;
  private jwtSecret: string;

  constructor(cache: Redis, jwtSecret: string) {
    this.cache = cache;
    this.jwtSecret = jwtSecret;
  }

  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }

      const token = authHeader.substring(7);

      // Verify JWT token
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;

      // Check if session exists in Redis
      const sessionKey = `session:${decoded.userId}:${decoded.organizationId}`;
      const sessionData = await this.cache.get(sessionKey);

      if (!sessionData) {
        return res.status(401).json({ error: 'Session expired' });
      }

      const session = JSON.parse(sessionData);

      // Attach user context to request
      req.user = {
        id: decoded.userId,
        organizationId: decoded.organizationId,
        email: decoded.email,
        role: decoded.role,
        permissions: session.permissions
      };

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      next(error);
    }
  };

  authorize = (requiredPermission: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { permissions } = req.user;

      if (!permissions[requiredPermission]) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: requiredPermission
        });
      }

      next();
    };
  };

  setOrganizationContext = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next();
    }

    // Set organization context for Row Level Security
    req.organizationContext = req.user.organizationId;

    next();
  };
}
```

## Unified Project Structure

```plaintext
partnership-management-platform/
├── .github/                          # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml                  # Test and build workflow
│       └── deploy.yaml              # Deployment workflow
├── apps/                            # Application packages
│   ├── web/                        # Frontend React application
│   │   ├── public/                 # Static assets
│   │   ├── src/
│   │   │   ├── components/         # React components
│   │   │   │   ├── common/         # Reusable components
│   │   │   │   ├── dashboard/      # Dashboard-specific components
│   │   │   │   ├── partners/       # Partner management components
│   │   │   │   ├── opportunities/  # Pipeline components
│   │   │   │   ├── configuration/  # Configuration UI components
│   │   │   │   └── auth/          # Authentication components
│   │   │   ├── pages/             # Page components
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── Partners/
│   │   │   │   ├── Pipeline/
│   │   │   │   ├── Configuration/
│   │   │   │   └── Auth/
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useConfiguration.ts
│   │   │   │   ├── usePartners.ts
│   │   │   │   └── useOpportunities.ts
│   │   │   ├── services/          # API client services
│   │   │   │   ├── api.ts
│   │   │   │   ├── authService.ts
│   │   │   │   ├── configurationService.ts
│   │   │   │   └── partnerService.ts
│   │   │   ├── stores/            # Zustand state management
│   │   │   │   ├── authStore.ts
│   │   │   │   ├── configurationStore.ts
│   │   │   │   └── uiStore.ts
│   │   │   ├── styles/            # Global styles and themes
│   │   │   │   ├── theme.ts
│   │   │   │   └── globals.css
│   │   │   ├── utils/             # Frontend utilities
│   │   │   │   ├── formatters.ts
│   │   │   │   ├── validators.ts
│   │   │   │   └── constants.ts
│   │   │   └── App.tsx            # Root component
│   │   ├── tests/                 # Frontend tests
│   │   │   ├── __mocks__/
│   │   │   ├── components/
│   │   │   └── services/
│   │   ├── .env.example           # Environment variables template
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── api/                       # Backend Node.js application
│       ├── src/
│       │   ├── controllers/       # Request handlers
│       │   │   ├── authController.ts
│       │   │   ├── configurationController.ts
│       │   │   ├── partnerController.ts
│       │   │   ├── opportunityController.ts
│       │   │   └── dashboardController.ts
│       │   ├── services/          # Business logic services
│       │   │   ├── authService.ts
│       │   │   ├── configurationService.ts
│       │   │   ├── partnerService.ts
│       │   │   ├── opportunityService.ts
│       │   │   ├── commissionService.ts
│       │   │   └── dashboardService.ts
│       │   ├── repositories/      # Data access layer
│       │   │   ├── configurationRepository.ts
│       │   │   ├── partnerRepository.ts
│       │   │   ├── opportunityRepository.ts
│       │   │   └── userRepository.ts
│       │   ├── middleware/        # Express middleware
│       │   │   ├── authentication.ts
│       │   │   ├── authorization.ts
│       │   │   ├── organizationContext.ts
│       │   │   ├── validation.ts
│       │   │   └── errorHandler.ts
│       │   ├── routes/           # API route definitions
│       │   │   ├── auth.ts
│       │   │   ├── configurations.ts
│       │   │   ├── partners.ts
│       │   │   ├── opportunities.ts
│       │   │   └── dashboard.ts
│       │   ├── models/           # TypeScript type definitions
│       │   │   ├── Configuration.ts
│       │   │   ├── Partner.ts
│       │   │   ├── Opportunity.ts
│       │   │   └── User.ts
│       │   ├── utils/            # Backend utilities
│       │   │   ├── database.ts
│       │   │   ├── redis.ts
│       │   │   ├── validation.ts
│       │   │   ├── logger.ts
│       │   │   └── encryption.ts
│       │   ├── migrations/       # Database migrations
│       │   │   └── 001_initial_schema.sql
│       │   └── server.ts         # Express server entry point
│       ├── tests/               # Backend tests
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── repositories/
│       │   └── integration/
│       ├── .env.example         # Environment variables template
│       ├── package.json
│       └── tsconfig.json
├── packages/                    # Shared packages
│   ├── shared/                 # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces
│   │   │   │   ├── api.ts      # API request/response types
│   │   │   │   ├── configuration.ts
│   │   │   │   ├── partner.ts
│   │   │   │   ├── opportunity.ts
│   │   │   │   └── user.ts
│   │   │   ├── constants/      # Shared constants
│   │   │   │   ├── commissionTypes.ts
│   │   │   │   ├── pipelineStages.ts
│   │   │   │   └── userRoles.ts
│   │   │   └── utils/          # Shared utilities
│   │   │       ├── validation.ts
│   │   │       ├── formatters.ts
│   │   │       └── dateHelpers.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   │   ├── DataTable/
│   │   │   │   ├── Charts/
│   │   │   │   ├── Forms/
│   │   │   │   └── Layout/
│   │   │   ├── hooks/          # Shared React hooks
│   │   │   └── utils/          # UI utilities
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── config/                 # Shared configuration
│       ├── eslint/
│       │   └── .eslintrc.js
│       ├── typescript/
│       │   └── tsconfig.base.json
│       └── jest/
│           └── jest.config.js
├── infrastructure/             # Infrastructure as Code
│   ├── docker/
│   │   ├── Dockerfile.frontend
│   │   ├── Dockerfile.backend
│   │   └── docker-compose.yml
│   ├── kubernetes/            # K8s manifests for scaling
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   └── terraform/            # Cloud infrastructure (future)
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── scripts/                   # Build and deploy scripts
│   ├── build.sh              # Build all applications
│   ├── dev.sh                # Start development environment
│   ├── test.sh               # Run all tests
│   ├── migrate.sh            # Database migrations
│   └── deploy.sh             # Deployment script
├── docs/                     # Documentation
│   ├── api/                  # API documentation
│   ├── architecture/         # Architecture documents
│   │   ├── decisions/        # Architecture Decision Records
│   │   └── diagrams/         # System diagrams
│   ├── deployment/           # Deployment guides
│   ├── prd.md               # Product Requirements Document
│   ├── technical-architecture.md
│   ├── architecture.md      # This document
│   └── README.md
├── .env.example             # Root environment variables
├── .gitignore
├── package.json             # Root package.json with workspaces
├── tsconfig.json           # Root TypeScript configuration
├── docker-compose.yml      # Development environment
├── docker-compose.prod.yml # Production environment
└── README.md               # Project documentation
```

## Development Workflow

### Local Development Setup

#### Prerequisites
```bash
# Install required tools
node -v  # 18.17.0 or higher
npm -v   # 9.0.0 or higher
docker --version  # 20.10.0 or higher
docker-compose --version  # 2.0.0 or higher

# Install PostgreSQL client tools (optional, for direct DB access)
psql --version  # 15.0 or higher
```

#### Initial Setup
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

#### Development Commands
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

### Environment Configuration

#### Required Environment Variables

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

## Deployment Architecture

### Deployment Strategy

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

### CI/CD Pipeline

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

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:8000 | Local development and testing |
| Staging | https://staging.partnership-platform.com | https://api-staging.partnership-platform.com | Pre-production testing and QA |
| Production | https://partnership-platform.com | https://api.partnership-platform.com | Live customer environment |

## Security and Performance

### Security Requirements

**Frontend Security:**
- CSP Headers: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;`
- XSS Prevention: Content Security Policy, input sanitization, output encoding
- Secure Storage: Sensitive data in httpOnly cookies, JWT tokens in memory only

**Backend Security:**
- Input Validation: Joi schema validation for all API inputs with strict type checking
- Rate Limiting: 100 requests per minute per IP, 1000 per hour per authenticated user
- CORS Policy: Restrict to known frontend domains with credentials enabled

**Authentication Security:**
- Token Storage: JWT in httpOnly cookies with SameSite=Strict, 24-hour expiration
- Session Management: Redis-based sessions with automatic cleanup and session rotation
- Password Policy: Minimum 8 characters, complexity requirements, bcrypt with 12 rounds

### Performance Optimization

**Frontend Performance:**
- Bundle Size Target: <500KB compressed for main bundle, code splitting for routes
- Loading Strategy: Lazy loading for routes, progressive loading for dashboard components
- Caching Strategy: Service worker for API responses, browser caching for static assets

**Backend Performance:**
- Response Time Target: <200ms for API endpoints, <100ms for cached responses
- Database Optimization: Connection pooling, strategic indexes, query optimization
- Caching Strategy: Redis for configuration data (5-minute TTL), session caching, API response caching

## Testing Strategy

### Testing Pyramid

```
           E2E Tests (Cypress)
          /                 \
    Integration Tests (API + DB)
    /                           \
Frontend Unit Tests      Backend Unit Tests
  (Jest + RTL)             (Jest + Supertest)
```

### Test Organization

#### Frontend Tests
```
apps/web/tests/
├── __mocks__/              # Test mocks and fixtures
│   ├── api.ts
│   ├── localStorage.ts
│   └── websocket.ts
├── components/             # Component unit tests
│   ├── Dashboard/
│   │   ├── KPICards.test.tsx
│   │   └── PipelineFunnel.test.tsx
│   ├── Partners/
│   │   ├── PartnerList.test.tsx
│   │   └── PartnerForm.test.tsx
│   └── Configuration/
│       ├── ConfigurationPanel.test.tsx
│       └── SchemaEditor.test.tsx
├── hooks/                  # Custom hook tests
│   ├── useAuth.test.ts
│   ├── useConfiguration.test.ts
│   └── usePartners.test.ts
├── services/              # Service layer tests
│   ├── authService.test.ts
│   ├── configurationService.test.ts
│   └── apiClient.test.ts
├── stores/                # State management tests
│   ├── authStore.test.ts
│   └── configurationStore.test.ts
└── utils/                 # Utility function tests
    ├── formatters.test.ts
    └── validators.test.ts
```

#### Backend Tests
```
apps/api/tests/
├── controllers/           # Controller unit tests
│   ├── authController.test.ts
│   ├── configurationController.test.ts
│   └── partnerController.test.ts
├── services/              # Service layer tests
│   ├── authService.test.ts
│   ├── configurationService.test.ts
│   ├── commissionService.test.ts
│   └── dashboardService.test.ts
├── repositories/          # Repository layer tests
│   ├── configurationRepository.test.ts
│   ├── partnerRepository.test.ts
│   └── userRepository.test.ts
├── middleware/            # Middleware tests
│   ├── authentication.test.ts
│   ├── authorization.test.ts
│   └── validation.test.ts
├── integration/           # Integration tests
│   ├── auth.integration.test.ts
│   ├── partners.integration.test.ts
│   └── configuration.integration.test.ts
└── utils/                 # Utility tests
    ├── validation.test.ts
    └── encryption.test.ts
```

#### E2E Tests
```
tests/e2e/
├── fixtures/              # Test data fixtures
│   ├── users.json
│   ├── partners.json
│   └── configurations.json
├── page-objects/          # Page object models
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── PartnersPage.ts
│   └── ConfigurationPage.ts
├── specs/                 # Test specifications
│   ├── auth.spec.ts
│   ├── dashboard.spec.ts
│   ├── partner-management.spec.ts
│   ├── pipeline-management.spec.ts
│   └── configuration.spec.ts
└── support/               # Test support files
    ├── commands.ts
    ├── database.ts
    └── utils.ts
```

### Test Examples

#### Frontend Component Test
```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigurationPanel } from '../ConfigurationPanel';
import * as configurationService from '../../services/configurationService';

// Mock the configuration service
jest.mock('../../services/configurationService');
const mockConfigurationService = configurationService as jest.Mocked<typeof configurationService>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ConfigurationPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render configuration categories', async () => {
    const mockConfigurations = [
      {
        id: '1',
        organizationId: 'org-1',
        category: 'commission',
        key: 'default_referral_rate',
        value: 15,
        dataType: 'number'
      }
    ];

    mockConfigurationService.getConfigurations.mockResolvedValue(mockConfigurations);

    render(<ConfigurationPanel organizationId="org-1" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Commission Settings')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    });
  });

  it('should update configuration value', async () => {
    const mockConfigurations = [
      {
        id: '1',
        organizationId: 'org-1',
        category: 'commission',
        key: 'default_referral_rate',
        value: 15,
        dataType: 'number'
      }
    ];

    mockConfigurationService.getConfigurations.mockResolvedValue(mockConfigurations);
    mockConfigurationService.updateConfiguration.mockResolvedValue({
      ...mockConfigurations[0],
      value: 18
    });

    render(<ConfigurationPanel organizationId="org-1" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    });

    const input = screen.getByDisplayValue('15');
    fireEvent.change(input, { target: { value: '18' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockConfigurationService.updateConfiguration).toHaveBeenCalledWith({
        id: '1',
        organizationId: 'org-1',
        category: 'commission',
        key: 'default_referral_rate',
        value: 18,
        dataType: 'number'
      });
    });
  });
});
```

#### Backend API Test
```typescript
import request from 'supertest';
import { app } from '../../../src/server';
import { ConfigurationRepository } from '../../../src/repositories/configurationRepository';
import { createTestUser, createTestOrganization } from '../../helpers/fixtures';

jest.mock('../../../src/repositories/configurationRepository');
const mockConfigurationRepository = ConfigurationRepository as jest.MockedClass<typeof ConfigurationRepository>;

describe('Configuration API', () => {
  let authToken: string;
  let organizationId: string;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Setup test organization and user
    const organization = await createTestOrganization();
    const user = await createTestUser(organization.id);
    organizationId = organization.id;

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: user.email,
        password: 'testpassword',
        organizationSubdomain: organization.subdomain
      });

    authToken = loginResponse.body.token;
  });

  describe('GET /api/v1/configurations', () => {
    it('should return organization configurations', async () => {
      const mockConfigurations = [
        {
          id: '1',
          organizationId,
          category: 'commission',
          key: 'default_referral_rate',
          value: 15,
          dataType: 'number'
        }
      ];

      mockConfigurationRepository.prototype.findByOrganizationAndCategory
        .mockResolvedValue(mockConfigurations);

      const response = await request(app)
        .get('/api/v1/configurations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual(mockConfigurations);
      expect(mockConfigurationRepository.prototype.findByOrganizationAndCategory)
        .toHaveBeenCalledWith(organizationId, undefined);
    });

    it('should filter configurations by category', async () => {
      const mockConfigurations = [
        {
          id: '1',
          organizationId,
          category: 'commission',
          key: 'default_referral_rate',
          value: 15,
          dataType: 'number'
        }
      ];

      mockConfigurationRepository.prototype.findByOrganizationAndCategory
        .mockResolvedValue(mockConfigurations);

      await request(app)
        .get('/api/v1/configurations?category=commission')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(mockConfigurationRepository.prototype.findByOrganizationAndCategory)
        .toHaveBeenCalledWith(organizationId, 'commission');
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .get('/api/v1/configurations')
        .expect(401);
    });
  });

  describe('POST /api/v1/configurations', () => {
    it('should create new configuration', async () => {
      const newConfiguration = {
        category: 'commission',
        key: 'default_reseller_rate',
        value: 30,
        dataType: 'number'
      };

      const createdConfiguration = {
        id: '2',
        organizationId,
        ...newConfiguration,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockConfigurationRepository.prototype.upsert.mockResolvedValue(createdConfiguration);

      const response = await request(app)
        .post('/api/v1/configurations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newConfiguration)
        .expect(201);

      expect(response.body).toEqual(createdConfiguration);
      expect(mockConfigurationRepository.prototype.upsert)
        .toHaveBeenCalledWith({
          organizationId,
          ...newConfiguration
        });
    });

    it('should validate configuration data', async () => {
      const invalidConfiguration = {
        category: 'invalid_category',
        key: '',
        value: 'invalid_number',
        dataType: 'number'
      };

      await request(app)
        .post('/api/v1/configurations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidConfiguration)
        .expect(400);
    });
  });
});
```

#### E2E Test
```typescript
describe('Partnership Management Workflow', () => {
  beforeEach(() => {
    // Setup test data
    cy.exec('npm run test:db:reset');
    cy.exec('npm run test:db:seed');
  });

  it('should complete full partner and opportunity workflow', () => {
    // Login
    cy.visit('/login');
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('testpassword');
    cy.get('[data-testid=subdomain-input]').type('testorg');
    cy.get('[data-testid=login-button]').click();

    // Navigate to partners page
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid=nav-partners]').click();

    // Create new partner
    cy.get('[data-testid=add-partner-button]').click();
    cy.get('[data-testid=partner-name-input]').type('Test Security Partner');
    cy.get('[data-testid=partner-domain-select]').select('Security');
    cy.get('[data-testid=commission-type-select]').select('referral');
    cy.get('[data-testid=commission-rate-input]').clear().type('18');
    cy.get('[data-testid=save-partner-button]').click();

    // Verify partner created
    cy.get('[data-testid=partner-list]').should('contain', 'Test Security Partner');
    cy.get('[data-testid=partner-commission]').should('contain', '18%');

    // Create opportunity for partner
    cy.get('[data-testid=create-opportunity-button]').click();
    cy.get('[data-testid=customer-name-input]').type('ACME Corp');
    cy.get('[data-testid=deal-value-input]').type('50000');
    cy.get('[data-testid=stage-select]').select('demo');
    cy.get('[data-testid=expected-close-date]').type('2025-03-15');
    cy.get('[data-testid=save-opportunity-button]').click();

    // Navigate to pipeline view
    cy.get('[data-testid=nav-pipeline]').click();
    cy.get('[data-testid=pipeline-kanban]').should('be.visible');
    cy.get('[data-testid=demo-stage-column]').should('contain', 'ACME Corp');

    // Advance opportunity stage
    cy.get('[data-testid=opportunity-card-acme]').click();
    cy.get('[data-testid=stage-select]').select('proposal');
    cy.get('[data-testid=probability-input]').clear().type('75');
    cy.get('[data-testid=update-opportunity-button]').click();

    // Verify commission calculation
    cy.get('[data-testid=commission-amount]').should('contain', '$9,000'); // 18% of $50,000

    // Check dashboard updates
    cy.get('[data-testid=nav-dashboard]').click();
    cy.get('[data-testid=pipeline-value]').should('contain', '$50,000');
    cy.get('[data-testid=proposal-stage-count]').should('contain', '1');

    // Configuration test - update commission rate
    cy.get('[data-testid=nav-configuration]').click();
    cy.get('[data-testid=commission-settings]').click();
    cy.get('[data-testid=default-referral-rate]').clear().type('20');
    cy.get('[data-testid=save-configuration]').click();

    // Verify configuration update affects calculation
    cy.get('[data-testid=nav-pipeline]').click();
    cy.get('[data-testid=opportunity-card-acme]').click();
    cy.get('[data-testid=commission-amount]').should('contain', '$10,000'); // 20% of $50,000
  });
});
```

## Coding Standards

### Critical Fullstack Rules

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

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `ConfigurationPanel.tsx` |
| Hooks | camelCase with 'use' | - | `useConfiguration.ts` |
| API Routes | - | kebab-case | `/api/v1/partner-configurations` |
| Database Tables | - | snake_case | `partner_configurations` |
| Configuration Keys | - | snake_case | `default_referral_commission_rate` |
| Service Methods | camelCase | camelCase | `calculateCommission()` |
| Environment Variables | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `DATABASE_URL` |

## Error Handling Strategy

### Error Flow

```mermaid
sequenceDiagram
    participant F as Frontend
    participant API as API Gateway
    participant S as Service
    participant DB as Database
    participant L as Logger

    F->>API: POST /configurations (invalid data)
    API->>API: Input validation (Joi)
    API->>API: Validation fails
    API->>L: Log validation error
    API-->>F: 400 Bad Request + error details

    F->>API: GET /partners (expired token)
    API->>API: JWT validation
    API->>API: Token expired
    API->>L: Log auth failure
    API-->>F: 401 Unauthorized + redirect to login

    F->>API: PUT /partners/123 (organization mismatch)
    API->>S: Update partner
    S->>DB: Query with RLS context
    DB-->>S: No rows found (filtered by organization)
    S->>L: Log authorization violation
    S-->>API: NotFoundError
    API-->>F: 404 Not Found

    F->>API: POST /opportunities (server error)
    API->>S: Create opportunity
    S->>DB: Database connection fails
    DB-->>S: Connection error
    S->>L: Log database error + stack trace
    S-->>API: InternalServerError
    API-->>F: 500 Internal Server Error + generic message
```

### Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable error message
    details?: {            // Additional error context
      field?: string;      // Field that caused validation error
      expected?: any;      // Expected value/format
      received?: any;      // Actual value received
      constraint?: string; // Database constraint violated
    };
    timestamp: string;     // ISO 8601 timestamp
    requestId: string;     // Unique request identifier for tracing
    organizationId?: string; // Organization context (for debugging)
  };
}

// Example error responses:
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Commission rate must be between 0 and 100",
    "details": {
      "field": "commissionRate",
      "expected": "number between 0 and 100",
      "received": 150
    },
    "timestamp": "2025-01-14T10:30:00.000Z",
    "requestId": "req_12345",
    "organizationId": "org_abc123"
  }
}

{
  "error": {
    "code": "CONFIGURATION_NOT_FOUND",
    "message": "Configuration key 'pipeline_stages' not found for organization",
    "details": {
      "category": "pipeline",
      "key": "pipeline_stages"
    },
    "timestamp": "2025-01-14T10:30:00.000Z",
    "requestId": "req_12346"
  }
}
```

### Frontend Error Handling

```typescript
// Global error boundary for React components
class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);

    // Report error to monitoring service
    reportError(error, {
      type: 'react_error',
      component: errorInfo.componentStack,
      user: getCurrentUser(),
      organization: getCurrentOrganization()
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" p={4}>
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            We've been notified and are working to fix this issue.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Reload Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// API error handling hook
export const useApiErrorHandler = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showError, setShowError] = useState<string | null>(null);

  const handleApiError = useCallback((error: any) => {
    if (error.response?.status === 401) {
      logout();
      navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      return;
    }

    if (error.response?.status === 403) {
      setShowError('You do not have permission to perform this action.');
      return;
    }

    if (error.response?.status >= 400 && error.response?.status < 500) {
      const errorMessage = error.response.data?.error?.message || 'Invalid request.';
      setShowError(errorMessage);
      return;
    }

    if (error.response?.status >= 500) {
      setShowError('Server error. Please try again or contact support.');
      reportError(error, { type: 'api_error' });
      return;
    }

    setShowError('Network error. Please check your connection and try again.');
  }, [logout, navigate]);

  return { handleApiError, showError, clearError: () => setShowError(null) };
};
```

### Backend Error Handling

```typescript
// Custom error classes
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string, expected?: any, received?: any) {
    super(message, 400, 'VALIDATION_ERROR', true, { field, expected, received });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with ID '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, 'RESOURCE_NOT_FOUND', true, { resource, identifier });
  }
}

export class ConfigurationError extends AppError {
  constructor(category: string, key: string) {
    super(
      `Configuration '${key}' not found in category '${category}'`,
      404,
      'CONFIGURATION_NOT_FOUND',
      true,
      { category, key }
    );
  }
}

// Global error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  const organizationId = (req as AuthenticatedRequest).user?.organizationId;

  // Log error with context
  logger.error('API Error', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.constructor.name
    },
    request: {
      id: requestId,
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      organizationId
    },
    timestamp: new Date().toISOString()
  });

  // Handle operational errors
  if (error instanceof AppError && error.isOperational) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        requestId,
        organizationId
      }
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId,
        organizationId
      }
    });
  }

  // Handle database errors
  if (error.name === 'QueryFailedError' || error.name === 'DatabaseError') {
    return res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        timestamp: new Date().toISOString(),
        requestId,
        organizationId
      }
    });
  }

  // Handle unexpected errors
  logger.error('Unexpected Error', { error, requestId });

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId,
      organizationId
    }
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring**: Sentry for error tracking, Web Vitals API for performance metrics
- **Backend Monitoring**: Prometheus metrics collection, Winston structured logging
- **Error Tracking**: Centralized error reporting with Sentry integration
- **Performance Monitoring**: APM with response time tracking, database query performance analysis

### Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP, FID, CLS) with targets: LCP <2.5s, FID <100ms, CLS <0.1
- JavaScript errors by component and user action
- API response times from client perspective with percentile tracking
- User interactions and feature adoption rates by organization

**Backend Metrics:**
- Request rate and response time by endpoint with 95th percentile targets
- Error rate by status code and endpoint
- Database connection pool utilization and query performance
- Configuration cache hit rates and update frequencies

**Business Metrics:**
- Revenue tracking accuracy vs manual calculations
- User adoption rates by feature and organization
- Configuration change frequency and impact on system performance
- Commission calculation processing time and accuracy rates

## Checklist Results Report

This comprehensive fullstack architecture document provides complete technical specifications for building a configuration-first, multi-tenant Partnership Management Platform. The architecture successfully addresses the core requirements:

✅ **Configuration-First Design**: All business logic driven by configurable settings
✅ **Multi-Tenant Architecture**: Row-level security and organization isolation
✅ **Scalable Technology Stack**: Docker containerization with cloud migration path
✅ **Executive Dashboard Focus**: Real-time KPI tracking and pipeline oversight
✅ **Flexible Commission Engine**: Configurable rates and payment models
✅ **Comprehensive Development Workflow**: 6-week implementation timeline
✅ **Production-Ready Infrastructure**: Security, monitoring, and deployment strategy

The architecture provides a solid foundation for immediate development while supporting future scaling to external sales and enterprise customers.

---

*Architecture document version 1.0 - Ready for implementation*