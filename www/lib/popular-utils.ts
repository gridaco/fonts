import statsData from "@/app/api/popular/stats.json";

export interface FontStats {
  family: string;
  rate: number;
  total_views: number;
  year_views: number;
  year_change: number;
}

/**
 * Get the raw popular fonts statistics data.
 *
 * @returns Array of font statistics
 */
export function getPopularStats(): FontStats[] {
  return statsData as FontStats[];
}

/**
 * Get a map of font family names to their popularity rank.
 * Lower rank = more popular (rank 1 is most popular).
 * Fonts not in the popular list will not be in the map (use ?? Infinity when getting).
 *
 * @returns Map where key is font family name (lowercase) and value is rank (1-indexed)
 */
export function getPopularRankMap(): Map<string, number> {
  const stats = getPopularStats();
  const rankMap = new Map<string, number>();

  // Sort stats by rate (descending) to ensure correct ranking
  // Then create rank map where index + 1 = rank (rank 1 is most popular)
  const sortedStats = [...stats].sort((a, b) => (b.rate || 0) - (a.rate || 0));
  sortedStats.forEach((stat, index) => {
    rankMap.set(stat.family.toLowerCase(), index + 1);
  });

  return rankMap;
}

