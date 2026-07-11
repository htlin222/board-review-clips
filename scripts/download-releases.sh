#!/usr/bin/env bash
set -euo pipefail

# Download release assets from GitHub.
#
# Usage:
#   ./scripts/download-releases.sh [OPTIONS]
#
# Options:
#   -s, --short          Download short.mp4 only (default: all assets)
#   -c, --count N        Number of latest releases to fetch (default: 20)
#   -t, --time HOURS     Only releases published within the last N hours
#   -o, --outdir DIR     Output directory (default: downloads)
#   -h, --help           Show this help

ASSET_PATTERN=""
COUNT=20
TIME_HOURS=""
OUTDIR="out"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -s|--short)  ASSET_PATTERN="short.mp4"; shift ;;
    -c|--count)  COUNT="$2"; shift 2 ;;
    -t|--time)   TIME_HOURS="$2"; shift 2 ;;
    -o|--outdir) OUTDIR="$2"; shift 2 ;;
    -h|--help)
      sed -n '3,/^$/p' "$0"
      exit 0
      ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# Fetch releases (grab more than COUNT so time-filter has room)
FETCH_LIMIT=$((COUNT * 3))
[[ $FETCH_LIMIT -lt 100 ]] && FETCH_LIMIT=100

releases_json=$(gh release list --limit "$FETCH_LIMIT" --json tagName,publishedAt)

# Apply time filter if requested
if [[ -n "$TIME_HOURS" ]]; then
  if date -v-1H +%s &>/dev/null; then
    # macOS
    cutoff=$(date -v-"${TIME_HOURS}"H -u +%Y-%m-%dT%H:%M:%SZ)
  else
    # GNU/Linux
    cutoff=$(date -u -d "${TIME_HOURS} hours ago" +%Y-%m-%dT%H:%M:%SZ)
  fi
  releases_json=$(echo "$releases_json" | jq --arg cutoff "$cutoff" \
    '[.[] | select(.publishedAt >= $cutoff)]')
  total=$(echo "$releases_json" | jq 'length')
  echo "⏰ Filtering to releases within last ${TIME_HOURS}h (since $cutoff) — $total found"
fi

# Limit to COUNT
tags=$(echo "$releases_json" | jq -r ".[:${COUNT}][].tagName")

if [[ -z "$tags" ]]; then
  echo "No releases matched." >&2
  exit 0
fi

tag_count=$(echo "$tags" | wc -l | tr -d ' ')
asset_label="${ASSET_PATTERN:-all assets}"
echo "📥 Downloading ${asset_label} from ${tag_count} release(s) into ${OUTDIR}/"
echo ""

downloaded=0
failed=0

for tag in $tags; do
  # strip "card-" prefix to get slug
  slug="${tag#card-}"
  dir="${OUTDIR}/${slug}"
  mkdir -p "$dir"

  if [[ -n "$ASSET_PATTERN" ]]; then
    printf "  %-60s " "$slug/$ASSET_PATTERN"
    if gh release download "$tag" --pattern "$ASSET_PATTERN" --dir "$dir" --clobber 2>/dev/null; then
      echo "✅"
      downloaded=$((downloaded + 1))
    else
      echo "❌"
      failed=$((failed + 1))
    fi
  else
    printf "  %-60s " "$slug/*"
    if gh release download "$tag" --dir "$dir" --clobber 2>/dev/null; then
      echo "✅"
      downloaded=$((downloaded + 1))
    else
      echo "❌"
      failed=$((failed + 1))
    fi
  fi
done

echo ""
echo "Done: ${downloaded} succeeded, ${failed} failed."
