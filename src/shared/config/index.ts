import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  BUSINESS_TIMEZONE: z.string().min(1).default("America/Sao_Paulo"),
  AWAITING_PAYMENT_HOURS: z.coerce.number().int().positive().default(48),
  PAYMENT_FAILURES_THRESHOLD: z.coerce.number().int().positive().default(3),
  SHIPPING_SLA_DAYS: z.coerce.number().int().positive().default(3),
  AI_ACTION_TTL_HOURS: z.coerce.number().int().positive().default(24),
  RECENT_FAILURES_DAYS: z.coerce.number().int().positive().default(7),
  AI_MODEL: z.string().min(1).default("claude-haiku-4-5"),
  AI_MAX_STEPS: z.coerce.number().int().positive().default(5),
  AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(2048),
  SEED_USER_PASSWORD: z.string().min(1).optional(),
});

export type AppConfig = z.infer<typeof schema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return schema.parse(env);
}
