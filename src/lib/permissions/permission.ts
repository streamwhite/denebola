export type PermissionStatus = "granted" | "denied" | "limited" | "undetermined";
export type Permission = { get: () => Promise<PermissionStatus>; request: () => Promise<PermissionStatus> };
export async function requestPermission(permission: Permission, explain?: () => Promise<boolean>): Promise<boolean> { if (explain && !(await explain())) return false; return (await permission.request()) === "granted"; }
