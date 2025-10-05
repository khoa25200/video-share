import type { Metadata } from "next";
import "./globals.css";
import { ModeProvider } from "@/lib/mode-context";

export const metadata: Metadata = {
  title: "GLVIETSUB - Xem Phim Online HD",
  description: "Xem phim online miễn phí, chất lượng HD với phụ đề Việt",
  keywords: "phim online, xem phim, phim HD, phụ đề việt",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
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
