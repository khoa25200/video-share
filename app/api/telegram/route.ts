import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAgent, ip, timestamp, referer } = body;

    // Telegram Bot API
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
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
      throw new Error("Failed to send Telegram message");
    }

    return NextResponse.json({
      success: true,
      message: "Telegram notification sent successfully",
    });
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
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
