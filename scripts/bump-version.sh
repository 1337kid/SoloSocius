#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# bump-version.sh — Bump the version across all package.json files and commit
#
# Usage:
#   ./scripts/bump-version.sh [major|minor|patch] [--dry-run] [--message "custom msg"]
#   ./scripts/bump-version.sh 1.2.3              [--dry-run] [--message "custom msg"]
#
# Examples:
#   ./scripts/bump-version.sh patch
#   ./scripts/bump-version.sh minor --message "release new profile feature"
#   ./scripts/bump-version.sh 2.0.0 --dry-run
# ---------------------------------------------------------------------------

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PACKAGE_FILES=(
  "package.json"
  "apps/backend/package.json"
  "apps/frontend/package.json"
)

usage() {
  echo "Usage: $0 [major|minor|patch|<version>] [--dry-run] [--message <msg>]"
  echo ""
  echo "  major          Bump the major version (1.2.3 to 2.0.0)"
  echo "  minor          Bump the minor version (1.2.3 to 1.3.0)"
  echo "  patch          Bump the patch version (1.2.3 to 1.2.4)"
  echo "  <version>      Set an explicit version (e.g. 2.0.0-beta.1)"
  echo ""
  echo "  --dry-run      Show what would change without writing or committing"
  echo "  --message      Override the default commit message"
  exit 1
}

bump_semver() {
  local current="$1"
  local bump_type="$2"

  IFS='.' read -r major minor patch <<< "${current%%[-+]*}"

  case "$bump_type" in
    major) major=$((major + 1)); minor=0; patch=0 ;;
    minor) minor=$((minor + 1)); patch=0 ;;
    patch) patch=$((patch + 1)) ;;
  esac

  echo "${major}.${minor}.${patch}"
}

is_valid_semver() {
  [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+([-.][a-zA-Z0-9.]+)?$ ]]
}


BUMP_TYPE=""
EXPLICIT_VERSION=""
DRY_RUN=false
CUSTOM_MESSAGE=""

if [[ $# -eq 0 ]]; then
  usage
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    major|minor|patch)
      BUMP_TYPE="$1"
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --message|-m)
      CUSTOM_MESSAGE="$2"
      shift 2
      ;;
    -*)
      echo "Unknown option: $1"
      usage
      ;;
    *)
      if is_valid_semver "$1"; then
        EXPLICIT_VERSION="$1"
      else
        echo "Error: '$1' is not a valid semver string or bump type."
        usage
      fi
      shift
      ;;
  esac
done

if [[ -z "$BUMP_TYPE" && -z "$EXPLICIT_VERSION" ]]; then
  usage
fi

ROOT_PKG="$ROOT_DIR/package.json"
CURRENT_VERSION="$(node -p "require('$ROOT_PKG').version")"

if [[ -n "$EXPLICIT_VERSION" ]]; then
  NEW_VERSION="$EXPLICIT_VERSION"
else
  NEW_VERSION="$(bump_semver "$CURRENT_VERSION" "$BUMP_TYPE")"
fi

echo "  Current version : $CURRENT_VERSION"
echo "  New version     : $NEW_VERSION"
echo ""

if [[ "$CURRENT_VERSION" == "$NEW_VERSION" ]]; then
  echo "Versions are identical — nothing to do."
  exit 0
fi

for rel_path in "${PACKAGE_FILES[@]}"; do
  abs_path="$ROOT_DIR/$rel_path"
  if [[ ! -f "$abs_path" ]]; then
    echo "  [skip] $rel_path (not found)"
    continue
  fi

  if $DRY_RUN; then
    echo "  [dry-run] would update $rel_path"
  else
    node --input-type=module <<EOF
import { readFileSync, writeFileSync } from 'fs';
const file = '$abs_path';
const pkg = JSON.parse(readFileSync(file, 'utf8'));
pkg.version = '$NEW_VERSION';
writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
console.log('  [updated] $rel_path');
EOF
  fi
done

if $DRY_RUN; then
  echo ""
  echo "  [dry-run] would run: git add ${PACKAGE_FILES[*]}"
  echo "  [dry-run] would run: git commit -m \"chore: bump version to $NEW_VERSION\""
  echo ""
  echo "Dry-run complete — no files changed."
  exit 0
fi

cd "$ROOT_DIR"

for rel_path in "${PACKAGE_FILES[@]}"; do
  [[ -f "$rel_path" ]] && git add "$rel_path"
done

COMMIT_MSG="${CUSTOM_MESSAGE:-"chore: bump version $CURRENT_VERSION to $NEW_VERSION"}"

git commit -m "$COMMIT_MSG"

echo ""
echo "Done. Version bumped to $NEW_VERSION and committed."
echo "Commit message: \"$COMMIT_MSG\""
