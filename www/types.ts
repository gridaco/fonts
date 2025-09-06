// Axis definition for variable fonts
export interface FontAxis {
  tag: string;
  start: number;
  end: number;
}

// Base font structure (common to both webfonts.json and webfonts-vf.json)
export interface BaseFont {
  family: string;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  files: Record<string, string>;
  category: string;
  kind: string;
  menu: string;
}

// Static font from webfonts.json (no axes property)
export type StaticFont = BaseFont;

// Variable font from webfonts-vf.json (includes axes property)
export interface VfFont extends BaseFont {
  axes?: FontAxis[];
}

// Combined font structure used in our application
export interface Font extends VfFont {
  static?: StaticFont | null;
}

// API response structure for font detail endpoint
export interface CombinedFont extends VfFont {
  static: StaticFont | null;
}

// Root structure of both JSON files
export interface WebfontsResponse {
  kind: string;
  items: BaseFont[];
}
