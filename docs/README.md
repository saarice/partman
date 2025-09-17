# ISV Pipeline Tracker MVP - Documentation

## 📋 Overview

The ISV Pipeline Tracker MVP is a Docker-based Strategic Partnership Resource Optimization Engine that provides VP Strategic Partnerships with comprehensive visibility into department performance and ISV revenue pipeline management. This documentation provides complete technical and product specifications for the executive-class platform.

## 🎯 Current Status

**Epic 6: User Management** ✅ **COMPLETED**
**Epic 7: Executive UI Design System** 🔄 **IN DEVELOPMENT**

## 📚 Documentation Structure

> **📋 Organization Guide**: See [ORGANIZATION.md](./ORGANIZATION.md) for detailed folder structure and navigation strategy


### 🎪 Project Overview
- **[Project Brief](./brief.md)** - Executive summary, problem statement, and solution approach
  - *Sharded version: [brief/](./brief/) for detailed sections*
- **[Brainstorming Session Results](./brainstorming-session-results.md)** - Initial discovery and requirements gathering

### 📋 Product Requirements
- **[Product Requirements Document (PRD)](./prd.md)** - Comprehensive product specifications
  - *Sharded version: [prd/](./prd/) for detailed sections*
- **[Development Plan](./development-plan.md)** - Implementation roadmap and timeline

### 🏗️ Technical Architecture
- **[Architecture Documentation](./architecture/)** - Complete technical architecture ⭐ **PRIMARY**
  - [High Level Architecture](./architecture/high-level-architecture.md)
  - [Tech Stack](./architecture/tech-stack.md) - Technologies and frameworks
  - [Frontend Architecture](./architecture/frontend-architecture.md) - React/UI architecture
  - [Backend Architecture](./architecture/backend-architecture.md) - API/service layer
  - [Database Schema](./architecture/database-schema.md) - Data persistence design
  - [Design System Architecture](./architecture/design-system-architecture.md) - Epic 7 design system
  - [UI/UX Theme Guidelines](./architecture/ui-ux-theme-guidelines.md) - Professional styling standards
  - [Security and Performance](./architecture/security-and-performance.md)
  - [Testing Strategy](./architecture/testing-strategy.md)
  - [Deployment Architecture](./architecture/deployment-architecture.md)

- **[Complete Architecture Reference](./architecture-main.md)** *(comprehensive single document)*
- **[Legacy Documentation](./legacy/)** *(historical reference)*

### 📖 User Stories and Epics
- **[Epic Documentation](./epics/)** - All epic specifications
  - [Epic 1: Executive Dashboard and KPI Monitoring](./epics/epic-1-executive-dashboard-kpi-monitoring.md)
  - [Epic 2: ISV Partner and Commission Management](./epics/epic-2-isv-partner-commission-management.md)
  - [Epic 3: Opportunity Pipeline Management](./epics/epic-3-opportunity-pipeline-management.md)
  - [Epic 4: Weekly Status and Task Management](./epics/epic-4-weekly-status-task-management.md)
  - [Epic 5: Alerts and Notification System](./epics/epic-5-alerts-notification-system.md)
  - [Epic 6: Comprehensive User Management](./epics/epic-6-comprehensive-user-management.md) ✅
  - [Epic 7: Executive-Class UI Design System](./epics/epic-7-executive-ui-design-system.md) 🔄

- **[Story Documentation](./stories/)** - Detailed user stories with acceptance criteria
  - Executive Dashboard Stories (1.x)
  - Partner Management Stories (2.x)
  - Pipeline Management Stories (3.x)
  - Status Management Stories (4.x)
  - Alert System Stories (5.x)
  - User Management Stories (6.x) ✅
  - UI Design System Stories (7.x) 🔄

### 🛠️ Development Resources
- **[Development Workflow](./architecture/development-workflow.md)** - Development setup and processes
- **[Coding Standards](./architecture/coding-standards.md)** - Code quality guidelines
- **[Legacy Documentation](./legacy/)** - Historical reference documents

## 🚀 Quick Start

### For Product Managers
1. Start with [Project Brief](./brief.md) for executive summary
2. Review [PRD](./prd.md) for detailed requirements
3. Check [Epic 7](./epics/epic-7-executive-ui-design-system.md) for current development focus

### For Developers
1. Read [Architecture Overview](./architecture/)
2. Review [Tech Stack](./architecture/tech-stack.md) for technology choices
3. Check [Design System](./architecture/design-system-architecture.md) for UI development
4. Follow [Developer Handoff](./developer-handoff.md) for setup

### For Designers
1. Review [UI/UX Theme Guidelines](./architecture/ui-ux-theme-guidelines.md) for design standards
2. Check [Design System Architecture](./architecture/design-system-architecture.md) for component specifications
3. Reference [Epic 7 Stories](./stories/7.1-executive-dashboard-design-system.story.md) for requirements

## 📊 Epic Status Overview

| Epic | Status | Progress | Key Features |
|------|--------|----------|--------------|
| Epic 1: Executive Dashboard | ✅ Completed | 100% | KPI monitoring, pipeline visualization |
| Epic 2: Partner Management | ✅ Completed | 100% | Partner portfolios, commission calculation |
| Epic 3: Pipeline Management | ✅ Completed | 100% | Opportunity tracking, forecasting |
| Epic 4: Status Management | 🔄 Optional | 0% | Weekly status, task management |
| Epic 5: Alert System | ✅ Integrated | 90% | Proactive notifications, alert management |
| Epic 6: User Management | ✅ Completed | 100% | RBAC, user lifecycle, audit logging |
| Epic 7: Executive UI Design | 🔄 In Progress | 30% | Design system, advanced visualization |

## 🎨 Design System Resources

### For Epic 7 Development
- **[Design Token System](./architecture/design-system-architecture.md#design-token-system)** - Color, typography, spacing tokens
- **[Executive Components](./architecture/design-system-architecture.md#component-architecture)** - Professional component library
- **[Chart Architecture](./architecture/design-system-architecture.md#chart-system-architecture)** - Advanced data visualization
- **[Theme System](./architecture/design-system-architecture.md#theme-system-architecture)** - Light/dark/high-contrast themes

### Implementation Guidelines
- **[Color Palette](./architecture/ui-ux-theme-guidelines.md#color-system)** - Executive color standards
- **[Typography Scale](./architecture/ui-ux-theme-guidelines.md#typography-system)** - Professional typography hierarchy
- **[Component Standards](./architecture/ui-ux-theme-guidelines.md#component-standards)** - Consistent component styling

## 📈 Business Context

**Revenue Target**: $250K quarterly ISV revenue
**Team Size**: 5 people (3 Sales Managers, 2 Partnership Managers)
**Partner Ecosystem**: 20+ technology partners across FinOps, Security, Observability, DevOps, Data Analytics
**Executive Focus**: C-level dashboard with sophisticated data visualization

## 🔗 Key Integration Points

- **Authentication**: JWT-based with role-based access control
- **Database**: PostgreSQL 15+ with Redis caching
- **Frontend**: React 18+ with Material-UI 5+ and executive design system
- **Charts**: Chart.js 4.x + D3.js 7.8+ for advanced visualization
- **Deployment**: Docker Compose for local deployment

## 📞 Support and Feedback

For questions or clarifications about any documentation:
- Review the relevant architecture documentation in `/architecture`
- Check user stories in `/stories` for detailed acceptance criteria
- Reference epic documentation in `/epics` for feature context

---

*Last Updated: 2025-09-17 | Current Development Focus: Epic 7 - Executive UI Design System*