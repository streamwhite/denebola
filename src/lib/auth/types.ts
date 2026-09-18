export type User = { id: string; email: string; name?: string };
export type Session = { user: User; accessToken: string; refreshToken?: string };
export interface AuthClient { login(email: string, password: string): Promise<Session>; logout(): Promise<void>; restore(): Promise<Session | null>; }
