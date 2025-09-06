"use client";

import { Font } from "@/types";
import { parseFontVariant } from "@/lib/font-utils";

interface FontStyleItemProps {
  variant: string;
  font: Font;
  fontSize: number;
}

export function FontStyleItem({ variant, font, fontSize }: FontStyleItemProps) {
  return (
    <div className="w-full">
      <div className="text-sm text-muted-foreground mb-3 capitalize">
        {variant}
      </div>
      <div
        contentEditable
        suppressContentEditableWarning={true}
        className="w-full min-h-[200px] border-0 rounded-lg p-0 m-0 font-bold text-foreground bg-background focus:outline-none focus:ring-0 cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
        style={{
          fontFamily: `"${font.family}", sans-serif`,
          fontWeight: parseFontVariant(variant).fontWeight,
          fontStyle: parseFontVariant(variant).fontStyle,
          fontSize: `${fontSize}px`,
        }}
        data-placeholder={`Type text for ${variant} style...`}
        dangerouslySetInnerHTML={{
          __html: "The quick brown fox jumps over the lazy dog",
        }}
      />
    </div>
  );
}
