import { google } from "googleapis";

// Interface cho movie data
export interface Movie {
  id: string;
  title: string;
  originalTitle: string;
  country: string;
  category: string;
  type: string; // New type column from Google Sheets
  year: string;
  episodes: string;
  duration: string;
  status: string;
  actors: string;
  description: string;
  iframe: string;
  thumbnail: string;
  mobileThumbnail?: string; // Mobile banner thumbnail
  videoUrl?: string; // Optional video URL for MP4/M3U8 files
  series?: string; // Series name for grouping
  episode?: string; // Episode number within series
  ranking?: string; // Ranking from 1-5 for top movies
}

// Khởi tạo Google Sheets API client
function getGoogleSheetsClient() {
  // Kiểm tra xem có Service Account credentials không
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    // Sử dụng Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    return google.sheets({ version: "v4", auth });
  } else if (
    process.env.GOOGLE_API_KEY ||
    "AIzaSyBUH2ZEZrcknbnPMug_OmMAZaNPeFt4_pk"
  ) {
    // Sử dụng API Key - không cần auth object
    return google.sheets({
      version: "v4",
    });
  } else {
    throw new Error(
      "Either GOOGLE_API_KEY or Service Account credentials must be provided"
    );
  }
}

// Helper function để lấy dữ liệu từ Google Sheets
export async function getSheetData(): Promise<Movie[]> {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId =
      process.env.GOOGLE_SHEET_ID ||
      "1pG-9mMCMq2sVi8-ez15zjcmCwqI4LCyecX-cC5uQb7U";

    if (!spreadsheetId) {
      throw new Error("GOOGLE_SHEET_ID is not defined");
    }

    // Xác định range để lấy dữ liệu
    const sheetName = process.env.GOOGLE_SHEET_NAME || "main";
    const range = `${sheetName}!A:Q`; // Lấy từ cột A đến Q (17 cột) - bao gồm series, episode và ranking

    // Lấy dữ liệu từ sheet
    const requestOptions: any = {
      spreadsheetId,
      range,
    };

    // Thêm API key nếu có
    const apiKey =
      process.env.GOOGLE_API_KEY || "AIzaSyBUH2ZEZrcknbnPMug_OmMAZaNPeFt4_pk";
    if (apiKey) {
      requestOptions.key = apiKey;
    }

    const response = await sheets.spreadsheets.values.get(requestOptions);

    const rows = response.data.values;

    if (!rows || rows.length < 2) {
      return [];
    }

    // Lấy header từ hàng đầu tiên
    const headers = rows[0];

    // Map dữ liệu từ hàng thứ 2 trở đi
    const data = rows.slice(1).map((row) => {
      const movie: any = {};
      headers.forEach((header, index) => {
        // Map header thành key tương ứng với cấu trúc dữ liệu
        const keyMap: { [key: string]: string } = {
          id: "id",
          title: "title",
          originalTitle: "originalTitle",
          country: "country",
          category: "category",
          type: "type",
          year: "year",
          episodes: "episodes",
          duration: "duration",
          status: "status",
          actors: "actors",
          description: "description",
          iframe: "iframe",
          thumbnail: "thumbnail",
          mobileThumbnail: "mobileThumbnail",
          videoUrl: "videoUrl",
          series: "series",
          episode: "episode",
          ranking: "ranking",
        };

        const key = keyMap[header] || header.toLowerCase().replace(/\s+/g, "");
        movie[key] = row[index] || "";
      });
      return movie as Movie;
    });

    // Sắp xếp ngược lại (mới nhất trước) - giả sử dữ liệu được thêm theo thứ tự thời gian
    const sortedData = data.reverse();

    return sortedData;
  } catch (error) {
    console.error("Error fetching sheet data - Status: failed");
    throw error;
  }
}

// Lấy dữ liệu từ sheet highlight
export async function getHighlightData(): Promise<Movie[]> {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId =
      process.env.GOOGLE_SHEET_ID ||
      "1pG-9mMCMq2sVi8-ez15zjcmCwqI4LCyecX-cC5uQb7U";

    if (!spreadsheetId) {
      throw new Error("GOOGLE_SHEET_ID is not defined");
    }

    // Lấy dữ liệu từ sheet highlight
    const range = "hight_light!A:R"; // Updated to include mobileThumbnail column

    const requestOptions: any = {
      spreadsheetId,
      range,
    };

    // Thêm API key nếu có
    const apiKey =
      process.env.GOOGLE_API_KEY || "AIzaSyBUH2ZEZrcknbnPMug_OmMAZaNPeFt4_pk";
    if (apiKey) {
      requestOptions.key = apiKey;
    }

    const response = await sheets.spreadsheets.values.get(requestOptions);

    const rows = response.data.values;

    if (!rows || rows.length < 2) {
      return [];
    }

    // Lấy header từ hàng đầu tiên
    const headers = rows[0];

    // Map dữ liệu từ hàng thứ 2 trở đi
    const data = rows.slice(1).map((row) => {
      const movie: any = {};
      headers.forEach((header, index) => {
        // Map header thành key tương ứng với cấu trúc dữ liệu
        const keyMap: { [key: string]: string } = {
          id: "id",
          title: "title",
          originalTitle: "originalTitle",
          country: "country",
          category: "category",
          type: "type",
          year: "year",
          episodes: "episodes",
          duration: "duration",
          status: "status",
          actors: "actors",
          description: "description",
          iframe: "iframe",
          thumbnail: "thumbnail",
          mobileThumbnail: "mobileThumbnail",
          videoUrl: "videoUrl",
          series: "series",
          episode: "episode",
          ranking: "ranking",
        };

        const key = keyMap[header] || header.toLowerCase().replace(/\s+/g, "");
        movie[key] = row[index] || "";
      });
      return movie as Movie;
    });

    // Sắp xếp ngược lại (mới nhất trước)
    const sortedData = data.reverse();

    return sortedData;
  } catch (error) {
    console.error("Error fetching highlight data - Status: failed");
    throw error;
  }
}

// Lấy top 5 phim theo ranking
export async function getTopRankingMovies(): Promise<Movie[]> {
  try {
    const allMovies = await getSheetData();

    // Lọc phim có ranking từ 1-5 và sắp xếp theo ranking
    const topMovies = allMovies
      .filter((movie) => {
        const ranking = parseInt(movie.ranking || "0");
        return ranking >= 1 && ranking <= 5;
      })
      .sort((a, b) => {
        const rankingA = parseInt(a.ranking || "0");
        const rankingB = parseInt(b.ranking || "0");
        return rankingA - rankingB;
      });

    return topMovies;
  } catch (error) {
    console.error("Error fetching top ranking movies - Status: failed");
    throw error;
  }
}

// Lấy danh sách các type unique từ Google Sheets (tối ưu truy vấn)
export async function getUniqueTypes(): Promise<string[]> {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId =
      process.env.GOOGLE_SHEET_ID ||
      "1pG-9mMCMq2sVi8-ez15zjcmCwqI4LCyecX-cC5uQb7U";

    if (!spreadsheetId) {
      throw new Error("GOOGLE_SHEET_ID is not defined");
    }

    // Lấy chỉ cột type để tối ưu truy vấn
    const sheetName = process.env.GOOGLE_SHEET_NAME || "main";
    const range = `${sheetName}!L:L`; // Cột type là cột L

    const requestOptions: any = {
      spreadsheetId,
      range,
    };

    // Thêm API key nếu có
    const apiKey =
      process.env.GOOGLE_API_KEY || "AIzaSyBUH2ZEZrcknbnPMug_OmMAZaNPeFt4_pk";
    if (apiKey) {
      requestOptions.key = apiKey;
    }

    const response = await sheets.spreadsheets.values.get(requestOptions);
    const rows = response.data.values;

    if (!rows || rows.length < 2) {
      return [];
    }

    // Lấy unique types (bỏ qua header)
    const types = new Set<string>();
    rows.slice(1).forEach((row) => {
      if (row[0] && row[0].trim()) {
        types.add(row[0].trim());
      }
    });

    return Array.from(types).sort();
  } catch (error) {
    console.error("Error fetching unique types - Status: failed");
    throw error;
  }
}

// Lấy danh sách các country unique từ Google Sheets (tối ưu truy vấn)
export async function getUniqueCountries(): Promise<string[]> {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId =
      process.env.GOOGLE_SHEET_ID ||
      "1pG-9mMCMq2sVi8-ez15zjcmCwqI4LCyecX-cC5uQb7U";

    if (!spreadsheetId) {
      throw new Error("GOOGLE_SHEET_ID is not defined");
    }

    // Lấy chỉ cột country để tối ưu truy vấn
    const sheetName = process.env.GOOGLE_SHEET_NAME || "main";
    const range = `${sheetName}!D:D`; // Cột country là cột D

    const requestOptions: any = {
      spreadsheetId,
      range,
    };

    // Thêm API key nếu có
    const apiKey =
      process.env.GOOGLE_API_KEY || "AIzaSyBUH2ZEZrcknbnPMug_OmMAZaNPeFt4_pk";
    if (apiKey) {
      requestOptions.key = apiKey;
    }

    const response = await sheets.spreadsheets.values.get(requestOptions);
    const rows = response.data.values;

    if (!rows || rows.length < 2) {
      return [];
    }

    // Lấy unique countries (bỏ qua header)
    const countries = new Set<string>();
    rows.slice(1).forEach((row) => {
      if (row[0] && row[0].trim()) {
        countries.add(row[0].trim());
      }
    });

    return Array.from(countries).sort();
  } catch (error) {
    console.error("Error fetching unique countries - Status: failed");
    throw error;
  }
}

// Lấy danh sách các year unique từ Google Sheets (tối ưu truy vấn)
export async function getUniqueYears(): Promise<string[]> {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId =
      process.env.GOOGLE_SHEET_ID ||
      "1pG-9mMCMq2sVi8-ez15zjcmCwqI4LCyecX-cC5uQb7U";

    if (!spreadsheetId) {
      throw new Error("GOOGLE_SHEET_ID is not defined");
    }

    // Lấy chỉ cột year để tối ưu truy vấn
    const sheetName = process.env.GOOGLE_SHEET_NAME || "main";
    const range = `${sheetName}!H:H`; // Cột year là cột G

    const requestOptions: any = {
      spreadsheetId,
      range,
    };

    // Thêm API key nếu có
    const apiKey =
      process.env.GOOGLE_API_KEY || "AIzaSyBUH2ZEZrcknbnPMug_OmMAZaNPeFt4_pk";
    if (apiKey) {
      requestOptions.key = apiKey;
    }

    const response = await sheets.spreadsheets.values.get(requestOptions);
    const rows = response.data.values;

    if (!rows || rows.length < 2) {
      return [];
    }

    // Lấy unique years (bỏ qua header)
    const years = new Set<string>();
    rows.slice(1).forEach((row) => {
      if (row[0] && row[0].trim()) {
        years.add(row[0].trim());
      }
    });

    // Sắp xếp năm theo thứ tự giảm dần (mới nhất trước)
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  } catch (error) {
    console.error("Error fetching unique years - Status: failed");
    throw error;
  }
}
