import { describe, expect, it } from "vitest";
import { loadConfig } from "@/shared/config";

describe("loadConfig", () => {
  it("applies domain defaults when optional env is absent", () => {
    const config = loadConfig({});
    expect(config.BUSINESS_TIMEZONE).toBe("America/Sao_Paulo");
    expect(config.AWAITING_PAYMENT_HOURS).toBe(48);
    expect(config.PAYMENT_FAILURES_THRESHOLD).toBe(3);
    expect(config.SHIPPING_SLA_DAYS).toBe(3);
    expect(config.AI_ACTION_TTL_HOURS).toBe(24);
    expect(config.AI_MAX_STEPS).toBe(5);
    expect(config.AI_MAX_OUTPUT_TOKENS).toBe(2048);
    expect(config.ANTHROPIC_API_KEY).toBeUndefined();
    expect(config.SEED_USER_PASSWORD).toBeUndefined();
  });
});
