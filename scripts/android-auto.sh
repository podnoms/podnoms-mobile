#!/usr/bin/env bash
# Starts Google's Desktop Head Unit against the phone over wireless adb, for
# trying Android Auto. Pass a serial (e.g. emulator-5554) to use another device.
set -euo pipefail

dhu="${ANDROID_HOME:-/opt/android/sdk}/extras/google/auto/desktop-head-unit"
serial="${1:-}"

if [ -z "$serial" ]; then
  serial=$(adb devices | awk 'NR > 1 && $2 == "device" && $1 ~ /_adb-tls-connect/ { print $1; exit }')
fi
if [ -z "$serial" ]; then
  # adb usually connects to a paired phone by itself; when it hasn't, connect to
  # the address the phone is advertising, which needs no new pairing.
  address=$(adb mdns services | awk '$2 == "_adb-tls-connect._tcp" { print $3; exit }')
  if [ -z "$address" ]; then
    echo "No phone found: turn on Wireless debugging (pair it once from Android Studio if it's new)." >&2
    exit 1
  fi
  adb connect "$address" >/dev/null
  serial=$address
fi

if ! adb -s "$serial" shell 'ss -ltn 2>/dev/null | grep -q ":5277 "'; then
  echo "The head unit server isn't running: in Android Auto, open ⋮ → Start head unit server." >&2
  exit 1
fi

adb -s "$serial" forward tcp:5277 tcp:5277 >/dev/null
echo "Connecting the head unit to $serial…"
# The head unit prints a screenful of harmless ALSA warnings on Linux.
"$dhu" 2>&1 | grep --line-buffered -v '^ALSA lib'
