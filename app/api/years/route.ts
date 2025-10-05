import { NextRequest, NextResponse } from "next/server";
import { getUniqueYears } from "@/lib/google-sheets";

// GET /api/years - Lấy danh sách các year unique
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "girl";

    const sheetName = mode === "boy" ? "main_boy" : "main";
    const years = await getUniqueYears(sheetName);

    return NextResponse.json({
      success: true,
      data: years,
    });
  } catch (error) {
    console.error("Error fetching years - Status: failed");
    return NextResponse.json(
      { error: "Failed to fetch years" },
      { status: 500 }
    );
  }
}
