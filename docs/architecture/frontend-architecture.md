# Frontend Architecture

## Component Architecture

### Component Organization
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

### Component Template
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

## State Management Architecture

### State Structure
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

### State Management Patterns
- **Configuration-driven UI**: All UI behavior controlled by configuration store
- **Optimistic Updates**: Update UI immediately, rollback on server error
- **Real-time Sync**: WebSocket integration for live configuration updates
- **Local Persistence**: Cache critical configuration for offline resilience

## Routing Architecture

### Route Organization
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

### Protected Route Pattern
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

## Frontend Services Layer

### API Client Setup
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

### Service Example
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
