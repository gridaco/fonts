import { NextRequest, NextResponse } from "next/server";
import { getPopularStats } from "@/lib/popular-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.max(
      1,
      Math.min(1000, parseInt(searchParams.get("limit") || "100") || 100)
    );
    const sortByParam = searchParams.get("sortBy") || "rate";

    // Validate sortBy parameter
    const validSortFields = ["total_views", "rate", "year_views"] as const;
    const sortBy = validSortFields.includes(
      sortByParam as (typeof validSortFields)[number]
    )
      ? (sortByParam as (typeof validSortFields)[number])
      : "rate";

    const fontsData = getPopularStats();

    // Sort by the requested field (default: rate, descending)
    const sortedStats = [...fontsData].sort((a, b) => {
      const aValue = a[sortBy] as number;
      const bValue = b[sortBy] as number;
      return (bValue || 0) - (aValue || 0);
    });

    // Apply limit
    const limitedStats = sortedStats.slice(0, limit);

    return NextResponse.json({
      fonts: limitedStats,
      total: fontsData.length,
      limit,
      sortBy,
    });
  } catch (error) {
    console.error("Popular fonts API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular fonts" },
      { status: 500 }
    );
  }
}
