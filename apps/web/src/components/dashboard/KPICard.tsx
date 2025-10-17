import React from 'react';
import { Box, Card, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface KPICardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative';
  link?: string;
  linkText?: string;
  icon: React.ReactElement;
  iconColor: string;
}

/**
 * KPI Card Component - Exact match to static HTML .kpi-card
 * Matches: apps/web/index.html lines 64-81
 */
const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType,
  link,
  linkText,
  icon,
  iconColor,
}) => {
  return (
    <Card
      sx={{
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',  // --radius-lg
        padding: '24px',       // --spacing-6
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', // --shadow-sm
      }}
    >
      {/* Header with title and icon */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px', // --spacing-4
        }}
      >
        <Typography
          sx={{
            fontSize: '12px',    // --font-size-xs
            fontWeight: 500,     // --font-weight-medium
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            margin: 0,
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            color: iconColor,
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& .MuiSvgIcon-root': {
              fontSize: '20px',
            },
          }}
        >
          {icon}
        </Box>
      </Box>

      {/* Content with value and change */}
      <Box>
        <Typography
          sx={{
            fontSize: '36px',    // --font-size-4xl
            fontWeight: 700,     // --font-weight-bold
            color: 'text.primary',
            margin: '0 0 8px 0', // --spacing-2
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',  // --spacing-1
            fontSize: '12px', // --font-size-xs
            color: changeType === 'positive' ? 'success.main' : 'error.main',
            fontWeight: 500,
          }}
        >
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              width: '14px',
              height: '14px',
            }}
          >
            {/* Simple trend arrow */}
            {changeType === 'positive' ? '↗' : '↘'}
          </Box>
          {change}
        </Box>
      </Box>

      {/* Footer with link */}
      {link && linkText && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '16px', // --spacing-4
            paddingTop: '16px',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Link
            component={RouterLink}
            to={link}
            sx={{
              fontSize: '14px',  // --font-size-sm
              fontWeight: 500,
              color: 'primary.main',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {linkText}
          </Link>
        </Box>
      )}
    </Card>
  );
};

export default KPICard;
