/**
 * Orquestração do modelo. Sem Prisma, repositório ou SQL (ADR-003).
 * Provider e registry chegam em H11.1 e H12.1.
 */
export const AI_LAYER = "orchestration" as const;
