import { cn } from "@/lib/utils";

interface StrictFontPreviewBoundaryProps {
  children: React.ReactNode;
  className?: string;
}

export const StrictFontPreviewBoundary = ({
  children,
  className,
}: StrictFontPreviewBoundaryProps) => {
  return (
    <div
      className={cn("font-synthesis-none", className)}
      style={{ fontSynthesis: "none" }}
    >
      {children}
    </div>
  );
};
