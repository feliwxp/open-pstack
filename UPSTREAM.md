# Upstream synchronization

open-pstack tracks [Cursor's pstack](https://github.com/cursor/plugins/tree/main/pstack) while adapting Cursor-specific primitives for Claude Code and Codex.

## Current sync point

| Source | Value |
| --- | --- |
| Repository | `https://github.com/cursor/plugins.git` |
| Path | `pstack/` |
| Commit | `e43c7ee26e0038c6c1fa8380dd34ce86ff94cb2a` |
| Upstream version | `0.15.9` |
| open-pstack version | `1.4.7-cursor.1` |

The table above is the current Cursor sync point. Open Pstack 1.4.6-cursor.1 imports the 0.15.6 through 0.15.9 changes. It retains the provider runner and dropout rules from the prior fork releases. Open Pstack 1.4.7-cursor.1 adds a runner fix on the same sync. `README-UPSTREAM.md` preserves the upstream pstack README verbatim. `CHANGES.md` and `NOTICE.md` describe the adaptations and provenance.

## Upstream-only exclusions

- Commits `799151d` and `6fecddb` add and relocate `make-bot-ui`. It depends on Cursor routines, webhook events, and UI primitives that Claude Code and Codex do not share.
- Four `disable-model-invocation: true` lines from `73f8be4` are not applied to `how`, `why`, `unslop`, or `typescript-best-practices`. Poteto-mode invokes those skills by name, and the flag blocks that route on Claude Code.
- The `70b2dc8` expected-runtime column in `children.tsv` and its elapsed-runtime stuck test are not applied. `AGENTS.md` forbids an implicit runtime timeout, so the port records each child's retained handle and treats only affirmative failure evidence as stuck.
- The Claude manifest does not take the logo field from `efa2a53` because Claude Code has no schema for it. The shared asset is exposed through the Codex manifest instead.
- The `12d587d` fallback that runs a rejected entry on its family's default, matched by `claude-`, `gpt-`, or `grok-` prefix, is not applied to `arena`, `architect`, `interrogate`, `how`, `why`, `reflect`, or `swarm`. `AGENTS.md` forbids a weaker-model fallback, and a provider-qualified entry such as `cursor:grok-4.7@xhigh` matches no prefix. An entry that cannot run stays a dropout under `provider-dispatch.md`.
- The `12d587d` role lines `why investigators`, `why synthesizer`, `reflect tooling`, and `reflect judgment, divergent, synthesizer` are not applied. The port keeps its combined `why investigators, synthesizer` and `reflect tooling, judgment, divergent, synthesizer` lines, because every one of those roles stays on the parent for MCP access. The skills name the combined lines exactly, and setup drops only the retired `how critics` row.
- The `23e4138` `disable-model-invocation: true` line on `principle-explain-the-number` is not applied. Principle leaves use `user-invocable: false` so other skills can read them by name.
- The `23e4138` `disable-model-invocation: true` line on `benchmark-checklist` is not applied. Poteto-mode invokes it by name, and the flag blocks that route on Claude Code.
- The `23e4138` expected-runtime stuck wording in the autopilot ticks is not applied. The fork retains handles and requires affirmative failure evidence. An hourly tick is an observation cadence, never a cancellation threshold.
- The `23e4138` changes under `docs/guide/` are not mirrored. The guide teaches Cursor UI and cloud agents and remains upstream-only.

## Check for changes

The repository already names Cursor's repository as the `cursor` remote in the maintainer checkout. A fresh clone can add it once:

```shell
git remote add cursor https://github.com/cursor/plugins.git
```

Fetch and inspect only commits that touched pstack after the recorded sync point:

```shell
git fetch cursor main
git log --oneline e43c7ee26e0038c6c1fa8380dd34ce86ff94cb2a..cursor/main -- pstack
git diff --stat e43c7ee26e0038c6c1fa8380dd34ce86ff94cb2a..cursor/main -- pstack
```

No output means the tracked pstack tree has not changed. This comparison does not need a polling service or generated mirror branch.

## Incorporate a change

1. Create or update a GitHub issue in `ericlitman/open-pstack` and branch from current `main`.
2. Read each upstream pstack commit in order. Bring over its intent and content, then apply only the Claude Code and Codex substitutions documented in `CHANGES.md`.
3. Keep one shared `plugins/pstack/skills/` tree. Put harness translation in the existing `codex-tools.md` and provider routing in `provider-dispatch.md`; do not fork a skill per harness.
4. Update the commit and version in this file, the affected provenance rows in `NOTICE.md`, and `README-UPSTREAM.md` when upstream changes it.
5. Run CI-equivalent checks locally, then run the installed Claude Code and Codex behavioral lanes required by the changed surface. Unit tests alone are not a release gate.
6. Merge the reviewed PR before tagging the next open-pstack release.

Cursor's version and open-pstack's version are independent. Cursor's version identifies the imported content; open-pstack's version identifies the cross-harness distribution.
