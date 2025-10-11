import { NextRequest, NextResponse } from "next/server";
import {
  getHighlightData,
  getServerConfig,
  applyServerSwitching,
} from "@/lib/google-sheets";

// GET /api/highlights - Lấy danh sách phim nổi bật
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "girl";

    // Lấy dữ liệu từ Google Sheets highlight sheet
    let allData;
    try {
      const sheetName = mode === "boy" ? "hight_light_boy" : "hight_light";
      allData = await getHighlightData(sheetName);

      // Apply server switching logic
      const serverConfig = await getServerConfig();
      allData = applyServerSwitching(allData, serverConfig);

      console.log("Highlights data fetched - Status: success");
    } catch (error) {
      console.log("Highlights data fetch failed - Status: error");
      console.warn(
        "Google Sheets highlight API failed, using mock data:",
        error
      );
      // Fallback về mock data nếu Google Sheets không hoạt động
      allData = [
        {
          id: "h1",
          title: "Phim Nổi Bật 1",
          originalTitle: "Highlight Movie 1",
          country: "Trung Quốc",
          category: "Tình Cảm",
          year: "2025",
          episodes: "16",
          duration: "45 phút",
          status: "END",
          actors: "Diễn viên nổi bật",
          description: "Phim nổi bật với cốt truyện hấp dẫn...",
          iframe:
            '<iframe src="https://anonvideo.net/embed/highlight1" width="100%" height="400" frameborder="0" allowfullscreen></iframe>',
          thumbnail:
            "https://images.unsplash.com/photo-1489599804341-0a4b0b0b0b0b?w=400&h=600&fit=crop",
        },
        {
          id: "h2",
          title: "Phim Nổi Bật 2",
          originalTitle: "Highlight Movie 2",
          country: "Hàn Quốc",
          category: "Hài Hước",
          year: "2025",
          episodes: "12",
          duration: "30 phút",
          status: "END",
          actors: "Diễn viên nổi bật",
          description: "Phim hài nổi bật với nhiều tình tiết thú vị...",
          iframe:
            '<iframe src="https://anonvideo.net/embed/highlight2" width="100%" height="400" frameborder="0" allowfullscreen></iframe>',
          thumbnail:
            "https://images.unsplash.com/photo-1489599804341-0a4b0b0b0b0b?w=400&h=600&fit=crop",
        },
      ];
    }

    return NextResponse.json({
      data: allData,
      total: allData.length,
    });
  } catch (error) {
    console.error("Error fetching highlights - Status: failed");
    return NextResponse.json(
      { error: "Failed to fetch highlights" },
      { status: 500 }
    );
  }
}
