import type { Metadata } from "next";
import "./globals.css";
import { ModeProvider } from "@/lib/mode-context";
import VideoProtection from "@/components/VideoProtection";
import PropellerAdsScript from "@/components/PropellerAdsScript";
import PropellerAdsScript2 from "@/components/PropellerAdsScript2";
import PropellerAdsScript3 from "@/components/PropellerAdsScript3";

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
        <script
          src="https://3nbf4.com/act/files/tag.min.js?z=10188024"
          data-cfasync="false"
          async
        />
      </head>
      <body className="bg-dark-900 text-white min-h-screen">
        <PropellerAdsScript />
        <PropellerAdsScript2 />
        <PropellerAdsScript3 />
        <VideoProtection />
        <ModeProvider>{children}</ModeProvider>
      </body>
    </html>
  );
}
