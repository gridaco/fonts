# Search Fonts API

API endpoint for searching and filtering Google Fonts with support for sorting, filtering by category and property, and pagination.

## Base URL

```
https://fonts.grida.co/api/search
```

## Endpoint

### GET /api/search

Returns a paginated list of fonts matching the search criteria.

#### Query Parameters

- `q` (optional) - Search query string. Searches in font family name, category, and variants
- `category` (optional) - Filter by font category. Options:
  - `sans-serif`
  - `serif`
  - `display`
  - `monospace`
- `property` (optional) - Filter by font property. Options:
  - `variable` - Variable fonts only
  - `static` - Static fonts only
- `sort` (optional, default: `popular`) - Sort order. Options:
  - `popular` - Sort by popularity (default)
  - `alphabetical` - Sort alphabetically by family name
- `page` (optional, default: `1`) - Page number for pagination
- `limit` (optional, default: `100`) - Number of fonts per page (max 1000)

#### Response

```json
{
  "fonts": [
    {
      "family": "Roboto",
      "variants": ["300", "400", "500", "700"],
      "subsets": ["latin", "latin-ext", "cyrillic"],
      "version": "v30",
      "lastModified": "2023-05-02",
      "files": {
        "300": "https://fonts.gstatic.com/s/roboto/v30/...",
        "400": "https://fonts.gstatic.com/s/roboto/v30/..."
      },
      "category": "sans-serif",
      "kind": "webfonts#webfont",
      "axes": [
        {
          "tag": "wght",
          "start": 100,
          "end": 900
        }
      ]
    }
  ],
  "total": 150,
  "fontlist_count": 1885,
  "page": 1,
  "limit": 100,
  "totalPages": 2,
  "hasNextPage": true,
  "hasPreviousPage": false,
  "query": "roboto",
  "sort": "popular",
  "filters": {
    "category": "sans-serif",
    "property": "variable"
  }
}
```

#### Response Fields

- `fonts` - Array of font objects matching the search criteria
- `total` - Total number of fonts matching the filters (after filtering, before pagination)
- `fontlist_count` - Total number of fonts in the entire catalog (1885)
- `page` - Current page number
- `limit` - Number of fonts per page
- `totalPages` - Total number of pages available
- `hasNextPage` - Boolean indicating if there are more pages
- `hasPreviousPage` - Boolean indicating if there are previous pages
- `query` - The search query string (if provided)
- `sort` - The sort method used (`popular` or `alphabetical`)
- `filters` - Object containing the applied filters (`category`, `property`)

#### Examples

```bash
# Search for fonts by name
curl "https://fonts.grida.co/api/search?q=roboto"

# Filter by category and sort by popularity (default)
curl "https://fonts.grida.co/api/search?category=sans-serif&sort=popular"

# Get variable fonts only, sorted alphabetically
curl "https://fonts.grida.co/api/search?property=variable&sort=alphabetical"

# Combine filters and pagination
curl "https://fonts.grida.co/api/search?category=serif&property=variable&page=2&limit=50"

# Complex search with all parameters
curl "https://fonts.grida.co/api/search?q=display&category=display&property=variable&sort=popular&page=1&limit=20"
```

#### Search Behavior

The search query (`q` parameter) searches across:

- Font family name (case-insensitive)
- Font category (case-insensitive)
- Font variants (case-insensitive)

Multiple filters can be combined using `&`:

- Search query + category filter
- Category + property filters
- All filters together
