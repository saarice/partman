import React from 'react';
import type { ReactNode } from 'react';
import {
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { designTokens } from '../../theme/tokens';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  type: 'search' | 'select' | 'custom';
  label?: string;
  placeholder?: string;
  value: string;
  options?: FilterOption[];
  gridWidth?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  onChange: (value: string) => void;
  customComponent?: ReactNode;
}

export interface FilterBarProps {
  filters: FilterConfig[];
  actions?: ReactNode[];
  onClearFilters?: () => void;
  showClearButton?: boolean;
}

/**
 * FilterBar - Unified, consistent filter component
 *
 * Provides a standardized layout for filters across all management pages
 * Ensures consistent spacing, sizing, and prevents text overlap issues
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  actions = [],
  onClearFilters,
  showClearButton = true
}) => {
  const handleSelectChange = (onChange: (value: string) => void) => (
    event: SelectChangeEvent
  ) => {
    onChange(event.target.value);
  };

  const handleSearchChange = (onChange: (value: string) => void) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange(event.target.value);
  };

  const renderFilter = (filter: FilterConfig) => {
    // Use completely fixed pixel widths - no percentages!
    const getFixedWidth = (gridWidth?: FilterConfig['gridWidth']) => {
      if (!gridWidth) return 240;

      // Convert grid columns to fixed pixels (assuming ~100px per column)
      const mdWidth = gridWidth.md || gridWidth.sm || gridWidth.xs || 3;
      return mdWidth * 80; // 80px per grid column
    };

    const fixedWidth = getFixedWidth(filter.gridWidth);

    switch (filter.type) {
      case 'search':
        return (
          <Box key={filter.id} sx={{ width: `${fixedWidth}px`, minWidth: `${fixedWidth}px`, maxWidth: `${fixedWidth}px`, flexShrink: 0 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={filter.placeholder || 'Search...'}
              value={filter.value}
              onChange={handleSearchChange(filter.onChange)}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />
              }}
              sx={{
                minHeight: designTokens.components.filter.height.small,
                '& .MuiInputBase-root': {
                  height: designTokens.components.filter.height.small
                }
              }}
            />
          </Box>
        );

      case 'select':
        return (
          <Box key={filter.id} sx={{ width: `${fixedWidth}px`, minWidth: `${fixedWidth}px`, maxWidth: `${fixedWidth}px`, flexShrink: 0 }}>
            <FormControl
              fullWidth
              size="small"
              sx={{
                minHeight: designTokens.components.filter.height.small,
                '& .MuiInputBase-root': {
                  height: designTokens.components.filter.height.small
                },
                '& .MuiInputLabel-root': {
                  transform: 'translate(14px, 9px) scale(1)',
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(14px, -9px) scale(0.75)'
                  }
                }
              }}
            >
              <InputLabel>{filter.label}</InputLabel>
              <Select
                value={filter.value}
                onChange={handleSelectChange(filter.onChange)}
                label={filter.label}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      zIndex: designTokens.zIndex.dropdown,
                      boxShadow: designTokens.components.card.shadow.medium,
                      mt: 0.5
                    }
                  }
                }}
              >
                {filter.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 'custom':
        return (
          <Box key={filter.id} sx={{ width: `${fixedWidth}px`, minWidth: `${fixedWidth}px`, maxWidth: `${fixedWidth}px`, flexShrink: 0 }}>
            {filter.customComponent}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper
      sx={{
        p: designTokens.components.filter.padding / 8,
        mb: 3,
        minHeight: designTokens.components.filter.minContainerHeight,
        overflow: 'visible',
        boxShadow: designTokens.components.card.shadow.light,
        width: 'fit-content', // Only as wide as content
        maxWidth: '100%', // Never exceed viewport
        boxSizing: 'border-box'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'flex-start',
          minHeight: designTokens.components.filter.minContainerHeight - (designTokens.components.filter.padding * 2)
        }}
      >
        {/* Render all filters */}
        {filters.map(renderFilter)}

        {/* Clear Filters Button */}
        {showClearButton && onClearFilters && (
          <Box sx={{ flexBasis: '100px', minWidth: '100px', flexGrow: 0, flexShrink: 0 }}>
            <Button
              fullWidth
              startIcon={<FilterList />}
              onClick={onClearFilters}
              size="small"
              variant="outlined"
              sx={{
                height: designTokens.components.filter.height.small,
                minHeight: designTokens.components.filter.height.small
              }}
            >
              Clear
            </Button>
          </Box>
        )}

        {/* Action Buttons */}
        {actions.map((action, index) => (
          <Box
            key={`action-${index}`}
            sx={{
              flexBasis: '150px',
              minWidth: '150px',
              flexGrow: 0,
              flexShrink: 0
            }}
          >
            {action}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default FilterBar;
