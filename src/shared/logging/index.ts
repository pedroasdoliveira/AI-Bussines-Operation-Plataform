export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEvent = {
  level: LogLevel;
  message: string;
  timestamp?: string;
  requestId?: string;
  userId?: string;
  conversationId?: string;
  module?: string;
  action?: string;
  errorCode?: string;
  durationMs?: number;
};

const REDACTED_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "secret",
  "apikey",
  "api_key",
  "authorization",
  "cookie",
  "sessiontoken",
]);

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      const normalized = key.replace(/[_-]/g, "").toLowerCase();
      out[key] =
        REDACTED_KEYS.has(normalized) || REDACTED_KEYS.has(key.toLowerCase())
          ? "[redacted]"
          : redact(nested);
    }
    return out;
  }
  return value;
}

export function formatLog(event: LogEvent & Record<string, unknown>): string {
  const { timestamp, ...rest } = event;
  return JSON.stringify(redact({ timestamp: timestamp ?? new Date().toISOString(), ...rest }));
}

export function log(event: LogEvent & Record<string, unknown>): void {
  console.log(formatLog(event));
}
