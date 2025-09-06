import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { InteractiveSection } from "./interactive-section";
import { FontStylesheet } from "@/components/font-stylesheet";
import { Font, StaticFont, WebfontsResponse } from "@/types";
import { idToFamily } from "@/lib/fontid";

interface FontDetailProps {
  params: Promise<{ id: string }>;
}

async function getFontData(fontId: string): Promise<Font | null> {
  try {
    // Convert font ID back to family name
    const familyName = idToFamily(fontId);

    // Read both JSON files
    const webfontsVfPath = path.join(process.cwd(), "..", "webfonts-vf.json");
    const webfontsPath = path.join(process.cwd(), "..", "webfonts.json");

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

export default async function FontDetail({ params }: FontDetailProps) {
  const { id } = await params;
  const font = await getFontData(id);

  if (!font) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Font Stylesheet */}
      <FontStylesheet font={font} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              ← Back to Fonts
            </Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <div className="mb-8">
            {/* Font Preview */}
            <div className="bg-muted/20 rounded-lg p-8 mb-6">
              <Image
                src={`/svg/${font.family
                  .toLowerCase()
                  .replace(/\s+/g, "")}.svg`}
                alt={`${font.family} font preview`}
                width={600}
                height={160}
                className="h-40 object-contain object-left"
              />
            </div>

            <div className="mb-4">
              <h1 className="text-3xl font-bold text-foreground">
                {font.family}
              </h1>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              <span className="capitalize">{font.category}</span>
              <span>{font.variants.length} styles</span>
              <span>
                {font.axes && Object.keys(font.axes).length > 0
                  ? "Variable"
                  : "Static"}
              </span>
              <span>Open Source</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Font Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Family:</span> {font.family}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {font.category}
                </div>
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  {font.axes && Object.keys(font.axes).length > 0
                    ? "Variable Font"
                    : "Static Font"}
                </div>
                <div>
                  <span className="font-medium">Styles:</span>{" "}
                  {font.variants.length}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Available Styles</h2>
              <div className="grid grid-cols-2 gap-2">
                {(font.static?.variants || font.variants).map((variant) => (
                  <div
                    key={variant}
                    className="bg-muted/50 rounded px-3 py-2 text-sm text-center"
                  >
                    {variant}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {font.axes && Object.keys(font.axes).length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Variable Font Axes</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(font.axes).map((axis) => (
                  <div
                    key={axis}
                    className="bg-muted/50 rounded px-3 py-2 text-sm text-center"
                  >
                    {axis}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Section - Client Component */}
        <InteractiveSection font={font} />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} fonts.grida.co - Google Fonts
              API with SVG Previews & Emoji Assets
            </p>
            <p className="text-sm mt-2">Powered by Google Fonts data</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
