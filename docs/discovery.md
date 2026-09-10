# Discovery — AI Business Operations Platform

## 1. Contexto

### Problema

Pequenas operações de e-commerce possuem diversas tarefas operacionais repetitivas envolvendo:

* pedidos;
* clientes;
* produtos;
* estoque;
* pagamentos;
* atendimento;
* análise de problemas.

Grande parte dessas atividades depende de consultas manuais e decisões operacionais repetitivas.

A proposta do projeto é criar uma plataforma que centralize essas informações e permita que agentes de IA auxiliem os operadores a consultar, analisar e executar tarefas operacionais de maneira controlada.

---

# 2. Usuário

O usuário principal será:

> Operador ou responsável por uma pequena operação de e-commerce.

Esse usuário não precisa necessariamente possuir conhecimento técnico.

Ele precisa conseguir responder perguntas como:

* "Quais pedidos estão atrasados?"
* "Quais pagamentos falharam?"
* "Tem algum produto com estoque baixo?"
* "Quais pedidos precisam da minha atenção?"
* "Por que esse pedido está parado?"
* "Marque esse pedido como prioridade."

---

# 3. Problema principal

O problema que queremos atacar inicialmente é:

> **Identificar e resolver problemas operacionais de pedidos de maneira mais rápida, utilizando IA como interface para consultar e executar operações.**

---

# 4. Situação atual

Imagine uma operação onde o funcionário precisa:

```text
Receber uma solicitação
        ↓
Abrir o sistema
        ↓
Pesquisar pedido
        ↓
Verificar cliente
        ↓
Verificar pagamento
        ↓
Verificar estoque
        ↓
Interpretar situação
        ↓
Decidir o que fazer
```

A plataforma pretende reduzir essa fricção.

---

# 5. Solução proposta

Criar uma interface operacional com:

* dashboard;
* pedidos;
* produtos;
* clientes;
* pagamentos;
* estoque;
* assistente de IA.

O assistente será capaz de consultar os dados através de ferramentas controladas.

Exemplo:

> "Existem pedidos que precisam de atenção?"

A IA poderá executar:

```text
get_delayed_orders()
get_failed_payments()
get_low_stock_products()
```

E consolidar os resultados.

---

# 6. Diferencial

O projeto não será apenas:

> "ChatGPT dentro de um dashboard."

A arquitetura deverá separar:

```text
AI
 ↓
Tools
 ↓
Application Services
 ↓
Business Rules
 ↓
Database
```

A IA interpreta a intenção.

O sistema continua responsável pela execução das regras de negócio.

---

# 7. Caso de uso principal

## Identificação de pedidos problemáticos

### Entrada

Usuário:

> "Quais pedidos precisam de atenção?"

### Processo

```text
User
 ↓
AI Agent
 ↓
Tool Selection
 ↓
Order Service
 ↓
Business Rules
 ↓
Database
 ↓
Structured Result
 ↓
AI
 ↓
Human-readable response
```

### Saída

Exemplo:

```text
Encontrei 4 pedidos que precisam de atenção:

#1023
Pagamento recusado 3 vezes.

#1044
Pedido aguardando pagamento há 48 horas.

#1088
Pedido atrasado em 2 dias.

#1091
Produto sem estoque disponível.
```

---

# 8. Segundo caso de uso

## Consulta de pedido

Usuário:

> "Me mostre o pedido #1023."

A IA deverá consultar a ferramenta:

```text
get_order
```

E apresentar:

* cliente;
* produtos;
* valor;
* status;
* pagamento;
* estoque;
* histórico relevante.

---

# 9. Terceiro caso de uso

## Ação operacional

Usuário:

> "Marque o pedido #1088 como prioridade."

Fluxo:

```text
AI
 ↓
update_order_priority()
 ↓
Authorization
 ↓
Validation
 ↓
Business Rule
 ↓
Database
 ↓
Audit Log
```

A IA nunca deverá alterar o banco diretamente.

---

# 10. Human-in-the-loop

Algumas ações poderão exigir aprovação humana.

Exemplo:

> "Cancelar o pedido #1023."

A IA poderá gerar:

```text
Proposed Action

Cancel Order #1023

Reason:
Payment failed after 3 attempts.

Requires approval:
YES
```

Somente após aprovação a ação será executada.

---

# 11. MVP

## Incluído

### Dashboard

* resumo de pedidos;
* pagamentos;
* estoque;
* alertas.

### Customers

* listagem;
* detalhes;
* histórico de pedidos.

### Products

* catálogo;
* preço;
* estoque.

### Orders

* listagem;
* detalhes;
* status;
* prioridade.

### Payments

* status;
* histórico;
* falhas.

### AI Assistant

Inicialmente:

* consultar pedido;
* consultar cliente;
* pesquisar produtos;
* consultar pagamentos;
* identificar problemas;
* propor ações.

### Audit

Registrar:

* usuário;
* ação;
* ferramenta;
* parâmetros;
* resultado;
* timestamp.

---

# 12. Fora do MVP

Não implementar inicialmente:

* pagamentos reais;
* WhatsApp;
* marketplace;
* aplicativo mobile;
* multi-tenant;
* Kubernetes;
* microservices;
* dezenas de agentes;
* fine-tuning;
* integrações complexas.

Esses itens poderão ser avaliados posteriormente.

---

# 13. Hipóteses

### H1

Operadores conseguem encontrar problemas operacionais mais rapidamente utilizando linguagem natural.

### H2

Tools controladas permitem utilizar IA sem entregar acesso irrestrito ao sistema.

### H3

Uma interface baseada em agentes pode reduzir tarefas operacionais repetitivas.

### H4

A combinação entre IA e regras determinísticas é mais confiável do que delegar decisões críticas exclusivamente ao modelo.

---

# 14. Métricas

Como o projeto é experimental, inicialmente utilizaremos métricas simuladas.

### Operacionais

* tempo para encontrar um pedido;
* tempo para identificar pedidos problemáticos;
* quantidade de tarefas manuais.

### IA

* sucesso de tool calls;
* respostas incorretas;
* quantidade de intervenções humanas;
* latência;
* custo por interação.

### Sistema

* erros;
* disponibilidade;
* tempo de resposta;
* falhas de integração.

---

# 15. Critério de sucesso do MVP

O MVP será considerado bem-sucedido quando um operador conseguir:

1. entrar na plataforma;
2. visualizar a operação;
3. consultar dados através da IA;
4. receber respostas baseadas nos dados reais do sistema;
5. executar uma ação controlada;
6. visualizar o registro dessa ação.

---

# 16. Perguntas abertas — status

Decididas na Lean Inception (2026-09-09). Detalhes em [lean-inception.md §10](./lean-inception.md) e nos ADRs (status `Proposed`, a confirmar em `docs/architecture.md`).

* Qual banco de dados? — **Decidido:** PostgreSQL 16 (Docker) + Prisma. [ADR-002](./adr/002-postgresql-prisma.md)
* Qual provedor/modelo de IA? — **Decidido:** Anthropic Claude via Vercel AI SDK; Haiku em dev, Sonnet em demo. [ADR-005](./adr/005-ai-provider-anthropic.md)
* Qual estratégia de autenticação? — **Decidido:** Auth.js (credentials) + sessão; papéis `OPERATOR | ADMIN`. [ADR-004](./adr/004-authentication-and-roles.md)
* Como representar os estados dos pedidos? — **Proposto:** `PENDING_PAYMENT → PAID → PROCESSING → SHIPPED → DELIVERED`, `CANCELLED` terminal; pagamento `PENDING | FAILED | PAID | REFUNDED`. Formalizar em `docs/domain.md` (Fase 1).
* Quais ações exigem aprovação? — **Decidido:** política por `riskLevel`; no MVP, `cancel_order` exige aprovação de ADMIN, `update_order_priority` executa direto. [ADR-006](./adr/006-human-in-the-loop-policy.md)
* Quais tools existirão inicialmente? — **Decidido:** 6 de leitura + `update_order_priority` + `propose_action`. [lean-inception.md §6](./lean-inception.md), [ADR-003](./adr/003-ai-tool-boundary.md)
* Como será feito o seed? — **Decidido:** `prisma/seed.ts` determinístico com cenários `#1023`, `#1044`, `#1088`, `#1091`. [roadmap H03.1](./roadmap.md)
* Como serão avaliadas as respostas da IA? — **Decidido:** golden set versionado + teste com LLM mockado + `npm run eval` com modelo real. [roadmap H20.1/H20.2](./roadmap.md)
* Onde o sistema será hospedado? — **Aberto:** recomendação Vercel + Neon; ADR na onda 5.

Nota: a aprovação humana (human-in-the-loop) **entra no MVP**, superando o PROJECT_PLAN §32 nesse ponto. Ver ADR-006.

---

# 17. Princípio principal

> **Construir um sistema de negócio que utiliza IA como uma camada inteligente, e não uma aplicação de IA que possui um banco de dados.**
