import type { Metadata } from "next";
import "./globals.css";
import { ModeProvider } from "@/lib/mode-context";

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
      <body className="bg-dark-900 text-white min-h-screen">
        <ModeProvider>{children}</ModeProvider>
      </body>
    </html>
  );
}
