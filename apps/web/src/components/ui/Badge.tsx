import React from 'react';
import { Chip, ChipProps, styled, alpha } from '@mui/material';
import { DESIGN_TOKENS } from '../../theme/designTokens';

interface BadgeProps extends Omit<ChipProps, 'variant' | 'color'> {
  variant?: 'filled' | 'outlined' | 'soft' | 'dot';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'executive';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

const StyledBadge = styled(Chip)<BadgeProps>(({
  theme,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  pulse = false
}) => {
  const sizeConfig = {
    sm: {
      height: '20px',
      fontSize: DESIGN_TOKENS.typography.fontSize.xs,
      padding: `0 ${DESIGN_TOKENS.spacing[2]}`,
      '& .MuiChip-label': {
        padding: 0
      }
    },
    md: {
      height: '24px',
      fontSize: DESIGN_TOKENS.typography.fontSize.sm,
      padding: `0 ${DESIGN_TOKENS.spacing[3]}`,
      '& .MuiChip-label': {
        padding: `0 ${DESIGN_TOKENS.spacing[1]}`
      }
    },
    lg: {
      height: '32px',
      fontSize: DESIGN_TOKENS.typography.fontSize.base,
      padding: `0 ${DESIGN_TOKENS.spacing[4]}`,
      '& .MuiChip-label': {
        padding: `0 ${DESIGN_TOKENS.spacing[2]}`
      }
    }
  };

  const colorMap = {
    primary: DESIGN_TOKENS.colors.primary,
    secondary: DESIGN_TOKENS.colors.secondary,
    success: DESIGN_TOKENS.colors.semantic.success,
    warning: DESIGN_TOKENS.colors.semantic.warning,
    error: DESIGN_TOKENS.colors.semantic.error,
    info: DESIGN_TOKENS.colors.semantic.info,
    executive: DESIGN_TOKENS.colors.executive
  };

  const colors = colorMap[color];

  const variantConfig = {
    filled: {
      backgroundColor: colors[500],
      color: color === 'executive' ? 'white' : 'white',
      '&:hover': {
        backgroundColor: colors[600]
      }
    },
    outlined: {
      backgroundColor: 'transparent',
      color: colors[600],
      border: `1px solid ${colors[300]}`,
      '&:hover': {
        backgroundColor: alpha(colors[500], 0.04),
        borderColor: colors[400]
      }
    },
    soft: {
      backgroundColor: alpha(colors[500], 0.1),
      color: colors[700],
      border: 'none',
      '&:hover': {
        backgroundColor: alpha(colors[500], 0.15)
      }
    },
    dot: {
      backgroundColor: alpha(colors[500], 0.1),
      color: colors[700],
      paddingLeft: DESIGN_TOKENS.spacing[6],
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: DESIGN_TOKENS.spacing[2],
        top: '50%',
        transform: 'translateY(-50%)',
        width: '6px',
        height: '6px',
        backgroundColor: colors[500],
        borderRadius: '50%',
        ...(pulse && {
          animation: 'pulse 2s infinite'
        })
      }
    }
  };

  const pulseAnimation = pulse ? {
    '@keyframes pulse': {
      '0%, 100%': {
        opacity: 1
      },
      '50%': {
        opacity: 0.5
      }
    }
  } : {};

  return {
    ...sizeConfig[size],
    ...variantConfig[variant],
    borderRadius: DESIGN_TOKENS.borderRadius.full,
    fontFamily: DESIGN_TOKENS.typography.fontFamily.primary,
    fontWeight: DESIGN_TOKENS.typography.fontWeight.medium,
    textTransform: 'none',
    transition: `all ${DESIGN_TOKENS.transitions.duration[150]} ${DESIGN_TOKENS.transitions.timing.out}`,
    '& .MuiChip-deleteIcon': {
      fontSize: size === 'sm' ? '14px' : '16px',
      color: 'currentColor',
      '&:hover': {
        color: 'currentColor',
        opacity: 0.7
      }
    },
    ...pulseAnimation
  };
});

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  pulse = false,
  ...props
}) => {
  return (
    <StyledBadge
      label={children}
      variant={variant}
      color={color}
      size={size}
      pulse={pulse}
      {...props}
    />
  );
};

export default Badge;