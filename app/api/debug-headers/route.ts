import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const headers = Object.fromEntries(request.headers.entries());

  return NextResponse.json({
    headers,
    timestamp: new Date().toISOString(),
  });
}
