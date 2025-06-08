import json
import os
import csv
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import click

# Define project root (one level up from this file)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Define key paths
WEBFONTS_JSON = os.path.join(PROJECT_ROOT, 'webfonts.json')
FONTS = os.path.join(PROJECT_ROOT, 'fonts')
FONTS_OFL = os.path.join(PROJECT_ROOT, 'fonts', 'ofl')


def load_webfonts_data(webfonts_path: str) -> Dict[str, Dict]:
    """Load and index the webfonts.json data by family name."""
    with open(webfonts_path, 'r') as f:
        data = json.load(f)

    # Create a lookup table by family name
    return {item['family']: item for item in data['items']}


def parse_metadata_pb(metadata_path: str) -> List[Dict]:
    """Parse METADATA.pb file and extract font information."""
    fonts = []
    current_font = None

    with open(metadata_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line.startswith('fonts {'):
                if current_font:
                    fonts.append(current_font)
                current_font = {}
            elif line.startswith('}'):
                if current_font:
                    fonts.append(current_font)
                    current_font = None
            elif current_font is not None and ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip().strip('"')
                current_font[key] = value

    return fonts


def validate_font_mapping(font_dir: str, webfonts_data: Dict[str, Dict]) -> List[Tuple[str, str, str]]:
    """Validate font mapping between local files and Google Fonts API data."""
    issues = []
    metadata_path = os.path.join(font_dir, 'METADATA.pb')

    # Get family name from directory name as fallback
    family_name = os.path.basename(font_dir)

    if not os.path.exists(metadata_path):
        issues.append((family_name, 'ERROR', 'METADATA.pb not found'))
        return issues

    # Parse local metadata to get the family name
    local_fonts = parse_metadata_pb(metadata_path)
    if not local_fonts:
        issues.append(
            (family_name, 'ERROR', 'No font data found in METADATA.pb'))
        return issues

    # Get family name from METADATA.pb
    family_name = local_fonts[0].get('name')
    if not family_name:
        issues.append(
            (family_name, 'ERROR', 'Family name not found in METADATA.pb'))
        return issues

    # Create mapping of local filenames to their variants
    local_variants = {}
    for font in local_fonts:
        filename = font.get('filename')
        style = font.get('style', 'normal')
        weight = font.get('weight', '400')

        if filename:
            # Map weight to variant name
            if weight == '400':
                if style == 'normal':
                    variant = 'regular'
                else:  # italic
                    variant = 'italic'
            else:
                if style == 'normal':
                    variant = weight
                else:  # italic
                    variant = f"{weight}italic"

            local_variants[filename] = variant

            # Check if file exists locally
            local_path = os.path.join(font_dir, filename)
            if not os.path.exists(local_path):
                issues.append(
                    (family_name, 'ERROR', f'Local file not found: {filename}'))

    # Only check webfonts.json if we have valid local files
    if not issues:
        # Check if family exists in webfonts data
        if family_name not in webfonts_data:
            issues.append(
                (family_name, 'ERROR', f'Family not found in webfonts.json'))
            return issues

        # Get API data for this family
        api_fonts = webfonts_data[family_name]

        # Check if all local variants exist in API data
        for filename, variant in local_variants.items():
            if variant not in api_fonts['files']:
                issues.append(
                    (family_name, 'ERROR', f'Variant {variant} not found in API for {filename}'))

    return issues


@click.group()
def cli():
    """Google Fonts validation tools."""
    pass


@cli.command()
@click.option('--webfonts', default=WEBFONTS_JSON, help='Path to webfonts.json')
@click.option('--fonts-dir', default=FONTS_OFL, help='Path to fonts directory')
@click.option('--output', default='invalid.csv', help='Output CSV file name')
def pre_validate(webfonts: str, fonts_dir: str, output: str):
    """Pre-validate fonts against Google Fonts API data."""
    # Load webfonts data
    webfonts_data = load_webfonts_data(webfonts)

    # Process each font directory
    all_issues = []
    total_fonts = 0
    for font_dir in os.listdir(fonts_dir):
        full_path = os.path.join(fonts_dir, font_dir)
        if os.path.isdir(full_path):
            total_fonts += 1
            issues = validate_font_mapping(full_path, webfonts_data)
            # Store the full path with each issue
            all_issues.extend([(full_path, level, message)
                              for _, level, message in issues])

    # Calculate statistics
    invalid_fonts = len(
        set(os.path.basename(issue[0]) for issue in all_issues))
    success_fonts = total_fonts - invalid_fonts

    # Output invalid fonts to file
    if all_issues:
        print("\nValidation Issues Found:")
        invalid_path = os.path.join(os.path.dirname(__file__), output)

        # Group issues by font family
        font_issues = {}
        for path, level, message in all_issues:
            folder = os.path.basename(path)
            if folder not in font_issues:
                font_issues[folder] = {
                    'folder': folder,
                    'family': '',  # Initialize as empty string
                    'reasons': set()
                }
            font_issues[folder]['reasons'].add(message)

            # Try to get family name from METADATA.pb
            metadata_path = os.path.join(path, 'METADATA.pb')
            if os.path.exists(metadata_path):
                local_fonts = parse_metadata_pb(metadata_path)
                if local_fonts and 'name' in local_fonts[0]:
                    font_issues[folder]['family'] = local_fonts[0]['name']

        # Write to CSV
        with open(invalid_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['folder', 'font family name', 'reason(s)'])
            for folder, data in sorted(font_issues.items()):
                writer.writerow([
                    data['folder'],
                    # Will be empty string if METADATA.pb not found
                    data['family'],
                    '; '.join(sorted(data['reasons']))
                ])

        # Print issues to console
        for path, level, message in all_issues:
            rel_path = Path(path).relative_to(PROJECT_ROOT)
            print(f"[{level}] {rel_path}: {message}")

        # Print final message about invalid.csv
        rel_invalid_path = Path(invalid_path).relative_to(os.getcwd())
        print(f"\n{invalid_fonts} invalid fonts reported at {rel_invalid_path}")
    else:
        print("\nAll fonts validated successfully!")

    # Print summary
    print("\nValidation Summary:")
    print(f"Total fonts: {total_fonts}")
    print(f"Successfully validated: {success_fonts}")
    print(f"Invalid fonts: {invalid_fonts}")


if __name__ == '__main__':
    cli()
