import { type Access, adapter, type ParseResult, type StreamFailure } from "../registry/contract.ts";
import { modelFailureStatus, type NormalizedUsage } from "../types.ts";
import {
  effortArgs,
  exactOrSuffixed,
  failedPreflight,
  normalizedUsage,
  nullableString,
  object,
} from "./shared.ts";

function failureMessage(stdout: string): string | null {
  let turnFailure: string | null = null;
  let errorMessage: string | null = null;
  for (const line of stdout.split("\n")) {
    let raw: unknown;
    try {
      raw = JSON.parse(line);
    } catch {
      continue;
    }
    const event = object(raw);
    if (event?.type === "turn.failed") {
      turnFailure = nullableString(object(event.error)?.message);
    } else if (event?.type === "error") {
      errorMessage = nullableString(event.message);
    }
  }
  return turnFailure ?? errorMessage;
}

function networkWaitWatcher(): (line: string) => StreamFailure | null {
  let hasProgress = false;
  return (line) => {
    let raw: unknown;
    try {
      raw = JSON.parse(line);
    } catch {
      return null;
    }
    const event = object(raw);
    if (event === null) return null;
    const item = object(event.item);
    if (event.type === "turn.completed"
        || ((event.type === "item.started" || event.type === "item.completed")
          && typeof item?.type === "string" && item.type !== "error")) hasProgress = true;
    return !hasProgress && event.type === "error"
      && typeof event.message === "string" && /waiting for network/i.test(event.message)
      ? { status: "unavailable-network", message: "Codex was waiting for the network before the model produced output" }
      : null;
  };
}

function parse(stdout: string): ParseResult {
  let text: string | null = null;
  let usage: NormalizedUsage | null = null;
  let sessionId: string | null = null;

  for (const line of stdout.split("\n")) {
    if (line.trim().length === 0) continue;
    let raw: unknown;
    try {
      raw = JSON.parse(line);
    } catch {
      return { kind: "malformed", message: "codex emitted a non-JSON event" };
    }
    const event = object(raw);
    if (event === null) continue;
    if (event.type === "thread.started") {
      sessionId = nullableString(event.thread_id) ?? sessionId;
    }
    if (event.type === "item.completed") {
      const item = object(event.item);
      if (item?.type === "agent_message") {
        text = nullableString(item.text) ?? text;
      }
    }
    if (event.type === "turn.completed") {
      usage = normalizedUsage(event.usage) ?? usage;
    }
    if (event.type === "turn.failed") {
      const error = object(event.error);
      return { kind: "malformed", message: nullableString(error?.message) ?? "codex reported a failed turn" };
    }
  }

  if (text === null) {
    return { kind: "malformed", message: "codex result did not contain a final agent message" };
  }
  return {
    kind: "complete",
    text,
    metadata: { reportedModel: null, sessionId, usage, costUsd: null },
  };
}

function sandbox(access: Access): string {
  if (access.mode === "read-only") return "read-only";
  return access.sandbox === "full-access" ? "danger-full-access" : "workspace-write";
}

export const codex = adapter({
  id: "codex",
  executable: "codex",
  effortIn: "flag",
  preflight: {
    argv: () => ["login", "status"],
    retryAfterUnauthenticatedMs: null,
    classify: (run) => run.exitCode === 0 && /logged in/i.test(`${run.stdout}\n${run.stderr}`)
      ? { kind: "passed", evidence: "authenticated" }
      : failedPreflight(run, "unauthenticated"),
  },
  launch: {
    prompt: "stdin",
    watchStdout: networkWaitWatcher,
    sidecar: null,
    supports: ["read-only", "isolated-write", "isolated-write-full-access"],
    needsSharedGitDir: () => false,
    argv: (lane) => [
      "exec",
      "--ignore-user-config",
      "--disable",
      "apps",
      "--model",
      lane.model,
      ...effortArgs(lane, ["--config", `model_reasoning_effort=${JSON.stringify(lane.effort)}`]),
      "--sandbox",
      sandbox(lane.access),
      "--cd",
      lane.cwd,
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
    ],
  },
  parse: (run) => {
    if (run.exitCode !== 0) {
      const message = failureMessage(run.stdout);
      return {
        kind: "provider-failure",
        status: message !== null && /401 Unauthorized/i.test(message) ? "unauthenticated" : modelFailureStatus(message ?? run.stderr),
        message: message ?? `child exited with status ${run.exitCode}`,
        metadata: null,
      };
    }
    return parse(run.stdout);
  },
  proof: { report: "absent", matches: exactOrSuffixed },
  environment: () => ({ kind: "inherit", dropPrefixes: [] }),
  docs: {
    name: "Codex CLI",
    hostPrerequisites: [],
    statePaths: ["the Codex home (`CODEX_HOME`, else `~/.codex`)"],
    notes: [],
  },
});
