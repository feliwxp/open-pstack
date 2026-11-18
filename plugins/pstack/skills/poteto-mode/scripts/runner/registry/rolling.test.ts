import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { REGISTRY } from "./index.ts";
import { fallbackDiagnostic, pickListedModel, type ListedAlias } from "./rolling.ts";
import type { ChildRun } from "./contract.ts";
import type { Effort } from "../types.ts";

const rolling = REGISTRY.families.find((entry) => entry.name === "sol")!.rolling as ListedAlias;
const model = (slug: string, efforts: readonly string[] = ["high"]) => ({
  slug, supported_reasoning_levels: efforts.map((effort) => ({ effort })),
});
const listing = (models: readonly unknown[]): ChildRun => ({
  exitCode: 0, stdout: JSON.stringify({ models }), stderr: "",
});

describe("Sol rolling model picker", () => {
  for (const [slugs, expected] of [
    [["gpt-5.6-sol", "gpt-6-sol", "gpt-6.1-sol", "gpt-6.2-sol"], "gpt-6.2-sol"],
    [["gpt-6-sol", "gpt-6.1-sol", "gpt-5.6-sol"], "gpt-6.1-sol"],
    [["gpt-6-sol", "gpt-5.6-sol"], "gpt-6-sol"],
    [["gpt-6.9-sol", "gpt-6.10-sol"], "gpt-6.10-sol"],
    [["gpt-6-sol", "gpt-6.0.1-sol"], "gpt-6.0.1-sol"],
    [["gpt-6.0-sol", "gpt-6-sol"], "gpt-6.0-sol"],
    [["gpt-6-sol", "gpt-6.0-sol"], "gpt-6-sol"],
  ] as const) {
    it(`compares versions numerically: ${slugs.join(", ")} selects ${expected}`, () => {
      expect(pickListedModel(rolling, listing(slugs.map((slug) => model(slug))), "high"))
        .toEqual({ kind: "resolved", model: expected, fallbackReason: null });
    });
  }

  it("ignores every non-Sol slug and malformed entry", () => {
    const models = [
      ...["gpt-6.2-astra", "gpt-6-luna", "gpt-reserve", "codex-auto-review", "gpt-6.2-sol-foo",
        "gpt-7..1-sol", "gpt-7-sol\n", "gpt-6.1-sol"].map((slug) => model(slug)),
      null, {}, { slug: 7 },
    ];
    expect(pickListedModel(rolling, listing(models), "high"))
      .toEqual({ kind: "resolved", model: "gpt-6.1-sol", fallbackReason: null });
  });

  for (const [run, reason] of [
    [listing([]), "model listing has no matching model slugs"],
    [listing([model("gpt-6.2-astra")]), "model listing has no matching model slugs"],
    [{ exitCode: 1, stdout: listing([model("gpt-9-sol")]).stdout, stderr: "offline" }, "model listing exited with status 1"],
    [{ exitCode: null, stdout: "", stderr: "" }, "model listing command failed"],
    [{ exitCode: 0, stdout: "not JSON", stderr: "" }, "model listing was not valid JSON"],
    [{ exitCode: 0, stdout: "{}", stderr: "" }, "model listing has no models array"],
  ] as const) {
    it(`falls back with a named reason: ${reason} (${run.stdout})`, () => {
      expect(pickListedModel(rolling, run, "high"))
        .toEqual({ kind: "resolved", model: "gpt-6.1-sol", fallbackReason: reason });
      expect(fallbackDiagnostic(rolling, reason))
        .toBe(`pstack-runner: sol-fallback: ${reason}; using pinned gpt-6.1-sol`);
    });
  }

  it("skips the newest model when it lacks the requested effort", () => {
    expect(pickListedModel(rolling, listing([
      model("gpt-6.2-sol", ["low"]), model("gpt-6.1-sol"), model("gpt-6-sol"),
    ]), "high")).toEqual({ kind: "resolved", model: "gpt-6.1-sol", fallbackReason: null });
  });

  for (const effort of ["high", "ultra"] as const satisfies readonly Effort[]) {
    it(`returns unavailable-model when no Sol slug offers ${effort}`, () => {
      expect(pickListedModel(rolling, listing([
        model("gpt-6.2-sol", ["low"]), model("gpt-6.1-sol", []),
        { slug: "gpt-6-sol", supported_reasoning_levels: null }, model("gpt-9-astra"),
      ]), effort)).toEqual({ kind: "unavailable-model", message: expect.stringContaining(`effort ${effort}`) });
    });
  }

  it("selects gpt-6.2-sol at high from the Codex CLI 0.170.0 fixture", () => {
    const stdout = readFileSync(join(import.meta.dir, "../fixtures/codex-0.170.0/debug-models.json"), "utf8");
    expect(pickListedModel(rolling, { exitCode: 0, stdout, stderr: "" }, "high"))
      .toEqual({ kind: "resolved", model: "gpt-6.2-sol", fallbackReason: null });
  });

  it("selects gpt-6.1-sol at high from the Codex CLI 0.160.0 fixture", () => {
    const stdout = readFileSync(join(import.meta.dir, "../fixtures/codex-0.160.0/debug-models.json"), "utf8");
    expect(pickListedModel(rolling, { exitCode: 0, stdout, stderr: "" }, "high"))
      .toEqual({ kind: "resolved", model: "gpt-6.1-sol", fallbackReason: null });
  });
});
