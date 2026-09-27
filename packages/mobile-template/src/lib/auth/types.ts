export type Role = string;
export type Permission = string;

export type User = {
  id: string;
  email: string;
  name?: string;
  roles?: Role[];
  permissions?: Permission[];
  avatarUrl?: string;
  emailVerified?: boolean;
};

export type Session = {
  user: User;
  accessToken: string;
  refreshToken?: string;
  /** Optional epoch ms; when set, the session is treated as expired after this time. */
  expiresAt?: number;
};

export type LoginCredentials = { email: string; password: string };
export type RegisterInput = { email: string; password: string; name?: string };
export type ProfileUpdate = Partial<Pick<User, "name" | "avatarUrl">>;

export type OAuthProviderId = string;
export type OAuthAuthorize = (provider: OAuthProviderId, redirectUri: string) => Promise<Session | null>;

export interface AuthClient {
  login(credentials: LoginCredentials | string, password?: string): Promise<Session>;
  logout(): Promise<void>;
  restore(): Promise<Session | null>;
  register?(input: RegisterInput): Promise<Session>;
  requestPasswordReset?(email: string): Promise<void>;
  confirmPasswordReset?(token: string, password: string): Promise<void>;
  verifyEmail?(token: string): Promise<void>;
  refresh?(session: Session): Promise<Session>;
  updateProfile?(profile: ProfileUpdate): Promise<User>;
  loginWithOAuth?(provider: OAuthProviderId, redirectUri: string): Promise<Session | null>;
}

export type AuthStatus = "loading" | "authenticated" | "anonymous";
