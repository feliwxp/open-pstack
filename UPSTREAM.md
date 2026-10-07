# Upstream synchronization

This fork follows [ericlitman/open-pstack](https://github.com/ericlitman/open-pstack). Open-pstack follows Cursor's pstack. Take upstream content from open-pstack.

## Fork sync point

| Source | Value |
| --- | --- |
| Repository | `https://github.com/ericlitman/open-pstack.git` |
| Branch | `main` |
| open-pstack commit | `1b03678171f6f400ae2cc9dc4e7a4a6a13e4bb43` |
| open-pstack release | `1.5.0` |
| open-pstack version | `1.5.0-fel.1` |

The release row names the followed version. The version row names this fork's package version. The commit row is labelled `open-pstack commit` so that it never reads as the Cursor `Commit` row in open-pstack's record below.

## Fork ledger

- **Cursor provider.** The runner, registry, tests, and dispatch documentation add an on-request Cursor lane. The fork keeps subscription routing and exact display-name verification. Remove this difference when open-pstack carries the same provider contract.
- **Named dropouts.** The runner, fixtures, tests, and dispatch documentation name usage, rate, and network failures. The fork keeps terminal-message classification and the network-wait stop rule. Remove this difference when open-pstack carries those statuses and that rule.
- **Codex MCP isolation.** Codex argv and its test disable user configuration and app connectors. The dispatch reference records the boundary. The fork keeps lanes free of the login's MCP tools. Remove this difference when open-pstack enforces the same boundary.
- **Owner's-sheet test.** The matrix test holds the owner's role names and family assignments. It rejects missing roles, unknown cited lines, and unresolved entries. The fork keeps this regression guard. Remove it when open-pstack covers that sheet contract.
- **Fork instructions.** `AGENTS.md` keeps the fork's review and live-evidence rules. The fork has no Mergify queue and no `live-gate` status. Remove this difference when the fork adopts open-pstack's review and gate workflow.
- **Pull request template.** `.github/pull_request_template.md` records installed-candidate live evidence in the pull request body. It keeps the fork's gate reviewable without a separate status. Remove this difference when the fork adopts open-pstack's gate publication workflow.
- **Release records.** The versioned manifests, README, reference page, changelog, and this file identify the fork release and its retained differences. They keep provenance and the merge procedure visible. Remove them when the fork ends or becomes identical to the followed release.
- **Ledger guard.** `scripts/fork-ledger.sh` checks the differing paths against the block below. The fork keeps it to catch accidental ports and stale entries. Remove it when the fork ends or open-pstack provides the same guard.

```fork-paths
.claude-plugin/marketplace.json
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
