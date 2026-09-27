import { describe, expect, it } from "vitest";
import { codemodById, DEFAULT_CODEMODS, migrationSummary } from "@/lib/version/migration";
import { frameworkVersion, listModuleVersions, MODULE_VERSIONS, moduleVersion } from "@/lib/version/moduleVersion";
import { templateVersion } from "@/lib/version/version";

describe("module versions", () => {
  it("exposes a version for every capability module", () => {
    expect(listModuleVersions()).toEqual(MODULE_VERSIONS.map((module) => ({ ...module })));
    expect(moduleVersion("native")).toBe("1");
    expect(moduleVersion("missing")).toBeNull();
  });

  it("reports the framework version from the package manifest", () => {
    expect(frameworkVersion).toBe(templateVersion);
    expect(frameworkVersion).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe("migration contract", () => {
  it("summarizes migrations by kind and breaking state", () => {
    const summary = migrationSummary([
      { id: "a", kind: "config", description: "", breaking: false, files: [] },
      { id: "b", kind: "dependency", description: "", breaking: true, files: [] },
      { id: "c", kind: "template", description: "", breaking: false, files: [] },
    ]);

    expect(summary).toEqual({ total: 3, breaking: 1, byKind: { config: 1, dependency: 1, template: 1 } });
  });

  it("resolves codemods by id and returns null for unknown ids", () => {
    expect(codemodById(DEFAULT_CODEMODS[0].id)?.id).toBe(DEFAULT_CODEMODS[0].id);
    expect(codemodById("missing")).toBeNull();
  });
});
