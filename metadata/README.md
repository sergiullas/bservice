# ServiceLog CSP Service Metadata

> North star: **CSP teams own their metadata. The platform owns the metadata contract.**

This directory is the authoritative source of ServiceLog's prototype
catalog. AWS, Azure, and Google Cloud each own the *values* in their own
YAML documents; the JSON Schema in `schema/` owns the *contract* -- field
definitions, required/optional rules, and every controlled vocabulary.
ServiceLog never silently accepts, reinterprets, or coerces a value outside
that contract (a bad `trmStatus` is a validation failure, never a guess).

## Layout

```
metadata/
├── schema/
│   └── service-metadata.schema.json   # canonical JSON Schema (draft 2020-12)
├── aws/               # one YAML document per AWS service (51)
├── azure/              # one YAML document per Azure service (13)
├── google-cloud/         # one YAML document per Google Cloud service (12)
└── fixtures/
    ├── valid/            # documents that must pass validation
    └── invalid/          # documents that must fail, one bad field each
```

One file per service (a Backstage-style `Resource`) so CSP teams can own
their services independently and without merge contention.

## Document shape

Each file is a Backstage-compatible envelope:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: aws-amazon-bedrock       # stable id, lowercase-kebab, unique catalog-wide
  title: Amazon Bedrock
spec:
  type: service-offering
  owner: group:default/example-team   # optional; Backstage Catalog ownership only
  lifecycle: production                # Backstage metadata, not read by the UI
  profile:
    cloudProvider: AWS
    serviceCategory: AI & Machine Learning
    # ...remaining ServiceLog fields, see schema/service-metadata.schema.json
```

`spec.profile` is what normalizes into the ServiceLog `Service` UI contract
(`src/app/data/types.ts`). Three ownership fields look similar but are not
interchangeable -- keep them separate:

| Field | Meaning |
|---|---|
| `spec.owner` | Backstage Catalog ownership reference. Not read by ServiceLog at all today. |
| `spec.profile.serviceOwner` | The ServiceLog accountable **person**. |
| `spec.profile.trmRestrictionOwner` | The **group** that owns a `Restricted` service's TRM exception. Required only when `trmStatus: Restricted`. |

## Controlled vocabularies

Owned centrally by the schema, not redefined per CSP: `cloudProvider`,
`serviceCategory`, `provisioningModel`, `cloudAto`, `fedRampStatus`,
`trmStatus`, `fundingApproach`, `approvalWorkflow`. See
`schema/service-metadata.schema.json` (`$defs`) for the exact allowed
values. Adding a new CSP or category is an intentional schema change, not
something a single YAML document can introduce on its own -- an unrecognized
value, or a spelling variant of an existing one, fails validation.

## Validating

```
npm run validate:metadata
```

Parses and validates every document under `aws/`, `azure/`, and
`google-cloud/` against the schema, checks that `metadata.name` is unique
across the whole catalog, and prints per-provider/per-category counts on
success. On failure it prints one actionable entry per problem: the file,
the field path, the invalid value, and the expected value(s).

The same pipeline (`src/metadata/`) also runs the invalid fixtures in
`fixtures/invalid/` under `npm test` (see
`src/metadata/__tests__/buildCatalog.test.ts`) -- each fixture proves one
specific failure mode (bad TRM status, missing `trmRestrictionOwner`,
duplicate ids, an unrecognized/stale field, etc.).

The validation/normalization pipeline (`src/metadata/`) has no dependency
on React or Vite, so it runs the same way from this CLI script, from
`vitest`, and from the standalone browser adapter
(`src/standalone/data/yamlCatalogAdapter.ts`).

## Not the contract

Root-level `notes.md` is a historical example of the org's original YAML
shape and is marked legacy/reference-only. Several of its fields
(`atoStatus`, `statusBadge`, `trmStatus: Approved`, `serviceContact`,
`environments`, `oemModel`, HTML embedded in a URL field) were intentionally
not carried into this schema -- do not use it as a template for new
metadata.
