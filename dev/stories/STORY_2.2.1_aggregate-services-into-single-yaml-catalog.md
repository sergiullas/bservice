# STORY 2.2.1 — Aggregate Services into a Single YAML Catalog

**Status:** Ready for development  
**Date:** 2026-08-24  
**Repository:** `sergiullas/bservice`  
**Decision state:** PO-approved correction based on carbon-team integration guidance  

---

## Story Intent

Story 2.2 successfully moved ServiceLog from hardcoded TypeScript service metadata to validated YAML, but it made one packaging assumption that does not match the target team's prototype workflow.

Current implementation:

```text
metadata/aws/
  amazon-bedrock.yaml
  amazon-ec2.yaml
  ...
metadata/azure/
  ...
metadata/google-cloud/
  ...
```

The carbon team clarified that, for the prototype, ServiceLog should expose **one YAML catalog containing all services** rather than one YAML file per service.

Target:

```text
metadata/services.yaml
      ↓
shared schema validation
      ↓
normalization
      ↓
Service[]
      ↓
ServiceLog UI
```

### North Star

> **One validated YAML catalog. One normalized Service[] contract. No UX change.**

This is a packaging correction, not a metadata-model redesign.

---

# PO-Locked Decisions

## 1. All 76 V1 services live in one YAML file

After this story, the prototype source of record is one YAML catalog file containing the complete V1 ServiceLog catalog:

- 51 AWS services
- 13 Azure services
- 12 Google Cloud services
- 76 total services

Recommended path:

```text
metadata/services.yaml
```

A different filename is acceptable only if an existing repository convention clearly makes it better.

The old per-service YAML files must not remain as a second authoritative source after the migration is complete.

---

## 2. Preserve the existing ServiceLog metadata contract

The current Service model and controlled vocabularies remain authoritative.

This story does **not** change the meaning of:

- `cloudProvider`
- `serviceCategory`
- `serviceDescription`
- `serviceExternalDoc`
- `serviceInternalDoc`
- `provisioningModel`
- `cloudAto`
- `serviceOwner`
- `serviceLimitations`
- `fedRampStatus`
- `trmStatus`
- `trmRestrictionOwner`
- `trmLink`
- `fundingApproach`
- `approvalWorkflow`
- `provisioningSLA`
- `serviceUseCases`
- `serviceOnboardingRequirements`

Controlled values remain exactly those already approved in Story 2.2.

Example:

```yaml
trmStatus: Dangerous
```

must still fail validation.

---

## 3. The YAML envelope may change; the service-entry contract must not

The current JSON Schema describes one service per YAML document. This story must adapt the schema so that one document can contain the complete catalog.

A conceptual shape is:

```yaml
services:
  - apiVersion: backstage.io/v1alpha1
    kind: Resource
    metadata:
      name: amazon-bedrock
      title: Amazon Bedrock
    spec:
      type: service-offering
      profile:
        cloudProvider: AWS
        ...

  - apiVersion: backstage.io/v1alpha1
    kind: Resource
    metadata:
      name: azure-openai
      title: Azure OpenAI Service
    spec:
      type: service-offering
      profile:
        cloudProvider: Azure
        ...
```

This exact outer key/name is implementation discretion. What is locked is:

1. one YAML file contains all services;
2. each service entry preserves the existing service-level metadata shape and semantics unless a mechanical schema change is required by aggregation;
3. normalization still produces the exact same `Service[]` consumed by the UI.

Do not redesign the service metadata simply because the outer document becomes an array/catalog.

---

## 4. Keep central validation

The platform still owns the contract.

Validation must continue to enforce:

- required fields;
- controlled vocabularies;
- unknown-field rejection where currently required;
- `Restricted` requiring `trmRestrictionOwner`;
- globally unique service identifiers;
- valid service documents before normalization.

The existing validation entry point should remain available:

```text
npm run validate:metadata
```

The command must validate the single catalog file and report actionable errors that identify the affected service entry and field.

Example error quality:

```text
services[12].spec.profile.trmStatus: must be one of Permitted, Restricted, Divest, Prohibited
```

A filename plus service identifier is even better if easy to provide.

---

## 5. Preserve the host-neutral data seam

The UI still receives:

```ts
Service[]
```

The target architecture remains:

```text
metadata/services.yaml
      ↓
validation + normalization
      ↓
Service[]
      ↓
ServiceLogFeature
      ↓
ServiceOfferingsPage
```

The following components must remain unaware of YAML structure:

- `ServiceLogFeature`
- `ServiceOfferingsPage`
- `FilterBar`
- `ServiceCard`
- `ServiceDetailDrawer`

No UI component should parse YAML or depend on the catalog envelope.

---

## 6. Preserve V1 UX and behavior exactly

This story is data packaging only.

Do not redesign or intentionally alter:

- cards;
- search;
- provider filters;
- category filters;
- TRM filters;
- grouped / flat category behavior;
- detail-panel IA;
- TRM link behavior;
- Restricted behavior;
- Divest / Prohibited requestability;
- focus behavior;
- accessibility semantics;
- standalone Sidebar;
- visual styling.

### Regression rule

> If the UI changes while aggregating YAML, treat it as a regression first.

---

## 7. Backstage plugin work is out of scope

The carbon team has confirmed that they already own the Backstage plugin/integration work.

Therefore this story must **not**:

- build or modify a Backstage frontend plugin;
- build or modify a Backstage backend plugin;
- add Backstage routing or navigation;
- solve target-host CSS isolation;
- add Backstage authentication plumbing;
- change the target team’s plugin architecture.

The ServiceLog prototype responsibility is now simpler:

> **Provide the approved ServiceLog UI plus one validated YAML catalog that the carbon team can consume.**

The experimental Story 2.3 branch may remain available as technical reference, but it is not required for this story and should not be merged as part of this work.

---

# Implementation Scope

## A. Aggregate the existing YAML data

1. Create the single catalog YAML file.
2. Migrate all 76 existing service records into it without changing approved metadata values.
3. Preserve service IDs exactly.
4. Preserve service ordering unless there is a strong implementation reason to change it.
5. Remove the old per-service YAML files once parity is verified so there is only one source of truth.

### Acceptance

- One authoritative YAML file exists.
- It contains exactly 76 services.
- Service IDs are unique.
- No old per-service YAML remains authoritative.

---

## B. Adapt schema and validation

Update the machine-readable schema and validator so they operate on the aggregate catalog.

Prefer reuse of the current per-service schema through `$defs` / nested references rather than duplicating field definitions.

Conceptually:

```text
catalog schema
  └── services[]
        └── service-entry schema
              └── existing metadata/profile contract
```

### Acceptance

- `npm run validate:metadata` validates the aggregate file.
- Invalid controlled vocabulary values fail.
- Missing required fields fail.
- Restricted-without-owner fails.
- Duplicate service IDs fail.
- Unknown disallowed fields fail.
- Errors identify the affected service entry clearly.

---

## C. Adapt loading and normalization

Update the standalone metadata loader so it reads the single YAML file, validates the catalog, and normalizes every entry into the existing `Service[]` contract.

Do not introduce a second normalization implementation.

### Acceptance

```text
single YAML file
      ↓
one validation path
      ↓
one normalization path
      ↓
Service[76]
```

- ServiceLog receives exactly 76 services.
- Provider totals remain 51 AWS / 13 Azure / 12 Google Cloud.
- Existing `PROVIDERS`, `CATEGORIES`, and filter behavior continue to derive from normalized services rather than raw YAML.

---

## D. Update documentation

Update metadata documentation and any root documentation that currently claims:

```text
one YAML document per service
```

so it accurately states that the prototype uses one aggregate YAML catalog.

Keep the governance statement:

> **CSP teams own their metadata. The platform owns the metadata contract.**

For the prototype, the physical handoff is one aggregate YAML file even though metadata ownership remains conceptually distributed by CSP.

Do not claim that the file layout is a permanent enterprise governance model. It is the prototype integration format requested by the carbon team.

---

# Required Regression Verification

Document results before PO acceptance.

## Metadata

1. Aggregate YAML contains exactly 76 services.
2. AWS count = 51.
3. Azure count = 13.
4. Google Cloud count = 12.
5. No duplicate IDs.
6. `npm run validate:metadata` passes.
7. Existing negative validation tests pass against the aggregate structure.
8. A deliberately invalid controlled value still fails validation.

## Standalone product

9. Standalone app starts successfully.
10. Production build passes.
11. Existing tests pass.
12. UI displays 76 services.
13. Search works.
14. Provider filters work.
15. Category multi-select works.
16. TRM filters work.
17. Single-category flat view works.
18. Multi-category grouped view works.
19. Card / `View details` opens the panel.
20. Independent TRM link behavior is unchanged.
21. Restricted service details remain correct.
22. Divest and Prohibited remain non-requestable.
23. Focus entry / trap / close / return remains correct.
24. Amazon End User Messaging long-content case remains readable and scrollable.
25. Story 1.2 accessibility semantics remain intact.
26. Standalone Sidebar and stakeholder-approved V1 visual presentation remain unchanged.

---

# Out of Scope

- Backstage plugin implementation.
- Backstage backend implementation.
- Catalog ingestion.
- `spec.owner` resolution.
- new metadata fields.
- metadata-value cleanup unrelated to aggregation.
- UX redesign.
- new services beyond the existing V1 76-service catalog.
- enterprise multi-repository CSP governance.

---

# Definition of Done

Story 2.2.1 is complete when:

1. All 76 services are stored in one authoritative YAML catalog.
2. The old per-service YAML layout is retired as an active source.
3. The shared schema validates the aggregate catalog without duplicating the service-entry contract.
4. The validator fails loudly and actionably for invalid entries.
5. Normalization returns the same approved `Service[]` contract.
6. Service counts and metadata values match the pre-aggregation V1 catalog.
7. Standalone ServiceLog behavior and visuals remain unchanged.
8. Metadata documentation reflects the new one-file prototype handoff.
9. No Backstage plugin work is introduced.
10. The PR documents metadata parity and the full regression verification above.

---

## Product / architecture summary

Before:

```text
76 YAML files
      ↓
validation
      ↓
Service[]
```

After:

```text
1 YAML catalog
   └── 76 service entries
          ↓
      validation
          ↓
      Service[]
```

Nothing above the `Service[]` boundary should know or care that the packaging changed.
