# STORY 2.1 — Host-Neutral ServiceLog + Standalone Demo Shell

**Status:** Ready for development  
**Date:** 2026-08-21  
**Repository:** `sergiullas/bservice`  
**Decision state:** PO-approved architecture direction  

---

## Story Intent

ServiceLog V1 is now considered a stable UX/UI baseline for the Backstage experiment.

The goal of this story is **not** to redesign ServiceLog and **not** to convert it into a Backstage plugin yet.

The goal is to separate the current standalone application shell from the reusable ServiceLog product experience so that the same ServiceLog UI can later run in two hosts:

```text
                    ServiceLog UI Core
                         │
              ┌──────────┴──────────┐
              │                     │
     Standalone Demo Host       Backstage Host
              │                     │
      Existing Sidebar          Backstage chrome
      Existing branding         Backstage navigation
      Vite/local demo           Production plugin
```

The existing sidebar is intentionally preserved for stakeholder demos. It must become a **standalone-host concern**, not something the Backstage integration later has to remove, hide, or override.

### North Star

> **One ServiceLog product experience, two hosts.**

The ServiceLog feature itself must not know whether it is being rendered by the standalone demo or by Backstage.

---

## Why This Story Exists

The current `App.tsx` mixes three separate responsibilities:

1. standalone application theme/bootstrap,
2. standalone demo shell and Sidebar,
3. the actual ServiceLog feature (`ServiceOfferingsPage`).

Current shape:

```text
App.tsx
├── ThemeProvider / CssBaseline
├── full-viewport application layout
├── Sidebar
└── ServiceOfferingsPage
```

That is appropriate for a standalone prototype, but it creates unnecessary friction for Backstage integration because a host application should not need to remove ServiceLog-owned global chrome.

Target shape:

```text
StandaloneApp
├── standalone theme/bootstrap
├── standalone layout
├── Sidebar
└── ServiceLogFeature
      └── ServiceOfferingsPage

Backstage host (future story)
└── ServiceLogFeature
      └── ServiceOfferingsPage
```

There must be **no duplicate ServiceLog implementation** between standalone and Backstage.

---

# PO-Locked Product Guardrails

## 1. ServiceLog V1 is the visual and interaction baseline

This story is an architectural refactor, not a product redesign.

Preserve the current approved experience, including:

- page title and introductory content,
- service cards,
- card hover and keyboard-focus behavior,
- primary card / `View details` interaction,
- independent TRM link interaction,
- search,
- provider filters,
- category selection,
- TRM filters,
- grouped and flat category views,
- result feedback and empty state,
- Service Detail Panel,
- drawer information architecture,
- accessibility behavior from Story 1.2,
- Restricted TRM owner behavior,
- Divest / Prohibited non-requestable behavior,
- current typography, spacing, color, and responsive behavior.

If this refactor causes a visible or behavioral change, treat it as a regression unless the PO explicitly approves it.

---

## 2. Preserve the Sidebar for standalone stakeholder demos

The current Sidebar remains available and visually unchanged in standalone mode.

It is useful demo chrome and is **not** being deleted as part of this story.

However:

> The Sidebar belongs to the standalone demo host, not to ServiceLog UI Core.

The future Backstage host must never need to import it and must never need a `showSidebar={false}` escape hatch.

Preferred architecture:

```text
Standalone host knows Sidebar exists.
ServiceLog UI Core does not.
Backstage host does not.
```

Do **not** solve this with a configuration flag such as:

```tsx
<App showSidebar={false} />
```

The separation should be structural rather than conditional.

---

## 3. Standalone mode is intentionally supported long-term

The standalone runtime is not temporary migration scaffolding.

It remains an intentional development and stakeholder-review host so the PO and design team can continue testing ServiceLog without running a complete Backstage environment.

Expected capability after this story:

```text
npm run dev
    ↓
Standalone ServiceLog demo
    ↓
Existing Sidebar + exact ServiceLog V1 experience
```

Future Backstage work must not remove this capability.

---

## 4. Backstage adapts around ServiceLog UI Core

Do not introduce Backstage-specific APIs into `ServiceOfferingsPage`, `ServiceCard`, `FilterBar`, or `ServiceDetailDrawer` in this story.

This story establishes the integration seam only.

Do not yet add dependencies on:

- Backstage frontend APIs,
- Backstage discovery APIs,
- Backstage Catalog APIs,
- Backstage routing APIs,
- Backstage backend packages.

Target Backstage version/frontend-system compatibility will be addressed when the actual Backstage host is introduced.

---

# Scope

## A. Create an explicit host-neutral ServiceLog feature boundary

Create a reusable entry component for the actual ServiceLog experience.

Conceptually:

```tsx
export function ServiceLogFeature() {
  return <ServiceOfferingsPage />;
}
```

Exact naming/file placement is implementation discretion, but the resulting boundary must be obvious to another developer reviewing the repository.

The host-neutral feature must not import:

- `Sidebar`,
- standalone theme ownership,
- standalone viewport shell,
- standalone navigation configuration,
- Vite-specific runtime code.

### Acceptance Criteria

- There is one clear component/module that a future Backstage page can render to get the ServiceLog experience.
- That component renders the same `ServiceOfferingsPage` used by standalone mode.
- No duplicate copy/fork of `ServiceOfferingsPage` or its child components is created.

---

## B. Separate the standalone demo shell

Move/organize standalone-only responsibilities into a clearly identifiable standalone host layer.

The standalone host owns:

- Sidebar,
- root app layout,
- full-viewport demo shell,
- current root `ThemeProvider`,
- current `CssBaseline`,
- root background/padding/max-width behavior required to reproduce the approved demo,
- standalone entry/bootstrap wiring.

The standalone host then renders the host-neutral `ServiceLogFeature`.

Exact folder naming is implementation discretion. A structure similar to the following is preferred because the boundary is immediately understandable:

```text
src/
├── app/
│   ├── ServiceLogFeature.tsx
│   ├── components/
│   └── data/
│
├── standalone/
│   ├── StandaloneApp.tsx
│   └── Sidebar.tsx
│
└── main.tsx
```

Do not perform file movement merely for aesthetics. The key requirement is architectural ownership, not folder churn.

### Acceptance Criteria

- Standalone mode continues to display the current Sidebar.
- Sidebar behavior and appearance remain unchanged.
- The standalone shell is the only layer responsible for rendering the Sidebar.
- ServiceLog UI Core contains no import/reference to Sidebar.
- `main.tsx` boots the standalone host, not the host-neutral feature directly.

---

## C. Remove host assumptions from the ServiceLog feature boundary

Audit the feature boundary and its immediate layout for assumptions that only make sense when ServiceLog owns the entire browser viewport.

Current `App.tsx` owns `height="100vh"`, `overflow: hidden`, root padding, and root page scrolling. Those are shell concerns.

Move shell-specific behavior out of the reusable ServiceLog feature.

### Important clarification

Do **not** mechanically remove all fixed positioning from components.

For example, the Service Detail Panel is intentionally modal and may legitimately use viewport/portal positioning. Its behavior should remain unchanged unless a real host-neutrality problem is demonstrated.

The rule is:

> Remove assumptions about owning the application shell. Preserve behavior that is intrinsic to the component itself.

### Acceptance Criteria

- The host-neutral ServiceLog feature does not require `height: 100vh` to render correctly.
- The host-neutral feature does not own global application scrolling.
- The feature can render inside a constrained parent container without layout failure.
- Service Detail Panel behavior remains functionally and visually unchanged.

---

## D. Preserve current styling while clarifying ownership

This story must **not** become the Tailwind/MUI/Backstage styling migration.

Do not redesign or restyle the application.

Do not remove Tailwind merely because Backstage integration is planned.

Do not upgrade MUI merely because Backstage may use another version.

Do not replace working components solely to make the code look more Backstage-like.

However, standalone-only root styling must remain owned by the standalone host rather than by the reusable feature entry.

### Acceptance Criteria

- Standalone visual parity is preserved.
- No new global CSS reset/theme ownership is introduced into ServiceLog UI Core.
- Existing styles required by the feature continue to load in standalone mode.
- Any known styling that may require isolation for Backstage is documented for the future Backstage integration story rather than silently redesigned here.

---

# Checkpoints

This is one silicon-team story with two implementation checkpoints, not separate sub-stories.

## Checkpoint A — Architecture separation

Complete the structural separation:

- host-neutral ServiceLog entry exists,
- standalone shell owns Sidebar/theme/root layout,
- feature has no Sidebar dependency,
- standalone build succeeds.

Before proceeding, verify there is only one implementation of the ServiceLog feature.

## Checkpoint B — Regression verification

Verify standalone V1 parity and host-neutral rendering.

Do not open a separate story/branch for Checkpoint B.

---

# Required Regression Verification

At minimum verify:

1. Standalone application starts successfully.
2. Sidebar appears and behaves as before.
3. Service cards render with unchanged layout.
4. Card click / `View details` opens the Service Detail Panel.
5. TRM card link remains a separate interaction and does not open the panel.
6. Search works.
7. Provider filters work.
8. Category multi-select works.
9. TRM filters work.
10. Grouped/flat category behavior is unchanged.
11. Restricted service detail renders TRM Restriction Owner correctly.
12. Divest and Prohibited request CTAs retain the Story 1.2 behavior.
13. Keyboard focus entry/return for the Service Detail Panel remains intact.
14. Long onboarding content remains usable. Use **Amazon End User Messaging** as the stress-test case.
15. Existing accessibility semantics introduced by Story 1.2 are not regressed.
16. Production build succeeds.

Also create a minimal host-neutral render test/harness or equivalent proof demonstrating that `ServiceLogFeature` can render without the standalone Sidebar/layout being mounted.

This proof does **not** need to be Backstage yet.

---

# Explicitly Out of Scope

Do not do the following in Story 2.1:

- Do not redesign ServiceLog.
- Do not change ServiceLog IA.
- Do not change card content strategy.
- Do not change filtering rules.
- Do not change service metadata.
- Do not implement YAML ingestion yet.
- Do not modify the controlled vocabulary/data contract yet.
- Do not add a ServiceLog backend.
- Do not scaffold a Backstage plugin yet.
- Do not choose/force a Backstage frontend-system generation yet.
- Do not integrate Backstage Catalog.
- Do not remove standalone mode.
- Do not delete the Sidebar.
- Do not add a `showSidebar` flag to core components.
- Do not perform the Tailwind-to-MUI migration.
- Do not upgrade React or MUI as part of this story.
- Do not activate prototype links or ServiceNow actions.
- Do not invent production URLs, emails, owners, or metadata.

---

# Definition of Done

Story 2.1 is complete when:

- ServiceLog has one obvious host-neutral UI entry point.
- Standalone demo shell and ServiceLog UI Core are structurally separated.
- Sidebar exists only in the standalone host path.
- Standalone stakeholder-demo experience remains visually and behaviorally equivalent to V1.
- The reusable ServiceLog feature can render without standalone chrome.
- No Backstage-specific dependency has leaked into the feature components.
- No duplicate ServiceLog implementation exists.
- Story 1.2 accessibility behavior is preserved.
- Build succeeds.
- Regression verification is documented in the PR.
- Any discovered Backstage-specific styling/integration risks are documented for the next story rather than solved through unapproved redesign.

---

# Future Architecture Context — Not Implementation Scope

This story prepares for the next two major silicon-team stories:

```text
Story 2.1
Host-neutral UI architecture
        ↓
Story 2.2
YAML metadata contract + validation/data pipeline
        ↓
Story 2.3
Backstage host/plugin integration
```

Long-term target:

```text
AWS YAML       Google YAML       Azure YAML
    \              |               /
     \             |              /
      shared schema + validation
                 ↓
             normalization
                 ↓
           Service[] contract
                 ↓
          ServiceLog UI Core
             /          \
            /            \
   Standalone Host     Backstage Host
```

Story 2.1 owns only the bottom host/UI separation.

---

## Output Style

- No preamble before tool calls. Do not narrate what you're about to do.
- Don't restate the task before starting.
- Skip "I'll start by..." / "Let me..." framing entirely.
- Lead with results, not process narration.
- After finishing, summarize only what changed — don't re-explain the plan.
- These instructions affect communication style only. They MUST NOT reduce the quality, rigor, completeness, testing, validation, reasoning, or implementation depth of the work.
- High-quality output remains mandatory. Be concise in narration, not in execution.
