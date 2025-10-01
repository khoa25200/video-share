import { NextResponse } from "next/server";
import { getUniqueTypes } from "@/lib/google-sheets";

// GET /api/types - Lấy danh sách các type unique
export async function GET() {
  try {
    const types = await getUniqueTypes();

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
