import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { InteractiveSection } from "./interactive-section";
import { FontStylesheet } from "@/components/font-stylesheet";
import { getFontData } from "@/lib/fonts-actions";

interface FontDetailProps {
  params: Promise<{ id: string }>;
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

        <div className="bg-card rounded-lg">
          <div className="mb-8">
            {/* Font Preview */}
            <div className="rounded-lg mb-6">
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
              <h2 className="text-sm font-semibold mb-2">Font Details</h2>
              <table className="text-xs text-muted-foreground border-collapse w-full">
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="font-medium pr-4 py-2">Family:</td>
                    <td className="py-2">{font.family}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="font-medium pr-4 py-2">Category:</td>
                    <td className="py-2">{font.category}</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="font-medium pr-4 py-2">Type:</td>
                    <td className="py-2">
                      {font.axes && Object.keys(font.axes).length > 0
                        ? "Variable Font"
                        : "Static Font"}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium pr-4 py-2">Styles:</td>
                    <td className="py-2">{font.variants.length}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h2 className="text-sm font-semibold mb-2">
                Styles ({(font.static?.variants || font.variants).length} ttf)
              </h2>
              <div className="text-xs text-muted-foreground">
                {(font.static?.variants || font.variants).join(", ")}
              </div>
            </div>
          </div>

          {font.axes && font.axes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold mb-2">Variable Font Axes</h2>
              <table className="text-xs text-muted-foreground border-collapse w-full">
                <tbody>
                  {font.axes.map((axis, index) => (
                    <tr
                      key={axis.tag}
                      className={
                        index < (font.axes?.length || 0) - 1
                          ? "border-b border-border/50"
                          : ""
                      }
                    >
                      <td className="font-medium pr-4 py-2">{axis.tag}</td>
                      <td className="py-2">{axis.start}</td>
                      <td className="py-2">{axis.end}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Interactive Section - Client Component */}
        <div className="mt-32">
          <InteractiveSection font={font} />
        </div>
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
