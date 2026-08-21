# STORY 1.1 — Service Metadata Alignment & Source Mapping

**Status:** In implementation — PR #10  
**Date:** 2026-08-20  
**Decision state:** Final PO requirements locked for Story 1.1  
**Source:** Stable metadata review, approved AWS import scope, and PO follow-up decisions captured during PR #10 review

## Purpose

Align the ServiceLog prototype data model with the implementation team's current metadata while preserving the richer ServiceLog prototype experience.

This is **not** an attempt to make the prototype identical to the current production/source solution.

The intended architecture is:

```text
Developer/source metadata
        ↓
AWS selection + normalization
        ↓
ServiceLog prototype model
        +
Prototype enrichment
        ↓
ServiceLog UI
```

The source provides trustworthy catalog content where available. ServiceLog continues to enrich that content with the additional metadata and interaction model required to demonstrate the target experience.

## Product Principle

**Source data informs ServiceLog. It does not constrain the ServiceLog concept to today's source capabilities.**

Source-backed values should be used where available. Prototype-only enrichment must remain clearly understood as prototype data and must not be represented as if it already comes from the developers' production metadata.

---

# PO Decision Record

These decisions are locked for Story 1.1. Any new product change after this revision should become a subsequent story rather than expanding PR #10 again.

1. **Cloud ATO remains a multi-value model.** `cloudAto` remains an array to support future multi-select behavior.
2. **The official Cloud ATO values are `CACE`, `MAGE`, and `CMAA`.** `CASE` is not a valid value.
3. **For this prototype, show exactly the provider-default Cloud ATO only:**
   - AWS → `CACE`
   - Google Cloud → `MAGE`
   - Azure → `CMAA`
4. **Do not surface additional source UAR flags as additional Cloud ATO values in this prototype.** The source `uar` structure may remain in source metadata, but it is not the current display source of truth for `cloudAto`.
5. **`serviceExternalDoc` and `serviceInternalDoc` are required for every ServiceLog service.** Missing source values are completed through prototype enrichment.
6. **All prototype links are intentionally non-operational.** Link affordances use `href="#"` or equivalent with navigation prevented. This includes TRM, Service Owner, Internal Documentation, External Documentation, and any other outbound link shown in this story.
7. **Future real Service Owner links will use `mailto:`.** Do not invent email addresses in the prototype.
8. **Service Owner is a person, determined by Cloud ATO:**
   - `CACE` → Natasha Romanoff
   - `MAGE` → Carol Danvers
   - `CMAA` → Wanda Maximoff
9. **TRM Restriction Owner is a group, not a person.** For Restricted services, reuse the existing team/group value that previously served as the prototype Service Owner, for example `CIM AI Platform Team`, `CIM Data Platform`, or `CIM Security Operations`.
10. **`TRM Restriction Owner` is shown only when `trmStatus === "Restricted"`.**
11. **`approvalWorkflow` remains in the model and UI.** It belongs with request/provisioning information, not documentation.
12. **`overview` is removed.** `serviceDescription` is the single description source. The UI controls card clamping and View more/View less behavior.
13. **ATO Status is removed.** It is not part of the latest requirements and must not appear in the active UI.
14. **OEM Model is removed.** It is not part of the latest requirements and must not appear in the active UI.
15. **`serviceContact` is removed.** Service Owner replaces the old contact concept.
16. **`trmLink` remains in the target model**, but the prototype TRM affordance must not navigate.
17. **The prototype remains richer than the current source solution.** Missing source fields may remain explicit prototype enrichment.
18. **The source import for this story is AWS-only.** Do not import non-AWS source records.
19. **The approved AWS subset is explicit.** Import only the 51 services listed in this story.
20. **Source-backed catalog values replace invented equivalents where available.** This applies to service name, category, description, documentation references, and onboarding requirements.
21. **Source presentation markup must not leak into ServiceLog.** Normalize legacy markup into clean display content.
22. **Onboarding Requirements must render full width on their own row** rather than inside one column of the compact metadata grid.
23. **TRM `Prohibited` disables the Request via ServiceNow CTA.** Keep the CTA visible and show the generic explanation: `This service cannot be requested because its TRM status is Prohibited.`
24. **All other current TRM statuses retain the visible enabled prototype CTA.** This story does not redefine request policy for Permitted, Restricted, or Divest.
25. **The drawer information architecture is updated to four logical sections:** Overview; Governance & Compliance; Request & Provisioning; Documentation.
26. **`Logistics & Accountability` is retired.** Its content is redistributed according to meaning.
27. **`Help & Guides` is retired.** Documentation becomes its own explicit section.
28. **Do not redesign visual language.** Preserve the approved card/drawer geometry, typography, colors, spacing, and interaction patterns except for the explicitly approved grouping/layout changes in this story.
29. **Existing non-AWS prototype records are not deleted.** They migrate to the new model and receive the provider-default Cloud ATO and Service Owner rules.
30. **This is the final scope revision for Story 1.1.** Further discoveries become a new story.

---

# Target ServiceLog Prototype Model

Use the following target shape conceptually:

```ts
export type CloudAto = "MAGE" | "CACE" | "CMAA";

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
```

`cloudProvider` remains extensible. The current source-backed import is AWS-only, but the prototype still contains Azure and Google Cloud records.

`cloudAto` remains an array even though every current prototype service displays one provider-default value.

---

# Field Migration

| Current ServiceLog field | Required action |
|---|---|
| `id` | Keep |
| `title` | Rename → `serviceName` |
| `provider` | Rename → `cloudProvider` |
| `category` | Rename → `serviceCategory` |
| `status` | Delete |
| `description` | Rename → `serviceDescription` |
| `overview` | Delete |
| `externalDocLabel` | Replace → `serviceExternalDoc` |
| `tier` | Rename → `provisioningModel` |
| `environments` | Replace → `cloudAto` |
| `owner` | Do not mechanically rename; existing team/group values become `trmRestrictionOwner` for Restricted services |
| N/A | `serviceOwner` becomes provider/ATO-based person |
| `limitations` | Rename → `serviceLimitations` |
| `atoStatus` | Delete |
| `fedRampStatus` | Keep |
| `trmStatus` | Keep |
| `trmRestrictionOwner` | Keep; group/team semantics |
| N/A | Add `trmLink` |
| `fundingApproach` | Keep |
| `approvalWorkflow` | Keep |
| `oemModel` | Delete |
| `provisioningSLA` | Keep |
| `serviceContact` | Delete |
| `commonUseCases` | Rename → `serviceUseCases` |
| N/A | Add required `serviceInternalDoc` |
| N/A | Add `serviceOnboardingRequirements` where available |

---

# Approved AWS Source Catalog

For this story, the source-backed import is limited to `provider: AWS` and the following **51 approved services across 15 categories**.

## Analytics
- AWS Glue
- Amazon Athena

## Compute
- Amazon EC2
- EC2 Image Builder
- AWS Lambda

## Container Platform
- Amazon EKS
- Elastic Load Balancing
- Auto-Scaling

## Customer Engagement
- Amazon Connect

## Database
- Amazon DocumentDB
- Amazon DynamoDB
- Amazon ElastiCache
- Amazon Keyspaces
- Amazon Neptune
- Amazon RDS
- Amazon Redshift
- Amazon RDS Aurora
- Amazon RDS MySQL
- Amazon RDS Oracle
- Amazon RDS PostgreSQL
- Amazon RDS SQL Server
- Amazon RDS Proxy
- Amazon Aurora Serverless

## Identity & Access Management
- AWS IAM

## Infrastructure & Platforms
- Amazon VPC
- Demilitarized Zone

## AI & Machine Learning
- Amazon Bedrock
- Amazon SageMaker
- Amazon Groundtruth
- Amazon SageMaker Studio

## Messaging
- Amazon MQ
- Amazon SQS
- Amazon End User Messaging
- Amazon SNS
- Amazon Kinesis Data Streams

## Migration & Transfer
- AWS DMS
- AWS Transfer Family

## Monitoring & Management
- AWS CloudTrail
- AWS CloudWatch
- Amazon OpenSearch Service
- AWS CloudWatch Database Insights

## Secret Management
- AWS KMS
- AWS Secrets Manager

## Security Scanning
- Amazon Guard Duty
- AWS Security Hub

## Storage
- Amazon S3
- AWS Backup
- Amazon Elastic Block Store
- Amazon S3 Vector Bucket
- Amazon S3 Table Bucket

## Streaming
- Amazon MSK

### Selection Rules

1. Import only source records whose `provider` is `AWS`.
2. Limit the source-backed import to the approved 51-service list above.
3. Do not import non-AWS records such as Databricks, JFrog, Solo.io, Docker, GitLab, Harness, Grafana Labs, or other providers from the supplied source dataset.
4. Do not use `anchor`, `icon`, `availability`, or `tech_spec_link` as ServiceLog metadata in this story.
5. Expanded source display names may be harmlessly normalized to the approved catalog name.
6. Do not use source `anchor` merely to solve matching.

---

# Source Metadata Mapping

For approved AWS records, map available source data as follows:

```text
category.name
    → serviceCategory

service.name
    → serviceName

service.provider
    → cloudProvider

service.description
    → serviceDescription

service.internal_link
    → serviceInternalDoc, with prototype enrichment when missing

service.official_link
    → serviceExternalDoc, with prototype enrichment when missing

service.onboarding_requirements
    → normalized serviceOnboardingRequirements[]
```

## Cloud ATO is a deliberate exception

Do **not** directly map source UAR booleans to multiple displayed Cloud ATO values for this prototype.

Use the provider default:

```ts
function defaultCloudAto(provider: string): CloudAto[] {
  if (provider === "AWS") return ["CACE"];
  if (provider === "Azure") return ["CMAA"];
  if (provider === "Google Cloud") return ["MAGE"];
  return [];
}
```

The source `uar` data can remain in the source catalog for future investigation, but ServiceLog currently displays exactly one provider-default ATO.

---

# Service Ownership Mapping

Service Owner is now a person and should be derived from the current Cloud ATO:

```text
CACE → Natasha Romanoff
MAGE → Carol Danvers
CMAA → Wanda Maximoff
```

For the prototype, each name is visually actionable but inert:

```tsx
<a href="#" onClick={(event) => event.preventDefault()}>
  {service.serviceOwner}
</a>
```

Do not invent email addresses. Future production behavior is expected to use `mailto:`.

## TRM Restriction Owner

For Restricted services, `trmRestrictionOwner` is an organizational group/team.

The current prototype group values that previously occupied `serviceOwner` should be preserved and reassigned here where applicable. Examples include:

```text
CIM AI Platform Team
CIM Data Platform
CIM Compute Platform
CIM Security Operations
CIM Network Services
```

Do not replace the restriction group with Natasha Romanoff, Carol Danvers, or Wanda Maximoff.

---

# Onboarding Requirements Normalization

The source is not uniform. Some services provide a simple list while others contain legacy `<p title="...">` hover markup, nested notes, explanatory prose, and inconsistent naming.

Requirements:

1. Produce clean, human-readable ServiceLog onboarding content.
2. Remove legacy presentation wrappers and hover instructions.
3. Preserve meaningful requirement names, qualifiers, and explanatory notes.
4. Do not render source HTML directly.
5. Do not use `dangerouslySetInnerHTML`.
6. Do not blindly promote every nested line into a top-level requirement.
7. Keep normalization separate from drawer rendering so it can be reviewed/tested independently.
8. If content cannot confidently be normalized into `string[]`, stop and raise the model concern instead of discarding meaningful content.

The target field remains:

```ts
serviceOnboardingRequirements?: string[];
```

---

# Prototype Link Behavior

The prototype demonstrates link affordances and future information architecture, but stakeholders do not want operational outbound navigation.

Therefore:

```text
TRM link                 → inert
Service Owner            → inert
Internal Documentation   → inert
External Documentation   → inert
```

Use `href="#"` or equivalent and prevent navigation.

The underlying model may retain intended destination strings for future implementation, but those values must not be used as live destinations in the prototype.

---

# Service Card

Update references to the new model while preserving the approved visual hierarchy:

```text
Service Name
Cloud Provider
TRM Status
Service Description
View details →
```

Use:

```text
service.serviceName
service.cloudProvider
service.trmStatus
service.serviceDescription
```

Preserve the existing card clamp and geometry. Do not shorten source descriptions in the data model merely to fit the card.

---

# Search, Filters, and Grouping

Search corpus:

```ts
[
  service.serviceName,
  service.cloudProvider,
  service.serviceCategory,
  service.serviceDescription,
]
```

Provider filter uses `service.cloudProvider`.

Category filter uses `service.serviceCategory`.

TRM filter uses `service.trmStatus`.

Existing semantics remain:

```text
Within a facet = OR
Across facets = AND
```

Category grouping remains:

```text
0 selected categories → grouped
1 selected category   → flat grid
2+ selected categories → grouped
Search without single-category selection → grouped
```

The category UI must support all 15 approved AWS categories.

---

# Service Detail Drawer — Final Information Architecture

The drawer should answer four questions in order:

```text
What is this?
Is it governed/approved?
How do I get it?
Where do I learn more?
```

## 1. Overview

Contains:

```text
Service Description
View more / View less when needed
Common Use Cases
Limitations, when present
```

Use `serviceDescription` as the single description source.

## 2. Governance & Compliance

Contains:

```text
FedRAMP Status
Cloud ATO
TRM Restriction Owner, Restricted only
```

Rules:

- Do not show ATO Status.
- Do not duplicate TRM Status here. The drawer header remains the single TRM Status presentation.
- Cloud ATO is displayed as the current provider-default value.
- `TRM Restriction Owner` is the applicable team/group and appears only for Restricted services.

## 3. Request & Provisioning

This replaces `Logistics & Accountability`.

Contains compact metadata:

```text
Service Owner
Provisioning Model
Funding Approach
Provisioning SLA
Approval Workflow
```

`Service Owner` is the ATO-based person and renders as an inert link.

`Approval Workflow` moves here from the old Help & Guides section. Preserve the existing disclosure interaction unless a small layout adjustment is needed to fit this section naturally.

### Onboarding Requirements

Render beneath the compact metadata grid on a **new full-width row**.

Do not squeeze long onboarding content into a 50% drawer column.

Conceptual layout:

```text
SERVICE OWNER                 PROVISIONING MODEL
Natasha Romanoff              Tier 3

FUNDING APPROACH              PROVISIONING SLA
Funding recouped              10 business days

APPROVAL WORKFLOW
[existing disclosure]

ONBOARDING REQUIREMENTS
• cost_center
• project
• environment
• Instance Type ...
• Volume size ...
• ...
```

If onboarding requirements are absent, do not show an empty section or invent placeholder requirements.

## 4. Documentation

This replaces `Help & Guides`.

Contains:

```text
Internal Documentation
External Documentation
```

Both are present for every ServiceLog service and appear as inert links in the prototype.

Approval Workflow does **not** belong in Documentation.

---

# Drawer Header

Continue displaying the primary TRM treatment in the header:

```text
TRM · Permitted
TRM · Restricted
TRM · Divest
TRM · Prohibited
```

The TRM treatment may remain visually actionable as the future access point to `trmLink`, but must be inert in the prototype.

Do not duplicate TRM Status inside Governance & Compliance.

---

# Request via ServiceNow CTA

The CTA remains visible in the sticky drawer footer.

## Prohibited

When:

```ts
service.trmStatus === "Prohibited"
```

then:

- Disable the CTA.
- Preserve the disabled visual state.
- Provide a tooltip accessible by mouse and keyboard.
- Use the generic message:

```text
This service cannot be requested because its TRM status is Prohibited.
```

Because a native disabled button does not reliably receive pointer/focus events, use the appropriate MUI v4 tooltip wrapper pattern, for example a focusable wrapper around the disabled button.

## Other statuses

For Permitted, Restricted, and Divest, retain the current enabled prototype CTA behavior.

The CTA remains prototype-only. Do not introduce real ServiceNow navigation in this story.

---

# Fields to Remove Completely

Remove from active model/records/UI:

```text
status
overview
environments
atoStatus
oemModel
serviceContact
```

Also remove unused types, enums, imports, styling, and rendering logic that exist only for those fields.

---

# Prototype Enrichment

The following remain legitimate prototype enrichment when not supplied by current source metadata:

```text
provisioningModel
serviceOwner
serviceLimitations
fedRampStatus
trmStatus
trmRestrictionOwner
trmLink
fundingApproach
approvalWorkflow
provisioningSLA
serviceUseCases
missing documentation references
```

For source-backed AWS services, use real source content where available and enrich only what the target ServiceLog experience requires.

---

# Implementation Boundary

This story may change the drawer's logical grouping and onboarding layout exactly as described above.

It must **not** otherwise change:

```text
Card geometry
Drawer width
Core typography hierarchy
Core color system
TRM color meanings
Sidebar
Page shell
Search interaction
Filter interaction
Category grouping rules
Responsive behavior outside the approved drawer grouping/layout adjustment
ServiceNow integration
Dark-mode work
```

Dark-mode compatibility remains a separate future story.

---

# Recommended Implementation Sequence

1. Update model/types.
2. Update Cloud ATO normalization to provider-default arrays only.
3. Update Service Owner derivation.
4. Move existing team/group owner enrichment into `trmRestrictionOwner` for Restricted services.
5. Ensure both documentation fields are required for every ServiceLog service.
6. Ensure all prototype links are inert.
7. Update the drawer information architecture.
8. Move Onboarding Requirements to a full-width row.
9. Move Approval Workflow into Request & Provisioning.
10. Implement Prohibited CTA disabled/tooltip behavior.
11. Remove obsolete fields/types/styles.
12. Regression-test search, filtering, grouping, cards, drawer, and CTA states.

---

# Acceptance Criteria

1. The ServiceLog `Service` model reflects the approved vocabulary.
2. `status`, `overview`, `environments`, `atoStatus`, `oemModel`, and `serviceContact` are removed from active code.
3. All 51 approved AWS source services are represented across the 15 approved categories.
4. Non-AWS source records are not imported as part of the source-backed catalog.
5. Existing Azure and Google Cloud prototype services remain unless otherwise removed by an explicit later story.
6. `cloudAto` remains typed as an array.
7. Every AWS service has exactly `cloudAto: ["CACE"]` in the current prototype.
8. Every Google Cloud prototype service has exactly `cloudAto: ["MAGE"]`.
9. Every Azure prototype service has exactly `cloudAto: ["CMAA"]`.
10. Source UAR values do not cause extra Cloud ATO chips to appear in the current prototype.
11. Every CACE service shows Natasha Romanoff as Service Owner.
12. Every MAGE service shows Carol Danvers as Service Owner.
13. Every CMAA service shows Wanda Maximoff as Service Owner.
14. Service Owner is rendered as an inert link and no fake email address is invented.
15. Restricted services show an organizational/team `TRM Restriction Owner`, not the person Service Owner.
16. Non-Restricted services do not show TRM Restriction Owner.
17. `serviceInternalDoc` and `serviceExternalDoc` are required at the ServiceLog layer for every service.
18. Internal and External Documentation links are visible but non-operational.
19. The TRM affordance is visible but non-operational.
20. Search continues to work with the renamed fields.
21. Provider filtering continues to work.
22. Category filtering continues to work.
23. TRM filtering continues to work.
24. Existing OR-within / AND-across filtering semantics remain intact.
25. Category grouping behavior remains unchanged.
26. Cards preserve the approved visual treatment.
27. The drawer uses the final section order: Overview → Governance & Compliance → Request & Provisioning → Documentation.
28. `Logistics & Accountability` no longer appears.
29. `Help & Guides` no longer appears.
30. Provisioning Model appears under Request & Provisioning, not Governance & Compliance.
31. Approval Workflow appears under Request & Provisioning, not Documentation.
32. Cloud ATO appears under Governance & Compliance.
33. Onboarding Requirements render full width beneath the compact Request & Provisioning metadata.
34. Meaningful onboarding qualifiers/notes are preserved during normalization and legacy presentation markup is not rendered.
35. ATO Status does not appear anywhere in the active UI.
36. OEM Model does not appear anywhere in the active UI.
37. Service Owner replaces the old Contact Service Owner concept.
38. TRM status remains presented once in the drawer header.
39. When TRM Status is Prohibited, Request via ServiceNow is disabled.
40. The disabled Prohibited CTA exposes the approved tooltip message to mouse and keyboard users.
41. Other current TRM statuses retain the enabled prototype CTA.
42. No prototype outbound affordance navigates to a real system.
43. Prototype enrichment remains clearly separate from source-backed metadata.
44. No unrelated UX or business-rule changes are introduced.
45. Application builds successfully with no new runtime/console errors.

---

# Definition of Done

Story 1.1 is complete when ServiceLog uses the stable metadata vocabulary, imports and normalizes the approved AWS catalog, applies the final provider-default Cloud ATO and ownership rules, preserves richer prototype enrichment, presents the drawer using the approved logical grouping, prevents all outbound prototype navigation, and enforces the Prohibited request state without introducing unrelated redesign or policy changes.

**Source data informs ServiceLog. The target experience determines how that data is organized and presented.**

**Scope freeze:** Any new product requirement discovered after this revision belongs in the next story.