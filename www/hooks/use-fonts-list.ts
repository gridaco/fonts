import { useState, useEffect, useCallback } from "react";
import { Font } from "@/types";
import { useFontListContext } from "@/contexts/font-list-context";

interface SearchResponse {
  fonts: Font[];
  total: number;
  fontlist_count: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  query?: string;
  filters: {
    property?: string;
    category?: string;
  };
}

export function useFontsList() {
  const { initialFonts, initialTotal, initialFontlistCount } =
    useFontListContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [allFonts, setAllFonts] = useState<Font[]>(initialFonts);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [total, setTotal] = useState(initialTotal);
  const [fontlist_count, setFontlist_count] = useState(initialFontlistCount);
  const [hasMore, setHasMore] = useState(initialFonts.length < initialTotal);
  const [currentPage, setCurrentPage] = useState(1);

  const loadFonts = useCallback(
    async (page: number = 1, reset: boolean = false) => {
      if (reset) {
        setIsSearching(true);
        setCurrentPage(1);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append("q", searchQuery);
        if (selectedCategory && selectedCategory !== "")
          params.append("category", selectedCategory);
        if (selectedProperty && selectedProperty !== "")
          params.append("property", selectedProperty);
        params.append("page", page.toString());
        params.append("limit", "100");

        const response = await fetch(`/api/search?${params.toString()}`);
        const data: SearchResponse = await response.json();

        if (reset) {
          setAllFonts(data.fonts || []);
        } else {
          setAllFonts((prev) => [...prev, ...(data.fonts || [])]);
        }

        setTotal(data.total);
        setFontlist_count(data.fontlist_count);
        setHasMore(data.hasNextPage);
        setCurrentPage(page);
      } catch (error) {
        console.error("Search error:", error);
        if (reset) {
          setAllFonts([]);
        }
      } finally {
        setIsSearching(false);
        setIsLoadingMore(false);
      }
    },
    [searchQuery, selectedCategory, selectedProperty]
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback(() => {
    loadFonts(1, true);
  }, [loadFonts]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadFonts(currentPage + 1, false);
    }
  }, [loadFonts, currentPage, isLoadingMore, hasMore]);

  // No need to load initial fonts on mount since we have them from context

  // Reset and reload when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadFonts(1, true);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadFonts]);

  const fontsToShow = allFonts;

  return {
    // State
    searchQuery,
    allFonts,
    isSearching,
    isLoadingMore,
    selectedCategory,
    selectedProperty,
    fontsToShow,
    viewMode,
    total,
    fontlist_count,
    hasMore,

    // Actions
    setSearchQuery,
    setSelectedCategory,
    setSelectedProperty,
    setViewMode,
    handleSearch,
    handleFilterChange,
    loadMore,
  };
}
