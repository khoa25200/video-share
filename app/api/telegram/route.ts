import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAgent, ip, timestamp, referer } = body;

    // Telegram Bot API
    const botToken = "8281358006:AAEw2b5hngA6li4EcYyWPN_zEB0TVw-c8n8";
    const chatId = "-2953760855";

    if (!botToken || !chatId) {
      console.error("Missing Telegram configuration - Status: failed");
      throw new Error("Telegram bot token or chat ID not configured");
    }

    // Parse user agent để lấy thông tin device
    const deviceInfo = parseUserAgent(userAgent);

    // Tạo message
    const message = `🔔 Có 1 user truy cập web!

📱 Device: ${deviceInfo.device}
🌐 Browser: ${deviceInfo.browser}
💻 OS: ${deviceInfo.os}
📍 IP: ${ip}
🕐 Time: ${new Date(timestamp).toLocaleString("vi-VN")}
🔗 Referer: ${referer || "Direct"}`;

    // Gửi message đến Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.text();
      console.error("Telegram API error - Status:", telegramResponse.status);
      console.error("Telegram API response:", errorData);
      throw new Error(
        `Failed to send Telegram message: ${telegramResponse.status}`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Telegram notification sent successfully",
    });
  } catch (error) {
    console.error("Error sending Telegram notification - Status: failed");
    console.error(
      "Error details:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send Telegram notification",
      },
      { status: 500 }
    );
  }
}

// Function để parse user agent
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();

  // Device detection
  let device = "Desktop";
  if (ua.includes("mobile") || ua.includes("android")) {
    device = "Mobile";
  } else if (ua.includes("tablet") || ua.includes("ipad")) {
    device = "Tablet";
  }

  // Browser detection
  let browser = "Unknown";
  if (ua.includes("chrome")) {
    browser = "Chrome";
  } else if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("safari")) {
    browser = "Safari";
  } else if (ua.includes("edge")) {
    browser = "Edge";
  }

  // OS detection
  let os = "Unknown";
  if (ua.includes("windows")) {
    os = "Windows";
  } else if (ua.includes("mac")) {
    os = "macOS";
  } else if (ua.includes("linux")) {
    os = "Linux";
  } else if (ua.includes("android")) {
    os = "Android";
  } else if (ua.includes("ios")) {
    os = "iOS";
  }

  return { device, browser, os };
}
