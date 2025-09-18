import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuthStore } from './stores/authStoreSimple';
import AppLayout from './components/layout/AppLayout';
import UserManagementSimple from './pages/Admin/UserManagementSimple';
import ProtectedRoute from './components/common/ProtectedRoute';

function AppSimple() {
  const { isAuthenticated } = useAuthStore();

  console.log('AppSimple rendering, isAuthenticated:', isAuthenticated);
  console.log('Current location:', window.location.pathname);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <div>
              {console.log('ADMIN USERS ROUTE MATCHED!')}
              <ProtectedRoute>
                <AppLayout title="User Management">
                  <div style={{padding: '20px', border: '2px solid red'}}>
                    <h1 style={{color: 'red'}}>🔴 ADMIN USERS ROUTE MATCHED!</h1>
                    <UserManagementSimple />
                  </div>
                </AppLayout>
              </ProtectedRoute>
            </div>
          }
        />

        {/* Default Dashboard Route */}
        <Route
          path="/"
          element={
            <div>
              {console.log('DASHBOARD ROUTE MATCHED!')}
              <ProtectedRoute>
                <AppLayout title="Dashboard">
                  <Box sx={{ p: 3 }}>
                    <h1>📊 Executive Dashboard</h1>
                    <p>Partnership Management Platform is working!</p>
                  </Box>
                </AppLayout>
              </ProtectedRoute>
            </div>
          }
        />

        {/* Catch all other routes and redirect to dashboard */}
        <Route
          path="*"
          element={
            <div>
              {console.log('CATCH-ALL ROUTE MATCHED!')}
              <Navigate to="/" replace />
            </div>
          }
        />
      </Routes>
    </Box>
  );
}

export default AppSimple;