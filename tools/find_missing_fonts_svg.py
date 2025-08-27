import click
import json
import re
from pathlib import Path


def normalize_family_name(family_name: str) -> str:
    """
    Convert family name to font ID format:
    - Remove all spaces
    - Convert to lowercase
    """
    if not family_name:
        return ""

    # Remove all spaces and convert to lowercase
    normalized = re.sub(r'\s+', '', family_name.lower())
    return normalized


@click.command()
@click.argument('folder_path', type=click.Path(exists=True), default='./www/public/svg')
@click.argument('json_file', type=click.File('r'), default='./webfonts.json')
@click.option('--subset', help="Filter by specific subset. If not specified, shows all missing fonts.")
def find_missing_fonts(folder_path, json_file, subset):
    """
    This script takes a folder path that contains *.svg files and a JSON file,
    and outputs a list of missing font SVG files along with the count.

    Arguments:
    - folder_path: Path to the folder containing the *.svg files
    - json_file: Path to the JSON file with font data (Google Fonts API format)
    """

    # Load JSON data
    webfontlist = json.load(json_file)
    fonts_data = webfontlist.get('items', [])

    # Convert folder_path to a Path object and get the existing SVG files
    svg_folder = Path(folder_path)
    existing_svgs = {svg.stem for svg in svg_folder.glob("*.svg")}

    # Generate expected font IDs and check for missing ones
    missing_fonts = []

    for font_info in fonts_data:
        family = font_info['family']
        font_id = normalize_family_name(family)

        # Check if the subset is available (only if subset is specified)
        if subset and subset not in font_info.get("subsets", []):
            continue

        # Check if we have a usable variant
        variants = font_info.get('variants', [])
        files = font_info.get('files', {})
        selected_variant = 'regular' if 'regular' in variants else (
            variants[0] if variants else None)

        if selected_variant and selected_variant in files:
            if font_id not in existing_svgs:
                missing_fonts.append({
                    'font_id': font_id,
                    'family': family,
                    'variant': selected_variant,
                    'subsets': font_info.get('subsets', [])
                })

    if missing_fonts:
        click.echo("Missing Fonts:")
        for font in missing_fonts:
            subsets_str = ", ".join(font['subsets'])
            click.echo(
                f"{font['font_id']} ({font['family']}) - Variant: {font['variant']}, Subsets: {subsets_str}")
        click.echo(f"\nTotal Missing Fonts: {len(missing_fonts)}")
    else:
        click.echo("All fonts are present.")


if __name__ == '__main__':
    find_missing_fonts()
