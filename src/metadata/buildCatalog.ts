import type { Service } from "../app/data/types";
import type { CatalogIssue, CatalogSource, ServiceMetadataDocument } from "./documentTypes";
import { normalizeDocument } from "./normalizeDocument";
import { parseYaml } from "./parseYaml";
import { validateDocument } from "./validateDocument";

export interface CatalogResult {
  services: Service[];
  issues: CatalogIssue[];
}

/**
 * Parses, validates, and normalizes a set of CSP-owned YAML documents into
 * the ServiceLog `Service[]` contract.
 *
 * A document that fails to parse or fails schema validation is excluded
 * from the returned `services` and reported in `issues` instead -- it is
 * never silently coerced or dropped without explanation. Service IDs
 * (`metadata.name`) must also be unique across the *entire* supplied set;
 * a duplicate is reported the same way.
 *
 * Independent of React and of the frontend build: this is plain
 * TypeScript/Node-safe code, callable from a CLI script or from a Vite
 * bundle equally.
 */
export function buildCatalog(sources: CatalogSource[]): CatalogResult {
  const issues: CatalogIssue[] = [];
  const services: Service[] = [];
  const seenIds = new Map<string, string>();

  for (const source of sources) {
    const { doc, parseError } = parseYaml(source.raw);
    if (parseError) {
      issues.push({ file: source.filePath, path: "(document)", message: `YAML parse error: ${parseError}` });
      continue;
    }

    const docIssues = validateDocument(doc);
    if (docIssues.length > 0) {
      for (const issue of docIssues) {
        issues.push({ file: source.filePath, ...issue });
      }
      continue;
    }

    const validDoc = doc as ServiceMetadataDocument;
    const id = validDoc.metadata.name;
    const firstSeenIn = seenIds.get(id);
    if (firstSeenIn) {
      issues.push({
        file: source.filePath,
        path: "metadata.name",
        message: `Duplicate service id "${id}": also defined in ${firstSeenIn}. Service IDs must be unique across the whole catalog.`,
        invalidValue: id,
      });
      continue;
    }
    seenIds.set(id, source.filePath);

    services.push(normalizeDocument(validDoc));
  }

  return { services, issues };
}
