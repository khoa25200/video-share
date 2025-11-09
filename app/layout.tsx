import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ModeProvider } from "@/lib/mode-context";
import VideoProtection from "@/components/VideoProtection";

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
        <meta
          httpEquiv="Delegate-CH"
          content="Sec-CH-UA https://s.magsrv.com; Sec-CH-UA-Mobile https://s.magsrv.com; Sec-CH-UA-Arch https://s.magsrv.com; Sec-CH-UA-Model https://s.magsrv.com; Sec-CH-UA-Platform https://s.magsrv.com; Sec-CH-UA-Platform-Version https://s.magsrv.com; Sec-CH-UA-Bitness https://s.magsrv.com; Sec-CH-UA-Full-Version-List https://s.magsrv.com; Sec-CH-UA-Full-Version https://s.magsrv.com;"
        />
      </head>
      <body className="bg-dark-900 text-white min-h-screen">
        <Script
          async
          type="application/javascript"
          src="https://a.magsrv.com/ad-provider.js"
          strategy="beforeInteractive"
        />
        <Script
          async
          type="application/javascript"
          src="https://a.pemsrv.com/ad-provider.js"
          strategy="beforeInteractive"
        />
        <ins className="eas6a97888e6" data-zoneid="5766480" />
        {/* <ins className="eas6a97888e17" data-zoneid="5766482" /> */}
        {/* <ins className="eas6a97888e17" data-zoneid="5766486" /> */}
        <ins className="eas6a97888e14" data-zoneid="5766490" />
        {/* <ins className="eas6a97888e33" data-zoneid="5766492" /> */}
        <Script id="ad-provider-init" strategy="afterInteractive">
          {`(AdProvider = window.AdProvider || []).push({"serve": {}});`}
        </Script>
        <VideoProtection />
        <ModeProvider>{children}</ModeProvider>
      </body>
    </html>
  );
}
