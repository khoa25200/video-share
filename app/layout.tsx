import type { Metadata } from "next";
import "./globals.css";
import { ModeProvider } from "@/lib/mode-context";
import VideoProtection from "@/components/VideoProtection";
import PropellerAdsScript from "@/components/PropellerAdsScript";
// import PropellerAdsScript2 from "@/components/PropellerAdsScript2"; // Tắt - Zone 10188032 có CPM quá thấp ($0.0456)
import PropellerAdsScript3 from "@/components/PropellerAdsScript3";
import PropellerAdsScript4 from "@/components/PropellerAdsScript4";
import PropellerAdsInPagePush from "@/components/PropellerAdsInPagePush";
import PropellerAdsMultitag from "@/components/PropellerAdsMultitag";

export const metadata: Metadata = {
  title: "GLVIETSUB - Xem Phim Online HD",
  description:
    "Trang Vietsub phim GL hay nhất hoàn toàn miễn phí, cập nhật nhanh chóng và đầy đủ.",
  keywords:
    "phim online, xem phim, phim HD, phụ đề việt, phim GL, vietsub, GLVIETSUB, vietsub phim, phim vietsub, phim vietsub online, phim vietsub HD, phim vietsub hay nhất, phim vietsub miễn phí, phim vietsub cập nhật nhanh chóng và đầy đủ.",
  icons: {
    icon: [
      { url: "/assets/logo.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/assets/logo.ico",
    apple: "/assets/logo.ico",
  },
  other: {
    "6a97888e-site-verification": "7dede8a0dd96413eb8c8887cd0ffd25b",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        {/* Zone 10188024 đã được load qua AdBanner components (movies-between-sections, detail-sidebar-top)
            Xóa script global để tránh duplicate impressions */}
      </head>
      <body className="bg-dark-900 text-white min-h-screen">
        <PropellerAdsMultitag />
        <PropellerAdsScript />
        {/* <PropellerAdsScript2 /> Tắt - Zone 10188032 có CPM quá thấp ($0.0456) */}
        <PropellerAdsScript3 />
        {/* TODO: Sau 7-14 ngày test, so sánh CPM giữa 2 Vignette zones:
            - Zone 10188092 (Vignette cũ) - CPM $0.13
            - Zone 10194906 (Vignette mới) - CPM kỳ vọng $0.40-0.50
            Tắt zone có CPM thấp hơn */}
        <PropellerAdsScript4 />
        <PropellerAdsInPagePush />
        <VideoProtection />
        <ModeProvider>{children}</ModeProvider>
      </body>
    </html>
  );
}
