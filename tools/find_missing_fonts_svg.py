import click
import json
from pathlib import Path


@click.command()
@click.argument('folder_path', type=click.Path(exists=True))
@click.argument('json_file', type=click.File('r'))
def find_missing_fonts(folder_path, json_file):
    """
    This script takes a folder path that contains *.svg files and a JSON file,
    and outputs a list of missing font SVG files along with the count.

    Arguments:
    - folder_path: Path to the folder containing the *.svg files
    - json_file: Path to the JSON file with font data
    """

    # Load JSON data
    font_data = json.load(json_file)

    # Convert folder_path to a Path object and get the existing SVG files
    svg_folder = Path(folder_path)
    existing_svgs = {svg.stem for svg in svg_folder.glob("*.svg")}

    # Find missing fonts based on JSON keys
    missing_fonts = [font_id for font_id in font_data.keys()
                     if font_id not in existing_svgs]

    if missing_fonts:
        click.echo("Missing Fonts:")
        for font in missing_fonts:
            click.echo(font)
        click.echo(f"\nTotal Missing Fonts: {len(missing_fonts)}")
    else:
        click.echo("All fonts are present.")


if __name__ == '__main__':
    find_missing_fonts()
