import Link from "next/link";
import { GridaLogo } from "@/components/grida-logo";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export function Header() {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <GridaLogo size={32} />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Fonts
              </h1>
            </Link>
          </div>
          <div className="text-left sm:text-right flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Link
              href="/developers"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Developer
            </Link>
            <a
              href="https://grida.co/library"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Library
            </a>
            <a
              href="https://github.com/gridaco/fonts"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <GitHubLogoIcon className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
