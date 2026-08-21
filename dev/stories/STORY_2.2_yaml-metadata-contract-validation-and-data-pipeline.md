# STORY 2.2 — YAML Metadata Contract, Validation, and Data Pipeline

**Status:** Ready for development  
**Date:** 2026-08-21  
**Repository:** `sergiullas/bservice`  
**Decision state:** PO-approved architecture direction  

---

## Story Intent

Story 2.1 established a host-neutral ServiceLog UI and preserved the standalone stakeholder-demo host.

Story 2.2 makes the **service metadata architecture host-neutral as well**.

Today, ServiceLog still assembles its catalog from hardcoded TypeScript data:

```text
sourceCatalog.ts
      +
awsEnrichment.ts
      +
legacyServiceDrafts in services.ts
      ↓
normalize.ts
      ↓
Service[]
      ↓
ServiceLog UI
```

The target is:

```text
CSP-owned YAML
      ↓
shared schema validation
      ↓
normalization
      ↓
Service[]
      ↓
ServiceLog UI Core
        /      \
Standalone    Backstage (future)
```

### North Star

> **CSP teams own their metadata. The platform owns the metadata contract.**

AWS, Azure, and Google Cloud may maintain their own service YAML, but they must all conform to one centrally governed contract and controlled vocabulary.

ServiceLog must never silently accept, reinterpret, or coerce an unknown controlled value.

Example:

```yaml
trmStatus: Dangerous
```

must fail validation. It must never be treated as a fifth TRM status and must never be silently mapped to `Prohibited` or any other value.

---

# PO-Locked Architecture Decisions

## 1. YAML becomes the authoritative prototype metadata source

After this story, the standalone ServiceLog catalog must be built from YAML metadata rather than hardcoded service records in TypeScript.

TypeScript remains responsible for:

- the normalized `Service` model,
- schema/parser integration,
- validation,
- normalization,
- host adapters,
- UI behavior.

TypeScript must **not** remain a second catalog source containing duplicate service metadata.

---

## 2. CSP ownership is separate from vocabulary ownership

Ownership model:

```text
AWS team
owns AWS service metadata values

Azure team
owns Azure service metadata values

Google Cloud team
owns Google Cloud service metadata values

ServiceLog / platform contract
owns field definitions, required/optional rules,
and controlled vocabularies
```

A CSP team may change a service from `Restricted` to `Permitted` if authorized to update that metadata.

A CSP team may **not** invent `Conditionally Approved`, `Dangerous`, `Green`, or any other new TRM value without first changing the shared contract.

---

## 3. Use a shared machine-readable schema

Use a standard **JSON Schema** as the canonical machine-readable contract for the YAML documents.

The exact validation library is implementation discretion.

The schema must be usable independently of React and independently of the frontend build so it can later support:

- CI validation,
- editor validation/autocomplete,
- Backstage/backend ingestion,
- standalone ingestion.

The repository must expose a direct validation command, conceptually:

```text
npm run validate:metadata
```

Exact script naming is implementation discretion if an existing convention is stronger.

---

## 4. Preserve a Backstage-compatible envelope without coupling the UI to Backstage

The current organization uses Backstage-style YAML metadata. Story 2.2 should preserve that direction without implementing Backstage Catalog integration yet.

Preferred document shape:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: aws-amazon-bedrock
  title: Amazon Bedrock
spec:
  type: service-offering
  owner: group:default/example-team   # optional in prototype data if unknown
  lifecycle: production               # Backstage metadata, not ServiceLog UI metadata
  profile:
    cloudProvider: AWS
    serviceCategory: AI & Machine Learning
    serviceDescription: ...
    serviceExternalDoc: ...
    serviceInternalDoc: ...
    provisioningModel: Tier 2
    cloudAto:
      - CACE
    serviceOwner: Natasha Romanoff
    fedRampStatus: FedRAMP Certified
    trmStatus: Restricted
    trmRestrictionOwner: CIM AI Platform Team
    trmLink: ...
    fundingApproach: ECSD pay
    approvalWorkflow: Security Review
    provisioningSLA: 5 business days
    serviceUseCases:
      - Foundation model inference
    serviceOnboardingRequirements:
      - Cost Center
```

### Ownership clarification

These are **different concepts** and must not be conflated:

```text
spec.owner
= Backstage Catalog ownership / group reference

spec.profile.serviceOwner
= ServiceLog accountable person

spec.profile.trmRestrictionOwner
= Jira / Outlook-style group when TRM = Restricted
```

`spec.owner` must never be normalized into `Service.serviceOwner`.

If real `spec.owner` values are not known for the prototype, do not invent them merely to populate the field.

---

## 5. Keep the normalized ServiceLog contract stable

The current `Service` model remains the UI-facing contract unless a genuine schema defect is discovered and raised for PO review.

Current controlled types include:

```text
CloudAto
ProvisioningModel
FedRampStatus
TrmStatus
FundingApproach
ApprovalWorkflow
```

The YAML schema must encode the same allowed values.

The normalized UI model remains:

```ts
Service
```

The UI must not consume raw YAML objects directly.

---

## 6. The ServiceLog UI must not know how metadata was loaded

Story 2.1 made the UI host-neutral. Story 2.2 must keep it that way.

The preferred boundary is simple data injection:

```text
Host / data adapter
      ↓
Service[]
      ↓
ServiceLogFeature
      ↓
ServiceOfferingsPage
```

`ServiceOfferingsPage`, `FilterBar`, `ServiceCard`, and `ServiceDetailDrawer` must not import YAML, use filesystem APIs, call Vite APIs, or depend on Backstage APIs.

A future Backstage host must be able to supply a `Service[]` payload without changing the product UI components.

Do not introduce a visible loading-state redesign in this story simply to anticipate future asynchronous Backstage fetching. The standalone YAML adapter may load synchronously/eagerly if that best preserves V1 behavior.

---

# Shared Controlled Vocabulary

The schema must centrally govern at least the following values.

## TRM Status

Exactly:

```text
Permitted
Restricted
Divest
Prohibited
```

## Cloud ATO

Exactly:

```text
MAGE
CACE
CMAA
```

`cloudAto` remains an array to preserve the future multi-select model.

## Provisioning Model

Exactly:

```text
Tier 1
Tier 2
Tier 3
Tier 4
```

## FedRAMP Status

Exactly the current `FedRampStatus` values from `types.ts`.

## Funding Approach

Exactly the current `FundingApproach` values from `types.ts`.

## Approval Workflow

Exactly the current `ApprovalWorkflow` values from `types.ts`.

## Cloud Provider

For the current prototype dataset:

```text
AWS
Azure
Google Cloud
```

Adding another CSP later should require an intentional schema change rather than silently accepting a typo or unofficial provider name.

## Service Category

The current V1 category list must be captured as a shared controlled vocabulary rather than inferred separately by each CSP team.

Do not allow category spelling variants to silently create new categories.

Example:

```text
AI & Machine Learning
```

and

```text
AI and Machine Learning
```

must not become two different categories because one team chose different wording.

---

# Schema Rules

At minimum, validation must enforce:

- valid Backstage-style document envelope,
- `kind: Resource`,
- `spec.type: service-offering`,
- stable machine-readable `metadata.name`,
- human-readable `metadata.title`,
- required ServiceLog profile fields,
- controlled values listed above,
- `cloudAto` as an array of valid Cloud ATO values,
- URLs/URI-shaped metadata where appropriate,
- arrays where the Service model expects arrays,
- `trmRestrictionOwner` required when `trmStatus === Restricted`,
- no unknown profile fields caused by typos or stale legacy metadata unless explicitly permitted by the contract,
- unique service IDs across the complete loaded dataset.

Validation failures must be actionable.

A useful error should identify:

```text
file/document
field/path
invalid value
expected value(s)
```

Do not emit only `metadata validation failed` with no location/context.

---

# Legacy YAML / `notes.md` Guidance

The current root `notes.md` is a useful historical example but is **not** the new contract.

It contains legacy concepts such as:

- `approvalWorkflow: requestable`,
- `atoStatus`,
- `statusBadge`,
- `trmStatus: Approved`,
- team-valued `serviceOwner`,
- `serviceContact`,
- `environments`,
- `oemModel`,
- HTML embedded inside a URL field.

Do not reproduce those stale fields in the new schema merely for compatibility with the example.

If `notes.md` remains in the repo after this story, mark it clearly as legacy/reference material so another developer cannot mistake it for the active contract.

---

# Scope

## Checkpoint A — Define contract and validator

Create the central schema and metadata validation pipeline first.

Expected conceptual structure:

```text
metadata/
├── schema/
│   └── service-metadata.schema.json
├── aws/
├── azure/
└── google-cloud/
```

Exact location is implementation discretion, but metadata/schema ownership must be obvious and independent from React components.

### Required validation tests

At minimum prove:

1. valid service YAML passes,
2. `trmStatus: Dangerous` fails,
3. invalid Cloud ATO fails,
4. invalid provisioning model fails,
5. invalid FedRAMP status fails,
6. invalid approval workflow fails,
7. invalid funding approach fails,
8. invalid provider fails,
9. invalid category fails,
10. missing required fields fail,
11. Restricted without `trmRestrictionOwner` fails,
12. duplicate service IDs across documents fail,
13. stale/unknown profile fields are rejected or explicitly surfaced rather than silently ignored.

### Checkpoint A acceptance criteria

- JSON Schema exists and is readable/documented.
- Metadata validation can run without rendering/building React.
- Error output is actionable.
- Controlled vocabularies are centralized rather than redefined independently in CSP files.
- No UI behavior change yet.

---

## Checkpoint B — Migrate the complete current V1 catalog to YAML

Move the current ServiceLog V1 dataset into the validated YAML source.

Current baseline is **76 services**, including **51 AWS services** plus the existing Azure and Google Cloud prototype records.

The migration must preserve V1 data and behavior.

### Migration rules

- Do not invent new production metadata.
- Preserve current placeholder/prototype values where necessary for parity.
- Do not attempt to replace Avengers-style placeholder Service Owners with guessed real people in this story.
- Preserve current TRM, FedRAMP, provisioning, funding, workflow, SLA, use-case, limitation, documentation, and onboarding values unless the existing data is demonstrably malformed.
- Store onboarding requirements as clean YAML arrays, not legacy HTML/presentation strings.
- Do not carry old hover-tooltip markup into the new metadata source.
- Do not embed HTML anchor elements in URL fields.
- Keep Service Owner as a person.
- Keep TRM Restriction Owner as a group and only required for Restricted services.
- Keep prototype URLs as metadata even though the V1 UI intentionally keeps those links inert.

### File ownership

Organize service YAML under obvious CSP ownership boundaries.

One-service-per-file is preferred because it aligns well with Backstage-style Resource documents and reduces merge contention, but exact file granularity may vary if there is a stronger existing repository convention.

The important requirement is that AWS, Azure, and Google Cloud metadata are structurally separable and independently maintainable while sharing the same schema.

### Remove duplicate TypeScript catalog sources

Once YAML parity is proven, retire the TypeScript catalog duplication.

Expected outcome:

- `sourceCatalog.ts` is no longer the service source of truth,
- `awsEnrichment.ts` is no longer a parallel metadata source,
- the large `legacyServiceDrafts` array in `services.ts` no longer acts as a second catalog,
- service metadata is not duplicated in another newly invented TypeScript file.

If a small TypeScript assembly/adapter module remains, it should contain logic, not a duplicate copy of the catalog values.

### Checkpoint B acceptance criteria

- All 76 current V1 services are represented through validated YAML.
- Service IDs are unique.
- Provider/service/category counts match the pre-migration V1 baseline.
- No current V1 service disappears.
- No unauthorized new service appears.
- Amazon End User Messaging retains the long onboarding content needed for regression testing.
- Current Restricted, Divest, and Prohibited examples remain available for behavior verification.

---

## Checkpoint C — Establish the host-neutral data seam

Remove direct catalog imports from the product UI.

Today `ServiceOfferingsPage` and `FilterBar` import catalog-derived values from `data/services.ts`.

After this checkpoint, the UI should receive the normalized dataset from its host/data adapter.

Conceptually:

```tsx
<ServiceLogFeature services={services} />
```

or an equivalently simple host-neutral API.

Exact prop/interface naming is implementation discretion.

### Requirements

- `ServiceLogFeature` accepts/provides the normalized service dataset through an explicit host-neutral boundary.
- `ServiceOfferingsPage` filters the supplied `Service[]` rather than importing a global catalog singleton.
- Provider and category options are derived from the supplied normalized dataset or supplied by the same adapter, not imported from a second metadata source.
- `FilterBar` does not import provider/category options from `services.ts`.
- standalone mode has a YAML-backed adapter that validates/parses/normalizes metadata and passes `Service[]` into the feature.
- any Vite-specific loading mechanism is confined to the standalone adapter/bootstrap layer.
- no Backstage API dependency is added in Story 2.2.
- no duplicate UI implementation is created.
- no visible UX redesign is introduced.

### Future Backstage compatibility

Story 2.3 should be able to do this conceptually:

```text
Backstage metadata/backend/catalog adapter
              ↓
          Service[]
              ↓
      ServiceLogFeature
```

without rewriting `ServiceOfferingsPage`, `FilterBar`, `ServiceCard`, or `ServiceDetailDrawer`.

---

# Regression Verification

Before PO acceptance, document the results of all of the following in the PR.

1. `npm run validate:metadata` or equivalent passes for the complete catalog.
2. Intentional invalid fixtures fail with actionable messages.
3. `npm test` passes.
4. `npm run build` passes.
5. Standalone Vercel/local preview loads all 76 services.
6. Provider counts match V1 baseline.
7. Search behavior is unchanged.
8. Provider filters are unchanged.
9. Category multi-select is unchanged.
10. TRM filters are unchanged.
11. Grouped/flat category behavior is unchanged.
12. Card / `View details` behavior is unchanged.
13. TRM card link remains independent.
14. Restricted detail still shows TRM Restriction Owner.
15. Divest and Prohibited request behavior remains unchanged.
16. Service Detail Panel focus entry/trap/return behavior remains unchanged.
17. Amazon End User Messaging long-onboarding content remains complete and usable.
18. Story 1.2 accessibility behavior remains intact.
19. Standalone Sidebar/demo shell from Story 2.1 remains unchanged.
20. No React component directly parses YAML or depends on Vite/Backstage metadata APIs.

---

# Explicitly Out of Scope

Do not do the following in Story 2.2:

- Do not scaffold the Backstage plugin yet.
- Do not integrate Backstage Catalog yet.
- Do not add a Backstage backend plugin yet.
- Do not choose/force the host Backstage frontend-system generation yet.
- Do not resolve the MUI v4 compatibility risk from Story 2.1.
- Do not resolve the Tailwind/global-preflight Backstage isolation risk from Story 2.1.
- Do not redesign ServiceLog.
- Do not change ServiceLog IA.
- Do not change filter semantics.
- Do not change card interaction behavior.
- Do not change side-panel interaction behavior.
- Do not activate prototype links or ServiceNow actions.
- Do not invent real Service Owners, Backstage owners, email addresses, URLs, or production metadata.
- Do not convert the standalone demo into a Backstage-looking shell.
- Do not remove standalone mode.
- Do not remove the standalone Sidebar.
- Do not create a second JSON/TypeScript catalog merely as an intermediate long-term source of truth.

---

# Definition of Done

Story 2.2 is complete when:

- one shared JSON Schema governs CSP service metadata,
- controlled vocabularies are enforced centrally,
- invalid metadata fails loudly and actionably,
- all current V1 service metadata is represented in validated YAML,
- the old TypeScript catalog duplication has been retired,
- raw legacy onboarding HTML is no longer part of the active metadata source,
- YAML normalizes into the existing `Service[]` contract,
- ServiceLog UI receives `Service[]` through a host-neutral boundary,
- standalone mode loads the YAML-backed catalog successfully,
- ServiceLog V1 visual/interaction/accessibility behavior is preserved,
- standalone stakeholder demo behavior remains preserved,
- build/tests/metadata validation succeed,
- the PR documents parity verification and any risks that must carry into Story 2.3.

---

# Future Architecture Context — Story 2.3

Story 2.2 should leave the repository in this shape conceptually:

```text
AWS YAML       Azure YAML       Google Cloud YAML
    \              |                /
     \             |               /
       shared JSON Schema
               ↓
         validate/normalize
               ↓
           Service[]
               ↓
       ServiceLog UI Core
          /          \
Standalone Host     Backstage Host (Story 2.3)
```

Story 2.3 then focuses on the **host integration problem**, including:

- actual target Backstage version/frontend system,
- plugin/package scaffolding,
- Backstage data adapter/backend/catalog strategy,
- MUI v4 compatibility,
- Tailwind/global-style isolation,
- route/navigation integration,
- preserving standalone mode alongside the production plugin.

Story 2.2 must not prematurely solve those host-specific concerns.

---

## Output Style

- No preamble before tool calls. Do not narrate what you're about to do.
- Don't restate the task before starting.
- Skip "I'll start by..." / "Let me..." framing entirely.
- Lead with results, not process narration.
- After finishing, summarize only what changed — don't re-explain the plan.
- These instructions affect communication style only. They MUST NOT reduce the quality, rigor, completeness, testing, validation, reasoning, or implementation depth of the work.
- High-quality output remains mandatory. Be concise in narration, not in execution.
