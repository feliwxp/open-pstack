import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { effortsOf, REGISTRY, resolveModel } from "./registry/index.ts";

const PLUGIN_ROOT = join(import.meta.dir, "../../../..");
const OWNER_SHEET = `feature, refactoring: codex:gpt-6.1-sol@high
bug-fix: codex:gpt-6.1-sol@high
perf-issue: codex:gpt-6.1-sol@high
hillclimb: codex:gpt-6.1-sol@high
judgment and prose: claude:opus@high
hardest tasks: claude:fable@high
how explorer: codex:gpt-6.1-sol@high
how explainer: codex:gpt-6.1-sol@high
why investigators, synthesizer: inherit-parent
reflect tooling, judgment, divergent, synthesizer: inherit-parent
arena runners: claude:fable@high, codex:gpt-6.1-sol@high
arena cross-judge pool: codex:gpt-6.1-sol@high, claude:fable@high
swarm workers: codex:gpt-6.1-sol@high
architect runners: claude:fable@high, codex:gpt-6.1-sol@high
interrogate reviewers: claude:fable@high, codex:gpt-6.1-sol@high
`;

const ROUTED_SKILL_LINES: Record<string, string[]> = {
  how: ["how explorer", "how explainer"],
  why: ["why investigators, synthesizer"],
  reflect: ["reflect tooling, judgment, divergent, synthesizer"],
  arena: ["arena runners", "arena cross-judge pool"],
  architect: ["architect runners", "arena runners"],
  interrogate: ["interrogate reviewers"],
  swarm: ["swarm workers"],
};

const owner = new Map(OWNER_SHEET.trim().split("\n").map((line) => {
  const at = line.indexOf(": ");
  return [line.slice(0, at), line.slice(at + 2).split(", ")];
}));
const skill = (name: string) => readFileSync(join(PLUGIN_ROOT, "skills", name, "SKILL.md"), "utf8");

function citedLines(text: string): string[] {
  const cited = new Set<string>();
  for (const pattern of [
    /the `([^`]+)` (?:line|descriptor)/g,
    /(?:Use|from) `([^`]+)` (?:from|in)/g,
    /in place of Arena's `([^`]+)`/g,
    /^\| \w+ \| `([^`]+)` \|/gm,
  ]) {
    for (const match of text.matchAll(pattern)) cited.add(match[1]);
  }
  return [...cited].sort();
}

describe("routed skills read the owner's model sheet", () => {
  it("keeps every documented role in the owner's sheet", () => {
    expect([...owner.keys()]).toEqual(REGISTRY.roleDefaults.map((entry) => entry.role));
  });

  it("resolves every owner entry to its assigned registry family at high effort", () => {
    const expected = new Map<string, string[]>([
      ["judgment and prose", ["opus"]],
      ["hardest tasks", ["fable"]],
      ["arena cross-judge pool", ["sol", "fable"]],
      ["why investigators, synthesizer", ["inherit-parent"]],
      ["reflect tooling, judgment, divergent, synthesizer", ["inherit-parent"]],
      ...["arena runners", "architect runners", "interrogate reviewers"]
        .map((role): [string, string[]] => [role, ["fable", "sol"]]),
    ]);
    for (const [role, entries] of owner) {
      const families = entries.map((entry) => {
        if (entry === "inherit-parent" || entry === "auto") return entry;
        const match = /^([a-z]+):([a-z0-9.-]+)@([a-z]+)$/.exec(entry);
        if (match === null) throw new Error(`invalid descriptor: ${entry}`);
        const [, provider, model, effort] = match;
        const resolved = resolveModel(provider, model);
        if (resolved.kind !== "current") throw new Error(`unresolved owner entry: ${entry}`);
        expect(effort).toBe("high");
        expect(effortsOf(resolved.family)).toContain("high");
        return resolved.family.name;
      });
      expect({ role, families }).toEqual({ role, families: expected.get(role) ?? ["sol"] });
    }
  });

  it("names only lines the owner's sheet carries", () => {
    for (const [name, expected] of Object.entries(ROUTED_SKILL_LINES)) {
      const cited = citedLines(skill(name));
      expect({ name, cited }).toEqual({ name, cited: [...expected].sort() });
      for (const line of cited) expect({ name, line, present: owner.has(line) }).toEqual({ name, line, present: true });
    }
    const poteto = skill("poteto-mode");
    for (const role of ["feature, refactoring", "bug-fix", "perf-issue", "hillclimb", "hardest tasks", "judgment and prose"]) {
      expect(poteto).toContain(`\`${role}\``);
      expect(owner.has(role)).toBe(true);
    }
  });

  it("never moves a configured entry to a default by its model-name prefix", () => {
    for (const name of readdirSync(join(PLUGIN_ROOT, "skills"))) {
      expect({ name, prefixFallback: /Families go by prefix|its family's default|table default of its family/.test(skill(name)) })
        .toEqual({ name, prefixFallback: false });
    }
  });
});
