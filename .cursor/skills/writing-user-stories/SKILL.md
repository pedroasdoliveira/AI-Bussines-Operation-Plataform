---
name: writing-user-stories
description: Escreve e revisa histórias de usuário e critérios de aceite no padrão do docs/roadmap.md deste projeto. Use ao criar, refinar ou avaliar histórias, épicos, critérios de aceite, escopo do MVP ou ao adicionar itens em "V2 e além".
---

# Escrevendo histórias de usuário

## Antes de escrever
1. Identifique a persona em `docs/lean-inception.md` §4: Marina (operadora), Rafael (gestor/ADMIN) ou Avaliador técnico.
2. Identifique a jornada (J1, J2, J3) e a feature (F01-F24) que a história realiza.
3. Confirme a onda no sequenciador (§8). Se não couber em nenhuma onda do MVP, vai para "V2 e além" no roadmap, nunca para o código.

## Formato obrigatório

```markdown
**HNN.M — Título curto** `todo`
Como [persona], quero [ação] para [valor].
- Owner: [agente]. Revisores: [agentes].
- Aceite:
  - Dado [contexto], quando [ação], então [resultado observável].
  - [regra de negócio, erro previsto ou restrição de segurança]
```

- `NN` = número do épico (E05 → H05.x). `M` sequencial dentro do épico.
- Estado inicial sempre `todo`. Estados válidos: `todo`, `in-progress`, `review`, `done`.
- Revisores mínimos: `qa-engineer`. Adicione `security-engineer` se tocar auth, tools, dados sensíveis ou input de usuário; `reviewer` em histórias de arquitetura ou fronteira.

## Critérios de aceite bons
- Verificáveis por teste, sem interpretação: use os cenários do seed (`#1023` pagamento falho 3x, `#1044` aguardando pagamento 48h+, `#1088` envio atrasado, `#1091` sem estoque).
- Cubram caminho feliz, erro previsto e autorização quando houver escrita.
- Digam onde a regra vive ("regra vem do domínio, não da UI") quando o risco de duplicação existir.
- Toda escrita menciona `AuditLog`.

## Sinais de história ruim
- "Melhorar", "otimizar", "refatorar" sem resultado observável.
- Mais de 5 critérios de aceite: divida.
- Persona genérica ("usuário") ou valor ausente.
- Introduz item da lista "Não fazer no MVP" (`project-principles.mdc` §6).

## Ao mudar escopo
Registre no roadmap (mover, adicionar, remover) **e** ajuste o Lean Inception se afetar features, ondas ou MVP Canvas. Comunique ao PO na resposta: o que mudou e por quê.
