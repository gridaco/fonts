# Font Utils Documentation

This module provides utilities for parsing font variants and generating CSS `@font-face` rules according to the CSS specification.

## Features

- **Variant Parsing**: Converts font variant strings to CSS `font-weight` and `font-style` properties
- **CSS Generation**: Creates proper `@font-face` rules for all font variants
- **Spec Compliance**: Follows CSS font specification for weight and style mapping

## Font Variant Mapping

### Weight Mapping

- `"regular"` → `font-weight: 400`
- `"300"` → `font-weight: 300`
- `"400"` → `font-weight: 400`
- `"500"` → `font-weight: 500`
- `"600"` → `font-weight: 600`
- `"700"` → `font-weight: 700`
- `"800"` → `font-weight: 800`
- `"900"` → `font-weight: 900`

### Style Mapping

- Variants ending with `"italic"` → `font-style: italic`
- All other variants → `font-style: normal`

## Example CSS Output

For a font with variants `["300", "400", "500", "700", "300italic", "700italic"]`, the generated CSS would be:

```css
@font-face {
  font-family: "Roboto";
  src: url("https://fonts.gstatic.com/s/roboto/v48/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf");
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Roboto";
  src: url("https://fonts.gstatic.com/s/roboto/v48/KFOkCnqEu92Fr1Mu52xPKTM1K9nz.ttf");
  font-weight: 300;
  font-style: italic;
  font-display: swap;
}

@font-face {
  font-family: "Roboto";
  src: url("https://fonts.gstatic.com/s/roboto/v48/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Roboto";
  src: url("https://fonts.gstatic.com/s/roboto/v48/KFOkCnqEu92Fr1Mu52xPKTM1K9nz.ttf");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Roboto";
  src: url("https://fonts.gstatic.com/s/roboto/v48/KFOkCnqEu92Fr1Mu52xPKTM1K9nz.ttf");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Roboto";
  src: url("https://fonts.gstatic.com/s/roboto/v48/KFOkCnqEu92Fr1Mu52xPKTM1K9nz.ttf");
  font-weight: 700;
  font-style: italic;
  font-display: swap;
}
```

## Usage

```typescript
import { parseFontVariant, generateFontFaceCSS } from "@/lib/font-utils";

// Parse a single variant
const { fontWeight, fontStyle } = parseFontVariant("700italic");
// Returns: { fontWeight: "700", fontStyle: "italic" }

// Generate CSS for all variants
const css = generateFontFaceCSS(font);
// Returns: Complete CSS string with @font-face rules
```
