import { NextRequest, NextResponse } from "next/server";
import { getUniqueCountries } from "@/lib/google-sheets";

// GET /api/countries - Lấy danh sách các country unique
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "girl";

    const sheetName = mode === "boy" ? "main_boy" : "main";
    const countries = await getUniqueCountries(sheetName);

    return NextResponse.json({
      success: true,
      data: countries,
    });
  } catch (error) {
    console.error("Error fetching countries - Status: failed");
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
