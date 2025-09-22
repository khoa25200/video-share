import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasGoogleSheetId: !!process.env.GOOGLE_SHEET_ID,
    hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
    hasGoogleSheetName: !!process.env.GOOGLE_SHEET_NAME,
    googleSheetId: process.env.GOOGLE_SHEET_ID ? "Set" : "Not set",
    googleApiKey: process.env.GOOGLE_API_KEY ? "Set" : "Not set",
    googleSheetName: process.env.GOOGLE_SHEET_NAME || "Not set",
    timestamp: new Date().toISOString(),
  });
}
