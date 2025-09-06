"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { StrictFontPreviewBoundary } from "@/components/strict-font-preview-boundary";
import { Font } from "@/types";
import { parseFontVariant } from "@/lib/font-utils";

interface InteractiveSectionProps {
  font: Font;
}

export function InteractiveSection({ font }: InteractiveSectionProps) {
  const [styleTexts, setStyleTexts] = useState<Record<string, string>>({});
  const [fontSize, setFontSize] = useState<number>(64);

  const handleStyleTextChange = (style: string, text: string) => {
    setStyleTexts((prev) => ({
      ...prev,
      [style]: text,
    }));
  };

  const handleContentEditableChange = (
    style: string,
    event: React.FormEvent<HTMLDivElement>
  ) => {
    const text = event.currentTarget.textContent || "";
    handleStyleTextChange(style, text);
  };

  const getStyleText = (style: string) => {
    return styleTexts[style] || "The quick brown fox jumps over the lazy dog";
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Try Each Style</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Font Size: {fontSize}px
          </span>
          <div className="w-32">
            <Slider
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              min={8}
              max={144}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <StrictFontPreviewBoundary>
        <div className="space-y-6">
          {(font.static?.variants || font.variants).map((variant) => (
            <div key={variant} className="w-full">
              <div className="text-sm text-muted-foreground mb-3 capitalize">
                {variant}
              </div>
              <div
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) => handleContentEditableChange(variant, e)}
                className="w-full min-h-[200px] border-0 rounded-lg p-0 m-0 font-bold text-foreground bg-background focus:outline-none focus:ring-0 cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
                style={{
                  fontFamily: `"${font.family}", sans-serif`,
                  fontWeight: parseFontVariant(variant).fontWeight,
                  fontStyle: parseFontVariant(variant).fontStyle,
                  fontSize: `${fontSize}px`,
                }}
                data-placeholder={`Type text for ${variant} style...`}
              >
                {getStyleText(variant)}
              </div>
            </div>
          ))}
        </div>
      </StrictFontPreviewBoundary>
    </div>
  );
}
