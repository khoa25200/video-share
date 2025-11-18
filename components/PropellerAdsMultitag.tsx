"use client";

import { useEffect } from "react";

export default function PropellerAdsMultitag() {
  useEffect(() => {
    // Tối ưu: Register service worker TRƯỚC để tăng tương tác zone 10194921
    // Service worker cần được register sớm nhất để có thể xử lý requests ngay
    if ("serviceWorker" in navigator) {
      // Register với scope rộng và update ngay lập tức
      navigator.serviceWorker
        .register("/sw-multitag.js", {
          scope: "/", // Scope rộng để cover toàn bộ site
          updateViaCache: "none", // Luôn check update mới nhất
        })
        .then((registration) => {
          console.log("Multitag Service Worker registered:", registration);
          
          // Force update service worker để đảm bảo version mới nhất
          registration.update();
          
          // Listen for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "activated") {
                  console.log("Multitag Service Worker updated and activated");
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log("Multitag Service Worker registration failed:", error);
        });
    }

    // Script PropellerAds Multitag - Highest revenue format (all-in-one)
    // Zone 185744 - Generates the highest possible revenue
    // Zone 10194921 (service worker) - CPM $3.99 rất cao nhưng chỉ 10 impressions
    // Tối ưu: Load script ngay sau khi service worker được register để tăng volume
    const script = document.createElement("script");
    script.src = "https://fpyf8.com/88/tag.min.js";
    script.setAttribute("data-zone", "185744");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.setAttribute("fetchpriority", "high"); // Tối ưu: Priority cao để tăng volume zone 10194921
    
    // Preconnect để tăng tốc độ load
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://fpyf8.com";
    document.head.appendChild(link);
    
    // Preconnect đến domain service worker để tăng tương tác zone 10194921
    const swLink = document.createElement("link");
    swLink.rel = "preconnect";
    swLink.href = "https://3nbf4.com";
    swLink.crossOrigin = "anonymous";
    document.head.appendChild(swLink);
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}

