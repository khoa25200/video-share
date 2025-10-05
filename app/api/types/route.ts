import { NextRequest, NextResponse } from "next/server";
import { getUniqueTypes } from "@/lib/google-sheets";

// GET /api/types - Lấy danh sách các type unique
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "girl";

    const sheetName = mode === "boy" ? "main_boy" : "main";
    const types = await getUniqueTypes(sheetName);

    return NextResponse.json({
      success: true,
      data: types,
    });
  } catch (error) {
    console.error("Error fetching types - Status: failed");
    return NextResponse.json(
      { error: "Failed to fetch types" },
      { status: 500 }
    );
  }
}
