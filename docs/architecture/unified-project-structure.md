# Unified Project Structure

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
