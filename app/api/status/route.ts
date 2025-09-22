import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/google-sheets";

export async function GET() {
  try {
    // Thử kết nối với Google Sheets
    const data = await getSheetData();

    return NextResponse.json({
      status: "success",
      message: "Google Sheets API đang hoạt động",
      dataSource: "Google Sheets",
      totalMovies: data.length,
      sampleMovie: data[0] || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Google Sheets API không hoạt động, đang sử dụng mock data",
      dataSource: "Mock Data",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
