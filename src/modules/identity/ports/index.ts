import type { AuthenticatedUser, Role } from "@/modules/identity/domain/login";

export type StoredUser = AuthenticatedUser & {
  active: boolean;
  passwordHash: string;
};

export type UserRepository = {
  findByEmail(email: string): Promise<StoredUser | null>;
};

export type PasswordVerifier = {
  verify(password: string, passwordHash: string): Promise<boolean>;
  dummyVerify(password: string): Promise<boolean>;
};

export type AuditLogin = (entry: {
  action: "auth.login_succeeded" | "auth.login_failed";
  status: "SUCCESS" | "DENIED";
  actorUserId: string | null;
  email: string;
  errorCode: string | null;
  durationMs: number;
  outputSummary?: { userId: string };
}) => Promise<void>;

export type { Role };
