"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Header } from "@/components/header";
import { InfiniteFontList } from "@/components/infinite-font-list";
import { useFontsList } from "@/hooks/use-fonts-list";
import { ListBulletIcon, GridIcon } from "@radix-ui/react-icons";

export default function Home() {
  const {
    searchQuery,
    allFonts,
    isSearching,
    selectedCategory,
    selectedProperty,
    viewMode,
    total,
    fontlist_count,
    hasMore,
    setSelectedCategory,
    setSelectedProperty,
    setViewMode,
    handleSearch,
    handleFilterChange,
    loadMore,
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
                value={selectedCategory || "all"}
                onValueChange={(value) => {
                  setSelectedCategory(value === "all" ? "" : value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="sans-serif">Sans Serif</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="display">Display</SelectItem>
                  <SelectItem value="monospace">Monospace</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedProperty || "all"}
                onValueChange={(value) => {
                  setSelectedProperty(value === "all" ? "" : value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                  <SelectItem value="static">Static</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Font Count and View Options */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-muted-foreground">
              {total === fontlist_count
                ? `${total} fonts`
                : `${total} / ${fontlist_count} fonts`}
            </span>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) =>
                value && setViewMode(value as "list" | "grid")
              }
              size="sm"
            >
              <ToggleGroupItem value="list" title="List view">
                <ListBulletIcon className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" title="Grid view">
                <GridIcon className="w-4 h-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Font Display */}
        {isSearching && allFonts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : allFonts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No fonts found</p>
          </div>
        ) : (
          <InfiniteFontList
            fonts={allFonts}
            hasNextPage={hasMore}
            loadNextPage={loadMore}
            viewMode={viewMode}
          />
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
