#!/usr/bin/env tsx
/**
 * npm run validate:metadata
 *
 * Validates every CSP service metadata YAML document under metadata/aws,
 * metadata/azure, and metadata/google-cloud against the shared JSON Schema
 * contract (metadata/schema/service-metadata.schema.json), independent of
 * React/Vite/the frontend build. Intended for local use and CI.
 *
 * Exit code 0: every document is valid and service IDs are unique.
 * Exit code 1: at least one document failed validation, a document failed
 * to parse as YAML, or a service ID is duplicated across documents.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import * as yaml from "js-yaml";
import { loadCatalog, type ActionableError, type CatalogDocument } from "../metadata/lib/validate.ts";

const METADATA_ROOT = join(import.meta.dirname, "..", "metadata");
const CSP_DIRS = ["aws", "azure", "google-cloud"];

function findYamlFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...findYamlFiles(full));
    } else if (entry.endsWith(".yaml") || entry.endsWith(".yml")) {
      files.push(full);
    }
  }
  return files;
}

function loadDocuments(): { documents: CatalogDocument[]; parseErrors: ActionableError[] } {
  const documents: CatalogDocument[] = [];
  const parseErrors: ActionableError[] = [];

  for (const cspDir of CSP_DIRS) {
    const absoluteDir = join(METADATA_ROOT, cspDir);
    const files = findYamlFiles(absoluteDir);
    for (const absolutePath of files) {
      const file = relative(process.cwd(), absolutePath);
      const raw = readFileSync(absolutePath, "utf8");
      try {
        const doc = yaml.load(raw);
        documents.push({ file, doc });
      } catch (error) {
        parseErrors.push({
          file,
          path: "(document root)",
          message: `not valid YAML: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }
  }

  return { documents, parseErrors };
}

function formatError(error: ActionableError): string {
  const parts = [`  ${error.file}`, `    field: ${error.path}`, `    ${error.message}`];
  if (error.invalidValue !== undefined) {
    parts.push(`    got: ${JSON.stringify(error.invalidValue)}`);
  }
  if (error.expected !== undefined) {
    parts.push(`    expected: ${error.expected}`);
  }
  return parts.join("\n");
}

function main() {
  const { documents, parseErrors } = loadDocuments();
  const { services, errors } = loadCatalog(documents);
  const allErrors = [...parseErrors, ...errors];

  if (allErrors.length > 0) {
    console.error(`✖ ServiceLog metadata validation failed (${allErrors.length} issue(s)):\n`);
    for (const error of allErrors) {
      console.error(formatError(error));
      console.error("");
    }
    process.exit(1);
  }

  const byProvider = new Map<string, number>();
  for (const service of services) {
    byProvider.set(service.cloudProvider, (byProvider.get(service.cloudProvider) ?? 0) + 1);
  }

  console.log(`✔ ${services.length} service(s) across ${documents.length} document(s) passed validation.`);
  for (const [provider, count] of Array.from(byProvider.entries()).sort()) {
    console.log(`  ${provider}: ${count}`);
  }
}

main();
