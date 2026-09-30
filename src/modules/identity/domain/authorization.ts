import { z } from "zod";
import { AuthorizationError } from "@/shared/errors";

/**
 * Matriz de `docs/architecture.md` §11.
 * `ADMIN` herda as permissões de `OPERATOR` (`docs/domain.md` §2.1).
 * Escrita em conversa alheia não é permissão de papel: continua proibida para os dois.
 */
export const PERMISSIONS = {
  operationRead: "operation.read",
  orderUpdatePriority: "order.update_priority",
  conversationReadOwn: "conversation.read_own",
  conversationWriteOwn: "conversation.write_own",
  aiActionPropose: "ai_action.propose",
  aiActionRead: "ai_action.read",
  auditReadOwn: "audit.read_own",
  aiActionDecide: "ai_action.decide",
  conversationReadAny: "conversation.read_any",
  auditReadAny: "audit.read_any",
} as const;

const permissionSchema = z.enum([
  PERMISSIONS.operationRead,
  PERMISSIONS.orderUpdatePriority,
  PERMISSIONS.conversationReadOwn,
  PERMISSIONS.conversationWriteOwn,
  PERMISSIONS.aiActionPropose,
  PERMISSIONS.aiActionRead,
  PERMISSIONS.auditReadOwn,
  PERMISSIONS.aiActionDecide,
  PERMISSIONS.conversationReadAny,
  PERMISSIONS.auditReadAny,
]);

export type Permission = z.infer<typeof permissionSchema>;

const ADMIN_ONLY = new Set<Permission>([
  PERMISSIONS.aiActionDecide,
  PERMISSIONS.conversationReadAny,
  PERMISSIONS.auditReadAny,
]);

export const sessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(1),
  role: z.enum(["OPERATOR", "ADMIN"]),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;

export function authorize(user: SessionUser, permission: Permission): void {
  const parsedUser = sessionUserSchema.safeParse(user);
  const parsedPermission = permissionSchema.safeParse(permission);
  if (!parsedUser.success || !parsedPermission.success) {
    throw new AuthorizationError();
  }
  if (parsedUser.data.role === "ADMIN") return;
  if (ADMIN_ONLY.has(parsedPermission.data)) {
    throw new AuthorizationError();
  }
}
