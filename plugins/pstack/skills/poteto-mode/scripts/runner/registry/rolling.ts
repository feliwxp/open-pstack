import type { ChildRun, RollingAlias } from "./contract.ts";
import type { Effort } from "../types.ts";

export type ListedAlias = Extract<RollingAlias, { kind: "model-list" }>;

export type ModelResolution =
  | { readonly kind: "resolved"; readonly model: string; readonly fallbackReason: string | null }
  | { readonly kind: "unavailable-model"; readonly message: string };

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function compareVersions(left: readonly bigint[], right: readonly bigint[]): number {
  for (let at = 0; at < Math.max(left.length, right.length); at += 1) {
    const a = left[at] ?? 0n;
    const b = right[at] ?? 0n;
    if (a !== b) return a > b ? 1 : -1;
  }
  return 0;
}

export function pickListedModel(alias: ListedAlias, run: ChildRun, effort: Effort): ModelResolution {
  const fallback = (fallbackReason: string): ModelResolution => ({
    kind: "resolved", model: alias.fallbackModel, fallbackReason,
  });
  if (run.exitCode === null) return fallback("model listing command failed");
  if (run.exitCode !== 0) return fallback(`model listing exited with status ${run.exitCode}`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(run.stdout);
  } catch {
    return fallback("model listing was not valid JSON");
  }
  const models = object(parsed)?.models;
  if (!Array.isArray(models)) return fallback("model listing has no models array");
  const pattern = new RegExp(alias.versionPattern);
  const candidates = models.flatMap((value: unknown) => {
    const entry = object(value);
    if (typeof entry?.slug !== "string") return [];
    const match = pattern.exec(entry.slug);
    const version = match?.[0] === entry.slug ? match[1] : undefined;
    return version === undefined ? [] : [{
      model: entry.slug,
      version: version.split(".").map((part) => BigInt(part)),
      efforts: entry.supported_reasoning_levels,
    }];
  });
  if (candidates.length === 0) return fallback("model listing has no matching model slugs");
  const supported = candidates.filter((entry) => Array.isArray(entry.efforts)
    && entry.efforts.some((level: unknown) => object(level)?.effort === effort));
  supported.sort((left, right) => compareVersions(right.version, left.version));
  return supported[0] === undefined
    ? { kind: "unavailable-model", message: `no listed model matching ${alias.versionPattern} supports effort ${effort}` }
    : { kind: "resolved", model: supported[0].model, fallbackReason: null };
}

export function fallbackDiagnostic(alias: ListedAlias, reason: string): string {
  return `pstack-runner: ${alias.fallbackDiagnostic}: ${reason}; using pinned ${alias.fallbackModel}`;
}
