import { describe, expect, it } from "bun:test";
import { parseProviderOutput, reportedModelMatches } from "./parse-output.ts";

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
          session_id: "89cdf315-fe8f-40f7-8dd8-f6eb26c77488",
          model: "Cursor Grok 4.6 Extra High Fast",
          permissionMode: "default",
        }),
        JSON.stringify({
          type: "assistant",
          message: { role: "assistant", content: [{ type: "text", text: "OK-2" }] },
          session_id: "89cdf315-fe8f-40f7-8dd8-f6eb26c77488",
        }),
        JSON.stringify({
          type: "result",
          subtype: "success",
          duration_ms: 6559,
          is_error: false,
          result: "OK-2",
          session_id: "89cdf315-fe8f-40f7-8dd8-f6eb26c77488",
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
      reportedModel: "Cursor Grok 4.6 Extra High Fast",
      sessionId: "89cdf315-fe8f-40f7-8dd8-f6eb26c77488",
      usage: {
        inputTokens: 17978,
        outputTokens: 77,
        cachedInputTokens: 12,
        cacheCreationInputTokens: 5,
      },
      costUsd: null,
    });
  });

  it("matches only the Cursor display name registered for the requested effort", () => {
    const xhigh = "Cursor Grok 4.6 Extra High Fast";
    expect(reportedModelMatches("cursor", "grok-4.6", xhigh, "xhigh")).toBe(true);
    expect(reportedModelMatches("cursor", "grok-4.6", xhigh, "high")).toBe(false);
    expect(
      reportedModelMatches("cursor", "grok-4.6", "Cursor Grok 4.6 Fast", "high")
    ).toBe(true);
    expect(
      reportedModelMatches("cursor", "grok-4.6", "cursor-grok-4.6-xhigh-fast", "xhigh")
    ).toBe(false);
    expect(reportedModelMatches("cursor", "grok-4.6", null, "xhigh")).toBe(false);
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
        JSON.stringify({ type: "system", subtype: "init", model: "Cursor Grok 4.6" }),
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
