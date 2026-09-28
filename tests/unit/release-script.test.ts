import { describe, expect, it } from "vitest";
import { assertVersionOrder, nextVersion, releaseChangelog } from "../../scripts/release.mjs";

describe("nextVersion", () => {
  it("bumps patch, minor and major", () => {
    expect(nextVersion("1.2.3", "patch")).toBe("1.2.4");
    expect(nextVersion("1.2.3", "minor")).toBe("1.3.0");
    expect(nextVersion("1.2.3", "major")).toBe("2.0.0");
  });

  it("accepts an explicit version", () => {
    expect(nextVersion("1.2.3", "2.5.0")).toBe("2.5.0");
  });

  it("rejects unknown bumps", () => {
    expect(() => nextVersion("1.2.3", "huge")).toThrow("Unknown bump");
  });
});

describe("assertVersionOrder", () => {
  it("accepts newer versions and rejects equal or older ones", () => {
    expect(() => assertVersionOrder("1.2.3", "1.2.4")).not.toThrow();
    expect(() => assertVersionOrder("1.2.3", "1.2.3")).toThrow("not newer");
    expect(() => assertVersionOrder("1.2.3", "1.0.0")).toThrow("not newer");
  });
});

describe("releaseChangelog", () => {
  const content = ["# Changelog", "", "## [Unreleased]", "", "### Added", "", "- something new", "", "## [0.1.0]", "", "- initial", ""].join("\n");

  it("moves the Unreleased notes under the new version and keeps history", () => {
    const next = releaseChangelog(content, "0.2.0");

    expect(next).toContain("## [Unreleased]\n\n## [0.2.0]\n\n### Added\n\n- something new");
    expect(next).toContain("## [0.1.0]");
    expect(next.indexOf("## [0.2.0]")).toBeLessThan(next.indexOf("## [0.1.0]"));
  });

  it("opens a fresh Unreleased block when there is no Unreleased section", () => {
    expect(releaseChangelog("# Changelog\n", "1.0.0")).toContain("## [1.0.0]");
  });
});
