import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuthStore } from './stores/authStoreSimple';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import OverallDashboard from './pages/Dashboard/OverallDashboard';
import OpportunitiesDashboard from './pages/Dashboard/OpportunitiesDashboard';
import PartnershipsDashboard from './pages/Dashboard/PartnershipsDashboard';
import FinancialDashboard from './pages/Dashboard/FinancialDashboard';
import Login from './pages/Auth/Login';
import Partners from './pages/Partners/Partners';
import Commissions from './pages/Commissions/Commissions';
import OpportunitiesPage from './pages/OpportunitiesPage';
import Opportunities from './pages/Opportunities/Opportunities';
import UserManagement from './pages/Admin/UserManagement';
import ProtectedRoute from './components/common/ProtectedRoute';
import { NavigationTest } from './components/test/NavigationTest';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboards/overall" /> : <Login />}
        />

        {/* Focused Dashboard Routes */}
        <Route
          path="/dashboards/overall"
          element={
            <ProtectedRoute>
              <AppLayout title="Overall Dashboard">
                <OverallDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboards/opportunities"
          element={
            <ProtectedRoute>
              <AppLayout title="Opportunities Dashboard">
                <OpportunitiesDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboards/partnerships"
          element={
            <ProtectedRoute>
              <AppLayout title="Partnerships Dashboard">
                <PartnershipsDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboards/financial"
          element={
            <ProtectedRoute>
              <AppLayout title="Financial Dashboard">
                <FinancialDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Management Routes */}
        <Route
          path="/management/opportunities"
          element={
            <ProtectedRoute>
              <AppLayout title="Opportunity Management">
                <OpportunitiesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/management/partnerships"
          element={
            <ProtectedRoute>
              <AppLayout title="Partnership Management">
                <Partners />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AppLayout title="User Management">
                <UserManagement />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Navigation Test Route (temporary for testing) */}
        <Route
          path="/test/navigation"
          element={
            <ProtectedRoute>
              <AppLayout title="Navigation Test">
                <NavigationTest />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Legacy Route Redirects (will be enhanced in Story 9.4) */}
        <Route
          path="/dashboard"
          element={<Navigate to="/dashboards/overall" replace />}
        />
        <Route
          path="/partners"
          element={<Navigate to="/dashboards/partnerships" replace />}
        />
        <Route
          path="/commissions"
          element={<Navigate to="/dashboards/financial" replace />}
        />
        <Route
          path="/opportunities"
          element={<Navigate to="/dashboards/opportunities" replace />}
        />

        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboards/overall" : "/login"} />}
        />
      </Routes>
    </Box>
  );
}

export default App
