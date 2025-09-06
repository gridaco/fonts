"use client";

import { createContext, useContext, ReactNode } from "react";
import { Font } from "@/types";

interface FontListContextType {
  initialFonts: Font[];
  initialTotal: number;
  initialFontlistCount: number;
}

const FontListContext = createContext<FontListContextType | undefined>(undefined);

interface FontListProviderProps {
  children: ReactNode;
  initialFonts: Font[];
  initialTotal: number;
  initialFontlistCount: number;
}

export function FontListProvider({
  children,
  initialFonts,
  initialTotal,
  initialFontlistCount,
}: FontListProviderProps) {
  return (
    <FontListContext.Provider
      value={{
        initialFonts,
        initialTotal,
        initialFontlistCount,
      }}
    >
      {children}
    </FontListContext.Provider>
  );
}

export function useFontListContext() {
  const context = useContext(FontListContext);
  if (context === undefined) {
    throw new Error("useFontListContext must be used within a FontListProvider");
  }
  return context;
}
