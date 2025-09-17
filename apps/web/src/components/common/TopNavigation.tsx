import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  Business,
  Dashboard as DashboardIcon,
  Calculate,
  Timeline,
  SupervisorAccount
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStoreSimple';

interface TopNavigationProps {
  title?: string;
  currentPage?: 'dashboard' | 'partners' | 'commissions' | 'opportunities' | 'admin';
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  title = 'Partnership Management',
  currentPage
}) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const isCurrentPage = (page: string) => currentPage === page;

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            onClick={() => navigate('/dashboard')}
            title="Dashboard"
            sx={{
              backgroundColor: isCurrentPage('dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <DashboardIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => navigate('/partners')}
            title="Partner Portfolio"
            sx={{
              backgroundColor: isCurrentPage('partners') ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <Business />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => navigate('/commissions')}
            title="Commission Calculator"
            sx={{
              backgroundColor: isCurrentPage('commissions') ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <Calculate />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => navigate('/opportunities')}
            title="Opportunity Pipeline"
            sx={{
              backgroundColor: isCurrentPage('opportunities') ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <Timeline />
          </IconButton>
          {user?.role === 'system_owner' && (
            <IconButton
              color="inherit"
              onClick={() => navigate('/admin/users')}
              title="User Management"
              sx={{
                backgroundColor: isCurrentPage('admin') ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <SupervisorAccount />
            </IconButton>
          )}
          <Typography variant="body2" color="inherit">
            Welcome, {user?.firstName} {user?.lastName}
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account menu"
            color="inherit"
            onClick={handleMenuOpen}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavigation;