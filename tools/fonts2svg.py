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


def get_sample_text_for_font(font_info, subset):
    """
    Get appropriate sample text based on the font's subsets.
    Returns the font's name in its native script when possible.
    """
    family = font_info.get('family', '')

    # Font names in their native scripts - no latin support at all
    native_names = {
        'Chenla': 'ចេនឡា',  # Khmer (Chenla)
        'Content': 'មាតិការ',  # Khmer (Content)
        'Karla Tamil Inclined': 'கரளா தமிழ் சாய்ந்த',  # Tamil
        'Karla Tamil Upright': 'கரளா தமிழ் நிமிர்ந்த',  # Tamil
        'Khmer': 'ខ្មែរ',  # Khmer
        'Noto Color Emoji': '🎨😀📝',  # Emoji
        'Noto Emoji': '😀🎨📝',  # Emoji
        'Noto Sans Lycian': '𐊀𐊁𐊂',  # Lycian characters
        'Noto Sans Myanmar': 'နိုတို စန်းမြန်မာ',  # Myanmar
        'Noto Serif Myanmar': 'နိုတို စဲရစ် မြန်မာ',  # Myanmar
        'Phetsarath': 'ເພັດສະລາດ',  # Lao
        'Siemreap': 'សៀមរាប',  # Khmer
    }

    # Only return native name if explicitly supported
    if family in native_names:
        return native_names[family]

    # Return None if no native name mapping exists
    return None


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


def text_to_svg_path(text, font_url, font_size=16):
    """
    Convert text to SVG path content.
    Returns the SVG content as string, or None if any character is missing.
    """
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
            # Return None if any character is missing
            return None

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

    # Return the cleaned SVG content
    return cleaned_svg_content.strip()


@click.command()
@click.argument('fonts_json', type=click.Path(exists=True), default='./webfonts.json')
@click.argument('output_folder', type=click.Path(exists=True), default='./www/public/svg')
@click.option('--overwrite', is_flag=True, help="Overwrite existing SVG files. By default, existing files are skipped.")
@click.option('--font-size', default=16, help="Set the font size for SVG rendering.", type=int)
@click.option('--subset', default='latin', help="Specify the subset to use. Defaults to 'latin'.")
@click.option('--log-file', default='./failed_fonts.log', help="Log file for failed fonts. Defaults to './failed_fonts.log'.")
@click.option('--verbose', '-v', is_flag=True, help="Show verbose output including skip messages.")
def generate_svgs(fonts_json, output_folder, overwrite, font_size, subset, log_file, verbose):
    with open(fonts_json, 'r') as file:
        webfontlist = json.load(file)
        fonts_data = webfontlist.get('items')

    # Initialize log file
    failed_fonts = []

    for font_info in tqdm(fonts_data, desc="Processing fonts"):
        # Generate font_id from family name using the same logic as the assertion script
        family = font_info['family']
        font_id = normalize_family_name(family)

        try:
            font_url = None

            # Check if the subset is available, warn but continue if not
            if subset not in font_info.get("subsets", []):
                warning_msg = f"Warning: Subset '{subset}' not found for font '{font_id}', attempting anyway..."
                tqdm.write(warning_msg)
                # Log as warning but don't add to failed_fonts - let it try to process

            # Get available variants and files
            variants = font_info.get('variants', [])
            files = font_info.get('files', {})

            # First attempt to use 'regular', otherwise fall back to first available variant
            selected_variant = 'regular' if 'regular' in variants else (
                variants[0] if variants else None)

            if selected_variant and selected_variant in files:
                font_url = files[selected_variant]

            if font_url is None:
                error_msg = f"No usable variant for {font_id}"
                tqdm.write(error_msg)
                failed_fonts.append({
                    'font_id': font_id,
                    'family': family,
                    'error': f"No usable variant found. Available variants: {variants}, Available files: {list(files.keys())}",
                    'timestamp': __import__('datetime').datetime.now().isoformat()
                })
                continue

            output_path = os.path.join(output_folder, f"{font_id}.svg")

            if not overwrite and os.path.exists(output_path):
                if verbose:
                    tqdm.write(f"Skipping {font_id}, SVG already exists.")
                continue

            # Try to render the family name first
            svg_content = text_to_svg_path(
                family, font_url, font_size=font_size)

            if svg_content is None:
                # If family name fails, try with a sample text that the font supports
                sample_text = get_sample_text_for_font(font_info, subset)
                if sample_text:
                    svg_content = text_to_svg_path(
                        sample_text, font_url, font_size=font_size)
                    if svg_content:
                        tqdm.write(
                            f"Font '{font_id}' rendered with sample text: '{sample_text}'")
                    else:
                        error_msg = f"Font '{font_id}' cannot render any sample text"
                        tqdm.write(error_msg)
                        failed_fonts.append({
                            'font_id': font_id,
                            'family': family,
                            'error': f"Font cannot render family name '{family}' or any sample text",
                            'timestamp': __import__('datetime').datetime.now().isoformat()
                        })
                        continue
                else:
                    error_msg = f"Font '{font_id}' does not support family name and no sample text available"
                    tqdm.write(error_msg)
                    failed_fonts.append({
                        'font_id': font_id,
                        'family': family,
                        'error': f"Font does not support family name '{family}' and no sample text available",
                        'timestamp': __import__('datetime').datetime.now().isoformat()
                    })
                    continue

            # Write the SVG content to file
            with open(output_path, "w") as f:
                f.write(svg_content)
            tqdm.write(f"SVG saved for {font_id} at {output_path}")
        except Exception as e:
            error_msg = f"Error processing {font_id}: {e}"
            tqdm.write(error_msg)
            failed_fonts.append({
                'font_id': font_id,
                'family': family,
                'error': str(e),
                'timestamp': __import__('datetime').datetime.now().isoformat()
            })

    # Write failed fonts to log file
    if failed_fonts:
        with open(log_file, 'w') as f:
            f.write(
                f"Failed fonts log - Generated on {__import__('datetime').datetime.now().isoformat()}\n")
            f.write(f"Total failed fonts: {len(failed_fonts)}\n")
            f.write("=" * 80 + "\n\n")
            for failed in failed_fonts:
                f.write(f"Font ID: {failed['font_id']}\n")
                f.write(f"Family: {failed['family']}\n")
                f.write(f"Error: {failed['error']}\n")
                f.write(f"Timestamp: {failed['timestamp']}\n")
                f.write("-" * 40 + "\n")
        tqdm.write(f"\nFailed fonts logged to: {log_file}")
    else:
        tqdm.write(f"\nNo failed fonts to log.")


if __name__ == "__main__":
    generate_svgs()
