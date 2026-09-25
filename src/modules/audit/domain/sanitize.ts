const REDACTED_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "secret",
  "apikey",
  "authorization",
  "cookie",
  "sessiontoken",
]);

function isSensitive(key: string): boolean {
  const compact = key.replace(/[_-]/g, "").toLowerCase();
  return REDACTED_KEYS.has(compact) || REDACTED_KEYS.has(key.toLowerCase());
}

export function sanitizeAuditInput(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeAuditInput);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = isSensitive(key) ? "[redacted]" : sanitizeAuditInput(nested);
    }
    return out;
  }
  if (typeof value === "string" && value.length > 500) return value.slice(0, 500);
  return value;
}
