import { describe, expect, it } from "bun:test";
import { invocationCommand } from "./commands.ts";
import type { Effort, RunnerOptions } from "./types.ts";

function options(overrides: Partial<RunnerOptions> = {}): RunnerOptions {
  return {
    parent: "claude",
    provider: "codex",
    model: "gpt-5.6-sol",
    effort: "max",
    mode: "read-only",
    promptPath: "/tmp/prompt.md",
    cwd: "/tmp/worktree",
    outputPath: "/tmp/output.md",
    receiptPath: "/tmp/receipt.json",
    timeoutMs: null,
    ...overrides,
  };
}

describe("invocationCommand", () => {
  it("pins Codex model, effort, sandbox, cwd, and JSONL output", () => {
    const spec = invocationCommand(options());
    expect(spec.command).toBe("codex");
    expect(spec.stdin).toBe("prompt");
    expect(spec.args).toEqual([
      "exec",
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
    expect(spec.args).not.toContain("danger-full-access");
  });

  it("pins GPT-6.1 Sol and max effort in the exact Codex argv", () => {
    const spec = invocationCommand(options({ model: "gpt-6.1-sol", effort: "max" }));
    expect(spec.command).toBe("codex");
    expect(spec.stdin).toBe("prompt");
    expect(spec.args).toEqual([
      "exec",
      "--model",
      "gpt-6.1-sol",
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
  });

  it("passes Claude model, effort, permissions, and no-recursion controls", () => {
    const spec = invocationCommand(
      options({
        parent: "codex",
        provider: "claude",
        model: "fable",
      })
    );
    expect(spec.command).toBe("claude");
    expect(spec.stdin).toBe("prompt");
    expect(spec.args).toEqual([
      "-p",
      "--model",
      "fable",
      "--effort",
      "max",
      "--permission-mode",
      "plan",
      "--setting-sources",
      "project",
      "--strict-mcp-config",
      "--tools",
      "Read,Grep,Glob,Bash",
      "--no-session-persistence",
      "--disable-slash-commands",
      "--disallowed-tools",
      "Agent,Task,WebSearch,WebFetch,Edit,Write,NotebookEdit",
      "--output-format",
      "json",
    ]);
    expect(spec.args).not.toContain("bypassPermissions");
  });

  it("limits Grok to the assigned cwd and disables recursive agents", () => {
    const spec = invocationCommand(
      options({ provider: "grok", model: "grok-4.6", effort: "xhigh" })
    );
    expect(spec.command).toBe("grok");
    expect(spec.stdin).toBe("none");
    expect(spec.args).toEqual([
      "--prompt-file",
      "/tmp/prompt.md",
      "--model",
      "grok-4.6",
      "--reasoning-effort",
      "xhigh",
      "--permission-mode",
      "plan",
      "--sandbox",
      "read-only",
      "--tools",
      "read_file,grep,list_dir,run_terminal_cmd",
      "--disallowed-tools",
      "Agent,search_tool,use_tool",
      "--output-format",
      "streaming-messages-json",
      "--cwd",
      "/tmp/worktree",
      "--no-subagents",
      "--disable-web-search",
      "--verbatim",
    ]);
  });

  it("selects the Cursor standard model id for the requested effort", () => {
    const spec = invocationCommand(
      options({ provider: "cursor", model: "grok-4.6", effort: "xhigh" })
    );
    expect(spec.command).toBe("cursor-agent");
    expect(spec.stdin).toBe("prompt");
    expect(spec.args).toEqual([
      "-p",
      "--model",
      "cursor-grok-4.6-xhigh",
      "--mode",
      "plan",
      "--trust",
      "--workspace",
      "/tmp/worktree",
      "--output-format",
      "stream-json",
    ]);
    expect(spec.args).not.toContain("--force");
    expect(spec.args).not.toContain("--approve-mcps");
  });

  it("gives a Cursor writer force instead of plan mode", () => {
    const spec = invocationCommand(
      options({
        provider: "cursor",
        model: "grok-4.6",
        effort: "xhigh",
        mode: "isolated-write",
      })
    );
    expect(spec.args).toEqual([
      "-p",
      "--model",
      "cursor-grok-4.6-xhigh",
      "--force",
      "--trust",
      "--workspace",
      "/tmp/worktree",
      "--output-format",
      "stream-json",
    ]);
    expect(spec.args).not.toContain("plan");
    expect(spec.args).not.toContain("--yolo");
  });

  it("maps each Cursor model name and effort to its own model id", () => {
    const ids: Record<string, Record<string, string>> = {
      "grok-4.6": {
        low: "cursor-grok-4.6-low",
        medium: "cursor-grok-4.6-medium",
        high: "cursor-grok-4.6-high",
        xhigh: "cursor-grok-4.6-xhigh",
      },
      "grok-4.6-fast": {
        low: "cursor-grok-4.6-low-fast",
        medium: "cursor-grok-4.6-medium-fast",
        high: "cursor-grok-4.6-high-fast",
        xhigh: "cursor-grok-4.6-xhigh-fast",
      },
    };
    for (const [model, byEffort] of Object.entries(ids)) {
      for (const [effort, id] of Object.entries(byEffort)) {
        const spec = invocationCommand(
          options({ provider: "cursor", model, effort: effort as Effort })
        );
        expect(spec.args[spec.args.indexOf("--model") + 1]).toBe(id);
      }
    }
  });

  it("maps Grok 4.7 to Cursor's unprefixed model ids", () => {
    const ids: Record<string, Record<string, string>> = {
      "grok-4.7": {
        low: "grok-4.7-low",
        medium: "grok-4.7-medium",
        high: "grok-4.7-high",
        xhigh: "grok-4.7-xhigh",
      },
      "grok-4.7-fast": {
        low: "grok-4.7-low-fast",
        medium: "grok-4.7-medium-fast",
        high: "grok-4.7-high-fast",
        xhigh: "grok-4.7-xhigh-fast",
      },
    };
    for (const [model, byEffort] of Object.entries(ids)) {
      for (const [effort, id] of Object.entries(byEffort)) {
        const spec = invocationCommand(
          options({ provider: "cursor", model, effort: effort as Effort })
        );
        expect(spec.args[spec.args.indexOf("--model") + 1]).toBe(id);
      }
    }
    expect(() =>
      invocationCommand(
        options({ provider: "cursor", model: "grok-4.7", effort: "max" })
      )
    ).toThrow("cursor does not offer grok-4.7 at effort max");
    expect(() =>
      invocationCommand(
        options({ provider: "cursor", model: "grok-4.7-fast", effort: "max" })
      )
    ).toThrow("cursor does not offer grok-4.7-fast at effort max");
  });

  it("refuses a Cursor pair that the account cannot select", () => {
    expect(() =>
      invocationCommand(
        options({ provider: "cursor", model: "grok-4.6", effort: "max" })
      )
    ).toThrow("cursor does not offer grok-4.6 at effort max");
    expect(() =>
      invocationCommand(
        options({ provider: "cursor", model: "grok-4.6-fast", effort: "max" })
      )
    ).toThrow("cursor does not offer grok-4.6-fast at effort max");
    expect(() =>
      invocationCommand(
        options({ provider: "cursor", model: "gpt-5.2", effort: "xhigh" })
      )
    ).toThrow("cursor does not offer gpt-5.2 at effort xhigh");
    expect(() =>
      invocationCommand(
        options({ provider: "cursor", model: "grok-4.6-slow", effort: "xhigh" })
      )
    ).toThrow("cursor does not offer grok-4.6-slow at effort xhigh");
  });

  it("uses bounded write modes without blanket bypasses", () => {
    const codex = invocationCommand(options({ mode: "isolated-write" }));
    expect(codex.args).toEqual(
      expect.arrayContaining(["--sandbox", "workspace-write"])
    );
    const grok = invocationCommand(
      options({ provider: "grok", model: "grok-4.6", mode: "isolated-write" })
    );
    expect(grok.args).toEqual(
      expect.arrayContaining([
        "--permission-mode",
        "acceptEdits",
        "--sandbox",
        "workspace",
        "--tools",
        "read_file,grep,list_dir,run_terminal_cmd,search_replace",
      ])
    );
    expect(grok.args).not.toContain("--always-approve");

    const claude = invocationCommand(
      options({ provider: "claude", model: "fable", mode: "isolated-write" })
    );
    expect(claude.args).toEqual(
      expect.arrayContaining([
        "--permission-mode",
        "acceptEdits",
        "--tools",
        "Read,Write,Edit,Grep,Glob,Bash",
      ])
    );
  });

  it("covers low, medium, and high for every external provider", () => {
    const cases = [
      {
        provider: "claude" as const,
        model: "fable",
        flag: (effort: "low" | "medium" | "high") => ["--effort", effort],
      },
      {
        provider: "codex" as const,
        model: "gpt-5.6-sol",
        flag: (effort: "low" | "medium" | "high") => [
          "--config",
          `model_reasoning_effort="${effort}"`,
        ],
      },
      {
        provider: "grok" as const,
        model: "grok-4.6",
        flag: (effort: "low" | "medium" | "high") => [
          "--reasoning-effort",
          effort,
        ],
      },
      {
        provider: "cursor" as const,
        model: "grok-4.6",
        flag: (effort: "low" | "medium" | "high") => [
          "--model",
          `cursor-grok-4.6-${effort}`,
        ],
      },
    ];
    for (const { provider, model, flag } of cases) {
      for (const effort of ["low", "medium", "high"] as const) {
        const spec = invocationCommand(options({ provider, model, effort }));
        expect(spec.args).toEqual(expect.arrayContaining(flag(effort)));
      }
    }
  });
});
