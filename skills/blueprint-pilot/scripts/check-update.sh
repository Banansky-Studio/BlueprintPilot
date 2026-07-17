#!/usr/bin/env bash
set -euo pipefail

CHECK_INTERVAL_DAYS="${BLUEPRINT_PILOT_UPDATE_INTERVAL_DAYS:-7}"
FORCE=0
REF="${BLUEPRINT_PILOT_REF:-main}"
VERSION_URL="${BLUEPRINT_PILOT_VERSION_URL:-https://raw.githubusercontent.com/Banansky-Studio/BlueprintPilot/refs/heads/main/skills/blueprint-pilot/VERSION}"
STATE_DIR="${CODEX_HOME:-$HOME/.codex}/state/blueprint-pilot"
CACHE_FILE="$STATE_DIR/update-check.json"

usage() {
  cat <<'EOF'
Usage:
  check-update.sh [--force] [--ref main] [--version-url URL]

Checks whether the installed BlueprintPilot Skill is behind the GitHub version.
The check is non-blocking by design: failures report UNKNOWN instead of breaking
normal BlueprintPilot use.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force)
      FORCE=1
      shift
      ;;
    --ref)
      REF="${2:-}"
      shift 2
      ;;
    --version-url)
      VERSION_URL="${2:-}"
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
local_version="$(cat "$skill_root/VERSION" 2>/dev/null || echo unknown)"
install_mode="direct-copy"
repo_root=""
remote_url=""

if repo_root="$(git -C "$skill_root" rev-parse --show-toplevel 2>/dev/null)"; then
  install_mode="managed-git"
  remote_url="$(git -C "$repo_root" config --get remote.origin.url || true)"
fi

mtime() {
  if stat -f %m "$1" >/dev/null 2>&1; then
    stat -f %m "$1"
  else
    stat -c %Y "$1"
  fi
}

now="$(date +%s)"
interval_seconds=$((CHECK_INTERVAL_DAYS * 24 * 60 * 60))
if [[ "$FORCE" -ne 1 && -f "$CACHE_FILE" ]]; then
  cache_age=$((now - $(mtime "$CACHE_FILE")))
  if [[ "$cache_age" -lt "$interval_seconds" ]]; then
    cat "$CACHE_FILE"
    exit 0
  fi
fi

github_raw_url() {
  local remote="$1"
  local ref="$2"
  local owner_repo=""

  case "$remote" in
    https://github.com/*/*.git)
      owner_repo="${remote#https://github.com/}"
      owner_repo="${owner_repo%.git}"
      ;;
    https://github.com/*/*)
      owner_repo="${remote#https://github.com/}"
      owner_repo="${owner_repo%.git}"
      ;;
    git@github.com:*.git)
      owner_repo="${remote#git@github.com:}"
      owner_repo="${owner_repo%.git}"
      ;;
    git@github.com:*)
      owner_repo="${remote#git@github.com:}"
      owner_repo="${owner_repo%.git}"
      ;;
  esac

  if [[ -n "$owner_repo" ]]; then
    printf 'https://raw.githubusercontent.com/%s/%s/skills/blueprint-pilot/VERSION\n' "$owner_repo" "$ref"
  fi
}

if [[ -z "$VERSION_URL" && -n "$remote_url" ]]; then
  VERSION_URL="$(github_raw_url "$remote_url" "$REF")"
fi

mkdir -p "$STATE_DIR"

if [[ -z "$VERSION_URL" ]]; then
  cat > "$CACHE_FILE" <<EOF
{
  "status": "UNKNOWN",
  "reason": "No GitHub version URL is available for this install.",
  "localVersion": "$local_version",
  "latestVersion": "unknown",
  "installMode": "$install_mode",
  "checkedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
  cat "$CACHE_FILE"
  exit 0
fi

latest_version="$(curl -fsSL "$VERSION_URL" 2>/dev/null | tr -d '[:space:]' || true)"
if [[ "$install_mode" == "managed-git" && -n "$repo_root" ]]; then
  if git -C "$repo_root" fetch --quiet origin "$REF" 2>/dev/null; then
    git_version="$(git -C "$repo_root" show "origin/$REF:skills/blueprint-pilot/VERSION" 2>/dev/null | tr -d '[:space:]' || true)"
    if [[ -n "$git_version" ]]; then
      latest_version="$git_version"
    fi
  fi
fi

if [[ -z "$latest_version" ]]; then
  cat > "$CACHE_FILE" <<EOF
{
  "status": "UNKNOWN",
  "reason": "Could not fetch remote BlueprintPilot version.",
  "localVersion": "$local_version",
  "latestVersion": "unknown",
  "installMode": "$install_mode",
  "versionUrl": "$VERSION_URL",
  "checkedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
  cat "$CACHE_FILE"
  exit 0
fi

version_rank() {
  local version="$1"
  local core
  core="${version%%-*}"

  if [[ "$core" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
    printf '%09d%09d%09d\n' "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}" "${BASH_REMATCH[3]}"
    return 0
  fi

  return 1
}

if [[ "$latest_version" == "$local_version" ]]; then
  status="UP_TO_DATE"
elif local_rank="$(version_rank "$local_version")" && latest_rank="$(version_rank "$latest_version")"; then
  if [[ "$latest_rank" > "$local_rank" ]]; then
    status="UPDATE_AVAILABLE"
  else
    status="UP_TO_DATE"
  fi
else
  status="UPDATE_AVAILABLE"
fi

cat > "$CACHE_FILE" <<EOF
{
  "status": "$status",
  "localVersion": "$local_version",
  "latestVersion": "$latest_version",
  "installMode": "$install_mode",
  "versionUrl": "$VERSION_URL",
  "updateCommand": "skills/blueprint-pilot/scripts/update-self.sh",
  "checkedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

cat "$CACHE_FILE"
