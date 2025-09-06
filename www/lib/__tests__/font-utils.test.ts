import { describe, test, expect } from "@jest/globals";
import { parseFontVariant, generateFontFaceCSS } from "../font-utils";
import { Font } from "@/types";

describe("parseFontVariant", () => {
  test("should parse regular variant", () => {
    const result = parseFontVariant("regular");
    expect(result).toEqual({
      fontWeight: "400",
      fontStyle: "normal",
    });
  });

  test("should parse italic variant", () => {
    const result = parseFontVariant("italic");
    expect(result).toEqual({
      fontWeight: "400",
      fontStyle: "italic",
    });
  });

  test("should parse numeric weight variants", () => {
    expect(parseFontVariant("300")).toEqual({
      fontWeight: "300",
      fontStyle: "normal",
    });

    expect(parseFontVariant("700")).toEqual({
      fontWeight: "700",
      fontStyle: "normal",
    });
  });

  test("should parse italic weight variants", () => {
    expect(parseFontVariant("300italic")).toEqual({
      fontWeight: "300",
      fontStyle: "italic",
    });

    expect(parseFontVariant("700italic")).toEqual({
      fontWeight: "700",
      fontStyle: "italic",
    });
  });

  test("should handle unknown weights", () => {
    const result = parseFontVariant("unknown");
    expect(result).toEqual({
      fontWeight: "400",
      fontStyle: "normal",
    });
  });

  test("should handle unknown italic weights", () => {
    const result = parseFontVariant("unknownitalic");
    expect(result).toEqual({
      fontWeight: "400",
      fontStyle: "italic",
    });
  });
});

describe("generateFontFaceCSS", () => {
  test("should generate CSS for font with variants", () => {
    const font: Font = {
      family: "Test Font",
      category: "sans-serif",
      variants: ["300", "400", "700", "300italic", "700italic"],
      subsets: ["latin"],
      version: "v1",
      lastModified: "2025-01-01",
      files: {
        "300": "https://example.com/font-300.woff2",
        "400": "https://example.com/font-400.woff2",
        "700": "https://example.com/font-700.woff2",
        "300italic": "https://example.com/font-300-italic.woff2",
        "700italic": "https://example.com/font-700-italic.woff2",
      },
      kind: "webfonts#webfont",
      menu: "https://example.com/font-menu.woff2",
    };

    const css = generateFontFaceCSS(font);

    expect(css).toContain('font-family: "Test Font"');
    expect(css).toContain("font-weight: 300");
    expect(css).toContain("font-weight: 400");
    expect(css).toContain("font-weight: 700");
    expect(css).toContain("font-style: normal");
    expect(css).toContain("font-style: italic");
    expect(css).toContain("font-display: swap");
    expect(css).toContain('src: url("https://example.com/font-300.woff2")');
  });

  test("should handle font with static variants", () => {
    const font: Font = {
      family: "Test Font",
      category: "sans-serif",
      variants: ["regular"],
      subsets: ["latin"],
      version: "v1",
      lastModified: "2025-01-01",
      files: {
        regular: "https://example.com/font-regular.woff2",
      },
      kind: "webfonts#webfont",
      menu: "https://example.com/font-menu.woff2",
      static: {
        family: "Test Font",
        variants: ["regular", "italic"],
        subsets: ["latin"],
        version: "v1",
        lastModified: "2025-01-01",
        files: {
          regular: "https://example.com/font-regular.woff2",
          italic: "https://example.com/font-italic.woff2",
        },
        category: "sans-serif",
        kind: "webfonts#webfont",
        menu: "https://example.com/font-menu.woff2",
      },
    };

    const css = generateFontFaceCSS(font);

    expect(css).toContain('font-family: "Test Font"');
    expect(css).toContain("font-weight: 400");
    expect(css).toContain("font-style: normal");
    expect(css).toContain("font-style: italic");
    expect(css).toContain('src: url("https://example.com/font-regular.woff2")');
    expect(css).toContain('src: url("https://example.com/font-italic.woff2")');
  });

  test("should return empty string for font without variants", () => {
    const font: Font = {
      family: "Test Font",
      category: "sans-serif",
      variants: [],
      subsets: ["latin"],
      version: "v1",
      lastModified: "2025-01-01",
      files: {},
      kind: "webfonts#webfont",
      menu: "https://example.com/font-menu.woff2",
    };

    const css = generateFontFaceCSS(font);
    expect(css).toBe("");
  });

  test("should filter out variants without files", () => {
    const font: Font = {
      family: "Test Font",
      category: "sans-serif",
      variants: ["300", "400", "700"],
      subsets: ["latin"],
      version: "v1",
      lastModified: "2025-01-01",
      files: {
        "300": "https://example.com/font-300.woff2",
        "700": "https://example.com/font-700.woff2",
        // Missing 400 file
      },
      kind: "webfonts#webfont",
      menu: "https://example.com/font-menu.woff2",
    };

    const css = generateFontFaceCSS(font);

    expect(css).toContain('src: url("https://example.com/font-300.woff2")');
    expect(css).toContain('src: url("https://example.com/font-700.woff2")');
    expect(css).not.toContain("font-weight: 400");
  });
});
