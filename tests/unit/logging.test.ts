import { describe, expect, it } from "vitest";
import { formatLog } from "@/shared/logging";

describe("formatLog", () => {
  it("emits JSON and redacts secrets", () => {
    const line = formatLog({
      level: "info",
      message: "auth",
      timestamp: "2026-09-24T00:00:00.000Z",
      password: "plain",
      api_key: "sk-test",
    });
    const parsed = JSON.parse(line) as { password: string; api_key: string; message: string };
    expect(parsed.message).toBe("auth");
    expect(parsed.password).toBe("[redacted]");
    expect(parsed.api_key).toBe("[redacted]");
    expect(line).not.toContain("plain");
    expect(line).not.toContain("sk-test");
  });
});
