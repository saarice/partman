import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Box,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import {
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStoreSimple';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  path?: string;
  children?: NavigationItem[];
  permission?: string;
}

const navigationStructure: NavigationItem[] = [
  {
    id: 'dashboards',
    label: 'Dashboards',
    icon: <BarChartOutlinedIcon />,
    children: [
      {
        id: 'overall-dashboard',
        label: 'Overall Dashboard',
        icon: <DashboardOutlinedIcon />,
        path: '/dashboards/overall'
      },
      {
        id: 'opportunities-dashboard',
        label: 'Opportunities Dashboard',
        icon: <TrendingUpOutlinedIcon />,
        path: '/dashboards/opportunities'
      },
      {
        id: 'partnerships-dashboard',
        label: 'Partnerships Dashboard',
        icon: <HandshakeOutlinedIcon />,
        path: '/dashboards/partnerships'
      },
      {
        id: 'financial-dashboard',
        label: 'Financial Dashboard',
        icon: <AttachMoneyOutlinedIcon />,
        path: '/dashboards/financial'
      }
    ]
  },
  {
    id: 'management',
    label: 'Management',
    icon: <WorkOutlineIcon />,
    children: [
      {
        id: 'opportunity-management',
        label: 'Opportunity Management',
        icon: <WorkOutlineIcon />,
        path: '/management/opportunities'
      },
      {
        id: 'partnership-management',
        label: 'Partnership Management',
        icon: <BusinessOutlinedIcon />,
        path: '/management/partnerships'
      }
    ]
  },
  {
    id: 'admin',
    label: 'User Management',
    icon: <SupervisorAccountOutlinedIcon />,
    path: '/admin/users',
    permission: 'system_owner'
  },
  {
    id: 'admin-test',
    label: 'Admin Test',
    icon: <SupervisorAccountOutlinedIcon />,
    path: '/admin/test',
    permission: 'system_owner'
  }
];

interface SidebarNavigationProps {
  open: boolean;
  onToggle: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ open, onToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboards', 'management']);

  const handleItemClick = (item: NavigationItem) => {
    console.log('Navigation item clicked:', item.id, item.path);
    console.log('Current user:', user);
    console.log('Has permission:', hasPermission(item.permission));

    if (item.path) {
      console.log('Navigating to:', item.path);
      try {
        navigate(item.path);
        console.log('Navigation completed to:', item.path);
      } catch (error) {
        console.error('Navigation error:', error);
      }
      if (isMobile) {
        onToggle();
      }
    } else if (item.children) {
      setExpandedItems(prev =>
        prev.includes(item.id)
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    }
  };

  const isActive = (path: string | undefined) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    console.log('Checking permission:', permission, 'User role:', user?.role);
    return user?.role === permission;
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    if (!hasPermission(item.permission)) return null;

    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.path);

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            selected={active}
            sx={{
              pl: level === 0 ? 2 : 4,
              pr: 2,
              py: 1.5,
              mx: level === 0 ? 0 : 1,
              my: level === 0 ? 0 : 0.25,
              borderLeft: active && level > 0 ? '4px solid #667eea' : 'none',
              borderRadius: level > 0 ? 1 : 0,
              backgroundColor: active ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
              color: active ? '#667eea' : level === 0 ? '#374151' : '#6b7280',
              '&:hover': {
                backgroundColor: active ? 'rgba(102, 126, 234, 0.15)' : 'rgba(0,0,0,0.04)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.15)',
                }
              }
            }}
          >
            <ListItemIcon
              sx={{
                color: active ? '#667eea' : '#6b7280',
                minWidth: 36
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: level === 0 ? '0.875rem' : '0.875rem',
                fontWeight: level === 0 ? 600 : 500,
                color: 'inherit'
              }}
            />
            {item.children && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        {item.children && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map(child => renderNavigationItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerWidth = 280;

  const drawerContent = (
    <Box sx={{ width: drawerWidth, height: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand Area */}
      <Box sx={{ py: 3, px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        {isMobile && (
          <IconButton onClick={onToggle} edge="start">
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#111827' }}>
          Partman
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        <List component="nav" sx={{ px: 0 }}>
          {navigationStructure.map(item => renderNavigationItem(item))}
        </List>
      </Box>

      <Divider />

      {/* User Info Area */}
      <Box sx={{ py: 2, px: 2 }}>
        <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
          Welcome, {user?.firstName} {user?.lastName}
        </Typography>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          top: 64, // Position below header
          height: 'calc(100vh - 64px)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default SidebarNavigation;