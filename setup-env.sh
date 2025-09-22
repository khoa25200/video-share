#!/bin/bash
# Script để tạo file .env.local với thông tin Google Sheets API

echo "Tạo file .env.local..."

cat > .env.local << EOF
# Google Sheets API Configuration
# Sử dụng API Key (đơn giản hơn)

# Google Sheet ID (từ URL)
GOOGLE_SHEET_ID=1pG-9mMCMq2sVi8-ez15zjcmCwqI4LCyecX-cC5uQb7U

# Google API Key
GOOGLE_API_KEY=AIzaSyBUH2ZEZrcknbnPMug_OmMAZaNPeFt4_pk

# Tên sheet
GOOGLE_SHEET_NAME=Trang tính1
EOF

echo "✅ File .env.local đã được tạo thành công!"
echo "📝 Bạn có thể chỉnh sửa file này nếu cần thay đổi cấu hình."
