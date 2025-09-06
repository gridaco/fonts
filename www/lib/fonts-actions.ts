"use server";

import { getWebfontsData, paginateFonts } from "./fonts-utils";

export async function getInitialFontsData() {
  try {
    const webfontsData = getWebfontsData();

    // Get all fonts (no filters for initial load)
    const allFonts = webfontsData.items;

    // Get first 100 fonts for initial load
    const paginated = paginateFonts(allFonts, 1, 100);

    return {
      fonts: paginated.fonts,
      total: paginated.total,
      fontlist_count: webfontsData.items.length, // Grand total
    };
  } catch (error) {
    console.error("Error fetching initial fonts data:", error);
    return {
      fonts: [],
      total: 0,
      fontlist_count: 0,
    };
  }
}
