# Font ID Utilities

This module provides utilities for converting between font family names and URL-safe IDs.

## Functions

### `familyToId(familyName: string): string`

Converts a font family name to a URL-safe ID.

**Parameters:**

- `familyName` - The font family name (e.g., "Roboto", "Open Sans")

**Returns:**

- URL-safe ID (e.g., "roboto", "open-sans")

**Examples:**

```typescript
familyToId("Roboto"); // "roboto"
familyToId("Open Sans"); // "open-sans"
familyToId("Source Sans Pro"); // "source-sans-pro"
familyToId("Font@Home"); // "font-home"
familyToId("Test#Font"); // "test-font"
```

### `idToFamily(id: string): string`

Converts a font ID back to a family name.

**Parameters:**

- `id` - The font ID (e.g., "roboto", "open-sans")

**Returns:**

- Family name (e.g., "Roboto", "Open Sans")

**Examples:**

```typescript
idToFamily("roboto"); // "Roboto"
idToFamily("open-sans"); // "Open Sans"
idToFamily("source-sans-pro"); // "Source Sans Pro"
```

## Usage

```typescript
import { familyToId, idToFamily } from "@/lib/fontid";

// Convert family name to ID for URLs
const fontId = familyToId("Open Sans"); // "open-sans"
const url = `/fonts/${fontId}`; // "/fonts/open-sans"

// Convert ID back to family name
const familyName = idToFamily("open-sans"); // "Open Sans"
```

## Implementation Details

### `familyToId` Process:

1. Convert to lowercase
2. Trim whitespace
3. Replace special characters with spaces
4. Replace spaces with dashes
5. Remove leading/trailing dashes

### `idToFamily` Process:

1. Split by dashes
2. Capitalize first letter of each word
3. Join with spaces

## Edge Cases

- **Special Characters**: `"Font@Home"` → `"font-home"`
- **Multiple Spaces**: `"Font   With   Spaces"` → `"font-with-spaces"`
- **Leading/Trailing Spaces**: `"  Font  "` → `"font"`
- **Empty String**: `""` → `""`

## Round-trip Consistency

For most font names, the conversion is consistent:

```typescript
const original = "Open Sans";
const id = familyToId(original); // "open-sans"
const converted = idToFamily(id); // "Open Sans"
expect(converted).toBe(original); // true
```

Special characters may be lost in the conversion:

```typescript
const original = "Font & Friends";
const id = familyToId(original); // "font-friends"
const converted = idToFamily(id); // "Font Friends"
// Note: "&" is removed
```
