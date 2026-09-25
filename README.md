# AI Business Operations Platform

Plataforma de operações para pequenos e-commerces em que um assistente de IA consulta pedidos, clientes, produtos, estoque e pagamentos e executa ações operacionais **exclusivamente por meio de ferramentas controladas**. A IA interpreta a intenção; o sistema mantém regras de negócio, autorização, auditoria e aprovação humana determinísticas. Não é um chatbot com acesso ao banco: é um sistema de negócio com uma camada inteligente.

> Status: planejamento concluído (Lean Inception) e domínio aprovado (H00.1). Próximo passo: Fase 2 — `docs/architecture.md` (H00.2).

## Documentação

- [PROJECT_PLAN.md](./PROJECT_PLAN.md) — visão original, objetivos, fases e princípios.
- [docs/discovery.md](./docs/discovery.md) — problema, usuário, casos de uso, hipóteses, critério de sucesso.
- [docs/lean-inception.md](./docs/lean-inception.md) — visão do produto, personas, jornadas, features, sequenciador em ondas, MVP Canvas, decisões.
- [docs/roadmap.md](./docs/roadmap.md) — backlog por onda com histórias, critérios de aceite, owner e revisores.
- [docs/adr/](./docs/adr/) — Architecture Decision Records (001 monólito modular, 002 PostgreSQL + Prisma, 003 fronteira IA/tools, 004 autenticação e papéis, 005 provedor Anthropic, 006 human-in-the-loop).
- [docs/domain.md](./docs/domain.md) — linguagem ubíqua: entidades, máquinas de estado, regras parametrizadas, glossário, requisitos do seed.
- `docs/architecture.md` — a produzir na Fase 2 (H00.2).

## MVP em uma frase

A operadora pergunta "quais pedidos precisam de atenção?", recebe a lista com motivos baseados em regras determinísticas, marca prioridades direto pelo assistente e o gestor aprova cancelamentos propostos pela IA, com tudo registrado em auditoria.

## Como o trabalho é organizado

Equipe: um desenvolvedor + agentes do Cursor com papéis definidos em [`.cursor/agents/`](./.cursor/agents/):

- `product-manager` — requisitos, escopo, histórias e critérios de aceite.
- `solution-architect` — domínio, arquitetura, ADRs e fronteiras.
- `software-engineer` — implementação de módulos, services, Prisma e UI.
- `ai-engineer` — tools, prompts, orquestração e golden set de avaliação.
- `qa-engineer` — testes unitários, integração, E2E e casos extremos.
- `security-engineer` — auditoria de auth, tools, prompt injection e secrets (somente leitura).
- `reviewer` — revisão cética antes do merge (somente leitura).

Regras compartilhadas em [`.cursor/rules/`](./.cursor/rules/): princípios do projeto e fluxo de trabalho (uma história por vez, revisões obrigatórias, ADR antes de decisão arquitetural).

Skills reutilizáveis em [`.cursor/skills/`](./.cursor/skills/): `writing-user-stories`, `writing-adrs`, `defining-ai-tools`, `ai-golden-set`, `story-lifecycle`, `review-reports`.

## Stack prevista

Next.js (App Router) + TypeScript, PostgreSQL + Prisma, Auth.js, Vercel AI SDK + Anthropic Claude, Docker Compose em desenvolvimento.
