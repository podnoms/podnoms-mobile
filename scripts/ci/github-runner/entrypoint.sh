#!/bin/bash
set -euo pipefail

cd "$RUNNER_HOME"

# The folder is a mount, empty the first time.
if [ ! -f run.sh ]; then
  echo "Copying the runner into its folder…"
  cp -a /home/runner/actions-runner-image/. .
fi

# Registered once: the registration lives in this folder, so restarts and new
# images need no token.
if [ ! -f .runner ]; then
  if [ -z "${REG_TOKEN:-}" ]; then
    echo "Not registered yet and no REG_TOKEN: start it with scripts/start-runner.sh." >&2
    exit 1
  fi
  ./config.sh \
    --url "https://github.com/$GITHUB_REPO" \
    --token "$REG_TOKEN" \
    --name "$RUNNER_NAME" \
    --labels "$RUNNER_LABELS" \
    --unattended \
    --replace
fi

# Jobs get the runner's environment, so don't leave the token in it.
unset REG_TOKEN
exec ./run.sh
