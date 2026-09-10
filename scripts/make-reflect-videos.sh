#!/usr/bin/env bash
# Regenerate pre-blurred, low-res reflection plates for the viewing hall floor.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIDEOS="$ROOT/public/videos"

for src in "$VIDEOS"/*.mp4; do
  base="$(basename "$src")"
  case "$base" in
    *_reflect.mp4) continue ;;
  esac
  out="$VIDEOS/${base%.mp4}_reflect.mp4"
  echo "Encoding $base -> $(basename "$out")"
  ffmpeg -y -i "$src" \
    -vf "scale=480:-2,gblur=sigma=12" \
    -an -c:v libx264 -pix_fmt yuv420p -crf 28 -preset medium -movflags +faststart \
    "$out"
done

echo "Done."
