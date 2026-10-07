#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
commit="$(sed -n 's/| open-pstack commit | `\([^`]*\)` |/\1/p' UPSTREAM.md)"
if ! git cat-file -e "$commit^{commit}" 2>/dev/null; then
  printf 'Missing followed commit %s. Run git fetch upstream main\n' "$commit" >&2
  exit 1
fi

scratch="$(mktemp -d)"
trap 'rm -rf "$scratch"' EXIT
awk '
  /^```fork-paths$/ { inside = 1; next }
  inside && /^```$/ { exit }
  inside && NF { print }
' UPSTREAM.md > "$scratch/ledger"
{
  git diff --name-only "$commit" HEAD
  git diff --name-only HEAD
  # The kick prompt is session state and never belongs to a candidate tree.
  git ls-files --others --exclude-standard --exclude='.local/'
} | sort -u > "$scratch/paths"

covers() {
  if [[ "$1" == */ ]]; then
    [[ "$2" == "$1"* ]]
  else
    [[ "$2" == "$1" ]]
  fi
}

fail=0
while IFS= read -r path; do
  covered=0
  while IFS= read -r entry; do
    if covers "$entry" "$path"; then covered=1; break; fi
  done < "$scratch/ledger"
  if [ "$covered" = 0 ]; then
    printf 'Unlisted differing path %s\n' "$path" >&2
    fail=1
  fi
done < "$scratch/paths"

while IFS= read -r entry; do
  used=0
  while IFS= read -r path; do
    if covers "$entry" "$path"; then used=1; break; fi
  done < "$scratch/paths"
  if [ "$used" = 0 ]; then
    printf 'Stale ledger entry %s\n' "$entry" >&2
    fail=1
  fi
done < "$scratch/ledger"

[ "$fail" = 0 ] || exit 1
printf 'ok: %s differing paths covered by %s ledger entries\n' \
  "$(wc -l < "$scratch/paths" | tr -d ' ')" \
  "$(wc -l < "$scratch/ledger" | tr -d ' ')"
