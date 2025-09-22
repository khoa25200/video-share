# PowerShell script để tạo file .env.local với thông tin Google Sheets API

Write-Host "Tạo file .env.local..." -ForegroundColor Green

$envContent = @"
# Google Sheets API Configuration
# Sử dụng API Key (đơn giản hơn)

# Google Sheet ID (từ URL)
GOOGLE_SHEET_ID=1pG-9mMCMq2sVi8-ez15zjcmCwqI4LCyecX-cC5uQb7U

# Google API Key
GOOGLE_API_KEY=AIzaSyBUH2ZEZrcknbnPMug_OmMAZaNPeFt4_pk

# Tên sheet
GOOGLE_SHEET_NAME=Trang tính1
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ File .env.local đã được tạo thành công!" -ForegroundColor Green
Write-Host "📝 Bạn có thể chỉnh sửa file này nếu cần thay đổi cấu hình." -ForegroundColor Yellow
