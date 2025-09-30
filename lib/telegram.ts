// Function để gửi thông báo Telegram khi user truy cập
export async function sendTelegramNotification() {
  try {
    // Lấy thông tin device từ browser
    const userAgent = navigator.userAgent;
    const timestamp = Date.now();
    const referer = document.referrer;

    // Gửi request đến API
    const response = await fetch("/api/telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userAgent,
        timestamp,
        referer,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send notification");
    }

    const result = await response.json();
    console.log("Telegram notification sent:", result);
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
  }
}

// Function để lấy IP address (sử dụng external service)
export async function getUserIP(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error getting IP:", error);
    return "Unknown";
  }
}
