/**
 * Font ID utilities for converting between family names and IDs
 */

/**
 * Converts a font family name to a URL-safe ID
 * @param familyName - The font family name (e.g., "Roboto", "Open Sans")
 * @returns URL-safe ID (e.g., "roboto", "open-sans")
 */
export function familyToId(familyName: string): string {
  return familyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, " ") // Replace special chars with spaces
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
}

/**
 * Converts a font ID back to a family name
 * @param id - The font ID (e.g., "roboto", "open-sans")
 * @returns Family name (e.g., "Roboto", "Open Sans")
 */
export function idToFamily(id: string): string {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
