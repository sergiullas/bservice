import { describe, expect, it } from "vitest";
import { loadStandaloneCatalog } from "./yamlCatalogAdapter";

describe("loadStandaloneCatalog", () => {
  it("loads all 76 V1 services via Vite-loaded YAML", () => {
    const services = loadStandaloneCatalog();
    expect(services).toHaveLength(76);
  });

  it("matches the V1 provider baseline", () => {
    const services = loadStandaloneCatalog();
    const byProvider = services.reduce<Record<string, number>>((acc, service) => {
      acc[service.cloudProvider] = (acc[service.cloudProvider] ?? 0) + 1;
      return acc;
    }, {});
    expect(byProvider).toEqual({ AWS: 51, Azure: 13, "Google Cloud": 12 });
  });

  it("caches the result across calls", () => {
    expect(loadStandaloneCatalog()).toBe(loadStandaloneCatalog());
  });
});
