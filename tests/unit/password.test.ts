import { describe, expect, it } from "vitest";
import { passwordHasher } from "@/infrastructure/auth/password";

describe("passwordHasher", () => {
  it("stores a hash that is not the password and verifies it", async () => {
    const hash = await passwordHasher.hash("correct-horse");
    expect(hash).not.toContain("correct-horse");
    expect(hash.startsWith("$2")).toBe(true);
    await expect(passwordHasher.verify("correct-horse", hash)).resolves.toBe(true);
    await expect(passwordHasher.verify("wrong", hash)).resolves.toBe(false);
  });
});
