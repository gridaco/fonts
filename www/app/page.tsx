import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                fonts.grida.co
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Google Fonts Index & SVG Previews
              </p>
            </div>
            <div className="text-left sm:text-right flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Powered by Google Fonts
              </p>
              <a
                href="https://github.com/gridaco/fonts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Introduction */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">
            Welcome to fonts.grida.co
          </h2>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">
            This is an indexed list of Google Fonts with SVG previews. We
            provide fast, reliable access to font metadata and visual previews
            for web developers and designers. The actual font files are served
            by Google Fonts CDN.
          </p>
          <div className="bg-accent border border-accent-foreground/20 rounded-md p-3 sm:p-4">
            <h3 className="text-sm font-medium text-accent-foreground mb-2">
              Key Features
            </h3>
            <ul className="text-xs sm:text-sm text-accent-foreground/80 space-y-1">
              <li>• CORS-enabled for cross-origin requests</li>
              <li>• Long-term caching for optimal performance</li>
              <li>• SVG previews for all available fonts</li>
              <li>• Complete Google Fonts metadata</li>
            </ul>
          </div>
        </div>

        {/* SVG Examples */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">
            SVG Font Previews
          </h2>
          <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
            Access SVG previews of any font using the following URL pattern:
          </p>

          <div className="bg-muted rounded-md p-3 sm:p-4 mb-4 sm:mb-6">
            <code className="text-xs sm:text-sm text-foreground break-all">
              https://fonts.grida.co/svg/[fontname].svg
            </code>
          </div>

          <h3 className="text-base sm:text-lg font-medium text-foreground mb-3 sm:mb-4">
            Examples
          </h3>

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

        {/* Usage Instructions */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">
            How to Use
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-3">
                1. SVG Previews
              </h3>
              <p className="text-muted-foreground mb-3 text-sm sm:text-base">
                Get SVG previews of fonts for use in your applications:
              </p>
              <div className="bg-muted rounded-md p-3 sm:p-4">
                <code className="text-xs sm:text-sm text-foreground">
                  &lt;img src=&quot;https://fonts.grida.co/svg/roboto.svg&quot;
                  alt=&quot;Roboto preview&quot; /&gt;
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-3">
                2. API Access
              </h3>
              <p className="text-muted-foreground mb-3 text-sm sm:text-base">
                Get font metadata and information:
              </p>
              <div className="space-y-3">
                <div className="bg-muted rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-foreground">
                      https://fonts.grida.co/webfonts.json
                    </code>
                    <a
                      href="/webfonts.json"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-primary/80 underline"
                    >
                      View
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Standard Google Fonts metadata
                  </p>
                </div>
                <div className="bg-muted rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-foreground">
                      https://fonts.grida.co/webfonts-vf.json
                    </code>
                    <a
                      href="/webfonts-vf.json"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-primary/80 underline"
                    >
                      View
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Variable fonts metadata
                  </p>
                </div>
              </div>
            </div>
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
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-3">
                Caching
              </h3>
              <p className="text-muted-foreground mb-3 text-sm sm:text-base">
                SVG files are cached for optimal performance:
              </p>
              <div className="bg-muted rounded-md p-3 text-xs sm:text-sm">
                <div>Cache-Control: public, max-age=31536000, immutable</div>
                <div>Content-Type: image/svg+xml; charset=utf-8</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} fonts.grida.co - Google Fonts
              Index & SVG Previews
            </p>
            <p className="text-sm mt-2">Powered by Google Fonts data</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
