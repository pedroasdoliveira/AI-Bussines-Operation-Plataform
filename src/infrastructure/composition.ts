import { authorize } from "@/modules/identity";

/**
 * Única fábrica de services e tools (architecture.md §4).
 * Repositórios e o client Prisma entram aqui a partir das histórias de domínio.
 * `src/ai` não importa este arquivo nem `database/`.
 * Tools recebem `authorize` por aqui e não importam `identity` (architecture.md §6).
 */
export function getCompositionRoot() {
  return { authorize };
}
