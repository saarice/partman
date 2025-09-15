import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { PipelineStage } from '../../services/pipelineService';

interface FunnelChartProps {
  stages: PipelineStage[];
  onStageClick: (stage: string) => void;
  colors: Record<string, string>;
}

const FunnelChart: React.FC<FunnelChartProps> = ({ stages, onStageClick, colors }) => {
  const maxValue = Math.max(...stages.map(s => s.count));

  const getDisplayName = (stageId: string) => {
    const displayNames: Record<string, string> = {
      'lead': 'Lead',
      'demo': 'Demo',
      'poc': 'POC',
      'proposal': 'Proposal',
      'closed_won': 'Closed Won'
    };
    return displayNames[stageId] || stageId;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <Box sx={{ width: '100%', height: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {stages.map((stage, index) => {
        const widthPercentage = (stage.count / maxValue) * 100;
        const prevStageCount = index > 0 ? stages[index - 1].count : stage.count;
        const conversionFromPrev = index > 0 ? ((stage.count / prevStageCount) * 100).toFixed(1) : '100.0';

        return (
          <Tooltip
            key={stage.stage}
            title={
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {getDisplayName(stage.stage)}
                </Typography>
                <Typography variant="body2">
                  Opportunities: {stage.count}
                </Typography>
                <Typography variant="body2">
                  Total Value: {formatCurrency(stage.value)}
                </Typography>
                <Typography variant="body2">
                  Weighted Value: {formatCurrency(stage.value * stage.probability / 100)}
                </Typography>
                <Typography variant="body2">
                  Stage Probability: {stage.probability}%
                </Typography>
                <Typography variant="body2">
                  Conversion Rate: {stage.conversionRate || 0}%
                </Typography>
                {index > 0 && (
                  <Typography variant="body2">
                    From Previous Stage: {conversionFromPrev}%
                  </Typography>
                )}
              </Box>
            }
            placement="top"
          >
            <Box
              sx={{
                position: 'relative',
                height: '60px',
                margin: '8px auto',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}
              onClick={() => onStageClick(stage.stage)}
            >
              {/* Funnel segment */}
              <Box
                sx={{
                  width: `${Math.max(widthPercentage, 20)}%`,
                  height: '100%',
                  backgroundColor: colors[stage.stage] || '#ccc',
                  clipPath: index === 0
                    ? 'polygon(0% 0%, 90% 0%, 85% 50%, 90% 100%, 0% 100%)'
                    : index === stages.length - 1
                    ? 'polygon(15% 0%, 100% 0%, 100% 100%, 10% 100%)'
                    : 'polygon(15% 0%, 90% 0%, 85% 50%, 90% 100%, 10% 100%, 15% 50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  border: `2px solid ${colors[stage.stage]}`,
                  borderRadius: '4px'
                }}
              >
                {/* Stage content */}
                <Box
                  sx={{
                    textAlign: 'center',
                    color: 'white',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                    zIndex: 2
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {getDisplayName(stage.stage)}
                  </Typography>
                  <Typography variant="caption">
                    {stage.count} ops
                  </Typography>
                </Box>
              </Box>

              {/* Flow indicator between stages */}
              {index < stages.length - 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    right: '-20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '40px',
                    height: '2px',
                    backgroundColor: '#ddd',
                    zIndex: 1,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      right: '-6px',
                      top: '-3px',
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid #ddd',
                      borderTop: '4px solid transparent',
                      borderBottom: '4px solid transparent'
                    }
                  }}
                />
              )}

              {/* Conversion rate indicator */}
              {index > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: '-80px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    border: '1px solid #ddd',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: conversionFromPrev === '100.0' ? '#4caf50' : parseFloat(conversionFromPrev) > 50 ? '#ff9800' : '#f44336'
                  }}
                >
                  {conversionFromPrev}%
                </Box>
              )}
            </Box>
          </Tooltip>
        );
      })}

      {/* Funnel metrics summary */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          Overall Conversion Rate: {stages.length > 0 ?
            ((stages[stages.length - 1].count / stages[0].count) * 100).toFixed(1) : 0}%
        </Typography>
      </Box>
    </Box>
  );
};

export default FunnelChart;