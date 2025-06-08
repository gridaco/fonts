# Google Fonts PostScript Name Generator

This module provides a reliable way to generate **PostScript font names** (`nameID 6`) for all style and weight combinations supported by a variable or static font, based solely on `METADATA.pb` from the [Google Fonts](https://github.com/google/fonts) repository.

It creates a standardized `METADATA.json` file in each font family directory under `/ofl`, allowing for fast, deterministic mapping of font style specs (weight + italic) to PostScript names and font filenames.

---

## ✨ Key Goals

* ✅ **Offline-first**: No need to query any external APIs or parse binary font files
* ✅ **Deterministic**: PostScript names are generated consistently using naming conventions
* ✅ **Fast lookup**: Output JSON enables quick resolution of font names to files in downstream tools
* ✅ **API mappability**: Designed to optionally link each filename to the matching URL from the [Google Fonts Developer API](https://developers.google.com/fonts/docs/developer_api)

---

## 🔧 What It Does

1. **Clones or navigates** to a local copy of the [google/fonts](https://github.com/google/fonts) repository.
2. Iterates through all font families under `/ofl/*` (other directories like `/apache`, `/ufl` can be supported later).
3. Parses the `METADATA.pb` file using a Protobuf parser or manual parsing of the text format.
4. For each font:

   * Extracts the `name`, `style`, `weight`, `filename`, and `post_script_name`
   * Uses axis definitions (e.g., `wght`) to enumerate all possible instances
   * Applies consistent naming rules to synthesize missing PostScript names
   * Optionally **validates and maps local filenames** to remote file URLs from the [Google Fonts API](https://developers.google.com/fonts/docs/developer_api)
   * Produces a `METADATA.json` file beside the original `.pb` containing a fully indexed structure

---

## 📄 Example Output: `ofl/albertsans/METADATA.json`

```json
{
  "family": "Albert Sans",
  "files": [
    {
      "filename": "AlbertSans[wght].ttf",
      "style": "normal",
      "post_script_names": [
        "AlbertSans-Thin",
        "AlbertSans-ExtraLight",
        "AlbertSans-Light",
        "AlbertSans-Regular",
        "AlbertSans-Medium",
        "AlbertSans-SemiBold",
        "AlbertSans-Bold",
        "AlbertSans-ExtraBold",
        "AlbertSans-Black"
      ],
      "cdn_urls": {
        "AlbertSans-Regular": "http://fonts.gstatic.com/s/albertsans/v10/XYZ.ttf"
      },
      "file_keys": {
        "AlbertSans[wght].ttf": "regular"
      }
    },
    {
      "filename": "AlbertSans-Italic[wght].ttf",
      "style": "italic",
      "post_script_names": [
        "AlbertSans-ThinItalic",
        "AlbertSans-ExtraLightItalic",
        "AlbertSans-LightItalic",
        "AlbertSans-Italic",
        "AlbertSans-MediumItalic",
        "AlbertSans-SemiBoldItalic",
        "AlbertSans-BoldItalic",
        "AlbertSans-ExtraBoldItalic",
        "AlbertSans-BlackItalic"
      ],
      "cdn_urls": {
        "AlbertSans-MediumItalic": "http://fonts.gstatic.com/s/albertsans/v10/ABC.ttf"
      },
      "file_keys": {
        "AlbertSans-Italic[wght].ttf": "italic"
      }
    }
  ]
}
```

---

## 🧠 Naming Rules

The module synthesizes PostScript names using the following formula:

```text
<PostScriptFamilyName>-<WeightName><Italic?>
```

* `PostScriptFamilyName` is derived from the `post_script_name` in the `.pb` file (usually the `Regular` or `Italic` variant).
* `WeightName` is mapped from the `weight` value.
* `Italic` is added only if the font style is marked `italic`.

### Supported Weight Name Mapping

| Weight Value | Name       |
| ------------ | ---------- |
| 100          | Thin       |
| 200          | ExtraLight |
| 300          | Light      |
| 400          | Regular    |
| 500          | Medium     |
| 600          | SemiBold   |
| 700          | Bold       |
| 800          | ExtraBold  |
| 900          | Black      |

---

## 🧾 Google Fonts Developer API Integration

This module can be extended to work with the [Google Fonts API](https://developers.google.com/fonts/docs/developer_api), which returns data like:

```json
{
  "family": "Noto Sans Display",
  "files": {
    "regular": "http://fonts.gstatic.com/s/notosansdisplay/v20/ABC.ttf",
    "italic": "http://fonts.gstatic.com/s/notosansdisplay/v20/XYZ.ttf"
  },
  "axes": [
    { "tag": "wght", "start": 100, "end": 900 },
    { "tag": "wdth", "start": 62.5, "end": 100 }
  ]
}
```

The script supports **pre-validating** that `filename` entries in `METADATA.pb` match the API's `files` URLs by maintaining a lookup:

```json
{
  "filename_to_url": {
    "AlbertSans-Italic[wght].ttf": "http://fonts.gstatic.com/s/albertsans/v10/XYZ.ttf"
  },
  "filename_to_file_key": {
    "AlbertSans-Italic[wght].ttf": "italic"
  }
}
```

This enables multi-step deterministic resolution:

### 🔁 Resolution Flow:

1. Find the font file by PostScript name:

   * `"AlbertSans-MediumItalic" → "AlbertSans-Italic[wght].ttf"`
2. Lookup the key to match Google Fonts API file key:

   * `"AlbertSans-Italic[wght].ttf" → "italic"`
3. Lookup the CDN URL from `files[key]`:

   * `"italic" → "http://fonts.gstatic.com/s/..."`

---

## 🏗 Structure of METADATA.json

```json
{
  "family": "Font Family Name",
  "files": [
    {
      "filename": "font-file.ttf",
      "style": "normal" | "italic",
      "post_script_names": ["...derived names..."],
      "cdn_urls": {
        "PostScriptName": "https://fonts.gstatic.com/..."
      },
      "file_keys": {
        "font-file.ttf": "regular"
      }
    }
  ]
}
```

---

## 🔌 Integration Use Cases

* Resolving user style specs (e.g., weight 600 + italic = `SemiBoldItalic`) to font files
* Building offline font name → file lookup tables for editors or renderers
* Creating accurate, versioned mapping of Google Fonts CDN URLs

---

## 🚀 Implementation Notes

* The tool assumes all filenames in `METADATA.pb` are correct and that naming follows Google Fonts conventions.
* It uses standard weight-to-name mappings defined above.
* Only the `wght` axis is supported for generation (future versions may support `wdth`, `slnt`, `opsz`, etc).
* Files with no axis (i.e., static fonts) are included using their direct `post_script_name`.

---

## 📦 CLI Options (planned)

```bash
python generate_metadata.py --repo ./google-fonts --out ./ofl --format json --validate-api ./webfonts.json
```

Options:

* `--repo`: Path to the `google/fonts` clone
* `--out`: Output folder to store generated `METADATA.json` files
* `--format`: Output format (`json`)
* `--validate-api`: Optional path to Google Fonts API result for CDN mapping
* `--filter`: Limit to specific font families

---

## ⚠ Limitations

* Only supports fonts using the `wght` axis (not `wdth`, `slnt`, etc)
* Fonts with custom or non-standard PostScript naming may not map 1:1
* Does not validate the output against actual font binaries (to remain fast and offline)

---

## 🪪 License

MIT or Apache 2.0 — same as Google Fonts.

---

## 🧑‍💻 Credits

Developed by \<your name/team>. Built for anyone building tools around Google Fonts with predictable naming.

---

## ⚠️ Invalid Fonts

The project maintains a list of invalid fonts in `metadata/invalid.csv`. These fonts are excluded from all project operations because they have one or more of the following issues:
- Missing METADATA.pb file
- Not found in Google Fonts API (webfonts.json)
- Inconsistent variant mapping between local files and API data

The CSV file contains the following columns:
- `folder`: The directory name (used as fallback font name)
- `font family name`: The family name from METADATA.pb (if available)
- `reason(s)`: Semicolon-separated list of validation issues

**Important**: All tools in this project will skip fonts listed in `invalid.csv`. This ensures consistent behavior across the entire project scope.
