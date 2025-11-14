# Hướng dẫn Setup Quảng Cáo

## Cấu hình Zone IDs

Sau khi tạo tài khoản PropellerAds và Adsterra, cập nhật file `lib/ad-config.ts`:

### Ví dụ với PropellerAds:

```typescript
"movies-header": {
  id: "movies-header",
  network: "propellerads",
  zoneId: "YOUR_PROPELLER_ZONE_ID", // Thay bằng Zone ID thực tế
  format: "banner",
  size: "728x90",
  enabled: true,
},
```

### Ví dụ với Adsterra:

```typescript
"movies-header": {
  id: "movies-header",
  network: "adsterra",
  zoneId: "YOUR_ADSTERRA_ZONE_ID", // Thay bằng Zone ID thực tế
  format: "banner",
  size: "728x90",
  enabled: true,
},
```

## Các vị trí quảng cáo

1. **movies-header**: Sau header trang danh sách phim (728x90)
2. **movies-between-sections**: Giữa Highlights và Top Ranking (728x90)
3. **movies-before-pagination**: Trước pagination (728x90)
4. **detail-sidebar-top**: Sidebar trên trang detail (300x250)
5. **detail-sidebar-bottom**: Sidebar dưới trang detail (300x600)
6. **detail-after-video**: Sau video player (728x90)

## Kích thước khuyến nghị

- **Banner**: 728x90 (desktop), 320x100 (mobile)
- **Sidebar**: 300x250 (MREC), 300x600 (Half Page)
- **Native**: Tự động điều chỉnh

## Enable/Disable quảng cáo

Đặt `enabled: false` để tắt quảng cáo ở vị trí cụ thể:

```typescript
"movies-header": {
  // ...
  enabled: false, // Tắt quảng cáo này
},
```

