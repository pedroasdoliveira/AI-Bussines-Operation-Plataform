---
name: writing-adrs
description: Cria e atualiza Architecture Decision Records em docs/adr/ seguindo o template e a numeração do projeto. Use ao decidir stack, fronteira entre módulos, provedor, política de risco de tools, ou ao confirmar/superar um ADR existente em Proposed.
---

# Escrevendo ADRs

## Quando um ADR é obrigatório
- Mudança de stack, biblioteca estrutural, banco, provedor de IA ou hospedagem.
- Nova fronteira entre módulos ou mudança na regra de dependência entre camadas.
- Reclassificação de `riskLevel` de uma tool ou mudança na política human-in-the-loop.
- Qualquer coisa que um revisor perguntaria "por que assim?" e a resposta não está em `docs/architecture.md`.

Não precisa de ADR: escolha de componente de UI, nome de variável, organização interna de um módulo.

## Passos
1. Liste os ADRs existentes (`ls docs/adr/`) e leia os relacionados. Verifique se não é caso de atualizar um existente.
2. Copie `docs/adr/000-template.md` para `docs/adr/NNN-slug-em-ingles.md` com o próximo número de 3 dígitos.
3. Preencha todas as seções. Alternativas: mínimo duas, cada uma com o motivo de rejeição. Consequências: inclua o que fica **proibido** e o que deve ser **revisitado**.
4. Status inicial `Proposed`. Quem muda para `Accepted` é o PO (ou o solution-architect ao consolidar `architecture.md`, citando a aprovação).
5. Referencie histórias do roadmap e outros ADRs afetados.
6. Se o ADR substitui outro: no antigo, mude o status para `Superseded by ADR-NNN`; no novo, cite o antigo no contexto.

## Estilo
- Decisão em uma ou duas frases afirmativas. Sem "talvez", "podemos".
- Trade-offs honestos: o que perdemos deve ser tão concreto quanto o que ganhamos.
- PT-BR; nomes de código e tecnologias em inglês.
- Curto: um ADR cabe em uma tela. Detalhes de implementação vão para `architecture.md`.

## Confirmando os ADRs 001-006
Ao escrever `docs/architecture.md`, para cada ADR em `Proposed`: confirme (`Accepted`, com data e quem aprovou), ajuste (edite e mantenha `Proposed` até aprovação) ou supere (novo ADR). Nunca deixe um ADR `Proposed` sem menção no `architecture.md`.
