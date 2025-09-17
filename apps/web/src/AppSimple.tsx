import { Routes, Route } from 'react-router-dom';
import { Box, Typography, AppBar, Toolbar, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function AppSimple() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Navigation */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            🚀 Partnership Management Platform
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => navigate('/partners')}>
            Partners
          </Button>
          <Button color="inherit" onClick={() => navigate('/admin/users')}>
            Users
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
                <Typography variant="h4" gutterBottom>📊 Executive Dashboard</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Partnership Management Platform is working!
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button variant="contained" onClick={() => navigate('/partners')}>
                    🤝 Partnership Manager
                  </Button>
                  <Button variant="outlined" onClick={() => navigate('/admin/users')}>
                    👥 User Management
                  </Button>
                </Box>
              </Box>
            }
          />
          <Route
            path="/partners"
            element={
              <Box>
                <Typography variant="h4" gutterBottom>🤝 Partnership Manager</Typography>
                <Typography variant="body1">
                  Partner management functionality goes here.
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/')}>
                  Back to Dashboard
                </Button>
              </Box>
            }
          />
          <Route
            path="/admin/users"
            element={
              <Box>
                <Typography variant="h4" gutterBottom>👥 User Management</Typography>
                <Typography variant="body1">
                  User management functionality goes here.
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/')}>
                  Back to Dashboard
                </Button>
              </Box>
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default AppSimple;