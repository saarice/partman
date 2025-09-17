import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Security as SecurityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { SYSTEM_ROLES } from '../../types/permissions';
import PermissionMatrix from './PermissionMatrix';
import { usePermissions } from '../../hooks/usePermissions';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const RoleManagement: React.FC = () => {
  const { canManageUsers, isSystemOwner } = usePermissions();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const roles = Object.entries(SYSTEM_ROLES);

  const getPermissionCount = (roleKey: string) => {
    const role = SYSTEM_ROLES[roleKey];
    if (!role) return 0;

    return Object.values(role.permissions).reduce((total, actions) => total + actions.length, 0);
  };

  const getRoleIcon = (roleKey: string) => {
    switch (roleKey) {
      case 'system_owner': return <AdminIcon />;
      case 'vp_strategic_partnerships': return <SecurityIcon />;
      case 'sales_manager': return <AssignmentIcon />;
      case 'partnership_manager': return <GroupIcon />;
      default: return <SecurityIcon />;
    }
  };

  const openRoleDialog = (roleKey: string) => {
    setSelectedRole(roleKey);
    setDialogOpen(true);
  };

  const closeRoleDialog = () => {
    setSelectedRole(null);
    setDialogOpen(false);
    setTabValue(0);
  };

  if (!canManageUsers()) {
    return (
      <Alert severity="warning">
        You don't have permission to manage roles. Contact your system administrator.
      </Alert>
    );
  }

  const selectedRoleData = selectedRole ? SYSTEM_ROLES[selectedRole] : null;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Role Management
        </Typography>
        {isSystemOwner && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled
            title="Custom role creation - Coming soon"
          >
            Create Custom Role
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {roles.map(([roleKey, role]) => (
          <Grid item xs={12} md={6} lg={4} key={roleKey}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                '&:hover': { elevation: 4 }
              }}
              onClick={() => openRoleDialog(roleKey)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: role.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {getRoleIcon(roleKey)}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {role.name}
                    </Typography>
                    <Chip
                      label={role.isSystemRole ? 'System Role' : 'Custom Role'}
                      size="small"
                      color={role.isSystemRole ? 'primary' : 'secondary'}
                    />
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  {role.description}
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    {getPermissionCount(roleKey)} permissions
                  </Typography>
                  <Box>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={(e) => {
                        e.stopPropagation();
                        openRoleDialog(roleKey);
                      }}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {!role.isSystemRole && isSystemOwner && (
                      <Tooltip title="Edit Role">
                        <IconButton size="small" disabled>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <PermissionMatrix showAllRoles />
      </Box>

      {/* Role Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeRoleDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '80vh' } }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            {selectedRole && (
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: selectedRoleData?.color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {getRoleIcon(selectedRole)}
              </Box>
            )}
            <Box>
              <Typography variant="h6">
                {selectedRoleData?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedRoleData?.description}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Permissions" />
            <Tab label="Permission Matrix" />
            <Tab label="Details" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {selectedRoleData && (
              <Box>
                {Object.entries(selectedRoleData.permissions).map(([category, actions]) => (
                  <Box key={category} mb={3}>
                    <Typography variant="h6" gutterBottom>
                      {category.replace('_', ' ')}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      {actions.length > 0 ? (
                        actions.map((action: string) => (
                          <Chip
                            key={action}
                            label={action.replace('_', ' ').toUpperCase()}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No permissions in this category
                        </Typography>
                      )}
                    </Box>
                    <Divider />
                  </Box>
                ))}
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {selectedRole && (
              <PermissionMatrix selectedRole={selectedRole} showAllRoles={false} />
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {selectedRoleData && (
              <List>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Role Type"
                    secondary={selectedRoleData.isSystemRole ? 'System Role (Built-in)' : 'Custom Role'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Total Permissions"
                    secondary={`${getPermissionCount(selectedRole!)} permissions across ${Object.keys(selectedRoleData.permissions).length} categories`}
                  />
                </ListItem>
                {selectedRoleData.isSystemRole && (
                  <ListItem>
                    <ListItemText
                      primary="System Role"
                      secondary="This is a built-in system role that cannot be modified. It's part of the core permission structure."
                    />
                  </ListItem>
                )}
              </List>
            )}
          </TabPanel>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeRoleDialog}>Close</Button>
          {selectedRoleData && !selectedRoleData.isSystemRole && isSystemOwner && (
            <Button variant="contained" disabled>
              Edit Role
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagement;