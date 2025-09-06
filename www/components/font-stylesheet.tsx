"use client";

import { useEffect } from "react";
import { Font } from "@/types";
import { generateFontFaceCSS } from "@/lib/font-utils";

interface FontStylesheetProps {
  font: Font;
}

export function FontStylesheet({ font }: FontStylesheetProps) {
  useEffect(() => {
    // Generate CSS for this font
    const css = generateFontFaceCSS(font);

    if (!css) {
      return;
    }

    // Create or update the stylesheet
    const styleId = `font-stylesheet-${font.family
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      styleElement.type = "text/css";
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;

    // Cleanup function to remove the stylesheet when component unmounts
    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [font]);

  // This component doesn't render anything
  return null;
}
