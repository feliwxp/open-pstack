# Upstream synchronization

This fork follows [ericlitman/open-pstack](https://github.com/ericlitman/open-pstack). Open-pstack follows Cursor's pstack. Take upstream content from open-pstack.

## Fork sync point

| Source | Value |
| --- | --- |
| Repository | `https://github.com/ericlitman/open-pstack.git` |
| Branch | `main` |
| open-pstack commit | `c0de3509c5f9c5cf24bcb5af13adf5f6e4ebf7c5` |
| open-pstack release | `1.21.0` |
| open-pstack version | `1.21.0-fel.1` |

The release row names the followed version. The version row names this fork's package version. The commit row is labelled `open-pstack commit` so that it never reads as the Cursor `Commit` row in open-pstack's record below.

## Fork ledger

- **Named dropouts.** `types.ts`, `registry/contract.ts`, `providers/shared.ts`, `providers/codex.ts`, `run.ts`, their tests, the Codex 0.160.0 fixtures, and the dispatch documentation name usage, rate, and network failures. The fork keeps terminal-message classification, including a lost login that a Codex terminal event reports, and the network-wait stop rule. Remove this difference when open-pstack carries those statuses and that rule.
- **Codex MCP isolation.** The Codex adapter's argv in `providers/codex.ts` and its test disable user configuration and app connectors. The dispatch reference records the boundary. The fork keeps lanes free of the login's MCP tools. Remove this difference when open-pstack enforces the same boundary.
- **Owner's-sheet test.** `runner/owner-sheet.test.ts` holds the owner's role names and family assignments. It rejects missing roles, unknown cited lines, and unresolved entries. It also rejects skill text that moves a configured entry to a default by its model-name prefix. It reads open-pstack's registry and leaves `registry.test.ts` unchanged. The fork keeps this regression guard. Remove it when open-pstack covers that sheet contract.
- **Fork instructions.** `AGENTS.md` keeps the fork's review and live-evidence rules. The fork has no Mergify queue and no `live-gate` status. Remove this difference when the fork adopts open-pstack's review and gate workflow.
- **Pull request template.** `.github/pull_request_template.md` records installed-candidate live evidence in the pull request body. It keeps the fork's gate reviewable without a separate status. Remove this difference when the fork adopts open-pstack's gate publication workflow.
- **Release records.** The versioned manifests, README, reference page, changelog, and this file identify the fork release and its retained differences. They keep provenance and the merge procedure visible. Remove them when the fork ends or becomes identical to the followed release.
- **No open-pstack verifier.** The fork deletes `.claude/skills/verify-open-pstack` and its Codex link at `.agents/skills/verify-open-pstack`. That skill hard-codes `ericlitman/open-pstack`. It comments and sets `live-gate` on pull requests there from the operator's login. `tests/skill-collision-repro.sh` fails when either path returns. During a merge, keep both paths deleted. Remove this difference when the skill takes its repository from the checkout and the fork adopts open-pstack's gate publication workflow.
- **Sol rolling name.** Per Fel (2026-11-18), the `sol` family's model is the rolling name `sol`, so a sheet entry reads `codex:sol@high`. Codex does not resolve an alias, so the runner does. At lane start it reads `codex debug models` and runs the highest `gpt-<version>-sol` slug that offers the requested effort, comparing versions as numbers. When the listing cannot be read or holds no Sol slug, it runs the pinned `gpt-6.2-sol` and prints a named `sol-fallback` line. That named fallback is the owner's explicit exception to the no-fallback rule in `AGENTS.md`. Pinned Sol slugs from `gpt-5.6-sol` to `gpt-6.2-sol` stay kept predecessors and run unchanged. The receipt records the slug that ran in `modelResolution`. The change lives in `registry/contract.ts`, `registry/models.ts`, `registry/render.ts`, `registry/rolling.ts`, `run.ts`, `types.ts`, `providers/codex.ts`, their tests, the Codex 0.170.0 listing fixture, the generated catalog, and the dispatch reference. Remove this difference when open-pstack resolves Sol to its newest model.
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
plugins/pstack/.grok-plugin/plugin.json
plugins/pstack/skills/poteto-mode/references/model-catalog.md
plugins/pstack/skills/poteto-mode/references/provider-dispatch.md
plugins/pstack/skills/poteto-mode/scripts/runner/fixtures/codex-0.160.0/
plugins/pstack/skills/poteto-mode/scripts/runner/fixtures/codex-0.170.0/
plugins/pstack/skills/poteto-mode/scripts/runner/owner-sheet.test.ts
plugins/pstack/skills/poteto-mode/scripts/runner/providers/codex.test.ts
plugins/pstack/skills/poteto-mode/scripts/runner/providers/codex.ts
plugins/pstack/skills/poteto-mode/scripts/runner/providers/shared.ts
plugins/pstack/skills/poteto-mode/scripts/runner/registry.test.ts
plugins/pstack/skills/poteto-mode/scripts/runner/registry/contract.ts
plugins/pstack/skills/poteto-mode/scripts/runner/registry/models.ts
plugins/pstack/skills/poteto-mode/scripts/runner/registry/render.ts
plugins/pstack/skills/poteto-mode/scripts/runner/registry/rolling.test.ts
plugins/pstack/skills/poteto-mode/scripts/runner/registry/rolling.ts
plugins/pstack/skills/poteto-mode/scripts/runner/run.test.ts
plugins/pstack/skills/poteto-mode/scripts/runner/run.ts
plugins/pstack/skills/poteto-mode/scripts/runner/types.ts
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

## Changed at 1.15.0-fel.1

- **Cursor provider dropped.** Open-pstack 1.15.0 ships its own read-only Cursor adapter, which proves the model by its pinned argv. The fork drops its Cursor provider, `cursor-models.ts`, its display-name registry, and Cursor writer lanes, and takes open-pstack's adapter unchanged. The owner's sheet seats no Cursor model, so no seat changes.
- **Runner rewrite.** Open-pstack replaced `commands.ts` and `parse-output.ts` with the `registry/` contract and one adapter per provider. The fork re-grafts named dropouts and Codex MCP isolation onto the Codex adapter and the shared run loop. The network-wait stop is a stdout watcher that the Codex adapter declares. The owner's-sheet test moves from `model-matrix.test.ts` to `owner-sheet.test.ts`.
- **Opus pin.** Open-pstack adds the exact `claude-opus-5-5` family and its `pstack-opus-5-5-*` agents. A sheet entry `claude:opus@<effort>` still follows the rolling alias. Only an entry that names `claude-opus-5-5` stays on Opus 5.5 when the alias moves.

## Changed at 1.16.0-fel.1

- **Owner's sheet moves Fable seats to Opus.** Per Fel (2026-10-21), every `claude:fable@high` entry in `runner/owner-sheet.test.ts` is now `claude:opus@high`: hardest tasks, arena runners, the arena cross-judge pool, architect runners and interrogate reviewers. No fork default or panel seats Fable. Open-pstack's Fable row and `pstack-fable-*` agents stay selectable and unchanged.
- **No-comments sweep.** Open-pstack 1.16.0 deletes code comments from the runner and tests. Where that sweep met a fork-retained hunk in `providers/codex.ts`, `providers/shared.ts` and `tests/skill-collision-repro.sh`, the fork keeps its code and drops the comments.
- **Verifier and sync steps.** Open-pstack 1.16.0 edits `.claude/skills/verify-open-pstack/` and its own check and incorporate steps. The fork keeps the verifier deleted and keeps its own steps above, as the ledger says. Open-pstack's new #232 record entry is kept below.

## Changed at 1.21.0-fel.1

- **Verifier stays deleted.** Open-pstack 1.17.0 to 1.21.0 edit `.claude/skills/verify-open-pstack/` and add its Grok and T3 Code live-gate cases (`features/grok.md`, `features/t3.md`, `scripts/grok.ts` and its test). The fork keeps the whole tree deleted, those cases included, as the ledger says. `tests/skill-collision-repro.sh` keeps the fork's absence check in place of open-pstack's verifier checks.
- **Grok manifest.** Open-pstack 1.21.0 adds `plugins/pstack/.grok-plugin/plugin.json`. It carries the fork version, and the static invariants compare it with the other three manifests.
- **Muse model failure.** Open-pstack 1.18.0 adds Muse Code's unknown-model text to `modelFailureStatus` in `types.ts`. The fork adds that pattern to its own `unavailable-model` test and keeps its usage, rate and network statuses.
- **Fork instructions.** `AGENTS.md` takes open-pstack's Grok and T3 Code harness sentences. It drops open-pstack's verifier, Mergify and release paragraphs, as the fork-instructions entry says.
- **Sol rolling name.** New fork difference, described in the ledger above. The owner's sheet in `owner-sheet.test.ts` now seats `codex:sol@high` wherever it seated `codex:gpt-6.1-sol@high`.
- **Operator prompts.** Open-pstack adds `.agents/babysit-pr.md`, `.agents/run-these.md`, `.agents/triage-backlog.md` and `.github/workflows/unfret-threads.yml`. They describe open-pstack's own live gate, Mergify queue and Unfret threads. The fork takes them unchanged, like `.mergify.yml` and `REVIEW.md`. No harness loads the prompts on its own, and the workflow's only job runs for an Unfret review, which the fork does not receive.

## Check for changes

Add the upstream remote once in a fresh clone.

```shell
git remote add upstream https://github.com/ericlitman/open-pstack.git
```

Fetch the followed branch and inspect commits after the recorded sync point.

```shell
git fetch upstream main
git log --oneline c0de3509c5f9c5cf24bcb5af13adf5f6e4ebf7c5..upstream/main
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
| Commit | `2776ddd2355d6d6c8747d3964600f28daf62f049` |
| Upstream version | `0.15.36` |
| open-pstack version | `1.21.0` |

The table above is the current Cursor sync point. Open Pstack 1.17.0 imported this 0.15.36 sync, and 1.18.0 to 1.21.0 keep it. `README-UPSTREAM.md` preserves the upstream pstack README verbatim. `CHANGES.md` and `NOTICE.md` describe the adaptations and provenance.

## Upstream-only exclusions

- Commits `799151d` and `6fecddb` add and relocate `make-bot-ui`, and `a968159` renames it after its folder. It depends on Cursor routines, webhook events, and UI primitives that Claude Code and Codex do not share. `a968159`'s other hunk names `poteto-mode` after its folder, which the port's `poteto-mode/SKILL.md` already does.
- Four `disable-model-invocation: true` lines from `73f8be4` are not applied to `how`, `why`, `unslop`, or `typescript-best-practices`. Poteto-mode invokes those skills by name, and the flag blocks that route on Claude Code.
- The default-model hunks for `bug-fix`, `perf-issue`, and `hillclimb` from `23a56e2`, `889ec4b`, and `70b2dc8` are not applied. Those frequent code-writing roles stay on `codex:gpt-6.1-sol@max`.
- `5bf2b15`'s setup budget question, its `# budget` line, and its step down to a lower detected effort are not applied. Setup already asks one requested effort per assigned family, and the step-down would silently lower a requested effort.
- `12d587d`'s rule that reruns a rejected configured entry on its family default or the closest valid slug is not applied, and neither is `ce649c0`'s rule that puts `cursor-grok-*` and `composer-*` entries in the Grok family for that fallback. An unavailable model stays a named dropout per `provider-dispatch.md`.
- The expected-runtime column in `70b2dc8`'s `children.tsv` and its expected-runtime stuck test are not applied, and neither are `ce649c0`'s stuck-after runtime and its rule that an owner with no push or trail row by the first tick is stuck. A lane is stuck only on affirmative failure evidence. An owner with no push or trail row at a tick is drift for that owner to record.
- The explicit Grok, Opus, and Sol defaults for the Why and Reflect roles are not applied. Those roles stay on `inherit-parent` because the external runner omits the parent's MCP servers.
- The Claude manifest does not take the logo field from `efa2a53` because Claude Code has no schema for it. The shared asset is exposed through the Codex manifest instead.
- Commit `df58112` (pstack 0.15.15) is not applied. It drops Sol from every default, cuts the panels to Opus and Grok, and moves Opus from `max` to `xhigh`. Open Pstack keeps its own model defaults and three-model panels.
- The `disable-model-invocation: true` lines that `23e4138` puts on `benchmark-checklist` and `principle-explain-the-number`, and that `ab1f702` puts back on `principle-explain-the-number`, are not applied. The same flag, which upstream carried on principle leaves and `figure-it-out` before 0.15.5, stays off as in earlier syncs. Principle leaves keep `user-invocable: false`, and `figure-it-out` and `benchmark-checklist` stay model-invocable because poteto-mode routes to them by name. The typed-only `correct`, `ketchup`, `ketchup-video`, `poteto-help`, `in-your-own-words`, `sharpen`, and `statechart` keep the flag.
- The Built-in PR tool paragraph from `23e4138` and `00b14f1` is not applied. It describes a Cursor run tool that Claude Code and Codex do not have.
- The 40-line squash-body cutoff returns in `00b14f1` and stays omitted, as in the 0.15.0 sync.
- Autopilot-full step 5's trunk-move rule from `23e4138`, and its revision in `ce649c0`, are not applied. The `23e4138` rule merged without another rebase when `git merge-tree` was clean and trunk touched none of the PR's paths or CI paths, and both checks pass when trunk removes an export that the PR's new code imports. `ce649c0` replaces those checks with the owner's judgment: merge when trunk's changes cannot affect the patch, and run the patch's checks on the merge result when trunk changed a caller or a dependency. An owner who misses a dependency still merges an untested tree. Step 5 keeps the rebase at merge prep and sends a trunk move before the merge through the patch ID rule in `playbooks/shipping.md`. `ce649c0`'s lockfile exception and its hold before a third rebase go with the rule.
- `poteto-agent.md` does not take `is_background: true` from `2bd5dd4`. Claude Code documents `background`, not `is_background`, in agent frontmatter, and Codex defines agents in TOML and maps concurrency at dispatch. The port keeps `general-purpose` in the description and the `skills: [pstack:poteto-mode]` preload.
- The root Agent Plugins v1 `pstack/plugin.json` from `e5a02f8` and its version bumps through 0.15.25 are not applied. The port keeps its current Claude manifest at `plugins/pstack/.claude-plugin/plugin.json` and Codex manifest at `plugins/pstack/.codex-plugin/plugin.json`. Agent Plugins v1 is revisited with #13.
- `unslop` takes `bc697d0`'s description without its `disable-model-invocation: true` line, as for `73f8be4` above.
- `pstack/.cursor-plugin/plugin.json` and `pstack/docs/guide/` are not imported. The Cursor manifest has no Claude Code or Codex consumer, and the guide shows Cursor's interface; `poteto-help` links to the guide upstream. That covers the 0.15.21 to 0.15.25 version bumps and `e5136d8`'s guide edit.
- Upstream's own Claude Code install is not applied. That covers `182f2ce`'s and `1b80080`'s generated tree under `harness/pstack/claude-code/`, `scripts/generate-pstack-harness-trees.mjs`, `scripts/validate-plugins.mjs`, the root `.claude-plugin/marketplace.json` entry, the adapter at `pstack/docs/harness/claude-code.md`, and `a968159`'s generator change. That install runs `grok-*` and `gpt-*` roles on the session's Claude model, has no Codex, and maps Cursor names at runtime from the adapter, which would be a second mapping layer on top of the port's own. `README-UPSTREAM.md` takes the README text from `182f2ce`, `1b80080` and `019a6a2` verbatim.
- `019a6a2`'s guide refresh and `scripts/check-pstack-docs.mjs` are not applied. The port does not import `pstack/docs/guide/`, so that check has nothing to compare. The same covers the guide edits in `7b353f7`, `f9be7aa` and `d457567`.
- The two harness paragraphs that `f9be7aa` puts in `poteto-help/SKILL.md`, which install upstream's Claude Code tree and describe other tools, are not applied. The port keeps its own paragraph on Claude Code and Codex.
- The 0.15.26 to 0.15.29 manifest bumps in `pstack/plugin.json` and `pstack/.cursor-plugin/plugin.json` from `0b8e952`, `0148b78` and `d457567` are not applied, as for the earlier bumps above.
- `create-formal-verification-skill` takes `4382e68` without its `disable-model-invocation: true` line, because setup's formal verification offer invokes it and the flag blocks that route on Claude Code. `tests/skill-collision-repro.sh` lists it in `routed_model_skills`. `maintain-formal-verification-skill` keeps the flag and runs only when typed.
- Setup's verification offers are steps 10 and 11 in the port, after its step 9 smoke test. The port never took upstream's step 7, "Offer a verification skill", which upstream has carried since 0.11.3. This sync restores it as step 10, and `f9be7aa`'s formal verification offer becomes step 11. Each keeps upstream's check for a project that already has one.
- `poteto-agent.md` does not take `b93e811`'s search of `~/.cursor/plugins/` for poteto-mode, its highest-version rule, or its note that the skill catalog hides poteto-mode. The Claude agent preloads `pstack:poteto-mode`, the port's poteto-mode is not hidden, and Codex has no `poteto-agent` type. The agent keeps upstream's "Use the absolute path your parent gave you."
- `ab1f702`'s `disable-model-invocation: true` on `interrogate` is not applied. Poteto-mode and the feature playbook route to it by name, and the flag blocks that route on Claude Code. A skill that needs a typed-only skill, such as `interrogate` with `in-your-own-words` or `create-formal-verification-skill` with `statechart` from `00d5dec`, reads that skill's `SKILL.md` and follows it.
- `ab1f702`'s fallback chains for a rejected model slug are not applied: the rule in poteto-mode's Match the model to the job that walks the calling skill's fallback and then the closest valid slug or the parent model, Arena step 3's family defaults and closest-slug rule, Swarm step 3's default and closest-slug rule, and the arena judge's same-model closest slug and default-pool retry. Neither is Arena step 3's rule that refills dropped runner seats on a remaining runner's model or the parent model. Each conflicts with the named-dropout rule in `provider-dispatch.md`. The arena judge keeps upstream's rule that it is never from the parent's provider, and when no configured entry runs, Arena skips the judge and says so.
- `c742dd6`'s Orchestrate takes these mappings: `Task` workers go through provider dispatch, cloud VMs become dedicated local worktrees, the Project tracker and Project store become `<config-home>/orchestrate/<project-slug>/notes.md`, PR and CI event subscriptions become `watch-pr` waits, and forking a worker becomes reusing its worktree. "Call no scripts" means no orchestration-store scripts; the provider launcher and `watch-pr` stay. Its retry on a different model after a tool error is not applied: that failure is a named dropout, and a worker is replaced only on affirmative failure evidence. `3c596e7`'s `orch` change is superseded by the deletion of `scripts/orch/`.
- Upstream's 0.15.30 to 0.15.36 manifest bumps in `pstack/plugin.json` and `pstack/.cursor-plugin/plugin.json` from `eb4db2b`, `642289e`, `b1a1298`, `7c7bde7`, `164ced1`, `ab1f702` and `c742dd6`, and the guide edits in `eb4db2b`, `3c0fdb4`, `34b1b7c`, `ab1f702` and `c742dd6`, are not applied, as for the earlier bumps and guide edits above. So are the matching updates to upstream's generated `harness/pstack/claude-code/` tree.

## Local port-patch ledger

- **#235 — Claude transcript folder encoding**: the port wrote Claude Code's per-project transcript path into `recall`, `automate-me` and the `session-pickup` playbook. Claude Code encodes each `/` and each `.` in the workspace path as `-`, so a `.claude/worktrees/` session's folder holds `--claude-worktrees-`. Keep both characters in those three lines during syncs.
- **#140 — Reflect transcript resolution**: Cursor's Reflect step 1 reads the `agent-transcripts/` directory its system prompt names; the port had substituted Claude Code's per-project directory, which left Codex without a lookup. The port replaces that step's body with one line that points to `plugins/pstack/skills/poteto-mode/references/codex-tools.md#active-transcripts`, and leaves the rest of `reflect/SKILL.md` unchanged. That mapping section holds the harness specifics: the Claude per-project scope, layouts, candidate and scan limits, opening-message verification, the Codex resolver call, and the 2,000-word digest fallback. The port-authored Bun resolver `plugins/pstack/skills/poteto-mode/scripts/resolve-codex-transcript.ts`, started through the `sh` launcher `resolve-codex-transcript` next to it so project Bun config and `.env` files cannot affect it, looks up the parent's known chat ID in Codex's read-only `threads` index, checks rollout scope and ownership, and prints opening-message metadata without transcript text. Preserve this divergence during upstream syncs: keep step 1 as the one-line pointer and keep the mapping section and resolver.
- **#120 — harness config homes** (tracked for #105): Cursor's setup destination is `~/.cursor/rules/`. The shared port resolves nonempty `CLAUDE_CONFIG_DIR` / `CODEX_HOME`, otherwise `$HOME/.claude` / `$HOME/.codex`, once at `plugins/pstack/skills/poteto-mode/references/codex-tools.md#harness-config-homes`. `setup-pstack/SKILL.md` reuses that home for reads, sheet/integration writes, snapshots, restoration, and readback; Claude preserves the literal legacy import at the default home and renders exactly `@./pstack-models.md` for redirected homes, keeping spaces and `#` in the config-directory name out of the import line; reruns replace the one import whose target basename is `pstack-models.md`, append if absent, and stop if duplicated. Preserve this intentional divergence during upstream syncs. The named config-home invariant in `tests/skill-collision-repro.sh` rejects literal default destinations outside the legacy import, requires the literal default-home rendering and zero/one/many import rules, and verifies unset/empty/space-containing resolution without daily writes. See `CHANGES.md` for the port correction and `tests/setup-config-home-repro.sh` for redirected live-evidence preparation. The Cursor sync point is unchanged.

- **#157 — role pointers**: Cursor names model descriptors in the Arena, Architect, How, Interrogate, and Swarm skills, the bug-fix, feature, hillclimb, perf-issue, and refactoring playbooks, poteto-mode's delegation defaults, and setup's probe table and first-run sheet. The port replaces each with a role pointer: the role's backticked sheet label and a link to `plugins/pstack/skills/poteto-mode/references/model-catalog.md#role-defaults`, which `registry/render.ts` generates from `plugins/pstack/skills/poteto-mode/scripts/runner/registry/models.ts`. Interrogate's reviewer table and setup's probe table and example sheet are deleted. When an upstream sync changes a model slug on one of these lines, keep the port's line and put the model change in `registry/models.ts`. `runner/registry.test.ts` enforces the rule: `ROLE_POINTERS` names each file's roles, and its text scan rejects any descriptor or versioned model name in `plugins/pstack/**/*.md`, `README.md`, and `docs/reference.md` outside the generated catalog and agents.

- **#46 — quiet setup reruns**: Upstream's setup has no keep-roles, per-family effort, or write-confirmation questions, so this is a port patch. `setup-pstack/SKILL.md` states one qualifying-rerun exception before step 2's keep-roles question. On a rerun whose sheet loaded with a valid writer sandbox line for each provider setup asks about, with no change named and no inconsistency or kept-predecessor proposal that needs a choice, setup validates in step 3, keeps and prints the roles and efforts instead of asking steps 2 and 4, and writes without step 7's confirmation when every step 5 probe passes. Steps 4, 7 and 8 and the offers in steps 10 and 11 each name the exception. It skips no validation, permission check, snapshot, readback, or the step 9 smoke test, and a failed probe still stops without writing. `poteto-help` says the same for reruns. Preserve this divergence during upstream syncs.

- **#191 — landing playbooks and per-spawn effort**: `ce649c0` cuts Shipping to six steps and both autopilots to principles. The port takes the cut's rules and reasons but keeps the landing procedure from 1.3.0: Shipping keeps steps 1 to 9, and Autopilot-full step 2 holds the guarded rebase and push. Since `ab1f702` made Autopilot-stack Autopilot-full without the merge, Autopilot-full step 2's stacked-owner paragraph also holds the fork, split-remote and parent-tip rules that Autopilot-stack step 2 held, and each owner restacks its own branch through them. Those steps disarm auto-merge and merge-queue entries before verification and before any rewrite, keep the verdict head and base apart from the landing head and base, resolve the base fetch remote apart from the head push URL, bind each push to a captured SHA, and merge only through a server-enforced expected head. The named landing invariants in `tests/skill-collision-repro.sh` check those rules by step and phrase, so a sync that moves them updates the invariants in the same change. `ce649c0`'s Match the model to the job rule is taken with port adaptations: the starting level is the role's configured effort, an unlisted effort moves to the nearest effort the catalog row lists, a configured `ultra` stays, and the fast and standard speed sentences are dropped because the port's descriptors carry no speed selector.

- **#232 — subagent waits in babysit**: Cursor's babysit step 6 runs `drive` and `background` under `/loop`. Claude Code subagents have no `ScheduleWakeup`, so `/loop` cannot run in them. The port adds one sentence after the `/loop` sentence that limits `/loop` to the main session and points a Claude Code subagent to `plugins/pstack/skills/poteto-mode/references/codex-tools.md#waits-on-claude-code`, which holds the wait rules. Preserve this sentence during upstream syncs.

- **#262 — interrogate adversaries**: `ab1f702` spawns each adversary as a Cursor subagent that keeps repros in its own worktree. The port routes each adversary's descriptor with `isolated-write` in a dedicated worktree that the parent prepares at the reviewed HEAD, with the scope's uncommitted tracked and untracked changes copied in, because Claude external writers cannot write the shared `.git`. A provider whose route has no `isolated-write` mode is a named dropout, the output lists each adversary or its dropout, and no completed adversary is reported as incomplete coverage. Keep the dispatch-contract paragraph and the `interrogate reviewers` role pointer. Setup counts `interrogate reviewers` among the roles whose lanes write files.

- **#262 — reflect skill copies**: `7054003` copies a skill out of the plugin cache to `.cursor/skills/` or `~/.cursor/skills/` before editing it. The port names the destinations per harness once, in `plugins/pstack/skills/poteto-mode/references/codex-tools.md#reflect-skill-copies`, and `reflect/SKILL.md` points there.

- **#262 — statechart types, no test corpus**: `statechart/scripts/test/` is not imported. It is 2.9 MB of upstream test data and TLC output, more than the review service's reviewers can read, and upstream's CI runs it. The root `bun run typecheck` checks statechart's scripts: `statechart/scripts/package.json` adds pinned `typescript` and `@types/node` and a `typecheck` script, with a `bun.lock`, and the port annotates `exitClass` in `run.ts` with its `0 | 1 | 2` return type, which upstream's code needs under strict checking. Keep these lines during syncs until upstream fixes the type, and keep `scripts/test/` out.

- **#263, #258 — writer sandbox lines and Muse**: upstream has no external runner, provider write modes or Muse provider. `provider-dispatch.md`'s Writer sandbox section and `setup-pstack/SKILL.md`'s `<provider> writer sandbox:` lines, opt-in question and writer-role check are port patches. Keep them, and the runner's `providers/muse.ts`, through syncs.

- **#265 — Orchestrate verifier and sub-coordinator**: keep upstream's "on a different model family" for each PR's verifier; do not substitute provider. After upstream's sub-coordinator sentence, the port adds that where a subagent cannot start agents, such as a Claude Code native lane, the coordinator starts the sub-coordinator's workers from the kickoffs it writes and hands their results back to it. `codex-tools.md#subagent-policy` states that native lanes disallow `Agent` and `Task`.

- **#253 — T3 Code parent**: Cursor has no T3 Code route. The port adds the `T3 host` section to `provider-dispatch.md`: a lane whose provider T3 offers and has enabled goes through `delegate_task`, and any other lane takes the standalone route of the Claude Code or Codex runtime. `codex-tools.md` points to it, and `setup-pstack/SKILL.md` routes its probes and smoke panel the same way at its existing steps. No other skill body changes. Keep these lines during syncs.

- **#281 — Grok parent**: Cursor has no Grok parent. Started from max-metaplanet's PR #282. The port adds `grok` to `PARENTS` with `explicitLaneRoute: "runner"`, so the generated route table has a Grok parent column and the runner accepts `--parent grok`, including a Grok provider. Claude and Codex keep `native` and stay native-only for their own provider. It adds `plugins/pstack/.grok-plugin/plugin.json` and the generated `grok-agents/` directory, a Grok column and a Waits on Grok section in `codex-tools.md`, the Grok rules in `provider-dispatch.md`, and the Grok sheet in `setup-pstack/SKILL.md` at its existing steps. Keep these lines during syncs.

