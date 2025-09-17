import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonPin as ImpersonateIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { useAuthStore } from '../../stores/authStoreSimple';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@partman.com',
    firstName: 'System',
    lastName: 'Owner',
    role: 'system_owner',
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    email: 'vp@partman.com',
    firstName: 'VP',
    lastName: 'Strategic',
    role: 'vp_strategic_partnerships',
    isActive: true,
    createdAt: '2024-01-02'
  },
  {
    id: '3',
    email: 'manager@partman.com',
    firstName: 'Sales',
    lastName: 'Manager',
    role: 'sales_manager',
    isActive: true,
    createdAt: '2024-01-03'
  },
  {
    id: '4',
    email: 'partner@partman.com',
    firstName: 'Partnership',
    lastName: 'Manager',
    role: 'partnership_manager',
    isActive: true,
    createdAt: '2024-01-04'
  },
  {
    id: '5',
    email: 'sales@partman.com',
    firstName: 'Sales',
    lastName: 'Rep',
    role: 'sales_rep',
    isActive: false,
    createdAt: '2024-01-05'
  }
];

const UserManagementSimple: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<keyof User>('firstName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'sales_rep',
    isActive: true
  });

  const roles = [
    { value: 'system_owner', label: 'System Owner' },
    { value: 'vp_strategic_partnerships', label: 'VP Strategic Partnerships' },
    { value: 'sales_manager', label: 'Sales Manager' },
    { value: 'partnership_manager', label: 'Partnership Manager' },
    { value: 'sales_rep', label: 'Sales Rep' },
    { value: 'read_only', label: 'Read Only' }
  ];

  const getRoleDisplayName = (role: string): string => {
    return roles.find(r => r.value === role)?.label || role;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'system_owner': return 'error';
      case 'vp_strategic_partnerships': return 'primary';
      case 'sales_manager': return 'secondary';
      case 'partnership_manager': return 'info';
      case 'sales_rep': return 'success';
      case 'read_only': return 'default';
      default: return 'default';
    }
  };

  const handleCreateUser = () => {
    const newUser: User = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, newUser]);
    setCreateDialogOpen(false);
    resetForm();
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    setUsers(users.map(user =>
      user.id === selectedUser.id
        ? { ...user, ...formData }
        : user
    ));
    setEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, isActive: false }
          : user
      ));
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive
    });
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: 'sales_rep',
      isActive: true
    });
    setSelectedUser(null);
  };

  const getFilteredAndSortedUsers = () => {
    let filteredUsers = users;

    // Apply status filter
    if (statusFilter === 'active') {
      filteredUsers = filteredUsers.filter(user => user.isActive);
    } else if (statusFilter === 'inactive') {
      filteredUsers = filteredUsers.filter(user => !user.isActive);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        getRoleDisplayName(user.role).toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filteredUsers.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Special handling for role display names
      if (sortField === 'role') {
        aValue = getRoleDisplayName(a.role as string);
        bValue = getRoleDisplayName(b.role as string);
      }

      // Convert to string for comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return filteredUsers;
  };

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof User) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight="bold">
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="inactive">Inactive Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setStatusFilter('all');
                setSearchTerm('');
              }}
              size="small"
            >
              Clear All
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Users Table */}
      <Box sx={{ p: 3 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('firstName')}
                >
                  <Box display="flex" alignItems="center">
                    User {getSortIcon('firstName')}
                  </Box>
                </TableCell>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('email')}
                >
                  <Box display="flex" alignItems="center">
                    Email {getSortIcon('email')}
                  </Box>
                </TableCell>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('role')}
                >
                  <Box display="flex" alignItems="center">
                    Role {getSortIcon('role')}
                  </Box>
                </TableCell>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('isActive')}
                >
                  <Box display="flex" alignItems="center">
                    Status {getSortIcon('isActive')}
                  </Box>
                </TableCell>
                <TableCell
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('createdAt')}
                >
                  <Box display="flex" alignItems="center">
                    Created {getSortIcon('createdAt')}
                  </Box>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredAndSortedUsers().map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user.firstName[0]}{user.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {user.firstName} {user.lastName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleDisplayName(user.role)}
                      color={getRoleColor(user.role) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(user)}
                      title="Edit User"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Deactivate User"
                      disabled={user.id === currentUser?.id}
                    >
                      <DeleteIcon />
                    </IconButton>
                    {currentUser?.role === 'system_owner' && user.id !== currentUser?.id && (
                      <IconButton
                        size="small"
                        title="Impersonate User"
                      >
                        <ImpersonateIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  label="Role"
                >
                  {roles.map(role => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  label="Role"
                >
                  {roles.map(role => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditUser} variant="contained">
            Update User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementSimple;