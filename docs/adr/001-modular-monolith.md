# ADR-001 — Monólito modular em Next.js

- **Status:** Proposed (confirmar em `docs/architecture.md`, Fase 2)
- **Data:** 2026-09-09
- **Autor:** product-manager (proposta de planejamento)
- **Revisores:** solution-architect, reviewer

## Contexto

O projeto é desenvolvido por uma pessoa com apoio de agentes de IA, com objetivo de portfólio. O [PROJECT_PLAN §12-13](../../PROJECT_PLAN.md) já recomenda evitar microservices, Kubernetes e arquitetura distribuída. Precisamos de fronteiras claras entre UI, aplicação, domínio, IA e infraestrutura sem pagar o custo operacional de múltiplos deploys.

## Decisão

Construir um **monólito modular** em Next.js (App Router) + TypeScript, com módulos por contexto de negócio (`customers`, `products`, `inventory`, `orders`, `payments`, `ai`, `audit`) e camadas explícitas: UI → application services → domain → infrastructure. A camada de IA é um módulo que só conhece application services por meio de tools.

## Alternativas consideradas

- **Microservices** — isolamento forte, mas custo operacional e de coordenação injustificável para um dev solo e um domínio pequeno.
- **Frontend separado + API (ex.: Next.js + NestJS)** — separação clara, porém dobra a superfície de configuração, deploy e tipos compartilhados sem benefício no MVP.
- **Monólito sem módulos** — mais rápido no início, mas as fronteiras entre IA e regras de negócio (a tese do projeto) ficariam implícitas.

## Trade-offs

- Ganhamos: um deploy, um repositório, tipos compartilhados ponta a ponta, velocidade.
- Perdemos: escalabilidade independente por módulo (não é requisito) e disciplina forçada de fronteiras (compensada por regras de dependência e revisão).

## Consequências

- Módulos não importam internals de outros módulos; comunicam-se por application services públicos.
- A IA não importa repositórios nem Prisma; só tools.
- Eventos/filas (V2) entram como módulo de infraestrutura, sem quebrar o monólito.
- Revisitar se surgir necessidade real de escalar um módulo isoladamente ou de time separado.

## Referências

- [PROJECT_PLAN §12-14](../../PROJECT_PLAN.md)
- [Lean Inception §2](../lean-inception.md)
