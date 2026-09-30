/** Valor documentado em `.env.example`. Só serve de fallback local e de recusa em produção. */
export const DEV_SEED_PASSWORD = "dev-only-change-me";

export function resolveSeedPassword(env: NodeJS.ProcessEnv): string {
  const configured = env.SEED_USER_PASSWORD?.trim();
  const password = configured || DEV_SEED_PASSWORD;
  if (env.NODE_ENV === "production" && password === DEV_SEED_PASSWORD) {
    throw new Error(
      "Seed recusou a senha padrão de desenvolvimento com NODE_ENV=production. Defina SEED_USER_PASSWORD.",
    );
  }
  return password;
}
