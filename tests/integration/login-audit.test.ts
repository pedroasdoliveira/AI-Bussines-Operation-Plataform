import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { authenticate } from "@/modules/identity/application/authenticate";
import { passwordHasher } from "@/infrastructure/auth/password";
import { createAuditLogin } from "@/infrastructure/database/audit-repository";
import { createUserRepository } from "@/infrastructure/database/user-repository";

const databaseUrl = (process.env.DATABASE_URL ?? "postgresql://app:app@localhost:5432/app").replace(
  /\/[^/?]+(\?|$)/,
  "/app_test$1",
);

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
const email = `login-${Date.now()}@demo.local`;
const unknownEmail = `missing-${Date.now()}@demo.local`;

describe("login audit against Postgres", () => {
  beforeAll(async () => {
    const passwordHash = await passwordHasher.hash("right-password");
    await prisma.user.create({
      data: { email, name: "Marina", passwordHash, role: "OPERATOR" },
    });
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { input: { path: ["email"], equals: email } },
          { input: { path: ["email"], equals: unknownEmail } },
        ],
      },
    });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  function deps() {
    return {
      users: createUserRepository(prisma),
      passwords: passwordHasher,
      auditLogin: createAuditLogin(prisma),
      clock: { now: () => new Date() },
    };
  }

  it("records success and a denial that does not contain the password", async () => {
    const ok = await authenticate({ email, password: "right-password" }, deps());
    expect(ok.ok).toBe(true);

    const denied = await authenticate({ email: unknownEmail, password: "right-password" }, deps());
    expect(denied).toEqual({ ok: false });

    const wrong = await authenticate({ email, password: "wrong-password" }, deps());
    expect(wrong).toEqual({ ok: false });

    const rows = await prisma.auditLog.findMany({
      where: {
        OR: [
          { input: { path: ["email"], equals: email } },
          { input: { path: ["email"], equals: unknownEmail } },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    expect(rows.map((row) => row.action)).toEqual([
      "auth.login_succeeded",
      "auth.login_failed",
      "auth.login_failed",
    ]);
    expect(rows.every((row) => row.actorType === "USER" && row.source === "UI")).toBe(true);
    expect(rows[0]?.actorUserId).toBeTruthy();
    expect(rows[1]?.actorUserId).toBeNull();
    expect(rows[2]?.actorUserId).toBeNull();
    expect(rows[1]?.status).toBe("DENIED");
    expect(rows[2]?.status).toBe("DENIED");
    const serialized = JSON.stringify(rows);
    expect(serialized).not.toContain("right-password");
    expect(serialized).not.toContain("wrong-password");
    expect(serialized).not.toContain("passwordHash");
  });
});
