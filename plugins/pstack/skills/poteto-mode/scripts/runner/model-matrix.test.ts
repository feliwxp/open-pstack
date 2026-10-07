import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cursorModel } from "./cursor-models.ts";
import { EFFORTS, type Effort } from "./types.ts";

const PLUGIN_ROOT = join(import.meta.dir, "../../../..");
const DISPATCH_PATH = join(
  PLUGIN_ROOT,
  "skills/poteto-mode/references/provider-dispatch.md"
);
const SETUP_PATH = join(PLUGIN_ROOT, "skills/setup-pstack/SKILL.md");
const AGENTS_DIR = join(PLUGIN_ROOT, "agents");

const MATRIX_HEADER = [
  "Family",
  "Upstream pstack choice",
  "Provider",
  "Model",
  "Default effort",
  "Selectable efforts",
  "Claude-native agent stem",
] as const;

const FAMILY_ORDER = ["fable", "sol", "grok", "opus", "cursor"] as const;
const FIRST_RUN_PANEL = ["opus", "sol", "grok"] as const;
const PROVIDERS = ["claude", "codex", "grok", "cursor"] as const;
const DESCRIPTOR_RE =
  /(claude|codex|grok|cursor):[a-z0-9.-]+@(low|medium|high|xhigh|max|ultra)/g;
const PANEL_ROLES = [
  "arena runners",
  "arena cross-judge pool",
  "architect runners",
  "interrogate reviewers",
] as const;
const SHEET_ROLES = [
  "feature, refactoring",
  "bug-fix",
  "perf-issue",
  "hillclimb",
  "judgment and prose",
  "hardest tasks",
  "how explorer",
  "how explainer",
  "why investigators, synthesizer",
  "reflect tooling, judgment, divergent, synthesizer",
  "arena runners",
  "arena cross-judge pool",
  "swarm workers",
  "architect runners",
  "interrogate reviewers",
] as const;
const SETUP_SECTION_ORDER = [
  "### 2. Load current state",
  "### 3. Parse per-family efforts",
  "### 4. Collect one requested effort per family",
  "### 5. Probe the requested pairs",
  "### 6. Render, preserving role families",
  "### 7. Confirm and commit",
] as const;

interface MatrixRow {
  family: string;
  upstreamChoice: string;
  provider: string;
  model: string;
  defaultEffort: Effort;
  selectableEfforts: Effort[];
  claudeNativeAgentStem: string | null;
}

function splitRow(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    throw new Error(`matrix row must be a pipe table: ${line}`);
  }
  return trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim().replaceAll("`", ""));
}

function isSeparator(cells: string[]): boolean {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function asEffort(value: string): Effort {
  if ((EFFORTS as readonly string[]).includes(value)) {
    return value as Effort;
  }
  throw new Error(`not an effort: ${value}`);
}

function parseModelMatrix(markdown: string): MatrixRow[] {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === "## Model matrix");
  if (start < 0) {
    throw new Error("missing ## Model matrix");
  }
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      end = i;
      break;
    }
  }
  const table = lines
    .slice(start + 1, end)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"));
  if (table.length !== 2 + FAMILY_ORDER.length) {
    throw new Error(
      `model matrix must be header, separator, and ${FAMILY_ORDER.length} data rows, got ${table.length}`
    );
  }
  const header = splitRow(table[0]);
  if (header.join("|") !== MATRIX_HEADER.join("|")) {
    throw new Error(`unexpected matrix header: ${header.join(" | ")}`);
  }
  if (!isSeparator(splitRow(table[1]))) {
    throw new Error("matrix header separator missing");
  }
  return table.slice(2).map((line) => {
    const cells = splitRow(line);
    if (cells.length !== MATRIX_HEADER.length) {
      throw new Error(`matrix row has ${cells.length} cells: ${line}`);
    }
    const [
      family,
      upstreamChoice,
      provider,
      model,
      defaultEffortRaw,
      selectableRaw,
      stemRaw,
    ] = cells;
    if (!(PROVIDERS as readonly string[]).includes(provider)) {
      throw new Error(`invalid provider: ${provider}`);
    }
    const selectableEfforts = selectableRaw.split(/\s+/).map(asEffort);
    const claudeNativeAgentStem = stemRaw === "-" ? null : stemRaw;
    if (claudeNativeAgentStem !== null && !/^[a-z0-9-]+$/.test(claudeNativeAgentStem)) {
      throw new Error(`invalid Claude-native agent stem: ${stemRaw}`);
    }
    if ((provider === "claude") !== (claudeNativeAgentStem !== null)) {
      throw new Error(`${family} stem must be present iff provider is claude`);
    }
    const defaultEffort = asEffort(defaultEffortRaw);
    if (!selectableEfforts.includes(defaultEffort)) {
      throw new Error(`${family} default effort is not selectable`);
    }
    return {
      family,
      upstreamChoice,
      provider,
      model,
      defaultEffort,
      selectableEfforts,
      claudeNativeAgentStem,
    };
  });
}

function defaultDescriptors(
  rows: MatrixRow[],
  families: readonly string[]
): string[] {
  return families.map((family) => {
    const row = rows.find((candidate) => candidate.family === family);
    if (row === undefined) {
      throw new Error(`missing matrix family: ${family}`);
    }
    return `${row.provider}:${row.model}@${row.defaultEffort}`;
  });
}

function parseFrontmatter(text: string): {
  fields: Record<string, string>;
  body: string;
} {
  if (!text.startsWith("---\n")) {
    throw new Error("missing frontmatter");
  }
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) {
    throw new Error("unterminated frontmatter");
  }
  const fields: Record<string, string> = {};
  for (const line of text.slice(4, end).split("\n")) {
    const idx = line.indexOf(": ");
    if (idx < 0) {
      throw new Error(`bad frontmatter line: ${line}`);
    }
    fields[line.slice(0, idx)] = line.slice(idx + 2);
  }
  return { fields, body: text.slice(end + 5) };
}

function firstRunSheet(setup: string): string {
  const match = setup.match(
    /```markdown\n(# pstack model configuration\n[\s\S]*?)```/
  );
  if (!match) {
    throw new Error("setup-pstack is missing the first-run sheet fence");
  }
  return match[1];
}

describe("model matrix", () => {
  const rows = parseModelMatrix(readFileSync(DISPATCH_PATH, "utf8"));
  const setup = readFileSync(SETUP_PATH, "utf8");
  const panel = defaultDescriptors(rows, FIRST_RUN_PANEL);

  it("owns the effort universe and first-run defaults", () => {
    expect([...EFFORTS]).toEqual(["low", "medium", "high", "xhigh", "max", "ultra"]);
    expect(rows.map((row) => row.family)).toEqual([...FAMILY_ORDER]);
    for (const row of rows) {
      expect(row.upstreamChoice.length).toBeGreaterThan(0);
      expect(row.model.length).toBeGreaterThan(0);
      expect(row.selectableEfforts.length).toBeGreaterThan(0);
      expect(row.selectableEfforts).toEqual(
        EFFORTS.filter((effort) => row.selectableEfforts.includes(effort))
      );
    }
    expect(
      rows.map((row) => [row.family, row.defaultEffort])
    ).toEqual([
      ["fable", "max"],
      ["sol", "max"],
      ["grok", "xhigh"],
      ["opus", "max"],
      ["cursor", "xhigh"],
    ]);
    expect(
      rows
        .filter((row) => row.family === "fable" || row.family === "opus")
        .map((row) => [row.family, row.model])
    ).toEqual([
      ["fable", "fable"],
      ["opus", "opus"],
    ]);
  });

  it("offers ultra only on the Sol row, whose Codex model lists it", () => {
    expect(
      rows
        .filter((row) => row.selectableEfforts.includes("ultra"))
        .map((row) => `${row.provider}:${row.model}`)
    ).toEqual(["codex:gpt-6.1-sol"]);
  });

  it("keeps the previous Sol default running until setup replaces it", () => {
    const dispatch = readFileSync(DISPATCH_PATH, "utf8");
    expect(dispatch).toContain(
      "`codex:gpt-5.6-sol@<effort>` is the previous Sol default."
    );
    expect(dispatch).toContain("Do not rewrite it in memory.");
    expect(setup).toContain(
      "propose replacing every occurrence with `codex:gpt-6.1-sol@<same effort>` and ask"
    );
    expect(setup).toContain(
      "Reject `ultra` for every row whose Selectable efforts cell does not list it."
    );
    expect(setup).toContain("matching a kept `codex:gpt-5.6-sol` to the Sol row");
    expect(setup).toContain("other than a kept `gpt-5.6-sol`");
  });

  it("ships exactly the declared Claude-native frontier agents", () => {
    const expected = new Set<string>();
    const familyBodies = new Map<string, string>();
    for (const row of rows) {
      const stem = row.claudeNativeAgentStem;
      if (stem === null) {
        continue;
      }
      for (const effort of row.selectableEfforts) {
        const name = `pstack-${stem}-${effort}`;
        expected.add(`${name}.md`);
        const text = readFileSync(join(AGENTS_DIR, `${name}.md`), "utf8");
        const { fields, body } = parseFrontmatter(text);
        expect(fields).toEqual({
          name,
          description: `Native Claude lane for pstack roles configured as ${row.provider}:${row.model}@${effort}.`,
          model: row.model,
          effort,
          background: "true",
          disallowedTools: "Agent, Task",
        });
        const prior = familyBodies.get(stem);
        if (prior === undefined) {
          familyBodies.set(stem, body);
        } else {
          expect(body).toBe(prior);
        }
      }
    }
    const declaredCount = rows.reduce(
      (count, row) =>
        count +
        (row.claudeNativeAgentStem === null
          ? 0
          : row.selectableEfforts.length),
      0
    );
    expect(expected.size).toBe(declaredCount);
    const shipped = readdirSync(AGENTS_DIR)
      .filter((name) => name.startsWith("pstack-") && name.endsWith(".md"))
      .sort();
    expect(shipped).toEqual([...expected].sort());
  });

  it("binds the Cursor matrix row to the shipped model registry", () => {
    const cursor = rows.find((row) => row.family === "cursor");
    if (cursor === undefined) {
      throw new Error("missing cursor matrix row");
    }
    expect(cursor.provider).toBe("cursor");
    expect(cursor.model).not.toContain("fast");
    const fastModel = `${cursor.model}-fast`;
    for (const effort of EFFORTS) {
      if (cursor.selectableEfforts.includes(effort)) {
        expect(cursorModel(cursor.model, effort).id).toBe(
          `${cursor.model}-${effort}`
        );
        expect(cursorModel(fastModel, effort).id).toBe(
          `${cursor.model}-${effort}-fast`
        );
      } else {
        expect(() => cursorModel(cursor.model, effort)).toThrow(
          `cursor does not offer ${cursor.model} at effort ${effort}`
        );
        expect(() => cursorModel(fastModel, effort)).toThrow(
          `cursor does not offer ${fastModel} at effort ${effort}`
        );
      }
    }
    const dispatch = readFileSync(DISPATCH_PATH, "utf8");
    expect(dispatch).toContain(`\`cursor:${cursor.model}@<effort>\``);
    expect(dispatch).toContain(`\`cursor:${fastModel}@<effort>\``);
    expect(dispatch).toContain(`\`cursor:${fastModel}@${cursor.defaultEffort}\``);
  });

  it("keeps setup's first-run default panel copy aligned with the matrix", () => {
    const sheet = firstRunSheet(setup);
    const roles = sheet
      .split("\n")
      .filter((line) => line.includes(": "))
      .map((line) => line.slice(0, line.indexOf(": ")));
    expect(roles).toEqual([...SHEET_ROLES]);
    const byFamily = new Map<string, MatrixRow>(
      rows.map((row) => [`${row.provider}:${row.model}`, row])
    );
    for (const descriptor of sheet.match(DESCRIPTOR_RE) ?? []) {
      const at = descriptor.lastIndexOf("@");
      const key = descriptor.slice(0, at);
      const effort = descriptor.slice(at + 1);
      const row = byFamily.get(key);
      if (row === undefined) {
        throw new Error(`unknown first-run descriptor: ${descriptor}`);
      }
      expect(effort).toBe(row.defaultEffort);
    }
    const expectedPanel = panel.join(", ");
    for (const role of PANEL_ROLES) {
      const line = sheet
        .split("\n")
        .find((entry) => entry.startsWith(`${role}:`));
      if (line === undefined) {
        throw new Error(`missing first-run panel row: ${role}`);
      }
      expect(line).toBe(`${role}: ${expectedPanel}`);
    }
  });

  it("keeps setup's fail-closed reconfiguration order", () => {
    let previous = -1;
    for (const heading of SETUP_SECTION_ORDER) {
      const current = setup.indexOf(heading);
      expect(current).toBeGreaterThan(previous);
      previous = current;
    }
    expect(setup).toContain("Do not invent a precedence rule.");
    expect(setup).toContain("Do not probe or write while any inconsistency is unresolved.");
    expect(setup).toContain("A failed probe writes nothing:");
    expect(setup).toContain("Run one probe per family");
    expect(setup).toContain("normalized complete role map from step 2");
    expect(setup).toContain("starts with `claude-fable-` or `claude-opus-`");
    expect(setup).toContain("preserving the provider, effort, role, and lane order");
    expect(setup).toContain("Show any rolling-alias migrations");
    expect(setup).toContain("Every documented role remains present.");
    expect(setup).toContain("An effort-only rerun cannot change a role's family.");
    expect(setup).toContain("<!-- pstack:models:begin -->");
    expect(setup).toContain("<!-- pstack:models:end -->");
  });

  it("binds Claude-native dispatch to the matrix mapping", () => {
    const dispatch = readFileSync(DISPATCH_PATH, "utf8");
    const nativeStart = dispatch.indexOf("## Native lanes");
    const externalStart = dispatch.indexOf("## External lanes");
    expect(nativeStart).toBeGreaterThan(-1);
    expect(externalStart).toBeGreaterThan(nativeStart);
    const nativeLanes = dispatch.slice(nativeStart, externalStart);
    expect(nativeLanes).toContain(
      "match the descriptor's `(provider, model)` to one model-matrix row"
    );
    expect(nativeLanes).toContain("`pstack-<stem>-<effort>`");
  });

  it("normalizes old rolling-family pins before any runtime route", () => {
    const dispatch = readFileSync(DISPATCH_PATH, "utf8");
    const normalizationStart = dispatch.indexOf("## Read-time normalization");
    const parentStart = dispatch.indexOf("## The parent owns the route");
    expect(normalizationStart).toBeGreaterThan(-1);
    expect(parentStart).toBeGreaterThan(normalizationStart);
    const normalization = dispatch.slice(normalizationStart, parentStart);
    expect(normalization).toContain("replace that model component in memory");
    expect(normalization).toContain("Never pass the versioned predecessor to Claude.");
    expect(normalization).toContain("without writing user files");
    expect(normalization).toContain("`/setup-pstack` will rewrite it");
    expect(normalization).toContain("runner rejects a missed Fable or Opus version pin");
  });
});

const OWNER_SHEET = `feature, refactoring: codex:gpt-6.1-sol@xhigh
bug-fix: codex:gpt-6.1-sol@xhigh
perf-issue: codex:gpt-6.1-sol@xhigh
hillclimb: codex:gpt-6.1-sol@xhigh
judgment and prose: claude:opus@xhigh
hardest tasks: claude:fable@xhigh
how explorer: codex:gpt-6.1-sol@xhigh
how explainer: codex:gpt-6.1-sol@xhigh
why investigators, synthesizer: inherit-parent
reflect tooling, judgment, divergent, synthesizer: inherit-parent
arena runners: claude:fable@xhigh, codex:gpt-6.1-sol@xhigh
arena cross-judge pool: codex:gpt-6.1-sol@xhigh, claude:fable@xhigh
swarm workers: codex:gpt-6.1-sol@xhigh
architect runners: claude:fable@xhigh, codex:gpt-6.1-sol@xhigh
interrogate reviewers: claude:fable@xhigh, codex:gpt-6.1-sol@xhigh
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

const ALIASES = ["inherit-parent", "auto"] as const;

function parseSheet(text: string): Map<string, string[]> {
  const roles = new Map<string, string[]>();
  for (const line of text.split("\n")) {
    const idx = line.indexOf(": ");
    if (idx < 0 || line.startsWith("budget: ")) {
      continue;
    }
    const role = line.slice(0, idx);
    if (roles.has(role)) {
      throw new Error(`duplicate sheet role: ${role}`);
    }
    roles.set(role, line.slice(idx + 2).split(", "));
  }
  return roles;
}

function resolveEntry(entry: string, rows: MatrixRow[]): string {
  if ((ALIASES as readonly string[]).includes(entry)) {
    return entry;
  }
  const match = entry.match(/^([a-z]+):([a-z0-9.-]+)@([a-z]+)$/);
  if (match === null) {
    throw new Error(`not a provider:model@effort descriptor: ${entry}`);
  }
  const [, provider, model, effort] = match;
  const row = rows.find(
    (candidate) =>
      candidate.provider === provider &&
      (candidate.model === model ||
        (provider === "cursor" && model === `${candidate.model}-fast`))
  );
  if (row === undefined) {
    throw new Error(`no matrix family for ${entry}`);
  }
  if (!row.selectableEfforts.includes(asEffort(effort))) {
    throw new Error(`${entry}: ${effort} is not selectable for ${row.family}`);
  }
  return row.family;
}

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
  const rows = parseModelMatrix(readFileSync(DISPATCH_PATH, "utf8"));
  const setup = readFileSync(SETUP_PATH, "utf8");
  const owner = parseSheet(OWNER_SHEET);
  const skill = (name: string) =>
    readFileSync(join(PLUGIN_ROOT, "skills", name, "SKILL.md"), "utf8");

  it("keeps every owner line in setup's role map, so setup neither drops nor rejects one", () => {
    expect([...owner.keys()]).toEqual([...parseSheet(firstRunSheet(setup)).keys()]);

  });

  it("resolves every owner entry to its matrix family", () => {
    const families = new Map<string, string[]>();
    for (const [role, entries] of owner) {
      families.set(role, entries.map((entry) => resolveEntry(entry, rows)));
    }
    expect(families.get("swarm workers")).toEqual(["sol"]);
    expect(families.get("arena runners")).toEqual(["fable", "sol"]);
    expect(families.get("why investigators, synthesizer")).toEqual(["inherit-parent"]);
  });

  it("names only lines the owner's sheet carries, so no combined line reaches a default", () => {
    for (const [name, expected] of Object.entries(ROUTED_SKILL_LINES)) {
      const cited = citedLines(skill(name));
      expect({ name, cited }).toEqual({ name, cited: [...expected].sort() });
      for (const line of cited) {
        expect({ name, line, present: owner.has(line) }).toEqual({
          name,
          line,
          present: true,
        });
      }
    }
    const poteto = skill("poteto-mode");
    for (const role of [
      "feature, refactoring",
      "bug-fix",
      "perf-issue",
      "hillclimb",
      "hardest tasks",
      "judgment and prose",
    ]) {
      expect(poteto).toContain(`\`${role}\``);
      expect(owner.has(role)).toBe(true);
    }
  });

});
