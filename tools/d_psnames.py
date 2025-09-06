#!/usr/bin/env python3
"""
Extract PostScript Names from TTF Files

This script parses TTF files directly to extract PostScript names, including
variable font instances from fvar tables. It outputs a single text file
primarily used for understanding naming patterns.

Usage:
    python d_psnames.py [--fonts-dir FONTS_DIR] [--output OUTPUT_FILE] [--verbose]

Features:
- Direct TTF file parsing (no reliance on metadata)
- Variable font instance support
- Progress tracking with tqdm
- Click-based CLI interface
"""

import os
import sys
import click
from pathlib import Path
from typing import List, Dict, Set, Optional
from tqdm import tqdm

try:
    from fontTools.ttLib import TTFont
    from fontTools.ttLib.tables._f_v_a_r import table__f_v_a_r
except ImportError:
    print("Error: fonttools is required. Install with: pip install fonttools")
    sys.exit(1)


def extract_postscript_name(font_path: str) -> Optional[str]:
    """
    Extract PostScript name from a TTF file.

    Args:
        font_path: Path to the TTF file

    Returns:
        PostScript name or None if not found
    """
    try:
        with TTFont(font_path) as font:
            # Get PostScript name from name table
            name_table = font.get('name')
            if name_table:
                # Look for PostScript name (nameID 6)
                ps_name = name_table.getDebugName(6)
                if ps_name:
                    return ps_name

                # For variable fonts, also check nameID 25 (Variations PostScript Name Prefix)
                if 'fvar' in font:
                    vf_ps_name = name_table.getDebugName(25)
                    if vf_ps_name:
                        return vf_ps_name

                return None
    except Exception as e:
        print(f"Error reading {font_path}: {e}")
        return None


def extract_variable_font_instances(font_path: str) -> List[str]:
    """
    Extract PostScript names for variable font instances from fvar table.

    Args:
        font_path: Path to the TTF file

    Returns:
        List of PostScript names for variable font instances
    """
    instance_names = []

    try:
        with TTFont(font_path) as font:
            # Check if this is a variable font
            if 'fvar' not in font:
                return instance_names

            fvar_table = font['fvar']
            name_table = font.get('name')

            if not name_table:
                return instance_names

            # Extract instance names
            for instance in fvar_table.instances:
                # Get the PostScript name for this instance
                instance_name = name_table.getDebugName(
                    instance.subfamilyNameID)
                if instance_name:
                    instance_names.append(instance_name)

    except Exception as e:
        print(f"Error reading variable font instances from {font_path}: {e}")

    return instance_names


def find_ttf_files(fonts_dir: str) -> List[str]:
    """
    Find all TTF files in the given directory.

    Args:
        fonts_dir: Directory to search for TTF files

    Returns:
        List of TTF file paths
    """
    ttf_files = []
    fonts_path = Path(fonts_dir)

    if not fonts_path.exists():
        print(f"Error: Directory {fonts_dir} does not exist")
        return ttf_files

    # Recursively find all .ttf files
    for ttf_file in fonts_path.rglob("*.ttf"):
        ttf_files.append(str(ttf_file))

    return sorted(ttf_files)


def analyze_naming_patterns(ps_names: List[str], instance_names: List[str]) -> Dict[str, int]:
    """
    Analyze naming patterns in PostScript names.

    Args:
        ps_names: List of PostScript names
        instance_names: List of variable font instance names

    Returns:
        Dictionary of pattern counts
    """
    patterns = {}

    # Analyze main PostScript names
    for name in ps_names:
        if not name:
            continue

        # Common patterns to look for
        if '-' in name:
            patterns['contains-hyphen'] = patterns.get(
                'contains-hyphen', 0) + 1
        if 'Regular' in name:
            patterns['contains-regular'] = patterns.get(
                'contains-regular', 0) + 1
        if 'Bold' in name:
            patterns['contains-bold'] = patterns.get('contains-bold', 0) + 1
        if 'Italic' in name:
            patterns['contains-italic'] = patterns.get(
                'contains-italic', 0) + 1
        if '[' in name and ']' in name:
            patterns['contains-brackets'] = patterns.get(
                'contains-brackets', 0) + 1

    # Analyze variable font instance names
    for name in instance_names:
        if not name:
            continue

        if '-' in name:
            patterns['instance-contains-hyphen'] = patterns.get(
                'instance-contains-hyphen', 0) + 1
        if 'Regular' in name:
            patterns['instance-contains-regular'] = patterns.get(
                'instance-contains-regular', 0) + 1
        if 'Bold' in name:
            patterns['instance-contains-bold'] = patterns.get(
                'instance-contains-bold', 0) + 1
        if 'Italic' in name:
            patterns['instance-contains-italic'] = patterns.get(
                'instance-contains-italic', 0) + 1

    return patterns


@click.command()
@click.option('--fonts-dir',
              default='./vendor/google',
              help='Directory containing TTF files (default: ./vendor/google)')
@click.option('--output',
              default='psnames.txt',
              help='Output file for PostScript names (default: psnames.txt)')
@click.option('--verbose', '-v',
              is_flag=True,
              help='Enable verbose output')
def main(fonts_dir: str, output: str, verbose: bool):
    """
    Extract PostScript names from TTF files.

    This script parses TTF files directly to extract PostScript names,
    including variable font instances from fvar tables.
    """
    if verbose:
        print(f"Searching for TTF files in: {fonts_dir}")

    # Find all TTF files
    ttf_files = find_ttf_files(fonts_dir)

    if not ttf_files:
        print("No TTF files found!")
        return

    if verbose:
        print(f"Found {len(ttf_files)} TTF files")

    # Extract PostScript names
    ps_names = []
    instance_names = []
    variable_fonts = 0
    failed_files = []

    print("Extracting PostScript names...")

    for ttf_file in tqdm(ttf_files, desc="Processing fonts"):
        # Extract main PostScript name
        ps_name = extract_postscript_name(ttf_file)
        if ps_name:
            ps_names.append(ps_name)
        else:
            failed_files.append(ttf_file)

        # Check for variable font instances
        instances = extract_variable_font_instances(ttf_file)
        if instances:
            variable_fonts += 1
            instance_names.extend(instances)

        if verbose and ps_name:
            print(f"{os.path.basename(ttf_file)}: {ps_name}")
            if instances:
                for instance in instances:
                    print(f"  Instance: {instance}")

    # Analyze naming patterns
    patterns = analyze_naming_patterns(ps_names, instance_names)

    # Write output file
    with open(output, 'w', encoding='utf-8') as f:
        f.write("PostScript Names Analysis\n")
        f.write("=" * 50 + "\n\n")

        f.write(f"Total TTF files processed: {len(ttf_files)}\n")
        f.write(f"Successful extractions: {len(ps_names)}\n")
        f.write(f"Failed extractions: {len(failed_files)}\n")
        f.write(f"Variable fonts found: {variable_fonts}\n")
        f.write(f"Total variable font instances: {len(instance_names)}\n\n")

        f.write("Naming Patterns:\n")
        f.write("-" * 20 + "\n")
        for pattern, count in sorted(patterns.items()):
            f.write(f"{pattern}: {count}\n")
        f.write("\n")

        f.write("All PostScript Names:\n")
        f.write("-" * 25 + "\n")
        for name in sorted(set(ps_names)):
            f.write(f"{name}\n")
        f.write("\n")

        f.write("Variable Font Instance Names:\n")
        f.write("-" * 35 + "\n")
        for name in sorted(set(instance_names)):
            f.write(f"{name}\n")
        f.write("\n")

        if failed_files:
            f.write("Failed Files:\n")
            f.write("-" * 15 + "\n")
            for file_path in failed_files:
                f.write(f"{file_path}\n")

    print(f"\nResults written to: {output}")
    print(f"Processed {len(ttf_files)} files")
    print(f"Found {len(set(ps_names))} unique PostScript names")
    print(
        f"Found {len(set(instance_names))} unique variable font instance names")
    print(f"Variable fonts: {variable_fonts}")


if __name__ == '__main__':
    main()
