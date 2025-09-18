import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuthStore } from './stores/authStoreSimple';
import AppLayout from './components/layout/AppLayout';
import UserManagement from './pages/Admin/UserManagement';
import ProtectedRoute from './components/common/ProtectedRoute';

function AppSimple() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AppLayout title="User Management">
                <div>
                  <h1>DEBUG: Admin Users Route Matched!</h1>
                  <UserManagement />
                </div>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Default Dashboard Route */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout title="Dashboard">
                <Box sx={{ p: 3 }}>
                  <h1>📊 Executive Dashboard</h1>
                  <p>Partnership Management Platform is working!</p>
                </Box>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all other routes and redirect to dashboard */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </Box>
  );
}

export default AppSimple;