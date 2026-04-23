#!/usr/bin/env python3
"""Build broken.lock.json — a consolidated manifest of families that are
known-broken across the refresh pipeline's steps.

Reads:
  - www/public/webfonts.json            (Google Fonts API, source of truth for families)
  - www/public/webfonts.metadata.json   (output of metadata/cli.py map+polyfill)
  - metadata/invalid.csv                (pre-validate output)
  - failed_fonts.log                    (optional, fonts2svg failures)

Writes:
  - broken.lock.json                    (at repo root)

The lockfile is shipped alongside the data so humans can periodically review
which families are in a degraded state and investigate. Each refresh run
regenerates it from scratch — there is no history, just the current state.
"""

import csv
import json
import os
import subprocess
from datetime import datetime, timezone

import click

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEBFONTS_JSON = os.path.join(PROJECT_ROOT, 'www', 'public', 'webfonts.json')
METADATA_JSON = os.path.join(PROJECT_ROOT, 'www', 'public', 'webfonts.metadata.json')
INVALID_CSV = os.path.join(PROJECT_ROOT, 'metadata', 'invalid.csv')
FAILED_SVG_LOG = os.path.join(PROJECT_ROOT, 'failed_fonts.log')
DEFAULT_OUT = os.path.join(PROJECT_ROOT, 'broken.lock.json')


def load_webfonts_families() -> set:
    with open(WEBFONTS_JSON, 'r') as f:
        data = json.load(f)
    return {item['family'] for item in data.get('items', [])}


def load_metadata_families() -> set:
    if not os.path.exists(METADATA_JSON):
        return set()
    with open(METADATA_JSON, 'r') as f:
        data = json.load(f)
    return set(data.keys())


def load_invalid_csv() -> dict:
    """folder -> {family, reasons: [str]}"""
    result = {}
    if not os.path.exists(INVALID_CSV):
        return result
    with open(INVALID_CSV, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            folder = row.get('folder', '')
            family = row.get('font family name', '') or folder
            reasons = [r.strip() for r in row.get('reason(s)', '').split(';') if r.strip()]
            result[folder] = {'family': family, 'reasons': reasons}
    return result


def load_failed_svgs() -> dict:
    """family -> error string. fonts2svg writes a JSON array to failed_fonts.log."""
    if not os.path.exists(FAILED_SVG_LOG):
        return {}
    with open(FAILED_SVG_LOG, 'r') as f:
        content = f.read().strip()
    if not content:
        return {}
    data = json.loads(content)
    if not isinstance(data, list):
        raise RuntimeError(f"expected a JSON array in {FAILED_SVG_LOG}, got {type(data).__name__}")
    result = {}
    for entry in data:
        family = entry.get('family') or entry.get('font_id')
        if not family:
            continue
        result[family] = entry.get('error', 'unknown')
    return result


def get_submodule_sha() -> str:
    try:
        out = subprocess.check_output(
            ['git', '-C', os.path.join(PROJECT_ROOT, 'vendor', 'google'), 'rev-parse', 'HEAD'],
            stderr=subprocess.DEVNULL,
        ).decode().strip()
        return out
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ''


@click.command()
@click.option('--output', default=DEFAULT_OUT, help='Output lockfile path.')
def main(output: str):
    api_families = load_webfonts_families()
    metadata_families = load_metadata_families()
    invalid = load_invalid_csv()
    failed_svgs = load_failed_svgs()

    # Build broken entries keyed by family. A family may have multiple reasons.
    broken: dict = {}

    # 1. Families in the API but missing from our metadata output.
    missing_from_metadata = api_families - metadata_families
    for family in missing_from_metadata:
        broken.setdefault(family, {'family': family, 'reasons': [], 'sources': []})
        broken[family]['reasons'].append('missing_from_metadata')
        broken[family]['sources'].append('map')

    # 2. Families flagged during pre-validate (invalid.csv).
    # invalid.csv is keyed by folder, not family. Try to match family by name if present.
    for folder, info in invalid.items():
        family = info['family'] or folder
        entry = broken.setdefault(family, {'family': family, 'reasons': [], 'sources': []})
        entry.setdefault('folder', folder)
        for reason in info['reasons']:
            tag = f'pre_validate:{reason}'
            if tag not in entry['reasons']:
                entry['reasons'].append(tag)
        if 'pre-validate' not in entry['sources']:
            entry['sources'].append('pre-validate')

    # 3. Families whose SVG rendering failed.
    for family, err in failed_svgs.items():
        entry = broken.setdefault(family, {'family': family, 'reasons': [], 'sources': []})
        tag = f'svg_render_failed:{err}'
        if tag not in entry['reasons']:
            entry['reasons'].append(tag)
        if 'fonts2svg' not in entry['sources']:
            entry['sources'].append('fonts2svg')

    lockfile = {
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'vendor_google_sha': get_submodule_sha(),
        'counts': {
            'families_in_api': len(api_families),
            'families_in_metadata': len(metadata_families),
            'broken': len(broken),
            'missing_from_metadata': len(missing_from_metadata),
            'pre_validate_invalid': len(invalid),
            'svg_render_failed': len(failed_svgs),
        },
        'broken': sorted(broken.values(), key=lambda e: e['family']),
    }

    with open(output, 'w') as f:
        json.dump(lockfile, f, indent=2, ensure_ascii=False)

    click.echo(f"wrote {output}")
    click.echo(f"  families in API: {lockfile['counts']['families_in_api']}")
    click.echo(f"  families in metadata: {lockfile['counts']['families_in_metadata']}")
    click.echo(f"  broken: {lockfile['counts']['broken']}")


if __name__ == '__main__':
    main()
