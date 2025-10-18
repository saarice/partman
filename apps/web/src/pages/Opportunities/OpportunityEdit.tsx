import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Cancel,
  TrendingUp,
  Person,
  Business,
  AttachMoney,
  CalendarToday
} from '@mui/icons-material';
import { getOpportunity, updateOpportunity } from '../../services/opportunityService';
import { notify } from '../../utils/notifications';

interface OpportunityFormData {
  title: string;
  description: string;
  customerName: string;
  customerId: string;
  partnerId: string;
  assignedUserId: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
}

const stages = [
  { value: 'lead', label: 'Lead', color: '#6b7280' },
  { value: 'demo', label: 'Demo', color: '#3b82f6' },
  { value: 'poc', label: 'POC', color: '#f59e0b' },
  { value: 'proposal', label: 'Proposal', color: '#8b5cf6' },
  { value: 'closed_won', label: 'Closed Won', color: '#10b981' },
  { value: 'closed_lost', label: 'Closed Lost', color: '#ef4444' }
];

const OpportunityEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OpportunityFormData>({
    title: '',
    description: '',
    customerName: '',
    customerId: '',
    partnerId: '',
    assignedUserId: '',
    value: 0,
    stage: 'lead',
    probability: 50,
    expectedCloseDate: ''
  });

  useEffect(() => {
    if (id) {
      loadOpportunity(id);
    }
  }, [id]);

  const loadOpportunity = async (opportunityId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOpportunity(opportunityId);

      if (response.data) {
        const opp = response.data;
        setFormData({
          title: opp.title || '',
          description: opp.description || '',
          customerName: opp.customerName || opp.customer_name || '',
          customerId: opp.customerId || opp.customer_id || '',
          partnerId: opp.partnerId || opp.partner_id || '',
          assignedUserId: opp.assignedUserId || opp.assigned_user_id || '',
          value: opp.value || 0,
          stage: opp.stage || 'lead',
          probability: opp.probability || 50,
          expectedCloseDate: opp.expectedCloseDate || opp.expected_close_date || ''
        });
      }
    } catch (err) {
      console.error('Error loading opportunity:', err);
      setError('Failed to load opportunity. Please try again.');
      notify.error('Failed to load opportunity');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof OpportunityFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      setSaving(true);
      setError(null);

      // Validation
      if (!formData.title.trim()) {
        notify.error('Title is required');
        return;
      }
      if (!formData.customerName.trim()) {
        notify.error('Customer name is required');
        return;
      }
      if (formData.value <= 0) {
        notify.error('Value must be greater than 0');
        return;
      }

      await updateOpportunity(id, formData);
      notify.success('Opportunity updated successfully');
      navigate('/management/opportunities');
    } catch (err) {
      console.error('Error saving opportunity:', err);
      setError('Failed to save opportunity. Please try again.');
      notify.error('Failed to save opportunity');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/management/opportunities');
  };

  const calculateWeightedValue = () => {
    return (formData.value * formData.probability / 100).toFixed(2);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/management/opportunities')}
          sx={{ textDecoration: 'none', color: 'primary.main' }}
        >
          Opportunities
        </Link>
        <Typography color="text.primary">Edit Opportunity</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Edit Opportunity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {id}
          </Typography>
        </Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleCancel}
          variant="outlined"
        >
          Back to List
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Opportunity Title"
              value={formData.title}
              onChange={handleChange('title')}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TrendingUp />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={4}
              placeholder="Describe the opportunity details, requirements, and key points..."
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
          </Grid>

          {/* Customer Name */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Customer Name"
              value={formData.customerName}
              onChange={handleChange('customerName')}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Customer ID */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Customer ID"
              value={formData.customerId}
              onChange={handleChange('customerId')}
              placeholder="Optional customer identifier"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Opportunity Details
            </Typography>
          </Grid>

          {/* Stage */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Stage</InputLabel>
              <Select
                value={formData.stage}
                label="Stage"
                onChange={handleChange('stage')}
              >
                {stages.map(stage => (
                  <MenuItem key={stage.value} value={stage.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: stage.color
                        }}
                      />
                      {stage.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Probability */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Probability (%)"
              value={formData.probability}
              onChange={handleChange('probability')}
              inputProps={{ min: 0, max: 100 }}
              helperText={`Win probability: ${formData.probability}%`}
            />
          </Grid>

          {/* Value */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Opportunity Value"
              value={formData.value}
              onChange={handleChange('value')}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    USD
                  </InputAdornment>
                )
              }}
              inputProps={{ min: 0, step: 1000 }}
            />
          </Grid>

          {/* Weighted Value (calculated) */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Weighted Value"
              value={`$${calculateWeightedValue()}`}
              disabled
              helperText="Calculated: Value × Probability"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Chip label="Calculated" size="small" color="primary" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Expected Close Date */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Expected Close Date"
              value={formData.expectedCloseDate}
              onChange={handleChange('expectedCloseDate')}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Partner ID */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Partner ID"
              value={formData.partnerId}
              onChange={handleChange('partnerId')}
              placeholder="Partner UUID"
              helperText="ID of the partner associated with this opportunity"
            />
          </Grid>

          {/* Assigned User ID */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Assigned User ID"
              value={formData.assignedUserId}
              onChange={handleChange('assignedUserId')}
              placeholder="User UUID"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                )
              }}
              helperText="ID of the user responsible for this opportunity"
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OpportunityEdit;
