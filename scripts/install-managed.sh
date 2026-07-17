#!/usr/bin/env bash
set -euo pipefail

DEFAULT_REPO_URL="https://github.com/Banansky-Studio/BlueprintPilot.git"
REPO_URL="${BLUEPRINT_PILOT_REPO_URL:-$DEFAULT_REPO_URL}"
REF="${BLUEPRINT_PILOT_REF:-main}"
CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
SOURCE_DIR="$CODEX_HOME_DIR/skills-src/blueprint-pilot"
SKILL_LINK="$CODEX_HOME_DIR/skills/blueprint-pilot"
FORCE=0

usage() {
  cat <<'EOF'
Usage:
  install-managed.sh [--repo https://github.com/Banansky-Studio/BlueprintPilot.git] [--ref main] [--force]

Environment:
  BLUEPRINT_PILOT_REPO_URL  Git repository URL.
  BLUEPRINT_PILOT_REF       Branch or tag to install. Defaults to main.
  CODEX_HOME                Codex home directory. Defaults to ~/.codex.

Notes:
  - This creates a managed Git checkout at ~/.codex/skills-src/blueprint-pilot.
  - ~/.codex/skills/blueprint-pilot becomes a symlink to the installable Skill.
  - Existing non-symlink Skill installs are not overwritten unless --force is used.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      REPO_URL="${2:-}"
      shift 2
      ;;
    --ref)
      REF="${2:-}"
      shift 2
      ;;
    --source-dir)
      SOURCE_DIR="${2:-}"
      shift 2
      ;;
    --skill-dir)
      SKILL_LINK="${2:-}"
      shift 2
      ;;
    --force)
      FORCE=1
      shift
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

if [[ -z "$REPO_URL" ]]; then
  echo "Missing BlueprintPilot GitHub repository URL." >&2
  echo "Pass --repo https://github.com/Banansky-Studio/BlueprintPilot.git or set BLUEPRINT_PILOT_REPO_URL." >&2
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "git is required for managed installation." >&2
  exit 1
fi

mkdir -p "$(dirname "$SOURCE_DIR")" "$(dirname "$SKILL_LINK")"

if [[ -d "$SOURCE_DIR/.git" ]]; then
  if [[ -n "$(git -C "$SOURCE_DIR" status --porcelain)" ]]; then
    echo "Managed source has local changes: $SOURCE_DIR" >&2
    echo "Commit, stash, or remove them before updating." >&2
    exit 1
  fi
  git -C "$SOURCE_DIR" fetch --tags origin
  git -C "$SOURCE_DIR" checkout "$REF"
  if git -C "$SOURCE_DIR" rev-parse --verify --quiet "origin/$REF" >/dev/null; then
    git -C "$SOURCE_DIR" pull --ff-only origin "$REF"
  fi
else
  git clone "$REPO_URL" "$SOURCE_DIR"
  git -C "$SOURCE_DIR" checkout "$REF"
fi

SKILL_SOURCE="$SOURCE_DIR/skills/blueprint-pilot"
if [[ ! -f "$SKILL_SOURCE/SKILL.md" ]]; then
  echo "Installable Skill not found at: $SKILL_SOURCE" >&2
  exit 1
fi

if [[ -e "$SKILL_LINK" && ! -L "$SKILL_LINK" ]]; then
  if [[ "$FORCE" -ne 1 ]]; then
    echo "Existing non-managed Skill install found: $SKILL_LINK" >&2
    echo "Re-run with --force to move it aside and create a managed symlink." >&2
    exit 1
  fi
  BACKUP_PATH="${SKILL_LINK}.backup.$(date +%Y%m%d%H%M%S)"
  mv "$SKILL_LINK" "$BACKUP_PATH"
  echo "Backed up existing Skill install to: $BACKUP_PATH"
fi

ln -sfn "$SKILL_SOURCE" "$SKILL_LINK"

VERSION_FILE="$SKILL_SOURCE/VERSION"
VERSION="$(cat "$VERSION_FILE" 2>/dev/null || echo unknown)"

echo "BlueprintPilot managed install complete."
echo "Version: $VERSION"
echo "Source: $SOURCE_DIR"
echo "Skill: $SKILL_LINK -> $SKILL_SOURCE"
echo "It will be available to Codex on the next turn."
