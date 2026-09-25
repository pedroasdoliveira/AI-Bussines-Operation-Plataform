import {
  LOGIN_ERROR_CODE,
  normalizeEmail,
  type AuthenticatedUser,
} from "@/modules/identity/domain/login";
import type { AuditLogin, PasswordVerifier, UserRepository } from "@/modules/identity/ports";

export type AuthenticateDeps = {
  users: UserRepository;
  passwords: PasswordVerifier;
  auditLogin: AuditLogin;
  clock: { now(): Date };
};

export type AuthenticateResult = { ok: true; user: AuthenticatedUser } | { ok: false };

export async function authenticate(
  input: { email: string; password: string },
  deps: AuthenticateDeps,
): Promise<AuthenticateResult> {
  const started = deps.clock.now().getTime();
  const email = normalizeEmail(input.email);
  const user = email ? await deps.users.findByEmail(email) : null;
  const passwordMatches = user
    ? await deps.passwords.verify(input.password, user.passwordHash)
    : await deps.passwords.dummyVerify(input.password);
  const ok = Boolean(user?.active && passwordMatches);
  const durationMs = Math.max(0, deps.clock.now().getTime() - started);

  await deps.auditLogin({
    action: ok ? "auth.login_succeeded" : "auth.login_failed",
    status: ok ? "SUCCESS" : "DENIED",
    actorUserId: ok && user ? user.id : null,
    email,
    errorCode: ok ? null : LOGIN_ERROR_CODE,
    durationMs,
    outputSummary: ok && user ? { userId: user.id } : undefined,
  });

  if (!ok || !user) return { ok: false };
  return {
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}
