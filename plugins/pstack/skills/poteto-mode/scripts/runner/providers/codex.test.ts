import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { LaneRequest } from "../registry/index.ts";
import { adapterSuite, testLane } from "./adapter-suite.ts";
import { codex } from "./codex.ts";

adapterSuite(codex);

const lane = (request: Partial<LaneRequest> = {}) =>
  testLane({ provider: "codex", model: "gpt-5.6-sol", ...request });
const argv = (request: Partial<LaneRequest> = {}) => codex.launch.argv(lane(request), { sharedGitDir: null, providerSidecar: null });
const parse = (stdout: string) => codex.parse({ exitCode: 0, stdout, stderr: "", sidecar: null }, lane());

describe("codex launch", () => {
  it("pins Codex model, effort, sandbox, cwd, and JSONL output", () => {
    expect(codex.executable).toBe("codex");
    expect(codex.launch.prompt).toBe("stdin");
    const args = argv();
    expect(args).toEqual([
      "exec",
      "--ignore-user-config",
      "--disable",
      "apps",
      "--model",
      "gpt-5.6-sol",
      "--config",
      'model_reasoning_effort="max"',
      "--sandbox",
      "read-only",
      "--cd",
      "/tmp/worktree",
      "--skip-git-repo-check",
      "--ephemeral",
      "--disable",
      "plugins",
      "--disable",
      "multi_agent",
      "--disable",
      "hooks",
      "--disable",
      "memories",
      "--json",
      "-",
    ]);
    expect(args).not.toContain("danger-full-access");
  });

  it("isolates Codex MCP configuration and apps in every access mode", () => {
    for (const request of [{ mode: "read-only" }, { mode: "isolated-write" }, { mode: "isolated-write", writerSandbox: "full-access" }]) {
      expect(argv(request).slice(0, 4)).toEqual(["exec", "--ignore-user-config", "--disable", "apps"]);
    }
  });

  it("passes the ultra effort to Codex unchanged", () => {
    expect(argv({ model: "gpt-6.1-sol", effort: "ultra" }).slice(0, 8)).toEqual([
      "exec",
      "--ignore-user-config",
      "--disable",
      "apps",
      "--model",
      "gpt-6.1-sol",
      "--config",
      'model_reasoning_effort="ultra"',
    ]);
  });

  it("uses a bounded write mode without blanket bypasses", () => {
    expect(argv({ mode: "isolated-write" })).toEqual(
      expect.arrayContaining(["--sandbox", "workspace-write"])
    );
  });

  it("keeps an explicitly bounded writer on workspace-write", () => {
    expect(argv({ mode: "isolated-write", writerSandbox: "bounded" })).toEqual(argv({ mode: "isolated-write" }));
  });

  it("gives only an opted-in writer the full-access sandbox", () => {
    const bounded = argv({ mode: "isolated-write" });
    const full = argv({ mode: "isolated-write", writerSandbox: "full-access" });
    const at = bounded.indexOf("workspace-write");
    expect(full).toEqual([...bounded.slice(0, at), "danger-full-access", ...bounded.slice(at + 1)]);
    expect(full.slice(at - 1, at + 1)).toEqual(["--sandbox", "danger-full-access"]);
  });

  it("covers low, medium, and high", () => {
    for (const effort of ["low", "medium", "high"] as const) {
      expect(argv({ effort })).toEqual(
        expect.arrayContaining(["--config", `model_reasoning_effort="${effort}"`])
      );
    }
  });
});

describe("codex parse", () => {
  for (const [name, status] of [
    ["signed-out", "unauthenticated"],
    ["usage-limit", "usage-limited"],
    ["rate-limit", "rate-limited"],
    ["unknown-model", "unavailable-model"],
    ["unsupported-effort", "unavailable-model"],
  ] as const) {
    it(`classifies the Codex ${name} terminal fixture as ${status}`, () => {
      const stdout = readFileSync(join(import.meta.dir, "../fixtures/codex-0.160.0", `${name}.jsonl`), "utf8");
      expect(codex.parse({ exitCode: 1, stdout, stderr: "", sidecar: null }, lane()))
        .toMatchObject({ kind: "provider-failure", status });
    });
  }

  it("uses turn.failed before the last error and ignores earlier model text", () => {
    const events = [
      { type: "item.completed", item: { type: "agent_message", text: "401 Unauthorized; quota exceeded" } },
      { type: "error", message: "429 Too Many Requests" },
      { type: "error", message: "connection refused" },
      { type: "turn.failed", error: { message: "model not supported" } },
    ];
    const classify = (events: unknown[], exitCode = 1) => codex.parse({
      exitCode, stdout: events.map((event) => JSON.stringify(event)).join("\n"), stderr: "", sidecar: null,
    }, lane());
    expect(classify(events)).toMatchObject({ kind: "provider-failure", status: "unavailable-model", message: "model not supported" });
    expect(classify(events.slice(0, 3))).toMatchObject({ kind: "provider-failure", status: "unavailable-network", message: "connection refused" });
    expect(classify(events.slice(0, 1))).toMatchObject({ kind: "provider-failure", status: "child-failed" });
    expect(classify(events, 0)).toMatchObject({ kind: "malformed", message: "model not supported" });
  });

  it("extracts Codex JSONL without inventing a provider-reported model", () => {
    const parsed = codex.parse({
      exitCode: 0,
      stdout: [
        JSON.stringify({ type: "thread.started", thread_id: "codex-session" }),
        JSON.stringify({
          type: "item.completed",
          item: { type: "agent_message", text: "CODEX_OK" },
        }),
        JSON.stringify({
          type: "turn.completed",
          usage: {
            input_tokens: 20,
            cached_input_tokens: 4,
            output_tokens: 5,
            reasoning_output_tokens: 2,
          },
        }),
      ].join("\n"),
      stderr: "model: gpt-5.6-sol\nreasoning effort: max\n",
      sidecar: null,
    }, lane());
    expect(parsed).toMatchObject({
      kind: "complete",
      text: "CODEX_OK",
      metadata: {
        reportedModel: null,
        sessionId: "codex-session",
        usage: {
          inputTokens: 20,
          cachedInputTokens: 4,
          outputTokens: 5,
          reasoningTokens: 2,
        },
      },
    });
    expect(codex.proof.report).toBe("absent");
  });

  it("rejects textless, failed and non-JSON responses", () => {
    expect(parse(JSON.stringify({ type: "turn.completed" })))
      .toEqual({ kind: "malformed", message: "codex result did not contain a final agent message" });
    expect(parse(JSON.stringify({ type: "turn.failed", error: { message: "quota exceeded" } })))
      .toEqual({ kind: "malformed", message: "quota exceeded" });
    expect(parse("not-json")).toEqual({ kind: "malformed", message: "codex emitted a non-JSON event" });
  });
});

describe("codex preflight", () => {
  it("passes a logged-in status with exit 0", () => {
    const classify = (exitCode: number, stdout: string, stderr = "") =>
      codex.preflight.classify({ exitCode, stdout, stderr }, lane());
    expect(classify(0, "Logged in using ChatGPT")).toEqual({ kind: "passed", evidence: "authenticated" });
    expect(classify(0, "", "Logged in using an API key")).toEqual({ kind: "passed", evidence: "authenticated" });
    expect(classify(1, "Logged in using ChatGPT")).toEqual({ kind: "unauthenticated" });
    expect(classify(0, "status unknown")).toEqual({ kind: "unauthenticated" });
    expect(codex.preflight.argv(lane(), null)).toEqual(["login", "status"]);
    expect(codex.preflight.retryAfterUnauthenticatedMs).toBeNull();
  });
});
