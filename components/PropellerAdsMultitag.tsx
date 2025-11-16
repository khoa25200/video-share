"use client";

import { useEffect } from "react";

export default function PropellerAdsMultitag() {
  useEffect(() => {
    // Script PropellerAds Multitag - Highest revenue format (all-in-one)
    // Zone 185744 - Generates the highest possible revenue
    const script = document.createElement("script");
    script.src = "https://fpyf8.com/88/tag.min.js";
    script.setAttribute("data-zone", "185744");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.head.appendChild(script);

    // Register service worker for Multitag
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw-multitag.js")
        .then((registration) => {
          console.log("Multitag Service Worker registered:", registration);
        })
        .catch((error) => {
          console.log("Multitag Service Worker registration failed:", error);
        });
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}

