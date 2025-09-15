import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonPin as ImpersonateIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { User, UserRole } from '../../../../packages/shared/src/types/user';

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onImpersonate: (userId: string) => void;
  canManageUser: (user: User) => boolean;
  getRoleDisplayName: (role: UserRole) => string;
  getRoleColor: (role: UserRole) => 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  currentUserRole?: UserRole;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  onEdit,
  onDelete,
  onImpersonate,
  canManageUser,
  getRoleDisplayName,
  getRoleColor,
  currentUserRole
}) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No users found
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Login</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {getInitials(user.firstName, user.lastName)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {user.firstName} {user.lastName}
                    </Typography>
                    {user.role === UserRole.SYSTEM_OWNER && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <SecurityIcon fontSize="small" color="error" />
                        <Typography variant="caption" color="error">
                          System Owner
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </TableCell>

              <TableCell>
                <Typography variant="body2">
                  {user.email}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  label={getRoleDisplayName(user.role)}
                  color={getRoleColor(user.role)}
                  size="small"
                />
              </TableCell>

              <TableCell>
                <Chip
                  label={user.isActive ? 'Active' : 'Inactive'}
                  color={user.isActive ? 'success' : 'default'}
                  size="small"
                  variant={user.isActive ? 'filled' : 'outlined'}
                />
              </TableCell>

              <TableCell>
                <Typography variant="body2" color="textSecondary">
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2" color="textSecondary">
                  {formatDate(user.createdAt)}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Box display="flex" justifyContent="center" gap={1}>
                  {canManageUser(user) && (
                    <Tooltip title="Edit User">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(user)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  {canManageUser(user) && user.role !== UserRole.SYSTEM_OWNER && (
                    <Tooltip title="Deactivate User">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(user.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  {currentUserRole === UserRole.SYSTEM_OWNER && user.isActive && (
                    <Tooltip title="Impersonate User">
                      <IconButton
                        size="small"
                        onClick={() => onImpersonate(user.id)}
                        color="warning"
                      >
                        <ImpersonateIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;