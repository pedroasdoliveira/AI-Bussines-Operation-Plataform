import type { Prisma, PrismaClient } from "@prisma/client";
import { passwordHasher } from "@/infrastructure/auth/password";
import { loadConfig } from "@/shared/config";
import { resolveSeedPassword } from "@/infrastructure/database/seed-password";
import {
  buildSeedPlan,
  type SeedOrder,
  type SeedPayment,
  type SeedPlan,
} from "@/infrastructure/database/seed-plan";

export async function runSeed(
  db: PrismaClient,
  env: NodeJS.ProcessEnv,
  now = new Date(),
): Promise<SeedPlan> {
  const password = resolveSeedPassword(env);
  const config = loadConfig(env);
  const plan = buildSeedPlan({
    now,
    timeZone: config.BUSINESS_TIMEZONE,
    awaitingPaymentHours: config.AWAITING_PAYMENT_HOURS,
    paymentFailuresThreshold: config.PAYMENT_FAILURES_THRESHOLD,
    shippingSlaDays: config.SHIPPING_SLA_DAYS,
  });

  for (const user of plan.users) {
    const existing = await db.user.findUnique({ where: { email: user.email } });
    const passwordHash =
      existing && (await passwordHasher.verify(password, existing.passwordHash))
        ? existing.passwordHash
        : await passwordHasher.hash(password);
    await db.user.upsert({
      where: { email: user.email },
      create: { ...user, passwordHash, active: true },
      update: { name: user.name, role: user.role, active: true, passwordHash },
    });
  }

  await db.$transaction(
    async (tx) => {
      for (const customer of plan.customers) {
        await tx.customer.upsert({
          where: { email: customer.email },
          create: customer,
          update: { name: customer.name, phone: customer.phone },
        });
      }
      for (const product of plan.products) {
        await tx.product.upsert({
          where: { sku: product.sku },
          create: {
            id: product.id,
            sku: product.sku,
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            active: product.active,
          },
          update: {
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            active: product.active,
          },
        });
        await tx.inventory.upsert({
          where: { productId: product.id },
          create: {
            id: product.inventoryId,
            productId: product.id,
            available: product.available,
            minimum: product.minimum,
          },
          update: { available: product.available, minimum: product.minimum },
        });
      }
      for (const order of plan.orders) {
        await tx.order.upsert({
          where: { orderNumber: order.orderNumber },
          create: orderData(order),
          update: orderData(order, false),
        });
        for (const item of order.items) {
          await tx.orderItem.upsert({
            where: { orderId_productId: { orderId: order.id, productId: item.productId } },
            create: {
              id: item.id,
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            },
            update: {
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            },
          });
        }
        for (const payment of order.payments) {
          await tx.payment.upsert({
            where: {
              orderId_attemptNumber: { orderId: order.id, attemptNumber: payment.attemptNumber },
            },
            create: paymentData(order.id, payment),
            update: paymentData(order.id, payment, false),
          });
        }
      }
      await tx.auditLog.createMany({ data: auditRows(plan), skipDuplicates: true });
    },
    { timeout: 60_000 },
  );

  return plan;
}

function orderData(order: SeedOrder, includeId = true): Prisma.OrderUncheckedCreateInput {
  return {
    ...(includeId ? { id: order.id } : {}),
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    status: order.status,
    priority: order.priority,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    discount: order.discount,
    total: order.total,
    placedAt: order.placedAt,
    paidAt: order.paidAt,
    expectedShipDate: order.expectedShipDate
      ? new Date(`${order.expectedShipDate}T00:00:00.000Z`)
      : null,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
    cancellationReason: order.cancellationReason,
  };
}

function paymentData(
  orderId: string,
  payment: SeedPayment,
  includeId = true,
): Prisma.PaymentUncheckedCreateInput {
  return {
    ...(includeId ? { id: payment.id } : {}),
    orderId,
    attemptNumber: payment.attemptNumber,
    method: payment.method,
    amount: payment.amount,
    status: payment.status,
    failureReason: payment.failureReason,
    gatewayReference: payment.gatewayReference,
    processedAt: payment.processedAt,
    refundedAt: payment.refundedAt,
  };
}

function auditRows(plan: SeedPlan): Prisma.AuditLogCreateManyInput[] {
  const rows: Prisma.AuditLogCreateManyInput[] = [];
  for (const order of plan.orders) {
    for (const payment of order.payments) {
      if (payment.status === "FAILED") {
        rows.push(
          audit(
            `seed-audit-${order.orderNumber}-payment.failed-${payment.attemptNumber}`,
            "payment.failed",
            "Payment",
            payment.id,
            payment.processedAt,
            {
              orderNumber: order.orderNumber,
              attemptNumber: payment.attemptNumber,
              failureReason: payment.failureReason,
            },
            { status: "FAILED" },
          ),
        );
      }
      if (payment.status === "PAID" || payment.status === "REFUNDED") {
        rows.push(
          audit(
            `seed-audit-${order.orderNumber}-payment.paid`,
            "payment.paid",
            "Payment",
            payment.id,
            payment.processedAt,
            { orderNumber: order.orderNumber },
            { status: "PAID" },
          ),
        );
        rows.push(
          audit(
            `seed-audit-${order.orderNumber}-order.payment_confirmed`,
            "order.payment_confirmed",
            "Order",
            order.id,
            payment.processedAt,
            { orderNumber: order.orderNumber },
            { status: "PAID" },
          ),
        );
      }
      if (payment.status === "REFUNDED") {
        rows.push(
          audit(
            `seed-audit-${order.orderNumber}-payment.refunded`,
            "payment.refunded",
            "Payment",
            payment.id,
            payment.refundedAt,
            { orderNumber: order.orderNumber },
            { status: "REFUNDED" },
          ),
        );
      }
    }
    if (
      order.status === "PROCESSING" ||
      order.status === "SHIPPED" ||
      order.status === "DELIVERED"
    ) {
      rows.push(
        audit(
          `seed-audit-${order.orderNumber}-order.status_changed`,
          "order.status_changed",
          "Order",
          order.id,
          order.shippedAt ?? order.paidAt,
          { orderNumber: order.orderNumber },
          { status: order.status },
        ),
      );
    }
    if (order.status === "CANCELLED") {
      rows.push(
        audit(
          `seed-audit-${order.orderNumber}-order.cancelled`,
          "order.cancelled",
          "Order",
          order.id,
          order.cancelledAt,
          { orderNumber: order.orderNumber, cancellationReason: order.cancellationReason },
          { status: "CANCELLED" },
        ),
      );
    }
  }
  return rows;
}

function audit(
  id: string,
  action: string,
  entityType: string,
  entityId: string,
  createdAt: Date | null,
  input: Record<string, unknown>,
  outputSummary: Record<string, unknown>,
): Prisma.AuditLogCreateManyInput {
  return {
    id,
    actorType: "SYSTEM",
    source: "SYSTEM",
    action,
    entityType,
    entityId,
    input: input as Prisma.InputJsonValue,
    outputSummary: outputSummary as Prisma.InputJsonValue,
    status: "SUCCESS",
    createdAt: createdAt ?? undefined,
  };
}
