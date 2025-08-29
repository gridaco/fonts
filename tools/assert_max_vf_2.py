#!/usr/bin/env python3
"""
Variable Font Assertion Script

This script asserts that there can only be up to 2 variable fonts per family.
Variable fonts are identified by the naming convention: name[xxxx].ttf

Usage:
    python assert_max_vf_2.py [--fonts-dir /path/to/fonts] [--verbose] [--output file.csv]
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Tuple
import click


def is_variable_font(filename: str) -> bool:
    """Check if a filename represents a variable font based on naming convention."""
    return '[' in filename and ']' in filename and filename.lower().endswith('.ttf')


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


def find_variable_fonts(font_dir: str, verbose: bool = False) -> List[Dict]:
    """
    Find variable fonts in a single font directory.
    
    Returns:
        List of dictionaries with font information
    """
    variable_fonts = []
    family_name = os.path.basename(font_dir)
    
    if not os.path.exists(font_dir):
        return variable_fonts
    
    # Get family name from METADATA.pb if available
    metadata_path = os.path.join(font_dir, 'METADATA.pb')
    if os.path.exists(metadata_path):
        try:
            # Simple parsing to get family name
            with open(metadata_path, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.strip().startswith('name:'):
                        family_name = line.split(':', 1)[1].strip().strip('"')
                        break
        except Exception:
            pass  # Use directory name as fallback
    
    # Scan for variable font files
    for filename in os.listdir(font_dir):
        if is_variable_font(filename):
            font_info = {
                'family': family_name,
                'filename': filename,
                'path': os.path.join(font_dir, filename),
                'relative_path': os.path.relpath(os.path.join(font_dir, filename)),
                'size_bytes': os.path.getsize(os.path.join(font_dir, filename))
            }
            variable_fonts.append(font_info)
            
            if verbose:
                print(f"  Found VF: {filename}")
    
    return variable_fonts


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
    help='Output file for results (CSV format)'
)
@click.option(
    '--format',
    type=click.Choice(['table', 'list', 'csv']),
    default='table',
    help='Output format (default: table)'
)
def main(fonts_dir, verbose, output, format):
    """Assert that there can only be up to 2 variable fonts per family."""
    
    # Find all font directories
    font_directories = []
    
    # Check if the fonts directory exists
    if os.path.exists(fonts_dir):
        # First, check if this is a font directory itself
        if os.path.isdir(fonts_dir) and any(f.endswith('.ttf') for f in os.listdir(fonts_dir)):
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
        print("Expected structure: vendor/google/{ofl,apache,ufl}/*/")
        print("Or point directly to a font directory")
        sys.exit(1)
    
    print(f"Validating {len(font_directories)} font directories for variable font limits...")
    
    # Find all variable fonts
    all_variable_fonts = []
    families_with_vf = set()
    
    for font_dir in sorted(font_directories):
        family_name = os.path.basename(font_dir)
        
        if verbose:
            print(f"\nScanning: {family_name}")
        
        variable_fonts = find_variable_fonts(font_dir, verbose)
        all_variable_fonts.extend(variable_fonts)
        
        if variable_fonts:
            families_with_vf.add(family_name)
    
    # Count variable fonts per family
    family_counts = {}
    for font in all_variable_fonts:
        family = font['family']
        family_counts[family] = family_counts.get(family, 0) + 1
    
    # Check for violations (families with more than 2 VF files)
    violations = []
    for family, count in family_counts.items():
        if count > 2:
            violations.append((family, count))
    
    # Report results
    print(f"\nVariable Font Validation Results:")
    print(f"  Total font directories: {len(font_directories)}")
    print(f"  Families with variable fonts: {len(families_with_vf)}")
    print(f"  Total variable font files: {len(all_variable_fonts)}")
    
    if all_variable_fonts:
        # Calculate total size
        total_size = sum(font['size_bytes'] for font in all_variable_fonts)
        total_size_mb = total_size / (1024 * 1024)
        print(f"  Total size: {total_size_mb:.2f} MB")
        
        # Show family statistics
        families_with_0_vf = len(font_directories) - len(families_with_vf)
        print(f"\nVariable Fonts per Family:")
        print(f"  Average VF files per family: {len(all_variable_fonts) / len(families_with_vf):.1f}")
        print(f"  Most VF files in a family: {max(family_counts.values())}")
        print(f"  Families with 0 VF files: {families_with_0_vf}")
        print(f"  Families with 1 VF file: {sum(1 for count in family_counts.values() if count == 1)}")
        print(f"  Families with 2 VF files: {sum(1 for count in family_counts.values() if count == 2)}")
        print(f"  Families with 3+ VF files: {sum(1 for count in family_counts.values() if count >= 3)}")
        
        # Show violations if any
        if violations:
            print(f"\n❌ VALIDATION FAILED: Found {len(violations)} families with more than 2 VF files:")
            print(f"{'Family':<30} {'Count':<8} {'Files':<50}")
            print("-" * 88)
            for family, count in violations:
                family_fonts = [f for f in all_variable_fonts if f['family'] == family]
                filenames = [f['filename'] for f in family_fonts]
                names_str = ", ".join(filenames)
                if len(names_str) > 48:
                    names_str = names_str[:45] + "..."
                print(f"{family:<30} {count:<8} {names_str:<50}")
            
            # Save violations to CSV if output specified
            if output:
                with open(output, 'w', encoding='utf-8') as f:
                    f.write("family,vf_count,filenames\n")
                    for family, count in violations:
                        family_fonts = [f for f in all_variable_fonts if f['family'] == family]
                        filenames = [f['filename'] for f in family_fonts]
                        names_str = ", ".join(filenames)
                        f.write(f'"{family}",{count},"{names_str}"\n')
                print(f"\nViolations saved to: {output}")
            
            sys.exit(1)
        else:
            print(f"\n✅ VALIDATION PASSED: All families have 2 or fewer VF files!")
            
            # Show family breakdown table if verbose or format is specified
            if verbose or format != 'table':
                print(f"\nVariable Fonts by Family:")
                print(f"{'Family':<30} {'Count':<8} {'Names':<50} {'Size (MB)':<12}")
                print("-" * 100)
                
                # Sort families by number of VF files (descending)
                sorted_families = sorted(family_counts.items(), key=lambda x: x[1], reverse=True)
                
                for family, count in sorted_families:
                    # Get fonts for this family
                    family_fonts = [f for f in all_variable_fonts if f['family'] == family]
                    family_size = sum(f['size_bytes'] for f in family_fonts) / (1024 * 1024)
                    
                    # Get filenames for this family
                    filenames = [f['filename'] for f in family_fonts]
                    names_str = ", ".join(filenames)
                    
                    # Truncate names if too long
                    if len(names_str) > 48:
                        names_str = names_str[:45] + "..."
                    
                    print(f"{family:<30} {count:<8} {names_str:<50} {family_size:<12.2f}")
        
        # Output results in other formats if requested
        if format == 'list':
            print(f"\nVariable Fonts Found:")
            for font in sorted(all_variable_fonts, key=lambda x: (x['family'], x['filename'])):
                size_mb = font['size_bytes'] / (1024 * 1024)
                print(f"  {font['family']} - {font['filename']} ({size_mb:.2f} MB)")
        
        elif format == 'csv':
            if output:
                with open(output, 'w', encoding='utf-8') as f:
                    f.write("family,filename,path,relative_path,size_bytes,size_mb\n")
                    for font in sorted(all_variable_fonts, key=lambda x: (x['family'], x['filename'])):
                        size_mb = font['size_bytes'] / (1024 * 1024)
                        f.write(f'"{font["family"]}","{font["filename"]}","{font["path"]}","{font["relative_path"]}",{font["size_bytes"]},{size_mb:.2f}\n')
                print(f"\nResults written to: {output}")
            else:
                print("CSV format requires --output option")
                sys.exit(1)
        
        # Write to output file if specified (for non-CSV formats)
        if output and format != 'csv':
            with open(output, 'w', encoding='utf-8') as f:
                f.write("family,filename,path,relative_path,size_bytes,size_mb\n")
                for font in sorted(all_variable_fonts, key=lambda x: (x['family'], x['filename'])):
                    size_mb = font['size_bytes'] / (1024 * 1024)
                    f.write(f'"{font["family"]}","{font["filename"]}","{font["path"]}","{font["relative_path"]}",{font["size_bytes"]},{size_mb:.2f}\n')
            print(f"\nResults written to: {output}")
    
    else:
        print(f"\n✅ VALIDATION PASSED: No variable fonts found!")
        sys.exit(0)


if __name__ == '__main__':
    main()
