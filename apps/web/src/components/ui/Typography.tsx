import React from 'react';
import { Typography as MuiTypography, TypographyProps as MuiTypographyProps, styled } from '@mui/material';
import { DESIGN_TOKENS, EXECUTIVE_TYPOGRAPHY } from '../../theme/designTokens';

interface TypographyProps extends Omit<MuiTypographyProps, 'variant'> {
  variant?: 'display' | 'title' | 'subtitle' | 'heading' | 'body' | 'caption' | 'small' | 'label';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: 'primary' | 'secondary' | 'executive' | 'accent' | 'success' | 'warning' | 'error' | 'muted';
  gradient?: boolean;
}

const StyledTypography = styled(MuiTypography)<TypographyProps>(({
  theme,
  variant = 'body',
  weight,
  color = 'executive',
  gradient = false
}) => {
  const variantConfig = {
    display: EXECUTIVE_TYPOGRAPHY.display,
    title: EXECUTIVE_TYPOGRAPHY.title,
    subtitle: EXECUTIVE_TYPOGRAPHY.subtitle,
    heading: EXECUTIVE_TYPOGRAPHY.heading,
    body: EXECUTIVE_TYPOGRAPHY.body,
    caption: EXECUTIVE_TYPOGRAPHY.caption,
    small: EXECUTIVE_TYPOGRAPHY.small,
    label: {
      fontSize: DESIGN_TOKENS.typography.fontSize.sm,
      fontWeight: DESIGN_TOKENS.typography.fontWeight.medium,
      lineHeight: DESIGN_TOKENS.typography.lineHeight.normal,
      textTransform: 'uppercase',
      letterSpacing: DESIGN_TOKENS.typography.letterSpacing.wide
    }
  };

  const weightConfig = weight ? {
    light: DESIGN_TOKENS.typography.fontWeight.light,
    normal: DESIGN_TOKENS.typography.fontWeight.normal,
    medium: DESIGN_TOKENS.typography.fontWeight.medium,
    semibold: DESIGN_TOKENS.typography.fontWeight.semibold,
    bold: DESIGN_TOKENS.typography.fontWeight.bold,
    extrabold: DESIGN_TOKENS.typography.fontWeight.extrabold
  }[weight] : {};

  const colorConfig = {
    primary: DESIGN_TOKENS.colors.primary[600],
    secondary: DESIGN_TOKENS.colors.secondary[600],
    executive: DESIGN_TOKENS.colors.executive[900],
    accent: DESIGN_TOKENS.colors.accent[600],
    success: DESIGN_TOKENS.colors.semantic.success[600],
    warning: DESIGN_TOKENS.colors.semantic.warning[600],
    error: DESIGN_TOKENS.colors.semantic.error[600],
    muted: DESIGN_TOKENS.colors.executive[500]
  };

  const gradientStyles = gradient ? {
    background: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.primary[600]} 0%, ${DESIGN_TOKENS.colors.accent[600]} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  } : {};

  return {
    fontFamily: DESIGN_TOKENS.typography.fontFamily.executive,
    color: gradient ? 'transparent' : colorConfig[color],
    margin: 0,
    ...variantConfig[variant],
    ...(weight && { fontWeight: weightConfig }),
    ...gradientStyles
  };
});

const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  weight,
  color = 'executive',
  gradient = false,
  ...props
}) => {
  // Map our variants to MUI variants for semantic HTML
  const muiVariantMap = {
    display: 'h1',
    title: 'h2',
    subtitle: 'h3',
    heading: 'h4',
    body: 'body1',
    caption: 'caption',
    small: 'caption',
    label: 'overline'
  } as const;

  return (
    <StyledTypography
      variant={variant}
      weight={weight}
      color={color}
      gradient={gradient}
      component={muiVariantMap[variant]}
      {...props}
    >
      {children}
    </StyledTypography>
  );
};

export default Typography;