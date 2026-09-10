# ADR-006 — Política de human-in-the-loop por nível de risco

- **Status:** Proposed (confirmar em `docs/architecture.md`, Fase 2)
- **Data:** 2026-09-09
- **Autor:** product-manager (decisão do PO em 2026-09-09)
- **Revisores:** solution-architect, security-engineer, ai-engineer

## Contexto

Havia conflito entre os documentos base: o [Discovery §10-11](../discovery.md) coloca ações e aprovação humana no MVP; o [PROJECT_PLAN §32](../../PROJECT_PLAN.md) deixa "Human Approval" para V2. A aprovação humana é o que demonstra a hipótese H4 (IA + regras determinísticas é mais confiável do que delegar decisões críticas ao modelo). Sem ela, o MVP seria apenas leitura mais uma ação trivial.

## Decisão

Toda tool declara um `riskLevel` e a política é aplicada pelo registry, não pelo modelo:

- **`READ`** — executa livremente para usuário autenticado; auditada.
- **`LOW_WRITE`** (ex.: `update_order_priority`, futuramente `add_order_note`) — executa diretamente após validação e autorização; auditada com `actorType = AI` e `onBehalfOfUserId`.
- **`HIGH_WRITE`** (ex.: `cancel_order`, `refund_payment`, `change_order_status`) — a IA **não executa**. Só pode chamar `propose_action`, que cria um `AIAction` em estado `PROPOSED`. Um `ADMIN` aprova ou rejeita pela UI; a execução é feita pelo sistema via application service, de forma idempotente, e registrada com atores distintos (quem propôs, quem decidiu).

No MVP: `update_order_priority` (LOW_WRITE) e `cancel_order` (HIGH_WRITE via `propose_action`). Aprovação humana **entra no MVP**; o PROJECT_PLAN §32 fica superado neste ponto.

## Alternativas consideradas

- **Aprovação humana só em V2 (PROJECT_PLAN)** — MVP mais rápido, mas não prova a tese central e deixa a arquitetura de `AIAction` para depois, com risco de retrabalho.
- **Confirmação inline no chat ("tem certeza?")** — mais simples, mas a mesma pessoa que pediu confirma, sem segregação de papéis nem fila revisável.
- **Nenhuma escrita pela IA no MVP** — elimina risco, mas reduz o produto a um chat de consulta.

## Trade-offs

- Ganhamos: segregação de funções, rastreabilidade completa da decisão, tese demonstrável em J2.
- Perdemos: mais uma entidade e uma tela no MVP (F17/F18) e a única feature de alta incerteza técnica do MVP.

## Consequências

- `AIAction` com estados `PROPOSED → APPROVED → EXECUTED | FAILED`, `PROPOSED → REJECTED`, `PROPOSED → EXPIRED` (24h configurável).
- Registry recusa executar tool `HIGH_WRITE` diretamente, mesmo que o modelo tente; tentativa é auditada como violação.
- Golden set inclui tentativas de contornar a política (prompt injection) com meta de 0 execuções indevidas.
- Reclassificar o risco de uma tool exige ADR ou atualização deste com revisão do security-engineer.

## Referências

- [Lean Inception §5 (J2), §10, §11](../lean-inception.md)
- [Roadmap E16, E17, E18, E20b](../roadmap.md)
- [ADR-003](./003-ai-tool-boundary.md), [ADR-004](./004-authentication-and-roles.md)
