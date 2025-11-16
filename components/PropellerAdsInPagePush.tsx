"use client";

import { useEffect } from "react";

export default function PropellerAdsInPagePush() {
  useEffect(() => {
    // Script PropellerAds In-Page Push với zone 10194910
    // In-Page Push: Native banner không chiếm space, +20-30% impressions
    const script = document.createElement("script");
    script.innerHTML = `(function(s){s.dataset.zone='10194910',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}

