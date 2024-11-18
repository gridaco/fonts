import requests
import json
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
import svgwrite
import io
import os
import click
from tqdm import tqdm
from scour import scour
import re


def load_font_from_url(url):
    response = requests.get(url)
    response.raise_for_status()
    return io.BytesIO(response.content)


def get_kerning(font, left_glyph, right_glyph):
    if 'kern' in font:
        kern_table = font['kern'].kernTables[0]
        if hasattr(kern_table, 'kernTable'):
            return kern_table.kernTable.get((left_glyph, right_glyph), 0)
        elif hasattr(kern_table, 'kerning'):
            return kern_table.kerning.get((left_glyph, right_glyph), 0)
    return 0


def text_to_svg_path(text, font_url, output_path, font_size=14):  # Default font size to 14
    font_file = load_font_from_url(font_url)
    font = TTFont(font_file)
    glyph_set = font.getGlyphSet()

    # Calculate scale for specified font size
    scale = font_size / font['head'].unitsPerEm
    x_position = 0
    # Calculate max height based on font's ascent
    max_height = font['hhea'].ascent * scale

    text_group = svgwrite.container.Group()
    previous_glyph_name = None

    for char in text:
        cmap = font.getBestCmap()
        char_code = ord(char)
        if char_code not in cmap:
            print(f"Character '{char}' not found in font.")
            continue

        glyph_name = cmap[char_code]
        glyph = glyph_set[glyph_name]

        advance_width, _ = font['hmtx'][glyph_name]

        if previous_glyph_name is not None:
            kerning = get_kerning(font, previous_glyph_name, glyph_name)
        else:
            kerning = 0

        pen = SVGPathPen(glyph_set)
        glyph.draw(pen)
        path_data = pen.getCommands()

        if path_data:
            path = svgwrite.path.Path(
                d=path_data,
                transform=f"translate({x_position + kerning * scale}, {max_height}) scale({scale}, {-scale})")
            text_group.add(path)

        x_position += (advance_width + kerning) * scale
        previous_glyph_name = glyph_name

    # Set up SVG dimensions to wrap the text, rounded to 3 decimal places
    svg_width = round(x_position, 3)
    # Account for descent as well
    svg_height = round(max_height - (font['hhea'].descent * scale), 3)

    # Create SVG without XML declaration or unnecessary attributes
    dwg = svgwrite.Drawing(
        size=(str(svg_width), str(svg_height)),  # Unitless size
        viewBox=f"0 0 {svg_width} {svg_height}"
    )
    dwg.add(text_group)

    # Save the initial SVG content
    initial_svg_content = dwg.tostring()

    # Clean the SVG content with scour
    scour_options = scour.sanitizeOptions()
    scour_options.remove_metadata = True
    scour_options.strip_comments = True
    scour_options.remove_descriptive_elements = True
    # Removes unnecessary viewBox manipulations
    scour_options.enable_viewboxing = False
    scour_options.keep_editor_data = False
    scour_options.newlines = False
    scour_options.nindent = None  # No indentation

    cleaned_svg_content = scour.scourString(initial_svg_content, scour_options)

    # Remove XML declaration, baseProfile, and version attributes
    cleaned_svg_content = re.sub(
        r'<\?xml[^>]+\?>', '', cleaned_svg_content)  # Remove XML declaration
    cleaned_svg_content = re.sub(
        # Remove baseProfile
        r'\sbaseProfile="[^"]+"', '', cleaned_svg_content)
    cleaned_svg_content = re.sub(
        r'\sversion="[^"]+"', '', cleaned_svg_content)  # Remove version

    # Write the cleaned SVG content to file
    with open(output_path, "w") as f:
        # Strip leading/trailing whitespace
        f.write(cleaned_svg_content.strip())


@click.command()
@click.argument('fonts_json', type=click.Path(exists=True))
@click.argument('output_folder', type=click.Path(exists=True))
@click.option('--skip', is_flag=True, help="Skip fonts if SVG already exists.")
@click.option('--font-size', default=14, help="Set the font size for SVG rendering.", type=int)
@click.option('--subset', default='latin', help="Specify the subset to use. Defaults to 'latin'.")
def generate_svgs(fonts_json, output_folder, skip, font_size, subset):
    with open(fonts_json, 'r') as file:
        fonts_data = json.load(file)

    for font_id, font_info in tqdm(fonts_data.items(), desc="Processing fonts"):
        try:
            family = font_info['family']
            font_url = None

            # First attempt to use weight 400, otherwise fall back to any available weight
            available_weights = font_info['variants'].keys()
            selected_weight = '400' if '400' in available_weights else next(
                iter(available_weights))

            # Check if the subset is available, warn and skip if not
            if subset not in font_info.get("subsets", []):
                # fmt: off
                tqdm.write(f"Warning: Subset '{subset}' not found for font '{font_id}', skipping.")
                continue

            # Find an available URL for the specified subset and selected weight
            if font_info['variants'][selected_weight]['normal'].get(subset):
                font_url = font_info['variants'][selected_weight]['normal'][subset]['url']['truetype']

            if font_url is None:
                tqdm.write(f"No usable variant for {font_id}, skipping.")
                continue

            output_path = os.path.join(output_folder, f"{font_id}.svg")

            if skip and os.path.exists(output_path):
                tqdm.write(f"Skipping {font_id}, SVG already exists.")
                continue

            # Call the function with specified font size
            text_to_svg_path(family, font_url, output_path,
                             font_size=font_size)
            tqdm.write(f"SVG saved for {font_id} at {output_path}")
        except Exception as e:
            tqdm.write(f"Error processing {font_id}: {e}")


if __name__ == "__main__":
    generate_svgs()
