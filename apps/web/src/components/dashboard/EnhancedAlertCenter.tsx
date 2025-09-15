import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Alert as MuiAlert,
  Chip,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Notifications,
  Warning,
  Error,
  Info,
  CheckCircle,
  MoreVert,
  Refresh,
  FilterList,
  MarkEmailRead
} from '@mui/icons-material';
import { alertApi } from '../../services/alertService';
import type { Alert, AlertStats } from '@shared/types';

interface EnhancedAlertCenterProps {
  onAlertCountChange?: (count: number) => void;
}

const EnhancedAlertCenter: React.FC<EnhancedAlertCenterProps> = ({ onAlertCountChange }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const [alertsData, statsData] = await Promise.all([
        alertApi.getAlerts(showAcknowledged, 20),
        alertApi.getAlertStats()
      ]);

      setAlerts(alertsData);
      setStats(statsData);

      if (onAlertCountChange) {
        onAlertCountChange(statsData.totalAlerts);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [showAcknowledged]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Error color="error" />;
      case 'high': return <Warning color="warning" />;
      case 'medium': return <Info color="info" />;
      default: return <Info color="action" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return '💼';
      case 'partner': return '🤝';
      case 'goal': return '🎯';
      case 'task': return '✅';
      case 'commission': return '💰';
      default: return '📋';
    }
  };

  const handleSelectAll = () => {
    const unacknowledgedAlerts = alerts.filter(alert => !alert.isAcknowledged);
    if (selectedAlerts.length === unacknowledgedAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(unacknowledgedAlerts.map(alert => alert.id));
    }
  };

  const handleSelectAlert = (alertId: string, isAcknowledged: boolean) => {
    if (isAcknowledged) return; // Cannot select acknowledged alerts

    setSelectedAlerts(prev => {
      if (prev.includes(alertId)) {
        return prev.filter(id => id !== alertId);
      } else {
        return [...prev, alertId];
      }
    });
  };

  const handleAcknowledgeSelected = async () => {
    if (selectedAlerts.length === 0) return;

    try {
      await alertApi.acknowledgeMultipleAlerts(selectedAlerts);
      setSelectedAlerts([]);
      await loadAlerts();
    } catch (error) {
      console.error('Error acknowledging alerts:', error);
    }
  };

  const handleAcknowledgeSingle = async (alertId: string) => {
    try {
      await alertApi.acknowledgeAlert(alertId);
      await loadAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleGenerateAlerts = async () => {
    try {
      setLoading(true);
      await alertApi.generateAlerts();
      // Wait a bit for alerts to be generated
      setTimeout(() => {
        loadAlerts();
      }, 2000);
    } catch (error) {
      console.error('Error generating alerts:', error);
    }
  };

  const handleShowDetails = (alert: Alert) => {
    setSelectedAlert(alert);
    setDetailsOpen(true);
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.isAcknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.isAcknowledged);

  if (!stats) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Notifications color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Alert Center</Typography>
          </Box>
          <Typography>Loading alerts...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge badgeContent={stats.totalAlerts} color="error">
              <Notifications color="primary" sx={{ mr: 1 }} />
            </Badge>
            <Typography variant="h6" sx={{ ml: 1 }}>Alert Center</Typography>
            {stats.urgentAlerts > 0 && (
              <Chip
                label={`${stats.urgentAlerts} Urgent`}
                color="error"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh alerts">
              <IconButton size="small" onClick={loadAlerts} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>

            <Tooltip title="Generate new alerts">
              <Button
                size="small"
                variant="outlined"
                onClick={handleGenerateAlerts}
                disabled={loading}
              >
                Generate
              </Button>
            </Tooltip>

            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {stats.totalAlerts === 0 ? (
          <MuiAlert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body1">🎉 No active alerts - all systems running smoothly!</Typography>
          </MuiAlert>
        ) : (
          <>
            {/* Alert Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedAlerts.length > 0 && selectedAlerts.length === unacknowledgedAlerts.length}
                    indeterminate={selectedAlerts.length > 0 && selectedAlerts.length < unacknowledgedAlerts.length}
                    onChange={handleSelectAll}
                  />
                }
                label={`Select all (${unacknowledgedAlerts.length})`}
              />

              {selectedAlerts.length > 0 && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<MarkEmailRead />}
                  onClick={handleAcknowledgeSelected}
                >
                  Acknowledge ({selectedAlerts.length})
                </Button>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={showAcknowledged}
                    onChange={(e) => setShowAcknowledged(e.target.checked)}
                  />
                }
                label="Show acknowledged"
              />
            </Box>

            {/* Unacknowledged Alerts */}
            {unacknowledgedAlerts.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Active Alerts ({unacknowledgedAlerts.length})
                </Typography>
                <List dense>
                  {unacknowledgedAlerts.map((alert) => (
                    <ListItem
                      key={alert.id}
                      sx={{
                        border: 1,
                        borderColor: `${getPriorityColor(alert.priority)}.main`,
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: `${getPriorityColor(alert.priority)}.50`
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={selectedAlerts.includes(alert.id)}
                          onChange={() => handleSelectAlert(alert.id, alert.isAcknowledged)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{getTypeIcon(alert.type)}</span>
                            <Typography variant="body2" fontWeight="medium">
                              {alert.title}
                            </Typography>
                            <Chip
                              label={alert.priority.toUpperCase()}
                              color={getPriorityColor(alert.priority) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {alert.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(alert.createdAt).toLocaleDateString()} at{' '}
                              {new Date(alert.createdAt).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        }
                        onClick={() => handleShowDetails(alert)}
                        sx={{ cursor: 'pointer' }}
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Acknowledge">
                          <IconButton
                            size="small"
                            onClick={() => handleAcknowledgeSingle(alert.id)}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Acknowledged Alerts */}
            {showAcknowledged && acknowledgedAlerts.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Acknowledged Alerts ({acknowledgedAlerts.length})
                </Typography>
                <List dense>
                  {acknowledgedAlerts.map((alert) => (
                    <ListItem
                      key={alert.id}
                      sx={{
                        border: 1,
                        borderColor: 'grey.300',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: 'grey.50',
                        opacity: 0.7
                      }}
                    >
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{getTypeIcon(alert.type)}</span>
                            <Typography variant="body2" color="text.secondary">
                              {alert.title}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            Acknowledged {alert.acknowledgedAt ? new Date(alert.acknowledgedAt).toLocaleDateString() : 'recently'}
                          </Typography>
                        }
                        onClick={() => handleShowDetails(alert)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </>
        )}

        {/* Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => {
            setShowAcknowledged(!showAcknowledged);
            setMenuAnchor(null);
          }}>
            <FilterList sx={{ mr: 1 }} />
            {showAcknowledged ? 'Hide' : 'Show'} Acknowledged
          </MenuItem>
        </Menu>

        {/* Alert Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedAlert && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getPriorityIcon(selectedAlert.priority)}
                  <span>{getTypeIcon(selectedAlert.type)}</span>
                  {selectedAlert.title}
                  <Chip
                    label={selectedAlert.priority.toUpperCase()}
                    color={getPriorityColor(selectedAlert.priority) as any}
                    size="small"
                  />
                </Box>
              </DialogTitle>
              <DialogContent>
                <Typography variant="body1" gutterBottom>
                  {selectedAlert.message}
                </Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Type:</strong> {selectedAlert.type}<br />
                    <strong>Priority:</strong> {selectedAlert.priority}<br />
                    <strong>Created:</strong> {new Date(selectedAlert.createdAt).toLocaleString()}<br />
                    {selectedAlert.entityId && (
                      <>
                        <strong>Entity ID:</strong> {selectedAlert.entityId}<br />
                      </>
                    )}
                    {selectedAlert.isAcknowledged && selectedAlert.acknowledgedAt && (
                      <>
                        <strong>Acknowledged:</strong> {new Date(selectedAlert.acknowledgedAt).toLocaleString()}<br />
                      </>
                    )}
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions>
                {!selectedAlert.isAcknowledged && (
                  <Button
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={() => {
                      handleAcknowledgeSingle(selectedAlert.id);
                      setDetailsOpen(false);
                    }}
                  >
                    Acknowledge
                  </Button>
                )}
                <Button onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EnhancedAlertCenter;