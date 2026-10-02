import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  codexFailureMessage,
  parseProviderOutput,
  reportedModelMatches,
} from "./parse-output.ts";

describe("codexFailureMessage", () => {
  for (const [name, message] of [
    ["signed-out", "401 Unauthorized"],
    ["usage-limit", "You’ve hit your usage limit"],
    ["rate-limit", "429 Too Many Requests"],
    ["unknown-model", "The 'gpt-6.1-sol-nope' model is not supported"],
    ["unsupported-effort", "Unsupported value: 'max' is not supported"],
    ["network-wait", "Reconnecting... waiting for network"],
  ] as const) {
    it(`reads the terminal failure message from the ${name} fixture`, () => {
      const stdout = readFileSync(
        join(import.meta.dir, "fixtures/codex-0.160.0", `${name}.jsonl`),
        "utf8"
      );
      const terminal = JSON.parse(stdout.trim().split("\n").at(-1)!);
      const expected = terminal.type === "turn.failed"
        ? terminal.error.message
        : terminal.message;
      expect(codexFailureMessage(stdout)).toBe(expected);
      expect(codexFailureMessage(stdout)).toContain(message);
    });
  }

  it("prefers the last turn.failed message over errors and agent text", () => {
    const stdout = [
      { type: "turn.failed", error: { message: "first failed turn" } },
      { type: "error", message: "earlier top-level error" },
      { type: "item.completed", item: { type: "agent_message", text: "authentication" } },
      { type: "turn.failed", error: { message: "last failed turn" } },
      { type: "error", message: "later top-level error" },
    ].map((event) => JSON.stringify(event)).join("\n");
    expect(codexFailureMessage(stdout)).toBe("last failed turn");
  });

  it("falls back to the last top-level error while skipping non-JSON lines", () => {
    const stdout = [
      "not JSON",
      JSON.stringify({ type: "error", message: "first error" }),
      "{broken JSON}",
      "null",
      JSON.stringify({ type: "error", message: "last error" }),
      JSON.stringify({ type: "item.completed", item: { type: "error", message: "item error" } }),
      "more non-JSON output",
    ].join("\n");
    expect(codexFailureMessage(stdout)).toBe("last error");
  });

  it("returns null when no top-level failure message exists", () => {
    const stdout = [
      "not JSON", "", "null", "[]", "{}",
      JSON.stringify({ type: "item.completed", item: { type: "error", message: "item error" } }),
      JSON.stringify({ type: "turn.completed" }),
    ].join("\n");
    expect(codexFailureMessage(stdout)).toBeNull();
  });
});

describe("parseProviderOutput", () => {
  it("extracts Claude text, model, usage, cost, and session", () => {
    const parsed = parseProviderOutput(
      "claude",
      JSON.stringify({
        result: "CLAUDE_OK",
        session_id: "claude-session",
        usage: { input_tokens: 10, output_tokens: 3 },
        total_cost_usd: 0.05,
        modelUsage: { "claude-fable-9-9": { inputTokens: 10 } },
      }),
      "",
      "fable",
      "max"
    );
    expect(parsed).toMatchObject({
      text: "CLAUDE_OK",
      reportedModel: "claude-fable-9-9",
      sessionId: "claude-session",
      usage: { inputTokens: 10, outputTokens: 3 },
      costUsd: 0.05,
    });
  });

  it("extracts Codex JSONL without inventing a provider-reported model", () => {
    const parsed = parseProviderOutput(
      "codex",
      [
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
      "model: gpt-5.6-sol\nreasoning effort: max\n",
      "gpt-5.6-sol",
      "max"
    );
    expect(parsed).toMatchObject({
      text: "CODEX_OK",
      reportedModel: null,
      sessionId: "codex-session",
      usage: {
        inputTokens: 20,
        cachedInputTokens: 4,
        outputTokens: 5,
        reasoningTokens: 2,
      },
    });
  });

  it("accepts Grok's reported build suffix", () => {
    const parsed = parseProviderOutput(
      "grok",
      [
        JSON.stringify({
          type: "assistant",
          message: { content: [{ type: "text", text: "progress" }] },
        }),
        JSON.stringify({
          type: "result",
          subtype: "success",
          is_error: false,
          result: "GROK_OK",
          session_id: "grok-session",
          usage: {
            input_tokens: 30,
            cache_read_input_tokens: 6,
            output_tokens: 7,
            reasoning_tokens: 3,
            total_tokens: 43,
          },
          total_cost_usd: 0.02,
          modelUsage: { "grok-4.6-build": {} },
        }),
      ].join("\n"),
      "",
      "grok-4.6",
      "xhigh"
    );
    expect(parsed.text).toBe("GROK_OK");
    expect(parsed.reportedModel).toBe("grok-4.6-build");
    expect(
      reportedModelMatches("grok", "grok-4.6", parsed.reportedModel, "xhigh")
    ).toBe(true);
  });

  it("reads Cursor's served display name, session, and camelCase usage", () => {
    const parsed = parseProviderOutput(
      "cursor",
      [
        JSON.stringify({
          type: "system",
          subtype: "init",
          apiKeySource: "login",
          cwd: "/tmp/worktree",
          session_id: "00000000-0000-4000-8000-000000000001",
          model: "Grok 4.6 Extra High",
          permissionMode: "default",
        }),
        JSON.stringify({
          type: "assistant",
          message: { role: "assistant", content: [{ type: "text", text: "OK-2" }] },
          session_id: "00000000-0000-4000-8000-000000000001",
        }),
        JSON.stringify({
          type: "result",
          subtype: "success",
          duration_ms: 6559,
          is_error: false,
          result: "OK-2",
          session_id: "00000000-0000-4000-8000-000000000001",
          request_id: "f3db21b8-1a63-42b3-9b70-852cc8b1d3ee",
          usage: {
            inputTokens: 17978,
            outputTokens: 77,
            cacheReadTokens: 12,
            cacheWriteTokens: 5,
          },
        }),
      ].join("\n"),
      "",
      "grok-4.6",
      "xhigh"
    );
    expect(parsed).toMatchObject({
      text: "OK-2",
      reportedModel: "Grok 4.6 Extra High",
      sessionId: "00000000-0000-4000-8000-000000000001",
      usage: {
        inputTokens: 17978,
        outputTokens: 77,
        cachedInputTokens: 12,
        cacheCreationInputTokens: 5,
      },
      costUsd: null,
    });
  });

  it("matches only the Cursor display name registered for the requested model and effort", () => {
    const standard = "Grok 4.6 Extra High";
    const fast = "Grok 4.6 Extra High Fast";
    expect(reportedModelMatches("cursor", "grok-4.6", standard, "xhigh")).toBe(true);
    expect(reportedModelMatches("cursor", "grok-4.6-fast", fast, "xhigh")).toBe(true);
    // A fast display name is its standard twin plus a word, so only equality
    // tells the two speed tiers apart in either direction.
    expect(reportedModelMatches("cursor", "grok-4.6", fast, "xhigh")).toBe(false);
    expect(reportedModelMatches("cursor", "grok-4.6-fast", standard, "xhigh")).toBe(false);
    expect(reportedModelMatches("cursor", "grok-4.6", "Grok 4.6", "high")).toBe(true);
    expect(
      reportedModelMatches("cursor", "grok-4.6", "Grok 4.6 Fast", "high")
    ).toBe(false);
    expect(
      reportedModelMatches("cursor", "grok-4.6-fast", "Grok 4.6 Fast", "high")
    ).toBe(true);
    expect(
      reportedModelMatches("cursor", "grok-4.6-fast", "Grok 4.6", "high")
    ).toBe(false);
    expect(reportedModelMatches("cursor", "grok-4.6", standard, "high")).toBe(false);
    expect(
      reportedModelMatches("cursor", "grok-4.6", "cursor-grok-4.6-xhigh", "xhigh")
    ).toBe(false);
    expect(reportedModelMatches("cursor", "grok-4.6", null, "xhigh")).toBe(false);
  });

  it("verifies Cursor's Grok 4.7 stream names through padding and zero-width tails", () => {
    // Cursor's stream reported these for the standard ids on 2026-09-23.
    expect(
      reportedModelMatches("cursor", "grok-4.7", "Grok 4.7 256K Extra High", "xhigh")
    ).toBe(true);
    expect(reportedModelMatches("cursor", "grok-4.7", "Grok 4.7 256K High", "high")).toBe(true);
    // `cursor-agent models` pads Grok 4.7 names with a double space and ends
    // every Fast name with two U+200B characters.
    const fast = "Grok 4.7 256K  Extra High Fast\u200b\u200b";
    expect(reportedModelMatches("cursor", "grok-4.7-fast", fast, "xhigh")).toBe(true);
    expect(
      reportedModelMatches("cursor", "grok-4.7", "Grok 4.7 256K  Extra High\u200b\u200b", "xhigh")
    ).toBe(true);
    // Normalizing spacing must not merge speed tiers, efforts, or a missing word.
    expect(reportedModelMatches("cursor", "grok-4.7", fast, "xhigh")).toBe(false);
    expect(
      reportedModelMatches("cursor", "grok-4.7-fast", "Grok 4.7 256K Extra High", "xhigh")
    ).toBe(false);
    expect(
      reportedModelMatches("cursor", "grok-4.7", "Grok 4.7 256K Extra High", "high")
    ).toBe(false);
    expect(
      reportedModelMatches("cursor", "grok-4.7", "Grok 4.7 256K ExtraHigh", "xhigh")
    ).toBe(false);
    expect(
      reportedModelMatches("cursor", "grok-4.6", "Grok 4.7 256K Extra High", "xhigh")
    ).toBe(false);
  });

  it("verifies Cursor's Grok 4.7 listing names, which its stream also reports", () => {
    // Lanes on 2026-09-30 and 2026-10-02 saw the stream report the listing form,
    // with the 256K slot blank, for the same standard id.
    for (const [effort, words] of [
      ["low", "Low"],
      ["medium", "Medium"],
      ["high", "High"],
      ["xhigh", "Extra High"],
    ] as const) {
      expect(
        reportedModelMatches("cursor", "grok-4.7", `Grok 4.7  ${words}`, effort)
      ).toBe(true);
      expect(
        reportedModelMatches("cursor", "grok-4.7-fast", `Grok 4.7  ${words} Fast​​`, effort)
      ).toBe(true);
    }
    // Either form still names one speed tier, one effort, and one generation.
    expect(
      reportedModelMatches("cursor", "grok-4.7", "Grok 4.7  Extra High Fast​​", "xhigh")
    ).toBe(false);
    expect(
      reportedModelMatches("cursor", "grok-4.7-fast", "Grok 4.7  Extra High", "xhigh")
    ).toBe(false);
    expect(reportedModelMatches("cursor", "grok-4.7", "Grok 4.7  High", "xhigh")).toBe(false);
    expect(reportedModelMatches("cursor", "grok-4.7", "Grok 4.7  Extra High", "high")).toBe(false);
    expect(reportedModelMatches("cursor", "grok-4.6", "Grok 4.7  Extra High", "xhigh")).toBe(false);
    expect(reportedModelMatches("cursor", "grok-4.7", "Grok 4.6 Extra High", "xhigh")).toBe(false);
    expect(reportedModelMatches("cursor", "grok-4.7", "Grok 4.7 128K Extra High", "xhigh")).toBe(false);
    expect(reportedModelMatches("cursor", "grok-4.7", "Grok 4.7", "xhigh")).toBe(false);
  });

  it("selects the requested Claude model when usage includes a side model", () => {
    const parsed = parseProviderOutput(
      "claude",
      JSON.stringify({
        result: "CLAUDE_OK",
        modelUsage: {
          "claude-haiku-4-5-20251001": {},
          "claude-fable-9-9": {},
        },
      }),
      "",
      "fable",
      "max"
    );
    expect(parsed.reportedModel).toBe("claude-fable-9-9");
  });

  it("matches only concrete Claude revisions from the requested rolling family", () => {
    expect(reportedModelMatches("claude", "fable", "claude-fable-9-9", "max")).toBe(true);
    expect(reportedModelMatches("claude", "opus", "claude-opus-9", "max")).toBe(true);
    expect(reportedModelMatches("claude", "fable", "claude-opus-9", "max")).toBe(false);
    expect(reportedModelMatches("claude", "fable", "claude-fable-beta", "max")).toBe(false);
    expect(reportedModelMatches("claude", "fable", "fable", "max")).toBe(false);
    expect(reportedModelMatches("claude", "fable", "fable-preview", "max")).toBe(false);
    expect(reportedModelMatches("grok", "fable", "claude-fable-9-9", "max")).toBe(false);
  });

  it("rejects malformed or textless responses", () => {
    expect(() =>
      parseProviderOutput("claude", "not-json", "", "fable", "max")
    ).toThrow("valid JSON");
    expect(() =>
      parseProviderOutput(
        "codex",
        JSON.stringify({ type: "turn.completed" }),
        "",
        "gpt-5.6-sol",
        "max"
      )
    ).toThrow("final agent message");
    expect(() =>
      parseProviderOutput(
        "cursor",
        JSON.stringify({ type: "system", subtype: "init", model: "Grok 4.6" }),
        "",
        "grok-4.6",
        "xhigh"
      )
    ).toThrow("terminal event");
    expect(() =>
      parseProviderOutput("cursor", "{not json}", "", "grok-4.6", "xhigh")
    ).toThrow("non-JSON event");
    expect(() =>
      parseProviderOutput(
        "cursor",
        JSON.stringify({
          type: "result",
          subtype: "error",
          is_error: true,
          result: "boom",
        }),
        "",
        "grok-4.6",
        "xhigh"
      )
    ).toThrow("error result");
  });
});
