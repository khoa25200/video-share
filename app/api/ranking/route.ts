import { NextRequest, NextResponse } from "next/server";
import { getTopRankingMovies } from "@/lib/google-sheets";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "girl";

    const sheetName = mode === "boy" ? "main_boy" : "main";
    const topMovies = await getTopRankingMovies(sheetName);

    return NextResponse.json({
      success: true,
      data: topMovies,
      total: topMovies.length,
    });
  } catch (error) {
    console.error("Error fetching top ranking movies - Status: failed");
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch top ranking movies",
        data: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
