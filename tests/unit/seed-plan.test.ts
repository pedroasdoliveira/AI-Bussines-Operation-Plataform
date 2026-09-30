import { describe, expect, it } from "vitest";
import { getOrdersNeedingAttention } from "@/modules/orders/domain/attention";
import { businessToday } from "@/modules/orders/domain/calendar";
import { resolveSeedPassword } from "@/infrastructure/database/seed-password";
import {
  SEED_CUSTOMER_COUNT,
  SEED_ORDER_COUNT,
  SEED_PRODUCT_COUNT,
  buildSeedPlan,
  lowStockSkus,
  toAttentionOrders,
} from "@/infrastructure/database/seed-plan";

const now = new Date("2026-09-30T15:00:00.000Z");
const config = {
  now,
  timeZone: "America/Sao_Paulo",
  awaitingPaymentHours: 48,
  paymentFailuresThreshold: 3,
  shippingSlaDays: 3,
};

describe("seed plan", () => {
  const plan = buildSeedPlan(config);

  it("builds the fixed volume and the two demo users", () => {
    expect(plan.users.map((user) => [user.email, user.role])).toEqual([
      ["marina@demo.local", "OPERATOR"],
      ["rafael@demo.local", "ADMIN"],
    ]);
    expect(plan.customers).toHaveLength(SEED_CUSTOMER_COUNT);
    expect(plan.products).toHaveLength(SEED_PRODUCT_COUNT);
    expect(plan.orders).toHaveLength(SEED_ORDER_COUNT);
    expect(new Set(plan.orders.map((order) => order.orderNumber)).size).toBe(SEED_ORDER_COUNT);
    expect(
      plan.products
        .filter((product) => product.available <= product.minimum)
        .map((product) => product.sku),
    ).toEqual([...lowStockSkus()]);
  });

  it("keeps only the four anchor orders in attention, each with one reason", () => {
    const attention = getOrdersNeedingAttention(toAttentionOrders(plan), config, now);
    expect(
      attention.map((item) => [item.orderNumber, item.reasons.map((reason) => reason.code)]),
    ).toEqual([
      [1088, ["SHIPPING_DELAYED"]],
      [1044, ["AWAITING_PAYMENT_TOO_LONG"]],
      [1091, ["ITEM_OUT_OF_STOCK"]],
      [1023, ["PAYMENT_FAILED_REPEATEDLY"]],
    ]);
    const byNumber = new Map(attention.map((item) => [item.orderNumber, item]));
    expect(byNumber.get(1023)?.reasons[0]?.details).toMatchObject({
      failures: 3,
      lastFailureReason: "CARD_DECLINED",
    });
    expect(byNumber.get(1044)?.reasons[0]?.details).toEqual({ hoursWaiting: 60 });
    expect(byNumber.get(1088)?.reasons[0]?.details).toEqual({
      expectedShipDate: "2026-09-28",
      daysLate: 2,
    });
    expect(byNumber.get(1091)?.reasons[0]?.details).toMatchObject({
      items: [expect.objectContaining({ sku: "SKU-001", required: 1, available: 0 })],
    });
  });

  it("matches the anchor facts from domain §8", () => {
    const today = businessToday(now, config.timeZone);
    const order = (number: number) => plan.orders.find((item) => item.orderNumber === number)!;
    const failed = order(1023);
    expect(failed.status).toBe("PENDING_PAYMENT");
    expect(failed.payments.map((payment) => payment.status)).toEqual([
      "FAILED",
      "FAILED",
      "FAILED",
    ]);
    expect(
      failed.payments.every((payment) => payment.method === "CREDIT_CARD" && payment.failureReason),
    ).toBe(true);
    expect(failed.placedAt.toISOString()).toBe("2026-09-29T19:00:00.000Z");

    const waiting = order(1044);
    expect(waiting.payments).toMatchObject([
      { status: "FAILED", method: "BOLETO", failureReason: "EXPIRED", attemptNumber: 1 },
    ]);
    expect(waiting.placedAt.toISOString()).toBe("2026-09-28T03:00:00.000Z");

    const late = order(1088);
    expect(late.status).toBe("PAID");
    expect(late.expectedShipDate).toBe("2026-09-28");
    expect(late.shippedAt).toBeNull();
    expect(late.payments).toMatchObject([{ status: "PAID" }]);

    const stock = order(1091);
    expect(stock.status).toBe("PAID");
    expect(stock.expectedShipDate! > today).toBe(true);
    expect(stock.expectedShipDate! <= "2026-10-03").toBe(true);
    expect(plan.products.find((product) => product.sku === "SKU-001")).toMatchObject({
      available: 0,
      active: true,
    });
  });
});

describe("attention reasons stay independent", () => {
  it("reports repeated failure and long wait together when both match", () => {
    const plan = buildSeedPlan(config);
    const anchor = toAttentionOrders(plan).find((order) => order.orderNumber === 1023)!;
    const aged = { ...anchor, placedAt: new Date(now.getTime() - 60 * 3_600_000) };
    const attention = getOrdersNeedingAttention([aged], config, now);
    expect(attention[0]?.reasons.map((reason) => reason.code)).toEqual([
      "PAYMENT_FAILED_REPEATEDLY",
      "AWAITING_PAYMENT_TOO_LONG",
    ]);
  });
});

describe("resolveSeedPassword", () => {
  it("uses the documented development default when the env var is absent", () => {
    expect(resolveSeedPassword({ NODE_ENV: "development" })).toBe("dev-only-change-me");
  });

  it("refuses the development default in production", () => {
    expect(() =>
      resolveSeedPassword({ NODE_ENV: "production", SEED_USER_PASSWORD: "dev-only-change-me" }),
    ).toThrow(/NODE_ENV=production/);
    expect(
      resolveSeedPassword({ NODE_ENV: "production", SEED_USER_PASSWORD: "uma-senha-forte" }),
    ).toBe("uma-senha-forte");
  });
});
