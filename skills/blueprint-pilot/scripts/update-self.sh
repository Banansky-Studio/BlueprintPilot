#!/usr/bin/env bash
set -euo pipefail

REF="${BLUEPRINT_PILOT_REF:-main}"
REPO_ARCHIVE_URL="${BLUEPRINT_PILOT_ARCHIVE_URL:-https://github.com/Banansky-Studio/BlueprintPilot/archive/refs/heads/main.tar.gz}"

usage() {
  cat <<'EOF'
Usage:
  update-self.sh [--ref main]

Updates BlueprintPilot regardless of install mode:
  - managed Git install: fetches and fast-forwards the Git checkout
  - direct-copy install: downloads the GitHub archive and replaces the Skill folder

The current Skill folder is backed up before direct-copy replacement.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ref)
      REF="${2:-}"
      if [[ "$REF" != "main" ]]; then
        REPO_ARCHIVE_URL="https://github.com/Banansky-Studio/BlueprintPilot/archive/refs/tags/${REF}.tar.gz"
      fi
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skill_root="$(cd "$script_dir/.." && pwd)"

if repo_root="$(git -C "$skill_root" rev-parse --show-toplevel 2>/dev/null)"; then
  if [[ -n "$(git -C "$repo_root" status --porcelain)" ]]; then
    echo "BlueprintPilot managed source has local changes: $repo_root" >&2
    echo "Commit, stash, or discard them before updating." >&2
    exit 1
  fi

  git -C "$repo_root" fetch --tags origin
  git -C "$repo_root" checkout "$REF"

  if git -C "$repo_root" rev-parse --verify --quiet "origin/$REF" >/dev/null; then
    git -C "$repo_root" pull --ff-only origin "$REF"
  fi

  version="$(cat "$repo_root/skills/blueprint-pilot/VERSION" 2>/dev/null || echo unknown)"
  echo "BlueprintPilot update complete."
  echo "Mode: managed-git"
  echo "Version: $version"
  echo "Source: $repo_root"
  echo "It will be available to Codex on the next turn."
  exit 0
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required to update a direct-copy BlueprintPilot install." >&2
  exit 1
fi

if ! command -v tar >/dev/null 2>&1; then
  echo "tar is required to update a direct-copy BlueprintPilot install." >&2
  exit 1
fi

tmp_dir="$(mktemp -d)"
archive_path="$tmp_dir/blueprint-pilot.tar.gz"

cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

curl -fsSL "$REPO_ARCHIVE_URL" -o "$archive_path"
tar -xzf "$archive_path" -C "$tmp_dir"

new_skill_root="$(find "$tmp_dir" -type f -path '*/skills/blueprint-pilot/SKILL.md' -print -quit)"
if [[ -z "$new_skill_root" ]]; then
  echo "Downloaded archive does not contain skills/blueprint-pilot/SKILL.md." >&2
  exit 1
fi

new_skill_dir="$(cd "$(dirname "$new_skill_root")" && pwd)"
target_dir="$skill_root"
backup_dir="${target_dir}.backup.$(date +%Y%m%d%H%M%S)"

mkdir -p "$(dirname "$target_dir")"
mv "$target_dir" "$backup_dir"
mkdir -p "$target_dir"

if command -v rsync >/dev/null 2>&1; then
  rsync -a "$new_skill_dir/" "$target_dir/"
else
  cp -R "$new_skill_dir/." "$target_dir/"
fi

version="$(cat "$target_dir/VERSION" 2>/dev/null || echo unknown)"

echo "BlueprintPilot update complete."
echo "Mode: direct-copy"
echo "Version: $version"
echo "Skill: $target_dir"
echo "Backup: $backup_dir"
echo "It will be available to Codex on the next turn."
