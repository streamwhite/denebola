import { describe, expect, it, vi } from "vitest";
import { createPermissionGate } from "@/lib/permissions/gate";
import { isGranted, requestPermission, requestPermissionStatus } from "@/lib/permissions/permission";
import { createMemoryPermissionHandle, createPermissionService, readPermissionStates } from "@/lib/permissions/registry";
import { isPermissionName, PERMISSION_NAMES } from "@/lib/permissions/types";

describe("permission helpers", () => {
  it("treats granted and limited as usable", () => {
    expect(isGranted("granted")).toBe(true);
    expect(isGranted("limited")).toBe(true);
    expect(isGranted("denied")).toBe(false);
    expect(isGranted("undetermined")).toBe(false);
  });

  it("returns a status and honors the explanation gate", async () => {
    const handle = createMemoryPermissionHandle();

    expect(await requestPermissionStatus(handle)).toBe("granted");
    expect(await requestPermission(handle, async () => false)).toBe(false);
  });
});

describe("createPermissionService", () => {
  it("resolves injected handlers per name and defaults to undetermined", async () => {
    const service = createPermissionService({ camera: createMemoryPermissionHandle("denied") });

    expect(await service.get("camera")).toBe("denied");
    expect(await service.request("camera")).toBe("granted");
    expect(await service.get("location")).toBe("undetermined");
  });

  it("reads aggregate states for every known permission", async () => {
    const service = createPermissionService({ camera: createMemoryPermissionHandle("granted") });

    const states = await readPermissionStates(service);

    expect(Object.keys(states)).toHaveLength(PERMISSION_NAMES.length);
    expect(states.camera).toBe("granted");
  });

  it("guards permission names", () => {
    expect(isPermissionName("camera")).toBe(true);
    expect(isPermissionName("nope")).toBe(false);
  });
});

describe("createPermissionGate", () => {
  it("skips the explanation when already granted", async () => {
    const explain = vi.fn(async () => true);
    const gate = createPermissionGate({ service: createPermissionService({ photos: createMemoryPermissionHandle("granted") }), explain });

    expect(await gate.ensure("photos")).toBe("granted");
    expect(explain).not.toHaveBeenCalled();
  });

  it("explains then requests when undetermined", async () => {
    const explain = vi.fn(async () => true);
    const gate = createPermissionGate({ service: createPermissionService({ camera: createMemoryPermissionHandle() }), explain });

    expect(await gate.ensure("camera")).toBe("granted");
    expect(explain).toHaveBeenCalledWith("camera");
  });

  it("denies when the explanation is declined", async () => {
    const gate = createPermissionGate({ service: createPermissionService({ location: createMemoryPermissionHandle() }), explain: async () => false });

    expect(await gate.ensure("location")).toBe("denied");
  });
});
