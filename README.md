
  # ServiceLog

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  Run `npm run validate:metadata` to validate the CSP service metadata in
  `metadata/` against the shared schema (see `metadata/README.md`).

  ## Backstage plugin (experimental harness)

  ServiceLog also runs as a real Backstage plugin (`plugins/servicelog` +
  `plugins/servicelog-backend`), reusing the exact same product core
  (`@servicelog/core`, i.e. `src/app`) this standalone app renders -- one
  implementation, two hosts. See `docs/backstage-compatibility.md` for the
  full compatibility record.

  Run `npm run build:backstage` to build every Backstage-side package
  (`@servicelog/core`, `@servicelog/metadata`, and both `plugins/*`
  packages) in the right order. To run the harness itself, in two
  terminals: `npm run start --workspace=backend`, then
  `npm run start --workspace=app`, and open http://localhost:3000.
  