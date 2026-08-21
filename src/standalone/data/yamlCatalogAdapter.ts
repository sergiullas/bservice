import { buildCatalog } from "../../metadata";
import type { CatalogSource } from "../../metadata";
import type { Service } from "../../app/data/types";

/**
 * The one place in this repository that knows metadata comes from YAML
 * files loaded via Vite. Everything downstream of `loadStandaloneCatalog`
 * (ServiceLogFeature and everything it renders) only ever sees `Service[]`.
 *
 * Loads eagerly/synchronously on purpose: the standalone host previously
 * had its catalog available synchronously at import time (data/services.ts),
 * and Story 2.2 explicitly does not want a loading-state redesign to
 * anticipate a future async Backstage fetch. A future Backstage adapter can
 * fetch asynchronously without this module, or this file, changing.
 */
const yamlModules = import.meta.glob(
  ["/metadata/aws/**/*.yaml", "/metadata/azure/**/*.yaml", "/metadata/google-cloud/**/*.yaml"],
  { eager: true, query: "?raw", import: "default" },
) as Record<string, string>;

function toCatalogSources(): CatalogSource[] {
  return Object.keys(yamlModules)
    .sort()
    .map((filePath) => ({ filePath: filePath.replace(/^\//, ""), raw: yamlModules[filePath] }));
}

let cachedServices: Service[] | null = null;

/**
 * Validates and normalizes the CSP-owned YAML catalog into `Service[]`.
 * Throws with an actionable, file/path-located message on any validation
 * failure -- an invalid document must never be silently dropped or coerced,
 * including in this standalone host.
 */
export function loadStandaloneCatalog(): Service[] {
  if (cachedServices) return cachedServices;

  const sources = toCatalogSources();
  const { services, issues } = buildCatalog(sources);

  if (issues.length > 0) {
    const details = issues.map((issue) => `  ${issue.file} ${issue.path}: ${issue.message}`).join("\n");
    throw new Error(`ServiceLog metadata failed validation (${issues.length} issue(s)):\n${details}`);
  }

  cachedServices = services;
  return services;
}
