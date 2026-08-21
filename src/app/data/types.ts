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
 * Stable ServiceLog UI contract (STORY 2.2 PO decision #5). Populated by
 * normalizing CSP-owned YAML metadata (see metadata/ + src/metadata/) --
 * this interface, not the YAML shape, is what ServiceOfferingsPage,
 * FilterBar, ServiceCard, and ServiceDetailDrawer are written against.
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
