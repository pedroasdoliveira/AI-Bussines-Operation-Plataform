# ADR-004 — Autenticação com Auth.js e papéis OPERATOR/ADMIN

- **Status:** Accepted (confirmado em H00.2, 2026-09-24, por solution-architect / Grok 4.7; proposta do product-manager em 2026-09-09)
- **Data:** 2026-09-09 (confirmação: 2026-09-24)
- **Autor:** product-manager (proposta); solution-architect (confirmação)
- **Revisores:** solution-architect, security-engineer

## Contexto

O MVP precisa de login, sessão e autorização mínima. O human-in-the-loop ([ADR-006](./006-human-in-the-loop-policy.md)) exige distinguir quem opera (Marina) de quem aprova (Rafael). O [PROJECT_PLAN §32](../../PROJECT_PLAN.md) deixa RBAC completo para V4; aqui precisamos apenas do mínimo que sustente a tese.

## Decisão

Usar **Auth.js (NextAuth v5)** com provider de credenciais (e-mail + senha com hash) e sessão. Modelo `User` com enum `Role { OPERATOR, ADMIN }`. Autorização centralizada em um helper reutilizado por rotas, server actions e pela função `authorize` das tools. Apenas `ADMIN` aprova/rejeita `AIAction`.

## Alternativas consideradas

- **Serviço externo (Clerk, Auth0)** — rápido, mas adiciona dependência externa e custo; menos didático para portfólio.
- **Sessão própria (JWT manual)** — controle total, porém reinventa proteções que Auth.js já oferece (CSRF, cookies seguros).
- **Sem papéis (qualquer usuário aprova)** — mais simples, mas o fluxo de aprovação perderia sentido e a demo de autorização em tools não existiria.
- **RBAC completo com permissões granulares** — overengineering para duas personas.

## Trade-offs

- Ganhamos: autenticação segura com pouco código, dois papéis suficientes para J1 e J2, um ponto único de autorização.
- Perdemos: flexibilidade de permissões (aceitável; RBAC completo fica para V4).

## Confirmação (H00.2)

Confirmado sem alteração de decisão. A matriz de rotas (conversa própria vs. qualquer conversa; fila em leitura para `OPERATOR`) está em `docs/architecture.md` §11.

## Consequências

- Senhas com bcrypt/argon2; nunca em texto puro nem em logs.
- Rotas e tools sempre recebem o usuário da sessão; tools nunca aceitam `userId` como input do modelo.
- Erros de login são genéricos (não revelam existência de e-mail).
- Seed cria `marina@demo.local` (OPERATOR) e `rafael@demo.local` (ADMIN).

## Referências

- [Roadmap H02.1, H02.2, H17.2](../roadmap.md)
- [Lean Inception §4](../lean-inception.md)
