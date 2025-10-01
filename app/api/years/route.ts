import { NextResponse } from "next/server";
import { getUniqueYears } from "@/lib/google-sheets";

// GET /api/years - Lấy danh sách các year unique
export async function GET() {
  try {
    const years = await getUniqueYears();

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
