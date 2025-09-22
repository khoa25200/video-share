# Hướng dẫn cài đặt Google Sheets API

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Kích hoạt Google Sheets API:
   - Vào "APIs & Services" > "Library"
   - Tìm "Google Sheets API" và kích hoạt

## Bước 2: Tạo Service Account

1. Vào "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Điền thông tin:
   - Service account name: `glvietsub-sheets-reader`
   - Description: `Service account để đọc dữ liệu từ Google Sheets`
4. Click "Create and Continue"
5. Bỏ qua phần "Grant access" (không cần thiết)
6. Click "Done"

## Bước 3: Tạo và tải Key

1. Trong danh sách Service Accounts, click vào account vừa tạo
2. Vào tab "Keys"
3. Click "Add Key" > "Create new key"
4. Chọn "JSON" và click "Create"
5. File JSON sẽ được tải về

## Bước 4: Cấu hình Environment Variables

Từ file JSON đã tải, copy các giá trị vào `.env.local`:

```env
# ID của Google Sheet (từ URL)
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms

# Email của Service Account
GOOGLE_CLIENT_EMAIL=glvietsub-sheets-reader@your-project.iam.gserviceaccount.com

# Private Key (thay \n bằng xuống dòng thật)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

**Lưu ý quan trọng:**
- Thay `\n` trong private key bằng xuống dòng thật
- Giữ nguyên dấu ngoặc kép quanh private key

## Bước 5: Chia sẻ Google Sheet

1. Mở Google Sheet của bạn
2. Click "Share" (nút chia sẻ)
3. Thêm email của Service Account (từ `GOOGLE_CLIENT_EMAIL`)
4. Chọn quyền "Viewer" (chỉ đọc)
5. Click "Send"

## Bước 6: Kiểm tra cấu hình

Chạy dự án và kiểm tra:

```bash
npm run dev
```

Truy cập: http://localhost:3000

Nếu có lỗi, kiểm tra:
- Service Account có quyền truy cập Sheet không
- Environment variables có đúng format không
- Google Sheets API đã được kích hoạt chưa
