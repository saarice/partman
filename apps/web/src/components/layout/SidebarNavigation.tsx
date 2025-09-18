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
import {
  Dashboard as DashboardIcon,
  Timeline,
  Business,
  AttachMoney,
  BarChart,
  ManageAccounts,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  SupervisorAccount
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
    label: '📊 Dashboards',
    icon: <DashboardIcon />,
    children: [
      {
        id: 'overall-dashboard',
        label: 'Overall Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboards/overall'
      },
      {
        id: 'opportunities-dashboard',
        label: 'Opportunities Dashboard',
        icon: <Timeline />,
        path: '/dashboards/opportunities'
      },
      {
        id: 'partnerships-dashboard',
        label: 'Partnerships Dashboard',
        icon: <Business />,
        path: '/dashboards/partnerships'
      },
      {
        id: 'financial-dashboard',
        label: 'Financial Dashboard',
        icon: <AttachMoney />,
        path: '/dashboards/financial'
      }
    ]
  },
  {
    id: 'management',
    label: '⚙️ Management',
    icon: <ManageAccounts />,
    children: [
      {
        id: 'opportunity-management',
        label: 'Opportunity Management',
        icon: <BarChart />,
        path: '/management/opportunities'
      },
      {
        id: 'partnership-management',
        label: 'Partnership Management',
        icon: <Business />,
        path: '/management/partnerships'
      }
    ]
  },
  {
    id: 'admin',
    label: '👨‍💼 User Management',
    icon: <SupervisorAccount />,
    path: '/admin/users',
    permission: 'system_owner'
  },
  {
    id: 'admin-test',
    label: '🔧 Admin Test',
    icon: <SupervisorAccount />,
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
              pl: 2 + level * 2,
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              backgroundColor: active ? theme.palette.primary.main : 'transparent',
              color: active ? theme.palette.primary.contrastText : 'inherit',
              '&:hover': {
                backgroundColor: active
                  ? theme.palette.primary.dark
                  : theme.palette.action.hover,
              },
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }
            }}
          >
            <ListItemIcon
              sx={{
                color: active ? theme.palette.primary.contrastText : 'inherit',
                minWidth: 36
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: level === 0 ? '0.875rem' : '0.8rem',
                fontWeight: level === 0 ? 600 : 500
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
    <Box sx={{ width: drawerWidth, height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        {isMobile && (
          <IconButton onClick={onToggle} edge="start">
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Partman
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto', pt: 1 }}>
        <List component="nav">
          {navigationStructure.map(item => renderNavigationItem(item))}
        </List>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
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
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'relative',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default SidebarNavigation;