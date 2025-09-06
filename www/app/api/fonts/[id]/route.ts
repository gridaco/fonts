import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { StaticFont, VfFont, CombinedFont, WebfontsResponse } from "@/types";
import { idToFamily } from "@/lib/fontid";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fontId } = await params;

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
        (font: VfFont) => font.family.toLowerCase() === familyName.toLowerCase()
      ) ||
      webfontsVfData.items.find((font: VfFont) =>
        font.family.toLowerCase().includes(familyName.toLowerCase())
      );

    if (!vfFont) {
      return NextResponse.json({ error: "Font not found" }, { status: 404 });
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
    const combinedFont: CombinedFont = {
      ...vfFont, // webfonts-vf.json data (primary)
      static: staticFont || null, // webfonts.json data (additional)
    };

    return NextResponse.json(combinedFont);
  } catch (error) {
    console.error("Error fetching font data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
