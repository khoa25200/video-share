/**
 * Ad Configuration
 *
 * HƯỚNG DẪN SETUP:
 * 1. Tạo tài khoản PropellerAds/Adsterra và lấy Zone IDs
 * 2. Cập nhật zoneId và network cho từng vị trí quảng cáo
 * 3. Ví dụ:
 *    - PropellerAds: network: "propellerads", zoneId: "123456"
 *    - Adsterra: network: "adsterra", zoneId: "123456"
 *
 * VỊ TRÍ QUẢNG CÁO:
 * - movies-header: Sau header trang danh sách phim
 * - movies-between-sections: Giữa Highlights và Top Ranking
 * - movies-before-pagination: Trước pagination
 * - detail-sidebar-top: Sidebar trên (desktop only)
 * - detail-sidebar-bottom: Sidebar dưới (desktop only)
 * - detail-after-video: Sau video player
 */

export type AdNetwork = "propellerads" | "adsterra" | "placeholder";

export interface AdZone {
  id: string;
  network: AdNetwork;
  zoneId?: string; // Zone ID từ PropellerAds hoặc Adsterra
  format: "banner" | "native" | "sidebar" | "popunder";
  size?: string; // Kích thước: "728x90", "300x250", "300x600", etc.
  enabled: boolean;
  lazyLoad?: boolean; // Lazy load khi scroll đến
  delay?: number; // Delay trước khi load (ms)
}

export const adZones: Record<string, AdZone> = {
  // Trang Movies
  "movies-header": {
    id: "movies-header",
    network: "placeholder",
    format: "banner",
    size: "728x90",
    enabled: false, // Tắt - quá gần header
  },
  "movies-between-sections": {
    id: "movies-between-sections",
    network: "placeholder",
    format: "banner",
    size: "728x90",
    enabled: false, // Tắt - ẩn AdBanner
    lazyLoad: true, // Lazy load khi scroll đến
    delay: 3000, // Delay 3 giây sau khi scroll đến
  },
  "movies-before-pagination": {
    id: "movies-before-pagination",
    network: "placeholder",
    format: "banner",
    size: "728x90",
    enabled: false, // Tắt - gây khó chịu
  },
  // Trang Detail
  "detail-sidebar-top": {
    id: "detail-sidebar-top",
    network: "placeholder",
    format: "sidebar",
    size: "300x250",
    enabled: false, // Tắt - ẩn AdBanner
    lazyLoad: true, // Lazy load khi scroll đến
    delay: 2000, // Delay 2 giây
  },
  "detail-sidebar-bottom": {
    id: "detail-sidebar-bottom",
    network: "placeholder",
    format: "sidebar",
    size: "300x600",
    enabled: false, // Tắt - quá nhiều sidebar
  },
  "detail-after-video": {
    id: "detail-after-video",
    network: "placeholder",
    format: "banner",
    size: "728x90",
    enabled: false, // Tắt - gây khó chịu sau video
  },
};

export function getAdZone(zoneId: string): AdZone | undefined {
  return adZones[zoneId];
}

export function updateAdZone(zoneId: string, updates: Partial<AdZone>): void {
  if (adZones[zoneId]) {
    adZones[zoneId] = { ...adZones[zoneId], ...updates };
  }
}
