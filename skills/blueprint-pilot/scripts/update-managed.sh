#!/usr/bin/env bash
set -euo pipefail

REF=""

usage() {
  cat <<'EOF'
Usage:
  update-managed.sh [--ref main]

Deprecated compatibility wrapper. Prefer update-self.sh.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ref)
      REF="${2:-}"
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
exec "$script_dir/update-self.sh" ${REF:+--ref "$REF"}
