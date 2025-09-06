import { NextRequest, NextResponse } from "next/server";
import { getWebfontsData, filterFonts, paginateFonts } from "@/lib/fonts-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const property = searchParams.get("property"); // "variable" or "static"
    const category = searchParams.get("category"); // "sans-serif", "serif", etc.
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Get webfonts data
    const webfontsData = getWebfontsData();

    // Filter fonts using shared utility
    const filteredFonts = filterFonts(
      webfontsData.items,
      query || undefined,
      property || undefined,
      category || undefined
    );

    // Paginate using shared utility
    const paginated = paginateFonts(filteredFonts, page, limit);

    const fontlist_count = webfontsData.items.length; // Grand total of all fonts

    return NextResponse.json({
      fonts: paginated.fonts,
      total: paginated.total,
      fontlist_count,
      page: paginated.page,
      limit: paginated.limit,
      totalPages: paginated.totalPages,
      hasNextPage: paginated.hasNextPage,
      hasPreviousPage: paginated.hasPreviousPage,
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
