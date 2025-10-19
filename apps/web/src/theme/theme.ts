import { createTheme } from '@mui/material/styles';
import { designTokens } from './tokens';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036'
    },
    background: {
      default: '#fafafa', // Lighter background for modern aesthetic
      paper: '#ffffff'
    },
    success: {
      main: '#4caf50'
    },
    warning: {
      main: '#ff9800'
    },
    error: {
      main: '#f44336'
    },
    divider: '#eeeeee', // Lighter dividers
    action: {
      hover: `rgba(0, 0, 0, ${designTokens.opacity.hover})`,
      selected: `rgba(0, 0, 0, ${designTokens.opacity.selected})`,
      disabled: `rgba(0, 0, 0, ${designTokens.opacity.disabled})`,
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: designTokens.typography.weight.regular, // 400
      lineHeight: designTokens.typography.lineHeight.tight
    },
    h2: {
      fontSize: '2rem',
      fontWeight: designTokens.typography.weight.regular, // 400
      lineHeight: designTokens.typography.lineHeight.tight
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: designTokens.typography.weight.regular, // 400
      lineHeight: designTokens.typography.lineHeight.normal
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: designTokens.typography.weight.regular, // 400 (was medium)
      lineHeight: designTokens.typography.lineHeight.normal
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: designTokens.typography.weight.regular, // 400 (was medium)
      lineHeight: designTokens.typography.lineHeight.normal
    },
    h6: {
      fontSize: '1rem',
      fontWeight: designTokens.typography.weight.regular, // 400 (was medium)
      lineHeight: designTokens.typography.lineHeight.normal
    },
    body1: {
      fontWeight: designTokens.typography.weight.regular, // 400
      lineHeight: designTokens.typography.lineHeight.relaxed
    },
    body2: {
      fontWeight: designTokens.typography.weight.regular, // 400
      lineHeight: designTokens.typography.lineHeight.relaxed
    }
  },
  spacing: 8, // 8px base unit
  shape: {
    borderRadius: designTokens.borders.radius.medium
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: designTokens.components.card.shadow.light, // Lighter shadow
          borderRadius: designTokens.components.card.borderRadius.medium,
          transition: `box-shadow ${designTokens.transitions.normal} ease`
        }
      },
      defaultProps: {
        elevation: 0
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none' // Remove default gradient
        },
        elevation1: {
          boxShadow: designTokens.components.card.shadow.light
        },
        elevation2: {
          boxShadow: designTokens.components.card.shadow.medium
        },
        elevation3: {
          boxShadow: designTokens.components.card.shadow.heavy
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: designTokens.components.button.borderRadius,
          fontWeight: designTokens.typography.weight.regular, // 400 (was medium)
          transition: `all ${designTokens.transitions.fast} ease`
        },
        sizeSmall: {
          minHeight: designTokens.components.button.height.small
        },
        sizeMedium: {
          minHeight: designTokens.components.button.height.medium
        },
        sizeLarge: {
          minHeight: designTokens.components.button.height.large
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: designTokens.typography.weight.regular, // 400 (was medium)
          borderRadius: designTokens.components.chip.borderRadius,
          transition: `all ${designTokens.transitions.fast} ease`
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `${designTokens.borders.width.thin}px solid ${designTokens.borders.color.light}`,
          padding: designTokens.components.table.cellPadding
        },
        head: {
          fontWeight: designTokens.typography.weight.medium, // 500 (was semibold 600)
          backgroundColor: '#fafafa', // Subtle header background
          borderBottom: `${designTokens.borders.width.medium}px solid ${designTokens.borders.color.medium}`
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: `rgba(0, 0, 0, ${designTokens.components.table.hoverOpacity})`,
            transition: `background-color ${designTokens.transitions.fast} ease`
          },
          '&:last-child td': {
            borderBottom: 0
          }
        }
      }
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small' // Default to small size for consistency
      },
      styleOverrides: {
        root: {
          minHeight: designTokens.components.filter.height.small
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          transition: `all ${designTokens.transitions.fast} ease`
        }
      },
      defaultProps: {
        MenuProps: {
          PaperProps: {
            sx: {
              boxShadow: designTokens.components.card.shadow.medium,
              mt: 0.5,
              '& .MuiMenuItem-root': {
                transition: `background-color ${designTokens.transitions.fast} ease`
              }
            }
          },
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left'
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left'
          }
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        size: 'small'
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: designTokens.borders.color.light
        }
      }
    }
  }
});