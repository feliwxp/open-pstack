# Upstream synchronization

This fork follows [ericlitman/open-pstack](https://github.com/ericlitman/open-pstack). Open-pstack follows Cursor's pstack. Take upstream content from open-pstack. When open-pstack lags Cursor, the fork also ports Cursor's skill changes directly, as the "Direct Cursor port" section below records (owner ruling 2026-10-11, agent-home `docs/DECISIONS.md`, "pstack and its ports").

## Fork sync point

| Source | Value |
| --- | --- |
| Repository | `https://github.com/ericlitman/open-pstack.git` |
| Branch | `main` |
| open-pstack commit | `1b03678171f6f400ae2cc9dc4e7a4a6a13e4bb43` |
| open-pstack release | `1.5.0` |
| open-pstack version | `1.5.0-fel.2` |

The release row names the followed version. The version row names this fork's package version. The commit row is labelled `open-pstack commit` so that it never reads as the Cursor `Commit` row in open-pstack's record below.

## Fork ledger

- **Cursor provider.** The runner, registry, tests, and dispatch documentation add an on-request Cursor lane. The fork keeps subscription routing and exact display-name verification. Remove this difference when open-pstack carries the same provider contract.
- **Named dropouts.** The runner, fixtures, tests, and dispatch documentation name usage, rate, and network failures. The fork keeps terminal-message classification and the network-wait stop rule. Remove this difference when open-pstack carries those statuses and that rule.
- **Codex MCP isolation.** Codex argv and its test disable user configuration and app connectors. The dispatch reference records the boundary. The fork keeps lanes free of the login's MCP tools. Remove this difference when open-pstack enforces the same boundary.
- **Owner's-sheet test.** The matrix test holds the owner's role names and family assignments. It rejects missing roles, unknown cited lines, and unresolved entries. It also rejects skill text that moves a configured entry to a default by its model-name prefix. The fork keeps this regression guard. Remove it when open-pstack covers that sheet contract.
- **Fork instructions.** `AGENTS.md` keeps the fork's review and live-evidence rules. The fork has no Mergify queue and no `live-gate` status. Remove this difference when the fork adopts open-pstack's review and gate workflow.
- **Pull request template.** `.github/pull_request_template.md` records installed-candidate live evidence in the pull request body. It keeps the fork's gate reviewable without a separate status. Remove this difference when the fork adopts open-pstack's gate publication workflow.
- **Release records.** The versioned manifests, README, reference page, changelog, and this file identify the fork release and its retained differences. They keep provenance and the merge procedure visible. Remove them when the fork ends or becomes identical to the followed release.
- **No open-pstack verifier.** The fork deletes `.claude/skills/verify-open-pstack` and its Codex link at `.agents/skills/verify-open-pstack`. That skill hard-codes `ericlitman/open-pstack`. It comments and sets `live-gate` on pull requests there from the operator's login. `tests/skill-collision-repro.sh` fails when either path returns. During a merge, keep both paths deleted. Remove this difference when the skill takes its repository from the checkout and the fork adopts open-pstack's gate publication workflow.
- **Cursor 0.15.6 through 0.15.17 skill port.** The fork ports Cursor commits `23e4138`, `9511e60`, `a586282`, `e43c7ee`, `4e5b1cf`, `00b52d9`, `807c031`, `1e56b29`, and `978ca6e` ahead of open-pstack: the `benchmark-checklist`, `correct`, `poteto-help`, `ketchup`, and `principle-explain-the-number` skills, the fresh-subagent rule, hourly `/loop 1h` audits, PR headings, schema-first validation, architect red flags, and performance mantras. The paths are the second group of the block below, which ends at `typescript-best-practices`. Remove this difference, and take open-pstack's text for those paths, when open-pstack's own `Commit` row records `978ca6e` or a later Cursor commit.
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
NOTICE.md
README-UPSTREAM.md
plugins/pstack/agents/poteto-agent.md
plugins/pstack/skills/architect/SKILL.md
plugins/pstack/skills/architect/references/design-red-flags.md
plugins/pstack/skills/benchmark-checklist/
plugins/pstack/skills/correct/
plugins/pstack/skills/ketchup/
plugins/pstack/skills/poteto-help/
plugins/pstack/skills/poteto-mode/SKILL.md
plugins/pstack/skills/poteto-mode/playbooks/autopilot-full.md
plugins/pstack/skills/poteto-mode/playbooks/autopilot-stack.md
plugins/pstack/skills/poteto-mode/playbooks/hillclimb.md
plugins/pstack/skills/poteto-mode/playbooks/multi-phase-plan.md
plugins/pstack/skills/poteto-mode/playbooks/opening-a-pr.md
plugins/pstack/skills/poteto-mode/playbooks/perf-issue.md
plugins/pstack/skills/poteto-mode/scripts/check-plan.mjs
plugins/pstack/skills/poteto-mode/scripts/check-plan.test.ts
plugins/pstack/skills/principle-explain-the-number/
plugins/pstack/skills/swarm/SKILL.md
plugins/pstack/skills/technical-writing/SKILL.md
plugins/pstack/skills/typescript-best-practices/references/patterns.md
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
- **No-substitute sentence in `how`, `why`, and `reflect`.** The fork drops its sentence that a descriptor which cannot run is a dropout, never a reason to switch models. `provider-dispatch.md` still states the rule, and the runner still enforces it.
- **Arena seat wording.** The fork drops its sentence that a configured arena entry which cannot run never moves its seat to another model. Open-pstack's text forbids a silent replacement with another provider. It does not name a second model from the same provider.
- **Codex failure with no failure event.** A failed Codex lane that emits no failure event and prints its reason only on stdout now ends `child-failed`. The fork classified that stdout text into a named status. Open-pstack classifies only stderr in that case.

## Direct Cursor port

| Source | Value |
| --- | --- |
| Repository | `https://github.com/cursor/plugins.git` |
| Path | `pstack/` |
| Cursor commit | `978ca6e9c0e012047cd5058b8e829240336e704e` |
| Cursor version | `0.15.17` (partial; see the skipped commits) |
| Fork version | `1.5.0-fel.2` |

agent-home's Monday `pstack upstream` watch flags open-pstack when its oldest unported Cursor pstack commit is more than 14 days old or it is more than 10 commits behind. The answer is a port here. The table's row is labelled `Cursor commit`, never `Commit`, so that it never reads as open-pstack's record below.

Ported in 1.5.0-fel.2, in Cursor order:

- `23e4138`, `9511e60`, `a586282`, `e43c7ee` (0.15.6 to 0.15.9). Re-applied from the fork's earlier port `c82ccf9` onto open-pstack 1.5.0's text. Open-pstack's exclusions still win: `bug-fix`, `perf-issue`, and `hillclimb` stay on `codex:gpt-6.1-sol@max`, and `poteto-agent` keeps its `skills` preload. In Autopilot-full step 5, open-pstack's landing-SHA flow through Shipping steps 3 and 5 stays in place of upstream's `git merge-tree` re-check.
- `4e5b1cf`, `00b52d9`, `807c031`, `1e56b29` (`poteto-help`). Adapted for Claude Code and Codex: the model sheet is `pstack-models.md` in the harness config home (`~/.claude/pstack-models.md` by default), installs and invocation use this fork's marketplace and the `pstack:` prefix, the Custom Mode and Cursor-only rows become the SessionStart hook, Codex, and Claude Code built-ins, the `make-bot-ui` row is dropped, and Cursor's guide pages are named as upstream-only. `references/prompting.md` and `references/recipes.md` are verbatim.
- `978ca6e` (`ketchup`, verbatim, and its `poteto-help` line).

Skipped, left for open-pstack's own port:

- `df58112` drops Sol and moves the default panels to Opus xhigh and Grok. It conflicts with the owner's sheet, which puts Sol in the code seats and on every panel, and with open-pstack's Sol exclusions. Its `poteto-help` wording change is not applied either.
- `00b14f1` distills about a dozen skill prompts, including `poteto-mode`, `arena`, `interrogate`, and `how`, which open-pstack adapts heavily. A local copy would conflict at the next open-pstack merge.
- `2cbf585` refreshes Cursor's `docs/guide/`, which open-pstack does not ship.

`README-UPSTREAM.md` holds Cursor's README at `e43c7ee`, as `c82ccf9` set it. Later README changes arrive with the skipped commits.

To port again: list `git log <Cursor commit above>..cursor/main -- pstack` with a `cursor` remote, port each commit in order onto the fork's current text, keep open-pstack's exclusions and the owner's seats, update this table, the ledger entry and its paths, `NOTICE.md`, `CHANGES.md`, and the fork version, then run the gates and the live evidence step under "Incorporate a change".

## Check for changes

Add the upstream remote once in a fresh clone.

```shell
git remote add upstream https://github.com/ericlitman/open-pstack.git
```

Fetch the followed branch and inspect commits after the recorded sync point.

```shell
git fetch upstream main
git log --oneline 1b03678171f6f400ae2cc9dc4e7a4a6a13e4bb43..upstream/main
```

Work is tracked in the fork's own GitHub Issues. Never push to or open a pull request against `ericlitman/open-pstack`.

## Incorporate a change

1. Create or update an issue in `feliwxp/open-pstack`. Branch from the fork's current `main`.
2. Fetch `upstream main` and read each change after the recorded commit.
3. Run `git merge upstream/main`. Take open-pstack's side for conflicts outside the ledger's paths. Inside those paths, use open-pstack's text as the base and graft only each retained difference.
4. Bump the fork to `<new open-pstack version>-fel.1`. Update the recorded commit and followed release. Update the ledger for the resulting diff. When open-pstack's new `Commit` row reaches the direct Cursor port's commit, drop the port: take open-pstack's text for its paths, remove its ledger entry and paths, and clear the Direct Cursor port section.
5. Run the local gates and `bash scripts/fork-ledger.sh`. Test the installed exact candidate from each affected harness's real user surface. Record the installed version, surface, action, and result in the pull request body.
6. Keep the pull request as a draft until that evidence exists. Land the upstream merge as a merge commit. Never squash it. A squash drops open-pstack's history, so the next merge would conflict again from the old base.

## Open-pstack's record

The sections below are open-pstack's own Cursor record. Preserve them during later merges.

## Current sync point

| Source | Value |
| --- | --- |
| Repository | `https://github.com/cursor/plugins.git` |
| Path | `pstack/` |
| Commit | `12d587dfb20741cafc376c42c696c5f6e2a64487` |
| Upstream version | `0.15.5` |
| open-pstack version | `1.5.0` |

The table above is the current Cursor sync point. Open Pstack 1.5.0 imports this 0.15.5 sync. `README-UPSTREAM.md` preserves the upstream pstack README verbatim. `CHANGES.md` and `NOTICE.md` describe the adaptations and provenance.

## Upstream-only exclusions

- Commits `799151d` and `6fecddb` add and relocate `make-bot-ui`. It depends on Cursor routines, webhook events, and UI primitives that Claude Code and Codex do not share.
- Four `disable-model-invocation: true` lines from `73f8be4` are not applied to `how`, `why`, `unslop`, or `typescript-best-practices`. Poteto-mode invokes those skills by name, and the flag blocks that route on Claude Code.
- The default-model hunks for `bug-fix`, `perf-issue`, and `hillclimb` from `23a56e2`, `889ec4b`, and `70b2dc8` are not applied. Those frequent code-writing roles stay on `codex:gpt-6.1-sol@max`.
- `5bf2b15`'s setup budget question, its `# budget` line, and its step down to a lower detected effort are not applied. Setup already asks one requested effort per assigned family, and the step-down would silently lower a requested effort.
- `12d587d`'s rule that reruns a rejected configured entry on its family default or the closest valid slug is not applied. An unavailable model stays a named dropout per `provider-dispatch.md`.
- The expected-runtime column in `70b2dc8`'s `children.tsv` and its expected-runtime stuck test are not applied. A lane is stuck only on affirmative failure evidence.
- The explicit Grok, Opus, and Sol defaults for the Why and Reflect roles are not applied. Those roles stay on `inherit-parent` because the external runner omits the parent's MCP servers.
- The Claude manifest does not take the logo field from `efa2a53` because Claude Code has no schema for it. The shared asset is exposed through the Codex manifest instead.

## Local port-patch ledger

- **#120 — harness config homes** (tracked for #105): Cursor's setup destination is `~/.cursor/rules/`. The shared port resolves nonempty `CLAUDE_CONFIG_DIR` / `CODEX_HOME`, otherwise `$HOME/.claude` / `$HOME/.codex`, once at `plugins/pstack/skills/poteto-mode/references/codex-tools.md#harness-config-homes`. `setup-pstack/SKILL.md` reuses that home for reads, sheet/integration writes, snapshots, restoration, and readback; Claude preserves the literal legacy import at the default home and renders exactly `@./pstack-models.md` for redirected homes, keeping spaces and `#` in the config-directory name out of the import line; reruns replace the one import whose target basename is `pstack-models.md`, append if absent, and stop if duplicated. Preserve this intentional divergence during upstream syncs. The named config-home invariant in `tests/skill-collision-repro.sh` rejects literal default destinations outside the legacy import, requires the literal default-home rendering and zero/one/many import rules, and verifies unset/empty/space-containing resolution without daily writes. See `CHANGES.md` for the port correction and `tests/setup-config-home-repro.sh` for redirected live-evidence preparation. The Cursor sync point is unchanged.
