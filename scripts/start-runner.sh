#!/usr/bin/env bash
# Starts the self-hosted GitHub Actions runner that builds the Android release
# (.github/workflows/android-release.yml), as the Docker container
# podnoms-android-runner (scripts/ci/github-runner/). It builds the image if it has
# changed and registers the runner with GitHub the first time.
#
#   scripts/start-runner.sh                start it (or update it)
#   scripts/start-runner.sh --reregister   register again, e.g. after removing
#                                          the runner on GitHub
#
# The runner's install, work folder and caches (Gradle, npm, bun) are kept in
# PODNOMS_RUNNER_DATA, so they outlive the container and the image.
set -euo pipefail

repo=podnoms/podnoms-mobile
# Beside the podnoms repos. /srv/dev is synced, so this folder is in its
# .stignore and .seafile-ignore.
data="${PODNOMS_RUNNER_DATA:-/srv/dev/podnoms/working/github-workers/podnoms-mobile}"
reregister=

for arg in "$@"; do
  case "$arg" in
    --reregister) reregister=1 ;;
    *)
      echo "Usage: $(basename "$0") [--reregister]" >&2
      exit 1
      ;;
  esac
done

cd "$(dirname "$0")/ci/github-runner"

# As this user: Docker would create them as root's.
mkdir -p "$data"/{runner,work,tmp,cache/{gradle,npm,bun}}

if [ -n "$reregister" ]; then
  docker compose down 2>/dev/null || true
  rm -f "$data"/runner/{.runner,.runner_migrated,.credentials,.credentials_rsaparams}
fi

export RUNNER_DATA="$data"
RUNNER_UID=$(id -u)
export RUNNER_UID

# Only the first start needs a token, and it's one that expires in an hour, so
# nothing long-lived is given to the container.
if [ ! -f "$data/runner/.runner" ]; then
  if ! REG_TOKEN=$(gh api -X POST "repos/$repo/actions/runners/registration-token" --jq .token); then
    echo "Couldn't get a registration token: gh has to be signed in as an admin of $repo." >&2
    exit 1
  fi
  export REG_TOKEN
fi

docker compose up -d --build

echo "Started podnoms-android-runner; its data is in $data."
echo "Logs: docker logs -f podnoms-android-runner"
