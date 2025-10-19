/**
 * Design Tokens - Central source of truth for spacing, sizing, and visual constants
 *
 * Following Material Design 3 principles with 8px grid system
 * All values are carefully chosen to ensure consistency across the application
 */

export const designTokens = {
  /**
   * Spacing Scale (8px base grid)
   * Use these instead of hardcoded pixel values
   */
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  /**
   * Component-specific sizing and spacing
   */
  components: {
    filter: {
      // Filter bar heights
      height: {
        small: 40,
        medium: 48,
        large: 56,
      },
      // Minimum container height to accommodate wrapping
      minContainerHeight: 80,
      // Gap between filter controls
      gap: 16,
      // Internal padding of filter container
      padding: 16,
      // Consistent FormControl sizing
      formControlSize: 'small' as const,
    },

    table: {
      // Row heights
      rowHeight: {
        compact: 48,
        comfortable: 64,
        spacious: 72,
      },
      headerHeight: 56,
      cellPadding: 16,
      // Hover opacity
      hoverOpacity: 0.02,
    },

    card: {
      padding: {
        small: 16,
        medium: 24,
        large: 32,
      },
      borderRadius: {
        small: 4,
        medium: 8,
        large: 12,
      },
      // Light, modern shadow
      shadow: {
        light: '0 1px 3px rgba(0,0,0,0.08)',
        medium: '0 2px 6px rgba(0,0,0,0.10)',
        heavy: '0 4px 12px rgba(0,0,0,0.12)',
      },
    },

    kanban: {
      columnWidth: {
        min: 320,
        max: 320,
      },
      columnGap: 16,
      cardSpacing: 16,
      cardPadding: 16,
    },

    button: {
      height: {
        small: 32,
        medium: 40,
        large: 48,
      },
      // Minimum touch target (accessibility)
      minTouchTarget: 44,
      gap: 8,
      borderRadius: 6,
    },

    chip: {
      // Background opacity for colored chips
      backgroundOpacity: {
        subtle: 0.12,
        medium: 0.20,
        strong: 0.30,
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        bold: 600,
      },
      borderRadius: 16,
    },
  },

  /**
   * Z-index layers for proper stacking
   * Material UI uses: AppBar(1100), Drawer(1200), Modal(1300)
   */
  zIndex: {
    dropdown: 1350,
    tooltip: 1400,
    modal: 1450,
    notification: 1500,
    overlay: 1600,
  },

  /**
   * Transition durations
   * Keep consistent for smooth UX
   */
  transitions: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    verySlow: '500ms',
  },

  /**
   * Border styles
   */
  borders: {
    width: {
      thin: 1,
      medium: 2,
      thick: 4,
    },
    radius: {
      small: 4,
      medium: 6,
      large: 8,
      xlarge: 12,
      round: 50,
    },
    // Light border colors
    color: {
      light: '#eeeeee',
      medium: '#e0e0e0',
      dark: '#bdbdbd',
    },
  },

  /**
   * Typography weights
   * Lighter weights for modern aesthetic
   */
  typography: {
    weight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.6,
      loose: 1.8,
    },
  },

  /**
   * Opacity values for consistent transparency
   */
  opacity: {
    disabled: 0.38,
    hover: 0.08,
    selected: 0.12,
    focus: 0.16,
  },
} as const;

/**
 * Helper type for accessing token values
 */
export type DesignTokens = typeof designTokens;

export default designTokens;
