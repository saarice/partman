import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { Group } from '@mui/icons-material';

interface TeamMemberPerformance {
  userId: string;
  userName: string;
  revenue: number;
  activeOpportunities: number;
  taskCompletionRate: number;
  goalProgress: number;
  lastActivityDate: Date;
}

interface TeamData {
  totalMembers: number;
  activeOpportunities: number;
  completedTasksThisWeek: number;
  teamPerformance: TeamMemberPerformance[];
  weeklyStatusCompliance: number;
}

interface TeamPerformanceProps {
  data?: TeamData;
}

const TeamPerformance: React.FC<TeamPerformanceProps> = ({ data }) => {
  if (!data) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Group color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Team Performance</Typography>
        </Box>
        
        <Typography variant="h4" color="primary" gutterBottom>
          {data.totalMembers}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Active team members
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {data.activeOpportunities} active opportunities
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.completedTasksThisWeek} tasks completed this week
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.weeklyStatusCompliance}% status compliance
          </Typography>
        </Box>
        
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Top Performers
          </Typography>
          <List dense>
            {data.teamPerformance.slice(0, 3).map((member) => (
              <ListItem key={member.userId} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                    {getInitials(member.userName)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={member.userName}
                  secondary={`${formatCurrency(member.revenue)} • ${member.activeOpportunities} ops`}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TeamPerformance;