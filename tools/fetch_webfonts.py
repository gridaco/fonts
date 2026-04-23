#!/usr/bin/env python3
"""Fetch webfonts.json and webfonts-vf.json from the Google Fonts Developer API.

Requires a Google Fonts API key. Supply via --api-key or GOOGLE_FONTS_API_KEY env var.

Refuses to overwrite the output file if the API returns fewer than MIN_ITEMS items
(sanity gate against a bad/empty response wiping the committed data).
"""

import json
import os
import sys

import click
import requests

API = "https://www.googleapis.com/webfonts/v1/webfonts"
MIN_ITEMS = 1500
DEFAULT_OUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "www",
    "public",
)


def fetch(params: dict) -> dict:
    r = requests.get(API, params=params, timeout=60)
    r.raise_for_status()
    data = r.json()
    items = data.get("items")
    if not isinstance(items, list):
        raise RuntimeError(f"unexpected response shape (no items array): {str(data)[:200]}")
    if len(items) < MIN_ITEMS:
        raise RuntimeError(
            f"too few items ({len(items)} < {MIN_ITEMS}); refusing to use this response"
        )
    # Shape assertion on a sample item.
    sample = items[0]
    for key in ("family", "variants", "files", "subsets"):
        if key not in sample:
            raise RuntimeError(f"sample item missing required key '{key}': {sample}")
    return data


@click.command()
@click.option("--api-key", envvar="GOOGLE_FONTS_API_KEY", required=True,
              help="Google Fonts Developer API key. Defaults to $GOOGLE_FONTS_API_KEY.")
@click.option("--out-dir", default=DEFAULT_OUT_DIR, type=click.Path(file_okay=False),
              help="Directory to write webfonts.json and webfonts-vf.json into.")
@click.option("--sort", default="popularity", help="API sort parameter.")
def main(api_key: str, out_dir: str, sort: str):
    os.makedirs(out_dir, exist_ok=True)

    targets = [
        ("webfonts.json", {"key": api_key, "sort": sort}),
        ("webfonts-vf.json", {"key": api_key, "sort": sort, "capability": "VF"}),
    ]

    for filename, params in targets:
        click.echo(f"Fetching {filename} ...", err=True)
        try:
            data = fetch(params)
        except Exception as e:
            click.echo(f"ERROR fetching {filename}: {e}", err=True)
            sys.exit(1)

        path = os.path.join(out_dir, filename)
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        click.echo(f"  wrote {path} ({len(data['items'])} items)", err=True)


if __name__ == "__main__":
    main()
