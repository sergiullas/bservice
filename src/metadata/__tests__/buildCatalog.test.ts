import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildCatalog } from "../buildCatalog";
import type { CatalogSource } from "../documentTypes";

const metadataRoot = resolve(process.cwd(), "metadata");

function readYamlFiles(dir: string): CatalogSource[] {
  return readdirSync(dir)
    .filter((entry) => entry.endsWith(".yaml"))
    .sort()
    .map((entry) => {
      const filePath = join(dir, entry);
      return { filePath: entry, raw: readFileSync(filePath, "utf8") };
    });
}

function readOneFixture(relativePath: string): CatalogSource {
  const filePath = join(metadataRoot, relativePath);
  return { filePath: relativePath, raw: readFileSync(filePath, "utf8") };
}

describe("buildCatalog: valid fixtures", () => {
  it("accepts every fixture under metadata/fixtures/valid", () => {
    const sources = readYamlFiles(join(metadataRoot, "fixtures/valid"));
    const { services, issues } = buildCatalog(sources);
    expect(issues).toEqual([]);
    expect(services).toHaveLength(sources.length);
  });

  it("does not require trmRestrictionOwner for a non-Restricted service", () => {
    const { issues } = buildCatalog([readOneFixture("fixtures/valid/sample-permitted-service.yaml")]);
    expect(issues).toEqual([]);
  });

  it("normalizes a Restricted service with trmRestrictionOwner intact", () => {
    const { services } = buildCatalog([readOneFixture("fixtures/valid/sample-restricted-service.yaml")]);
    expect(services[0].trmRestrictionOwner).toBe("CIM AI Platform Team");
  });
});

describe("buildCatalog: invalid fixtures (Checkpoint A required cases)", () => {
  it("2. rejects an out-of-vocabulary trmStatus (e.g. 'Dangerous') and does not coerce it", () => {
    const { services, issues } = buildCatalog([readOneFixture("fixtures/invalid/trm-status-invalid.yaml")]);
    expect(services).toEqual([]);
    expect(issues).toHaveLength(1);
    expect(issues[0].path).toBe("/spec/profile/trmStatus");
    expect(issues[0].invalidValue).toBe("Dangerous");
    expect(issues[0].expected).toEqual(["Permitted", "Restricted", "Divest", "Prohibited"]);
  });

  it("3. rejects an invalid Cloud ATO value", () => {
    const { issues } = buildCatalog([readOneFixture("fixtures/invalid/cloud-ato-invalid.yaml")]);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].path).toBe("/spec/profile/cloudAto/0");
    expect(issues[0].invalidValue).toBe("DANGER");
    expect(issues[0].expected).toEqual(["MAGE", "CACE", "CMAA"]);
  });

  it("4. rejects an invalid provisioning model", () => {
    const { issues } = buildCatalog([readOneFixture("fixtures/invalid/provisioning-model-invalid.yaml")]);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].path).toBe("/spec/profile/provisioningModel");
    expect(issues[0].invalidValue).toBe("Tier 5");
  });

  it("5. rejects an invalid FedRAMP status", () => {
    const { issues } = buildCatalog([readOneFixture("fixtures/invalid/fedramp-status-invalid.yaml")]);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].path).toBe("/spec/profile/fedRampStatus");
    expect(issues[0].invalidValue).toBe("Green");
  });

  it("6. rejects an invalid approval workflow", () => {
    const { issues } = buildCatalog([readOneFixture("fixtures/invalid/approval-workflow-invalid.yaml")]);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].path).toBe("/spec/profile/approvalWorkflow");
    expect(issues[0].invalidValue).toBe("Rubber Stamp");
  });

  it("7. rejects an invalid funding approach", () => {
    const { issues } = buildCatalog([readOneFixture("fixtures/invalid/funding-approach-invalid.yaml")]);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].path).toBe("/spec/profile/fundingApproach");
    expect(issues[0].invalidValue).toBe("Free");
  });

  it("8. rejects an unrecognized cloud provider", () => {
    const { issues } = buildCatalog([readOneFixture("fixtures/invalid/provider-invalid.yaml")]);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].path).toBe("/spec/profile/cloudProvider");
    expect(issues[0].invalidValue).toBe("Oracle Cloud");
  });

  it("9. rejects a category spelling variant instead of silently creating a new category", () => {
    const { issues } = buildCatalog([readOneFixture("fixtures/invalid/category-invalid.yaml")]);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].path).toBe("/spec/profile/serviceCategory");
    expect(issues[0].invalidValue).toBe("AI and Machine Learning");
    expect(issues[0].expected).toContain("AI & Machine Learning");
  });

  it("10. rejects a document missing required fields", () => {
    const { issues } = buildCatalog([readOneFixture("fixtures/invalid/missing-required-fields.yaml")]);
    const missing = issues.map((issue) => issue.path);
    expect(missing).toContain("/spec/profile/serviceOwner");
    expect(missing).toContain("/spec/profile/provisioningSLA");
    expect(missing).toContain("/spec/profile/serviceUseCases");
    expect(missing).toContain("/spec/profile/trmLink");
  });

  it("11. rejects a Restricted service missing trmRestrictionOwner", () => {
    const { issues } = buildCatalog([readOneFixture("fixtures/invalid/restricted-missing-owner.yaml")]);
    expect(issues.some((issue) => issue.path === "/spec/profile/trmRestrictionOwner")).toBe(true);
  });

  it("12. rejects duplicate service ids across two documents", () => {
    const sources = [readOneFixture("fixtures/invalid/duplicate-id-a.yaml"), readOneFixture("fixtures/invalid/duplicate-id-b.yaml")];
    const { services, issues } = buildCatalog(sources);
    expect(services).toHaveLength(1);
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("Duplicate service id");
    expect(issues[0].file).toBe("fixtures/invalid/duplicate-id-b.yaml");
  });

  it("13. rejects an unknown/stale profile field rather than silently ignoring it", () => {
    const { issues } = buildCatalog([readOneFixture("fixtures/invalid/unknown-field.yaml")]);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].invalidValue).toBe("atoStatus");
    expect(issues[0].message).toContain("atoStatus");
  });

  it("every issue identifies file, path, and a human-readable message (actionable, not just 'validation failed')", () => {
    const invalidDir = join(metadataRoot, "fixtures/invalid");
    const files = readdirSync(invalidDir).filter((entry) => entry.endsWith(".yaml"));
    for (const file of files) {
      const { issues } = buildCatalog([{ filePath: file, raw: readFileSync(join(invalidDir, file), "utf8") }]);
      for (const issue of issues) {
        expect(issue.file).toBeTruthy();
        expect(issue.path).toBeTruthy();
        expect(issue.message.length).toBeGreaterThan("validation failed".length);
      }
    }
  });
});

describe("buildCatalog: complete real catalog", () => {
  const catalogDirs = ["aws", "azure", "google-cloud"];

  function readCatalog(): CatalogSource[] {
    return catalogDirs.flatMap((dir) => readYamlFiles(join(metadataRoot, dir)).map((s) => ({ ...s, filePath: `${dir}/${s.filePath}` })));
  }

  it("validates the entire V1 catalog with zero issues", () => {
    const { issues } = buildCatalog(readCatalog());
    expect(issues).toEqual([]);
  });

  it("produces exactly 76 services matching the V1 baseline", () => {
    const { services } = buildCatalog(readCatalog());
    expect(services).toHaveLength(76);
  });

  it("matches the V1 provider baseline: 51 AWS, 13 Azure, 12 Google Cloud", () => {
    const { services } = buildCatalog(readCatalog());
    const byProvider = services.reduce<Record<string, number>>((acc, service) => {
      acc[service.cloudProvider] = (acc[service.cloudProvider] ?? 0) + 1;
      return acc;
    }, {});
    expect(byProvider).toEqual({ AWS: 51, Azure: 13, "Google Cloud": 12 });
  });

  it("has unique service ids across the whole catalog", () => {
    const { services } = buildCatalog(readCatalog());
    expect(new Set(services.map((s) => s.id)).size).toBe(services.length);
  });

  it("keeps Amazon End User Messaging's long onboarding content intact", () => {
    const { services } = buildCatalog(readCatalog());
    const eum = services.find((s) => s.serviceName === "Amazon End User Messaging");
    expect(eum).toBeDefined();
    expect(eum!.serviceOnboardingRequirements?.length).toBeGreaterThan(5);
    expect(eum!.serviceOnboardingRequirements?.join(" ")).not.toMatch(/<p title=|<\/p>|<a /);
  });

  it("still has Restricted, Divest, and Prohibited examples for behavior verification", () => {
    const { services } = buildCatalog(readCatalog());
    const statuses = new Set(services.map((s) => s.trmStatus));
    expect(statuses.has("Restricted")).toBe(true);
    expect(statuses.has("Divest")).toBe(true);
    expect(statuses.has("Prohibited")).toBe(true);
    expect(statuses.has("Permitted")).toBe(true);
  });
});
