import { describe, expect, it } from "vitest";
import { AuthorizationError } from "@/shared/errors";
import {
  PERMISSIONS,
  authorize,
  type Permission,
  type SessionUser,
} from "@/modules/identity/domain/authorization";

const operator: SessionUser = {
  id: "user-operator",
  email: "marina@demo.local",
  role: "OPERATOR",
};

const admin: SessionUser = {
  id: "user-admin",
  email: "rafael@demo.local",
  role: "ADMIN",
};

describe("authorize", () => {
  it("denies OPERATOR on an ADMIN permission", () => {
    expect(() => authorize(operator, PERMISSIONS.aiActionDecide)).toThrow(AuthorizationError);
    try {
      authorize(operator, PERMISSIONS.aiActionDecide);
    } catch (error) {
      expect(error).toBeInstanceOf(AuthorizationError);
      expect((error as AuthorizationError).errorCode).toBe("DENIED");
    }
  });

  it("denies OPERATOR on reading any conversation or the full audit trail", () => {
    expect(() => authorize(operator, PERMISSIONS.conversationReadAny)).toThrow(AuthorizationError);
    expect(() => authorize(operator, PERMISSIONS.auditReadAny)).toThrow(AuthorizationError);
  });

  it("allows ADMIN to decide an AI action and to use operator permissions", () => {
    expect(() => authorize(admin, PERMISSIONS.aiActionDecide)).not.toThrow();
    expect(() => authorize(admin, PERMISSIONS.operationRead)).not.toThrow();
    expect(() => authorize(admin, PERMISSIONS.orderUpdatePriority)).not.toThrow();
  });

  it("allows OPERATOR to operate, propose, and read the approval queue", () => {
    expect(() => authorize(operator, PERMISSIONS.operationRead)).not.toThrow();
    expect(() => authorize(operator, PERMISSIONS.aiActionPropose)).not.toThrow();
    expect(() => authorize(operator, PERMISSIONS.aiActionRead)).not.toThrow();
    expect(() => authorize(operator, PERMISSIONS.auditReadOwn)).not.toThrow();
  });

  it("denies a session or permission that fails validation", () => {
    const broken = { ...operator, role: "GUEST" } as SessionUser;
    expect(() => authorize(broken, PERMISSIONS.operationRead)).toThrow(AuthorizationError);
    expect(() => authorize(operator, "user.delete" as Permission)).toThrow(AuthorizationError);
  });
});
