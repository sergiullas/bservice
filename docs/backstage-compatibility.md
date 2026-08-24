# Backstage integration -- compatibility record (STORY 2.3, Checkpoint A)

**Status: experiment/harness compatibility -- not production-host certification.**

No real target Backstage host was available to this repository/session. Per
STORY 2.3 Checkpoint A, no facts about a specific production host have been
invented. Everything below describes the **experimental harness** in
`packages/app`, `packages/backend`, and `plugins/*`, built against a
current, supported, real Backstage configuration, with the adapter boundary
(`plugins/servicelog`'s `ServiceDataSource`, see Checkpoint D) kept thin
specifically so a real host team can re-point it with minimal change.

## 1. Backstage version

No existing Backstage instance to match. The harness is built against the
current stable release line as of late August 2026:

| Package | Version |
|---|---|
| `@backstage/cli` | 0.36.5 |
| `@backstage/create-app` | 0.9.1 (latest dist-tag; not run -- see "Why hand-assembled" below) |
| `@backstage/frontend-plugin-api` | 0.18.0 |
| `@backstage/frontend-defaults` | 0.5.5 |
| `@backstage/frontend-app-api` | 0.16.7 |
| `@backstage/backend-defaults` | 0.17.7 |
| `@backstage/backend-plugin-api` | 1.10.0 |
| `@backstage/core-components` | 0.18.13 |
| `@backstage/core-plugin-api` | 1.12.9 |
| `@backstage/dev-utils` | 1.1.26 |
| `@backstage/config` / `@backstage/errors` | 1.3.8 / 1.3.1 |

## 2. Frontend system: **new** frontend system

`@backstage/create-app` now scaffolds the new frontend system by default
(the old default now requires an explicit `--legacy` flag), so "new
applications generally use the new frontend system" (STORY 2.3 section 3)
applies directly. The plugin therefore uses `createFrontendPlugin` +
`PageBlueprint` from `@backstage/frontend-plugin-api`, not
`createPlugin`/`createRoutableExtension`. Nav items are auto-inferred from a
`PageBlueprint`'s `title`/`icon` in the current API -- `NavItemBlueprint` has
been deprecated and removed upstream, so the harness does not use it.

## 3. React version

**React 18.3.1** -- for the whole workspace, standalone root included. This
took two rounds of *verification*, not assumption, and the first round was
wrong:

- `@backstage/frontend-plugin-api`, `@backstage/frontend-defaults`, and
  `@backstage/core-components` all declare
  `"react": "^17.0.0 || ^18.0.0"` as a peer dependency, so on paper React 17
  looked sufficient, and the harness was first built on React 17 (matching
  the standalone root, avoiding any upgrade).
- Actually starting the harness app (`backstage-cli package start`) exposed
  the real story: the new frontend system's default app shell
  (`@backstage/plugin-app`, which supplies the sign-in page, root layout,
  and nav chrome for `createApp()`) transitively depends on `framer-motion`
  for its animations, which calls React 18-only hooks (`useId`,
  `useInsertionEffect`, `useSyncExternalStore`). Under React 17 this isn't
  a peer-range warning, it's a hard webpack build failure
  (`ESModulesLinkingError`) -- the default chrome simply cannot run.
- STORY 2.3 section 8 pins the standalone app on React 17 but explicitly
  allows an upgrade "if required for shared-code compatibility." This
  is that case, confirmed by actually running the harness rather than only
  reading peer-dependency ranges -- so the whole workspace (root/standalone,
  `@servicelog/core`, and the harness) was moved to React 18.3.1 together,
  keeping one hoisted React copy for the entire npm-workspaces tree (see
  "Package manager convention" below) rather than splitting the harness
  from the shared core it depends on.
- `@material-ui/core` v4 (kept intentionally for the standalone Sidebar,
  section 7) hasn't been updated since 2021 and still declares a peer range
  of `react: "^16.8.0 || ^17.0.0"` -- stale, not a real incompatibility;
  its `ThemeProvider`/`CssBaseline`/`makeStyles`/`Box` usage runs
  unmodified under React 18 (verified: full standalone test suite, a
  production build, and a live browser check of the expanded Sidebar all
  pass with zero visible change). `.npmrc` sets `legacy-peer-deps=true`
  specifically so this one stale declaration doesn't block `npm install`;
  it does not disable checking anything else npm would otherwise flag.
- The standalone entry point (`src/main.tsx`) deliberately keeps the
  legacy `ReactDOM.render` call rather than adopting `createRoot` --
  React 18 explicitly runs that API in a React-17-compatible legacy mode,
  which was the smaller, lower-risk change for code under the "preserve
  V1 unless required otherwise" mandate. The harness app
  (`packages/app`, new code, not under that mandate) uses `createRoot`.

## 4. UI stack

Backstage chrome (`packages/app`) uses whatever the current
`@backstage/core-components` / MUI v5 default app shell provides -- the
harness does not add a second theme provider. The ServiceLog plugin content
itself carries **zero MUI dependency of any version**: STORY 2.3 checkpoint
B removed the shared core's last `@material-ui/core` v4 usage
(`ServiceDetailDrawer`'s `Modal`/`Tooltip`), and the plugin does not
introduce MUI v5 or Backstage UI (`@backstage/ui`) as a replacement --
ServiceLog's own visual styling is Tailwind-derived (scoped, see
`plugins/servicelog/README.md` and Checkpoint B1/C).

## 4b. Styling containment -- a real bug, not a hypothetical risk

STORY 2.3 checkpoint B1 asks for a plugin-safe styling strategy: no
Tailwind preflight (a global reset) loaded into the host, but ServiceLog
still needs to look like V1 inside its own scope. The approach (see
`plugins/servicelog/src/styles/servicelog-plugin.css`) is to import only
Tailwind's `theme.css` + `utilities.css` layers (skipping `preflight.css`
entirely) and re-declare, under `.servicelog-scope` instead of bare
`*`/`html`/`body`/element selectors, the specific parts of preflight
ServiceLog's own components actually depend on.

Getting "the specific parts" right took an actual, reproduced failure, not
just reading preflight and guessing: the first version of that scoped
reset ported the heading/link/margin rules but not preflight's
`button, input, select, textarea { background-color: transparent;
border-radius: 0; opacity: 1; }`. `ServiceCard`'s full-card click target is
a `<button class="absolute inset-0 z-0 ...">` with no `bg-*` class of its
own -- correct in the standalone host, where preflight already makes
browser buttons transparent, but under the plugin's preflight-free build
that button rendered with the browser's own *opaque* default button
background and visually hid every card's contents underneath it. Verified
live in the running harness (`backstage-cli package start`, guest sign-in,
navigate to `/servicelog`) with a real screenshot showing empty cards,
root-caused by walking the DOM/computed-style/paint chain rather than
guessing, then fixed and re-verified with a second live screenshot showing
the cards correctly populated. `box-sizing: border-box` and
`svg { display: block }` were added to the same scoped reset for the same
reason (load-bearing elsewhere in these components, not preflight-covered
by default). The **no-leakage** side of checkpoint B1 was verified
separately and just as concretely: client-side-navigating from
`/servicelog` to an unrelated Backstage page while leaving the plugin's
injected `<style>` tag in the DOM (it is never torn down on unmount) still
left that other page's font, box-sizing, button background, and link
underline as pure Backstage defaults -- because every rule in that
stylesheet is either genuinely host-neutral (design tokens, the
`.metadata-label` class) or qualified under `.servicelog-scope`, which
that other page never contains.

## 5. Package manager / workspace convention

**npm workspaces**, not yarn. This is a deliberate deviation from the
Backstage community default (Backstage's own monorepo and
`@backstage/create-app`'s generated `package.json` use yarn workspaces):
this repository already committed to npm (`package-lock.json`) in Stories
2.1/2.2, and introducing a second package manager into one repository for
one subtree would add real friction for no compatibility benefit -- npm
workspaces provide the same hoisting/symlinking semantics
`@backstage/cli`'s build/dev tooling relies on for *most* of what it does.
A real host that is a conventional yarn-workspaces Backstage monorepo would
drop `plugins/servicelog` and `plugins/servicelog-backend` in with no
change to their internals; only the root install command differs.

**Where that deviation actually cost something, verified by trying it:**
`backstage-cli package build` for the `frontend`/`backend` (app) roles --
`packages/app` and `packages/backend` -- hard-codes a Yarn-specific
workspace-bundling step (it looks for `yarn.lock` to gather local
dependencies into the deployable bundle) that has no npm equivalent; it
fails with `ENOENT ... yarn.lock` on this workspace. The `frontend-plugin`
and `backend-plugin` roles -- `plugins/servicelog` and
`plugins/servicelog-backend`, the packages STORY 2.3 actually asks to be
genuine, buildable Backstage packages -- do **not** hit this; both build
cleanly with real `backstage-cli package build` (checkpoint C/D evidence).
The harness app/backend are proven instead by `backstage-cli package
start` (checkpoint C acceptance: "Plugin loads inside a real Backstage
harness/host," not "the harness itself produces a production deployment
bundle") -- see the PR's regression-verification section for that run's
output. A real host, being a conventional Backstage monorepo with a
`yarn.lock` already, would not hit this at all.

**Why the harness was hand-assembled instead of running
`@backstage/create-app`:** the generator's default template wires in
catalog, search, techdocs, scaffolder, and tech-radar (frontend and
backend) -- none of which this experiment needs, and STORY 2.3's stated
north star is the *smallest reasonable integration surface*. The harness
`packages/app` and `packages/backend` are built directly from the same
documented, current `createApp`/`createBackend` APIs
`@backstage/create-app` itself generates code against, just without the
unrelated default plugins (the one default kept is guest auth, needed for
any request from the frontend to reach an authenticated backend route at
all -- see #9). Everything under `plugins/servicelog*` follows the exact
`@backstage/cli` package conventions (`backstage.role` in `package.json`)
that a real host's tooling expects; declaration output for those two
packages is produced by one root-level `tsconfig.json` (`npm run
backstage:tsc`, extending `@backstage/cli/config/tsconfig.json`) rather
than a tsconfig per package, matching how `@backstage/cli` itself expects
a monorepo-wide declaration build to work.

## 6. Frontend plugin package convention

`plugins/servicelog`, `backstage.role: "frontend-plugin"`, built with
`@backstage/cli package build` / served isolated with
`@backstage/cli package start` against a `dev/index.tsx` harness using
`createDevApp` from `@backstage/frontend-dev-utils` (see Checkpoint C) --
not `@backstage/dev-utils`'s legacy `createDevApp`/`.registerPlugin()`
chain, which targets the old frontend system and doesn't accept a
`createFrontendPlugin` instance. Plugin id: `servicelog`.

## 7. Backend plugin convention

`plugins/servicelog-backend`, `backstage.role: "backend-plugin"`, new
backend system (`createBackendPlugin`), registers one HTTP route under
`/api/servicelog` via the standard `httpRouterService` (see Checkpoint D).

## 8. Routing / navigation convention

The harness `packages/app` installs the `servicelog` frontend plugin as a
feature; the new frontend system auto-derives both the route and a nav
entry from the page extension's `path`/`title`/`icon`. This proves
ServiceLog is reachable through real Backstage chrome. STORY 2.3 is explicit
that a production host team remains free to place that nav entry
differently -- nothing here assumes a specific information architecture.

## 9. Authentication expectations for frontend-to-backend calls

The frontend adapter calls the backend through the standard `discoveryApi`
+ `fetchApi` pair (`@backstage/core-plugin-api`), which attaches the
caller's Backstage credentials automatically. The backend route requires
those credentials via the `httpAuth` service (`allow: ['user', 'service']`)
-- STORY 2.3 explicitly rules out an open, unauthenticated
production-style route "merely because it is easy in the experiment," so
the harness does not add one. Since this harness has no real identity
provider, it wires up Backstage's own standard answer for that --
`@backstage/plugin-auth-backend` +
`@backstage/plugin-auth-backend-module-guest-provider`, configured via
`auth.providers.guest: {}` in `app-config.yaml`, exactly as
`@backstage/create-app`'s own default template does. This is real
`httpAuth`-validated credential flow, not a bypass; a real host swaps the
guest provider for its actual identity provider and nothing in
`plugins/servicelog*` changes.

## 10. CSP/YAML deployment constraints discovered

The Story 2.2 YAML metadata (`/metadata`) and its validator
(`/metadata/lib/validate.ts`) live at the repository root. `metadata/` was
given its own small workspace package (`@servicelog/metadata`, `dist/`
built the same way as `@servicelog/core`) purely so the backend can locate
it reliably: the backend resolves the metadata directory via
`require.resolve('@servicelog/metadata/package.json')` rather than a
`__dirname`-relative path, since a bundled backend's runtime `__dirname`
does not necessarily preserve the source tree's relative depth. There is
still exactly one YAML metadata source and one validator, reused (as a
real dependency) rather than copied. **This is the one integration seam a
real host must revisit**: a production Backstage deployment will not
necessarily check out this monorepo layout, so the real host team will
need to decide how the validated CSP YAML actually reaches the backend
plugin's runtime (packaged alongside the backend, mounted from a
config-specified path, fetched from wherever the org's CSP metadata
already lives, etc.). `servicelog.metadataRoot` in `app-config.yaml` is
read first and overrides the `require.resolve` default, so that decision
is a config change, not a code change. The adapter boundary
(`ServiceDataSource` on the frontend, the router handler on the backend)
is kept thin specifically so that decision doesn't ripple into
`ServiceLogFeature` or any shared UI component.

## 11. Narrow-viewport / responsive behavior

Checked directly rather than assumed: at a 900px and a 700px viewport,
`/servicelog` shows a horizontal scrollbar (`document.documentElement`
`scrollWidth` > `clientWidth`). Isolating the cause -- checked the
Backstage root/404 page, which has zero ServiceLog content, at the same
900px width -- shows the identical overflow (1124px vs. 1116px, a
rounding-level difference). The overflow is the harness's own Backstage
Sidebar/`PluginHeader` chrome (`@backstage/ui`'s `bui-PluginHeader`
toolbar), not anything ServiceLog contributes: at every width tested,
ServiceLog's own content (search bar, filters, card grid) reflows
correctly inside whatever width that chrome allocates it, with no
overlapping or cut-off content. Consistent with "Backstage owns Backstage
chrome" (section 4/8): fixing the host shell's own narrow-viewport
behavior is out of this plugin's boundary, and STORY 2.3 does not ask for
it.

## Summary

- No target-host upgrade is required or assumed anywhere above.
- The frontend-system choice (new) is explicit and was verified against
  what `@backstage/create-app` currently generates by default, not assumed.
- The one unresolved, host-specific assumption is #10 (how CSP YAML reaches
  the backend at runtime in a real deployment) -- called out above rather
  than silently resolved.
