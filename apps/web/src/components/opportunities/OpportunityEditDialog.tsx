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
  Chip,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
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
  probability?: number; // Legacy field - being replaced by commissionRate
  commissionRate?: number; // Commission percentage 0-100
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

interface PartnerOption {
  id: string;
  name: string;
  type: string;
  tier: string;
}

interface OpportunityFormData {
  name: string;
  amount: number;
  stage: 'qualified' | 'proposal' | 'negotiation' | 'closing' | 'won' | 'lost';
  commissionRate: number; // Commission percentage 0-100
  expectedCloseDate: string;
  partnerId: string;
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

// Mock partner data - would be replaced with API call
const MOCK_PARTNERS: PartnerOption[] = [
  { id: 'p1', name: 'CloudTech Solutions', type: 'Technology', tier: 'Enterprise' },
  { id: 'p2', name: 'SecureData Inc', type: 'Security', tier: 'Premium' },
  { id: 'p3', name: 'DevOps Pro', type: 'Professional Services', tier: 'Standard' },
  { id: 'p4', name: 'Analytics Plus', type: 'Data Analytics', tier: 'Premium' },
  { id: 'p5', name: 'Digital Partners Corp', type: 'Technology', tier: 'Strategic' }
];

export const OpportunityEditDialog: React.FC<OpportunityEditDialogProps> = ({
  open,
  opportunity,
  onClose,
  onSave
}) => {
  const [saving, setSaving] = useState(false);
  const [partners, setPartners] = useState<PartnerOption[]>(MOCK_PARTNERS);
  const [addPartnerDialogOpen, setAddPartnerDialogOpen] = useState(false);
  const [newPartnerData, setNewPartnerData] = useState({
    name: '',
    type: 'Technology',
    tier: 'Standard'
  });
  const [formData, setFormData] = useState<OpportunityFormData>({
    name: '',
    amount: 0,
    stage: 'qualified',
    commissionRate: 10, // Default 10%
    expectedCloseDate: '',
    partnerId: '',
    ownerName: '',
    health: 'healthy'
  });

  useEffect(() => {
    if (open) {
      if (opportunity) {
        // Edit mode: populate form with existing data
        // Find partner ID by name (mock logic - in real app, opportunity would have partnerId)
        const partner = partners.find(p => p.name === opportunity.partner.name);
        setFormData({
          name: opportunity.name,
          amount: opportunity.amount,
          stage: opportunity.stage,
          commissionRate: opportunity.commissionRate || opportunity.probability || 10,
          expectedCloseDate: new Date(opportunity.expectedCloseDate).toISOString().split('T')[0],
          partnerId: partner?.id || '',
          ownerName: opportunity.owner.name,
          health: opportunity.health
        });
      } else {
        // Add mode: reset to default values
        setFormData({
          name: '',
          amount: 0,
          stage: 'qualified',
          commissionRate: 10,
          expectedCloseDate: new Date().toISOString().split('T')[0],
          partnerId: '',
          ownerName: '',
          health: 'healthy'
        });
      }
    }
  }, [open, opportunity, partners]);

  const handleChange = (field: keyof OpportunityFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'amount' || field === 'commissionRate' ? Number(value) : value
    }));
  };

  const handleAddPartner = () => {
    if (!newPartnerData.name.trim()) {
      notify.error('Partner name is required');
      return;
    }

    // Create new partner
    const newPartner: PartnerOption = {
      id: `p-${Date.now()}`,
      name: newPartnerData.name,
      type: newPartnerData.type,
      tier: newPartnerData.tier
    };

    // Add to partners list
    setPartners(prev => [...prev, newPartner]);

    // Select the new partner
    setFormData(prev => ({ ...prev, partnerId: newPartner.id }));

    // Reset and close dialog
    setNewPartnerData({ name: '', type: 'Technology', tier: 'Standard' });
    setAddPartnerDialogOpen(false);
    notify.success('Partner added successfully');
  };

  const handleSave = () => {
    // Validation
    if (!formData.name.trim()) {
      notify.error('Name is required');
      return;
    }

    if (formData.amount < 0) {
      notify.error('Amount must be positive');
      return;
    }

    if (formData.commissionRate < 0 || formData.commissionRate > 100) {
      notify.error('Commission must be between 0 and 100');
      return;
    }

    if (!formData.partnerId) {
      notify.error('Partner is required');
      return;
    }

    if (!formData.ownerName.trim()) {
      notify.error('Owner name is required');
      return;
    }

    setSaving(true);

    // Calculate commission value
    const commissionValue = (formData.amount * formData.commissionRate) / 100;

    // Find selected partner
    const selectedPartner = partners.find(p => p.id === formData.partnerId);

    // Prepare data for save (works for both new and existing opportunities)
    const saveData: any = {
      name: formData.name,
      amount: formData.amount,
      stage: formData.stage,
      commissionRate: formData.commissionRate / 100, // Convert percentage to decimal (10% -> 0.10)
      expectedCloseDate: formData.expectedCloseDate,
      health: formData.health,
      weightedValue: commissionValue, // Use commission value as weighted value
      partner: {
        name: selectedPartner?.name || '',
        type: selectedPartner?.type || 'Technology',
        tier: selectedPartner?.tier || 'Standard'
      },
      owner: {
        name: formData.ownerName
      }
    };

    // If creating new opportunity, add required fields
    if (!opportunity) {
      saveData.id = `opp-${Date.now()}`;
      saveData.currency = 'USD';
      saveData.daysInStage = 0;
      saveData.probability = 75; // Default probability for legacy compatibility
    }

    onSave(saveData);

    notify.success(opportunity ? 'Opportunity updated successfully' : 'Opportunity created successfully');
    setSaving(false);
    onClose();
  };

  const calculateCommissionValue = () => {
    return (formData.amount * formData.commissionRate) / 100;
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {opportunity ? 'Edit Opportunity' : 'Add New Opportunity'}
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

          {/* Partner Selection */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Partner"
              value={formData.partnerId}
              onChange={handleChange('partnerId')}
              select
              fullWidth
              required
            >
              {partners.map((partner) => (
                <MenuItem key={partner.id} value={partner.id}>
                  <Box>
                    <Typography variant="body2">{partner.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {partner.type} · {partner.tier}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setAddPartnerDialogOpen(true)}
              size="small"
              sx={{ mt: 1 }}
            >
              Add New Partner
            </Button>
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

          {/* Commission Rate */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Commission (%)"
              type="number"
              value={formData.commissionRate}
              onChange={handleChange('commissionRate')}
              fullWidth
              required
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              helperText="Enter commission as percentage (0-100)"
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

          {/* Commission Value Display */}
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
                Commission Value
              </Typography>
              <Typography variant="h5" color="primary" fontWeight="bold">
                ${calculateCommissionValue().toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ${formData.amount.toLocaleString()} × {formData.commissionRate}%
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
          {saving ? 'Saving...' : (opportunity ? 'Save Changes' : 'Add Opportunity')}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Add Partner Dialog */}
    <Dialog
      open={addPartnerDialogOpen}
      onClose={() => setAddPartnerDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Add New Partner</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              label="Partner Name"
              value={newPartnerData.name}
              onChange={(e) => setNewPartnerData({ ...newPartnerData, name: e.target.value })}
              fullWidth
              required
              autoFocus
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Type"
              value={newPartnerData.type}
              onChange={(e) => setNewPartnerData({ ...newPartnerData, type: e.target.value })}
              select
              fullWidth
              required
            >
              <MenuItem value="Technology">Technology</MenuItem>
              <MenuItem value="Security">Security</MenuItem>
              <MenuItem value="Professional Services">Professional Services</MenuItem>
              <MenuItem value="Data Analytics">Data Analytics</MenuItem>
              <MenuItem value="FinOps">FinOps</MenuItem>
              <MenuItem value="DevOps">DevOps</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Tier"
              value={newPartnerData.tier}
              onChange={(e) => setNewPartnerData({ ...newPartnerData, tier: e.target.value })}
              select
              fullWidth
              required
            >
              <MenuItem value="Standard">Standard</MenuItem>
              <MenuItem value="Premium">Premium</MenuItem>
              <MenuItem value="Enterprise">Enterprise</MenuItem>
              <MenuItem value="Strategic">Strategic</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => setAddPartnerDialogOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleAddPartner} variant="contained">
          Add Partner
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};
