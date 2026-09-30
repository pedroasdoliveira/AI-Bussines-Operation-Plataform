import { businessToday, calendarDaysBetween, hoursBetween } from "@/modules/orders/domain/calendar";

export type AttentionReasonCode =
  | "PAYMENT_FAILED_REPEATEDLY"
  | "AWAITING_PAYMENT_TOO_LONG"
  | "SHIPPING_DELAYED"
  | "ITEM_OUT_OF_STOCK";

export type AttentionConfig = {
  awaitingPaymentHours: number;
  paymentFailuresThreshold: number;
  timeZone: string;
};

export type AttentionPayment = {
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  failureReason: "INSUFFICIENT_FUNDS" | "CARD_DECLINED" | "EXPIRED" | null;
  processedAt: Date | null;
  attemptNumber: number;
};

export type AttentionItemLine = {
  productId: string;
  sku: string;
  quantity: number;
  available: number;
};

export type AttentionOrder = {
  id: string;
  orderNumber: number;
  status: "PENDING_PAYMENT" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  priority: "NORMAL" | "HIGH";
  placedAt: Date;
  shippedAt: Date | null;
  expectedShipDate: string | null;
  items: AttentionItemLine[];
  payments: AttentionPayment[];
};

export type AttentionReason = {
  code: AttentionReasonCode;
  details: Record<string, unknown>;
};

export type AttentionItem = {
  orderId: string;
  orderNumber: number;
  priority: AttentionOrder["priority"];
  reasons: AttentionReason[];
};

const REASON_ORDER: AttentionReasonCode[] = [
  "PAYMENT_FAILED_REPEATEDLY",
  "AWAITING_PAYMENT_TOO_LONG",
  "SHIPPING_DELAYED",
  "ITEM_OUT_OF_STOCK",
];

export function getOrdersNeedingAttention(
  orders: AttentionOrder[],
  config: AttentionConfig,
  now: Date,
): AttentionItem[] {
  const today = businessToday(now, config.timeZone);
  const items = orders
    .map((order) => ({
      orderId: order.id,
      orderNumber: order.orderNumber,
      priority: order.priority,
      placedAt: order.placedAt,
      reasons: reasonsFor(order, config, now, today),
    }))
    .filter((item) => item.reasons.length > 0);

  items.sort((a, b) => {
    const priority = Number(b.priority === "HIGH") - Number(a.priority === "HIGH");
    if (priority !== 0) return priority;
    const reasonCount = b.reasons.length - a.reasons.length;
    if (reasonCount !== 0) return reasonCount;
    return a.placedAt.getTime() - b.placedAt.getTime();
  });

  return items.map(({ placedAt: _placedAt, ...item }) => item);
}

function reasonsFor(
  order: AttentionOrder,
  config: AttentionConfig,
  now: Date,
  today: string,
): AttentionReason[] {
  const reasons: AttentionReason[] = [];
  const failed = order.payments.filter((payment) => payment.status === "FAILED");

  if (order.status === "PENDING_PAYMENT" && failed.length >= config.paymentFailuresThreshold) {
    const last = [...failed].sort((a, b) => {
      const time = (a.processedAt?.getTime() ?? 0) - (b.processedAt?.getTime() ?? 0);
      return time !== 0 ? time : a.attemptNumber - b.attemptNumber;
    })[failed.length - 1];
    reasons.push({
      code: "PAYMENT_FAILED_REPEATEDLY",
      details: {
        failures: failed.length,
        lastFailureReason: last?.failureReason ?? null,
        lastFailedAt: last?.processedAt?.toISOString() ?? null,
      },
    });
  }

  if (
    order.status === "PENDING_PAYMENT" &&
    hoursBetween(order.placedAt, now) >= config.awaitingPaymentHours
  ) {
    reasons.push({
      code: "AWAITING_PAYMENT_TOO_LONG",
      details: { hoursWaiting: Math.floor(hoursBetween(order.placedAt, now)) },
    });
  }

  if (
    (order.status === "PAID" || order.status === "PROCESSING") &&
    order.shippedAt === null &&
    order.expectedShipDate !== null &&
    today > order.expectedShipDate
  ) {
    reasons.push({
      code: "SHIPPING_DELAYED",
      details: {
        expectedShipDate: order.expectedShipDate,
        daysLate: calendarDaysBetween(order.expectedShipDate, today),
      },
    });
  }

  if (order.status === "PAID" || order.status === "PROCESSING") {
    const missing = order.items.filter((item) => item.available < item.quantity);
    if (missing.length > 0) {
      reasons.push({
        code: "ITEM_OUT_OF_STOCK",
        details: {
          items: missing.map((item) => ({
            productId: item.productId,
            sku: item.sku,
            required: item.quantity,
            available: item.available,
          })),
        },
      });
    }
  }

  return REASON_ORDER.flatMap((code) => reasons.filter((reason) => reason.code === code));
}
