import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Font, WebfontsResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const property = searchParams.get("property"); // "variable" or "static"
    const category = searchParams.get("category"); // "sans-serif", "serif", etc.
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Read the webfonts-vf.json file from public directory
    const webfontsPath = path.join(process.cwd(), "public", "webfonts-vf.json");
    const webfontsData: WebfontsResponse = JSON.parse(
      fs.readFileSync(webfontsPath, "utf8")
    );

    let filteredFonts = webfontsData.items;

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

    // Calculate pagination
    const total = filteredFonts.length;
    const fontlist_count = webfontsData.items.length; // Grand total of all fonts
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = filteredFonts.slice(startIndex, endIndex);

    return NextResponse.json({
      fonts: paginatedResults,
      total,
      fontlist_count,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      query: query,
      filters: {
        property,
        category,
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search fonts" },
      { status: 500 }
    );
  }
}
