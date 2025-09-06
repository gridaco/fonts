import Image from "next/image";
import { Header } from "@/components/header";

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Developer API
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Google Fonts API with SVG Previews & Emoji Assets
          </p>
          <div className="mt-4">
            <a
              href="/webfonts.json"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 underline"
            >
              View API Documentation →
            </a>
          </div>
        </div>

        {/* API Overview */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">
            API Overview
          </h2>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">
            The fonts.grida.co API provides programmatic access to Google Fonts
            metadata, SVG previews, and Apple Color Emoji assets. All endpoints
            are CORS-enabled and optimized for performance with long-term
            caching.
          </p>

          <div className="bg-accent border border-accent-foreground/20 rounded-md p-3 sm:p-4">
            <h3 className="text-sm font-medium text-accent-foreground mb-2">
              Base URL
            </h3>
            <code className="text-xs sm:text-sm text-accent-foreground/80">
              https://fonts.grida.co
            </code>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">
            API Endpoints
          </h2>

          <div className="space-y-6">
            {/* Fonts Metadata */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-medium text-foreground">
                  Fonts Metadata
                </h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  GET
                </span>
              </div>
              <div className="space-y-3">
                <div className="bg-muted rounded-md p-3">
                  <code className="text-sm text-foreground">
                    /webfonts.json
                  </code>
                  <p className="text-xs text-muted-foreground mt-1">
                    Standard Google Fonts metadata with all font families and
                    variants
                  </p>
                </div>
                <div className="bg-muted rounded-md p-3">
                  <code className="text-sm text-foreground">
                    /webfonts-vf.json
                  </code>
                  <p className="text-xs text-muted-foreground mt-1">
                    Variable fonts metadata with axis information
                  </p>
                </div>
              </div>
            </div>

            {/* SVG Previews */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-medium text-foreground">
                  SVG Font Previews
                </h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  GET
                </span>
              </div>
              <div className="bg-muted rounded-md p-3">
                <code className="text-sm text-foreground">
                  /svg/[fontname].svg
                </code>
                <p className="text-xs text-muted-foreground mt-1">
                  SVG preview of any Google Font. Font names are lowercase with
                  spaces replaced by hyphens.
                </p>
              </div>
            </div>

            {/* Apple Emoji */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-medium text-foreground">
                  Apple Color Emoji
                </h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  GET
                </span>
              </div>
              <div className="bg-muted rounded-md p-3">
                <code className="text-sm text-foreground">
                  /apple/emoji/160/[unicode].png
                </code>
                <p className="text-xs text-muted-foreground mt-1">
                  High-quality PNG emoji images for Linux compatibility. Unicode
                  should be lowercase hex.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">
            Code Examples
          </h2>

          <div className="space-y-6">
            {/* JavaScript/TypeScript */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-3">
                JavaScript/TypeScript
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Fetch Font Metadata
                  </h4>
                  <div className="bg-muted rounded-md p-3">
                    <pre className="text-xs sm:text-sm text-foreground overflow-x-auto">
                      {`const response = await fetch('https://fonts.grida.co/webfonts.json');
const fonts = await response.json();
console.log(fonts.items[0]); // First font family`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Get SVG Preview
                  </h4>
                  <div className="bg-muted rounded-md p-3">
                    <pre className="text-xs sm:text-sm text-foreground overflow-x-auto">
                      {`const svgUrl = 'https://fonts.grida.co/svg/roboto.svg';
const img = document.createElement('img');
img.src = svgUrl;
document.body.appendChild(img);`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* cURL */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-3">
                cURL
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Get Font Metadata
                  </h4>
                  <div className="bg-muted rounded-md p-3">
                    <pre className="text-xs sm:text-sm text-foreground overflow-x-auto">
                      {`curl -H "Accept: application/json" \\
  https://fonts.grida.co/webfonts.json`}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Download SVG
                  </h4>
                  <div className="bg-muted rounded-md p-3">
                    <pre className="text-xs sm:text-sm text-foreground overflow-x-auto">
                      {`curl -o roboto.svg \\
  https://fonts.grida.co/svg/roboto.svg`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SVG Examples */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">
            SVG Font Previews
          </h2>
          <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
            Live examples of SVG font previews available through our API:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Example 1 */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Roboto</h4>
              <div className="bg-muted rounded p-3 mb-3">
                <Image
                  src="/svg/roboto.svg"
                  alt="Roboto font preview"
                  width={200}
                  height={64}
                  className="w-full h-16 object-contain"
                />
              </div>
              <code className="text-xs text-muted-foreground block">
                /svg/roboto.svg
              </code>
            </div>

            {/* Example 2 */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Open Sans</h4>
              <div className="bg-muted rounded p-3 mb-3">
                <Image
                  src="/svg/opensans.svg"
                  alt="Open Sans font preview"
                  width={200}
                  height={64}
                  className="w-full h-16 object-contain"
                />
              </div>
              <code className="text-xs text-muted-foreground block">
                /svg/opensans.svg
              </code>
            </div>

            {/* Example 3 */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Lato</h4>
              <div className="bg-muted rounded p-3 mb-3">
                <Image
                  src="/svg/lato.svg"
                  alt="Lato font preview"
                  width={200}
                  height={64}
                  className="w-full h-16 object-contain"
                />
              </div>
              <code className="text-xs text-muted-foreground block">
                /svg/lato.svg
              </code>
            </div>

            {/* Example 4 */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Poppins</h4>
              <div className="bg-muted rounded p-3 mb-3">
                <Image
                  src="/svg/poppins.svg"
                  alt="Poppins font preview"
                  width={200}
                  height={64}
                  className="w-full h-16 object-contain"
                />
              </div>
              <code className="text-xs text-muted-foreground block">
                /svg/poppins.svg
              </code>
            </div>

            {/* Example 5 */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Inter</h4>
              <div className="bg-muted rounded p-3 mb-3">
                <Image
                  src="/svg/inter.svg"
                  alt="Inter font preview"
                  width={200}
                  height={64}
                  className="w-full h-16 object-contain"
                />
              </div>
              <code className="text-xs text-muted-foreground block">
                /svg/inter.svg
              </code>
            </div>

            {/* Example 6 */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Montserrat</h4>
              <div className="bg-muted rounded p-3 mb-3">
                <Image
                  src="/svg/montserrat.svg"
                  alt="Montserrat font preview"
                  width={200}
                  height={64}
                  className="w-full h-16 object-contain"
                />
              </div>
              <code className="text-xs text-muted-foreground block">
                /svg/montserrat.svg
              </code>
            </div>
          </div>
        </div>

        {/* Apple Color Emoji PNG Files */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">
            Apple Color Emoji PNG Files
          </h2>
          <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
            We serve Apple Color Emoji PNG files for Linux compatibility. These
            are high-quality emoji images that can be used in applications
            requiring consistent emoji rendering across platforms.
          </p>

          <div className="bg-accent border border-accent-foreground/20 rounded-md p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="text-sm font-medium text-accent-foreground mb-2">
              Important Notice
            </h3>
            <p className="text-xs sm:text-sm text-accent-foreground/80">
              We do not serve AppleColorEmoji.ttf font files as they are
              proprietary and protected by Apple&apos;s EULA. We respect
              Apple&apos;s intellectual property rights and only provide the
              open-source PNG implementation for Linux compatibility.
            </p>
          </div>

          <h3 className="text-base sm:text-lg font-medium text-foreground mb-3 sm:mb-4">
            Access Pattern
          </h3>
          <p className="text-muted-foreground mb-3 text-sm sm:text-base">
            Access emoji PNG files using the following URL pattern:
          </p>

          <div className="bg-muted rounded-md p-3 sm:p-4 mb-4 sm:mb-6">
            <code className="text-xs sm:text-sm text-foreground break-all">
              https://fonts.grida.co/apple/emoji/160/[unicode].png
            </code>
          </div>

          <h3 className="text-base sm:text-lg font-medium text-foreground mb-3 sm:mb-4">
            Examples
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Example 1 */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">
                Copyright Symbol
              </h4>
              <div className="bg-muted rounded p-3 mb-3 flex items-center justify-center">
                <Image
                  src="/apple/emoji/160/00a9.png"
                  alt="Copyright emoji"
                  width={64}
                  height={64}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <code className="text-xs text-muted-foreground block">
                /apple/emoji/160/00a9.png
              </code>
            </div>

            {/* Example 2 */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Heart Symbol</h4>
              <div className="bg-muted rounded p-3 mb-3 flex items-center justify-center">
                <Image
                  src="/apple/emoji/160/2764.png"
                  alt="Heart emoji"
                  width={64}
                  height={64}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <code className="text-xs text-muted-foreground block">
                /apple/emoji/160/2764.png
              </code>
            </div>

            {/* Example 3 */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Smile Face</h4>
              <div className="bg-muted rounded p-3 mb-3 flex items-center justify-center">
                <Image
                  src="/apple/emoji/160/1f642.png"
                  alt="Smile emoji"
                  width={64}
                  height={64}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <code className="text-xs text-muted-foreground block">
                /apple/emoji/160/1f642.png
              </code>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">
              Usage in CSS
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              You can use these emoji PNG files in your CSS for consistent emoji
              rendering:
            </p>
            <div className="bg-background rounded p-3">
              <code className="text-xs text-foreground">
                .emoji-heart {"{"} background-image:
                url(&apos;https://fonts.grida.co/apple/emoji/160/2764.png&apos;);{" "}
                {"}"}
              </code>
            </div>
          </div>
        </div>

        {/* Usage Policies */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">
            Usage Policies
          </h2>

          <div className="bg-accent border border-accent-foreground/20 rounded-md p-4">
            <ul className="text-sm text-accent-foreground space-y-2">
              <li>• No authentication required</li>
              <li>• Commercial use allowed</li>
              <li>• Attribution appreciated but not required</li>
              <li>• Free to use for all applications</li>
            </ul>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">
            Technical Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-3">
                CORS Headers
              </h3>
              <p className="text-muted-foreground mb-3 text-sm sm:text-base">
                All files are served with CORS headers enabled for cross-origin
                requests:
              </p>
              <div className="bg-muted rounded-md p-3 text-xs sm:text-sm">
                <div>Access-Control-Allow-Origin: *</div>
                <div>Access-Control-Allow-Methods: GET, OPTIONS</div>
                <div>Access-Control-Allow-Headers: Content-Type</div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-3">
                Caching
              </h3>
              <p className="text-muted-foreground mb-3 text-sm sm:text-base">
                Files are cached for optimal performance:
              </p>
              <div className="bg-muted rounded-md p-3 text-xs sm:text-sm">
                <div>Cache-Control: public, max-age=31536000, immutable</div>
                <div>Content-Type: image/svg+xml; charset=utf-8</div>
                <div>ETag: Strong validation</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                API
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="/webfonts.json"
                    className="hover:text-foreground transition-colors"
                  >
                    Fonts Metadata
                  </a>
                </li>
                <li>
                  <a
                    href="/webfonts-vf.json"
                    className="hover:text-foreground transition-colors"
                  >
                    Variable Fonts
                  </a>
                </li>
                <li>
                  <a
                    href="/svg/roboto.svg"
                    className="hover:text-foreground transition-colors"
                  >
                    SVG Examples
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Resources
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://github.com/gridaco/fonts"
                    className="hover:text-foreground transition-colors"
                  >
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a
                    href="https://fonts.google.com"
                    className="hover:text-foreground transition-colors"
                  >
                    Google Fonts
                  </a>
                </li>
                <li>
                  <a
                    href="https://developers.google.com/fonts"
                    className="hover:text-foreground transition-colors"
                  >
                    Google Fonts API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Support
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://github.com/gridaco/fonts/issues"
                    className="hover:text-foreground transition-colors"
                  >
                    Report Issues
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/gridaco/fonts/discussions"
                    className="hover:text-foreground transition-colors"
                  >
                    Discussions
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@grida.co"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} fonts.grida.co - Google Fonts
              API with SVG Previews & Emoji Assets
            </p>
            <p className="text-xs mt-1">
              Powered by Google Fonts data • CORS-enabled • Free to use
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
