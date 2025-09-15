# Data Models

## Configuration Model

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

### TypeScript Interface
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

### Relationships
- One-to-many with Organizations
- Referenced by all other models for configuration-driven behavior

## Organization Model

**Purpose**: Multi-tenant organization entity containing all business configuration and user management

**Key Attributes**:
- name: String - Organization display name
- subdomain: String - Unique tenant identifier for routing
- settings: JSONB - Organization-specific settings cache
- isActive: Boolean - Tenant activation status
- subscriptionTier: String - Feature access level
- maxUsers: Number - User limit for organization

### TypeScript Interface
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

### Relationships
- One-to-many with Users, Partners, Opportunities
- One-to-many with Configurations

## Partner Model

**Purpose**: Configurable partner/vendor entity with flexible commission and relationship structures

**Key Attributes**:
- organizationId: UUID - Tenant isolation
- name: String - Partner company name
- domain: String - Business domain category (configurable)
- commissionStructure: JSONB - Flexible commission configuration
- relationshipHealth: Number - Calculated health score
- primaryContact: JSONB - Contact information
- agreementDetails: JSONB - Configurable agreement terms

### TypeScript Interface
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

### Relationships
- Many-to-one with Organization
- One-to-many with Opportunities
- One-to-many with PartnerInteractions

## Opportunity Model

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

### TypeScript Interface
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

### Relationships
- Many-to-one with Organization and Partner
- One-to-many with OpportunityStageHistory
- Many-to-one with User (assigned)

## User Model

**Purpose**: Multi-tenant user management with configurable roles and permissions

**Key Attributes**:
- organizationId: UUID - Tenant isolation
- email: String - Authentication identifier
- role: String - Configurable role name
- permissions: JSONB - Role-based permissions
- personalSettings: JSONB - User customization preferences

### TypeScript Interface
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

### Relationships
- Many-to-one with Organization
- One-to-many with Opportunities (assigned)
- One-to-many with WeeklyStatus
