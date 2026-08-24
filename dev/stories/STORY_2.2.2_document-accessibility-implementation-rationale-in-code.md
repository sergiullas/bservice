# STORY 2.2.2 — Document Accessibility Implementation Rationale in Code

**Status:** Ready for development  
**Date:** 2026-08-24  
**Repository:** `sergiullas/bservice`  
**Decision state:** PO-approved carbon-team handoff request  

---

## Story Intent

The carbon team asked for the ServiceLog implementation to be easier to understand during integration and maintenance, with particular emphasis on the accessibility work: **what the code is doing and why the implementation exists.**

The accessibility behavior is already implemented and approved. This story does not redesign or re-implement it. It adds durable, targeted inline documentation around the non-obvious decisions that a future maintainer could otherwise simplify, remove, or replace without understanding the accessibility consequence.

### North Star

> **Explain the accessibility decisions that are easy to break, without turning the source code into a transcript.**

This is a code-documentation story only.

---

# Interpretation of the Carbon-Team Request

“Comment the code” means **add explanatory source comments**.

It does **not** mean comment out, disable, or remove working accessibility code.

Comments should primarily explain **why** an implementation exists. Do not add comments that merely restate obvious syntax.

Good:

```tsx
// The card has two independent actions: opening details and the TRM link.
// Keep the whole-card button and TRM link as siblings so we never nest one
// interactive control inside another.
```

Not useful:

```tsx
// This is a button.
<button ... />
```

---

# Source of Truth for Accessibility Rationale

Use the original ServiceLog accessibility work as the historical reference:

- Repository: `sergiullas/servicelog`
- Story: `dev/stories/STORY_1.2_accessibility-main-view-and-service-detail-panel.md`
- Accessibility PR: `sergiullas/servicelog#12`

PR #12 changed these five files and they are the primary scope for this story:

1. `src/app/components/ServiceCard.tsx`
2. `src/app/components/FilterBar.tsx`
3. `src/app/components/ServiceOfferingsPage.tsx`
4. `src/app/components/ServiceDetailDrawer.tsx`
5. `src/styles/theme.css`

Do not invent new accessibility rationale. Comments must describe the behavior that already exists and the reason established by Story 1.2 / the approved V1 interaction model.

---

# PO-Locked Documentation Principles

## 1. Comment the decision, not every ARIA attribute

The goal is not to place a comment above every `aria-*` property.

Group related behavior and explain the architectural reason once where practical.

Examples of useful rationale:

- why the card is an `article` with a whole-card overlay button and a separate TRM link;
- why the primary card button is named with the service heading plus `View details`;
- why decorative provider/status icons are hidden from assistive technology;
- why card heading level changes between grouped and flat layouts;
- why Category uses a real checkbox under a custom visual control;
- why Escape returns focus to the Categories trigger;
- why result-count announcements are delayed/debounced;
- why the dialog manually manages focus containment and focus return;
- why the page heading has `tabIndex={-1}` as a safe fallback focus target;
- why a non-requestable ServiceNow CTA uses a focusable `aria-disabled` wrapper rather than a native disabled button;
- why definition-list semantics are used for term/value metadata;
- why disclosure controls use `aria-expanded` + `aria-controls`;
- why semantic HTML is allowed to differ from the visual typography hierarchy.

Do not add prose for self-explanatory implementation details.

---

## 2. Preserve behavior exactly

No accessibility behavior should change in this story.

Do not intentionally change:

- card interaction architecture;
- accessible names;
- heading levels;
- tab order;
- focus styling;
- Category checkbox behavior;
- Escape behavior;
- live-region behavior;
- dialog naming;
- focus entry, trapping, close, or return;
- `aria-expanded` / `aria-controls` relationships;
- `aria-hidden` treatment;
- disabled request behavior;
- tooltip behavior;
- contrast values;
- visual styling;
- layout or copy.

### Regression rule

> If runtime behavior or stakeholder-visible UI changes while adding comments, treat it as a regression.

---

## 3. Explain accessibility in product language where possible

Comments should be understandable to a developer who did not participate in the original accessibility story.

Prefer:

```tsx
// Returning focus to the exact opener lets keyboard users continue from the
// card they were working with instead of being dropped at the top of the page.
```

over unexplained standards shorthand such as:

```tsx
// WCAG focus requirement.
```

WCAG references may be included when useful, but the practical interaction reason should remain clear.

---

## 4. Preserve the stakeholder-approved UI principle

The comments should reinforce the approved accessibility philosophy:

> **Accessibility enhancements preserve the stakeholder-approved UI. Visible changes should improve clarity or usability for everyone. Assistive-technology support should primarily come from correct semantics, interaction behavior, focus management, and accessibility metadata rather than unnecessary visual redesign.**

Do not imply that semantic elements such as headings, lists, `dl/dt/dd`, or buttons must inherit browser-default visual styling. The visual presentation is intentionally controlled separately from the semantic structure.

---

# Required Comment Areas

## A. `ServiceCard.tsx`

Add concise rationale around the non-obvious card interaction architecture.

The comments should explain:

1. **Semantic card + sibling actions**
   - The card surface is non-interactive (`article`).
   - The primary whole-card action is an overlay button.
   - TRM is an independent sibling link above that layer.
   - This preserves whole-card clickability without nesting interactive controls.

2. **Primary accessible name**
   - `aria-labelledby` combines the visible service heading with the visible `View details` action.
   - This produces a concise service-identity + action name rather than causing the entire card body to be announced as the button name.

3. **Dynamic heading level**
   - Grouped view: category is `h2`, service is `h3`.
   - Flat single-category view: service becomes `h2`.
   - Typography remains visually unchanged.

4. **Decorative content**
   - Provider logo is redundant because provider text is visible.
   - Status dot and arrow are redundant because adjacent text communicates their meaning.
   - `aria-hidden` prevents duplicate/noisy announcements.

Do not comment each individual `aria-hidden` line if one nearby comment explains the pattern clearly.

---

## B. `FilterBar.tsx`

Add concise comments explaining:

1. **Native checkbox beneath custom Category visuals**
   - Visual styling is custom, but the programmatic control remains a real checkbox so checked state and Space-key behavior are native and reliable.

2. **Category disclosure relationship**
   - `aria-expanded` communicates open/closed state.
   - `aria-controls` identifies the controlled panel.

3. **Escape + focus return**
   - Escape closes the Category panel and restores focus to the trigger so keyboard users do not lose their place.

4. **Pressed filter pills**
   - Provider and TRM pills use `aria-pressed` because each behaves as a toggle button.

5. **Result-count live region**
   - The visible count remains normal page text.
   - A separate polite status region announces changes without moving focus.
   - The existing delay/debounce prevents search typing from producing excessive spoken announcements on every immediate state change.

6. **Decorative icons**
   - Search, chevrons, X icons, checkmark presentation, and status dots should not duplicate the accessible names/states already carried by their controls.

---

## C. `ServiceOfferingsPage.tsx`

Add comments explaining:

1. **Exact opener tracking**
   - `triggerRef` records the specific card action that opened the dialog so focus can return to the same place when it closes.

2. **Fallback focus target**
   - The page heading is programmatically focusable with `tabIndex={-1}` but not added to normal tab order.
   - It is used only when the original card is no longer available, such as after filter state changes.

3. **Heading hierarchy by layout mode**
   - The card heading level changes depending on grouped vs flat rendering to preserve a coherent semantic hierarchy while keeping the same visual styling.

Do not add focus-moving behavior to the empty state. Existing result feedback is intentionally handled without unexpected focus movement.

---

## D. `ServiceDetailDrawer.tsx`

This file already contains several good rationale comments. Preserve them and fill only the remaining meaningful gaps.

Existing comments that should remain include the rationale for:

- inert prototype links;
- MUI tooltip font-size override;
- the focusable `aria-disabled` ServiceNow wrapper;
- manual focus containment instead of MUI v4 `Unstable_TrapFocus` behavior;
- callback-ref initial focus and focus restoration.

Add or improve concise comments where needed to explain:

1. **Dialog semantics**
   - `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` make the visible service-name heading the dialog's accessible name.

2. **MUI focus flags**
   - `disableAutoFocus`, `disableRestoreFocus`, and `disableEnforceFocus` are intentional because this component performs those responsibilities explicitly.
   - They must not be removed independently from the manual focus-management implementation.

3. **Description disclosure**
   - `View more / View less` appears only when the clamped description actually overflows.
   - `ResizeObserver` re-evaluates overflow when available width changes.
   - `aria-expanded` + `aria-controls` expose the disclosure relationship programmatically.

4. **Metadata semantics**
   - `dl/dt/dd` represent label/value metadata without changing the visible design.

5. **Decorative icons**
   - Icon glyphs inside already-named controls/links are hidden to avoid redundant announcements.

Do not duplicate explanations that are already clear and accurate.

---

## E. `src/styles/theme.css`

Document the accessibility-related styling decisions that are non-obvious from the CSS alone.

At minimum explain:

1. Semantic elements are visually normalized so choosing correct HTML semantics does not accidentally alter stakeholder-approved typography through browser defaults.
2. `.metadata-label` provides one consistent visual treatment across semantic elements such as headings or `dt`, allowing semantics and appearance to remain independent.
3. Any contrast-related values intentionally changed for Story 1.2 should be identified as accessibility/readability values, not arbitrary palette drift.

Do not add comments to every token or Tailwind utility.

---

# Optional Comment Areas

If implementation review finds another non-obvious accessibility safeguard directly related to Story 1.2, it may be documented in place.

Do not expand this into commentary across unrelated generated UI components or third-party/shadcn primitives.

The target is the ServiceLog product code and the accessibility decisions the carbon team must preserve during integration.

---

# Comment Style

Use short comments placed immediately before the relevant implementation block.

Preferred:

```tsx
// Keep the TRM link above the full-card action layer. Both actions must remain
// siblings so clicking TRM never triggers View details and interactive
// controls are never nested.
```

Avoid large essay comments inside JSX.

For a larger implementation mechanism, a 3–6 line comment is acceptable if it prevents a future maintainer from accidentally removing important behavior.

Avoid comments that:

- merely translate code into English;
- cite a standard without explaining the interaction consequence;
- describe temporary implementation history with no maintenance value;
- repeat the same rationale on every occurrence;
- become inaccurate if service data changes.

---

# Acceptance Criteria

1. The five Story 1.2 implementation files have been reviewed for non-obvious accessibility behavior.
2. `ServiceCard.tsx` explains the sibling-action card architecture, accessible naming, heading-level behavior, and decorative-content strategy.
3. `FilterBar.tsx` explains native checkbox semantics, disclosure state, Escape focus return, toggle state, live-region behavior, and decorative icons.
4. `ServiceOfferingsPage.tsx` explains opener tracking, fallback focus, and semantic heading hierarchy.
5. `ServiceDetailDrawer.tsx` preserves existing high-value comments and documents any remaining non-obvious dialog/disclosure/semantic behavior without duplicating explanations.
6. `theme.css` explains why semantic elements are visually normalized and why metadata/contrast styling exists.
7. Comments explain **why**, not merely **what**.
8. No working code is commented out or disabled.
9. No user-visible copy changes.
10. No UX, interaction, accessibility, data, or styling behavior changes.
11. No new dependencies.
12. Existing tests pass.
13. `npm run build` passes.
14. `npm run validate:metadata` passes.
15. A quick keyboard smoke test confirms card opening, TRM independence, Category Escape/focus return, and dialog focus entry/return remain unchanged.

---

# Out of Scope

- redesigning accessibility behavior;
- fixing unrelated accessibility findings;
- changing WCAG target or interpretation;
- adding a new accessibility framework/library;
- replacing MUI v4;
- Backstage plugin implementation;
- changing YAML metadata;
- changing ServiceLog visual design;
- adding comments throughout generated or unused UI primitives;
- rewriting Story 1.2 documentation.

---

# Definition of Done

Story 2.2.2 is complete when:

1. The carbon team can read the primary ServiceLog accessibility implementation and understand the non-obvious **what and why** directly from the source.
2. Comments are concentrated around decisions that could be accidentally broken during integration or refactoring.
3. Existing comments that already explain rationale are preserved rather than duplicated.
4. The runtime diff is documentation-only: source comments/formatting may change, product behavior must not.
5. Build, tests, metadata validation, and the small keyboard smoke check all pass.

---

## Product / architecture summary

Before:

```text
Accessible behavior exists
        ↓
rationale mostly lives in Story 1.2 / PR history
```

After:

```text
Accessible behavior exists
        ↓
critical rationale lives beside the code
        ↓
carbon team can integrate/refactor without guessing
```

The goal is not more comments. The goal is fewer accidental accessibility regressions.
