import requests
import json
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
import svgwrite
import io
import os
import click
from tqdm import tqdm


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


def text_to_svg_path(text, font_url, output_path, font_size=72):
    font_file = load_font_from_url(font_url)
    font = TTFont(font_file)
    glyph_set = font.getGlyphSet()

    dwg = svgwrite.Drawing(size=('100%', '100%'), profile='tiny')
    scale = font_size / font['head'].unitsPerEm
    x_position = 0
    y_position = font_size

    text_group = dwg.g()
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
            path = dwg.path(
                d=path_data,
                transform=f"translate({x_position + kerning * scale}, {y_position}) scale({scale}, {-scale})")
            text_group.add(path)

        x_position += (advance_width + kerning) * scale
        previous_glyph_name = glyph_name

    dwg.add(text_group)
    dwg.saveas(output_path)


@click.command()
@click.argument('fonts_json', type=click.Path(exists=True))
@click.argument('output_folder', type=click.Path(exists=True))
@click.option('--skip', is_flag=True, help="Skip fonts if SVG already exists.")
def generate_svgs(fonts_json, output_folder, skip):
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

            # Define subset priority with fallback to default subset
            subsets_priority = ['latin', font_info['defSubset']]

            # Find an available subset URL with the selected weight
            for subset in subsets_priority:
                if font_info['variants'][selected_weight]['normal'].get(subset):
                    font_url = font_info['variants'][selected_weight]['normal'][subset]['url']['truetype']
                    break

            if font_url is None:
                tqdm.write(f"No usable variant for {font_id}, skipping.")
                continue

            output_path = os.path.join(output_folder, f"{font_id}.svg")

            if skip and os.path.exists(output_path):
                # tqdm.write(f"Skipping {font_id}, SVG already exists.")
                continue

            text_to_svg_path(family, font_url, output_path)
            tqdm.write(f"SVG saved for {font_id} at {output_path}")
        except Exception as e:
            tqdm.write(f"Error processing {font_id}: {e}")


if __name__ == "__main__":
    generate_svgs()
