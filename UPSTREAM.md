# Upstream synchronization

This fork follows [ericlitman/open-pstack](https://github.com/ericlitman/open-pstack). Open-pstack follows Cursor's pstack. Take upstream content from open-pstack.

## Fork sync point

| Source | Value |
| --- | --- |
| Repository | `https://github.com/ericlitman/open-pstack.git` |
| Branch | `main` |
| open-pstack commit | `c5c8e237c324359a3d1929037da78fe66da3d1ed` |
| open-pstack release | `1.6.1` |
| open-pstack version | `1.6.1-fel.1` |

The release row names the followed version. The version row names this fork's package version. The commit row is labelled `open-pstack commit` so that it never reads as the Cursor `Commit` row in open-pstack's record below.

## Fork ledger

- **Cursor provider.** The runner, registry, tests, and dispatch documentation add an on-request Cursor lane. The fork keeps subscription routing and exact display-name verification. Remove this difference when open-pstack carries the same provider contract.
- **Named dropouts.** The runner, fixtures, tests, and dispatch documentation name usage, rate, and network failures. The fork keeps terminal-message classification, including a lost login that a Codex terminal event reports, and the network-wait stop rule. Remove this difference when open-pstack carries those statuses and that rule.
- **Codex MCP isolation.** Codex argv and its test disable user configuration and app connectors. The dispatch reference records the boundary. The fork keeps lanes free of the login's MCP tools. Remove this difference when open-pstack enforces the same boundary.
- **Owner's-sheet test.** The matrix test holds the owner's role names and family assignments. It rejects missing roles, unknown cited lines, and unresolved entries. It also rejects skill text that moves a configured entry to a default by its model-name prefix. The fork keeps this regression guard. Remove it when open-pstack covers that sheet contract.
- **Fork instructions.** `AGENTS.md` keeps the fork's review and live-evidence rules. The fork has no Mergify queue and no `live-gate` status. Remove this difference when the fork adopts open-pstack's review and gate workflow.
- **Pull request template.** `.github/pull_request_template.md` records installed-candidate live evidence in the pull request body. It keeps the fork's gate reviewable without a separate status. Remove this difference when the fork adopts open-pstack's gate publication workflow.
- **Release records.** The versioned manifests, README, reference page, changelog, and this file identify the fork release and its retained differences. They keep provenance and the merge procedure visible. Remove them when the fork ends or becomes identical to the followed release.
- **No open-pstack verifier.** The fork deletes `.claude/skills/verify-open-pstack` and its Codex link at `.agents/skills/verify-open-pstack`. That skill hard-codes `ericlitman/open-pstack`. It comments and sets `live-gate` on pull requests there from the operator's login. `tests/skill-collision-repro.sh` fails when either path returns. During a merge, keep both paths deleted. Remove this difference when the skill takes its repository from the checkout and the fork adopts open-pstack's gate publication workflow.
- **Ledger guard.** `scripts/fork-ledger.sh` checks the differing paths against the block below. The fork keeps it to catch accidental ports and stale entries. Remove it when the fork ends or open-pstack provides the same guard.

```fork-paths
.agents/skills/verify-open-pstack
.claude-plugin/marketplace.json
.claude/skills/verify-open-pstack/
.github/pull_request_template.md
AGENTS.md
CHANGES.md
README.md
UPSTREAM.md
docs/reference.md
plugins/pstack/.claude-plugin/plugin.json
plugins/pstack/.codex-plugin/plugin.json
plugins/pstack/skills/poteto-mode/references/codex-tools.md
plugins/pstack/skills/poteto-mode/references/provider-dispatch.md
plugins/pstack/skills/poteto-mode/scripts/runner/cli.test.ts
plugins/pstack/skills/poteto-mode/scripts/runner/cli.ts
plugins/pstack/skills/poteto-mode/scripts/runner/commands.test.ts
plugins/pstack/skills/poteto-mode/scripts/runner/commands.ts
plugins/pstack/skills/poteto-mode/scripts/runner/cursor-models.ts
plugins/pstack/skills/poteto-mode/scripts/runner/fixtures/codex-0.160.0/
plugins/pstack/skills/poteto-mode/scripts/runner/model-matrix.test.ts
plugins/pstack/skills/poteto-mode/scripts/runner/parse-output.test.ts
plugins/pstack/skills/poteto-mode/scripts/runner/parse-output.ts
plugins/pstack/skills/poteto-mode/scripts/runner/run.test.ts
plugins/pstack/skills/poteto-mode/scripts/runner/run.ts
plugins/pstack/skills/poteto-mode/scripts/runner/types.ts
plugins/pstack/skills/setup-pstack/SKILL.md
scripts/fork-ledger.sh
tests/skill-collision-repro.sh
```

## Dropped at 1.5.0-fel.1

- **Separate Sol family.** The fork drops its `sol-6.1` matrix row. Open-pstack's `sol` row already uses the same model and offers `ultra`. The owner loses no sheet resolution or model choice.
- **Cursor 0.15.3 and 0.15.5 ports.** The fork drops its copies of those ports. Open-pstack carries the same Cursor commits through its own port. Its defaults, setup flow, skill text, and exclusions win. The fork loses its setup budget question and other local choices where the ports differ.
- **Cursor 0.15.6 through 0.15.9 port.** The fork drops `benchmark-checklist`, `correct`, and `principle-explain-the-number`. It also drops that port's fresh-task rule, hourly audits, PR headings, design red flags, performance mantras, and related edits. Those features wait for open-pstack's port. The full port stays in git history at `c82ccf9`.
- **No-substitute sentence in `how`, `why`, and `reflect`.** The fork drops its sentence that a descriptor which cannot run is a dropout, never a reason to switch models. `provider-dispatch.md` still states the rule, and the runner still enforces it.
- **Arena seat wording.** The fork drops its sentence that a configured arena entry which cannot run never moves its seat to another model. Open-pstack's text forbids a silent replacement with another provider. It does not name a second model from the same provider.
- **Codex failure with no failure event.** A failed Codex lane that emits no failure event and prints its reason only on stdout now ends `child-failed`. The fork classified that stdout text into a named status. Open-pstack classifies only stderr in that case.

## Changed at 1.6.1-fel.1

- **Cursor 0.15.6 through 0.15.17.** Open-pstack 1.6.0 ports these versions. Its port replaces the one dropped above. The fork takes it unchanged, with open-pstack's exclusions.
- **Authentication from free text.** Open-pstack classifies `unauthenticated` only from the preflight probe. The fork takes that rule for stderr and combined output. It keeps `unauthenticated` for a Codex terminal failure event that reports `401 Unauthorized`. This exception belongs to the named-dropouts entry.
- **Grok environment.** Open-pstack passes Grok lanes an allowlisted environment. The fork drops its test that a Grok lane inherits an arbitrary variable.
- **Release script.** `scripts/release.py publish` writes to `ericlitman/open-pstack`. The fork takes the file unchanged and never runs `publish`.

## Check for changes

Add the upstream remote once in a fresh clone.

```shell
git remote add upstream https://github.com/ericlitman/open-pstack.git
```

Fetch the followed branch and inspect commits after the recorded sync point.

```shell
git fetch upstream main
git log --oneline c5c8e237c324359a3d1929037da78fe66da3d1ed..upstream/main
```

Work is tracked in the fork's own GitHub Issues. Never push to or open a pull request against `ericlitman/open-pstack`.

## Incorporate a change

1. Create or update an issue in `feliwxp/open-pstack`. Branch from the fork's current `main`.
2. Fetch `upstream main` and read each change after the recorded commit.
3. Run `git merge upstream/main`. Take open-pstack's side for conflicts outside the ledger's paths. Inside those paths, use open-pstack's text as the base and graft only each retained difference.
4. Bump the fork to `<new open-pstack version>-fel.1`. Update the recorded commit and followed release. Update the ledger for the resulting diff.
5. Run the local gates and `bash scripts/fork-ledger.sh`. Test the installed exact candidate from each affected harness's real user surface. Record the installed version, surface, action, and result in the pull request body.
6. Keep the pull request as a draft until that evidence exists. Land the upstream merge as a merge commit. Never squash it. A squash drops open-pstack's history, so the next merge would conflict again from the old base.

## Open-pstack's record

The sections below are open-pstack's own Cursor record. Preserve them during later merges.

## Current sync point

| Source | Value |
| --- | --- |
| Repository | `https://github.com/cursor/plugins.git` |
| Path | `pstack/` |
| Commit | `978ca6e9c0e012047cd5058b8e829240336e704e` |
| Upstream version | `0.15.17` |
| open-pstack version | `1.6.1` |

The table above is the current Cursor sync point. Open Pstack 1.6.0 imported this 0.15.17 sync, and 1.6.1 keeps it. `README-UPSTREAM.md` preserves the upstream pstack README verbatim. `CHANGES.md` and `NOTICE.md` describe the adaptations and provenance.

## Upstream-only exclusions

- Commits `799151d` and `6fecddb` add and relocate `make-bot-ui`. It depends on Cursor routines, webhook events, and UI primitives that Claude Code and Codex do not share.
- Four `disable-model-invocation: true` lines from `73f8be4` are not applied to `how`, `why`, `unslop`, or `typescript-best-practices`. Poteto-mode invokes those skills by name, and the flag blocks that route on Claude Code.
- The default-model hunks for `bug-fix`, `perf-issue`, and `hillclimb` from `23a56e2`, `889ec4b`, and `70b2dc8` are not applied. Those frequent code-writing roles stay on `codex:gpt-6.1-sol@max`.
- `5bf2b15`'s setup budget question, its `# budget` line, and its step down to a lower detected effort are not applied. Setup already asks one requested effort per assigned family, and the step-down would silently lower a requested effort.
- `12d587d`'s rule that reruns a rejected configured entry on its family default or the closest valid slug is not applied. An unavailable model stays a named dropout per `provider-dispatch.md`.
- The expected-runtime column in `70b2dc8`'s `children.tsv` and its expected-runtime stuck test are not applied. A lane is stuck only on affirmative failure evidence.
- The explicit Grok, Opus, and Sol defaults for the Why and Reflect roles are not applied. Those roles stay on `inherit-parent` because the external runner omits the parent's MCP servers.
- The Claude manifest does not take the logo field from `efa2a53` because Claude Code has no schema for it. The shared asset is exposed through the Codex manifest instead.
- Commit `df58112` (pstack 0.15.15) is not applied. It drops Sol from every default, cuts the panels to Opus and Grok, and moves Opus from `max` to `xhigh`. Open Pstack keeps its own model defaults and three-model panels.
- The `disable-model-invocation: true` lines that `23e4138` puts on `benchmark-checklist` and `principle-explain-the-number` are not applied. The same flag, which upstream carried on principle leaves and `figure-it-out` before 0.15.5, stays off as in earlier syncs. Principle leaves keep `user-invocable: false`, and `figure-it-out` and `benchmark-checklist` stay model-invocable because poteto-mode routes to them by name. The typed-only `correct`, `ketchup`, and `poteto-help` keep the flag.
- The Built-in PR tool paragraph from `23e4138` and `00b14f1` is not applied. It describes a Cursor run tool that Claude Code and Codex do not have.
- `00b14f1`'s shorter `principle-test-behavior-not-implementation` text is not applied. It fails every restated constant, table row, or prompt string and every absence-only assertion (`not.toHaveBeenCalled`, `toBeUndefined`, `toEqual([])`), and the 0.15.0 local correction keeps both kinds when they test a real contract. The poteto-mode index line for this principle takes `00b14f1`'s format change and keeps the 0.15.0 wording.
- The 40-line squash-body cutoff returns in `00b14f1` and stays omitted, as in the 0.15.0 sync.
- Autopilot-full step 5's rule from `23e4138` is not applied. That rule lets a green head with an unchanged patch ID merge without another rebase after trunk moves, when `git merge-tree` is clean and trunk touched none of the PR's paths or CI paths. Both checks pass when trunk removes an export that the PR's new code imports, so the combined tree merges without a build or test. Step 5 keeps sending a trunk move before the merge through the patch ID rule in `playbooks/shipping.md`.
- `correct` step 3 from `9511e60` says to fix or delete any test that would still pass if every function it calls returned nothing. The port sends that step to `principle-test-behavior-not-implementation`, which keeps negative-path tests whose correct result is an absence.

## Local port-patch ledger

- **#140 — Reflect transcript resolution**: Cursor's Reflect step 1 reads the `agent-transcripts/` directory its system prompt names; the port had substituted Claude Code's per-project directory, which left Codex without a lookup. The port replaces that step's body with one line that points to `plugins/pstack/skills/poteto-mode/references/codex-tools.md#active-transcripts`, and leaves the rest of `reflect/SKILL.md` unchanged. That mapping section holds the harness specifics: the Claude per-project scope, layouts, candidate and scan limits, opening-message verification, the Codex resolver call, and the 2,000-word digest fallback. The port-authored Bun resolver `plugins/pstack/skills/poteto-mode/scripts/resolve-codex-transcript.ts`, started through the `sh` launcher `resolve-codex-transcript` next to it so project Bun config and `.env` files cannot affect it, looks up the parent's known chat ID in Codex's read-only `threads` index, checks rollout scope and ownership, and prints opening-message metadata without transcript text. Preserve this divergence during upstream syncs: keep step 1 as the one-line pointer and keep the mapping section and resolver.
- **#120 — harness config homes** (tracked for #105): Cursor's setup destination is `~/.cursor/rules/`. The shared port resolves nonempty `CLAUDE_CONFIG_DIR` / `CODEX_HOME`, otherwise `$HOME/.claude` / `$HOME/.codex`, once at `plugins/pstack/skills/poteto-mode/references/codex-tools.md#harness-config-homes`. `setup-pstack/SKILL.md` reuses that home for reads, sheet/integration writes, snapshots, restoration, and readback; Claude preserves the literal legacy import at the default home and renders exactly `@./pstack-models.md` for redirected homes, keeping spaces and `#` in the config-directory name out of the import line; reruns replace the one import whose target basename is `pstack-models.md`, append if absent, and stop if duplicated. Preserve this intentional divergence during upstream syncs. The named config-home invariant in `tests/skill-collision-repro.sh` rejects literal default destinations outside the legacy import, requires the literal default-home rendering and zero/one/many import rules, and verifies unset/empty/space-containing resolution without daily writes. See `CHANGES.md` for the port correction and `tests/setup-config-home-repro.sh` for redirected live-evidence preparation. The Cursor sync point is unchanged.
