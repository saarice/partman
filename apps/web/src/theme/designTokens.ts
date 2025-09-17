// Executive-Class UI Design Tokens
export const DESIGN_TOKENS = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16'
    },
    executive: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    },
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03'
    },
    semantic: {
      success: {
        50: '#f0fdf4',
        500: '#22c55e',
        900: '#14532d'
      },
      warning: {
        50: '#fffbeb',
        500: '#f59e0b',
        900: '#78350f'
      },
      error: {
        50: '#fef2f2',
        500: '#ef4444',
        900: '#7f1d1d'
      },
      info: {
        50: '#eff6ff',
        500: '#3b82f6',
        900: '#1e3a8a'
      }
    }
  },
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
      executive: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
      '7xl': '4.5rem',    // 72px
      '8xl': '6rem',      // 96px
      '9xl': '8rem'       // 128px
    },
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',   // 2px
    1: '0.25rem',      // 4px
    1.5: '0.375rem',   // 6px
    2: '0.5rem',       // 8px
    2.5: '0.625rem',   // 10px
    3: '0.75rem',      // 12px
    3.5: '0.875rem',   // 14px
    4: '1rem',         // 16px
    5: '1.25rem',      // 20px
    6: '1.5rem',       // 24px
    7: '1.75rem',      // 28px
    8: '2rem',         // 32px
    9: '2.25rem',      // 36px
    10: '2.5rem',      // 40px
    11: '2.75rem',     // 44px
    12: '3rem',        // 48px
    14: '3.5rem',      // 56px
    16: '4rem',        // 64px
    20: '5rem',        // 80px
    24: '6rem',        // 96px
    28: '7rem',        // 112px
    32: '8rem',        // 128px
    36: '9rem',        // 144px
    40: '10rem',       // 160px
    44: '11rem',       // 176px
    48: '12rem',       // 192px
    52: '13rem',       // 208px
    56: '14rem',       // 224px
    60: '15rem',       // 240px
    64: '16rem',       // 256px
    72: '18rem',       // 288px
    80: '20rem',       // 320px
    96: '24rem'        // 384px
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',    // 2px
    base: '0.25rem',   // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
    // Executive shadows for premium feel
    executive: {
      card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      focus: '0 0 0 3px rgba(59, 130, 246, 0.15)',
      premium: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }
  },
  transitions: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms'
    },
    timing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      executive: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }
  },
  zIndex: {
    auto: 'auto',
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080
  }
} as const;

// Executive-specific component variants
export const EXECUTIVE_VARIANTS = {
  button: {
    primary: {
      backgroundColor: DESIGN_TOKENS.colors.primary[500],
      color: 'white',
      '&:hover': {
        backgroundColor: DESIGN_TOKENS.colors.primary[600]
      }
    },
    secondary: {
      backgroundColor: DESIGN_TOKENS.colors.executive[100],
      color: DESIGN_TOKENS.colors.executive[900],
      '&:hover': {
        backgroundColor: DESIGN_TOKENS.colors.executive[200]
      }
    },
    executive: {
      background: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.primary[500]} 0%, ${DESIGN_TOKENS.colors.primary[600]} 100%)`,
      color: 'white',
      boxShadow: DESIGN_TOKENS.shadows.executive.card,
      '&:hover': {
        boxShadow: DESIGN_TOKENS.shadows.executive.hover,
        transform: 'translateY(-1px)'
      }
    }
  },
  card: {
    standard: {
      backgroundColor: 'white',
      boxShadow: DESIGN_TOKENS.shadows.executive.card,
      borderRadius: DESIGN_TOKENS.borderRadius.lg
    },
    executive: {
      backgroundColor: 'white',
      boxShadow: DESIGN_TOKENS.shadows.executive.premium,
      borderRadius: DESIGN_TOKENS.borderRadius.xl,
      border: `1px solid ${DESIGN_TOKENS.colors.executive[200]}`
    },
    hover: {
      '&:hover': {
        boxShadow: DESIGN_TOKENS.shadows.executive.hover,
        transform: 'translateY(-2px)',
        transition: `all ${DESIGN_TOKENS.transitions.duration[200]} ${DESIGN_TOKENS.transitions.timing.executive}`
      }
    }
  }
} as const;

// Typography scale for executive interfaces
export const EXECUTIVE_TYPOGRAPHY = {
  display: {
    fontSize: DESIGN_TOKENS.typography.fontSize['6xl'],
    fontWeight: DESIGN_TOKENS.typography.fontWeight.extrabold,
    lineHeight: DESIGN_TOKENS.typography.lineHeight.none,
    letterSpacing: DESIGN_TOKENS.typography.letterSpacing.tight
  },
  title: {
    fontSize: DESIGN_TOKENS.typography.fontSize['4xl'],
    fontWeight: DESIGN_TOKENS.typography.fontWeight.bold,
    lineHeight: DESIGN_TOKENS.typography.lineHeight.tight
  },
  subtitle: {
    fontSize: DESIGN_TOKENS.typography.fontSize['2xl'],
    fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
    lineHeight: DESIGN_TOKENS.typography.lineHeight.snug
  },
  heading: {
    fontSize: DESIGN_TOKENS.typography.fontSize.xl,
    fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
    lineHeight: DESIGN_TOKENS.typography.lineHeight.snug
  },
  body: {
    fontSize: DESIGN_TOKENS.typography.fontSize.base,
    fontWeight: DESIGN_TOKENS.typography.fontWeight.normal,
    lineHeight: DESIGN_TOKENS.typography.lineHeight.relaxed
  },
  caption: {
    fontSize: DESIGN_TOKENS.typography.fontSize.sm,
    fontWeight: DESIGN_TOKENS.typography.fontWeight.medium,
    lineHeight: DESIGN_TOKENS.typography.lineHeight.normal
  },
  small: {
    fontSize: DESIGN_TOKENS.typography.fontSize.xs,
    fontWeight: DESIGN_TOKENS.typography.fontWeight.medium,
    lineHeight: DESIGN_TOKENS.typography.lineHeight.normal
  }
} as const;