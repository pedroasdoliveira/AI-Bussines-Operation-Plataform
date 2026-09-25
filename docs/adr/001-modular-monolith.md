# ADR-001 — Monólito modular em Next.js

- **Status:** Accepted (confirmado em H00.2, 2026-09-24, por solution-architect / Grok 4.7; proposta do product-manager em 2026-09-09)
- **Data:** 2026-09-09 (confirmação: 2026-09-24)
- **Autor:** product-manager (proposta); solution-architect (confirmação)
- **Revisores:** solution-architect, reviewer

## Contexto

O projeto é desenvolvido por uma pessoa com apoio de agentes de IA, com objetivo de portfólio. O [PROJECT_PLAN §12-13](../../PROJECT_PLAN.md) já recomenda evitar microservices, Kubernetes e arquitetura distribuída. Precisamos de fronteiras claras entre UI, aplicação, domínio, IA e infraestrutura sem pagar o custo operacional de múltiplos deploys.

## Decisão

Construir um **monólito modular** em Next.js (App Router) + TypeScript. Módulos de negócio: `identity`, `customers`, `products` (inclui `Inventory`), `orders`, `payments`, `assistant` (persistência de `Conversation`, `Message`, `AIAction`) e `audit`. Camadas: UI → application → domain; infrastructure implementa portas. A orquestração do modelo vive em `src/ai` (não é módulo de domínio) e só alcança o sistema por tools que chamam application services.

## Alternativas consideradas

- **Microservices** — isolamento forte, mas custo operacional e de coordenação injustificável para um dev solo e um domínio pequeno.
- **Frontend separado + API (ex.: Next.js + NestJS)** — separação clara, porém dobra a superfície de configuração, deploy e tipos compartilhados sem benefício no MVP.
- **Monólito sem módulos** — mais rápido no início, mas as fronteiras entre IA e regras de negócio (a tese do projeto) ficariam implícitas.

## Trade-offs

- Ganhamos: um deploy, um repositório, tipos compartilhados ponta a ponta, velocidade.
- Perdemos: escalabilidade independente por módulo (não é requisito) e disciplina forçada de fronteiras (compensada por regras de dependência e revisão).

## Confirmação (H00.2)

A decisão (monólito modular, um deploy) permanece. O mapa de módulos foi ajustado para coincidir com `docs/domain.md` §1: `inventory` não é módulo (fica em `products`); `ai` deixa de ser módulo de negócio e separa-se em `assistant` (persistência) e `src/ai` (orquestração). Não há ADR substituto — a fronteira e a stack não mudaram.

## Consequências

- Módulos não importam internals de outros módulos; comunicam-se por application services públicos.
- A IA não importa repositórios nem Prisma; só tools.
- Eventos/filas (V2) entram como módulo de infraestrutura, sem quebrar o monólito.
- Revisitar se surgir necessidade real de escalar um módulo isoladamente ou de time separado.

## Referências

- [PROJECT_PLAN §12-14](../../PROJECT_PLAN.md)
- [Lean Inception §2](../lean-inception.md)
