import type { AttentionOrder } from "@/modules/orders/domain/attention";
import {
  addCalendarDays,
  addHours,
  businessToday,
  zonedDateTimeToUtc,
} from "@/modules/orders/domain/calendar";

export const SEED_CUSTOMER_COUNT = 30;
export const SEED_PRODUCT_COUNT = 40;
export const SEED_ORDER_COUNT = 120;
export const SEED_FIRST_ORDER_NUMBER = 1000;

const OUT_OF_STOCK_SKU = "SKU-001";
const LOW_STOCK_SKUS = [OUT_OF_STOCK_SKU, "SKU-002", "SKU-003"] as const;

const CUSTOMER_NAMES = [
  "Ana Lima",
  "Bruno Souza",
  "Carla Mendes",
  "Diego Alves",
  "Elena Rocha",
  "Felipe Nunes",
  "Gabriela Dias",
  "Henrique Pires",
  "Irene Costa",
  "João Martins",
  "Karina Duarte",
  "Lucas Ferreira",
  "Marina Teixeira",
  "Nicolas Barbosa",
  "Olívia Campos",
  "Paulo Ribeiro",
  "Queila Monteiro",
  "Rafael Gomes",
  "Sandra Vieira",
  "Tiago Araújo",
  "Úrsula Melo",
  "Vitor Cardoso",
  "Wanda Lopes",
  "Xavier Pinto",
  "Yasmin Correia",
  "Zeca Moreira",
  "Beatriz Cunha",
  "Caio Azevedo",
  "Diana Farias",
  "Eduardo Prado",
] as const;

const CATALOG: [name: string, category: string][] = [
  ["Camiseta algodão", "Vestuário"],
  ["Calça jeans", "Vestuário"],
  ["Jaqueta corta-vento", "Vestuário"],
  ["Tênis urbano", "Calçados"],
  ["Sandália couro", "Calçados"],
  ["Meia esportiva", "Vestuário"],
  ["Boné lona", "Acessórios"],
  ["Cinto couro", "Acessórios"],
  ["Mochila lona", "Acessórios"],
  ["Garrafa térmica", "Casa"],
  ["Caneca cerâmica", "Casa"],
  ["Jogo de toalhas", "Casa"],
  ["Luminária mesa", "Casa"],
  ["Caderno capa dura", "Papelaria"],
  ["Caneta gel", "Papelaria"],
  ["Agenda semanal", "Papelaria"],
  ["Fone com fio", "Eletrônicos"],
  ["Cabo USB-C", "Eletrônicos"],
  ["Mouse sem fio", "Eletrônicos"],
  ["Teclado compacto", "Eletrônicos"],
  ["Suporte notebook", "Eletrônicos"],
  ["Protetor solar", "Cuidados"],
  ["Hidratante corporal", "Cuidados"],
  ["Sabonete líquido", "Cuidados"],
  ["Escova de cabelo", "Cuidados"],
  ["Café torrado 250g", "Mercearia"],
  ["Chá camomila", "Mercearia"],
  ["Granola 400g", "Mercearia"],
  ["Mel silvestre", "Mercearia"],
  ["Azeite 500ml", "Mercearia"],
  ["Panela antiaderente", "Casa"],
  ["Tábua de corte", "Casa"],
  ["Jogo de copos", "Casa"],
  ["Travesseiro fibra", "Casa"],
  ["Lençol casal", "Casa"],
  ["Chinelo borracha", "Calçados"],
  ["Óculos de sol", "Acessórios"],
  ["Carteira compacta", "Acessórios"],
  ["Relógio pulseira", "Acessórios"],
  ["Guarda-chuva", "Acessórios"],
];

export type SeedConfig = {
  now: Date;
  timeZone: string;
  awaitingPaymentHours: number;
  paymentFailuresThreshold: number;
  shippingSlaDays: number;
};

export type SeedUser = {
  id: string;
  email: string;
  name: string;
  role: "OPERATOR" | "ADMIN";
};

export type SeedCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type SeedProduct = {
  id: string;
  inventoryId: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: string;
  active: true;
  available: number;
  minimum: number;
};

export type SeedPayment = {
  id: string;
  attemptNumber: number;
  method: "CREDIT_CARD" | "PIX" | "BOLETO";
  amount: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  failureReason: "INSUFFICIENT_FUNDS" | "CARD_DECLINED" | "EXPIRED" | null;
  gatewayReference: string;
  processedAt: Date | null;
  refundedAt: Date | null;
};

export type SeedOrderItem = {
  id: string;
  sku: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
};

export type SeedOrder = {
  id: string;
  orderNumber: number;
  customerId: string;
  status: AttentionOrder["status"];
  priority: "NORMAL" | "HIGH";
  subtotal: string;
  shippingFee: string;
  discount: string;
  total: string;
  placedAt: Date;
  paidAt: Date | null;
  expectedShipDate: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  items: SeedOrderItem[];
  payments: SeedPayment[];
};

export type SeedPlan = {
  users: SeedUser[];
  customers: SeedCustomer[];
  products: SeedProduct[];
  orders: SeedOrder[];
};

type FailureReason = NonNullable<SeedPayment["failureReason"]>;

const FAILURE_REASONS: FailureReason[] = ["CARD_DECLINED", "INSUFFICIENT_FUNDS", "EXPIRED"];

export function buildSeedPlan(config: SeedConfig): SeedPlan {
  const customers = buildCustomers();
  const products = buildProducts();
  const bySku = new Map(products.map((product) => [product.sku, product]));
  const orders = Array.from({ length: SEED_ORDER_COUNT }, (_, index) =>
    buildOrder(SEED_FIRST_ORDER_NUMBER + index, customers, bySku, config),
  );
  return {
    users: [
      { id: "seed-user-marina", email: "marina@demo.local", name: "Marina", role: "OPERATOR" },
      { id: "seed-user-rafael", email: "rafael@demo.local", name: "Rafael", role: "ADMIN" },
    ],
    customers,
    products,
    orders,
  };
}

export function toAttentionOrders(plan: SeedPlan): AttentionOrder[] {
  const stock = new Map(plan.products.map((product) => [product.sku, product]));
  return plan.orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    priority: order.priority,
    placedAt: order.placedAt,
    shippedAt: order.shippedAt,
    expectedShipDate: order.expectedShipDate,
    items: order.items.map((item) => {
      const product = stock.get(item.sku);
      return {
        productId: item.productId,
        sku: item.sku,
        quantity: item.quantity,
        available: product?.available ?? 0,
      };
    }),
    payments: order.payments.map((payment) => ({
      status: payment.status,
      failureReason: payment.failureReason,
      processedAt: payment.processedAt,
      attemptNumber: payment.attemptNumber,
    })),
  }));
}

function buildCustomers(): SeedCustomer[] {
  return CUSTOMER_NAMES.slice(0, SEED_CUSTOMER_COUNT).map((name, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      id: `seed-customer-${number}`,
      name,
      email: `cliente-${number}@demo.local`,
      phone: `119900000${number}`,
    };
  });
}

function buildProducts(): SeedProduct[] {
  return CATALOG.slice(0, SEED_PRODUCT_COUNT).map((entry, index) => {
    const number = String(index + 1).padStart(3, "0");
    const sku = `SKU-${number}`;
    const cents = 1990 + index * 100;
    const stock = stockFor(sku);
    return {
      id: `seed-product-${sku}`,
      inventoryId: `seed-inventory-${sku}`,
      sku,
      name: entry[0],
      description: `${entry[0]} do catálogo de demonstração.`,
      category: entry[1],
      price: centsToMoney(cents),
      active: true,
      available: stock.available,
      minimum: stock.minimum,
    };
  });
}

function stockFor(sku: string): { available: number; minimum: number } {
  if (sku === "SKU-001") return { available: 0, minimum: 2 };
  if (sku === "SKU-002") return { available: 2, minimum: 5 };
  if (sku === "SKU-003") return { available: 1, minimum: 4 };
  return { available: 40, minimum: 5 };
}

function buildOrder(
  orderNumber: number,
  customers: SeedCustomer[],
  bySku: Map<string, SeedProduct>,
  config: SeedConfig,
): SeedOrder {
  const customer = customers[(orderNumber - SEED_FIRST_ORDER_NUMBER) % customers.length]!;
  const kind = kindFor(orderNumber);
  const skus = skusFor(orderNumber, kind);
  const items = skus.map((sku) => lineFor(orderNumber, bySku.get(sku)!, 1));
  const subtotalCents = items.reduce((sum, item) => sum + moneyToCents(item.lineTotal), 0);
  const subtotal = centsToMoney(subtotalCents);
  const dates = datesFor(orderNumber, kind, config);
  const payments = paymentsFor(orderNumber, kind, subtotal, dates, config);

  return {
    id: `seed-order-${orderNumber}`,
    orderNumber,
    customerId: customer.id,
    status: kind,
    priority: "NORMAL",
    subtotal,
    shippingFee: "0.00",
    discount: "0.00",
    total: subtotal,
    placedAt: dates.placedAt,
    paidAt: dates.paidAt,
    expectedShipDate: dates.expectedShipDate,
    shippedAt: dates.shippedAt,
    deliveredAt: dates.deliveredAt,
    cancelledAt: dates.cancelledAt,
    cancellationReason: dates.cancellationReason,
    items,
    payments,
  };
}

type OrderKind = AttentionOrder["status"];

function kindFor(orderNumber: number): OrderKind {
  if (orderNumber === 1023 || orderNumber === 1044) return "PENDING_PAYMENT";
  if (orderNumber === 1088 || orderNumber === 1091) return "PAID";
  const slot = orderNumber % 10;
  if (slot === 0 || slot === 1) return "DELIVERED";
  if (slot === 2) return "SHIPPED";
  if (slot === 3 || slot === 9) return "PROCESSING";
  if (slot === 5) return "PENDING_PAYMENT";
  if (slot === 6) return "CANCELLED";
  if (slot === 7) return "CANCELLED";
  return "PAID";
}

function skusFor(orderNumber: number, kind: OrderKind): string[] {
  if (orderNumber === 1091) return [OUT_OF_STOCK_SKU, "SKU-004"];
  const open = kind === "PENDING_PAYMENT" || kind === "PAID" || kind === "PROCESSING";
  const regular = `SKU-${String((orderNumber % 36) + 4).padStart(3, "0")}`;
  if (!open && orderNumber % 5 === 0) return [OUT_OF_STOCK_SKU, regular];
  return [regular];
}

function lineFor(orderNumber: number, product: SeedProduct, quantity: number): SeedOrderItem {
  const unitCents = moneyToCents(product.price);
  return {
    id: `seed-item-${orderNumber}-${product.sku}`,
    sku: product.sku,
    productId: product.id,
    quantity,
    unitPrice: product.price,
    lineTotal: centsToMoney(unitCents * quantity),
  };
}

type OrderDates = {
  placedAt: Date;
  paidAt: Date | null;
  expectedShipDate: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
};

function datesFor(orderNumber: number, kind: OrderKind, config: SeedConfig): OrderDates {
  const today = businessToday(config.now, config.timeZone);
  if (orderNumber === 1023) {
    return emptyDates(addHours(config.now, -(config.awaitingPaymentHours - 28)));
  }
  if (orderNumber === 1044) {
    return emptyDates(addHours(config.now, -(config.awaitingPaymentHours + 12)));
  }
  if (orderNumber === 1088) {
    const expectedShipDate = addCalendarDays(today, -2);
    const paidAt = zonedDateTimeToUtc(
      addCalendarDays(expectedShipDate, -config.shippingSlaDays),
      12,
      0,
      config.timeZone,
    );
    return {
      ...emptyDates(addHours(paidAt, -1)),
      paidAt,
      expectedShipDate,
    };
  }
  if (orderNumber === 1091) {
    const expectedShipDate = addCalendarDays(today, 1);
    const paidAt = zonedDateTimeToUtc(
      addCalendarDays(expectedShipDate, -config.shippingSlaDays),
      12,
      0,
      config.timeZone,
    );
    return {
      ...emptyDates(addHours(paidAt, -1)),
      paidAt,
      expectedShipDate,
    };
  }
  if (kind === "PENDING_PAYMENT") return emptyDates(addHours(config.now, -12));
  if (kind === "CANCELLED") {
    const placedAt = addHours(config.now, -(24 * (5 + (orderNumber % 40))));
    const paidBeforeCancel = orderNumber % 10 === 7;
    const paidAt = paidBeforeCancel ? addHours(placedAt, 2) : null;
    return {
      ...emptyDates(placedAt),
      paidAt,
      expectedShipDate: paidAt
        ? addCalendarDays(businessToday(paidAt, config.timeZone), config.shippingSlaDays)
        : null,
      cancelledAt: addHours(placedAt, paidBeforeCancel ? 30 : 4),
      cancellationReason: paidBeforeCancel
        ? "Cancelado após o pagamento, com reembolso simulado."
        : "Cliente desistiu antes do pagamento.",
    };
  }

  const paidDay =
    kind === "DELIVERED" || kind === "SHIPPED"
      ? addCalendarDays(today, -(12 + (orderNumber % 30)))
      : addCalendarDays(today, -(config.shippingSlaDays - (orderNumber % 3)));
  const paidAt = zonedDateTimeToUtc(paidDay, 12, 0, config.timeZone);
  const expectedShipDate = addCalendarDays(paidDay, config.shippingSlaDays);
  const shippedAt = kind === "SHIPPED" || kind === "DELIVERED" ? addHours(paidAt, 48) : null;
  const deliveredAt = kind === "DELIVERED" && shippedAt ? addHours(shippedAt, 48) : null;
  return {
    ...emptyDates(addHours(paidAt, -2)),
    paidAt,
    expectedShipDate,
    shippedAt,
    deliveredAt,
  };
}

function emptyDates(placedAt: Date): OrderDates {
  return {
    placedAt,
    paidAt: null,
    expectedShipDate: null,
    shippedAt: null,
    deliveredAt: null,
    cancelledAt: null,
    cancellationReason: null,
  };
}

function paymentsFor(
  orderNumber: number,
  kind: OrderKind,
  amount: string,
  dates: OrderDates,
  config: SeedConfig,
): SeedPayment[] {
  if (orderNumber === 1023) {
    const reasons: FailureReason[] = ["CARD_DECLINED", "INSUFFICIENT_FUNDS", "CARD_DECLINED"];
    return Array.from({ length: config.paymentFailuresThreshold }, (_, index) =>
      failedPayment(
        orderNumber,
        index + 1,
        "CREDIT_CARD",
        reasons[index] ?? "CARD_DECLINED",
        amount,
        addHours(dates.placedAt, index + 1),
      ),
    );
  }
  if (orderNumber === 1044) {
    return [
      failedPayment(orderNumber, 1, "BOLETO", "EXPIRED", amount, addHours(dates.placedAt, 1)),
    ];
  }
  if (kind === "PENDING_PAYMENT") {
    const failures = orderNumber % config.paymentFailuresThreshold;
    return Array.from({ length: failures }, (_, index) =>
      failedPayment(
        orderNumber,
        index + 1,
        "CREDIT_CARD",
        FAILURE_REASONS[index % 3]!,
        amount,
        addHours(dates.placedAt, index + 1),
      ),
    );
  }
  if (kind === "CANCELLED" && dates.paidAt === null) {
    return [
      failedPayment(orderNumber, 1, "PIX", "CARD_DECLINED", amount, addHours(dates.placedAt, 1)),
    ];
  }
  if (kind === "CANCELLED" && dates.paidAt) {
    return [
      {
        ...paidPayment(orderNumber, amount, dates.paidAt),
        status: "REFUNDED",
        refundedAt: dates.cancelledAt,
      },
    ];
  }
  return [paidPayment(orderNumber, amount, dates.paidAt ?? dates.placedAt)];
}

function failedPayment(
  orderNumber: number,
  attemptNumber: number,
  method: SeedPayment["method"],
  failureReason: FailureReason,
  amount: string,
  processedAt: Date,
): SeedPayment {
  return {
    id: `seed-payment-${orderNumber}-${attemptNumber}`,
    attemptNumber,
    method,
    amount,
    status: "FAILED",
    failureReason,
    gatewayReference: `sim-${orderNumber}-${attemptNumber}`,
    processedAt,
    refundedAt: null,
  };
}

function paidPayment(orderNumber: number, amount: string, processedAt: Date): SeedPayment {
  return {
    id: `seed-payment-${orderNumber}-1`,
    attemptNumber: 1,
    method: "PIX",
    amount,
    status: "PAID",
    failureReason: null,
    gatewayReference: `sim-${orderNumber}-1`,
    processedAt,
    refundedAt: null,
  };
}

function centsToMoney(cents: number): string {
  const abs = Math.abs(cents);
  return `${cents < 0 ? "-" : ""}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

function moneyToCents(value: string): number {
  const [whole, fraction = "0"] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0").slice(0, 2));
}

export function lowStockSkus(): readonly string[] {
  return LOW_STOCK_SKUS;
}
