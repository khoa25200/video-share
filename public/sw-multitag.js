// Service Worker cho Multitag - Zone 10194921
// Tối ưu để tăng tương tác và engagement
self.options = {
  domain: "3nbf4.com",
  zoneId: 10194921,
};
self.lary = "";

// Install event - activate ngay lập tức để tăng tương tác
self.addEventListener("install", (event) => {
  // Skip waiting để service worker activate ngay
  self.skipWaiting();
});

// Activate event - claim clients ngay để xử lý requests sớm
self.addEventListener("activate", (event) => {
  // Claim all clients ngay lập tức
  event.waitUntil(clients.claim());
});

// Load service worker script
importScripts("https://3nbf4.com/act/files/service-worker.min.js?r=sw");
