# Google Fonts PostScript Name Mapper

This module provides tools to map PostScript names to Google Fonts variants and CDN URLs. It processes the [Google Fonts](https://github.com/google/fonts) repository to create a reliable mapping between font files and their API representations.

## ✨ Key Features

* ✅ **Offline-first**: Works with local font files and webfonts.json
* ✅ **High Accuracy**: Achieves 99% mapping accuracy
* ✅ **Simple Fallback**: Provides a polyfill strategy for edge cases
* ✅ **API Integration**: Maps directly to Google Fonts CDN URLs

## 🔧 Commands

### Available Commands

```bash
# Pre-validate fonts against Google Fonts API data
python cli.py pre-validate --webfonts ./webfonts.json --fonts-dir ./vendor/google/ofl

# Map actual PostScript names from font files
python cli.py map --webfonts ./webfonts.json --fonts-dir ./vendor/google/ofl --family "Font Name"

# Polyfill missing PostScript name mappings
python cli.py polyfill --metadata webfonts.metadata.json --webfonts webfonts.json

# Post-validate mapped PostScript names against font files
python cli.py post-validate --metadata webfonts.metadata.json --fonts-dir ./vendor/google/ofl

# Test a specific font family
python cli.py test --webfonts ./webfonts.json --fonts-dir ./vendor/google/ofl "Font Name"
```

### Map Command

```bash
python cli.py map --webfonts ./webfonts.json --fonts-dir ./vendor/google/ofl --family "Font Name" --output metadata.json
```

The `map` command:
1. Reads font files and extracts actual PostScript names
2. Maps them to variants from webfonts.json based on name patterns
3. Creates a JSON mapping of actual PostScript names to variants and CDN URLs

### Polyfill Command

```bash
python cli.py polyfill --metadata webfonts.metadata.json --webfonts webfonts.json --output webfonts.metadata.json
```

The `polyfill` command helps fill in missing mappings using three strategies:
1. For empty mappings: If a font has exactly one PostScript name and one unused variant, map them together
2. For unused variants: If a font has exactly one unmapped PostScript name and one unused variant, map them together
3. Browser-style names: Adds standard browser-style PostScript names (e.g., "FontName-Regular", "FontName-Bold") for all variants in webfonts.json

## 📄 Example Output

```json
{
  "family": "Albert Sans",
  "post_script_names": {
    "AlbertSans-Regular": "regular",
    "AlbertSans-Bold": "700",
    "AlbertSans-Italic": "italic",
    "AlbertSans-BoldItalic": "700italic",
    "AlbertSans-Medium": "500",
    "AlbertSans-MediumItalic": "500italic"
  },
  "files": {
    "regular": "https://fonts.gstatic.com/s/albertsans/v10/ABC.ttf",
    "700": "https://fonts.gstatic.com/s/albertsans/v10/DEF.ttf",
    "italic": "https://fonts.gstatic.com/s/albertsans/v10/GHI.ttf",
    "700italic": "https://fonts.gstatic.com/s/albertsans/v10/JKL.ttf",
    "500": "https://fonts.gstatic.com/s/albertsans/v10/MNO.ttf",
    "500italic": "https://fonts.gstatic.com/s/albertsans/v10/PQR.ttf"
  }
}
```

## 🎯 Success Rate

The current implementation achieves a 99% success rate in mapping PostScript names to variants. The remaining 1% typically consists of:
- Variable fonts with complex naming schemes
- Fonts with non-standard PostScript names
- Edge cases with multiple unmapped names/variants

For these edge cases, clients can implement their own fallback strategies.

## ⚠️ Invalid Fonts

The project maintains a list of invalid fonts in `metadata/invalid.csv`. These fonts are excluded from all operations because they have one or more of the following issues:
- Missing METADATA.pb file
- Not found in Google Fonts API (webfonts.json)
- Inconsistent variant mapping between local files and API data

The CSV file contains:
- `folder`: Directory name
- `font family name`: Family name from METADATA.pb (if available)
- `reason(s)`: Semicolon-separated list of validation issues

## 🚀 Implementation Notes

* Uses `webfonts.json` as the source of truth for variants and CDN URLs
* Extracts PostScript names directly from font files
* Maintains a simple, predictable mapping strategy
* Provides polyfill for edge cases
* Skips fonts listed in invalid.csv

## 🪪 License

MIT or Apache 2.0 — same as Google Fonts.

---

## 🧑‍💻 Credits

Developed by Grida. Built for anyone building tools around Google Fonts with predictable naming.
