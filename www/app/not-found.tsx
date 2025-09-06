import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-muted-foreground mb-6">Font not found</p>
          <Link href="/">
            <Button variant="outline">Back to Fonts</Button>
          </Link>
        </div>
      </main>
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
