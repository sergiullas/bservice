import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalog } from "../src/metadata";
import type { CatalogSource } from "../src/metadata";

const scriptDir = fileURLToPath(new URL(".", import.meta.url));
const metadataRoot = resolve(scriptDir, "../metadata");
const catalogDirs = ["aws", "azure", "google-cloud"];

function collectYamlFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectYamlFiles(fullPath));
    } else if (entry.endsWith(".yaml") || entry.endsWith(".yml")) {
      files.push(fullPath);
    }
  }
  return files;
}

function relativeToRepo(path: string): string {
  return path.replace(resolve(scriptDir, "..") + "/", "");
}

const sources: CatalogSource[] = catalogDirs
  .map((dir) => join(metadataRoot, dir))
  .flatMap((dir) => collectYamlFiles(dir))
  .sort()
  .map((filePath) => ({ filePath: relativeToRepo(filePath), raw: readFileSync(filePath, "utf8") }));

if (sources.length === 0) {
  console.error(`No YAML documents found under ${catalogDirs.map((d) => `metadata/${d}`).join(", ")}.`);
  process.exit(1);
}

const { services, issues } = buildCatalog(sources);

if (issues.length > 0) {
  console.error(`✗ metadata validation failed: ${issues.length} issue(s) across ${sources.length} document(s)\n`);

  const byFile = new Map<string, typeof issues>();
  for (const issue of issues) {
    if (!byFile.has(issue.file)) byFile.set(issue.file, []);
    byFile.get(issue.file)!.push(issue);
  }

  for (const [file, fileIssues] of byFile) {
    console.error(file);
    for (const issue of fileIssues) {
      console.error(`  ${issue.path}`);
      console.error(`    ${issue.message}`);
      if (issue.invalidValue !== undefined) console.error(`    got:      ${JSON.stringify(issue.invalidValue)}`);
      if (issue.expected !== undefined) console.error(`    expected: ${JSON.stringify(issue.expected)}`);
    }
    console.error("");
  }

  process.exit(1);
}

const byProvider = new Map<string, number>();
const byCategory = new Map<string, number>();
for (const service of services) {
  byProvider.set(service.cloudProvider, (byProvider.get(service.cloudProvider) ?? 0) + 1);
  byCategory.set(service.serviceCategory, (byCategory.get(service.serviceCategory) ?? 0) + 1);
}

console.log(`✓ metadata validation passed: ${services.length} service(s) across ${sources.length} document(s)\n`);
console.log("By provider:");
for (const [provider, count] of [...byProvider].sort()) console.log(`  ${provider}: ${count}`);
console.log("\nBy category:");
for (const [category, count] of [...byCategory].sort()) console.log(`  ${category}: ${count}`);
