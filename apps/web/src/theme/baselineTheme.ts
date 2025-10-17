import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

/**
 * Material-UI Theme - Ported from Static HTML CSS Variables
 * Epic 9 - React Migration with EXACT UI Preservation
 *
 * This theme MUST produce pixel-perfect match to static HTML design system.
 * All values are extracted from:
 * - /src/design-system/components/enterprise.css
 * - /src/design-system/components/charts.css
 *
 * Source of Truth: tests/visual-baseline/ screenshots
 */

// ============================================================================
// COLOR PALETTE - Exact hex codes from static HTML
// ============================================================================

const colors = {
  // Primary (Blue/Purple) - Brand Color
  primary: {
    50: '#f0f4ff',
    100: '#e0e9ff',
    500: '#667eea',  // Main brand color
    600: '#5a67d8',
    700: '#4c51bf',
  },

  // Neutrals (Grays) - Text, backgrounds, borders
  neutral: {
    0: '#ffffff',    // White
    25: '#fcfcfd',   // Background
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',  // Borders
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',  // Text
    800: '#1f2937',
    900: '#111827',  // Headings
    950: '#030712',  // Darkest
  },

  // Success (Green) - Positive states
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },

  // Warning (Orange) - Warning states
  warning: {
    50: '#fefce8',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },

  // Error (Red) - Error states
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  // Additional colors from charts
  chart: {
    cyan: '#06b6d4',
    purple: '#8b5cf6',
  },
};

// ============================================================================
// TYPOGRAPHY - Inter font system from static HTML
// ============================================================================

const typography = {
  fontFamily: "'Inter', system-ui, sans-serif",

  // Font sizes - exact px values from static HTML
  fontSize: 16, // base

  h1: {
    fontSize: '36px',      // --font-size-4xl
    fontWeight: 700,       // --font-weight-bold
    lineHeight: 1.2,
    color: colors.neutral[900],
  },

  h2: {
    fontSize: '30px',      // --font-size-3xl
    fontWeight: 700,
    lineHeight: 1.3,
    color: colors.neutral[900],
  },

  h3: {
    fontSize: '24px',      // --font-size-2xl
    fontWeight: 600,       // --font-weight-semibold
    lineHeight: 1.4,
    color: colors.neutral[900],
  },

  h4: {
    fontSize: '20px',      // --font-size-xl
    fontWeight: 600,
    lineHeight: 1.5,
    color: colors.neutral[900],
  },

  h5: {
    fontSize: '18px',      // --font-size-lg
    fontWeight: 600,
    lineHeight: 1.5,
    color: colors.neutral[900],
  },

  h6: {
    fontSize: '16px',      // --font-size-base
    fontWeight: 600,
    lineHeight: 1.5,
    color: colors.neutral[900],
  },

  body1: {
    fontSize: '16px',      // --font-size-base
    fontWeight: 400,       // --font-weight-normal
    lineHeight: 1.5,
    color: colors.neutral[900],
  },

  body2: {
    fontSize: '14px',      // --font-size-sm
    fontWeight: 400,
    lineHeight: 1.5,
    color: colors.neutral[700],
  },

  subtitle1: {
    fontSize: '16px',
    fontWeight: 500,       // --font-weight-medium
    lineHeight: 1.5,
    color: colors.neutral[600],
  },

  subtitle2: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.5,
    color: colors.neutral[600],
  },

  caption: {
    fontSize: '12px',      // --font-size-xs
    fontWeight: 400,
    lineHeight: 1.5,
    color: colors.neutral[500],
  },

  overline: {
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    color: colors.neutral[500],
  },

  button: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.5,
    textTransform: 'none' as const,
  },
};

// ============================================================================
// SPACING - Exact px values from static HTML
// ============================================================================

const spacing = (factor: number) => {
  const spacingMap: Record<number, number> = {
    0: 0,
    0.5: 2,    // Custom half-step
    1: 4,      // --spacing-1
    2: 8,      // --spacing-2
    3: 12,     // --spacing-3
    4: 16,     // --spacing-4
    5: 20,     // --spacing-5
    6: 24,     // --spacing-6
    7: 28,     // Custom
    8: 32,     // --spacing-8
    10: 40,    // --spacing-10
    12: 48,    // --spacing-12
    16: 64,    // --spacing-16
    20: 80,    // --spacing-20
    24: 96,    // --spacing-24
  };
  return spacingMap[factor] ?? factor * 4;
};

// ============================================================================
// SHADOWS - Exact definitions from static HTML
// ============================================================================

const shadows = [
  'none',
  '0 1px 2px 0 rgb(0 0 0 / 0.05)',                                     // sm - cards
  '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',    // base
  '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // md
  '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // lg - modals
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // xl
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Duplicate for MUI
] as const;

// ============================================================================
// BORDER RADIUS - Exact px values from static HTML
// ============================================================================

const shape = {
  borderRadius: 8, // --radius-base (default)
};

// ============================================================================
// BREAKPOINTS - Match static HTML responsive breakpoints
// ============================================================================

const breakpoints = {
  values: {
    xs: 0,
    sm: 640,
    md: 768,   // Mobile breakpoint from static HTML
    lg: 1024,  // Tablet breakpoint from static HTML
    xl: 1280,
  },
};

// ============================================================================
// COMPONENT OVERRIDES - Match static HTML component styles
// ============================================================================

const components: ThemeOptions['components'] = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        margin: 0,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: '14px',
        lineHeight: 1.5,
        color: colors.neutral[900],
        backgroundColor: colors.neutral[25],
      },
      '*': {
        boxSizing: 'border-box',
      },
    },
  },

  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',         // --radius-base
        fontSize: '14px',            // --font-size-sm
        fontWeight: 600,             // --font-weight-semibold
        textTransform: 'none',
        padding: '8px 16px',         // --spacing-2 --spacing-4
        gap: '8px',
        transition: 'all 150ms ease',
        boxShadow: 'none',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
      containedPrimary: {
        backgroundColor: colors.primary[600],
        color: colors.neutral[0],
        border: `1px solid ${colors.primary[600]}`,
        '&:hover': {
          backgroundColor: colors.primary[700],
          borderColor: colors.primary[700],
        },
      },
      outlined: {
        backgroundColor: colors.neutral[0],
        color: colors.neutral[700],
        border: `1px solid ${colors.neutral[300]}`,
        '&:hover': {
          backgroundColor: colors.neutral[50],
          borderColor: colors.neutral[400],
        },
      },
      text: {
        '&:hover': {
          backgroundColor: colors.neutral[50],
        },
      },
      sizeLarge: {
        padding: '12px 24px',
        fontSize: '16px',
      },
      sizeSmall: {
        padding: '4px 8px',
        fontSize: '12px',
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        backgroundColor: colors.neutral[0],
        border: `1px solid ${colors.neutral[200]}`,
        borderRadius: '16px',        // --radius-lg (cards)
        padding: '24px',             // --spacing-6
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', // --shadow-sm
      },
    },
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundColor: colors.neutral[0],
        borderRadius: '16px',
      },
      outlined: {
        border: `1px solid ${colors.neutral[200]}`,
      },
      elevation0: {
        boxShadow: 'none',
      },
      elevation1: {
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      elevation2: {
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      },
      elevation4: {
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '8px',         // --radius-base
        fontSize: '12px',            // --font-size-xs
        fontWeight: 500,             // --font-weight-medium
        padding: '4px 8px',          // --spacing-1 --spacing-2
      },
      colorSuccess: {
        backgroundColor: colors.success[50],
        color: colors.success[600],
      },
      colorWarning: {
        backgroundColor: colors.warning[50],
        color: colors.warning[600],
      },
      colorError: {
        backgroundColor: colors.error[50],
        color: colors.error[600],
      },
    },
  },

  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',       // --radius-base
          backgroundColor: colors.neutral[0],
          '& fieldset': {
            borderColor: colors.neutral[300],
          },
          '&:hover fieldset': {
            borderColor: colors.neutral[400],
          },
          '&.Mui-focused fieldset': {
            borderColor: colors.primary[500],
            boxShadow: `0 0 0 3px ${colors.primary[100]}`,
          },
        },
        '& .MuiInputBase-input': {
          fontSize: '14px',          // --font-size-sm
          padding: '12px 16px',      // --spacing-3 --spacing-4
        },
      },
    },
  },

  MuiTable: {
    styleOverrides: {
      root: {
        width: '100%',
        borderCollapse: 'collapse',
      },
    },
  },

  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: colors.neutral[50],
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: '12px 16px',        // --spacing-3 --spacing-4
        fontSize: '14px',            // --font-size-sm
        color: colors.neutral[900],
        borderBottom: `1px solid ${colors.neutral[100]}`,
      },
      head: {
        fontSize: '12px',            // --font-size-xs
        fontWeight: 600,             // --font-weight-semibold
        color: colors.neutral[700],
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: `1px solid ${colors.neutral[200]}`,
      },
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: 'background-color 150ms ease',
        '&:hover': {
          backgroundColor: colors.neutral[25],
        },
      },
    },
  },

  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: colors.neutral[0],
        color: colors.neutral[900],
        borderBottom: `1px solid ${colors.neutral[200]}`,
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        height: '64px',              // Static HTML header height
      },
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: {
        width: '280px',              // Static HTML sidebar width
        backgroundColor: colors.neutral[0],
        borderRight: `1px solid ${colors.neutral[200]}`,
        top: '64px',                 // Below header
        height: 'calc(100vh - 64px)',
      },
    },
  },

  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '16px',        // --radius-lg
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
    },
  },

  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: colors.neutral[200],
      },
    },
  },

  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',         // --radius-base
        transition: 'all 150ms ease',
        color: colors.neutral[500],
        '&:hover': {
          backgroundColor: colors.neutral[100],
          color: colors.neutral[700],
        },
      },
    },
  },
};

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: colors.primary[500],
      light: colors.primary[100],
      dark: colors.primary[700],
      contrastText: colors.neutral[0],
    },
    secondary: {
      main: colors.neutral[600],
      light: colors.neutral[400],
      dark: colors.neutral[800],
      contrastText: colors.neutral[0],
    },
    success: {
      main: colors.success[500],
      light: colors.success[100],
      dark: colors.success[700],
      contrastText: colors.neutral[0],
    },
    warning: {
      main: colors.warning[500],
      light: colors.warning[100],
      dark: colors.warning[700],
      contrastText: colors.neutral[0],
    },
    error: {
      main: colors.error[500],
      light: colors.error[100],
      dark: colors.error[700],
      contrastText: colors.neutral[0],
    },
    info: {
      main: colors.primary[500],
      light: colors.primary[100],
      dark: colors.primary[700],
      contrastText: colors.neutral[0],
    },
    background: {
      default: colors.neutral[25],
      paper: colors.neutral[0],
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[700],
      disabled: colors.neutral[400],
    },
    divider: colors.neutral[200],
  },
  typography,
  spacing,
  shape,
  breakpoints,
  shadows: shadows as any,
  components,
};

/**
 * Baseline Theme - Exact match to static HTML design system
 *
 * Usage:
 * ```tsx
 * import { ThemeProvider } from '@mui/material/styles';
 * import { baselineTheme } from './theme/baselineTheme';
 *
 * <ThemeProvider theme={baselineTheme}>
 *   <YourApp />
 * </ThemeProvider>
 * ```
 */
export const baselineTheme = createTheme(themeOptions);

// Export individual design tokens for direct use
export { colors, typography, spacing, shadows, shape, breakpoints };
