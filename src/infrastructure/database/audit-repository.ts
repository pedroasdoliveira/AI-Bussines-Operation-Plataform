import type { Prisma, PrismaClient } from "@prisma/client";
import { sanitizeAuditInput } from "@/modules/audit/domain/sanitize";
import type { AuditLogin } from "@/modules/identity/ports";

export function createAuditLogin(db: PrismaClient): AuditLogin {
  return async (entry) => {
    await db.auditLog.create({
      data: {
        actorType: "USER",
        actorUserId: entry.actorUserId,
        source: "UI",
        action: entry.action,
        input: sanitizeAuditInput({ email: entry.email }) as Prisma.InputJsonValue,
        outputSummary: entry.outputSummary,
        status: entry.status,
        errorCode: entry.errorCode,
        durationMs: entry.durationMs,
      },
    });
  };
}
