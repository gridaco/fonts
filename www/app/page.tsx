"use client";

import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { useFontsList } from "@/hooks/use-fonts-list";
import { ListBulletIcon, GridIcon } from "@radix-ui/react-icons";
import { familyToId } from "@/lib/fontid";

export default function Home() {
  const {
    searchQuery,
    isSearching,
    selectedCategory,
    selectedProperty,
    fontsToShow,
    viewMode,
    setSelectedCategory,
    setSelectedProperty,
    setViewMode,
    handleSearch,
    handleFilterChange,
  } = useFontsList();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <Input
                type="text"
                placeholder="Search fonts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex gap-3">
              <Select
                value={selectedCategory || undefined}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans-serif">Sans Serif</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="display">Display</SelectItem>
                  <SelectItem value="monospace">Monospace</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedProperty || undefined}
                onValueChange={(value) => {
                  setSelectedProperty(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="variable">Variable</SelectItem>
                  <SelectItem value="static">Static</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Font Count and View Options */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-muted-foreground">
              {fontsToShow.length} fonts
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <ListBulletIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                title="Grid view"
              >
                <GridIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Font Display */}
        {fontsToShow.length === 0 && !isSearching ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No fonts found</p>
          </div>
        ) : viewMode === "list" ? (
          /* List View */
          <div className="space-y-4">
            {fontsToShow.map((font) => {
              const fontId = familyToId(font.family);
              return (
                <Link
                  key={font.family}
                  href={`/${fontId}`}
                  className="block border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-4">
                        <Image
                          src={`/svg/${font.family
                            .toLowerCase()
                            .replace(/\s+/g, "")}.svg`}
                          alt={`${font.family} font preview`}
                          width={300}
                          height={80}
                          className="h-20 object-contain object-left"
                        />
                      </div>
                      <div className="mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {font.family}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {font.category}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{font.variants.length} styles</span>
                        <span>
                          {font.axes && Object.keys(font.axes).length > 0
                            ? "Variable"
                            : "Static"}
                        </span>
                        <span>Open Source</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fontsToShow.map((font) => {
              const fontId = familyToId(font.family);
              return (
                <Link
                  key={font.family}
                  href={`/${fontId}`}
                  className="block border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="mb-3">
                    <Image
                      src={`/svg/${font.family
                        .toLowerCase()
                        .replace(/\s+/g, "")}.svg`}
                      alt={`${font.family} font preview`}
                      width={200}
                      height={60}
                      className="h-16 object-contain object-left w-full"
                    />
                  </div>
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {font.family}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 capitalize">
                    {font.category}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{font.variants.length} styles</span>
                    <span>•</span>
                    <span>
                      {font.axes && Object.keys(font.axes).length > 0
                        ? "Variable"
                        : "Static"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
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
