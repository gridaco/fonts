"use client";

import { useEffect, useRef } from "react";
import { Font } from "@/types";
import { FontItem } from "./font-item";
import { familyToId } from "@/lib/fontid";
import Link from "next/link";

interface InfiniteFontListProps {
  fonts: Font[];
  hasNextPage: boolean;
  loadNextPage: () => void;
  viewMode: "list" | "grid";
}

export function InfiniteFontList({
  fonts,
  hasNextPage,
  loadNextPage,
  viewMode,
}: InfiniteFontListProps) {
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasNextPage || !loadingRef.current) return;

      const rect = loadingRef.current.getBoundingClientRect();
      const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;

      if (isVisible) {
        loadNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, loadNextPage]);

  return (
    <div
      data-view-mode={viewMode}
      className="data-[view-mode=list]:space-y-4 data-[view-mode=grid]:grid data-[view-mode=grid]:grid-cols-1 data-[view-mode=grid]:sm:grid-cols-2 data-[view-mode=grid]:lg:grid-cols-3 data-[view-mode=grid]:xl:grid-cols-4 data-[view-mode=grid]:gap-6"
    >
      {fonts.map((font) => {
        const fontId = familyToId(font.family);
        return (
          <Link key={font.family} href={`/${fontId}`}>
            <FontItem font={font} viewMode={viewMode} />
          </Link>
        );
      })}
      {hasNextPage && (
        <div
          ref={loadingRef}
          className="flex items-center justify-center py-4 col-span-full"
        >
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      )}
    </div>
  );
}
