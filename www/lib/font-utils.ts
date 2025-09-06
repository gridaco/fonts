import { Font } from "@/types";
import { familyToId } from "./fontid";

/**
 * Parses a font variant string and returns the corresponding CSS properties
 * @param variant - Font variant string (e.g., "300", "400italic", "700", "regular")
 * @returns Object with font-weight and font-style properties
 */
export function parseFontVariant(variant: string): {
  fontWeight: string;
  fontStyle: string;
} {
  // Handle special cases
  if (variant === "regular") {
    return { fontWeight: "400", fontStyle: "normal" };
  }

  if (variant === "italic") {
    return { fontWeight: "400", fontStyle: "italic" };
  }

  // Check if variant ends with "italic"
  const isItalic = variant.endsWith("italic");

  // Extract weight (remove "italic" suffix if present)
  const weightString = isItalic ? variant.slice(0, -6) : variant;

  // Map weight strings to CSS values
  const weightMap: Record<string, string> = {
    "100": "100",
    "200": "200",
    "300": "300",
    "400": "400",
    "500": "500",
    "600": "600",
    "700": "700",
    "800": "800",
    "900": "900",
  };

  const fontWeight = weightMap[weightString] || "400";
  const fontStyle = isItalic ? "italic" : "normal";

  return { fontWeight, fontStyle };
}

/**
 * Generates CSS @font-face rules for all font variants
 * @param font - Font object containing variants and files
 * @returns CSS string with @font-face rules
 */
export function generateFontFaceCSS(font: Font): string {
  const variants = font.static?.variants || font.variants;
  const files = font.static?.files || font.files;

  if (!variants || !files) {
    return "";
  }

  const fontFaceRules = variants
    .map((variant) => {
      const { fontWeight, fontStyle } = parseFontVariant(variant);
      const fontUrl = files[variant];

      if (!fontUrl) {
        return null;
      }

      return `@font-face {
  font-family: "${font.family}";
  src: url("${fontUrl}");
  font-weight: ${fontWeight};
  font-style: ${fontStyle};
  font-display: swap;
}`;
    })
    .filter(Boolean)
    .join("\n\n");

  return fontFaceRules;
}

/**
 * Generates a unique CSS class name for a font variant
 * @param fontFamily - Font family name
 * @param variant - Font variant string
 * @returns CSS class name
 */
export function getVariantClassName(
  fontFamily: string,
  variant: string
): string {
  const { fontWeight, fontStyle } = parseFontVariant(variant);
  const familySlug = familyToId(fontFamily);
  const styleSlug = fontStyle === "italic" ? "italic" : "normal";
  return `font-${familySlug}-${fontWeight}-${styleSlug}`;
}
