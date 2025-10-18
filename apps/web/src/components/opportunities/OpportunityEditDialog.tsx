import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { notify } from '../../utils/notifications';

interface Opportunity {
  id: string;
  name: string;
  partner: {
    name: string;
    type: string;
    tier: string;
  };
  stage: 'qualified' | 'proposal' | 'negotiation' | 'closing' | 'won' | 'lost';
  amount: number;
  currency: string;
  probability: number;
  weightedValue: number;
  owner: {
    name: string;
    avatar?: string;
  };
  expectedCloseDate: string;
  daysInStage: number;
  health: 'healthy' | 'at-risk' | 'critical';
}

interface OpportunityEditDialogProps {
  open: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  onSave: (updatedData: Partial<Opportunity>) => void;
}

interface OpportunityFormData {
  name: string;
  amount: number;
  stage: 'qualified' | 'proposal' | 'negotiation' | 'closing' | 'won' | 'lost';
  probability: number;
  expectedCloseDate: string;
  partnerName: string;
  ownerName: string;
  health: 'healthy' | 'at-risk' | 'critical';
}

const STAGE_OPTIONS = [
  { value: 'qualified', label: 'Qualified', color: '#2196f3' },
  { value: 'proposal', label: 'Proposal', color: '#ff9800' },
  { value: 'negotiation', label: 'Negotiation', color: '#9C27B0' },
  { value: 'closing', label: 'Closing', color: '#4caf50' },
  { value: 'won', label: 'Won', color: '#4caf50' },
  { value: 'lost', label: 'Lost', color: '#f44336' }
];

const HEALTH_OPTIONS = [
  { value: 'healthy', label: 'Healthy', color: '#4caf50' },
  { value: 'at-risk', label: 'At Risk', color: '#ff9800' },
  { value: 'critical', label: 'Critical', color: '#f44336' }
];

export const OpportunityEditDialog: React.FC<OpportunityEditDialogProps> = ({
  open,
  opportunity,
  onClose,
  onSave
}) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<OpportunityFormData>({
    name: '',
    amount: 0,
    stage: 'qualified',
    probability: 50,
    expectedCloseDate: '',
    partnerName: '',
    ownerName: '',
    health: 'healthy'
  });

  useEffect(() => {
    if (open && opportunity) {
      setFormData({
        name: opportunity.name,
        amount: opportunity.amount,
        stage: opportunity.stage,
        probability: opportunity.probability,
        expectedCloseDate: new Date(opportunity.expectedCloseDate).toISOString().split('T')[0],
        partnerName: opportunity.partner.name,
        ownerName: opportunity.owner.name,
        health: opportunity.health
      });
    }
  }, [open, opportunity]);

  const handleChange = (field: keyof OpportunityFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'amount' || field === 'probability' ? Number(value) : value
    }));
  };

  const handleSave = () => {
    if (!opportunity) return;

    // Validation
    if (!formData.name.trim()) {
      notify.error('Name is required');
      return;
    }

    if (formData.amount < 0) {
      notify.error('Amount must be positive');
      return;
    }

    if (formData.probability < 0 || formData.probability > 100) {
      notify.error('Probability must be between 0 and 100');
      return;
    }

    setSaving(true);

    // Calculate weighted value
    const weightedValue = (formData.amount * formData.probability) / 100;

    // Update the opportunity with new values
    onSave({
      name: formData.name,
      amount: formData.amount,
      stage: formData.stage,
      probability: formData.probability,
      expectedCloseDate: formData.expectedCloseDate,
      health: formData.health,
      weightedValue,
      partner: {
        ...opportunity.partner,
        name: formData.partnerName
      },
      owner: {
        ...opportunity.owner,
        name: formData.ownerName
      }
    });

    notify.success('Opportunity updated successfully');
    setSaving(false);
    onClose();
  };

  const calculateWeightedValue = () => {
    return (formData.amount * formData.probability) / 100;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Edit Opportunity
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          {/* Name */}
          <Grid item xs={12}>
            <TextField
              label="Opportunity Name"
              value={formData.name}
              onChange={handleChange('name')}
              fullWidth
              required
            />
          </Grid>

          {/* Partner Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Partner"
              value={formData.partnerName}
              onChange={handleChange('partnerName')}
              fullWidth
            />
          </Grid>

          {/* Owner Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Owner"
              value={formData.ownerName}
              onChange={handleChange('ownerName')}
              fullWidth
            />
          </Grid>

          {/* Stage */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Stage"
              value={formData.stage}
              onChange={handleChange('stage')}
              select
              fullWidth
              required
            >
              {STAGE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={option.label}
                      size="small"
                      sx={{
                        backgroundColor: option.color,
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Health */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Health"
              value={formData.health}
              onChange={handleChange('health')}
              select
              fullWidth
              required
            >
              {HEALTH_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={option.label}
                      size="small"
                      sx={{
                        backgroundColor: option.color,
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Amount */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Amount ($)"
              type="number"
              value={formData.amount}
              onChange={handleChange('amount')}
              fullWidth
              required
              inputProps={{ min: 0, step: 1000 }}
            />
          </Grid>

          {/* Probability */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Probability (%)"
              type="number"
              value={formData.probability}
              onChange={handleChange('probability')}
              fullWidth
              required
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>

          {/* Expected Close Date */}
          <Grid item xs={12}>
            <TextField
              label="Expected Close Date"
              type="date"
              value={formData.expectedCloseDate}
              onChange={handleChange('expectedCloseDate')}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Weighted Value Display */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                border: '1px solid',
                borderColor: '#e0e0e0'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Weighted Value
              </Typography>
              <Typography variant="h5" color="primary" fontWeight="bold">
                ${calculateWeightedValue().toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ${formData.amount.toLocaleString()} × {formData.probability}%
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
