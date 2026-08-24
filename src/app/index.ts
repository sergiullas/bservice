/**
 * Public surface of @servicelog/core -- the host-neutral ServiceLog product
 * UI (STORY 2.1). Both the standalone demo shell (via a relative import,
 * unaffected by this package boundary) and the Backstage plugin (via this
 * package) render the exact same `ServiceLogFeature`; neither forks it.
 */
export { ServiceLogFeature } from './ServiceLogFeature';
export type {
  ApprovalWorkflow,
  CloudAto,
  FedRampStatus,
  FundingApproach,
  ProvisioningModel,
  Service,
  TrmStatus,
} from './data/types';
export { SERVICELOG_SCOPE_CLASS_NAME } from './styles/scopeClassName';
