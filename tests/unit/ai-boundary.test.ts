import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const AI_ROOT = path.join(process.cwd(), "src/ai");

const FORBIDDEN = [
  /@prisma\/client/,
  /\$queryRaw/,
  /\$executeRaw/,
  /infrastructure\/database/,
  /from\s+["'][^"']*repositories/,
  /\bprisma\b/,
];

function typescriptFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...typescriptFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      found.push(full);
    }
  }
  return found;
}

describe("src/ai boundary", () => {
  it("does not import Prisma, repositories, or SQL", () => {
    const violations: string[] = [];
    for (const file of typescriptFiles(AI_ROOT)) {
      const source = readFileSync(file, "utf8");
      if (FORBIDDEN.some((pattern) => pattern.test(source))) {
        violations.push(path.relative(process.cwd(), file));
      }
    }
    expect(violations).toEqual([]);
  });
});
