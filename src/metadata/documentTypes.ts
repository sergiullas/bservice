import type {
  ApprovalWorkflow,
  CloudAto,
  FedRampStatus,
  FundingApproach,
  ProvisioningModel,
  TrmStatus,
} from "../app/data/types";

/**
 * Shape of a single CSP-authored YAML document once parsed, before schema
 * validation has confirmed the controlled-vocabulary fields actually hold
 * one of their allowed values. Kept loose (plain `string`/`string[]`) here
 * on purpose -- validateDocument is what proves the narrower types below.
 */
export interface ServiceMetadataDocument {
  apiVersion: "backstage.io/v1alpha1";
  kind: "Resource";
  metadata: {
    name: string;
    title: string;
  };
  spec: {
    type: "service-offering";
    owner?: string;
    lifecycle?: string;
    profile: ServiceLogProfile;
  };
}

export interface ServiceLogProfile {
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

/** A single actionable validation problem, always tied to a source file. */
export interface CatalogIssue {
  file: string;
  path: string;
  message: string;
  invalidValue?: unknown;
  expected?: unknown;
}

/** A YAML document plus the file path it came from, prior to parsing. */
export interface CatalogSource {
  filePath: string;
  raw: string;
}
