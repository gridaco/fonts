#!/usr/bin/env python3
"""
Script to find the top 100 smallest font files in the Google Fonts repository.
Outputs the results to a text file with file paths.

@see https://gist.github.com/softmarshmallow/11902f1ef4676e02c85ff796639cef58
"""

import os
import glob
from pathlib import Path


def find_smallest_fonts(fonts_dir="fonts", output_file="smallest_fonts_top100.txt", top_n=100):
    """
    Find the top N smallest font files in the given directory.

    Args:
        fonts_dir (str): Directory containing font files
        output_file (str): Output file name
        top_n (int): Number of smallest files to find
    """

    # Font file extensions to search for
    font_extensions = ['*.ttf', '*.otf', '*.woff', '*.woff2']

    # Find all font files
    font_files = []
    for ext in font_extensions:
        pattern = os.path.join(fonts_dir, '**', ext)
        font_files.extend(glob.glob(pattern, recursive=True))

    print(f"Found {len(font_files)} font files")

    # Get file sizes and sort by size
    font_sizes = []
    for font_file in font_files:
        try:
            size = os.path.getsize(font_file)
            font_sizes.append((font_file, size))
        except (OSError, FileNotFoundError):
            continue

    # Sort by size (smallest first)
    font_sizes.sort(key=lambda x: x[1])

    # Take top N
    smallest_fonts = font_sizes[:top_n]

    # Write to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(
            f"Top {top_n} Smallest Font Files in Google Fonts Repository\n")
        f.write("=" * 60 + "\n\n")
        f.write("Rank | Size (bytes) | Size (KB) | File Path\n")
        f.write("-" * 80 + "\n")

        for i, (file_path, size) in enumerate(smallest_fonts, 1):
            size_kb = size / 1024
            f.write(f"{i:4d} | {size:11d} | {size_kb:8.1f} | {file_path}\n")

    print(f"Results written to {output_file}")
    print(f"\nTop 10 smallest fonts:")
    for i, (file_path, size) in enumerate(smallest_fonts[:10], 1):
        size_kb = size / 1024
        print(f"{i:2d}. {size_kb:6.1f} KB - {file_path}")


if __name__ == "__main__":
    find_smallest_fonts()
