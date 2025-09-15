import { CommissionType } from '../types/partner.js';

export const COMMISSION_DEFAULTS: Record<CommissionType, {
  defaultPercentage: number;
  minPercentage: number;
  maxPercentage: number;
  description: string;
}> = {
  [CommissionType.REFERRAL]: {
    defaultPercentage: 15,
    minPercentage: 5,
    maxPercentage: 25,
    description: 'One-time referral commission'
  },
  [CommissionType.RESELLER]: {
    defaultPercentage: 30,
    minPercentage: 20,
    maxPercentage: 50,
    description: 'Reseller margin-based commission'
  },
  [CommissionType.MSP]: {
    defaultPercentage: 25,
    minPercentage: 15,
    maxPercentage: 40,
    description: 'Managed service provider ongoing commission'
  },
  [CommissionType.CUSTOM]: {
    defaultPercentage: 20,
    minPercentage: 5,
    maxPercentage: 50,
    description: 'Custom commission structure'
  }
};