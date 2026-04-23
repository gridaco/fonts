#!/usr/bin/env bash
# Refresh all generated fonts data in-place.
#
# Usage:
#   ./tools/refresh.sh                 # full refresh (requires GOOGLE_FONTS_API_KEY)
#   ./tools/refresh.sh --skip-fetch    # use existing webfonts.json / webfonts-vf.json
#   ./tools/refresh.sh --skip-svg      # skip SVG preview generation (faster)
#   ./tools/refresh.sh --skip-stats    # skip popular stats refresh
#
# This script is the single source of truth for the refresh pipeline.
# GitHub Actions calls it verbatim, so verifying it locally == verifying CI.

set -euo pipefail

SKIP_FETCH=false
SKIP_SVG=false
SKIP_STATS=false
for arg in "$@"; do
  case "$arg" in
    --skip-fetch) SKIP_FETCH=true ;;
    --skip-svg)   SKIP_SVG=true ;;
    --skip-stats) SKIP_STATS=true ;;
    *) echo "unknown flag: $arg" >&2; exit 2 ;;
  esac
done

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

echo "==> refresh: running from $ROOT"

# -------- preflight --------
echo "==> preflight: checking vendor/google layout"
for d in vendor/google/apache vendor/google/ofl vendor/google/ufl; do
  if [ ! -d "$d" ]; then
    echo "FATAL: expected directory '$d' not found." >&2
    echo "       google/fonts upstream layout may have changed; aborting." >&2
    exit 10
  fi
done
metadata_pb_count=$(find vendor/google/apache vendor/google/ofl vendor/google/ufl \
  -maxdepth 2 -name METADATA.pb 2>/dev/null | wc -l | tr -d ' ')
if [ "$metadata_pb_count" -lt 1500 ]; then
  echo "FATAL: only $metadata_pb_count METADATA.pb files found (expected >=1500)." >&2
  echo "       vendor/google submodule may be corrupt or upstream restructured; aborting." >&2
  exit 11
fi
echo "    OK ($metadata_pb_count METADATA.pb files)"

# -------- fetch --------
if ! $SKIP_FETCH; then
  echo "==> fetch: webfonts.json + webfonts-vf.json"
  if [ -z "${GOOGLE_FONTS_API_KEY:-}" ]; then
    echo "FATAL: GOOGLE_FONTS_API_KEY is required (or pass --skip-fetch)." >&2
    exit 12
  fi
  python tools/fetch_webfonts.py
else
  echo "==> fetch: SKIPPED"
  if [ ! -s www/public/webfonts.json ]; then
    echo "FATAL: --skip-fetch but www/public/webfonts.json is missing/empty." >&2
    exit 13
  fi
fi

# -------- metadata pipeline --------
echo "==> metadata: pre-validate"
python metadata/cli.py pre-validate

echo "==> metadata: map"
python metadata/cli.py map

echo "==> metadata: polyfill"
python metadata/cli.py polyfill

echo "==> metadata: post-validate"
python metadata/cli.py post-validate

# -------- SVGs --------
if ! $SKIP_SVG; then
  echo "==> svg: generating previews (skipping existing)"
  python tools/fonts2svg.py
else
  echo "==> svg: SKIPPED"
fi

# -------- popular stats --------
if ! $SKIP_STATS; then
  echo "==> stats: refreshing www/app/api/popular/stats.json"
  # Stats come from an unofficial Google endpoint that may break without notice.
  # Failure here must not kill the weekly refresh — the lockfile flags staleness.
  if ! python tools/google_fonts_metadata_stats.py --output www/app/api/popular/stats.json; then
    echo "WARN: stats refresh failed; keeping previous stats.json" >&2
  fi
else
  echo "==> stats: SKIPPED"
fi

# -------- lockfile --------
echo "==> lockfile: building broken.lock.json"
python tools/build_lockfile.py

# -------- summary --------
echo ""
echo "==> done. review changes with: git status && git diff --stat"
