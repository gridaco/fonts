import { useState } from "react";
import { Font } from "@/types";

const defaultFonts: Font[] = [
  {
    family: "Roboto",
    category: "sans-serif",
    variants: ["300", "400", "500", "700"],
    subsets: ["latin"],
    version: "v1",
    lastModified: "2025-01-01",
    files: { "300": "url", "400": "url", "500": "url", "700": "url" },
    kind: "webfonts#webfont",
    menu: "url",
    axes: [{ tag: "wght", start: 100, end: 900 }], // Variable font
  },
  {
    family: "Open Sans",
    category: "sans-serif",
    variants: ["300", "400", "600", "700"],
    subsets: ["latin"],
    version: "v1",
    lastModified: "2025-01-01",
    files: { "300": "url", "400": "url", "600": "url", "700": "url" },
    kind: "webfonts#webfont",
    menu: "url",
    axes: [{ tag: "wght", start: 100, end: 900 }], // Variable font
  },
  {
    family: "Lato",
    category: "sans-serif",
    variants: ["300", "400", "700", "900"],
    subsets: ["latin"],
    version: "v1",
    lastModified: "2025-01-01",
    files: { "300": "url", "400": "url", "700": "url", "900": "url" },
    kind: "webfonts#webfont",
    menu: "url",
    axes: [{ tag: "wght", start: 100, end: 900 }], // Variable font
  },
  {
    family: "Poppins",
    category: "sans-serif",
    variants: ["300", "400", "500", "600", "700"],
    subsets: ["latin"],
    version: "v1",
    lastModified: "2025-01-01",
    files: {
      "300": "url",
      "400": "url",
      "500": "url",
      "600": "url",
      "700": "url",
    },
    kind: "webfonts#webfont",
    menu: "url",
    axes: [{ tag: "wght", start: 100, end: 900 }], // Variable font
  },
  {
    family: "Inter",
    category: "sans-serif",
    variants: ["400", "500", "600", "700"],
    subsets: ["latin"],
    version: "v1",
    lastModified: "2025-01-01",
    files: { "400": "url", "500": "url", "600": "url", "700": "url" },
    kind: "webfonts#webfont",
    menu: "url",
    axes: [{ tag: "wght", start: 100, end: 900 }], // Variable font
  },
  {
    family: "Montserrat",
    category: "sans-serif",
    variants: ["300", "400", "500", "600", "700"],
    subsets: ["latin"],
    version: "v1",
    lastModified: "2025-01-01",
    files: {
      "300": "url",
      "400": "url",
      "500": "url",
      "600": "url",
      "700": "url",
    },
    kind: "webfonts#webfont",
    menu: "url",
    axes: [{ tag: "wght", start: 100, end: 900 }], // Variable font
  },
];

export function useFontsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Font[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Default fonts to show when not searching

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim() && !selectedCategory && !selectedProperty) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append("q", query);
      if (selectedCategory && selectedCategory !== "")
        params.append("category", selectedCategory);
      if (selectedProperty && selectedProperty !== "")
        params.append("property", selectedProperty);

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();
      setSearchResults(data.fonts || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = () => {
    handleSearch(searchQuery);
  };

  const fontsToShow = showSearchResults ? searchResults : defaultFonts;

  return {
    // State
    searchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    selectedCategory,
    selectedProperty,
    defaultFonts,
    fontsToShow,
    viewMode,

    // Actions
    setSearchQuery,
    setSelectedCategory,
    setSelectedProperty,
    setViewMode,
    handleSearch,
    handleFilterChange,
  };
}
