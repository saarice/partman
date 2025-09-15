# Partnership Management Platform

A comprehensive partnership management system with real-time dashboard, opportunity tracking, and commission management.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm

### Development Setup

1. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd partnership-management-platform
   npm install
   ```

2. **Start Development Environment**
   ```bash
   ./scripts/dev.sh
   ```
   This script will:
   - Install all dependencies
   - Build shared packages
   - Start PostgreSQL and Redis via Docker
   - Run database migrations
   - Start both frontend and backend in development mode

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

4. **Demo Login**
   - Email: `vp@partman.com`
   - Password: `password`

## 📁 Project Structure

```
partnership-management-platform/
├── apps/
│   ├── web/                    # React frontend
│   └── api/                    # Express backend
├── packages/
│   ├── shared/                 # Shared types and utilities
│   ├── ui/                     # Shared UI components
│   └── config/                 # Shared configuration
├── infrastructure/
│   └── docker/                 # Docker configuration
├── scripts/                    # Development scripts
└── docs/                       # Documentation
    ├── epics/                  # Feature epics
    ├── stories/                # User stories
    ├── prd/                    # Product requirements (sharded)
    └── architecture/           # Technical architecture (sharded)
```

## 🎯 Features Implemented

### Story 1.1: VP Dashboard Overview ✅
- Real-time executive dashboard
- Revenue progress tracking with quarterly targets
- Pipeline health monitoring with funnel visualization
- Team performance overview with individual KPIs
- Partner health indicators with relationship scoring
- Alert center with prioritized notifications

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Material-UI, Zustand
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL 15
- **Cache**: Redis 7.2
- **Development**: Vite, Docker Compose
- **Architecture**: Monorepo with npm workspaces

## 🔧 Development Commands

```bash
# Start full development environment
./scripts/dev.sh

# Individual commands
npm run dev                    # Start both frontend and backend
npm run dev:web               # Frontend only
npm run dev:api               # Backend only
npm run build                 # Build all packages
npm run test                  # Run all tests
npm run lint                  # Lint all code
```

## 📊 Dashboard Features

### Revenue KPIs
- Current quarter progress vs. target ($XXX of $250K)
- Revenue forecasting with confidence intervals
- Historical performance comparison

### Pipeline Management
- Visual funnel representation (Lead → Demo → POC → Proposal → Closed)
- Weighted pipeline value calculations
- Conversion rate analysis by stage

### Team Analytics
- Individual performance tracking
- Task completion rates
- Weekly status compliance monitoring

### Partner Health
- Relationship health scoring
- Maintenance alert system
- Performance ranking and comparison

### Alert System
- Proactive notifications for critical events
- Priority-based alert management
- Configurable thresholds and timing

## 🏗️ Next Steps

Implement remaining user stories:
- Story 1.2: Pipeline Health Monitoring
- Story 1.3: Team Performance Overview
- Story 2.1: Partner Portfolio Management
- Story 2.2: Commission Calculator
- And 9 more stories...

## 📖 Documentation

- [Product Requirements](docs/prd/) - Detailed feature requirements
- [Architecture](docs/architecture/) - Technical architecture and design
- [User Stories](docs/stories/) - Detailed user stories with acceptance criteria
- [Epics](docs/epics/) - High-level feature epics

## 🤝 Contributing

1. Review the user stories in `docs/stories/`
2. Follow the technical architecture in `docs/architecture/`
3. Implement features following the defined acceptance criteria
4. Ensure all tests pass before submitting

## 📝 License

This project is proprietary and confidential.