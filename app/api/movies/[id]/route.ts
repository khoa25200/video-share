import { NextRequest, NextResponse } from "next/server";
import { getSheetData } from "@/lib/google-sheets";

// GET /api/movies/[id] - Lấy chi tiết movie theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 }
      );
    }

    // Lấy dữ liệu từ Google Sheets
    const allData = await getSheetData();

    // Tìm movie theo ID
    const movie = allData.find((item: any) => item.id === id);

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error("Error fetching movie:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie" },
      { status: 500 }
    );
  }
}
