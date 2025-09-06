"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { StrictFontPreviewBoundary } from "@/components/strict-font-preview-boundary";
import { Font } from "@/types";
import { FontStyleItem } from "@/components/font-style-item";

interface InteractiveSectionProps {
  font: Font;
}

export function InteractiveSection({ font }: InteractiveSectionProps) {
  const [fontSize, setFontSize] = useState<number>(64);

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
            <FontStyleItem
              key={variant}
              variant={variant}
              font={font}
              fontSize={fontSize}
            />
          ))}
        </div>
      </StrictFontPreviewBoundary>
    </div>
  );
}
