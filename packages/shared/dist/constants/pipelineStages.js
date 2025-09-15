import { PipelineStage } from '../types/opportunity.js';
export const PIPELINE_STAGES = {
    [PipelineStage.LEAD]: {
        stage: PipelineStage.LEAD,
        order: 1,
        probability: 10,
        color: '#f0f0f0',
        name: 'Lead'
    },
    [PipelineStage.DEMO]: {
        stage: PipelineStage.DEMO,
        order: 2,
        probability: 25,
        color: '#e3f2fd',
        name: 'Demo'
    },
    [PipelineStage.POC]: {
        stage: PipelineStage.POC,
        order: 3,
        probability: 50,
        color: '#fff3e0',
        name: 'POC'
    },
    [PipelineStage.PROPOSAL]: {
        stage: PipelineStage.PROPOSAL,
        order: 4,
        probability: 75,
        color: '#f3e5f5',
        name: 'Proposal'
    },
    [PipelineStage.CLOSED_WON]: {
        stage: PipelineStage.CLOSED_WON,
        order: 5,
        probability: 100,
        color: '#e8f5e8',
        name: 'Closed Won'
    },
    [PipelineStage.CLOSED_LOST]: {
        stage: PipelineStage.CLOSED_LOST,
        order: 6,
        probability: 0,
        color: '#ffebee',
        name: 'Closed Lost'
    }
};
export const ACTIVE_STAGES = [
    PipelineStage.LEAD,
    PipelineStage.DEMO,
    PipelineStage.POC,
    PipelineStage.PROPOSAL
];
export const CLOSED_STAGES = [
    PipelineStage.CLOSED_WON,
    PipelineStage.CLOSED_LOST
];
//# sourceMappingURL=pipelineStages.js.map