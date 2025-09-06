import fs from "fs";
import path from "path";
import { Font, WebfontsResponse } from "@/types";

export function getWebfontsData(): WebfontsResponse {
  const webfontsPath = path.join(process.cwd(), "public", "webfonts-vf.json");
  return JSON.parse(fs.readFileSync(webfontsPath, "utf8"));
}

export function filterFonts(
  fonts: Font[],
  query?: string,
  property?: string,
  category?: string
): Font[] {
  let filteredFonts = fonts;

  // Filter by search query
  if (query) {
    const searchTerm = query.toLowerCase();
    filteredFonts = filteredFonts.filter((font: Font) => {
      return (
        font.family.toLowerCase().includes(searchTerm) ||
        font.category.toLowerCase().includes(searchTerm) ||
        (font.variants &&
          font.variants.some((variant: string) =>
            variant.toLowerCase().includes(searchTerm)
          ))
      );
    });
  }

  // Filter by property (variable/static)
  if (property) {
    filteredFonts = filteredFonts.filter((font: Font) => {
      const isVariable = font.axes && Object.keys(font.axes).length > 0;
      if (property === "variable") {
        return isVariable;
      } else if (property === "static") {
        return !isVariable;
      }
      return true;
    });
  }

  // Filter by category
  if (category) {
    filteredFonts = filteredFonts.filter((font: Font) => {
      return font.category.toLowerCase() === category.toLowerCase();
    });
  }

  return filteredFonts;
}

export function paginateFonts(fonts: Font[], page: number, limit: number) {
  const total = fonts.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = fonts.slice(startIndex, endIndex);

  return {
    fonts: paginatedResults,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
