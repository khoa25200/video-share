import { NextRequest, NextResponse } from "next/server";
import { getSheetData, getUniqueTypes } from "@/lib/google-sheets";

// Function to remove Vietnamese diacritics
function removeVietnameseDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

// GET /api/movies - Lấy danh sách movies với pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const series = searchParams.get("series");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const year = searchParams.get("year");
    const country = searchParams.get("country");

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Lấy dữ liệu từ Google Sheets hoặc fallback về mock data
    let allData;
    try {
      allData = await getSheetData();
      console.log("Movies data fetched - Status: success");
    } catch (error) {
      console.log("Movies data fetch failed - Status: error");
      console.warn("Google Sheets API failed, using mock data:", error);
      // Fallback về mock data nếu Google Sheets không hoạt động
      allData = [
        {
          id: "1",
          title: "Thèm Muốn",
          originalTitle: "ABO Desire 垂涎",
          country: "Trung Quốc",
          category: "Tình Cảm",
          year: "2025",
          episodes: "16",
          duration: "45 phút",
          status: "Tập 13/14",
          actors: "Hoàng Tín, Khâu Định Kiệt, Lý Bồi Ân, Giang Hằng",
          description: "Chủ tịch tập đoàn Thịnh Thiếu Du...",
          iframe:
            '<iframe src="https://anonvideo.net/embed/WdxULB" ... ></iframe>',
          thumbnail:
            "https://images.unsplash.com/photo-1489599804341-0a4b0b0b0b0b?w=400&h=600&fit=crop",
        },
        {
          id: "2",
          title: "Thịnh Thế",
          originalTitle: "",
          country: "Trung Quốc",
          category: "Tình Cảm",
          year: "2025",
          episodes: "30",
          duration: "45 phút",
          status: "END",
          actors: "N/A",
          description: "...",
          iframe:
            '<iframe src="https://anonvideo.net/embed/WdxULB" ... ></iframe>',
          thumbnail:
            "https://images.unsplash.com/photo-1489599804341-0a4b0b0b0b0b?w=400&h=600&fit=crop",
        },
        {
          id: "3",
          title: "Con Trai Út Nhà Tướng Quân",
          originalTitle: "",
          country: "Trung Quốc",
          category: "Cổ Trang",
          year: "2025",
          episodes: "24",
          duration: "45 phút",
          status: "END",
          actors: "N/A",
          description: "...",
          iframe:
            '<iframe src="https://anonvideo.net/embed/WdxULB" ... ></iframe>',
          thumbnail:
            "https://images.unsplash.com/photo-1489599804341-0a4b0b0b0b0b?w=400&h=600&fit=crop",
        },
      ];
    }

    // Apply filters
    if (search) {
      const searchTerm = removeVietnameseDiacritics(search);
      allData = allData.filter(
        (movie: any) =>
          removeVietnameseDiacritics(movie.title).includes(searchTerm) ||
          removeVietnameseDiacritics(movie.originalTitle || "").includes(
            searchTerm
          ) ||
          removeVietnameseDiacritics(movie.actors || "").includes(searchTerm) ||
          removeVietnameseDiacritics(movie.description || "").includes(
            searchTerm
          )
      );
    }

    if (category) {
      const categoryTerm = removeVietnameseDiacritics(category);
      allData = allData.filter((movie: any) =>
        removeVietnameseDiacritics(movie.type || "").includes(categoryTerm)
      );
    }

    if (year) {
      allData = allData.filter((movie: any) => movie.year === year);
    }

    if (country) {
      const countryTerm = removeVietnameseDiacritics(country);
      allData = allData.filter((movie: any) =>
        removeVietnameseDiacritics(movie.country || "").includes(countryTerm)
      );
    }

    // Filter by series if specified
    if (series) {
      allData = allData.filter((movie: any) => movie.series === series);
    } else {
      // For main movies list, only show episode 1 of each series
      const seriesMap = new Map();
      allData = allData.filter((movie: any) => {
        if (!movie.series) {
          // Keep movies without series
          return true;
        }

        const seriesKey = movie.series;
        const episodeNum = parseInt(movie.episode || "0");

        if (!seriesMap.has(seriesKey) || episodeNum === 1) {
          seriesMap.set(seriesKey, movie);
          return episodeNum === 1; // Only keep episode 1
        }

        return false;
      });
    }

    // Tính toán pagination
    const total = allData.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = allData.slice(startIndex, endIndex);

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
      data,
    });
  } catch (error) {
    console.error("Error fetching movies - Status: failed");
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}
