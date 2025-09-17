# Design System Architecture (Epic 7)

## Overview

The ISV Pipeline Tracker executive design system provides a comprehensive foundation for building sophisticated, professional-grade user interfaces that meet C-level executive expectations. This architecture document outlines the complete design token system, component library structure, and theming capabilities.

## Design Token System

### Token Categories

#### Color Tokens
```typescript
export const colorTokens = {
  // Primary Executive Palette
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Base primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },

  // Executive Gray Scale
  executive: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',  // Base executive
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },

  // Semantic Colors
  semantic: {
    success: {
      light: '#d1fae5',
      base: '#22c55e',
      dark: '#15803d'
    },
    warning: {
      light: '#fef3c7',
      base: '#f59e0b',
      dark: '#d97706'
    },
    error: {
      light: '#fee2e2',
      base: '#ef4444',
      dark: '#dc2626'
    },
    info: {
      light: '#dbeafe',
      base: '#3b82f6',
      dark: '#1d4ed8'
    }
  },

  // Premium Accent
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',  // Premium gold
    900: '#78350f'
  }
};
```

#### Typography Tokens
```typescript
export const typographyTokens = {
  fontFamily: {
    primary: 'Inter, system-ui, -apple-system, sans-serif',
    secondary: 'Roboto, Arial, sans-serif',
    mono: 'JetBrains Mono, Consolas, monospace'
  },

  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem'      // 48px
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
};
```

#### Spacing Tokens
```typescript
export const spacingTokens = {
  // 8px grid system
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  7: '1.75rem',  // 28px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem'     // 128px
};
```

#### Shadow Tokens
```typescript
export const shadowTokens = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Executive specific shadows
  executive: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    focus: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  }
};
```

#### Border Radius Tokens
```typescript
export const borderRadiusTokens = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.375rem', // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem',   // 32px
  full: '9999px'
};
```

#### Animation Tokens
```typescript
export const animationTokens = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms'
  },

  easing: {
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
    'ease-in-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },

  // Executive-specific animations
  executive: {
    cardHover: 'transform 200ms ease-out',
    buttonPress: 'transform 150ms ease-in-out',
    modalSlide: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    chartAnimation: 'all 500ms ease-out'
  }
};
```

## Theme System Architecture

### Theme Structure
```typescript
interface ExecutiveTheme {
  mode: 'light' | 'dark' | 'high-contrast';
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  shadows: ShadowTokens;
  borderRadius: BorderRadiusTokens;
  animations: AnimationTokens;
  breakpoints: BreakpointTokens;
  zIndex: ZIndexTokens;
}
```

### Light Theme Configuration
```typescript
export const lightTheme: ExecutiveTheme = {
  mode: 'light',
  colors: {
    ...colorTokens,
    background: {
      primary: colorTokens.executive[50],    // #f8fafc
      secondary: colorTokens.executive[100], // #f1f5f9
      tertiary: '#ffffff'
    },
    text: {
      primary: colorTokens.executive[900],   // #0f172a
      secondary: colorTokens.executive[700], // #334155
      tertiary: colorTokens.executive[500]   // #64748b
    },
    border: {
      light: colorTokens.executive[200],     // #e2e8f0
      medium: colorTokens.executive[300],    // #cbd5e1
      heavy: colorTokens.executive[400]      // #94a3b8
    }
  },
  // ... other tokens
};
```

### Dark Theme Configuration
```typescript
export const darkTheme: ExecutiveTheme = {
  mode: 'dark',
  colors: {
    ...colorTokens,
    background: {
      primary: colorTokens.executive[900],   // #0f172a
      secondary: colorTokens.executive[800], // #1e293b
      tertiary: colorTokens.executive[700]   // #334155
    },
    text: {
      primary: colorTokens.executive[50],    // #f8fafc
      secondary: colorTokens.executive[200], // #e2e8f0
      tertiary: colorTokens.executive[400]   // #94a3b8
    },
    border: {
      light: colorTokens.executive[700],     // #334155
      medium: colorTokens.executive[600],    // #475569
      heavy: colorTokens.executive[500]      // #64748b
    }
  },
  // ... other tokens adapted for dark mode
};
```

### High Contrast Theme
```typescript
export const highContrastTheme: ExecutiveTheme = {
  mode: 'high-contrast',
  colors: {
    ...colorTokens,
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      tertiary: '#ffffff'
    },
    text: {
      primary: '#000000',
      secondary: '#000000',
      tertiary: '#000000'
    },
    border: {
      light: '#000000',
      medium: '#000000',
      heavy: '#000000'
    }
  },
  // Enhanced contrast ratios for accessibility
};
```

## Component Architecture

### Base Component Interface
```typescript
interface BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}
```

### Executive Button System
```typescript
interface ExecutiveButtonProps extends BaseComponentProps {
  intent?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent) => void;
}

export const ExecutiveButton: React.FC<ExecutiveButtonProps> = ({
  variant = 'primary',
  size = 'md',
  intent = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className,
  onClick
}) => {
  const theme = useExecutiveTheme();

  const buttonStyles = useMemo(() => ({
    // Size variants
    ...(size === 'sm' && {
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      fontSize: theme.typography.fontSize.sm,
      minHeight: '32px'
    }),
    ...(size === 'md' && {
      padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
      fontSize: theme.typography.fontSize.base,
      minHeight: '40px'
    }),
    ...(size === 'lg' && {
      padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
      fontSize: theme.typography.fontSize.lg,
      minHeight: '48px'
    }),

    // Intent variants
    ...(intent === 'primary' && {
      backgroundColor: theme.colors.primary[500],
      color: '#ffffff',
      '&:hover': {
        backgroundColor: theme.colors.primary[600],
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows.executive.hover
      }
    }),

    // Common styles
    borderRadius: theme.borderRadius.md,
    border: 'none',
    fontWeight: theme.typography.fontWeight.medium,
    transition: theme.animations.executive.buttonPress,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2]
  }), [theme, size, intent, disabled, loading, fullWidth]);

  return (
    <button
      className={className}
      style={buttonStyles}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <LoadingSpinner size={size} />
      ) : (
        <>
          {leftIcon && <span>{leftIcon}</span>}
          {children}
          {rightIcon && <span>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
```

### Executive Card System
```typescript
interface ExecutiveCardProps extends BaseComponentProps {
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const ExecutiveCard: React.FC<ExecutiveCardProps> = ({
  elevation = 'md',
  padding = 'md',
  interactive = false,
  header,
  footer,
  children,
  className
}) => {
  const theme = useExecutiveTheme();

  const cardStyles = useMemo(() => ({
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.border.light}`,
    boxShadow: theme.shadows[elevation],
    transition: interactive ? theme.animations.executive.cardHover : 'none',
    overflow: 'hidden',

    ...(interactive && {
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows.executive.hover
      }
    }),

    ...(padding === 'sm' && { padding: theme.spacing[4] }),
    ...(padding === 'md' && { padding: theme.spacing[6] }),
    ...(padding === 'lg' && { padding: theme.spacing[8] }),
    ...(padding === 'none' && { padding: 0 })
  }), [theme, elevation, padding, interactive]);

  return (
    <div className={className} style={cardStyles}>
      {header && (
        <div style={{
          marginBottom: theme.spacing[4],
          paddingBottom: theme.spacing[4],
          borderBottom: `1px solid ${theme.colors.border.light}`
        }}>
          {header}
        </div>
      )}

      <div>{children}</div>

      {footer && (
        <div style={{
          marginTop: theme.spacing[4],
          paddingTop: theme.spacing[4],
          borderTop: `1px solid ${theme.colors.border.light}`
        }}>
          {footer}
        </div>
      )}
    </div>
  );
};
```

## Chart System Architecture

### Executive Chart Theme
```typescript
export const executiveChartTheme = {
  colors: {
    primary: [
      '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'
    ],
    semantic: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    gradient: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      success: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    }
  },

  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      title: 16,
      label: 12,
      tooltip: 14
    }
  },

  animation: {
    duration: 500,
    easing: 'easeOutQuart'
  }
};
```

### Chart Component Template
```typescript
interface ExecutiveChartProps {
  data: any[];
  type: 'line' | 'bar' | 'pie' | 'area' | 'funnel';
  title?: string;
  subtitle?: string;
  height?: number;
  interactive?: boolean;
  exportable?: boolean;
  theme?: 'light' | 'dark';
  onDataPointClick?: (data: any, event: any) => void;
}

export const ExecutiveChart: React.FC<ExecutiveChartProps> = ({
  data,
  type,
  title,
  subtitle,
  height = 400,
  interactive = true,
  exportable = true,
  theme: chartTheme,
  onDataPointClick
}) => {
  const appTheme = useExecutiveTheme();
  const chartRef = useRef<Chart | null>(null);

  const chartConfig = useMemo(() => {
    const baseConfig = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index' as const
      },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            font: {
              family: executiveChartTheme.typography.fontFamily,
              size: executiveChartTheme.typography.fontSize.label
            },
            color: appTheme.colors.text.secondary,
            usePointStyle: true,
            padding: 20
          }
        },
        title: {
          display: !!title,
          text: title,
          font: {
            family: executiveChartTheme.typography.fontFamily,
            size: executiveChartTheme.typography.fontSize.title,
            weight: '600'
          },
          color: appTheme.colors.text.primary,
          padding: {
            bottom: 20
          }
        },
        subtitle: {
          display: !!subtitle,
          text: subtitle,
          font: {
            family: executiveChartTheme.typography.fontFamily,
            size: executiveChartTheme.typography.fontSize.label
          },
          color: appTheme.colors.text.secondary
        },
        tooltip: {
          backgroundColor: appTheme.colors.background.tertiary,
          titleColor: appTheme.colors.text.primary,
          bodyColor: appTheme.colors.text.secondary,
          borderColor: appTheme.colors.border.medium,
          borderWidth: 1,
          cornerRadius: parseInt(appTheme.borderRadius.md),
          padding: 12,
          font: {
            family: executiveChartTheme.typography.fontFamily,
            size: executiveChartTheme.typography.fontSize.tooltip
          }
        }
      },
      scales: type !== 'pie' ? {
        x: {
          grid: {
            color: appTheme.colors.border.light,
            drawBorder: false
          },
          ticks: {
            color: appTheme.colors.text.tertiary,
            font: {
              family: executiveChartTheme.typography.fontFamily,
              size: executiveChartTheme.typography.fontSize.label
            }
          }
        },
        y: {
          grid: {
            color: appTheme.colors.border.light,
            drawBorder: false
          },
          ticks: {
            color: appTheme.colors.text.tertiary,
            font: {
              family: executiveChartTheme.typography.fontFamily,
              size: executiveChartTheme.typography.fontSize.label
            }
          }
        }
      } : undefined,
      onClick: interactive ? onDataPointClick : undefined,
      animation: {
        duration: executiveChartTheme.animation.duration,
        easing: executiveChartTheme.animation.easing
      }
    };

    return baseConfig;
  }, [appTheme, title, subtitle, interactive, onDataPointClick, type]);

  return (
    <div style={{ height, position: 'relative' }}>
      {exportable && (
        <ExportButton
          chartRef={chartRef}
          filename={`${title || 'chart'}-${new Date().toISOString().split('T')[0]}`}
        />
      )}

      <Chart
        ref={chartRef}
        type={type}
        data={data}
        options={chartConfig}
        height={height}
      />
    </div>
  );
};
```

## Responsive Design System

### Breakpoint Architecture
```typescript
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export const useResponsive = () => {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const isMobile = viewport.width < parseInt(breakpoints.md);
  const isTablet = viewport.width >= parseInt(breakpoints.md) && viewport.width < parseInt(breakpoints.lg);
  const isDesktop = viewport.width >= parseInt(breakpoints.lg);

  return { isMobile, isTablet, isDesktop, viewport };
};
```

## Performance Optimization

### Design Token Caching
```typescript
class DesignTokenCache {
  private static instance: DesignTokenCache;
  private cache = new Map<string, any>();

  static getInstance() {
    if (!DesignTokenCache.instance) {
      DesignTokenCache.instance = new DesignTokenCache();
    }
    return DesignTokenCache.instance;
  }

  getToken(path: string): any {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    const value = this.resolveToken(path);
    this.cache.set(path, value);
    return value;
  }

  private resolveToken(path: string): any {
    // Token resolution logic
    const parts = path.split('.');
    let current = designTokens;

    for (const part of parts) {
      current = current[part];
      if (current === undefined) {
        throw new Error(`Design token not found: ${path}`);
      }
    }

    return current;
  }
}
```

## Accessibility Architecture

### WCAG 2.1 AA Compliance
```typescript
export const accessibilityTokens = {
  colorContrast: {
    normalText: 4.5,     // Minimum for normal text
    largeText: 3.0,      // Minimum for large text
    uiComponents: 3.0    // Minimum for UI components
  },

  focusIndicators: {
    outline: `2px solid ${colorTokens.primary[500]}`,
    outlineOffset: '2px',
    borderRadius: borderRadiusTokens.sm
  },

  motionReduction: {
    transition: 'none',
    animation: 'none'
  }
};
```

## Integration Guidelines

### CSS Custom Properties Integration
```css
:root {
  /* Color tokens */
  --color-primary-500: #3b82f6;
  --color-executive-50: #f8fafc;
  --color-executive-900: #0f172a;

  /* Typography tokens */
  --font-family-primary: 'Inter, system-ui, sans-serif';
  --font-size-base: 1rem;
  --font-weight-medium: 500;

  /* Spacing tokens */
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;

  /* Shadow tokens */
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-executive-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  --color-executive-50: #0f172a;
  --color-executive-900: #f8fafc;
}
```

### TypeScript Integration
```typescript
declare module '@emotion/react' {
  export interface Theme extends ExecutiveTheme {}
}

// Styled components integration
const StyledButton = styled.button<{ variant: string }>`
  background-color: ${({ theme, variant }) => theme.colors.primary[500]};
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[6]}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: ${({ theme }) => theme.animations.executive.buttonPress};
`;
```

## Conclusion

This design system architecture provides a comprehensive foundation for building executive-class user interfaces with consistent theming, accessibility compliance, and professional visual design. The token-based approach ensures maintainability and scalability as the platform evolves.