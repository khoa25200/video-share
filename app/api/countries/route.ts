import { NextResponse } from "next/server";
import { getUniqueCountries } from "@/lib/google-sheets";

// GET /api/countries - Lấy danh sách các country unique
export async function GET() {
  try {
    const countries = await getUniqueCountries();

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
