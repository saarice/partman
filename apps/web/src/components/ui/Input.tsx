import React from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  styled,
  alpha
} from '@mui/material';
import { DESIGN_TOKENS } from '../../theme/designTokens';

interface InputProps extends Omit<TextFieldProps, 'variant' | 'size'> {
  variant?: 'outlined' | 'filled' | 'executive';
  size?: 'sm' | 'md' | 'lg';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  state?: 'default' | 'error' | 'success' | 'warning';
}

const StyledTextField = styled(TextField)<InputProps>(({
  theme,
  variant = 'outlined',
  size = 'md',
  state = 'default'
}) => {
  const sizeConfig = {
    sm: {
      '& .MuiInputBase-root': {
        height: '36px',
        fontSize: DESIGN_TOKENS.typography.fontSize.sm
      },
      '& .MuiInputLabel-root': {
        fontSize: DESIGN_TOKENS.typography.fontSize.sm
      }
    },
    md: {
      '& .MuiInputBase-root': {
        height: '44px',
        fontSize: DESIGN_TOKENS.typography.fontSize.base
      },
      '& .MuiInputLabel-root': {
        fontSize: DESIGN_TOKENS.typography.fontSize.base
      }
    },
    lg: {
      '& .MuiInputBase-root': {
        height: '52px',
        fontSize: DESIGN_TOKENS.typography.fontSize.lg
      },
      '& .MuiInputLabel-root': {
        fontSize: DESIGN_TOKENS.typography.fontSize.lg
      }
    }
  };

  const stateColors = {
    default: DESIGN_TOKENS.colors.executive[300],
    error: DESIGN_TOKENS.colors.semantic.error[500],
    success: DESIGN_TOKENS.colors.semantic.success[500],
    warning: DESIGN_TOKENS.colors.semantic.warning[500]
  };

  const variantConfig = {
    outlined: {
      '& .MuiOutlinedInput-root': {
        borderRadius: DESIGN_TOKENS.borderRadius.md,
        backgroundColor: 'white',
        transition: `all ${DESIGN_TOKENS.transitions.duration[200]} ${DESIGN_TOKENS.transitions.timing.out}`,
        '& fieldset': {
          borderColor: stateColors[state],
          borderWidth: '1px'
        },
        '&:hover fieldset': {
          borderColor: state === 'default'
            ? DESIGN_TOKENS.colors.executive[400]
            : stateColors[state]
        },
        '&.Mui-focused fieldset': {
          borderColor: state === 'default'
            ? DESIGN_TOKENS.colors.primary[500]
            : stateColors[state],
          borderWidth: '2px',
          boxShadow: `0 0 0 4px ${alpha(
            state === 'default'
              ? DESIGN_TOKENS.colors.primary[500]
              : stateColors[state],
            0.1
          )}`
        },
        '&.Mui-disabled': {
          backgroundColor: DESIGN_TOKENS.colors.executive[50],
          '& fieldset': {
            borderColor: DESIGN_TOKENS.colors.executive[200]
          }
        }
      }
    },
    filled: {
      '& .MuiFilledInput-root': {
        borderRadius: DESIGN_TOKENS.borderRadius.md,
        backgroundColor: DESIGN_TOKENS.colors.executive[50],
        border: `1px solid ${stateColors[state]}`,
        '&:hover': {
          backgroundColor: DESIGN_TOKENS.colors.executive[100],
          borderColor: state === 'default'
            ? DESIGN_TOKENS.colors.executive[400]
            : stateColors[state]
        },
        '&.Mui-focused': {
          backgroundColor: 'white',
          borderColor: state === 'default'
            ? DESIGN_TOKENS.colors.primary[500]
            : stateColors[state],
          boxShadow: `0 0 0 4px ${alpha(
            state === 'default'
              ? DESIGN_TOKENS.colors.primary[500]
              : stateColors[state],
            0.1
          )}`
        },
        '&:before, &:after': {
          display: 'none'
        }
      }
    },
    executive: {
      '& .MuiOutlinedInput-root': {
        borderRadius: DESIGN_TOKENS.borderRadius.lg,
        backgroundColor: 'white',
        boxShadow: DESIGN_TOKENS.shadows.sm,
        transition: `all ${DESIGN_TOKENS.transitions.duration[200]} ${DESIGN_TOKENS.transitions.timing.executive}`,
        '& fieldset': {
          borderColor: DESIGN_TOKENS.colors.executive[200],
          borderWidth: '1px'
        },
        '&:hover': {
          boxShadow: DESIGN_TOKENS.shadows.md,
          transform: 'translateY(-1px)',
          '& fieldset': {
            borderColor: DESIGN_TOKENS.colors.executive[300]
          }
        },
        '&.Mui-focused': {
          boxShadow: DESIGN_TOKENS.shadows.executive.focus,
          transform: 'translateY(-1px)',
          '& fieldset': {
            borderColor: DESIGN_TOKENS.colors.primary[500],
            borderWidth: '2px'
          }
        },
        '&.Mui-disabled': {
          backgroundColor: DESIGN_TOKENS.colors.executive[50],
          transform: 'none',
          boxShadow: 'none'
        }
      }
    }
  };

  return {
    ...sizeConfig[size],
    ...variantConfig[variant],
    '& .MuiInputLabel-root': {
      fontFamily: DESIGN_TOKENS.typography.fontFamily.primary,
      fontWeight: DESIGN_TOKENS.typography.fontWeight.medium,
      color: DESIGN_TOKENS.colors.executive[600],
      '&.Mui-focused': {
        color: state === 'default'
          ? DESIGN_TOKENS.colors.primary[500]
          : stateColors[state]
      }
    },
    '& .MuiInputBase-input': {
      fontFamily: DESIGN_TOKENS.typography.fontFamily.primary,
      color: DESIGN_TOKENS.colors.executive[900],
      '&::placeholder': {
        color: DESIGN_TOKENS.colors.executive[400],
        opacity: 1
      }
    },
    '& .MuiFormHelperText-root': {
      fontFamily: DESIGN_TOKENS.typography.fontFamily.primary,
      fontSize: DESIGN_TOKENS.typography.fontSize.sm,
      marginTop: DESIGN_TOKENS.spacing[1],
      color: state !== 'default' ? stateColors[state] : DESIGN_TOKENS.colors.executive[500]
    }
  };
});

const Input: React.FC<InputProps> = ({
  startIcon,
  endIcon,
  variant = 'outlined',
  size = 'md',
  state = 'default',
  error,
  ...props
}) => {
  const inputState = error ? 'error' : state;

  const InputProps = {
    ...(startIcon && {
      startAdornment: (
        <InputAdornment position="start">
          {startIcon}
        </InputAdornment>
      )
    }),
    ...(endIcon && {
      endAdornment: (
        <InputAdornment position="end">
          {endIcon}
        </InputAdornment>
      )
    })
  };

  return (
    <StyledTextField
      variant={variant}
      size={size}
      state={inputState}
      error={error}
      InputProps={InputProps}
      {...props}
    />
  );
};

export default Input;