# Provider dispatch

pstack model choices are provider-qualified descriptors:

```text
<provider>:<model>@<effort>
```

## Model matrix

| Family | Upstream pstack choice | Provider | Model | Default effort | Selectable efforts | Claude-native agent stem | Setup probe |
|---|---|---|---|---|---|---|---|
| opus | opus | claude | opus | max | low medium high xhigh max | opus | required |
| sol | gpt-5.6-sol-max | codex | gpt-5.6-sol | max | low medium high xhigh max | - | required |
| grok | grok-4.7-xhigh-fast | grok | grok-4.7 | xhigh | low medium high xhigh max | - | required |
| fable | - | claude | fable | max | low medium high xhigh max | fable | on request |
| cursor | grok-4.7-xhigh-fast | cursor | grok-4.7 | xhigh | low medium high xhigh | - | on request |
| sol-6.1 | - | codex | gpt-6.1-sol | max | low medium high xhigh max | - | on request |

The allowed effort universe is exactly `low`, `medium`, `high`, `xhigh`, `max`. First-run requested efforts are the Default effort cell of each row. A Claude-native agent stem of `-` means the family has no Claude-native agent. Otherwise the shipped agent name is `pstack-<stem>-<effort>`.

A Setup probe cell of `required` means setup always asks for that family's effort and probes it. The three required families make up the default panel, in matrix order: Opus, Sol, Grok. `on request` marks an optional family: setup touches it only when the loaded or requested sheet names it, and no sheet has to carry a role for it. Upstream pstack 0.15.3 has no Fable seat, so its Upstream pstack choice cell is `-`; a sheet that names `claude:fable@<effort>` keeps its native Fable lane.

The `sol-6.1` family runs GPT-6.1 Sol through the same Codex route as `sol`. Codex CLI 0.160.0 lists `gpt-6.1-sol` in `codex debug models` with the efforts `low`, `medium`, `high`, `xhigh`, `max`, and `ultra`, and a ChatGPT login runs it with `--model gpt-6.1-sol` and `model_reasoning_effort` set to the requested effort. `ultra` adds automatic task delegation, which a lane must not do, so it stays outside the effort universe. Upstream pstack 0.15.5 has no GPT-6.1 Sol seat, so its Upstream pstack choice cell is `-`.

`fable` and `opus` are Claude Code's rolling aliases. Claude resolves each alias to the latest available family revision. A runner receipt keeps the requested alias in `model` and the concrete provider-reported revision in `reportedModel`; verification accepts only a numeric `claude-fable-*` or `claude-opus-*` revision from the matching family.

## Read-time normalization

Normalize configured descriptors before matching them to the matrix or choosing a route. If a provider-qualified Claude model starts with `claude-fable-` or `claude-opus-` and its remaining revision contains only digits and hyphens, replace that model component in memory with `fable` or `opus`. Preserve provider, effort, role, and lane order. Use only the normalized descriptor for native dispatch or runner argv. Never pass the versioned predecessor to Claude.

This read-time rule makes an older installed sheet use the latest family revision immediately without writing user files. Once per parent run, report that the persisted sheet is stale and that `/setup-pstack` will rewrite it after its normal probes and confirmation. Unknown versioned Claude models remain invalid. The external runner rejects a missed Fable or Opus version pin instead of silently executing it.

`fast` is part of Cursor's Grok selector, not a Grok Build CLI model or effort flag. The portable Grok route pins the current CLI model `grok-4.7`. The first-run Grok effort is `xhigh`.

The `cursor` family reaches the same Grok weights through a Cursor subscription instead of a SuperGrok plan. Cursor's selector is the whole model id: effort and `fast` are part of it, and there is no effort flag. The portable model name carries the speed tier, so this family has two model names. `cursor:grok-4.7@<effort>` maps to the standard id `grok-4.7-<effort>`, and `cursor:grok-4.7-fast@<effort>` maps to `grok-4.7-<effort>-fast`. Both are valid models for the row; its Model cell names the default. Standard is the default because Cursor bills its Fast ids at a higher token rate and a background lane gains nothing from that queue priority. The seat upstream pstack calls `grok-4.7-xhigh-fast` is spelled `cursor:grok-4.7-fast@xhigh` here. Cursor offers this family at `low`, `medium`, `high`, and `xhigh` only, so `cursor:grok-4.7@max` and `cursor:grok-4.7-fast@max` are `unavailable-model` dropouts, never a downgrade to `xhigh`. The runner still dispatches the previous generation, `cursor:grok-4.6@<effort>` and `cursor:grok-4.6-fast@<effort>`, so a sheet written before 0.15.3 keeps running until `/setup-pstack` rewrites it. The runner owns one table of the ids and the display name Cursor reports for each: Grok 4.6 ids carry a `cursor-` prefix (`cursor-grok-4.6-<effort>`), and Grok 4.7 ids do not (`grok-4.7-<effort>`, `grok-4.7-<effort>-fast`). Every standard id is a prefix of its fast twin, so the preflight matches the requested id as a whole listed token. Verification compares display names for equality after one normalization at that comparison: strip zero-width characters, collapse whitespace runs to one space, and trim. A Grok 4.7 row registers two names, because Cursor's stream reports either: `Grok 4.7 256K Extra High`, and the `cursor-agent models` listing form `Grok 4.7  Extra High`, with the `256K` slot blank. The listing also ends every Grok 4.7 Fast name with two U+200B characters. Normalization absorbs that padding and still compares every word, so neither form verifies a different effort, generation, or speed tier. A Cursor model id whose display name Cursor later renames fails the lane loudly.

## The parent owns the route

The top-level harness resolves the route once. A child receives an assigned provider, model, effort, access mode, prompt, working directory, and output path. A child never detects the harness, chooses a provider, or launches another model. Environment markers may corroborate the top-level harness before fan-out, but nested processes inherit parent markers and must not use them for routing.

| Parent | `claude:*` | `codex:*` | `grok:*` | `cursor:*` |
|---|---|---|---|---|
| Claude Code | native `Agent` | external runner | external runner | external runner |
| Codex | external runner | native `spawn_agent` | external runner | external runner |

`inherit-parent` and `auto` remain aliases. They use the parent's current model and effort through its native subagent primitive. In a panel they still consume one lane, but they reduce provider diversity; say so in the synthesis record.

## Native lanes

Native dispatch avoids a second CLI startup and its base context.

- Claude Code: match the descriptor's `(provider, model)` to one model-matrix row, then dispatch it through `pstack-<stem>-<effort>` using that row's Claude-native agent stem and the descriptor's effort. Those definitions select the rolling model alias, requested effort, and `background: true`. `pstack-fable-max` and `pstack-opus-xhigh` remain in that set. Pass the complete task, grounding paths, access mode, and unique output location in the `Agent` prompt. Retain the task handle and drain it only after fan-out.
- Codex: call `spawn_agent` with the descriptor's model and `reasoning_effort`, the complete task, grounding paths, access mode, and unique output location. Use an isolated worktree for a writer. Codex subagents already run concurrently.

Do not send a same-provider descriptor to the external runner. It rejects that call because the native route is cheaper and already available.

## External lanes

The launcher lives at `skills/poteto-mode/scripts/runner/pstack-runner` under the installed plugin. The parent writes the complete candidate prompt to a unique file, creates a unique output directory or worktree, and invokes the launcher directly. Do not put another agent in front of it.

```text
pstack-runner \
  --parent <claude|codex> \
  --provider <claude|codex|grok|cursor> \
  --model <real CLI model> \
  --effort <low|medium|high|xhigh|max> \
  --mode <read-only|isolated-write> \
  --prompt <unique prompt file> \
  --cwd <repository or dedicated worktree> \
  --output <unique final-response file> \
  --receipt <unique receipt file> \
  [--timeout <seconds>]
```

Pass arguments as an argv array or quote every path. Never interpolate prompt text into a shell command. The launcher preflights the assigned CLI and authentication, invokes the model exactly once, disables recursive agents and ambient skill dispatch where the CLI supports it, restricts the built-in tool surface, and records the exact provider/model/effort flags. External lanes do not receive the parent's MCP surface. A Codex lane starts with `--ignore-user-config` and `--disable apps`, so it also holds none of the MCP servers or app connectors of the Codex login. Keep MCP-dependent Why and Reflect roles on `inherit-parent` or `auto`. The launcher never falls back.

The Cursor CLI exposes no flag that turns off subagents, plugins, or rules, so a Cursor lane keeps whatever its account configures. It does get `--trust` for the assigned workspace and never `--approve-mcps`, so MCP servers stay unapproved. Its preflight is one `cursor-agent models` call, which proves the login and lists the exact model id the lane will request.

Grok authentication preflight has one bounded retry. If the first `grok models` result would be classified as unauthenticated, the runner waits five seconds and tries the same preflight once more. A second failure is terminal. The delay and second attempt share the runner's absolute deadline and cancellation latch, and the receipt keeps evidence from both attempts. Model execution is never retried.

The parent tool sandbox still governs whether a subscribed child CLI can reach its credentials and network. Run setup's live probe from the actual parent profile. A blocked external CLI is a loud dropout, not a reason to elevate permissions or substitute a model silently.

The parent invocation must itself be resumable background work:

- Claude Code: call the launcher through a Bash tool invocation with `run_in_background: true` and retain its task ID. A foreground Bash tool call has an automatic ten-minute ceiling even when the runner's own timeout is longer. Shelling out with `&` and losing the task handle is not equivalent.
- Codex: run the launcher in a persistent exec session that returns a session ID, then wait or poll that handle. Do not hold one foreground tool call open for the model's full runtime.

Start the background process, continue launching the other lanes, then drain their handles. Native and external lanes belong in the same fan-out phase.

The runner and its preflight have no implicit timeout. Do not invent a duration from role, mode, or a convenient round number; real implementation lanes can run for 90 minutes or much longer. Pass `--timeout` only when the user, an external service deadline, or a measured task contract supplies a real bound. That value starts at wrapper entry, before module loading and argument parsing, and remains one absolute deadline across setup, preflight, model execution, and output capture. It is never a fresh allowance per child, and long waits are armed in runtime-safe chunks without shortening the supplied deadline. Otherwise supervise liveness through the retained background task/session handle and cancel manually only on evidence that the run is dead. Cancel through that retained handle so the runner receives SIGINT or SIGTERM, sends it to an active child when one remains, stops waiting on inherited output pipes, removes the empty output reservation, and writes a `cancelled` receipt. Preserve that receipt; a retry is a new attempt with new unique output and receipt paths. Unchanged running state is not a dropout, and Claude's ten-minute foreground ceiling is never a reason to terminate a healthy lane.

Read-only mode maps to Claude plan mode with project-only settings and an explicit tool list, Codex's read-only sandbox, Grok plan mode plus its `read-only` sandbox and read-oriented tool list, and Cursor's `--mode plan` without `--force`. Grok's built-in read-only profile deliberately keeps its own state and system temporary directories writable, so point a read-only Grok lane at the actual checkout rather than a worktree under `/tmp`, `/var/tmp`, or the host's temporary directory. `isolated-write` maps to Claude `acceptEdits` with project-only settings, Codex `workspace-write`, Grok `acceptEdits` plus its `workspace` sandbox and write-capable tool list, and Cursor's default mode plus `--force`. Give every writer only a dedicated worktree or output directory. Never route a writer into the primary checkout.

Every concurrent external lane needs distinct prompt, output, and receipt paths. The launcher reserves output and receipt paths exclusively and refuses to overwrite them.

## Completion and dropouts

Success requires all of these:

1. Exit status `0`.
2. Receipt status `complete`.
3. Either `modelVerified: true` with `modelEvidence: "provider-report"`, or a Codex receipt with `reportedModel: null`, `modelVerified: false`, and `modelEvidence: "pinned-argv"`. For Claude's `fable` and `opus` aliases, the concrete provider report must belong to the requested family. Codex 0.149.0 accepts the exact `--model` argument but does not report the served model in its JSONL stream. Cursor reports the served model as a display name in its stream's first event; the receipt keeps that name as reported, and verification requires it to equal the registered display name for the requested model and effort after the whitespace and zero-width normalization above. Cursor has no `pinned-argv` escape.
4. A non-empty output file.

The receipt also carries elapsed time, token usage when the CLI exposes it, and cost when available. Keep it with the arena or review artifacts so parent-harness comparisons are evidence-based.

Any missing CLI, failed login, exhausted usage, rate limit, unavailable model, unreachable network, explicit timeout, cancellation, catchable post-reservation launcher failure, non-zero child exit, malformed result, or model mismatch is a receipt-bearing dropout. Record it, report the lane by its receipt status name, and apply the calling skill's existing dropout policy.

| Receipt status | Exit | Cause |
|---|---|---|
| `unavailable-cli` | 69 | The provider CLI is not on `PATH`. |
| `unauthenticated` | 77 | The CLI is signed out, its preflight failed, or the provider answered 401. |
| `usage-limited` | 69 | The account hit its usage limit or spend cap, ran out of credits or quota, or its plan does not include the CLI. |
| `rate-limited` | 75 | The provider still answered 429 after the CLI's own retries. |
| `unavailable-model` | 69 | The provider refused the model, or the model at the requested effort. |
| `unavailable-network` | 68 | The CLI could not reach the provider. |
| `timed-out` | 124 | The explicit `--timeout` deadline elapsed. |
| `cancelled` | 130 | The runner received SIGINT or SIGTERM. |
| `child-failed` | 70 | The child exited non-zero for any other reason. |
| `malformed-output` | 65 | The child exited zero without a verifiable result. |

The runner classifies a failed Codex lane from the message of Codex's `turn.failed` event, or its last `error` event, rather than from the whole stream, so text the model wrote earlier cannot decide the status. Other providers are classified from their combined output. The patterns come from Codex CLI 0.160.0. Signed out, an unknown model, an unsupported effort, and a refused connection were run live. The usage-limit and rate-limit messages come from the strings in the 0.160.0 binary, because neither can be triggered without spending the account's quota.

Codex never exits when it loses the network: after its retries it emits `Reconnecting... waiting for network` and waits. When that event arrives before Codex has emitted any item other than an `error` item, the model never started, so the runner stops the child with SIGTERM and writes `unavailable-network`. Once the model has produced an item, a later network wait belongs to Codex, which resumes when the network returns. This is Codex's own failure report, not an elapsed-time rule. A `cancelled` receipt proves that the runner received the signal; its `signal` field is non-null only when the runner sent that signal to a still-active direct CLI child, and remains null when cancellation only stopped a post-exit pipe drain. The provider CLI owns any processes it starts beneath that direct child; the receipt does not claim a process-tree kill. Do not delete or overwrite the receipt. Never substitute the parent model, retry another provider, or reinterpret an external descriptor as a native model slug.

Start native and external lanes in the same fan-out phase, then wait for all of them before judging. A judge must not read candidate paths while their owners are still writing.
