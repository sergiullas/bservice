# STORY 1.2 - Accessibility: Main View and Service Detail Panel

**Status:** Ready for development  
**Date:** 2026-08-21  
**Target:** WCAG 2.2 Level AA, where applicable  
**Sequence:** Checkpoint A - Main View first, then Checkpoint B - Service Detail Panel  

## Purpose

Make the ServiceLog prototype meaningfully accessible without redesigning the stakeholder-approved UI.

This story covers the Service Offerings main view first, including cards and filters, followed by the Service Detail side-panel.

The goal is not to create a separate experience for assistive-technology users. The goal is to make the existing experience stronger for everyone while adding the semantics, keyboard behavior, focus management, and accessibility metadata needed by users who rely on assistive technology.

## Product Principle: Everyone

**Accessibility enhancements must preserve the stakeholder-approved UI. Visible changes should improve clarity or usability for everyone.**

Use this rule when evaluating every change in this story:

> Does this make the experience clearer, easier, or more usable for everyone while preserving the approved visual direction?

Visible changes should be deliberate and broadly useful. Accessibility support that does not require a visual change should be implemented through correct HTML semantics, keyboard behavior, focus management, ARIA, accessible naming, and assistive-technology support.

Do not redesign working UI simply to make it look more "accessible."

Approved examples:

- Adding `cursor: pointer` to a clickable card improves affordance for everyone.
- Making TRM Status a consistent link in both the card and side-panel improves consistency for everyone.
- Increasing the ServiceNow-disabled-state tooltip text from the current hard-to-read size improves readability for everyone.
- Correcting insufficient text or control contrast improves readability for everyone when needed to meet AA.
- Replacing the existing keyboard-focus treatment merely to make it look like hover is not approved.
- Adding visible labels, icons, borders, or instructions solely for assistive technology is not approved unless there is a clear usability benefit for everyone.

---

## Scope and Delivery Model

Story 1.2 is one accessibility story with two implementation checkpoints.

### Checkpoint A - Main View

Includes:

- Service cards
- Search
- Provider filters
- Category multi-select
- TRM filters
- Selected-category chips
- Results count and empty state
- Main-view keyboard order, semantics, contrast, zoom/reflow, and icon treatment

**PO review is required after Checkpoint A before beginning Checkpoint B.**

### Checkpoint B - Service Detail Panel

Includes:

- Dialog semantics
- Focus entry, containment, and return
- Keyboard operation
- Heading and metadata semantics
- TRM, Service Owner, TRM Restriction Owner, Documentation, and other links
- Approval Workflow disclosure
- Divest and Prohibited ServiceNow CTA behavior and tooltip
- Tooltip readability
- Zoom/reflow and sticky header/footer focus behavior

Recommended development workflow:

```text
one story
one branch
Checkpoint A commit(s)
PO review
Checkpoint B commit(s)
one PR
final accessibility review
```

Do not combine this story with the Tailwind-to-MUI visual migration or unrelated product changes.

---

# CHECKPOINT A - MAIN VIEW

## A1. Service Card Interaction Architecture

### Current problem

The current `ServiceCard` is implemented as one `<button>` containing the service heading, provider, TRM status, description, and View details affordance.

That architecture becomes invalid once TRM Status is also an independent link because interactive elements must not be nested inside another button.

### Approved card model

Treat each service card as a small accessible card surface with:

1. A semantic card container.
2. One primary whole-card action: View details.
3. One independent secondary action: TRM Status.

Conceptually:

```text
SERVICE CARD SURFACE

Service Name
Provider

TRM Status: Restricted   <- independent link

Description

View details ->           <- primary card action
```

The whole card remains clickable for View details, except where the user activates the independent TRM link.

### Required implementation behavior

- Use a semantic non-interactive card container such as `<article>`.
- Preserve the existing visual card design and geometry.
- Preserve whole-card clickability for the primary View details action.
- Do not place the TRM link inside a `<button>` or other interactive parent.
- Use a non-nested interaction architecture, for example a primary interaction layer/button associated with the visible card content plus a separately layered TRM link.
- MUI v4 card/button primitives may be used if useful, but they must preserve the approved appearance and must not create nested interactive controls.
- The service name remains a real heading, not text hidden inside a button-only semantic structure.

### Mouse affordance

User feedback identified that the clickable card does not currently communicate clickability clearly enough.

Required:

```css
cursor: pointer;
```

for the card's primary clickable surface.

Preserve the existing hover elevation/shadow unless there is a concrete reason to adjust it.

Hover and keyboard focus are intentionally different interaction states. **Do not make them visually identical.**

The existing keyboard-focus affordance is approved and should be preserved unless a WCAG failure is demonstrated.

If the team proposes an additional visible hover treatment beyond pointer + the existing elevation, keep it subtle and raise it for PO review rather than redesigning the card state.

### Card primary-action accessible name

Do not create long hard-coded labels such as:

```text
View governance details for [very long official service name plus other metadata]
```

The accessible name should combine only:

```text
service identity + action
```

Preferred result for assistive technology:

```text
Amazon SageMaker, View details
```

Use the visible service heading as the source of the service identity when practical, for example with `aria-labelledby` or an equivalent semantic association.

Do not duplicate provider, description, TRM status, category, or other card metadata into the primary action's accessible name.

Do not truncate or invent abbreviations for the accessible service name merely because an official service name is long. If a future approved short name exists, that can be modeled separately in another story.

### Card keyboard behavior

- The primary View details action must be reachable by keyboard.
- `Enter` and `Space` must activate it when it is implemented as a button.
- Preserve a clear visible keyboard-focus indicator.
- Focus order inside each card must be predictable.
- The card's secondary TRM link must be reachable independently.
- Activating the TRM link must not open the side-panel.

---

## A2. TRM Status as an Independent Link

Stakeholder feedback requires TRM Status on the card to behave consistently with TRM Status in the side-panel.

Required card treatment:

```text
TRM Status: Permitted
TRM Status: Restricted
TRM Status: Divest
TRM Status: Prohibited
```

The existing status color/dot/text treatment may be preserved, but the status treatment must become a link affordance.

Because this is a prototype:

```tsx
href="#"
```

or equivalent inert prototype behavior is required, with navigation prevented.

Do not navigate to the real `trmLink` yet.

Requirements:

- TRM remains visually identifiable as status information.
- The textual status remains present, so meaning is not conveyed by color alone.
- The link has a visible keyboard-focus treatment.
- The accessible name should remain concise and should identify the TRM status/action without repeating the card description.
- The status dot/icon is decorative when the adjacent text already communicates the status and should not create duplicate screen-reader output.

---

## A3. Card Semantics and Reading Structure

Preserve the visible hierarchy while correcting the semantic structure.

Expected page/card hierarchy:

```text
h1  Service Offerings
  h2  Category name, when grouped
    h3  Service name
```

For flat single-category results, card headings should still remain structurally coherent beneath the page heading. Do not change visible typography merely to satisfy heading semantics.

Provider logos are decorative because the provider name is already displayed as text. Mark the SVGs appropriately so they do not create duplicate or meaningless announcements.

Decorative icons inside controls should be hidden from the accessibility tree when the control already has an accessible name.

---

## A4. Search and Filter Controls

### Search

- Keep the current visible search design.
- Search must have a persistent programmatic label. Placeholder text is not the accessible label.
- Search icon is decorative.
- Verify placeholder text meets WCAG AA text contrast. If it does not, darken it minimally while preserving the approved palette.

### Provider filters

- Preserve the current pill design.
- Preserve `aria-pressed` or equivalent programmatic selected state.
- Keyboard focus must be visible.
- Selected state must remain understandable without relying on inaccessible color differentiation.

### Category multi-select

The visible checkbox-like state must also expose a real programmatic checked/selected state.

Acceptable approaches include:

- real checkbox semantics styled to preserve the existing design, or
- another valid multi-select pattern whose semantics accurately match the visible behavior.

Do not leave the current visual check square as the only indication of programmatic state.

The Categories trigger must expose expanded/collapsed state and an explicit relationship to the controlled panel when appropriate.

When `Escape` closes the Category panel:

1. close the panel, and
2. return focus to the Categories trigger.

Outside-click dismissal should continue to work.

Do not introduce menu keyboard semantics such as arrow-key-only navigation unless the implementation actually adopts the complete corresponding ARIA menu pattern.

### Selected-category chips

- Remove buttons remain keyboard operable.
- Each remove button must retain a concise accessible name such as `Remove Analytics filter`.
- Decorative X icons must not be announced redundantly.
- Focus must remain visible.

### TRM filters

- Preserve textual TRM status labels.
- Preserve programmatic pressed/selected state.
- Do not rely on dot color alone.
- Keep focus visible.

---

## A5. Results Feedback and Empty State

The visible `Showing X of Y service offerings` text should remain.

Changes in result count caused by search/filter actions should be available to screen-reader users without forcing focus to move. Use an appropriate polite live-region/status pattern if needed.

The empty-state message and Clear all control must:

- meet text contrast requirements,
- remain keyboard accessible,
- preserve visible focus,
- not create unexpected focus movement when filters change.

Do not add intrusive spoken announcements on every keystroke if doing so makes search noisy. Prefer concise status updates.

---

## A6. Main-View Contrast, Zoom, Reflow, and Target Size

Audit the approved UI rather than assuming current colors pass.

At minimum verify:

- normal text contrast,
- placeholder contrast,
- status/chip text contrast,
- interactive control boundaries where required,
- focus indicators,
- disabled states where present,
- hover/selected states where their distinction is necessary to understand the control.

Contrast corrections should use the smallest visual adjustment that achieves AA and preserves the approved palette.

Verify the main view at:

- 200% browser zoom,
- 400% browser zoom / approximately 320 CSS px viewport width,
- increased text spacing consistent with WCAG 1.4.12.

No information or controls may become unavailable because of clipping or overlapping. Horizontal page scrolling should not be required for ordinary ServiceLog content at reflow sizes.

Interactive targets should meet WCAG 2.2 AA target-size requirements where applicable. Do not enlarge already-usable controls merely for visual preference.

---

## Checkpoint A Acceptance Criteria

Checkpoint A is ready for PO review when all of the following are true:

1. Whole-card View details interaction is preserved without using an invalid nested-interactive structure.
2. Card hover communicates clickability with a pointer cursor.
3. Existing keyboard-focus styling is preserved and remains clearly visible.
4. Hover and focus remain intentionally distinct states.
5. TRM Status is an independent, keyboard-accessible inert prototype link on every card.
6. Activating the TRM link does not open the service detail panel.
7. Service headings remain real semantic headings.
8. The primary card action gets its accessible identity from the service name + View details action without duplicating the full card content.
9. Provider logos and redundant icons do not create noisy duplicate announcements.
10. Search has a real programmatic label.
11. Provider and TRM filter selection state is programmatically exposed.
12. Category multi-select state is programmatically exposed and matches the visible checkbox-like state.
13. Escape closes the Category panel and returns focus to the Categories trigger.
14. Filter chips and Clear all remain fully keyboard operable.
15. Result count/empty-state feedback is available without unexpected focus movement.
16. Applicable main-view text and controls meet WCAG 2.2 AA contrast requirements.
17. Main view passes keyboard-only operation.
18. Main view remains usable at 200% and 400% zoom/reflow.
19. No stakeholder-approved card/filter layout is redesigned as part of the accessibility work.
20. PO reviews and accepts Checkpoint A before Checkpoint B begins.

---

# CHECKPOINT B - SERVICE DETAIL PANEL

## B1. Dialog Behavior and Focus Management

The side-panel represents a modal service-detail dialog and must behave like one, not merely look like one.

The current `role="dialog"` and `aria-modal="true"` treatment should be preserved or replaced by an equivalent accessible MUI v4 modal/dialog primitive.

Required behavior when opening from a service card:

1. Record the exact primary card action that opened the panel.
2. Open the panel.
3. Move keyboard focus into the panel.
4. Preferred initial focus target: the Close button, unless implementation evidence shows another first focus target is materially better.
5. Keep keyboard focus within the modal while it is open.
6. Prevent background page content from remaining keyboard-interactive while the modal is open.

Required behavior when closing by Close, Escape, backdrop, or other supported close mechanism:

1. close the panel, and
2. return focus to the exact card primary action that opened it.

If the originating card no longer exists because application state changed, use a safe logical fallback rather than throwing an error or losing focus.

`Escape` must continue to close the panel.

MUI v4 modal/focus-management primitives may be used if they preserve the existing visual design and behavior.

---

## B2. Dialog Naming and Heading Structure

The dialog must have an accessible name derived from the visible service name.

Prefer an association with the visible service heading rather than duplicating a long `aria-label` when practical.

Expected semantic structure:

```text
Dialog title: Service Name

Overview
Governance & Compliance
Request & Provisioning
Documentation
```

Preserve the existing visible section typography. Semantic heading levels may be corrected without changing typography.

The current Story 1.1 information architecture is locked and must not be reorganized in Story 1.2:

```text
OVERVIEW
Description
Common use cases
Limitations

GOVERNANCE & COMPLIANCE
FedRAMP Status
Cloud ATO
TRM Restriction Owner, Restricted only

REQUEST & PROVISIONING
Service Owner
Provisioning Model
Funding Approach
Provisioning SLA
Approval Workflow
Onboarding Requirements

DOCUMENTATION
Internal Documentation
External Documentation
```

Accessibility work must not reopen the product grouping decisions from Story 1.1.

---

## B3. Metadata Semantics

Metadata represented as term/value pairs should use valid semantics.

Do not leave orphan `<dt>` or `<dd>` elements outside a `<dl>`.

The current implementation has Approval Workflow and Onboarding Requirements rendered with `dt`/`dd`-style elements outside the primary definition list. Correct the semantic structure while preserving the exact visible layout.

Possible valid patterns include:

- keeping relevant metadata inside a correctly structured `<dl>`, or
- using ordinary headings/labels and content where definition-list semantics do not fit.

Do not change visible labels as part of this correction.

Lists such as Common use cases and Onboarding Requirements should remain real lists when the content is list-like.

---

## B4. Links and Prototype Behavior

The prototype rule from Story 1.1 remains unchanged: links communicate future affordance but must not navigate to operational destinations.

The following are links in the side-panel UI:

- TRM status
- TRM Restriction Owner, when TRM status is Restricted
- Service Owner
- Internal Documentation
- External Documentation

Use `href="#"` plus prevented navigation or an equivalent inert prototype-link approach.

Do not replace these with non-link text solely because the prototype destination is inert. Their intended future semantics remain link semantics.

### TRM Restriction Owner clarification

`trmRestrictionOwner` is an organizational group, not a person.

The future destination may resolve to a Jira group or an Outlook group. The exact system/destination is not part of this prototype.

For Restricted services:

- display the current TRM Restriction Owner group name as a link,
- keep the link inert in the prototype,
- do not invent a Jira URL, Outlook address, group email, or other destination,
- keep the existing `Restricted only` visibility rule.

Requirements for all side-panel links:

- All links are keyboard reachable.
- All links have visible focus treatment.
- Link text provides a meaningful accessible name.
- Service Owner remains a person link. Future implementation may become `mailto:`, but do not invent email addresses in this story.
- TRM Restriction Owner remains a group link. Future implementation may resolve to a Jira or Outlook group, but do not invent destination data in this story.
- External-link icons are decorative when link text already identifies the destination/action.
- TRM dot/status icons are decorative when adjacent text communicates the same status.

---

## B5. View More / View Less Disclosure

Preserve the current description disclosure behavior.

Requirements:

- Keep `aria-expanded`.
- Keep or add `aria-controls` to associate the control with the description region.
- Keyboard activation must work.
- Expanding/collapsing content must not unexpectedly move focus.
- Focused controls must not become obscured behind the sticky header or footer.

---

## B6. Approval Workflow Disclosure

The Approval Workflow control must:

- remain keyboard operable,
- expose `aria-expanded`,
- expose `aria-controls` referencing the expanded content region,
- retain visible focus,
- keep disclosure icons decorative when the text and expanded state already communicate purpose.

The expanded content must remain readable and usable at narrow widths and 400% zoom. The current horizontal Request -> Review -> Decision visualization may wrap or adapt responsively if necessary to prevent clipping. Any adaptation should preserve the same information and visual language.

Do not change approval policy or workflow meaning in this story.

---

## B7. Divest and Prohibited ServiceNow CTA and Tooltip

Two TRM states are non-requestable in this prototype:

```text
TRM = Divest
-> Request via ServiceNow is disabled
-> tooltip: "This service cannot be requested because its TRM status is Divest."

TRM = Prohibited
-> Request via ServiceNow is disabled
-> tooltip: "This service cannot be requested because its TRM status is Prohibited."
```

`Divest` must provide the same disabled-CTA interaction pattern as `Prohibited`. Do not create a second visual pattern for Divest.

For `Permitted` and `Restricted`, Request via ServiceNow remains enabled-looking but prototype-only/inert.

### Tooltip accessibility and readability

The explanation must be available to both mouse and keyboard users.

Because a native disabled button does not receive focus/hover events reliably, the MUI v4 Tooltip may continue to use an appropriate wrapper.

User feedback also identified that the current CTA tooltip text is too small to read comfortably. This is an approved visible accessibility/usability improvement because it benefits everyone.

Required tooltip typography:

```text
font size: 14px minimum
line height: approximately 20px / comfortably readable equivalent
```

Do not shrink tooltip text below 14px to preserve the current MUI default appearance.

The tooltip surface may preserve its current general styling, but:

- tooltip text must meet applicable WCAG AA contrast,
- content must wrap cleanly at narrow widths,
- the tooltip must not obscure the focused control unnecessarily,
- the text must remain readable at 200% and 400% zoom.

CTA/tooltip requirements:

- Divest and Prohibited CTAs are visibly disabled.
- The correct status-specific explanation is available on mouse hover.
- Keyboard users can reach the explanation.
- The focusable tooltip trigger/wrapper has a meaningful accessible identity and does not become a mysterious unnamed tab stop.
- Assistive technology can determine that the action is unavailable and understand why.
- Disabled text/background styling remains readable and meets applicable contrast requirements.
- The CTA text, location, width, and general approved appearance remain unchanged unless a contrast fix is required.

---

## B8. Side-Panel Zoom, Reflow, and Scroll Behavior

Verify the panel at:

- 200% zoom,
- 400% zoom / narrow viewport,
- increased text spacing.

Requirements:

- Content reflows without loss.
- Long service names remain readable.
- Onboarding Requirements remain full width and readable.
- Links and metadata do not overlap.
- TRM Restriction Owner group links remain readable and operable when long.
- Approval Workflow does not force destructive horizontal scrolling.
- Tooltip text remains readable and does not clip.
- Sticky header/footer do not obscure the currently focused control.
- Keyboard users can reach all content and controls without focus being lost during internal scrolling.

---

## Checkpoint B Acceptance Criteria

Checkpoint B is complete when all of the following are true:

1. Opening the panel moves focus into the dialog.
2. Focus is contained within the dialog while open.
3. Background controls are not keyboard interactive while the modal is open.
4. Escape closes the dialog.
5. Closing returns focus to the exact card primary action that opened it.
6. Dialog accessible name is derived from the service name without unnecessary duplication.
7. Section heading structure is coherent and the Story 1.1 IA remains unchanged.
8. Metadata uses valid HTML semantics with no orphan `dt`/`dd` elements.
9. TRM, TRM Restriction Owner when Restricted, Service Owner, Internal Documentation, and External Documentation remain keyboard-accessible inert prototype links.
10. TRM Restriction Owner is represented as a group link, not a person and not plain non-interactive text.
11. Link and disclosure icons do not create redundant announcements.
12. View more/View less exposes expanded state and controlled content.
13. Approval Workflow exposes expanded state and controlled content.
14. Divest CTA is disabled and its explanation is available by mouse, keyboard, and assistive technology.
15. Prohibited CTA is disabled and its explanation is available by mouse, keyboard, and assistive technology.
16. Disabled-state tooltip text is at least 14px with a comfortably readable line height and meets applicable contrast requirements.
17. No unnamed focusable tooltip wrapper/dead tab stop remains.
18. Side-panel focus indicators are not hidden behind sticky UI.
19. Panel remains usable at 200% and 400% zoom/reflow.
20. Applicable panel text and controls meet WCAG 2.2 AA contrast requirements.
21. No Story 1.1 information architecture is reorganized as part of accessibility work.

---

# Accessibility Verification

Automated tooling is useful but does not prove accessibility by itself.

Before Story 1.2 is accepted, verify all of the following.

## Keyboard-only walkthrough

Complete the primary flow without a mouse:

```text
Search
Provider filters
Categories open/select/remove/close
TRM filters
Card primary action
Card TRM link
Open detail panel
Close panel
Reopen panel
TRM link
View more / View less
TRM Restriction Owner link on Restricted service
Service Owner
Approval Workflow
Documentation links
ServiceNow CTA / Divest explanation
ServiceNow CTA / Prohibited explanation
Close and return to originating card
```

No keyboard trap may exist outside the intentional modal focus containment.

## Screen-reader sanity check

Test at least one common desktop screen-reader/browser combination, preferably NVDA with Chrome or Edge on Windows.

Verify:

- page and category headings,
- card service-name/action naming,
- independent TRM link,
- filter selected/checked state,
- result status announcements,
- dialog name,
- dialog focus entry/return,
- link names,
- TRM Restriction Owner group link,
- disclosure expanded/collapsed state,
- Divest disabled CTA explanation,
- Prohibited disabled CTA explanation.

## Automated audit

Run an automated accessibility audit such as axe against:

1. default main view,
2. filtered main view / Categories open,
3. normal service detail panel,
4. Restricted service detail panel,
5. Divest service detail panel,
6. Prohibited service detail panel.

Definition of Done requires **no serious or critical automated accessibility violations introduced or left unresolved in Story 1.2 scope**.

If an automated rule conflicts with a deliberate valid semantic pattern, document the reason rather than applying a visual workaround blindly.

## Contrast verification

Measure actual rendered colors for text, controls, disabled states, tooltip text, and focus indicators in relevant states. Do not approve contrast by visual inspection alone.

## Zoom / reflow verification

Test 200% and 400% browser zoom and increased text spacing.

---

# WCAG 2.2 AA Coverage Areas

This list is a practical coverage guide, not a claim that only these success criteria apply.

Story 1.2 should explicitly consider, where applicable:

```text
1.3.1 Info and Relationships
1.4.1 Use of Color
1.4.3 Contrast (Minimum)
1.4.10 Reflow
1.4.11 Non-text Contrast
1.4.12 Text Spacing
2.1.1 Keyboard
2.1.2 No Keyboard Trap
2.4.3 Focus Order
2.4.7 Focus Visible
2.4.11 Focus Not Obscured (Minimum)
2.5.3 Label in Name
2.5.8 Target Size (Minimum)
3.2.1 On Focus
3.2.2 On Input
4.1.2 Name, Role, Value
4.1.3 Status Messages
```

---

# Out of Scope

Do not use Story 1.2 to:

- redesign the Service Offerings UI,
- reorganize side-panel information architecture,
- replace the stakeholder-approved visual language,
- perform the full Tailwind-to-MUI migration,
- activate real TRM/documentation/mailto/Jira-group/Outlook-group/ServiceNow destinations,
- invent Service Owner email addresses or TRM Restriction Owner destination data,
- introduce new service data fields solely for accessibility,
- change TRM status meanings beyond the explicitly approved Divest disabled-CTA behavior in this story,
- change approval policy,
- change card content strategy,
- add visible accessibility instructions that are not needed by everyone.

If a visible design change appears necessary to satisfy AA and it is more than a minimal contrast/reflow/readability correction, stop and raise it for PO review.

---

# Definition of Done

Story 1.2 is complete when:

```text
Checkpoint A reviewed and accepted by PO
Checkpoint B reviewed and accepted by PO
Keyboard-only primary flow passes
Screen-reader structure and control names are coherent
Applicable WCAG 2.2 AA contrast checks pass
200% and 400% zoom/reflow checks pass
Focus entry, containment, visibility, and return pass
No information depends on color alone
Custom controls expose correct name/role/state
No invalid nested interactive controls remain
No invalid/orphan metadata semantics remain
TRM Restriction Owner is a keyboard-accessible inert group link for Restricted services
Divest and Prohibited ServiceNow CTAs are disabled with accessible status-specific explanations
Disabled-state tooltip text is readable at 14px minimum and passes applicable contrast/reflow checks
Automated axe scan has no unresolved serious/critical issues in scope
No stakeholder-approved visual redesign was introduced
No Story 1.1 information architecture regressed
Production build succeeds
```

## Final PO Rule

**Everyone is the standard.**

Visible changes must improve the experience broadly. Invisible accessibility improvements must strengthen semantics and interaction without disturbing the UI stakeholders already approved.