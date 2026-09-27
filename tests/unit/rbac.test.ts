import { describe, expect, it } from "vitest";
import { can, canAny, hasAllPermissions, hasAnyRole, hasPermission, hasRole } from "@/lib/auth/rbac";

const admin = { roles: ["admin"], permissions: ["orders:read", "orders:write"] };
const viewer = { roles: ["viewer"], permissions: ["orders:read"] };

describe("role and permission helpers", () => {
  it("checks roles and permissions", () => {
    expect(hasRole(admin, "admin")).toBe(true);
    expect(hasRole(viewer, "admin")).toBe(false);
    expect(hasPermission(viewer, "orders:read")).toBe(true);
    expect(hasAnyRole(viewer, ["admin", "viewer"])).toBe(true);
    expect(hasAllPermissions(viewer, ["orders:read"])).toBe(true);
    expect(hasAllPermissions(viewer, ["orders:read", "orders:write"])).toBe(false);
  });

  it("returns false for a missing principal", () => {
    expect(hasRole(null, "admin")).toBe(false);
    expect(can(undefined, { roles: ["admin"] })).toBe(false);
  });
});

describe("can", () => {
  it("grants when every specified dimension matches", () => {
    expect(can(admin, { roles: ["admin"], permissions: ["orders:write"] })).toBe(true);
    expect(can(viewer, { roles: ["admin"] })).toBe(false);
    expect(can(viewer, { permissions: ["orders:write"] })).toBe(false);
    expect(can(viewer, {})).toBe(true);
  });

  it("canAny succeeds when any requirement matches", () => {
    expect(canAny(viewer, [{ roles: ["admin"] }, { permissions: ["orders:read"] }])).toBe(true);
    expect(canAny(viewer, [{ roles: ["admin"] }])).toBe(false);
  });
});
