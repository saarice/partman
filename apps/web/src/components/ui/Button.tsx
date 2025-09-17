import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, styled, alpha } from '@mui/material';
import { DESIGN_TOKENS, EXECUTIVE_VARIANTS } from '../../theme/designTokens';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'executive' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const StyledButton = styled(MuiButton)<ButtonProps>(({ theme, variant = 'primary', size = 'md' }) => {
  const sizeConfig = {
    sm: {
      fontSize: DESIGN_TOKENS.typography.fontSize.sm,
      padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[3]}`,
      minHeight: '32px'
    },
    md: {
      fontSize: DESIGN_TOKENS.typography.fontSize.base,
      padding: `${DESIGN_TOKENS.spacing[2.5]} ${DESIGN_TOKENS.spacing[4]}`,
      minHeight: '40px'
    },
    lg: {
      fontSize: DESIGN_TOKENS.typography.fontSize.lg,
      padding: `${DESIGN_TOKENS.spacing[3]} ${DESIGN_TOKENS.spacing[5]}`,
      minHeight: '48px'
    },
    xl: {
      fontSize: DESIGN_TOKENS.typography.fontSize.xl,
      padding: `${DESIGN_TOKENS.spacing[4]} ${DESIGN_TOKENS.spacing[6]}`,
      minHeight: '56px'
    }
  };

  const variantConfig = {
    primary: {
      backgroundColor: DESIGN_TOKENS.colors.primary[500],
      color: 'white',
      boxShadow: DESIGN_TOKENS.shadows.sm,
      '&:hover': {
        backgroundColor: DESIGN_TOKENS.colors.primary[600],
        boxShadow: DESIGN_TOKENS.shadows.md,
        transform: 'translateY(-1px)'
      },
      '&:active': {
        backgroundColor: DESIGN_TOKENS.colors.primary[700],
        transform: 'translateY(0)'
      }
    },
    secondary: {
      backgroundColor: DESIGN_TOKENS.colors.executive[100],
      color: DESIGN_TOKENS.colors.executive[900],
      border: `1px solid ${DESIGN_TOKENS.colors.executive[200]}`,
      '&:hover': {
        backgroundColor: DESIGN_TOKENS.colors.executive[200],
        borderColor: DESIGN_TOKENS.colors.executive[300]
      }
    },
    outline: {
      backgroundColor: 'transparent',
      color: DESIGN_TOKENS.colors.primary[600],
      border: `1px solid ${DESIGN_TOKENS.colors.primary[300]}`,
      '&:hover': {
        backgroundColor: alpha(DESIGN_TOKENS.colors.primary[500], 0.04),
        borderColor: DESIGN_TOKENS.colors.primary[400]
      }
    },
    ghost: {
      backgroundColor: 'transparent',
      color: DESIGN_TOKENS.colors.executive[700],
      '&:hover': {
        backgroundColor: alpha(DESIGN_TOKENS.colors.executive[500], 0.04)
      }
    },
    executive: {
      background: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.primary[500]} 0%, ${DESIGN_TOKENS.colors.primary[600]} 100%)`,
      color: 'white',
      boxShadow: DESIGN_TOKENS.shadows.executive.card,
      fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
      '&:hover': {
        background: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.primary[600]} 0%, ${DESIGN_TOKENS.colors.primary[700]} 100%)`,
        boxShadow: DESIGN_TOKENS.shadows.executive.hover,
        transform: 'translateY(-2px)'
      },
      '&:active': {
        transform: 'translateY(-1px)'
      }
    },
    danger: {
      backgroundColor: DESIGN_TOKENS.colors.semantic.error[500],
      color: 'white',
      '&:hover': {
        backgroundColor: DESIGN_TOKENS.colors.semantic.error[600]
      }
    }
  };

  return {
    ...sizeConfig[size],
    ...variantConfig[variant],
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily.primary,
    fontWeight: DESIGN_TOKENS.typography.fontWeight.medium,
    textTransform: 'none',
    transition: `all ${DESIGN_TOKENS.transitions.duration[200]} ${DESIGN_TOKENS.transitions.timing.executive}`,
    '&:focus-visible': {
      outline: 'none',
      boxShadow: DESIGN_TOKENS.shadows.executive.focus
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      transform: 'none',
      '&:hover': {
        transform: 'none'
      }
    }
  };
});

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const renderContent = () => {
    if (loading) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[2] }}>
          <span
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          {children}
        </span>
      );
    }

    if (icon) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[2] }}>
          {iconPosition === 'left' && icon}
          {children}
          {iconPosition === 'right' && icon}
        </span>
      );
    }

    return children;
  };

  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={isDisabled}
      {...props}
    >
      {renderContent()}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </StyledButton>
  );
};

export default Button;