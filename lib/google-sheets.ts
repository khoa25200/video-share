import { google } from "googleapis";

// Interface cho movie data
export interface Movie {
  id: string;
  title: string;
  originalTitle: string;
  country: string;
  category: string;
  year: string;
  episodes: string;
  duration: string;
  status: string;
  actors: string;
  description: string;
  iframe: string;
  thumbnail: string;
  videoUrl?: string; // Optional video URL for MP4/M3U8 files
  series?: string; // Series name for grouping
  episode?: string; // Episode number within series
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
    const range = `${sheetName}!A:P`; // Lấy từ cột A đến P (16 cột) - bao gồm series và episode

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
          year: "year",
          episodes: "episodes",
          duration: "duration",
          status: "status",
          actors: "actors",
          description: "description",
          iframe: "iframe",
          thumbnail: "thumbnail",
          videoUrl: "videoUrl",
          series: "series",
          episode: "episode",
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
    console.error("Error fetching sheet data:", error);
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
    const range = "hight_light!A:P";

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
          year: "year",
          episodes: "episodes",
          duration: "duration",
          status: "status",
          actors: "actors",
          description: "description",
          iframe: "iframe",
          thumbnail: "thumbnail",
          videoUrl: "videoUrl",
          series: "series",
          episode: "episode",
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
    console.error("Error fetching highlight data:", error);
    throw error;
  }
}
