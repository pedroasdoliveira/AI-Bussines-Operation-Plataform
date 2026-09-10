# ADR-003 — Fronteira entre IA e sistema: acesso exclusivamente por tools

- **Status:** Proposed (confirmar em `docs/architecture.md`, Fase 2)
- **Data:** 2026-09-09
- **Autor:** product-manager (proposta de planejamento)
- **Revisores:** solution-architect, ai-engineer, security-engineer

## Contexto

A tese do projeto é que IA pode operar um sistema de negócio sem acesso irrestrito (hipóteses H2 e H4 do [Discovery](../discovery.md)). Se o modelo puder gerar SQL, chamar repositórios ou alterar estado livremente, a tese cai e a segurança depende do comportamento do modelo.

## Decisão

A IA interage com o sistema **exclusivamente por tools registradas** em um registry central. Cada tool declara: `name`, `description`, `inputSchema` (zod), `outputSchema`, `riskLevel` (`READ | LOW_WRITE | HIGH_WRITE`), `authorize(user, input)` e `execute(input, ctx)`. Toda tool delega a um application service; nenhuma tool acessa Prisma diretamente. Toda execução, inclusive falhas, gera `AuditLog`.

Fluxo obrigatório: `LLM → Tool → Validação de input → Autorização → Application Service → Regras de domínio → Banco → Resultado estruturado → LLM → Resposta`.

## Alternativas consideradas

- **Text-to-SQL** — flexível, mas expõe o banco ao modelo, dificulta autorização por linha e viola a tese.
- **Acesso da IA aos repositórios/ORM** — menos código, porém mistura interpretação com execução e impede auditoria por intenção.
- **Function calling ad hoc sem registry** — funciona, mas a fronteira vira convenção e não código verificável.

## Trade-offs

- Ganhamos: superfície de ataque explícita e testável, auditoria por intenção, autorização em um ponto, possibilidade de trocar o modelo sem tocar no negócio.
- Perdemos: flexibilidade para perguntas fora do conjunto de tools (a IA deve responder que não consegue) e mais código por capacidade.

## Consequências

- Proibido: imports de `@prisma/client` ou repositórios dentro de `src/ai/**`; strings SQL geradas pelo modelo; tools que executam ação `HIGH_WRITE` diretamente (ver ADR-006).
- Dados retornados por tools são tratados como conteúdo, não como instruções (mitigação de prompt injection).
- Teste automatizado garante que apenas tools registradas são expostas ao modelo (roadmap H12.1).
- Novas tools exigem: história no roadmap, revisão de security-engineer e entrada no golden set.

## Referências

- [PROJECT_PLAN §8, §16, §17](../../PROJECT_PLAN.md)
- [Discovery §6, §9](../discovery.md)
- [ADR-006](./006-human-in-the-loop-policy.md)
