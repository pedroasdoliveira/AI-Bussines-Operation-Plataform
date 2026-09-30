import { PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import { getOrdersNeedingAttention } from "@/modules/orders/domain/attention";
import { runSeed } from "@/infrastructure/database/run-seed";
import type { AttentionOrder } from "@/modules/orders/domain/attention";

const databaseUrl = (process.env.DATABASE_URL ?? "postgresql://app:app@localhost:5432/app").replace(
  /\/[^/?]+(\?|$)/,
  "/app_test$1",
);

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
const now = new Date("2026-09-30T15:00:00.000Z");
const env = {
  ...process.env,
  NODE_ENV: "test",
  SEED_USER_PASSWORD: "seed-test-password",
  BUSINESS_TIMEZONE: "America/Sao_Paulo",
  AWAITING_PAYMENT_HOURS: "48",
  PAYMENT_FAILURES_THRESHOLD: "3",
  SHIPPING_SLA_DAYS: "3",
};

async function attentionFromDatabase() {
  const orders = await prisma.order.findMany({
    include: {
      items: { include: { product: { include: { inventory: true } } } },
      payments: true,
    },
  });
  const snapshots: AttentionOrder[] = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    priority: order.priority,
    placedAt: order.placedAt,
    shippedAt: order.shippedAt,
    expectedShipDate: order.expectedShipDate?.toISOString().slice(0, 10) ?? null,
    items: order.items.map((item) => ({
      productId: item.productId,
      sku: item.product.sku,
      quantity: item.quantity,
      available: item.product.inventory?.available ?? 0,
    })),
    payments: order.payments.map((payment) => ({
      status: payment.status,
      failureReason: payment.failureReason,
      processedAt: payment.processedAt,
      attemptNumber: payment.attemptNumber,
    })),
  }));
  return getOrdersNeedingAttention(
    snapshots,
    { awaitingPaymentHours: 48, paymentFailuresThreshold: 3, timeZone: "America/Sao_Paulo" },
    now,
  );
}

describe("database seed", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("is idempotent and keeps attention on the four anchor orders", async () => {
    await runSeed(prisma, env, now);
    const first = {
      orders: await prisma.order.count(),
      payments: await prisma.payment.count(),
      audits: await prisma.auditLog.count({ where: { id: { startsWith: "seed-audit-" } } }),
      attention: await attentionFromDatabase(),
    };
    await runSeed(prisma, env, now);
    const second = {
      orders: await prisma.order.count(),
      payments: await prisma.payment.count(),
      audits: await prisma.auditLog.count({ where: { id: { startsWith: "seed-audit-" } } }),
      attention: await attentionFromDatabase(),
    };

    expect(first.orders).toBe(120);
    expect(second).toEqual(first);
    expect(
      first.attention.map((item) => [item.orderNumber, item.reasons.map((reason) => reason.code)]),
    ).toEqual([
      [1088, ["SHIPPING_DELAYED"]],
      [1044, ["AWAITING_PAYMENT_TOO_LONG"]],
      [1091, ["ITEM_OUT_OF_STOCK"]],
      [1023, ["PAYMENT_FAILED_REPEATEDLY"]],
    ]);

    const users = await prisma.user.findMany({
      where: { email: { in: ["marina@demo.local", "rafael@demo.local"] } },
      select: { email: true, role: true },
      orderBy: { email: "asc" },
    });
    expect(users).toEqual([
      { email: "marina@demo.local", role: "OPERATOR" },
      { email: "rafael@demo.local", role: "ADMIN" },
    ]);
    expect(await prisma.customer.count()).toBe(30);
    expect(await prisma.product.count()).toBe(40);
    const failed = await prisma.payment.count({
      where: { order: { orderNumber: 1023 }, status: "FAILED" },
    });
    expect(failed).toBe(3);
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { inventory: true },
    });
    const lowStock = products.filter(
      (product) =>
        product.inventory !== null && product.inventory.available <= product.inventory.minimum,
    );
    expect(lowStock.length).toBeGreaterThanOrEqual(3);
  }, 60_000);
});
