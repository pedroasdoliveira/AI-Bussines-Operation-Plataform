/**
 * Única fábrica de services e tools (architecture.md §4).
 * Repositórios e o client Prisma entram aqui a partir das histórias de domínio.
 * `src/ai` não importa este arquivo nem `database/`.
 */
export function getCompositionRoot(): Record<string, never> {
  return {};
}
