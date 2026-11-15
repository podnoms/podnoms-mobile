#!/usr/bin/env bash
# Starts the Android release on GitHub Actions (.github/workflows/android-release.yml),
# which builds the .aab on our runner and sends it to Play's internal testing.
#
#   scripts/create-release.sh --patch   1.2.3 -> 1.2.4
#   scripts/create-release.sh --minor   1.2.3 -> 1.3.0
#   scripts/create-release.sh --major   1.2.3 -> 2.0.0
#   scripts/create-release.sh           release the current branch as it is
#
# With a flag it sets the new version in app.json and package.json, commits
# that, tags it v<version> and pushes both; the tag starts the workflow.
set -euo pipefail

workflow=android-release.yml
bump=

usage() {
  echo "Usage: $(basename "$0") [--major | --minor | --patch]" >&2
  exit 1
}

for arg in "$@"; do
  case "$arg" in
    --major | --minor | --patch)
      [ -z "$bump" ] || usage
      bump=${arg#--}
      ;;
    *) usage ;;
  esac
done

cd "$(dirname "$0")/.."

if ! command -v gh >/dev/null; then
  echo "This needs the GitHub CLI (gh)." >&2
  exit 1
fi

# The runner builds what's on GitHub, so anything not committed would be left out.
if [ -n "$(git status --porcelain)" ]; then
  echo "There are uncommitted changes: commit or stash them first." >&2
  exit 1
fi

branch=$(git symbolic-ref --short HEAD)
git fetch --quiet origin "$branch"

if [ -n "$bump" ]; then
  if [ -n "$(git rev-list HEAD..FETCH_HEAD)" ]; then
    echo "origin/$branch has commits this branch doesn't: pull first." >&2
    exit 1
  fi

  current=$(sed -n 's/^ *"version": "\([0-9]*\.[0-9]*\.[0-9]*\)",$/\1/p' app.json | head -n 1)
  if [ -z "$current" ]; then
    echo "Couldn't read the version from app.json." >&2
    exit 1
  fi
  IFS=. read -r major minor patch <<<"$current"
  case "$bump" in
    major) version="$((major + 1)).0.0" ;;
    minor) version="$major.$((minor + 1)).0" ;;
    patch) version="$major.$minor.$((patch + 1))" ;;
  esac
  tag="v$version"

  if git rev-parse -q --verify "refs/tags/$tag" >/dev/null ||
    [ -n "$(git ls-remote --tags origin "$tag")" ]; then
    echo "The tag $tag already exists." >&2
    exit 1
  fi

  read -r -p "Release $current -> $version from $branch? [y/N] " answer
  [[ "$answer" =~ ^[Yy]$ ]] || exit 1

  # Only the first "version" in each file: the app's own.
  sed -i "0,/\"version\": \"$current\"/s//\"version\": \"$version\"/" app.json package.json
  git commit --quiet -m "Release $tag" app.json package.json
  git tag "$tag"
  # Together, so the tag never goes up without its commit on the branch.
  git push --atomic origin "$branch" "$tag"
  echo "Pushed $tag."
else
  if [ "$(git rev-parse HEAD)" != "$(git rev-parse FETCH_HEAD)" ]; then
    echo "$branch isn't the same as origin/$branch: push (or pull) first." >&2
    exit 1
  fi
  gh workflow run "$workflow" --ref "$branch"
  echo "Started the release from $branch."
fi

# The run takes a few seconds to show up.
sleep 5
gh run list --workflow "$workflow" --limit 1 --json url --jq '.[0].url'
echo "Follow it with: gh run watch"
