import { describe, expect, it } from "vitest";
import { readOsInfo } from "@/lib/device/osInfo";
import { describePlatform } from "@/lib/device/platformInfo";

describe("readOsInfo", () => {
  it("projects platform data into OS info", () => {
    const platform = describePlatform("ios", 18);

    expect(readOsInfo(platform, "22A")).toEqual({ name: "ios", version: "18", build: "22A" });
    expect(readOsInfo(platform).build).toBeNull();
  });
});
