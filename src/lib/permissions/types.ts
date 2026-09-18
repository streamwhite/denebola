export type PermissionName = "camera" | "photos" | "notifications" | "location" | "microphone" | "contacts" | "bluetooth";
export type PermissionService = { get: (name: PermissionName) => Promise<import("@/lib/permissions/permission").PermissionStatus>; request: (name: PermissionName) => Promise<import("@/lib/permissions/permission").PermissionStatus> };
