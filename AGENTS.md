# open-pstack

Track all durable work in this repository's GitHub Issues. Do not create a parallel Linear queue. Read `UPSTREAM.md` before changing upstream-derived content.

This fork follows `ericlitman/open-pstack`, which ports Cursor's `cursor/plugins/pstack` tree. Take content from open-pstack, never from Cursor directly. A file that differs from open-pstack is listed in the `UPSTREAM.md` fork ledger, and `scripts/fork-ledger.sh` fails on one that is not. Never push to or open a pull request against `ericlitman/open-pstack`. Keep one shared skill tree for Claude Code and Codex; adapt harness primitives at the existing mapping boundaries instead of forking skills or adding compatibility layers. The parent harness resolves provider routing once. Children do not detect or reroute themselves.

Before opening a pull request, run the Bun tests, strict typecheck, static invariants, and plugin validation.

Nothing merges, tags, releases, or rolls out until the exact candidate is installed and the changed behavior passes a live test from the real user surface in every affected harness. Unit tests, validators, source inspection, and self-reports do not satisfy this gate. Record the installed version, surface, action, and observed result in the pull request template. A pull request without that evidence remains a draft.

Do not add an implicit runtime timeout or a weaker-model fallback.
