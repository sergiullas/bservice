export type CloudAto = "MAGE" | "CACE" | "CMAA";

export type ProvisioningModel = "Tier 1" | "Tier 2" | "Tier 3" | "Tier 4";

export type FedRampStatus =
  | "Initial Implementation"
  | "FedRAMP Ready"
  | "Agency Authorization In Process"
  | "FedRAMP In Process"
  | "FedRAMP Certified";

export type TrmStatus = "Permitted" | "Restricted" | "Divest" | "Prohibited";

export type FundingApproach = "ECSD pay" | "Funding recouped";

export type ApprovalWorkflow =
  | "Auto-Approved"
  | "Manager Approval"
  | "Security Review"
  | "Architecture Review"
  | "Multi-Level Approval";

/**
 * ServiceLog prototype model. Normalized from CSP-owned YAML metadata
 * (see /metadata) via the shared schema in
 * metadata/schema/service-metadata.schema.json and metadata/lib/validate.ts.
 */
export interface Service {
  id: string;

  serviceName: string;
  cloudProvider: string;
  serviceCategory: string;
  serviceDescription: string;

  serviceExternalDoc: string;
  serviceInternalDoc: string;

  provisioningModel: ProvisioningModel;
  cloudAto: CloudAto[];

  serviceOwner: string;
  serviceLimitations?: string;

  fedRampStatus: FedRampStatus;

  trmStatus: TrmStatus;
  trmRestrictionOwner?: string;
  trmLink: string;

  fundingApproach: FundingApproach;
  approvalWorkflow: ApprovalWorkflow;
  provisioningSLA: string;

  serviceUseCases: string[];
  serviceOnboardingRequirements?: string[];
}
