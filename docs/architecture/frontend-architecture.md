# Frontend Architecture

## Component Architecture

### Executive-Class Component Organization (Epic 7)
```
src/
├── design-system/           # Epic 7: Executive Design System
│   ├── tokens/              # Design tokens and theme system
│   │   ├── colors.ts        # Professional color palette
│   │   ├── typography.ts    # Executive typography scale
│   │   ├── spacing.ts       # 8px grid system
│   │   ├── shadows.ts       # Sophisticated elevation system
│   │   └── animations.ts    # Smooth transition definitions
│   ├── components/          # Executive-grade component library
│   │   ├── Button/          # Professional button variants
│   │   ├── Card/            # Executive card components
│   │   ├── Table/           # Advanced data tables
│   │   ├── Form/            # Sophisticated form components
│   │   ├── Navigation/      # Multi-level navigation system
│   │   ├── Layout/          # Executive layout components
│   │   └── StatusPill/      # Professional status indicators
│   ├── charts/              # Advanced data visualization
│   │   ├── ExecutiveChart/  # Base chart component with themes
│   │   ├── PipelineFunnel/  # Interactive funnel visualization
│   │   ├── RevenueChart/    # Revenue trend analysis
│   │   ├── Heatmap/         # Partner relationship heatmaps
│   │   ├── ProgressRing/    # Goal progress visualization
│   │   └── CustomChart/     # Custom chart builder
│   └── themes/              # Professional theming system
│       ├── executive.ts     # Executive theme configuration
│       ├── light.ts         # Light mode theme
│       ├── dark.ts          # Dark mode theme
│       └── provider.tsx     # Theme provider component
├── components/
│   ├── common/              # Reusable components (enhanced)
│   │   ├── Layout/          # Executive layout system
│   │   ├── Navigation/      # Sophisticated navigation
│   │   ├── DataTable/       # Advanced virtualized tables
│   │   ├── Search/          # Global search component
│   │   └── ErrorBoundary/   # Error handling components
│   ├── dashboard/           # Executive dashboard components
│   │   ├── ExecutiveDashboard/    # Main executive interface
│   │   ├── KPICards/              # Real-time KPI widgets
│   │   ├── PipelineFunnel/        # Interactive pipeline visualization
│   │   ├── TeamPerformance/       # Team analytics dashboard
│   │   ├── RevenueOverview/       # Revenue tracking components
│   │   └── AlertCenter/           # Executive alert management
│   ├── visualization/       # Advanced analytics components
│   │   ├── InteractiveCharts/     # Chart.js + D3.js components
│   │   ├── DataExplorer/          # Drill-down analytics
│   │   ├── ForecastingCharts/     # Revenue forecasting
│   │   ├── RelationshipMaps/      # Partner relationship visualization
│   │   └── CustomReports/         # Executive reporting interface
│   ├── partners/            # Partner management components
│   │   ├── PartnerList/
│   │   ├── PartnerForm/
│   │   ├── CommissionCalculator/
│   │   └── RelationshipHealth/    # Partner health dashboard
│   ├── opportunities/       # Pipeline management components
│   │   ├── OpportunityKanban/     # Enhanced kanban board
│   │   ├── OpportunityForm/
│   │   ├── PipelineAnalytics/
│   │   └── ForecastingTools/      # Revenue forecasting
│   ├── admin/               # User management components (Epic 6)
│   │   ├── UserManagement/
│   │   ├── RoleEditor/
│   │   ├── AuditLog/
│   │   └── SystemSettings/
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

## Epic 7: Design System Architecture

### Design Token System
```typescript
// Design tokens for executive-class theming
export const designTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a'
    },
    executive: {
      50: '#f8fafc',
      100: '#f1f5f9',
      500: '#64748b',
      900: '#0f172a'
    },
    semantic: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace'
    },
    scale: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    }
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    4: '1rem',
    6: '1.5rem',
    8: '2rem',
    12: '3rem',
    16: '4rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  animations: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease'
  }
};
```

### Executive Component Template
```typescript
import React from 'react';
import { Box, Card, useTheme } from '@mui/material';
import { useDesignTokens } from '../../design-system/hooks/useDesignTokens';
import { ExecutiveThemeProvider } from '../../design-system/themes/provider';

interface ExecutiveComponentProps {
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  elevation?: 'low' | 'medium' | 'high';
  children?: React.ReactNode;
  className?: string;
}

export const ExecutiveComponent: React.FC<ExecutiveComponentProps> = ({
  variant = 'primary',
  size = 'md',
  elevation = 'medium',
  children,
  className
}) => {
  const theme = useTheme();
  const tokens = useDesignTokens();

  const getElevationStyles = () => {
    switch (elevation) {
      case 'low': return { boxShadow: tokens.shadows.sm };
      case 'high': return { boxShadow: tokens.shadows.xl };
      default: return { boxShadow: tokens.shadows.md };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { padding: tokens.spacing[4] };
      case 'lg': return { padding: tokens.spacing[8] };
      default: return { padding: tokens.spacing[6] };
    }
  };

  return (
    <Card
      className={className}
      sx={{
        ...getElevationStyles(),
        ...getSizeStyles(),
        borderRadius: tokens.spacing[3],
        transition: `all ${tokens.animations.normal}`,
        backgroundColor: theme.palette.background.paper,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: tokens.shadows.lg
        }
      }}
    >
      {children}
    </Card>
  );
};
```

### Advanced Chart Component Template
```typescript
import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '@mui/material';
import { useDesignTokens } from '../../design-system/hooks/useDesignTokens';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ExecutiveChartProps {
  data: any[];
  type: 'bar' | 'line' | 'pie' | 'funnel';
  title?: string;
  interactive?: boolean;
  exportable?: boolean;
  height?: number;
  onDataPointClick?: (data: any) => void;
}

export const ExecutiveChart: React.FC<ExecutiveChartProps> = ({
  data,
  type,
  title,
  interactive = true,
  exportable = true,
  height = 400,
  onDataPointClick
}) => {
  const theme = useTheme();
  const tokens = useDesignTokens();

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: tokens.typography.fontFamily.primary,
            size: parseInt(tokens.typography.scale.sm)
          },
          color: theme.palette.text.primary
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          family: tokens.typography.fontFamily.primary,
          size: parseInt(tokens.typography.scale.lg),
          weight: '600'
        },
        color: theme.palette.text.primary
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        cornerRadius: parseInt(tokens.spacing[2])
      }
    },
    scales: {
      x: {
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: tokens.typography.fontFamily.primary
          }
        }
      },
      y: {
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: tokens.typography.fontFamily.primary
          }
        }
      }
    },
    onClick: interactive ? onDataPointClick : undefined,
    animation: {
      duration: parseInt(tokens.animations.slow.replace('ms', ''))
    }
  }), [theme, tokens, title, interactive, onDataPointClick]);

  return (
    <div style={{ height }}>
      <Bar data={data} options={chartOptions} />
    </div>
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
  // Epic 7: Executive theming and personalization
  theme: 'light' | 'dark' | 'auto' | 'high-contrast';
  density: 'compact' | 'standard' | 'comfortable';
  fontFamily: 'inter' | 'roboto' | 'system';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  animations: boolean;

  // Layout and navigation
  dashboardLayout: DashboardLayout;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  navigationStyle: 'sidebar' | 'tabs' | 'breadcrumb';

  // Personalization
  customColors?: CustomColorScheme;
  savedLayouts: Record<string, DashboardLayout>;
  preferences: UserPreferences;

  // Notification settings
  notificationPreferences: NotificationSettings;
  alertSettings: AlertConfiguration;

  // Actions
  setTheme: (theme: UIState['theme']) => void;
  setDensity: (density: UIState['density']) => void;
  setFontSettings: (family: UIState['fontFamily'], size: UIState['fontSize']) => void;
  toggleAnimations: () => void;
  setDashboardLayout: (layout: DashboardLayout) => void;
  saveLayout: (name: string, layout: DashboardLayout) => void;
  loadLayout: (name: string) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  updateNotificationSettings: (settings: NotificationSettings) => void;
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
