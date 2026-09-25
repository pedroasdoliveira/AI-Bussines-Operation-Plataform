---
name: story-lifecycle
description: Conduz uma história do docs/roadmap.md do início ao handoff: leitura dos docs, plano curto, implementação dentro do escopo, checagem da Definition of Done, atualização de estado no roadmap e resumo de entrega para revisores. Use ao começar ou concluir a implementação de qualquer história (HNN.M).
---

# Ciclo de vida de uma história

## 1. Início (`todo` → `in-progress`)
1. Localize a história em `docs/roadmap.md`. Confirme que você é o owner e que a anterior do mesmo agente está em `review` ou `done` (uma por vez).
2. Leia, nesta ordem: critérios de aceite; `docs/architecture.md` (seções tocadas); `docs/domain.md` (entidades/regras); ADRs citados; código existente do módulo.
3. Mude o estado para `in-progress` no roadmap.
4. Escreva um plano de 3-5 linhas: o que muda, quais arquivos, qual teste prova o aceite. Se o plano exigir decisão arquitetural nova, pare e acione a skill `writing-adrs` / o solution-architect.

## 2. Implementação
- Implemente só o que os critérios pedem. Descobriu algo necessário fora do escopo? Anote em "Pendências" do handoff; não implemente.
- Regras de negócio no domínio/service. UI e tools apenas chamam.
- Validação zod nas bordas; erros tipados; logs estruturados; `AuditLog` em toda escrita.
- Escreva os testes junto com o código, não depois.

## 3. Definition of Done (checar antes do handoff)
- [ ] Cada critério de aceite tem evidência (teste ou passo reproduzível)
- [ ] Validação de input e tratamento de erros previstos
- [ ] `npm run lint` e `npm test` passando
- [ ] Observabilidade: logs/auditoria onde a história exige
- [ ] Documentação atualizada (`.env.example`, README de módulo, roadmap)
- [ ] Nenhum arquivo temporário, `console.log` de debug ou secret no diff

## 4. Handoff (`in-progress` → `review`)
Mude o estado para `review` no roadmap e responda com este resumo:

```markdown
## Handoff HNN.M — Título
**Arquivos:** lista com uma linha por arquivo (novo/alterado) e o motivo.
**Como validar:** comandos e passos (ex.: `npm run db:seed && npm test -- orders`).
**Decisões tomadas:** o que escolhi e por quê, quando havia mais de um caminho.
**Pendências fora do escopo:** o que descobri e não fiz (para o product-manager).
**Revisores solicitados:** conforme o roadmap (qa-engineer, security-engineer se aplicável, reviewer).
```

## 5. Encerramento (`review` → `done`)
Só o PO move para `done`, após vereditos `APROVADO` dos revisores listados. Ajustes pedidos voltam a `in-progress` no mesmo ciclo, sem abrir história nova.
