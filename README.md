# ServiceLog

> **Discover the right cloud service, understand the governance around it, and know how to get started.**

ServiceLog is a cloud service catalog experience designed to make enterprise cloud offerings easier to discover, compare, understand, and request.

It began as a UX prototype. It is evolving deliberately into a production-ready Backstage plugin without throwing away the product thinking that made the prototype useful in the first place.

That distinction matters.

ServiceLog is not a Backstage skin, a component demo, or a catalog table with nicer cards. It is a product experience with a clear information architecture, interaction model, governance model, accessibility baseline, and metadata contract.

The current north star is simple:

> **One ServiceLog product. Two hosts. No fork.**

The same ServiceLog experience must be able to run:

1. **Standalone**, for rapid UX iteration, PO review, demos, and Vercel previews.
2. **Inside Backstage**, as a real plugin that uses Backstage-owned chrome, routing, authentication, and integration conventions.

---

## Why ServiceLog Exists

Enterprise cloud catalogs often expose a large amount of technically correct information while still making a basic user question difficult to answer:

> **Can I use this service, and what happens next?**

ServiceLog is organized around the user journey instead of the source-system structure.

```text
Discover
   ↓
Filter / compare
   ↓
Understand service + governance
   ↓
Open details
   ↓
Understand request path
```

The UI is intentionally optimized for progressive disclosure. A user should be able to scan the catalog quickly, understand the most important governance signal without opening every item, and then move into deeper operational detail only when needed.

The detail experience follows the same logic:

```text
What is it?
     ↓
Can I use it?
     ↓
How do I get it?
     ↓
Where do I learn more?
```

That information architecture is a product decision, not an artifact of the underlying YAML or Backstage entity shape.

---

# Product Evolution

ServiceLog has intentionally evolved in layers. Each layer solved one class of problem before the next integration concern was introduced.

## Phase 1: UX prototype and interaction model

The first goal was to prove the product experience before optimizing for a production host.

The prototype established:

- service cards designed for fast scanning,
- provider, category, TRM, and text search filters,
- grouped and flat result behaviors based on category selection,
- a side-panel detail model,
- clear TRM status treatment,
- requestability rules,
- provider identity,
- governance metadata,
- onboarding requirements,
- standalone navigation for stakeholder demos.

The key lesson from this phase was that catalog usability depends less on showing more metadata and more on showing the right metadata at the right level.

A guiding principle emerged:

> **Put information at the highest level where it remains unambiguous. Do not repeat parent context in every child unless the child needs to stand alone.**

That is why, for example, category context is expressed through grouping rather than repeated unnecessarily on every card.

## Phase 2: Metadata alignment

The prototype then moved from convenience fields toward a more explicit service model.

The ServiceLog-facing contract now includes fields such as:

- service name,
- provider,
- category,
- description,
- internal and external documentation,
- provisioning model,
- Cloud ATO,
- Service Owner,
- FedRAMP status,
- TRM status,
- TRM Restriction Owner,
- funding approach,
- approval workflow,
- provisioning SLA,
- common use cases,
- onboarding requirements.

A critical ownership distinction was also locked:

```text
Backstage spec.owner
= catalog ownership / group reference

ServiceLog serviceOwner
= accountable person

ServiceLog trmRestrictionOwner
= responsible group when TRM = Restricted
```

Those concepts are related operationally, but they are not interchangeable and must not be silently merged.

## Phase 3: Accessibility as part of the product baseline

Accessibility was treated as a product-quality requirement, not a final compliance pass.

The main catalog and detail panel were hardened for:

- semantic heading structure,
- real checkbox semantics,
- keyboard-operable filters,
- Escape behavior and focus restoration,
- debounced live-region result announcements,
- meaningful dialog semantics,
- focus entry and focus containment,
- exact focus return to the originating card action,
- keyboard-accessible disabled-action explanations,
- decorative icon suppression from assistive technology,
- constrained-width and zoom/reflow behavior.

The design rule is:

> **Accessibility enhancements must preserve the stakeholder-approved UI. Visible changes should improve clarity or usability for everyone. Assistive-technology support should be implemented primarily through correct semantics, interaction behavior, and accessibility metadata rather than unnecessary visual redesign.**

This matters because accessibility and visual consistency are not competing goals. Both are part of a coherent interface.

## Phase 4: Host-neutral product architecture

Once the V1 product experience was stable, ServiceLog was separated from its demo shell.

The architecture became:

```text
StandaloneApp
├── standalone Sidebar
├── standalone theme/chrome
└── ServiceLogFeature
      └── ServiceOfferingsPage
```

This established a clean rule:

> **The sidebar belongs to the standalone host, not to ServiceLog itself.**

There is no `showSidebar={false}` compatibility switch inside the product. The Backstage plugin simply never imports the standalone shell.

This is intentional architecture, not temporary cleanup.

## Phase 5: YAML metadata contract and validation

The next step removed the hardcoded TypeScript catalog and made metadata ownership explicit.

The current data path is:

```text
CSP-owned YAML
      ↓
shared JSON Schema validation
      ↓
normalization
      ↓
Service[]
      ↓
ServiceLog UI
```

The V1 catalog currently contains **76 services**, aggregated in one
YAML catalog file, `metadata/services.yaml` (see Phase 5.1 below):

- **51 AWS**
- **13 Azure**
- **12 Google Cloud**

The governance model is:

> **CSP teams own their metadata. The platform owns the metadata contract.**

That means a CSP team can maintain its own service records, but fields and controlled vocabularies remain centrally governed.

For example:

```yaml
trmStatus: Dangerous
```

is invalid. ServiceLog does not silently accept it, reinterpret it, or map it to another status.

The build validates metadata before producing the application, so invalid catalog data fails loudly instead of becoming a runtime surprise.

## Phase 5.1: One aggregate YAML catalog

The carbon team's prototype workflow expects one YAML catalog rather than
one file per service, so the packaging (not the metadata model) changed
again: all 76 services now live in a single file, `metadata/services.yaml`,
as a `services` array. The per-service YAML layout (`metadata/aws/`,
`metadata/azure/`, `metadata/google-cloud/`) was retired.

Nothing above the `Service[]` boundary changed:

```text
metadata/services.yaml (76 entries)
      ↓
shared JSON Schema validation (same per-entry contract, reused via $defs)
      ↓
normalization
      ↓
Service[]
      ↓
ServiceLog UI
```

The service-entry contract, controlled vocabularies, and
`npm run validate:metadata` entry point are unchanged. This is a packaging
correction for a specific prototype integration handoff, not a permanent
enterprise metadata governance model.

## Phase 6: Backstage integration

The current integration phase is about moving the product into Backstage without changing the product simply because the host changed.

The target architecture is:

```text
                         ServiceLog UI Core
                                │
                    ┌───────────┴───────────┐
                    │                       │
             Standalone Host          Backstage Host
             PO / UX testing          production plugin
                    │                       │
          local/Vercel YAML        Backstage data adapter
                    │                       │
                    └───────────┬───────────┘
                                │
                             Service[]
```

The integration principle is equally simple:

> **ServiceLog adapts to the platform, not the other way around.**

The plugin should fit the target Backstage environment with the smallest reasonable integration surface. It must not force the host team to upgrade Backstage, React, Material UI, routing, or frontend architecture simply because a newer pattern exists elsewhere.

---

# Design Philosophy

## 1. Design the decision, not the database

Users do not come to a service catalog to admire metadata structure. They come to make a decision.

The experience therefore prioritizes:

- discoverability,
- governance clarity,
- requestability,
- operational next steps,
- progressive disclosure.

The source model informs the UI, but it does not dictate the UI.

## 2. Progressive disclosure over metadata dumping

Cards answer the questions needed for scanning. The detail panel answers the questions needed for evaluation and action.

The card has two intentionally separate actions:

```text
Card surface
├── Primary action: View details
└── Secondary action: TRM status
```

The TRM link is independent because governance is meaningful on its own. Clicking it should not accidentally trigger the card's primary action.

## 3. Governance should be legible, not intimidating

TRM status is visible and consistent:

- Permitted
- Restricted
- Divest
- Prohibited

Restricted services remain requestable but expose the responsible restriction owner. Divest and Prohibited services are explicitly non-requestable and explain why.

The design avoids making governance feel like hidden policy logic. The user should understand the rule before reaching a dead end.

## 4. Consistency is a usability feature

If two things look different, users assume they behave differently.

Visual hierarchy, interaction states, focus behavior, spacing, labels, and semantics are therefore treated as a system rather than a collection of isolated screens.

Implementation details are not an excuse for UI inconsistency.

## 5. Preserve user context

Opening details should feel like inspecting an item, not leaving the catalog.

That is why the detail experience is a panel with deliberate focus management and return behavior. After closing it, the user returns to the exact place that launched it.

## 6. Prototype behavior should be explicit

A prototype is allowed to have inert integrations. It is not allowed to pretend they are real.

Current ServiceLog links and actions such as ServiceNow, internal documentation, external documentation, TRM destinations, and owner links may remain intentionally inert until production destinations are approved.

The rule is simple:

> **Do not invent operational truth to make a prototype look more complete.**

---

# Development Philosophy

ServiceLog uses a product-led, story-driven development model.

The work is intentionally separated into decisions, implementation, verification, and acceptance.

```text
Product intent / UX decision
          ↓
Story with locked decisions and boundaries
          ↓
Implementation branch
          ↓
PR review against the story
          ↓
Regression verification
          ↓
PO acceptance
          ↓
Merge
```

## Stories are contracts, not tickets with vague intent

Story documents live in [`dev/stories`](./dev/stories).

They capture:

- product intent,
- architecture decisions,
- accepted interaction behavior,
- explicit non-goals,
- edge cases,
- test expectations,
- regression gates,
- definition of done.

This lets implementation teams move quickly without having to rediscover product decisions in Slack threads, screenshots, or memory.

## We separate product decisions from implementation discretion

A story should be strict where the user experience or architecture contract matters and flexible where implementation detail does not.

Examples of product-locked decisions:

- filter semantics,
- requestability rules,
- ownership meaning,
- accessibility behavior,
- standalone availability,
- no duplicate UI implementation,
- no invented metadata.

Examples of implementation discretion:

- exact validation library,
- internal helper names,
- package layout when host conventions require it,
- styling-containment mechanism,
- adapter naming.

This balance avoids both under-specification and micromanagement.

## Regression evidence is part of the PR

A passing build is necessary, but it is not sufficient for an interaction-heavy product.

PRs are expected to document relevant verification such as:

- metadata validation,
- tests,
- production build,
- standalone preview,
- service counts,
- filter behavior,
- card/detail behavior,
- TRM behavior,
- focus behavior,
- long-content stress cases,
- host-containment checks.

The implementation is not considered complete merely because the code compiles.

## Integration should not become redesign by accident

The current V1 experience is the golden reference.

A new host, framework, library, or plugin API is not automatically permission to change typography, spacing, information architecture, card behavior, side-panel behavior, or accessibility semantics.

Our migration test is:

> **Move the product without changing the product.**

If a host constraint truly requires a visible product change, that becomes an explicit product decision.

---

# Current Architecture

```text
metadata/
├── schema/
│   └── service-metadata.schema.json
├── lib/
│   └── validate.ts
└── services.yaml

src/
├── app/
│   ├── ServiceLogFeature.tsx
│   ├── components/
│   │   ├── ServiceOfferingsPage.tsx
│   │   ├── FilterBar.tsx
│   │   ├── ServiceCard.tsx
│   │   └── ServiceDetailDrawer.tsx
│   └── data/
│       └── types.ts
└── standalone/
    ├── StandaloneApp.tsx
    ├── Sidebar.tsx
    └── data/
        └── yamlAdapter.ts
```

The important boundary is:

```text
Host / adapter
      ↓
Service[]
      ↓
ServiceLogFeature
      ↓
product UI components
```

Product components do not need to know whether the services came from Vite-loaded YAML, a Backstage backend, or another future source.

---

# Metadata Governance

The active metadata contract is documented in [`metadata/README.md`](./metadata/README.md).

The JSON Schema is the machine-readable contract:

[`metadata/schema/service-metadata.schema.json`](./metadata/schema/service-metadata.schema.json)

Controlled vocabularies currently include:

- cloud provider,
- service category,
- Cloud ATO,
- provisioning model,
- FedRAMP status,
- TRM status,
- funding approach,
- approval workflow.

Unknown or stale profile fields are rejected instead of ignored.

Backstage ownership is intentionally separate from ServiceLog ownership fields. The current YAML is **Backstage-shaped**, but not claimed to be fully Catalog-ready until real `spec.owner` values and host integration are approved.

---

# Running ServiceLog Standalone

Standalone mode is permanent and is the fastest way to work on the product experience.

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

This starts the standalone stakeholder experience with the ServiceLog demo Sidebar.

## Validate metadata

```bash
npm run validate:metadata
```

This validates `metadata/services.yaml` against the shared schema and checks the one rule the schema alone can't express: unique service IDs across the whole catalog.

## Run tests

```bash
npm test
```

## Production build

```bash
npm run build
```

Metadata validation runs as a pre-build gate. Invalid metadata should fail the build rather than produce a partially valid catalog.

---

# Backstage Integration Direction

The Backstage implementation is deliberately host-aware.

Before hard-wiring plugin APIs, the integration must identify the actual target environment, including:

- Backstage version,
- legacy, new, or hybrid frontend system,
- React version,
- UI stack,
- workspace/package conventions,
- plugin conventions,
- backend conventions,
- routing,
- authentication expectations.

The plugin should then use the least disruptive supported integration path for that host.

Backstage owns:

- global navigation,
- application Sidebar,
- top-level routing,
- authentication/session behavior,
- host theme,
- shell layout.

ServiceLog owns:

- catalog discovery experience,
- filtering,
- cards,
- service detail interaction,
- product semantics,
- accessibility behavior,
- normalized service contract.

There should be no second Backstage-like shell rendered inside Backstage.

## Running the experimental harness

No real target host was available yet, so the current integration is proven
against a documented experimental harness (`packages/app` + `packages/backend`
+ `plugins/servicelog` + `plugins/servicelog-backend`) rather than a
production Backstage instance. The full compatibility record — Backstage
version, frontend-system choice, React version, and every host constraint
this surfaced — lives in
[`docs/backstage-compatibility.md`](./docs/backstage-compatibility.md).

Build every Backstage-side package (`@servicelog/core`, `@servicelog/metadata`,
and both `plugins/*` packages) in the right order:

```bash
npm run build:backstage
```

Run the harness itself, in two terminals:

```bash
npm run start --workspace=backend
npm run start --workspace=app
```

Then open http://localhost:3000.

---

# V1 Product Baseline

The following behaviors should be treated as regression-sensitive:

1. Search across service name, provider, category, and description.
2. Provider filters use OR within the provider facet.
3. Different facets combine with AND behavior.
4. No selected category shows category-grouped results.
5. One selected category shows a flat grid.
6. Multiple selected categories show grouped selected categories.
7. Card `View details` remains the primary action.
8. TRM remains an independent secondary action.
9. Restricted services expose a TRM Restriction Owner.
10. Divest and Prohibited services are non-requestable.
11. Detail-panel focus enters correctly, remains contained, and returns to the exact opener.
12. Long onboarding content remains usable. Amazon End User Messaging is the stress case.
13. Narrow viewport and zoom/reflow behavior remain usable.
14. Standalone Sidebar remains available in standalone mode only.

---

# What We Deliberately Avoid

ServiceLog development has several explicit anti-patterns:

- no duplicate standalone and Backstage versions of the product UI,
- no hidden `showSidebar` host flag in the core,
- no invented production metadata,
- no silent coercion of invalid controlled values,
- no direct raw-YAML consumption in product components,
- no framework migration just because a newer library exists,
- no host-wide CSS reset from a plugin,
- no accidental redesign disguised as integration work,
- no accessibility regression in exchange for visual parity,
- no visual inconsistency justified solely by implementation convenience.

---

# Repository Story Trail

The evolution of the project is recorded in the story files:

- [`STORY_1.1_service-metadata-alignment-and-source-mapping.md`](./dev/stories/STORY_1.1_service-metadata-alignment-and-source-mapping.md)
- [`STORY_1.2_accessibility-main-view-and-service-detail-panel.md`](./dev/stories/STORY_1.2_accessibility-main-view-and-service-detail-panel.md)
- [`STORY_2.1_host-neutral-servicelog-and-standalone-demo-shell.md`](./dev/stories/STORY_2.1_host-neutral-servicelog-and-standalone-demo-shell.md)
- [`STORY_2.2_yaml-metadata-contract-validation-and-data-pipeline.md`](./dev/stories/STORY_2.2_yaml-metadata-contract-validation-and-data-pipeline.md)
- [`STORY_2.2.1_aggregate-services-into-single-yaml-catalog.md`](./dev/stories/STORY_2.2.1_aggregate-services-into-single-yaml-catalog.md)
- [`STORY_2.3_backstage-plugin-integration-and-dual-host-runtime.md`](./dev/stories/STORY_2.3_backstage-plugin-integration-and-dual-host-runtime.md)

These files are not historical clutter. Together they explain why the product behaves the way it does and which decisions are intentional.

---

# For the Team Integrating ServiceLog

If you are picking this project up for the first time, the fastest mental model is:

```text
ServiceLog is already a product.
Backstage is the host.
YAML is the metadata source.
Service[] is the boundary.
The story files are the decision record.
The standalone app is the product playground.
```

You should not need to reverse-engineer the product from components before you can safely work on it.

Start with this README, then read the current story, then inspect the relevant implementation.

If a host constraint conflicts with a locked product behavior, surface the conflict rather than silently changing the experience.

That is the development culture behind ServiceLog:

> **Be rigorous about the decisions that matter, flexible about the implementation details that do not, and leave the product easier to understand than you found it.**
