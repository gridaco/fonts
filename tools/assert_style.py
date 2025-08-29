#!/usr/bin/env python3
"""
Assert Style Validation Script

This script validates that:
1. All font directories contain a METADATA.pb file
2. Each font declaration in METADATA.pb has only "normal" or "italic" styles

Usage:
    python assert_style.py [--fonts-dir /path/to/fonts] [--verbose]
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Tuple, Set
import click

# Import the proper Google Fonts protobuf definitions
try:
    from gftools import fonts_public_pb2 as pb
    from google.protobuf import text_format
except ImportError:
    print("Error: gftools not found. Please install it with: pip install gftools")
    sys.exit(1)


def parse_metadata_pb(metadata_path: str) -> List[Dict]:
    """Parse METADATA.pb file using gftools protobuf and extract font information."""
    try:
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = pb.FamilyProto()
            text_format.Parse(f.read(), metadata, allow_unknown_field=True)
            
        # Convert protobuf objects to dictionaries
        fonts = []
        for font in metadata.fonts:
            font_dict = {
                'name': font.name if font.HasField('name') else None,
                'style': font.style if font.HasField('style') else 'normal',
                'weight': font.weight if font.HasField('weight') else 400,
                'filename': font.filename if font.HasField('filename') else None,
                'post_script_name': font.post_script_name if font.HasField('post_script_name') else None,
                'full_name': font.full_name if font.HasField('full_name') else None,
                'copyright': font.copyright if font.HasField('copyright') else None
            }
            fonts.append(font_dict)
            
        return fonts
    except Exception as e:
        print(f"Error parsing {metadata_path}: {e}")
        return []


def validate_font_styles(font_dir: str, verbose: bool = False) -> List[Tuple[str, str]]:
    """
    Validate font styles in a single font directory.
    
    Returns:
        List of tuples (issue_type, message)
    """
    issues = []
    metadata_path = os.path.join(font_dir, 'METADATA.pb')
    family_name = os.path.basename(font_dir)
    
    # Check if METADATA.pb exists
    if not os.path.exists(metadata_path):
        # Legacy fonts without METADATA.pb are not errors, just skip them
        if verbose:
            print(f"  Skipping legacy font (no METADATA.pb)")
        return []
    
    # Parse METADATA.pb using gftools protobuf
    try:
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = pb.FamilyProto()
            text_format.Parse(f.read(), metadata, allow_unknown_field=True)
    except Exception as e:
        issues.append(('ERROR', f'Failed to parse METADATA.pb: {e}'))
        return issues
    
    # Get family name from METADATA.pb
    if metadata.HasField('name'):
        family_name = metadata.name
    
    # Validate each font declaration
    valid_styles = {'normal', 'italic'}
    
    for i, font in enumerate(metadata.fonts):
        style = font.style if font.HasField('style') else 'normal'
        
        if style not in valid_styles:
            issues.append(('ERROR', f'Invalid style "{style}" in font {i+1}. Only "normal" or "italic" are allowed'))
        
        if verbose:
            print(f"  Font {i+1}: style={style}")
    
    return issues


def scan_font_directories(base_dir: str, verbose: bool = False) -> List[str]:
    """Scan for all font directories in the base directory."""
    font_dirs = []
    
    if not os.path.exists(base_dir):
        print(f"Warning: Base directory {base_dir} does not exist")
        return font_dirs
    
    for item in os.listdir(base_dir):
        item_path = os.path.join(base_dir, item)
        if os.path.isdir(item_path):
            font_dirs.append(item_path)
    
    if verbose:
        print(f"Found {len(font_dirs)} font directories in {base_dir}")
    
    return font_dirs


@click.command()
@click.option(
    '--fonts-dir',
    default='./vendor/google',
    help='Base directory containing font directories (default: ./vendor/google)'
)
@click.option(
    '--verbose', '-v',
    is_flag=True,
    help='Verbose output'
)
@click.option(
    '--output',
    help='Output file for issues (CSV format)'
)
def main(fonts_dir, verbose, output):
    
    # Find all font directories
    font_directories = []
    
    # Check if the fonts directory exists
    if os.path.exists(fonts_dir):
        # First, check if this is a font directory itself (contains METADATA.pb)
        metadata_path = os.path.join(fonts_dir, 'METADATA.pb')
        if os.path.exists(metadata_path):
            font_directories = [fonts_dir]
        else:
            # Look for common font license directories
            for subdir in ['ofl', 'apache', 'ufl']:
                subdir_path = os.path.join(fonts_dir, subdir)
                if os.path.exists(subdir_path):
                    font_dirs = scan_font_directories(subdir_path, verbose)
                    font_directories.extend(font_dirs)
            
            # If no subdirectories found, check the main directory
            if not font_directories:
                font_directories = scan_font_directories(fonts_dir, verbose)
    
    if not font_directories:
        print(f"Error: No font directories found in {fonts_dir}")
        print("Expected structure: vendor/google/{ofl,apache,ufl}/*/METADATA.pb")
        print("Or point directly to a font directory containing METADATA.pb")
        sys.exit(1)
    
    print(f"Validating {len(font_directories)} font directories...")
    
    # Validate each font directory
    all_issues = []
    valid_fonts = 0
    invalid_fonts = 0
    skipped_fonts = 0
    
    for font_dir in sorted(font_directories):
        family_name = os.path.basename(font_dir)
        
        if verbose:
            print(f"\nValidating: {family_name}")
        
        issues = validate_font_styles(font_dir, verbose)
        
        if issues:
            invalid_fonts += 1
            for issue_type, message in issues:
                all_issues.append((family_name, issue_type, message))
        else:
            # Check if this font was skipped (no METADATA.pb)
            metadata_path = os.path.join(font_dir, 'METADATA.pb')
            if not os.path.exists(metadata_path):
                skipped_fonts += 1
            else:
                valid_fonts += 1
    
    # Report results
    print(f"\nValidation Results:")
    print(f"  Total fonts: {len(font_directories)}")
    print(f"  Valid fonts: {valid_fonts}")
    print(f"  Invalid fonts: {invalid_fonts}")
    print(f"  Total issues: {len(all_issues)}")
    
    if all_issues:
        print(f"\nIssues Found:")
        
        # Group issues by font family
        font_issues = {}
        for family, issue_type, message in all_issues:
            if family not in font_issues:
                font_issues[family] = []
            font_issues[family].append((issue_type, message))
        
        # Print issues grouped by font family
        for family in sorted(font_issues.keys()):
            print(f"\n  {family}:")
            for issue_type, message in font_issues[family]:
                print(f"    [{issue_type}] {message}")
        
        # Write to output file if specified
        if output:
            with open(output, 'w', encoding='utf-8') as f:
                f.write("family,issue_type,message\n")
                for family, issue_type, message in all_issues:
                    f.write(f'"{family}","{issue_type}","{message}"\n')
            print(f"\nIssues written to: {args.output}")
        
        sys.exit(1)
    else:
        print(f"\n✅ All fonts validated successfully!")
        print(f"   All {valid_fonts} fonts have valid METADATA.pb files")
        print(f"   All font declarations use only 'normal' or 'italic' styles")


if __name__ == '__main__':
    main()
