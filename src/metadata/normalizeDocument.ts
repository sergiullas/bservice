import type { Service } from "../app/data/types";
import type { ServiceMetadataDocument } from "./documentTypes";

/**
 * Maps a schema-validated document into the stable ServiceLog `Service`
 * contract (src/app/data/types.ts). Assumes `doc` has already passed
 * validateDocument -- this performs no further checking.
 *
 * `spec.owner` (Backstage Catalog ownership) is intentionally never mapped
 * here: it is a different concept from `spec.profile.serviceOwner` (the
 * ServiceLog accountable person) and must not be conflated with it.
 */
export function normalizeDocument(doc: ServiceMetadataDocument): Service {
  const profile = doc.spec.profile;
  return {
    id: doc.metadata.name,
    serviceName: doc.metadata.title,
    cloudProvider: profile.cloudProvider,
    serviceCategory: profile.serviceCategory,
    serviceDescription: profile.serviceDescription,
    serviceExternalDoc: profile.serviceExternalDoc,
    serviceInternalDoc: profile.serviceInternalDoc,
    provisioningModel: profile.provisioningModel,
    cloudAto: profile.cloudAto,
    serviceOwner: profile.serviceOwner,
    serviceLimitations: profile.serviceLimitations,
    fedRampStatus: profile.fedRampStatus,
    trmStatus: profile.trmStatus,
    trmRestrictionOwner: profile.trmRestrictionOwner,
    trmLink: profile.trmLink,
    fundingApproach: profile.fundingApproach,
    approvalWorkflow: profile.approvalWorkflow,
    provisioningSLA: profile.provisioningSLA,
    serviceUseCases: profile.serviceUseCases,
    serviceOnboardingRequirements: profile.serviceOnboardingRequirements,
  };
}
