import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuthStore } from './stores/authStore';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login';
import Partners from './pages/Partners/Partners';
import Commissions from './pages/Commissions/Commissions';
import Opportunities from './pages/Opportunities/Opportunities';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partners"
          element={
            <ProtectedRoute>
              <Partners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/commissions"
          element={
            <ProtectedRoute>
              <Commissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/opportunities"
          element={
            <ProtectedRoute>
              <Opportunities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Box>
  );
}

export default App
