export type UpdatePolicy = { channel: "development" | "staging" | "production"; allowRuntime: string };
export const updatePolicy: UpdatePolicy = { channel: "development", allowRuntime: "1" };
