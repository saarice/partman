import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  PermissionCategory,
  PermissionAction,
  SYSTEM_ROLES,
  PERMISSION_DEFINITIONS
} from '../../types/permissions';
import type { Role } from '../../types/permissions';

interface PermissionMatrixProps {
  selectedRole?: string;
  showAllRoles?: boolean;
}

const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  selectedRole,
  showAllRoles = true
}) => {
  const categories = Object.values(PermissionCategory);
  const actions = Object.values(PermissionAction);
  const roles = Object.keys(SYSTEM_ROLES);

  const getPermissionKey = (category: PermissionCategory, action: PermissionAction) => {
    return `${category}.${action}`;
  };

  const hasPermission = (roleKey: string, category: PermissionCategory, action: PermissionAction): boolean => {
    const role = SYSTEM_ROLES[roleKey];
    if (!role) return false;

    // System Owner has all permissions
    if (roleKey === 'system_owner') return true;

    return role.permissions[category]?.includes(action) || false;
  };

  const getPermissionDescription = (category: PermissionCategory, action: PermissionAction): string => {
    const key = getPermissionKey(category, action);
    return PERMISSION_DEFINITIONS[key]?.description || `${action} ${category.toLowerCase()}`;
  };

  const rolesToShow = selectedRole ? [selectedRole] : (showAllRoles ? roles : []);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Permission Matrix
      </Typography>

      <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 200, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 2 }}>
                Permission
              </TableCell>
              {rolesToShow.map(roleKey => (
                <TableCell key={roleKey} align="center" sx={{ fontWeight: 'bold', minWidth: 120 }}>
                  <Chip
                    label={SYSTEM_ROLES[roleKey]?.name}
                    size="small"
                    sx={{
                      bgcolor: SYSTEM_ROLES[roleKey]?.color,
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map(category => (
              <React.Fragment key={category}>
                {/* Category Header */}
                <TableRow>
                  <TableCell
                    colSpan={rolesToShow.length + 1}
                    sx={{
                      bgcolor: 'grey.100',
                      fontWeight: 'bold',
                      borderTop: 2,
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="subtitle2" color="primary">
                      {category.replace('_', ' ')}
                    </Typography>
                  </TableCell>
                </TableRow>

                {/* Actions for this category */}
                {actions
                  .filter(action => {
                    // Only show actions that are relevant to this category
                    const key = getPermissionKey(category, action);
                    return PERMISSION_DEFINITIONS[key] !== undefined;
                  })
                  .map(action => (
                    <TableRow key={`${category}-${action}`} hover>
                      <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {action.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Tooltip title={getPermissionDescription(category, action)}>
                            <IconButton size="small">
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      {rolesToShow.map(roleKey => (
                        <TableCell key={`${roleKey}-${category}-${action}`} align="center">
                          {hasPermission(roleKey, category, action) ? (
                            <CheckIcon color="success" fontSize="small" />
                          ) : (
                            <CloseIcon color="disabled" fontSize="small" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedRole && (
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            Showing permissions for: <strong>{SYSTEM_ROLES[selectedRole]?.name}</strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PermissionMatrix;