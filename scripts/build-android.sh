#!/usr/bin/env bash
# Builds a production APK on this machine (eas.json's production-apk profile),
# signed with the upload key EAS holds, into dist/podnoms-v<version>.apk.
#
#   scripts/build-android.sh             build it
#   scripts/build-android.sh --install   and install it on the phone over adb
#
# It doesn't bump the version code, so it has the latest release's one: Android
# won't install it over a newer build. It's signed with the upload key, not
# Play's, so it won't install over the Play Store's copy either (or vice versa).
set -euo pipefail

install=0
for arg in "$@"; do
  case "$arg" in
    --install) install=1 ;;
    *)
      echo "Usage: $(basename "$0") [--install]" >&2
      exit 1
      ;;
  esac
done

cd "$(dirname "$0")/.."

if [ ! -f google-services.json ]; then
  echo "google-services.json is missing (see README.md, \"Releasing\")." >&2
  exit 1
fi

version=$(sed -n 's/^ *"version": "\([0-9]*\.[0-9]*\.[0-9]*\)",$/\1/p' app.json | head -n 1)
apk="dist/podnoms-v$version.apk"
mkdir -p dist

bunx eas-cli build --platform android --profile production-apk --local --non-interactive --output "$apk"
echo "Built $apk"

if [ "$install" = 1 ]; then
  adb install -r "$apk"
fi
