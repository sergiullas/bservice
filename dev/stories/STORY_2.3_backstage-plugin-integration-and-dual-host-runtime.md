# STORY 2.3 — Backstage Plugin Integration and Dual-Host Runtime

**Status:** Ready for development  
**Date:** 2026-08-22  
**Repository:** `sergiullas/bservice`  
**Decision state:** PO-approved integration direction with a mandatory target-host discovery gate

---

## Story Intent

Stories 2.1 and 2.2 established two critical seams:

```text
Story 2.1
Standalone shell
      ↓
ServiceLog UI Core

Story 2.2
CSP-owned YAML
      ↓
validation + normalization
      ↓
Service[]
      ↓
ServiceLog UI Core
```

Story 2.3 proves the final seam:

```text
                    ServiceLog UI Core
                           │
               ┌───────────┴───────────┐
               │                       │
        Standalone Host          Backstage Host
        stakeholder demo         production-style plugin
               │                       │
      local/Vercel YAML          Backstage data adapter
               │                       │
               └───────────┬───────────┘
                           │
                        Service[]
```

### North Star

> **One ServiceLog product. Two hosts. No fork.**

The current stakeholder-approved ServiceLog V1 remains the product baseline.

The Backstage work is an integration exercise, not a redesign and not a request for the Backstage team to modernize its platform around ServiceLog.

ServiceLog must adapt to the target Backstage environment with the smallest reasonable integration surface.

---

# PO-Locked Product and Architecture Decisions

## 1. Preserve the standalone experience permanently

Standalone mode is intentional product-development infrastructure, not temporary scaffolding.

The PO must continue to be able to run and preview ServiceLog without a complete Backstage environment.

The standalone host keeps:

- the stakeholder-demo Sidebar,
- demo branding/chrome,
- local/Vercel preview capability,
- fast UI iteration,
- the same ServiceLog V1 feature implementation used by Backstage.

The Backstage plugin must **not** render, hide, or import the standalone Sidebar.

Architecture:

```text
StandaloneApp
├── standalone Sidebar
├── standalone theme/chrome
└── ServiceLogFeature

Backstage plugin page
├── Backstage-owned chrome/navigation
└── ServiceLogFeature
```

There must not be a `showSidebar={false}` style compatibility switch inside the product core.

Backstage should simply never load the standalone shell.

---

## 2. Do not fork the ServiceLog UI

The following product components remain shared:

```text
ServiceLogFeature
ServiceOfferingsPage
FilterBar
ServiceCard
ServiceDetailDrawer
```

Do not create:

```text
BackstageServiceCard
BackstageFilterBar
BackstageServiceDetailDrawer
```

or another parallel implementation unless a genuine host incompatibility is discovered and raised for PO review.

A thin Backstage wrapper/adapter is expected and encouraged.

---

## 3. Do not force a Backstage platform upgrade

Before selecting plugin APIs, inspect the actual target Backstage host if it is available.

ServiceLog must adapt to the target host rather than require the host team to upgrade Backstage, React, Material UI, Backstage UI, routing, or its frontend architecture merely to accept this plugin.

Current Backstage has both legacy and new frontend systems in the ecosystem. New applications generally use the new frontend system, while many existing installations still contain legacy or hybrid wiring.

Therefore:

- If the target host uses the **new frontend system**, use the target host's supported new-system pattern, conceptually `createFrontendPlugin` + `PageBlueprint`.
- If the target host uses the **legacy frontend system**, use the supported legacy pattern, conceptually `createPlugin` + `createRoutableExtension`.
- If the target host is hybrid, choose the least disruptive supported integration path for that host.
- Do not implement both systems merely for theoretical completeness unless doing so is genuinely low-cost or required by the target host.

The PR must record what was discovered and which integration path was selected.

---

## 4. Backstage owns Backstage chrome

The plugin supplies ServiceLog content.

The host owns:

- global navigation,
- application Sidebar,
- top-level Backstage routing,
- host authentication/session behavior,
- host theme providers,
- host shell layout.

The ServiceLog plugin must not introduce a second Backstage-like shell inside Backstage.

The integration harness may add a Backstage nav entry to prove the page is reachable, but the production host team remains free to place that nav entry according to its own information architecture.

---

## 5. Preserve V1 UX/UI unless integration makes a change unavoidable

The current experience is the golden reference for Story 2.3:

- card layout and content,
- provider/category/TRM filters,
- search,
- grouping behavior,
- card primary `View details` interaction,
- independent TRM link behavior,
- side-panel information architecture,
- Restricted behavior,
- Divest and Prohibited request behavior,
- keyboard/focus behavior from Story 1.2,
- typography hierarchy,
- accessibility semantics,
- responsive behavior.

### Rule

> If Backstage integration causes an observable change in the product experience, treat it as a regression first, not as an automatic redesign opportunity.

If an unavoidable host constraint requires a visible change, stop and raise it for PO review.

---

## 6. Do not let plugin CSS contaminate Backstage

Story 2.1 identified a real integration risk: the standalone bootstrap currently loads Tailwind globally, including global reset/preflight behavior.

That is acceptable for the standalone app because it owns its page.

It is not acceptable for a plugin to reset or restyle the entire Backstage application.

Story 2.3 must establish a plugin-safe styling strategy.

Required outcome:

- ServiceLog visual styling is available inside the Backstage plugin.
- No Tailwind preflight/global reset leaks into unrelated Backstage pages.
- No ServiceLog `body`, `html`, universal-selector, heading, button, link, or font rule changes host UI outside ServiceLog.
- Host Backstage typography/navigation remains unchanged after visiting ServiceLog.
- ServiceLog itself remains visually consistent with V1.

Implementation discretion includes scoped CSS, a preflight-free Tailwind build, wrapper-scoped rules, CSS Modules, or another maintainable approach.

Do **not** perform an unrelated visual redesign or broad Tailwind-to-another-library migration merely because Story 2.3 needs style containment.

---

## 7. Remove MUI v4 from the host-neutral product core

Story 2.1 also identified one remaining host-neutral-core dependency on Material UI v4:

```text
ServiceDetailDrawer
  ├── Modal from @material-ui/core v4
  └── Tooltip from @material-ui/core v4
```

The standalone shell may keep Material UI v4 if useful for the standalone demo.

The shared ServiceLog product core must not force a Backstage host to install or mount MUI v4 solely for these two primitives.

Story 2.3 must remove that dependency from the shared core while preserving the accepted Story 1.2 behavior.

Implementation options may include:

- host-neutral React/CSS dialog and tooltip primitives,
- another lightweight host-neutral implementation,
- a carefully designed abstraction that does not make the product core depend on Backstage APIs.

Do not solve this by embedding an extra MUI v4 ThemeProvider inside the Backstage plugin.

### Behavior that must remain intact

Dialog:

- correct dialog semantics,
- focus moves inside on open,
- focus is contained while open,
- Escape closes,
- backdrop close remains if currently supported,
- focus returns to the exact card trigger,
- sticky header/footer do not obscure focused elements.

Disabled-request explanation:

- Divest and Prohibited remain non-requestable,
- tooltip/explanation remains mouse and keyboard accessible,
- minimum 14px tooltip text remains,
- no V1 wording regression.

---

## 8. React must not be duplicated inside the plugin

The current standalone app originated on React 17. Modern Backstage hosts may use React 18 or later.

The plugin package must use the target host's React runtime rather than bundling a second React copy.

Required:

- React/ReactDOM are treated according to normal Backstage/plugin package conventions,
- no `ReactDOM.render` entry point exists inside the plugin package,
- no duplicate-React hooks/runtime error,
- shared ServiceLog components work in both the standalone host and the Backstage harness.

Do not upgrade the standalone app solely to match a hypothetical Backstage version unless required for shared-code compatibility.

---

## 9. Backstage integration does not require Catalog ingestion in this story

Story 2.2 deliberately created **Backstage-shaped** YAML rather than claiming the documents are already Backstage-Catalog-ready.

Real Backstage `Resource` entities require ownership metadata such as `spec.owner`. We do not have approved real owner values and must not invent them.

Therefore Story 2.3 must not block the plugin experiment on native Software Catalog ingestion.

The initial integration may use a small Backstage backend/data adapter that serves validated normalized `Service[]` from the Story 2.2 YAML source.

Conceptually:

```text
CSP YAML
   ↓
Story 2.2 schema validation
   ↓
normalization
   ↓
Backstage backend/data adapter
   ↓
Service[]
   ↓
Backstage frontend wrapper
   ↓
ServiceLogFeature
```

Native Catalog entity ingestion, entity relationships, search graph integration, and real `spec.owner` population remain a follow-on milestone unless the target team provides approved owner values and explicitly asks to include Catalog integration now.

---

# Scope and Checkpoints

## Checkpoint A — Target-host compatibility record

Before hard-wiring Backstage APIs, document the target environment.

Record at minimum:

1. Backstage version or closest available host/harness version.
2. New, legacy, or hybrid frontend system.
3. React version.
4. UI stack in active use: MUI v4/v5, Backstage UI, or mixed.
5. Package manager/workspace convention.
6. Frontend plugin package convention.
7. Backend plugin convention.
8. Routing/navigation convention.
9. Authentication expectations for frontend-to-backend calls.
10. Any relevant CSP/YAML deployment constraints discovered.

### If the real target host is unavailable

Do not invent facts about it.

Instead:

- create a documented experimental Backstage harness using a current supported Backstage configuration,
- label the compatibility result as **experiment/harness compatibility**, not production-host certification,
- keep the adapter boundary thin so the carbon team can wire the plugin to its actual host with minimal change.

### Checkpoint A acceptance

- Compatibility record is in the PR or repository documentation.
- Selected frontend-system path is explicitly stated.
- No target-host upgrade is required by default.
- Any unresolved host assumptions are clearly called out.

---

## Checkpoint B — Make the shared UI core plugin-safe

Resolve the two known integration risks without redesigning ServiceLog.

### B1. Styling containment

Prove that ServiceLog styles do not affect unrelated host UI.

At minimum test:

```text
Backstage page A
      ↓
navigate to ServiceLog
      ↓
navigate to unrelated Backstage page B
```

Page B must not inherit a ServiceLog reset, font, button style, link style, or layout side effect.

### B2. MUI v4 isolation/removal from the core

Remove `@material-ui/core` v4 usage from shared product components.

The standalone shell may continue using v4 independently.

### B3. Product parity

After B1/B2, verify the accepted Story 1.2 dialog/focus/tooltip behavior and V1 visual geometry before proceeding.

### Checkpoint B acceptance

- Shared ServiceLog feature has no required MUI v4 runtime dependency.
- Backstage does not receive global Tailwind/preflight contamination.
- No visible redesign is introduced.
- Standalone Vercel/local experience remains intact.

---

## Checkpoint C — Scaffold and run a real Backstage frontend plugin

Create a real plugin package following the selected target-host frontend convention.

Exact folder names/package names are implementation discretion, but this must be a genuine Backstage plugin package rather than a mock React page that merely looks like Backstage.

### Required frontend behavior

- Plugin has a stable plugin id, recommended `servicelog` unless repository convention dictates otherwise.
- Plugin exposes a routable ServiceLog page.
- Page renders the shared `ServiceLogFeature`.
- Backstage provides its own shell/navigation around the feature.
- Standalone Sidebar is not imported into the plugin package.
- No standalone `index.html`, Vite bootstrap, or `ReactDOM.render` is required by the plugin package.
- An isolated plugin dev harness should be retained when supported by the selected Backstage tooling so developers can hot-reload the plugin without running the entire platform.

### New frontend system guidance

If Checkpoint A identifies the new frontend system, use the supported current plugin/page-extension approach rather than legacy APIs by habit.

### Legacy frontend system guidance

If Checkpoint A identifies a legacy host, use the supported legacy plugin/routable-extension approach. Do not force a host migration inside this story.

### Checkpoint C acceptance

- Plugin package builds.
- Plugin loads inside a real Backstage harness/host.
- ServiceLog is reachable at a route.
- Backstage chrome surrounds ServiceLog exactly once.
- Standalone root app still builds and runs separately.

---

## Checkpoint D — Backstage data adapter / minimal backend seam

The frontend plugin must not use Vite `import.meta.glob` to reach local YAML.

Create the smallest Backstage-appropriate data path that preserves the Story 2.2 contract.

Preferred shape:

```text
Backstage frontend adapter
        ↓ HTTP / Backstage API boundary
Backstage backend plugin/route
        ↓
Story 2.2 YAML + shared validator/normalizer
        ↓
Service[]
```

A conceptual frontend interface is sufficient:

```ts
interface ServiceDataSource {
  getServices(): Promise<Service[]>;
}
```

Exact naming is implementation discretion.

### Requirements

- Backstage-specific discovery/auth/API usage stays in the Backstage adapter/wrapper.
- `ServiceLogFeature` still receives plain `Service[]`.
- `ServiceOfferingsPage`, `FilterBar`, `ServiceCard`, and `ServiceDetailDrawer` do not call Backstage APIs.
- The same Story 2.2 schema/normalization logic is reused, not copied into a second implementation.
- Invalid metadata does not silently produce a partial catalog.
- Error responses are actionable for developers.
- Use the target host's normal authentication expectations for backend access.
- Do not create an open unauthenticated production-style route merely because it is easy in the experiment.

### Loading/error experience

The Backstage wrapper may add a minimal loading and error boundary because the Backstage data path is asynchronous.

Keep it deliberately small and consistent with the host.

Do not redesign the ServiceLog main page or introduce dashboard-style loading UX.

### Checkpoint D acceptance

- Backstage page obtains all 76 services through the Backstage data seam.
- Frontend plugin does not load YAML with Vite APIs.
- Standalone host continues using its own Story 2.2 YAML adapter.
- Both hosts feed the same normalized `Service[]` contract into the same UI core.

---

# Required Regression Verification

Before PO acceptance, document all results in the PR.

## Standalone

1. `npm run validate:metadata` passes for all 76 services.
2. Root standalone tests pass.
3. Root standalone build passes.
4. Vercel/local standalone preview still renders the stakeholder Sidebar.
5. Standalone still displays all 76 services.
6. No visible V1 regression is introduced by styling containment or MUI-core removal.

## Backstage

7. Backstage plugin package builds successfully.
8. Backstage harness/host starts with the plugin installed.
9. ServiceLog route is reachable through Backstage.
10. Backstage page loads all 76 services through the Backstage data adapter.
11. No duplicate React/runtime hook errors.
12. No MUI v4 dependency is required by the shared ServiceLog feature.
13. No ServiceLog global CSS reset affects an unrelated Backstage page.
14. Host navigation/theme remains intact before and after visiting ServiceLog.
15. No nested/duplicate application theme provider is introduced by the plugin.

## Product parity in Backstage

16. Search works.
17. Provider filters work.
18. Category multi-select works.
19. Single-category flat view and multi-category grouped view work.
20. TRM filters work.
21. Card / `View details` opens the side-panel.
22. Independent TRM card link does not open the side-panel.
23. Restricted detail shows TRM Restriction Owner.
24. Divest and Prohibited remain non-requestable with the correct explanation.
25. Detail-panel focus entry/trap/close/return works.
26. Amazon End User Messaging long onboarding content remains readable and scrollable.
27. Story 1.2 accessibility semantics remain intact.
28. Narrow/constrained Backstage content widths do not cause destructive horizontal overflow.

## Architecture checks

29. Standalone Sidebar is absent from the Backstage plugin dependency tree/runtime.
30. No duplicate ServiceLog UI implementation exists.
31. No duplicate metadata catalog exists.
32. No raw YAML object reaches a product UI component.
33. No Vite-specific YAML loading code exists inside the Backstage plugin frontend.
34. Any target-host assumptions or unresolved integration constraints are documented.

---

# Explicitly Out of Scope

Do not do the following unless a blocker makes PO review necessary:

- Do not redesign ServiceLog V1.
- Do not remove standalone mode.
- Do not remove the standalone stakeholder Sidebar.
- Do not make the Backstage plugin render the standalone Sidebar.
- Do not force a Backstage upgrade.
- Do not force a React upgrade in the standalone host merely for aesthetic consistency.
- Do not migrate the whole product to Backstage UI merely because BUI exists.
- Do not perform a broad MUI/Tailwind redesign.
- Do not invent `spec.owner` values.
- Do not claim native Backstage Catalog integration unless real Catalog ingestion is actually implemented and verified.
- Do not add Catalog graph/search/entity relationships in this story by default.
- Do not invent real Service Owners, emails, ServiceNow routes, Jira groups, or documentation destinations.
- Do not activate currently inert prototype links/actions.
- Do not change filter semantics.
- Do not change TRM policy.
- Do not change Story 1.1/1.2 product rules.
- Do not maintain separate standalone and Backstage copies of the service cards, filters, or side-panel.

---

# Definition of Done

Story 2.3 is complete when:

1. The target/harness Backstage compatibility profile is documented.
2. A genuine Backstage frontend plugin package renders ServiceLog.
3. A Backstage data seam supplies validated normalized `Service[]` to that plugin.
4. The shared ServiceLog core no longer requires MUI v4.
5. ServiceLog styles do not contaminate the Backstage host.
6. The standalone stakeholder demo remains fully functional and independently runnable.
7. There is still one ServiceLog UI implementation and one YAML metadata source.
8. All 76 services appear in both hosts.
9. Story 1.2 accessibility behavior survives the integration.
10. The V1 experience remains materially unchanged unless a PO-approved host constraint requires otherwise.
11. Build/test/validation evidence for both hosts is documented in the PR.

---

## Output Style
- No preamble before tool calls. Do not narrate what you're about to do.
- Don't restate the task before starting.
- Skip "I'll start by..." / "Let me..." framing entirely.
- Lead with results, not process narration.
- After finishing, summarize only what changed — don't re-explain the plan.
- These instructions affect communication style only. They MUST NOT reduce the quality, rigor, completeness, testing, validation, reasoning, or implementation depth of the work.
- High-quality output remains mandatory. Be concise in narration, not in execution.
