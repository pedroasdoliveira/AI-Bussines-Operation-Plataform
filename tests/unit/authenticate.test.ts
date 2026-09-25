import { describe, expect, it } from "vitest";
import { authenticate } from "@/modules/identity/application/authenticate";
import type { AuditLogin, StoredUser } from "@/modules/identity/ports";

const clock = { now: () => new Date("2026-09-24T12:00:00.000Z") };

function user(overrides: Partial<StoredUser> = {}): StoredUser {
  return {
    id: "user-1",
    email: "marina@demo.local",
    name: "Marina",
    role: "OPERATOR",
    active: true,
    passwordHash: "hash",
    ...overrides,
  };
}

function harness(found: StoredUser | null, passwordOk: boolean) {
  const audits: Parameters<AuditLogin>[0][] = [];
  const passwordsSeen: string[] = [];
  return {
    audits,
    deps: {
      users: { findByEmail: async () => found },
      passwords: {
        verify: async (password: string) => {
          passwordsSeen.push(password);
          return passwordOk;
        },
        dummyVerify: async (password: string) => {
          passwordsSeen.push(password);
          return false;
        },
      },
      auditLogin: async (entry: Parameters<AuditLogin>[0]) => {
        audits.push(entry);
      },
      clock,
    },
  };
}

describe("authenticate", () => {
  it("returns the user and audits success without the password", async () => {
    const { deps, audits } = harness(user(), true);
    const result = await authenticate({ email: " Marina@demo.local ", password: "secret" }, deps);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.user).not.toHaveProperty("passwordHash");
    expect(audits[0]).toMatchObject({
      action: "auth.login_succeeded",
      status: "SUCCESS",
      actorUserId: "user-1",
      email: "marina@demo.local",
      errorCode: null,
    });
    expect(JSON.stringify(audits[0])).not.toContain("secret");
  });

  it("uses the same denial for an unknown email and a wrong password", async () => {
    const unknown = harness(null, false);
    const wrong = harness(user(), false);
    const a = await authenticate({ email: "missing@demo.local", password: "secret" }, unknown.deps);
    const b = await authenticate({ email: "marina@demo.local", password: "secret" }, wrong.deps);
    expect(a).toEqual({ ok: false });
    expect(b).toEqual({ ok: false });
    expect(unknown.audits[0]).toMatchObject({
      action: "auth.login_failed",
      status: "DENIED",
      actorUserId: null,
      errorCode: "INVALID_CREDENTIALS",
    });
    expect(wrong.audits[0]).toMatchObject({
      action: "auth.login_failed",
      status: "DENIED",
      actorUserId: null,
      errorCode: "INVALID_CREDENTIALS",
    });
    expect(unknown.deps.passwords).toBeDefined();
  });

  it("does not authenticate an inactive user", async () => {
    const { deps, audits } = harness(user({ active: false }), true);
    const result = await authenticate({ email: "marina@demo.local", password: "secret" }, deps);
    expect(result).toEqual({ ok: false });
    expect(audits[0]?.actorUserId).toBeNull();
    expect(audits[0]?.errorCode).toBe("INVALID_CREDENTIALS");
  });
});
