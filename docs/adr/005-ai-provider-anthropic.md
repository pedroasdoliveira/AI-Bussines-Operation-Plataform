# ADR-005 — Provedor de IA: Anthropic Claude via Vercel AI SDK

- **Status:** Proposed (confirmar em `docs/architecture.md`, Fase 2)
- **Data:** 2026-09-09
- **Autor:** product-manager (decisão do PO em 2026-09-09)
- **Revisores:** ai-engineer, solution-architect

## Contexto

O assistente precisa de tool calling confiável, streaming e custo controlado em desenvolvimento solo. O modelo não pode ficar acoplado ao código de negócio; trocar provedor deve ser uma mudança local.

## Decisão

Usar **Anthropic Claude** como provedor, integrado por meio do **Vercel AI SDK** (`ai` + `@ai-sdk/anthropic`). Modelo mais barato (família Haiku) em desenvolvimento e testes de eval; modelo intermediário (família Sonnet) em demo. A escolha do modelo é configuração por ambiente (`AI_MODEL`), e o provedor fica atrás de uma fábrica em `src/ai/provider.ts`. Testes unitários e de integração usam um LLM mockado; apenas o script de eval chama o provedor real.

## Alternativas consideradas

- **OpenAI** — equivalente em capacidade e ecossistema; preferência do PO por Anthropic. Continua disponível pela abstração do AI SDK.
- **Modelo local (Ollama)** — custo zero, mas tool calling menos confiável e latência alta em máquina de dev; pode ser usado experimentalmente pela mesma abstração.
- **SDK direto do provedor sem AI SDK** — menos camadas, porém acopla streaming e tool calling à API de um único fornecedor.

## Trade-offs

- Ganhamos: troca de provedor por configuração, streaming e tool calling padronizados, custo baixo em dev.
- Perdemos: recursos exclusivos de um provedor (aceitável no MVP) e dependência do AI SDK.

## Consequências

- Nenhum módulo fora de `src/ai/**` importa SDKs de IA.
- Toda interação registra tokens de entrada/saída, latência e custo estimado (roadmap H15.1).
- Limites por interação: máximo de passos de tool calling e de tokens definidos em configuração.
- Chave de API só via variável de ambiente; nunca no cliente.
- Golden set roda em CI com mock; eval com modelo real é manual/agendada para controlar custo.

## Referências

- [Roadmap E11, E13, E15, E20](../roadmap.md)
- [Lean Inception §0, §10](../lean-inception.md)
