# Documentation Organization Guide

## 📁 Folder Structure

```
docs/
├── README.md                           # 🏠 Main documentation index
├── ORGANIZATION.md                     # 📋 This organization guide
│
├── 📋 PROJECT OVERVIEW
├── brief.md                           # Executive summary (+ brief/ sharded)
├── brief/                             # Sharded project brief
├── brainstorming-session-results.md   # Initial discovery
├── development-plan.md                # Implementation roadmap
│
├── 📋 PRODUCT REQUIREMENTS
├── prd.md                             # Product requirements (+ prd/ sharded)
├── prd/                               # Sharded PRD sections
│
├── 🏗️ TECHNICAL ARCHITECTURE
├── architecture/                      # ⭐ PRIMARY ARCHITECTURE DOCS
│   ├── index.md                       # Architecture navigation
│   ├── high-level-architecture.md     # System overview
│   ├── tech-stack.md                  # Technology choices
│   ├── frontend-architecture.md       # React/UI architecture (Epic 7)
│   ├── backend-architecture.md        # API/service layer
│   ├── database-schema.md             # Data persistence
│   ├── design-system-architecture.md  # Epic 7: Design system
│   ├── ui-ux-theme-guidelines.md      # Professional styling
│   ├── components.md                  # Service architecture
│   ├── api-specification.md           # REST API design
│   ├── security-and-performance.md    # Non-functional requirements
│   ├── testing-strategy.md            # Test organization
│   ├── deployment-architecture.md     # CI/CD and environments
│   ├── development-workflow.md        # Setup and processes
│   ├── coding-standards.md            # Code quality
│   ├── error-handling-strategy.md     # Error management
│   └── monitoring-and-observability.md
├── architecture-main.md               # Complete reference document
│
├── 📖 USER STORIES & EPICS
├── epics/                             # Epic specifications
│   ├── epic-1-executive-dashboard-kpi-monitoring.md
│   ├── epic-2-isv-partner-commission-management.md
│   ├── epic-3-opportunity-pipeline-management.md
│   ├── epic-4-weekly-status-task-management.md
│   ├── epic-5-alerts-notification-system.md
│   ├── epic-6-comprehensive-user-management.md ✅
│   └── epic-7-executive-ui-design-system.md 🔄
├── stories/                           # Detailed user stories
│   ├── 1.x-*.story.md                 # Executive dashboard stories
│   ├── 2.x-*.story.md                 # Partner management stories
│   ├── 3.x-*.story.md                 # Pipeline management stories
│   ├── 4.x-*.story.md                 # Status management stories
│   ├── 5.x-*.story.md                 # Alert system stories
│   ├── 6.x-*.story.md                 # User management stories ✅
│   └── 7.x-*.story.md                 # UI design system stories 🔄
│
└── 📚 LEGACY & REFERENCE
    └── legacy/                        # Historical documents
        ├── README.md                  # Legacy documentation guide
        ├── legacy-architecture.md     # Original technical architecture
        └── developer-handoff.md       # Original developer onboarding
```

## 🎯 Navigation Strategy

### For Different Roles

#### **Product Managers**
1. Start with [`README.md`](./README.md) for overview
2. Review [`brief.md`](./brief.md) for executive summary
3. Check [`prd.md`](./prd.md) for detailed requirements
4. Monitor [`epics/epic-7-executive-ui-design-system.md`](./epics/epic-7-executive-ui-design-system.md) for current development

#### **Developers**
1. Read [`architecture/`](./architecture/) for complete technical specs
2. Start with [`architecture/high-level-architecture.md`](./architecture/high-level-architecture.md)
3. Review [`architecture/tech-stack.md`](./architecture/tech-stack.md) for technologies
4. Check [`architecture/design-system-architecture.md`](./architecture/design-system-architecture.md) for Epic 7
5. Follow [`architecture/development-workflow.md`](./architecture/development-workflow.md) for setup

#### **Designers**
1. Review [`architecture/ui-ux-theme-guidelines.md`](./architecture/ui-ux-theme-guidelines.md) for standards
2. Check [`architecture/design-system-architecture.md`](./architecture/design-system-architecture.md) for components
3. Reference [`stories/7.1-executive-dashboard-design-system.story.md`](./stories/7.1-executive-dashboard-design-system.story.md) for requirements

#### **Executives**
1. Read [`brief.md`](./brief.md) for business context
2. Review Epic status in [`README.md`](./README.md)
3. Check quarterly progress in development plan

## 📊 Documentation Types

### **Sharded vs Single Documents**

#### **Sharded Documents** (Recommended)
- [`architecture/`](./architecture/) - Well-organized technical sections
- [`brief/`](./brief/) - Project overview sections
- [`prd/`](./prd/) - Product requirement sections

#### **Single Documents** (Reference)
- [`architecture-main.md`](./architecture-main.md) - Complete architecture reference
- [`brief.md`](./brief.md) - Complete project brief
- [`prd.md`](./prd.md) - Complete product requirements

### **Epic Documentation**
- [`epics/`](./epics/) - High-level feature specifications
- [`stories/`](./stories/) - Detailed user stories with acceptance criteria

## 🔄 Current Development Focus

### **Epic 7: Executive UI Design System** (In Progress)
- **Architecture**: [`architecture/design-system-architecture.md`](./architecture/design-system-architecture.md)
- **Guidelines**: [`architecture/ui-ux-theme-guidelines.md`](./architecture/ui-ux-theme-guidelines.md)
- **Frontend**: [`architecture/frontend-architecture.md`](./architecture/frontend-architecture.md)
- **Tech Stack**: [`architecture/tech-stack.md`](./architecture/tech-stack.md)
- **Stories**: [`stories/7.*.story.md`](./stories/)

### **Epic 6: User Management** (Completed ✅)
- **Stories**: [`stories/6.*.story.md`](./stories/)
- **Epic**: [`epics/epic-6-comprehensive-user-management.md`](./epics/epic-6-comprehensive-user-management.md)

## 🔗 Key Integration Points

### **Cross-References**
- Architecture documents reference each other via relative links
- Stories reference epics and architecture specs
- Epic status tracked in main README

### **File Naming Conventions**
- **Stories**: `{epic}.{story}-{kebab-case-name}.story.md`
- **Epics**: `epic-{number}-{kebab-case-name}.md`
- **Architecture**: `{kebab-case-name}.md`

## 📈 Maintenance

### **Regular Updates**
- Epic status updates in [`README.md`](./README.md)
- Architecture updates in [`architecture/`](./architecture/)
- Story completion status in individual files

### **Legacy Management**
- Outdated documents moved to [`legacy/`](./legacy/)
- Legacy documents marked with headers
- Cross-references updated to current docs

---

*Last Updated: 2025-09-17 | Current Focus: Epic 7 - Executive UI Design System*