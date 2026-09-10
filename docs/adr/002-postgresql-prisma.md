# ADR-002 — PostgreSQL com Prisma ORM

- **Status:** Proposed (confirmar em `docs/architecture.md`, Fase 2)
- **Data:** 2026-09-09
- **Autor:** product-manager (proposta de planejamento)
- **Revisores:** solution-architect, software-engineer

## Contexto

O domínio é relacional (cliente → pedidos → itens → produtos; pedido → pagamentos) e exige integridade (estados de pedido, auditoria imutável). Precisamos de migrations versionadas, seed determinístico e tipos gerados para TypeScript. Ambiente de dev é Docker local; produção provável em Postgres gerenciado.

## Decisão

Usar **PostgreSQL 16** (Docker Compose em dev) com **Prisma ORM** para schema, migrations, seed e cliente tipado.

## Alternativas consideradas

- **SQLite** — zero infra, mas diverge do ambiente de produção e limita concorrência e tipos (enums, JSON).
- **MongoDB** — flexível, porém o domínio é relacional e a auditoria se beneficia de integridade referencial.
- **Drizzle ORM** — mais leve e SQL-first; Prisma foi escolhido pela maturidade de migrations, seed e ecossistema no Next.js. Decisão reversível se a fase de arquitetura apontar limitações.

## Trade-offs

- Ganhamos: tipos ponta a ponta, migrations confiáveis, seed simples, `@@index` e constraints declarativos.
- Perdemos: controle fino sobre SQL em consultas complexas (mitigável com `$queryRaw` em casos pontuais).

## Consequências

- Todo modelo segue as convenções do projeto: `id` com `cuid()`, `createdAt`/`updatedAt`, relações declaradas em ambos os lados, `@@index` em campos filtrados (status, datas, `orderId`).
- `AuditLog` é append-only (sem update/delete pela aplicação).
- Seed em `prisma/seed.ts`, determinístico e idempotente (roadmap H03.1).
- Hospedagem do banco em produção definida em ADR futuro (onda 5).

## Referências

- [PROJECT_PLAN §15](../../PROJECT_PLAN.md)
- [Roadmap H01.1, H03.1](../roadmap.md)
