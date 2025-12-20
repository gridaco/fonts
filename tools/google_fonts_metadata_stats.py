#!/usr/bin/env python3
"""
Google Fonts Metadata Stats Parser

Fetches font statistics from Google Fonts metadata API and extracts relevant fields.

Source: https://fonts.google.com/metadata/stats
Note: This endpoint serves the same data as https://fonts.google.com/analytics
      This is a non-official API and may break at any time.

Purpose: This tool is for manually, periodically updating the "popular" data
         which will be served by our own API.

Usage:
    python google_fonts_metadata_stats.py [--format json|csv] [--output OUTPUT_FILE]
"""

import json
import csv
import sys
from typing import List, Dict, Any
import click

try:
    import requests
except ImportError:
    print("Error: requests not found. Please install it with: pip install requests")
    sys.exit(1)


URL = "https://fonts.google.com/metadata/stats"
# Google intentionally prefixes their JSON responses with ")]}'" as a security measure
# (XSSI/JSON hijacking protection). This prevents malicious websites from including
# the JSON in a <script> tag and executing it. We need to strip this prefix before parsing.
INVALID_PREFIX = ")]}'"


def fetch_data(url: str) -> str:
    """Fetch data from the URL."""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"Error fetching data from {url}: {e}", file=sys.stderr)
        sys.exit(1)


def clean_json_response(text: str) -> str:
    """Remove the invalid JSON prefix if present."""
    if text.startswith(INVALID_PREFIX):
        return text[len(INVALID_PREFIX) :].lstrip()
    return text


def parse_and_extract(data_text: str) -> List[Dict[str, Any]]:
    """Parse JSON and extract only relevant fields."""
    cleaned_text = clean_json_response(data_text)

    try:
        data = json.loads(cleaned_text)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}", file=sys.stderr)
        sys.exit(1)

    if not isinstance(data, list):
        print("Error: Expected JSON array", file=sys.stderr)
        sys.exit(1)

    extracted = []
    for item in data:
        if not isinstance(item, dict):
            continue

        # Extract relevant fields
        family = item.get("family", "")
        rate = item.get("rate", None)
        total_views = item.get("totalViews", None)

        # Extract year views and change from viewsByDateRange
        year_views = None
        year_change = None
        views_by_date_range = item.get("viewsByDateRange", {})
        if isinstance(views_by_date_range, dict):
            year_data = views_by_date_range.get("year", {})
            if isinstance(year_data, dict):
                year_views = year_data.get("views", None)
                year_change = year_data.get("change", None)

        extracted.append(
            {
                "family": family,
                "rate": rate,
                "total_views": total_views,
                "year_views": year_views,
                "year_change": year_change,
            }
        )

    return extracted


def output_json(data: List[Dict[str, Any]], output_file: str = None):
    """Output data as JSON."""
    if output_file:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Data written to {output_file}")
    else:
        print(json.dumps(data, indent=2, ensure_ascii=False))


def output_csv(data: List[Dict[str, Any]], output_file: str = None):
    """Output data as CSV."""
    if not data:
        print("No data to write", file=sys.stderr)
        return

    fieldnames = ["family", "rate", "total_views", "year_views", "year_change"]

    if output_file:
        with open(output_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        print(f"Data written to {output_file}")
    else:
        writer = csv.DictWriter(sys.stdout, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)


@click.command()
@click.option(
    "--format",
    "output_format",
    type=click.Choice(["json", "csv"], case_sensitive=False),
    default="json",
    help="Output format (default: json)",
)
@click.option(
    "--output",
    "output_file",
    type=click.Path(),
    default=None,
    help="Output file path (default: stdout)",
)
def main(output_format: str, output_file: str):
    """
    Fetch and parse Google Fonts metadata stats.

    Extracts only: family, rate, total_views, year_views, and year_change (from viewsByDateRange).
    """
    # Fetch data
    data_text = fetch_data(URL)

    # Parse and extract relevant fields
    extracted_data = parse_and_extract(data_text)

    # Output in requested format
    if output_format.lower() == "csv":
        output_csv(extracted_data, output_file)
    else:
        output_json(extracted_data, output_file)


if __name__ == "__main__":
    main()
