---
name: review-reports
description: Formato padrão dos relatórios de revisão de QA, segurança e code review deste projeto, com classificação de severidade e veredito (APROVADO, APROVADO COM AJUSTES/RESSALVAS, BLOQUEADO). Use ao revisar uma história, um diff, um documento ou ao auditar segurança.
---

# Relatórios de revisão

## Antes de revisar
1. Leia a história em `docs/roadmap.md`: os critérios de aceite são o contrato. Revisar sem eles é opinião.
2. Leia os ADRs citados e as seções relevantes de `docs/architecture.md` / `docs/domain.md`.
3. Leia o handoff do implementador (arquivos, como validar, decisões, pendências).
4. Execute o que for executável: testes, lint, seed, golden set com mock. Cite o resultado.

## Severidades
- **Bloqueia** (segurança: **Crítico**): viola ADR, expõe dados, permite `HIGH_WRITE` sem aprovação, critério de aceite não atendido, teste ausente para regra de negócio.
- **Deve corrigir** (segurança: **Alto/Médio**): bug provável, autorização incompleta, regra de negócio na UI/tool, erro sem tratamento, log com dado sensível.
- **Sugestão** (segurança: **Baixo**): simplificação, nome, duplicação, complexidade desnecessária.
- **Pergunta**: decisão que não entendeu ou que parece contradizer os docs.

## Formato

```markdown
## Revisão [QA | Segurança | Code Review] — HNN.M — Título
**Escopo revisado:** arquivos/commits; o que executei e o resultado (`npm test`: 42 passed).

### Bloqueia
- `src/modules/orders/order.service.ts:87` — descrição do problema; por que importa; como corrigir.

### Deve corrigir
- ...

### Sugestões
- ...

### Perguntas
- ...

### O que está bom
Uma ou duas linhas. Não gaste texto aqui.

**Veredito:** APROVADO | APROVADO COM AJUSTES | BLOQUEADO
**Para o PO decidir:** lista objetiva do que falta (vazia se APROVADO).
```

Segurança usa a mesma estrutura com severidades Crítico/Alto/Médio/Baixo/Observação e veredito `APROVADO | APROVADO COM RESSALVAS | BLOQUEADO`.

## Regras
- Todo achado tem arquivo e linha (ou seção do documento). Sem localização, não é achado.
- Evidência antes de opinião: "rodei X e obtive Y" vale mais que "acho que".
- Não corrija você mesmo (security-engineer e reviewer são somente leitura). QA pode escrever testes, nunca alterar regra de negócio para o teste passar.
- "Vamos arrumar depois" só é aceito com item registrado no roadmap.
- Questione ADRs se a implementação mostrou que estavam errados; recomende ADR de revisão em vez de aceitar o desvio.
