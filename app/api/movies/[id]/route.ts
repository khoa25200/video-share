import { NextRequest, NextResponse } from "next/server";
import {
  getSheetData,
  getServerConfig,
  applyServerSwitching,
} from "@/lib/google-sheets";

// GET /api/movies/[id] - Lấy chi tiết movie theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "girl";

    if (!id) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 }
      );
    }

    // Lấy dữ liệu từ Google Sheets
    const sheetName = mode === "boy" ? "main_boy" : "main";
    let allData = await getSheetData(sheetName);

    // Apply server switching logic
    const serverConfig = await getServerConfig();
    allData = applyServerSwitching(allData, serverConfig);

    // Tìm movie theo ID
    const movie = allData.find((item: any) => item.id === id);

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error("Error fetching movie - Status: failed");
    return NextResponse.json(
      { error: "Failed to fetch movie" },
      { status: 500 }
    );
  }
}
