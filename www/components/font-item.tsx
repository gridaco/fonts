import Image from "next/image";
import { Font } from "@/types";
import { cn } from "@/lib/utils";

interface FontItemProps {
  font: Font;
  viewMode: "list" | "grid";
  className?: string;
}

export function FontItem({ font, viewMode, className }: FontItemProps) {
  const isList = viewMode === "list";

  return (
    <div
      className={cn(
        "block hover:bg-muted/50 transition-colors",
        isList ? "p-6 flex items-start justify-between" : "p-4",
        className
      )}
    >
      <div className={isList ? "flex-1" : ""}>
        <div className={isList ? "mb-4" : "mb-3"}>
          <Image
            src={`/svg/${font.family.toLowerCase().replace(/\s+/g, "")}.svg`}
            alt={`${font.family} font preview`}
            width={isList ? 300 : 200}
            height={isList ? 80 : 60}
            className={`${
              isList ? "h-20" : "h-16"
            } object-contain object-left ${!isList ? "w-full" : ""}`}
          />
        </div>
        <div className="mb-2">
          <h3
            className={`${
              isList ? "text-lg" : "text-sm"
            } font-semibold text-foreground ${!isList ? "truncate" : ""}`}
          >
            {font.family}
          </h3>
        </div>
        <p
          className={`${
            isList ? "text-sm" : "text-xs"
          } text-muted-foreground mb-2 ${!isList ? "capitalize" : ""}`}
        >
          {font.category}
        </p>
        <div
          className={`flex items-center ${
            isList ? "gap-4" : "gap-2"
          } text-xs text-muted-foreground`}
        >
          <span>{font.variants.length} styles</span>
          {!isList && <span>•</span>}
          <span>
            {font.axes && Object.keys(font.axes).length > 0
              ? "Variable"
              : "Static"}
          </span>
          {isList && <span>Open Source</span>}
        </div>
      </div>
    </div>
  );
}
