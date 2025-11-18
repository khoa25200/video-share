"use client";

import { useEffect } from "react";

export default function PropellerAdsScript5() {
  useEffect(() => {
    // Register service worker for zone 10203692
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw-10203692.js")
        .then((registration) => {
          console.log("Zone 10203692 Service Worker registered:", registration);
        })
        .catch((error) => {
          console.log("Zone 10203692 Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}

