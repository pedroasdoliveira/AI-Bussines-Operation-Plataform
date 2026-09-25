import { describe, expect, it } from "vitest";
import { sanitizeAuditInput } from "@/modules/audit/domain/sanitize";

describe("sanitizeAuditInput", () => {
  it("removes password material and keeps the email", () => {
    const sanitized = sanitizeAuditInput({
      email: "marina@demo.local",
      password: "secret",
      nested: { passwordHash: "hash", api_key: "sk" },
    });
    expect(sanitized).toEqual({
      email: "marina@demo.local",
      password: "[redacted]",
      nested: { passwordHash: "[redacted]", api_key: "[redacted]" },
    });
    expect(JSON.stringify(sanitized)).not.toContain("secret");
    expect(JSON.stringify(sanitized)).not.toContain("hash");
  });
});
