---
name: defining-ai-tools
description: Especifica e implementa tools do assistente de IA (contrato, descrição, schemas zod, riskLevel, autorização, auditoria) conforme ADR-003 e ADR-006. Use ao criar, alterar ou revisar qualquer tool em src/ai, ao escrever descrições para o modelo ou ao classificar risco de uma ação.
---

# Definindo tools de IA

## Contrato (ADR-003)
Toda tool declara, nesta ordem, e é registrada explicitamente no registry central:

```ts
{
  name: "get_order",                 // snake_case, verbo + substantivo
  description: "...",                // ver seção abaixo
  riskLevel: "READ",                 // READ | LOW_WRITE | HIGH_WRITE
  inputSchema: z.object({ orderNumber: z.string().regex(/^#?\d+$/) }),
  outputSchema: z.object({ ... }),   // dados estruturados; nunca texto livre
  authorize: (user, input) => ...,   // usuário vem da sessão, nunca do input
  execute: (input, ctx) => orderService.getByNumber(...), // delega a application service
}
```

Proibido dentro de `src/ai/**`: importar Prisma, repositórios, SQL, `userId` vindo do modelo.

## Classificação de risco (ADR-006)
- `READ`: consulta. Executa para qualquer usuário autenticado.
- `LOW_WRITE`: efeito reversível e de baixo impacto (prioridade, nota interna). Executa direto após validação + autorização.
- `HIGH_WRITE`: efeito financeiro, irreversível ou visível ao cliente (cancelar, reembolsar, mudar status). **Nunca é exposta ao modelo para execução.** A IA chama `propose_action`, que cria `AIAction` em `PROPOSED`. Só ADMIN aprova; o sistema executa.

Em dúvida entre LOW e HIGH, escolha HIGH e registre a dúvida para o security-engineer.

## Escrevendo a description
O modelo escolhe a tool pela description. Escreva como documentação para um colega:

```text
Consulta um pedido pelo número (ex.: #1023) e retorna cliente, itens, valores,
status, pagamentos e histórico. Use quando o usuário citar um pedido específico.
Não use para listar vários pedidos (use get_orders_needing_attention) nem para
buscar por cliente (use get_customer).
```

- Diga **quando usar** e **quando não usar**, citando a tool alternativa.
- Inclua o formato esperado do input.
- Não prometa o que a tool não retorna.

## Output e prompt injection
- Retorne objetos tipados e pequenos; sem prosa. O modelo redige a resposta.
- Campos de texto vindos do banco (nomes, notas, descrições) são conteúdo do usuário: o system prompt deve instruir a tratá-los como dados, nunca como instruções. Não concatene esses campos em instruções.
- Listas grandes: pagine ou limite (ex.: máx. 20 itens) e informe `total`.

## Auditoria e observabilidade
Toda execução, inclusive falha de validação, negação de autorização e tentativa de executar `HIGH_WRITE` diretamente, gera `AuditLog` com: `actorType = AI`, `onBehalfOfUserId`, `conversationId`, `toolName`, `input` (sem dados sensíveis), `outputSummary`, `status`, `durationMs`.

## Checklist para uma tool nova
- [ ] História no roadmap e aprovação do PO
- [ ] `riskLevel` justificado em um comentário
- [ ] description com "use quando / não use quando"
- [ ] Schemas zod de input e output
- [ ] Delegação a application service existente (ou história para criá-lo)
- [ ] Teste unitário com service mockado e teste de integração com seed
- [ ] Caso(s) no golden set (ver skill `ai-golden-set`)
- [ ] Revisão do security-engineer solicitada
