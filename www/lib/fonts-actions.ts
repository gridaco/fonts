"use server";

import { getWebfontsData, paginateFonts } from "./fonts-utils";
import fs from "fs";
import path from "path";
import { Font, StaticFont, WebfontsResponse } from "@/types";
import { idToFamily } from "@/lib/fontid";

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

export async function getFontData(fontId: string): Promise<Font | null> {
  try {
    // Convert font ID back to family name
    const familyName = idToFamily(fontId);

    // Read both JSON files from public directory
    const webfontsVfPath = path.join(
      process.cwd(),
      "public",
      "webfonts-vf.json"
    );
    const webfontsPath = path.join(process.cwd(), "public", "webfonts.json");

    const webfontsVfData: WebfontsResponse = JSON.parse(
      fs.readFileSync(webfontsVfPath, "utf8")
    );
    const webfontsData: WebfontsResponse = JSON.parse(
      fs.readFileSync(webfontsPath, "utf8")
    );

    // Find font in webfonts-vf.json (primary lookup)
    const vfFont =
      webfontsVfData.items.find(
        (font: Font) => font.family.toLowerCase() === familyName.toLowerCase()
      ) ||
      webfontsVfData.items.find((font: Font) =>
        font.family.toLowerCase().includes(familyName.toLowerCase())
      );

    if (!vfFont) {
      return null;
    }

    // Find corresponding font in webfonts.json
    const staticFont =
      webfontsData.items.find(
        (font: StaticFont) =>
          font.family.toLowerCase() === familyName.toLowerCase()
      ) ||
      webfontsData.items.find((font: StaticFont) =>
        font.family.toLowerCase().includes(familyName.toLowerCase())
      );

    // Combine the data
    const combinedFont: Font = {
      ...vfFont, // webfonts-vf.json data (primary)
      static: staticFont || null, // webfonts.json data (additional)
    };

    return combinedFont;
  } catch (error) {
    console.error("Error fetching font data:", error);
    return null;
  }
}
