import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps, styled } from '@mui/material';
import { DESIGN_TOKENS } from '../../theme/designTokens';

interface CardProps extends MuiCardProps {
  variant?: 'standard' | 'executive' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  interactive?: boolean;
}

const StyledCard = styled(MuiCard)<CardProps>(({
  theme,
  variant = 'standard',
  padding = 'md',
  hover = false,
  interactive = false
}) => {
  const paddingConfig = {
    none: '0',
    sm: DESIGN_TOKENS.spacing[3],
    md: DESIGN_TOKENS.spacing[4],
    lg: DESIGN_TOKENS.spacing[6],
    xl: DESIGN_TOKENS.spacing[8]
  };

  const variantConfig = {
    standard: {
      backgroundColor: 'white',
      boxShadow: DESIGN_TOKENS.shadows.base,
      border: 'none'
    },
    executive: {
      backgroundColor: 'white',
      boxShadow: DESIGN_TOKENS.shadows.executive.premium,
      border: `1px solid ${DESIGN_TOKENS.colors.executive[200]}`,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${DESIGN_TOKENS.colors.primary[500]} 0%, ${DESIGN_TOKENS.colors.accent[500]} 100%)`,
        borderRadius: `${DESIGN_TOKENS.borderRadius.lg} ${DESIGN_TOKENS.borderRadius.lg} 0 0`
      }
    },
    outlined: {
      backgroundColor: 'white',
      boxShadow: 'none',
      border: `1px solid ${DESIGN_TOKENS.colors.executive[200]}`
    },
    elevated: {
      backgroundColor: 'white',
      boxShadow: DESIGN_TOKENS.shadows.lg,
      border: 'none'
    }
  };

  const hoverStyles = hover || interactive ? {
    '&:hover': {
      boxShadow: DESIGN_TOKENS.shadows.executive.hover,
      transform: 'translateY(-2px)',
      transition: `all ${DESIGN_TOKENS.transitions.duration[200]} ${DESIGN_TOKENS.transitions.timing.executive}`
    }
  } : {};

  const interactiveStyles = interactive ? {
    cursor: 'pointer',
    '&:active': {
      transform: 'translateY(-1px)'
    }
  } : {};

  return {
    position: 'relative',
    padding: paddingConfig[padding],
    borderRadius: variant === 'executive' ? DESIGN_TOKENS.borderRadius.xl : DESIGN_TOKENS.borderRadius.lg,
    transition: `all ${DESIGN_TOKENS.transitions.duration[200]} ${DESIGN_TOKENS.transitions.timing.executive}`,
    overflow: 'visible',
    ...variantConfig[variant],
    ...hoverStyles,
    ...interactiveStyles,
    '&:focus-visible': {
      outline: 'none',
      boxShadow: DESIGN_TOKENS.shadows.executive.focus
    }
  };
});

const Card: React.FC<CardProps> = ({
  children,
  variant = 'standard',
  padding = 'md',
  hover = false,
  interactive = false,
  onClick,
  ...props
}) => {
  return (
    <StyledCard
      variant={variant}
      padding={padding}
      hover={hover}
      interactive={interactive || !!onClick}
      onClick={onClick}
      tabIndex={interactive || onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

export default Card;