# Testing Strategy

## Testing Pyramid

```
           E2E Tests (Cypress)
          /                 \
    Integration Tests (API + DB)
    /                           \
Frontend Unit Tests      Backend Unit Tests
  (Jest + RTL)             (Jest + Supertest)
```

## Test Organization

### Frontend Tests
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

### Backend Tests
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

### E2E Tests
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

## Test Examples

### Frontend Component Test
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

### Backend API Test
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

### E2E Test
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
