"use client";

import { useEffect } from "react";

export default function PropellerAdsScript3() {
  useEffect(() => {
    // Script PropellerAds Vignette với zone 10188092
    const script = document.createElement("script");
    script.innerHTML = `(function(s){s.dataset.zone='10188092',s.src='https://gizokraijaw.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}

