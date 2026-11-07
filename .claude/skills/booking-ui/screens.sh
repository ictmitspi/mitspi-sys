#!/bin/sh
# Screenshots of one page at phone, tablet and desktop width.
# Needs the dev server (npm run dev) and Google Chrome.
# Usage: sh .claude/skills/booking-ui/screens.sh [path] [out-dir]
# Example: sh .claude/skills/booking-ui/screens.sh / /tmp/shots

PAGE="${1:-/}"
OUT="${2:-${TMPDIR:-/tmp}/screens}"
mkdir -p "$OUT"

for SIZE in 360,800 768,1024 1280,800; do
  NAME="$OUT/$(echo "$SIZE" | cut -d, -f1).png"
  # First screen only: --full-page draws the sticky footer in the wrong place.
  npx -y playwright@1.63.0 screenshot --channel chrome \
    --viewport-size "$SIZE" --wait-for-timeout 1000 \
    "http://localhost:5173$PAGE" "$NAME" > /dev/null || exit 1
  echo "$NAME"
done
