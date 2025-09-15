export interface Partner {
    id: string;
    name: string;
    domain: PartnerDomain;
    website?: string;
    primaryContactName: string;
    primaryContactEmail: string;
    primaryContactPhone?: string;
    relationshipHealthScore: number;
    commissionStructures: CommissionStructure[];
    createdAt: Date;
    updatedAt: Date;
}
export interface CommissionStructure {
    id: string;
    partnerId: string;
    type: CommissionType;
    percentage: number;
    minimumDealSize?: number;
    maximumDealSize?: number;
    isDefault: boolean;
    effectiveDate: Date;
    expiryDate?: Date;
}
export declare enum PartnerDomain {
    FINOPS = "finops",
    SECURITY = "security",
    OBSERVABILITY = "observability",
    DEVOPS = "devops",
    DATA = "data"
}
export declare enum CommissionType {
    REFERRAL = "referral",
    RESELLER = "reseller",
    MSP = "msp",
    CUSTOM = "custom"
}
export declare enum RelationshipHealthStatus {
    EXCELLENT = "excellent",
    HEALTHY = "healthy",
    NEEDS_ATTENTION = "needs_attention",
    AT_RISK = "at_risk"
}
//# sourceMappingURL=partner.d.ts.map