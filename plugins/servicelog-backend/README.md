# @internal/plugin-servicelog-backend

The Backstage backend plugin for ServiceLog (STORY 2.3 checkpoint D). The
smallest Backstage-appropriate data path between the Story 2.2 CSP YAML
and the `servicelog` frontend plugin -- no `import.meta.glob`, no second
catalog, no duplicated validator.

## What's here

- `src/index.ts` -- `createBackendPlugin`, registers one route via the
  standard `httpRouter` service.
- `src/service/router.ts` -- `GET /api/servicelog/services`, gated by
  `httpAuth.credentials(req, { allow: ['user', 'service'] })` (never
  unauthenticated). Reads and validates the CSP YAML via
  `@servicelog/metadata`'s `loadCatalog` -- the exact same Story 2.2
  schema/validator the standalone host's YAML adapter uses, reused rather
  than reimplemented. Locates the metadata directory via
  `servicelog.metadataRoot` in app-config if set, otherwise via
  `require.resolve('@servicelog/metadata/package.json')` (robust against
  this package's own bundled `__dirname` not matching the source tree's
  depth -- see `docs/backstage-compatibility.md` section 10).

Invalid metadata fails the whole request with an actionable error (file,
field path, invalid value, expected values) -- it never serves a partial
catalog.

## Scripts

- `npm start` -- run standalone via `backstage-cli package start` (used in
  the harness via `packages/backend`, which installs this plugin).
- `npm run build` -- real `backstage-cli package build` output to `dist/`.
