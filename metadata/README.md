# ServiceLog metadata contract

CSP teams own their service metadata. The platform (ServiceLog) owns the
metadata contract: field definitions, required/optional rules, and
controlled vocabularies.

## Layout

```
metadata/
├── schema/
│   └── service-metadata.schema.json   # canonical machine-readable contract
├── lib/
│   └── validate.ts                    # shared validate + normalize logic
│                                       # (framework-agnostic: used by the
│                                       # CLI, tests, and the standalone
│                                       # runtime adapter alike)
├── aws/                                # one YAML document per AWS service
├── azure/                              # one YAML document per Azure service
└── google-cloud/                       # one YAML document per Google Cloud service
```

Each service is a single YAML file in a Backstage-compatible `Resource`
envelope, e.g. `metadata/aws/amazon-bedrock.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: amazon-bedrock       # stable id -- must be unique across the whole catalog
  title: Amazon Bedrock      # display name
spec:
  type: service-offering
  # owner: group:default/example-team   # optional Backstage Catalog ownership --
  #                                        NOT the same as profile.serviceOwner.
  #                                        Omit rather than invent a value.
  profile:                   # <- this is what normalizes into the ServiceLog UI model
    cloudProvider: AWS
    serviceCategory: AI & Machine Learning
    serviceDescription: ...
    serviceExternalDoc: https://docs.aws.amazon.com/bedrock/
    serviceInternalDoc: ./platforms/development/amazon/bedrock
    provisioningModel: Tier 3
    cloudAto: [CACE]
    serviceOwner: Natasha Romanoff        # a person, not a team
    fedRampStatus: FedRAMP Ready
    trmStatus: Restricted
    trmRestrictionOwner: CIM AI Platform Team   # required when trmStatus: Restricted
    trmLink: https://cloud-docs.cbp.dhs.gov/governance/trm.html#amazon-bedrock
    fundingApproach: Funding recouped
    approvalWorkflow: Multi-Level Approval
    provisioningSLA: 10 business days
    serviceUseCases: [...]
    serviceOnboardingRequirements: [...]  # clean strings, never HTML/tooltip markup
```

`spec.owner` (Backstage Catalog ownership) and `spec.profile.serviceOwner`
(the ServiceLog-facing accountable person) are different concepts and are
never merged. `spec.profile.trmRestrictionOwner` is a third, distinct
concept: a group, required only when `trmStatus` is `Restricted`.

## Validating

```
npm run validate:metadata
```

Runs entirely in Node against the YAML on disk -- no React, no Vite build,
no browser. Every failure names the file, the field path, the invalid
value, and (where applicable) the values the contract allows. CI, an
editor, or a future Backstage backend can all run the same check via
`metadata/lib/validate.ts`.

## Controlled vocabularies

Enforced centrally by `metadata/schema/service-metadata.schema.json`, not
redefined per CSP:

| Field              | Allowed values |
|---------------------|----------------|
| `cloudProvider`      | `AWS`, `Azure`, `Google Cloud` |
| `serviceCategory`    | `AI & Machine Learning`, `Analytics`, `Compute`, `Container Platform`, `Customer Engagement`, `Database`, `Identity & Access Management`, `Infrastructure & Platforms`, `Messaging`, `Migration & Transfer`, `Monitoring & Management`, `Networking`, `Secret Management`, `Security`, `Security Scanning`, `Storage`, `Streaming` |
| `provisioningModel`  | `Tier 1`, `Tier 2`, `Tier 3`, `Tier 4` |
| `cloudAto`           | array of `MAGE`, `CACE`, `CMAA` |
| `fedRampStatus`      | `Initial Implementation`, `FedRAMP Ready`, `Agency Authorization In Process`, `FedRAMP In Process`, `FedRAMP Certified` |
| `trmStatus`          | `Permitted`, `Restricted`, `Divest`, `Prohibited` |
| `fundingApproach`    | `ECSD pay`, `Funding recouped` |
| `approvalWorkflow`   | `Auto-Approved`, `Manager Approval`, `Security Review`, `Architecture Review`, `Multi-Level Approval` |

A CSP team may change a service's value for one of these fields (e.g. move
a service from `Restricted` to `Permitted`) if authorized to do so. A CSP
team may not invent a new value (e.g. `Conditionally Approved`, `Green`) --
that requires a change to this schema, reviewed as a platform-contract
change, not a per-service YAML edit.

Unknown/stale fields on `spec.profile` (typos, legacy fields such as
`atoStatus` or `statusBadge` from `notes.md`) are rejected, not silently
ignored -- see `notes.md` for why that file is not itself a valid source.

## Root-level test coverage

`metadata/lib/validate.test.ts` proves the required validation behavior
(valid document passes; each controlled vocabulary rejects an invalid
value; missing required fields fail; `Restricted` without
`trmRestrictionOwner` fails; duplicate `metadata.name` across documents
fails; unknown profile fields are rejected; `spec.owner` never leaks into
`Service.serviceOwner`).
