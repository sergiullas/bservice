#!/usr/bin/env tsx
/**
 * npm run validate:metadata
 *
 * Validates the aggregate ServiceLog catalog (metadata/services.yaml)
 * against the shared JSON Schema contract
 * (metadata/schema/service-metadata.schema.json), independent of
 * React/Vite/the frontend build. Intended for local use and CI.
 *
 * Exit code 0: the catalog is valid and service IDs are unique.
 * Exit code 1: the catalog failed validation, failed to parse as YAML, or
 * contains a duplicate service ID.
 */
import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import * as yaml from "js-yaml";
import { loadCatalog, type ActionableError } from "../metadata/lib/validate.ts";

const CATALOG_PATH = join(import.meta.dirname, "..", "metadata", "services.yaml");

function formatError(error: ActionableError): string {
  const parts = [`  ${error.file}`, `    ${error.path}: ${error.message}`];
  if (error.serviceId !== undefined) {
    parts.push(`    service: ${error.serviceId}`);
  }
  if (error.invalidValue !== undefined) {
    parts.push(`    got: ${JSON.stringify(error.invalidValue)}`);
  }
  if (error.expected !== undefined) {
    parts.push(`    expected: ${error.expected}`);
  }
  return parts.join("\n");
}

function main() {
  const file = relative(process.cwd(), CATALOG_PATH);
  const raw = readFileSync(CATALOG_PATH, "utf8");

  let doc: unknown;
  try {
    doc = yaml.load(raw);
  } catch (error) {
    console.error(`✖ ServiceLog metadata validation failed (1 issue(s)):\n`);
    console.error(`  ${file}\n    (document root): not valid YAML: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }

  const { services, errors } = loadCatalog(doc, file);

  if (errors.length > 0) {
    console.error(`✖ ServiceLog metadata validation failed (${errors.length} issue(s)):\n`);
    for (const error of errors) {
      console.error(formatError(error));
      console.error("");
    }
    process.exit(1);
  }

  const byProvider = new Map<string, number>();
  for (const service of services) {
    byProvider.set(service.cloudProvider, (byProvider.get(service.cloudProvider) ?? 0) + 1);
  }

  console.log(`✔ ${services.length} service(s) in ${file} passed validation.`);
  for (const [provider, count] of Array.from(byProvider.entries()).sort()) {
    console.log(`  ${provider}: ${count}`);
  }
}

main();
