import { Routes, Route } from 'react-router-dom';
import { Box, Typography, AppBar, Toolbar, Button, Menu, MenuItem } from '@mui/material';
import { SupervisorAccount, Security, ExpandMore, Dashboard } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from './stores/authStoreSimple';
import { usePermissions } from './hooks/usePermissions';
import UserManagementSimple from './pages/Admin/UserManagementSimple';
import RoleManagement from './components/admin/RoleManagement';
import ExecutiveDashboardSimple from './components/executive/ExecutiveDashboardSimple';
import Partners from './pages/Partners/Partners';

function App() {
  const { user } = useAuthStore();
  const { canManageUsers } = usePermissions();
  const navigate = useNavigate();
  const [adminMenuAnchor, setAdminMenuAnchor] = useState<null | HTMLElement>(null);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Navigation */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Partnership Management Platform
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.firstName} {user?.lastName}
          </Typography>
          {canManageUsers() && (
            <>
              <Button
                color="inherit"
                onClick={(e) => setAdminMenuAnchor(e.currentTarget)}
                endIcon={<ExpandMore />}
                startIcon={<SupervisorAccount />}
              >
                Admin
              </Button>
              <Menu
                anchorEl={adminMenuAnchor}
                open={Boolean(adminMenuAnchor)}
                onClose={() => setAdminMenuAnchor(null)}
              >
                <MenuItem onClick={() => {
                  navigate('/admin/users');
                  setAdminMenuAnchor(null);
                }}>
                  <SupervisorAccount sx={{ mr: 1 }} />
                  User Management
                </MenuItem>
                <MenuItem onClick={() => {
                  navigate('/admin/roles');
                  setAdminMenuAnchor(null);
                }}>
                  <Security sx={{ mr: 1 }} />
                  Role Management
                </MenuItem>
              </Menu>
            </>
          )}
          <Button
            color="inherit"
            onClick={() => navigate('/executive')}
            startIcon={<Dashboard />}
            sx={{ ml: 1 }}
          >
            Executive
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        <Routes>
          <Route
            path="/"
            element={
              <Box>
                <Typography variant="h5" gutterBottom>Dashboard</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Application is working! User management is available.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Role: {user?.role}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/executive')}
                    startIcon={<Dashboard />}
                  >
                    Executive Dashboard
                  </Button>
                  {canManageUsers() && (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/admin/users')}
                        startIcon={<SupervisorAccount />}
                      >
                        User Management
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/admin/roles')}
                        startIcon={<Security />}
                      >
                        Role Management
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            }
          />
          <Route
            path="/admin/users"
            element={<UserManagementSimple />}
          />
          <Route
            path="/admin/roles"
            element={<RoleManagement />}
          />
          <Route
            path="/executive"
            element={<ExecutiveDashboardSimple />}
          />
          <Route
            path="/partners"
            element={<Partners />}
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;