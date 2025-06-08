import json
import os
import csv
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Set
import click
from fontTools.ttLib import TTFont

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


def get_weight_name(weight: str) -> str:
    """Map weight value to standard weight name."""
    weight_map = {
        "100": "Thin",
        "200": "ExtraLight",
        "300": "Light",
        "regular": "Regular",
        "400": "Regular",
        "500": "Medium",
        "600": "SemiBold",
        "700": "Bold",
        "800": "ExtraBold",
        "900": "Black"
    }
    return weight_map.get(weight, weight)


def has_weight_axis(metadata_path: str) -> bool:
    """Check if font has weight axis in METADATA.pb."""
    with open(metadata_path, 'r') as f:
        content = f.read()
        return 'tag: "wght"' in content


def generate_postscript_names(font: Dict, api_data: Dict, has_wght: bool, style: str) -> Dict[str, str]:
    """Generate PostScript names based on webfonts.json variants only if font has weight axis."""
    base_name = font.get('post_script_name', '')
    if not base_name:
        return {}

    # For non-variable fonts, just return the exact PostScript name
    if not has_wght:
        return {base_name: 'regular'}

    # For variable fonts, generate names based on variants
    # Remove weight/style suffix if present
    for suffix in ['-Regular', '-Italic', '-Bold', '-Medium']:
        if base_name.endswith(suffix):
            base_name = base_name[:-len(suffix)]

    # Get variants from API data
    variants = api_data.get('variants', [])
    if not variants:
        return {base_name: 'regular'}

    # Generate names for each variant
    names = {}
    for variant in variants:
        # Skip variants that don't match the current style
        if style == 'normal' and 'italic' in variant:
            continue
        if style == 'italic' and 'italic' not in variant:
            continue

        if variant == 'regular':
            names[f"{base_name}-Regular"] = 'regular'
        elif variant == 'italic':
            names[f"{base_name}-Italic"] = 'italic'
        else:
            # Handle numeric weights
            if variant.endswith('italic'):
                weight = variant[:-6]  # Remove 'italic'
                weight_name = get_weight_name(weight)
                names[f"{base_name}-{weight_name}Italic"] = variant
            else:
                weight_name = get_weight_name(variant)
                names[f"{base_name}-{weight_name}"] = variant

    return names


def map_font_metadata(font_dir: str, webfonts_data: Dict[str, Dict]) -> Optional[Dict]:
    """Map font metadata to generate METADATA.json structure using actual PostScript names."""
    metadata_path = os.path.join(font_dir, 'METADATA.pb')
    if not os.path.exists(metadata_path):
        return None

    local_fonts = parse_metadata_pb(metadata_path)
    if not local_fonts:
        return None

    family_name = local_fonts[0].get('name')
    if not family_name or family_name not in webfonts_data:
        return None

    api_data = webfonts_data[family_name]
    result = {
        "family": family_name,
        "post_script_names": {},
        "files": api_data.get('files', {})
    }

    # Map actual PostScript names from font files
    postscript_names = set()
    for file in os.listdir(font_dir):
        if file.lower().endswith(('.ttf', '.otf')):
            font_path = os.path.join(font_dir, file)
            names = get_actual_postscript_names(font_path)
            postscript_names.update(names)

    # Map actual PostScript names to variants
    for name in sorted(postscript_names):
        # Try to determine variant from PostScript name
        variant = None

        # Check for common patterns in PostScript names
        if name.endswith('-Regular'):
            variant = 'regular'
        elif name.endswith('-Italic'):
            variant = 'italic'
        elif name.endswith('-Bold'):
            variant = '700'
        elif name.endswith('-BoldItalic'):
            variant = '700italic'
        elif name.endswith('-Medium'):
            variant = '500'
        elif name.endswith('-MediumItalic'):
            variant = '500italic'
        elif name.endswith('-Light'):
            variant = '300'
        elif name.endswith('-LightItalic'):
            variant = '300italic'
        elif name.endswith('-Thin'):
            variant = '100'
        elif name.endswith('-ThinItalic'):
            variant = '100italic'
        elif name.endswith('-Black'):
            variant = '900'
        elif name.endswith('-BlackItalic'):
            variant = '900italic'
        elif name.endswith('-ExtraLight'):
            variant = '200'
        elif name.endswith('-ExtraLightItalic'):
            variant = '200italic'
        elif name.endswith('-ExtraBold'):
            variant = '800'
        elif name.endswith('-ExtraBoldItalic'):
            variant = '800italic'
        elif name.endswith('-SemiBold'):
            variant = '600'
        elif name.endswith('-SemiBoldItalic'):
            variant = '600italic'

        # If we found a variant and it exists in webfonts.json, use it
        if variant and variant in api_data.get('files', {}):
            result["post_script_names"][name] = variant
        else:
            # If we couldn't determine the variant, try to find a matching one in webfonts.json
            # by comparing the weight/style parts of the name
            for api_variant in api_data.get('files', {}).keys():
                if api_variant == 'regular' and '-Regular' in name:
                    result["post_script_names"][name] = api_variant
                    break
                elif api_variant == 'italic' and '-Italic' in name:
                    result["post_script_names"][name] = api_variant
                    break
                elif api_variant.endswith('italic') and 'Italic' in name:
                    # Try to match weight numbers
                    weight = api_variant[:-6]  # Remove 'italic'
                    if weight in name:
                        result["post_script_names"][name] = api_variant
                        break
                elif api_variant.isdigit() and api_variant in name:
                    result["post_script_names"][name] = api_variant
                    break

    return result


def load_invalid_fonts() -> Set[str]:
    """Load list of invalid fonts from invalid.csv."""
    invalid_fonts = set()
    invalid_path = os.path.join(os.path.dirname(__file__), 'invalid.csv')

    if os.path.exists(invalid_path):
        with open(invalid_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                invalid_fonts.add(row['folder'])

    return invalid_fonts


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
        click.echo("\nValidation Issues Found:")
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
            click.echo(f"[{level}] {rel_path}: {message}")

        # Print final message about invalid.csv
        rel_invalid_path = Path(invalid_path).relative_to(os.getcwd())
        click.echo(
            f"\n{invalid_fonts} invalid fonts reported at {rel_invalid_path}")
    else:
        click.echo("\nAll fonts validated successfully!")

    # Print summary
    click.echo("\nValidation Summary:")
    click.echo(f"Total fonts: {total_fonts}")
    click.echo(f"Successfully validated: {success_fonts}")
    click.echo(f"Invalid fonts: {invalid_fonts}")


@cli.command()
@click.option('--webfonts', default=WEBFONTS_JSON, help='Path to webfonts.json')
@click.option('--fonts-dir', default=FONTS_OFL, help='Path to fonts directory')
@click.option('--family', help='Specific font family to map (optional)')
@click.option('--output', default='webfonts.metadata.json', help='Output JSON file name')
def map(webfonts: str, fonts_dir: str, family: Optional[str], output: str):
    """Map font metadata to generate METADATA.json structure."""
    # Load webfonts data
    webfonts_data = load_webfonts_data(webfonts)

    # Load invalid fonts
    invalid_fonts = load_invalid_fonts()

    # Process fonts
    all_mappings = {}

    if family:
        # Check if family is in invalid list
        if family in invalid_fonts:
            click.echo(
                f"Error: Font family '{family}' is listed in invalid.csv and will be skipped")
            return

        # Process single family
        font_dir = os.path.join(fonts_dir, family)
        if not os.path.isdir(font_dir):
            click.echo(f"Error: Font family '{family}' not found")
            return

        result = map_font_metadata(font_dir, webfonts_data)
        if result:
            family_name = result['family']
            all_mappings[family_name] = result
            click.echo(f"\nMapping for {family_name}:")
            click.echo(json.dumps(result, indent=2))
        else:
            click.echo(f"Error: Could not map font family '{family}'")
    else:
        # Process all families
        total = 0
        mapped = 0
        skipped = 0

        for font_dir in os.listdir(fonts_dir):
            full_path = os.path.join(fonts_dir, font_dir)
            if os.path.isdir(full_path):
                total += 1

                # Skip if in invalid list
                if font_dir in invalid_fonts:
                    skipped += 1
                    continue

                result = map_font_metadata(full_path, webfonts_data)
                if result:
                    mapped += 1
                    family_name = result['family']
                    all_mappings[family_name] = result
                    click.echo(f"\nMapping for {family_name}:")
                    click.echo(json.dumps(result, indent=2))

        click.echo(f"\nMapping Summary:")
        click.echo(f"Total fonts: {total}")
        click.echo(f"Successfully mapped: {mapped}")
        click.echo(f"Skipped (invalid): {skipped}")
        click.echo(f"Failed to map: {total - mapped - skipped}")

    # Write all mappings to output file
    if all_mappings:
        output_path = os.path.join(os.path.dirname(__file__), output)
        with open(output_path, 'w') as f:
            json.dump(all_mappings, f, indent=2)
        click.echo(f"\nMappings written to {output_path}")


def get_actual_postscript_names(font_path: str, verbose: bool = False) -> Set[str]:
    """Get actual PostScript names from a font file using fontTools.

    Args:
        font_path: Path to the font file
        verbose: If True, returns all names from nameIDs 4, 6, 17, 18 and fvar instances.
                If False, only returns nameID 6 (PostScript name).
    """
    try:
        font = TTFont(font_path)
        names = set()

        # Check if it's a variable font
        is_variable = 'fvar' in font

        # Look at different name IDs
        for record in font['name'].names:
            # In non-verbose mode, only get nameID 6 (PostScript name)
            if not verbose and record.nameID != 6:
                continue

            # In verbose mode, get all relevant nameIDs
            if verbose and record.nameID not in [4, 6, 17, 18]:
                continue

            try:
                # Try UTF-16-BE first (most common for PostScript names)
                try:
                    name = record.string.decode('utf-16-be')
                    # Validate the name - should be ASCII or Latin-1
                    if all(ord(c) < 128 for c in name):
                        names.add(name)
                except UnicodeDecodeError:
                    # Fallback to ASCII
                    try:
                        name = record.string.decode('ascii')
                        names.add(name)
                    except UnicodeDecodeError:
                        # Last resort: try Latin-1
                        try:
                            name = record.string.decode('latin1')
                            # Only add if it looks like a valid PostScript name
                            if all(c.isalnum() or c in '-_' for c in name):
                                names.add(name)
                        except UnicodeDecodeError:
                            click.echo(
                                f"Warning: Could not decode name in {font_path}")
            except Exception as e:
                click.echo(
                    f"Warning: Error processing name in {font_path}: {str(e)}")

        # For variable fonts, also look at fvar instances (only in verbose mode)
        if verbose and is_variable and 'fvar' in font:
            for instance in font['fvar'].instances:
                try:
                    # Get the instance name from name table
                    name_record = font['name'].getName(
                        instance.subfamilyNameID, 3, 1, 0x409)
                    if name_record:
                        name = name_record.string.decode('utf-16-be')
                        names.add(name)
                except Exception as e:
                    click.echo(
                        f"Warning: Error processing fvar instance name in {font_path}: {str(e)}")

        return names
    except Exception as e:
        click.echo(f"Error reading font {font_path}: {str(e)}")
        return set()


def get_font_details(font_path: str) -> Dict:
    """Get detailed font information including names and their sources."""
    try:
        font = TTFont(font_path)
        details = {
            'is_variable': 'fvar' in font,
            'names': {},
            'fvar_instances': []
        }

        if details['is_variable']:
            details['axes'] = [axis.axisTag for axis in font['fvar'].axes]

        # Get names from name table
        for record in font['name'].names:
            if record.nameID in [4, 6, 17, 18]:
                try:
                    name = record.string.decode('utf-16-be')
                    if all(ord(c) < 128 for c in name):
                        details['names'][name] = f"nameID {record.nameID}"
                except Exception:
                    pass

        # Get fvar instance names
        if details['is_variable'] and 'fvar' in font:
            for instance in font['fvar'].instances:
                try:
                    name_record = font['name'].getName(
                        instance.subfamilyNameID, 3, 1, 0x409)
                    if name_record:
                        name = name_record.string.decode('utf-16-be')
                        details['fvar_instances'].append(name)
                except Exception:
                    pass

        return details
    except Exception as e:
        return {'error': str(e)}


@cli.command()
@click.option('--webfonts', default=WEBFONTS_JSON, help='Path to webfonts.json')
@click.option('--fonts-dir', default=FONTS_OFL, help='Path to fonts directory')
@click.argument('folder')
def test(webfonts: str, fonts_dir: str, folder: str):
    """Test a specific font family by showing its PostScript names and variants."""
    # Load webfonts data
    webfonts_data = load_webfonts_data(webfonts)

    # Get font directory
    font_dir = os.path.join(fonts_dir, folder)
    if not os.path.exists(font_dir):
        click.echo(f"Error: Font directory not found at {font_dir}")
        return

    # Get family name from METADATA.pb
    metadata_path = os.path.join(font_dir, 'METADATA.pb')
    if not os.path.exists(metadata_path):
        click.echo(f"Error: METADATA.pb not found at {metadata_path}")
        return

    local_fonts = parse_metadata_pb(metadata_path)
    if not local_fonts:
        click.echo("Error: No font data found in METADATA.pb")
        return

    family_name = local_fonts[0].get('name')
    if not family_name:
        click.echo("Error: Family name not found in METADATA.pb")
        return

    # Get font files and their details
    font_files = []
    postscript_names = set()
    font_details = {}
    for file in os.listdir(font_dir):
        if file.lower().endswith(('.ttf', '.otf')):
            font_path = os.path.join(font_dir, file)
            # Use verbose mode for test command
            names = get_actual_postscript_names(font_path, verbose=True)
            postscript_names.update(names)
            font_files.append(file)
            font_details[file] = get_font_details(font_path)

    # Get variants from webfonts.json
    if family_name not in webfonts_data:
        click.echo(f"Error: Family '{family_name}' not found in webfonts.json")
        return

    api_data = webfonts_data[family_name]
    api_variants = set(api_data.get('files', {}).keys())

    # Print results
    click.echo(f"\nTesting font family: {family_name}")
    click.echo(f"Directory: {font_dir}")

    click.echo("\nFont files found:")
    for file in sorted(font_files):
        click.echo(f"  - {file}")
        details = font_details[file]
        if 'error' in details:
            click.echo(f"    Error: {details['error']}")
        else:
            click.echo(f"    Variable font: {details['is_variable']}")
            if details['is_variable']:
                click.echo(f"    Axes: {', '.join(details['axes'])}")
            if details['names']:
                click.echo("    Names found:")
                for name, source in sorted(details['names'].items()):
                    click.echo(f"      - {name} ({source})")
            if details['fvar_instances']:
                click.echo("    Fvar instances:")
                for name in sorted(details['fvar_instances']):
                    click.echo(f"      - {name}")

    click.echo("\nPostScript names found in font files:")
    for name in sorted(postscript_names):
        click.echo(f"  - {name}")

    click.echo("\nVariants defined in webfonts.json:")
    for variant in sorted(api_variants):
        click.echo(f"  - {variant}")

    # Print summary
    click.echo(f"\nSummary:")
    click.echo(f"  Font files: {len(font_files)}")
    click.echo(f"  PostScript names: {len(postscript_names)}")
    click.echo(f"  API variants: {len(api_variants)}")


@cli.command()
@click.option('--metadata', default='webfonts.metadata.json', help='Path to webfonts.metadata.json')
@click.option('--fonts-dir', default=FONTS_OFL, help='Path to fonts directory')
@click.option('--family', help='Specific font family to validate (optional)')
@click.option('--log', default='validation.log', help='Log file name')
def post_validate(metadata: str, fonts_dir: str, family: Optional[str], log: str):
    """Validate PostScript names in webfonts.metadata.json against actual font files."""
    # Load metadata
    metadata_path = os.path.join(os.path.dirname(__file__), metadata)
    if not os.path.exists(metadata_path):
        click.echo(f"Error: Metadata file not found at {metadata_path}")
        return

    with open(metadata_path, 'r') as f:
        metadata = json.load(f)

    # Load invalid fonts
    invalid_fonts = load_invalid_fonts()

    # Get valid font directories
    if family:
        if family in invalid_fonts:
            click.echo(
                f"Error: Font family '{family}' is listed in invalid.csv and will be skipped")
            return
        valid_dirs = [(family, os.path.join(fonts_dir, family))]
    else:
        valid_dirs = get_valid_font_dirs(fonts_dir, invalid_fonts)

    # Process fonts
    results = {
        'valid': [],
        'invalid': [],
        'not_found': []
    }

    # Track variant statistics
    total_variants = 0
    mapped_variants = 0
    missing_variants = 0
    total_api_variants = 0
    unmapped_api_variants = 0

    # Open log file
    log_path = os.path.join(os.path.dirname(__file__), log)
    with open(log_path, 'w') as log_file:
        for font_dir, full_path in valid_dirs:
            if not os.path.isdir(full_path):
                continue

            result = validate_font_family(font_dir, full_path, metadata)
            if result is None:
                results['not_found'].append(font_dir)
            else:
                results[result['status']].append(result)
                # Update variant statistics
                total_variants += result['actual_count']
                total_api_variants += result['api_variants']
                if result['status'] == 'valid':
                    mapped_variants += result['matched_count']
                else:
                    missing_variants += len(result.get('missing', []))
                    unmapped_api_variants += result['unmapped_variants']

        # Print results
        if results['not_found']:
            write_log("\nFonts not found in metadata:", log_file)
            for font in sorted(results['not_found']):
                write_log(f"  - {font}", log_file)

        if results['invalid']:
            write_log("\nValidation Issues Found:", log_file)
            for issue in results['invalid']:
                write_log(f"\n{issue['family']}:", log_file)
                if issue['missing']:
                    write_log("  Missing PostScript names:", log_file)
                    for name in issue['missing']:
                        # Skip CJK characters in console output but include in log
                        if not any(is_cjk(c) for c in name):
                            click.echo(f"    - {name}")
                        log_file.write(f"    - {name}\n")
                if issue['unmapped']:
                    write_log("  Unmapped API variants:", log_file)
                    for variant in issue['unmapped']:
                        write_log(f"    - {variant}", log_file)
        elif not results['not_found']:
            write_log("\nAll fonts validated successfully!", log_file)

        # Print summary
        write_log("\nValidation Summary:", log_file)
        write_log(f"Total fonts: {len(valid_dirs)}", log_file)
        write_log(f"Successfully validated: {len(results['valid'])}", log_file)
        write_log(f"Fonts with issues: {len(results['invalid'])}", log_file)
        if results['not_found']:
            write_log(
                f"Fonts not found in metadata: {len(results['not_found'])}", log_file)

        # Print variant resolution statistics
        write_log("\nVariant Resolution Statistics:", log_file)
        write_log(f"Total variants in font files: {total_variants}", log_file)
        write_log(f"Variants mapped in metadata: {mapped_variants}", log_file)
        write_log(
            f"Variants missing from metadata: {missing_variants}", log_file)
        write_log(f"Total API variants: {total_api_variants}", log_file)
        write_log(f"Unmapped API variants: {unmapped_api_variants}", log_file)
        if total_variants > 0:
            resolution_percentage = (mapped_variants / total_variants) * 100
            write_log(
                f"Variant resolution rate: {resolution_percentage:.1f}%", log_file)

        write_log(f"\nFull validation log written to: {log_path}", log_file)


@cli.command()
@click.option('--metadata', default='webfonts.metadata.json', help='Path to webfonts.metadata.json')
@click.option('--webfonts', default=WEBFONTS_JSON, help='Path to webfonts.json')
@click.option('--output', default='webfonts.metadata.json', help='Output JSON file name')
def polyfill(metadata: str, webfonts: str, output: str):
    """Polyfill missing PostScript name mappings in webfonts.metadata.json."""
    # Load metadata
    metadata_path = os.path.join(os.path.dirname(__file__), metadata)
    if not os.path.exists(metadata_path):
        click.echo(f"Error: Metadata file not found at {metadata_path}")
        return

    # Load webfonts data
    webfonts_data = load_webfonts_data(webfonts)

    with open(metadata_path, 'r') as f:
        metadata = json.load(f)

    # Track changes
    changes = {
        'empty_mappings': [],
        'unused_variants': [],
        'browser_style': []
    }

    # Process each font family
    for family_name, family_data in metadata.items():
        if family_name not in webfonts_data:
            continue

        api_data = webfonts_data[family_name]
        api_variants = set(api_data.get('files', {}).keys())
        mapped_variants = set(family_data.get(
            'post_script_names', {}).values())
        unused_variants = api_variants - mapped_variants

        # Strategy 1: Empty mappings with single PostScript name
        if not family_data.get('post_script_names'):
            # Get all font files in the family directory
            font_dir = os.path.join(
                FONTS_OFL, family_name.lower().replace(' ', ''))
            if os.path.exists(font_dir):
                postscript_names = set()
                for file in os.listdir(font_dir):
                    if file.lower().endswith(('.ttf', '.otf')):
                        font_path = os.path.join(font_dir, file)
                        names = get_actual_postscript_names(font_path)
                        postscript_names.update(names)

                # If we have exactly one PostScript name and one unused variant
                if len(postscript_names) == 1 and len(unused_variants) == 1:
                    postscript_name = postscript_names.pop()
                    variant = unused_variants.pop()
                    family_data['post_script_names'] = {
                        postscript_name: variant}
                    changes['empty_mappings'].append({
                        'family': family_name,
                        'postscript_name': postscript_name,
                        'variant': variant
                    })

        # Strategy 2: Unused variants
        elif len(unused_variants) == 1:
            # Get all font files in the family directory
            font_dir = os.path.join(
                FONTS_OFL, family_name.lower().replace(' ', ''))
            if os.path.exists(font_dir):
                postscript_names = set()
                for file in os.listdir(font_dir):
                    if file.lower().endswith(('.ttf', '.otf')):
                        font_path = os.path.join(font_dir, file)
                        names = get_actual_postscript_names(font_path)
                        postscript_names.update(names)

                # Find unmapped PostScript names
                mapped_names = set(family_data['post_script_names'].keys())
                unmapped_names = postscript_names - mapped_names

                # If we have exactly one unmapped name, use it
                if len(unmapped_names) == 1:
                    postscript_name = unmapped_names.pop()
                    variant = unused_variants.pop()
                    family_data['post_script_names'][postscript_name] = variant
                    changes['unused_variants'].append({
                        'family': family_name,
                        'postscript_name': postscript_name,
                        'variant': variant
                    })

        # Strategy 3: Browser-style PostScript name population
        # Add browser-style mappings for all variants in webfonts.json
        base_name = family_name.replace(' ', '')
        for variant in api_data.get('files', {}).keys():
            # Generate the browser-style PostScript name
            if variant == 'regular':
                postscript_name = f"{base_name}-Regular"
            elif variant == 'italic':
                postscript_name = f"{base_name}-Italic"
            else:
                # Handle numeric weights
                if variant.endswith('italic'):
                    weight = variant[:-6]  # Remove 'italic'
                    weight_name = get_weight_name(weight)
                    postscript_name = f"{base_name}-{weight_name}Italic"
                else:
                    weight_name = get_weight_name(variant)
                    postscript_name = f"{base_name}-{weight_name}"

            # Only add if this PostScript name isn't already mapped
            if postscript_name not in family_data['post_script_names']:
                family_data['post_script_names'][postscript_name] = variant
                changes['browser_style'].append({
                    'family': family_name,
                    'postscript_name': postscript_name,
                    'variant': variant
                })

    # Write updated metadata
    output_path = os.path.join(os.path.dirname(__file__), output)
    with open(output_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    # Print summary
    click.echo("\nPolyfill Summary:")
    click.echo(f"Empty mappings filled: {len(changes['empty_mappings'])}")
    click.echo(f"Unused variants mapped: {len(changes['unused_variants'])}")
    click.echo(f"Browser-style names added: {len(changes['browser_style'])}")

    if changes['empty_mappings']:
        click.echo("\nEmpty mappings filled:")
        for change in changes['empty_mappings']:
            click.echo(
                f"  {change['family']}: {change['postscript_name']} -> {change['variant']}")

    if changes['unused_variants']:
        click.echo("\nUnused variants mapped:")
        for change in changes['unused_variants']:
            click.echo(
                f"  {change['family']}: {change['postscript_name']} -> {change['variant']}")

    if changes['browser_style']:
        click.echo("\nBrowser-style names added:")
        for change in changes['browser_style']:
            click.echo(
                f"  {change['family']}: {change['postscript_name']} -> {change['variant']}")

    click.echo(f"\nUpdated metadata written to: {output_path}")


def write_log(message: str, log_file):
    """Write message to both console and log file."""
    click.echo(message)
    log_file.write(message + '\n')


def is_cjk(char: str) -> bool:
    """Check if a character is CJK (Chinese, Japanese, Korean)."""
    return any('\u4e00' <= c <= '\u9fff' for c in char)


def get_valid_font_dirs(fonts_dir: str, invalid_fonts: Set[str]) -> List[Tuple[str, str]]:
    """Get list of valid font directories and their full paths."""
    valid_dirs = []
    for font_dir in os.listdir(fonts_dir):
        if font_dir in invalid_fonts:
            continue
        full_path = os.path.join(fonts_dir, font_dir)
        if os.path.isdir(full_path):
            valid_dirs.append((font_dir, full_path))
    return sorted(valid_dirs)


def validate_font_family(font_dir: str, full_path: str, metadata: Dict) -> Optional[Dict]:
    """Validate a single font family against metadata."""
    click.echo(f"\nDebug for folder: {font_dir}")
    click.echo(f"Full path: {full_path}")

    family_name = find_family_in_metadata(font_dir, metadata)
    if not family_name:
        return None

    actual_names = scan_font_directory(full_path)
    expected_names = set(metadata[family_name]['post_script_names'].keys())
    api_variants = set(metadata[family_name]['files'].keys())
    mapped_variants = set(metadata[family_name]['post_script_names'].values())
    unmapped_variants = api_variants - mapped_variants

    click.echo(f"Family name found: {family_name}")
    click.echo(f"Actual names from font files: {sorted(actual_names)}")
    click.echo(f"Expected names from metadata: {sorted(expected_names)}")
    click.echo(f"API variants: {sorted(api_variants)}")
    click.echo(f"Mapped variants: {sorted(mapped_variants)}")
    click.echo(f"Unmapped variants: {sorted(unmapped_variants)}")

    # Find missing names (names in font files that aren't in metadata)
    missing_names = set()
    for name in actual_names:
        if name not in expected_names:
            missing_names.add(name)
            click.echo(f"Missing: {name} (not found in metadata)")

    if not missing_names and not unmapped_variants:
        return {
            'status': 'valid',
            'family': family_name,
            'actual_count': len(actual_names),
            'expected_count': len(expected_names),
            'matched_count': len(actual_names) - len(missing_names),
            'api_variants': len(api_variants),
            'mapped_variants': len(mapped_variants),
            'unmapped_variants': len(unmapped_variants)
        }

    return {
        'status': 'invalid',
        'family': family_name,
        'missing': sorted(missing_names),
        'unmapped': sorted(unmapped_variants),
        'actual_count': len(actual_names),
        'expected_count': len(expected_names),
        'matched_count': len(actual_names) - len(missing_names),
        'api_variants': len(api_variants),
        'mapped_variants': len(mapped_variants),
        'unmapped_variants': len(unmapped_variants)
    }


def scan_font_directory(font_dir: str) -> Set[str]:
    """Scan a font directory for all font files and get their PostScript names."""
    all_names = set()
    click.echo(f"\nScanning directory: {font_dir}")
    for file in os.listdir(font_dir):
        if file.lower().endswith(('.ttf', '.otf')):
            font_path = os.path.join(font_dir, file)
            click.echo(f"  Processing file: {file}")
            names = get_actual_postscript_names(font_path)
            all_names.update(names)
    return all_names


def normalize_name(name: str) -> str:
    """Normalize a name for comparison by removing spaces and special characters."""
    return ''.join(c.lower() for c in name if c.isalnum())


def find_family_in_metadata(font_dir: str, metadata: Dict) -> Optional[str]:
    """Find the matching family name in metadata using normalized comparison."""
    normalized_dir = normalize_name(font_dir)
    for name in metadata:
        if normalize_name(name) == normalized_dir:
            return name
    return None


if __name__ == '__main__':
    cli()
