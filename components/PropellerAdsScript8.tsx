"use client";

import { useEffect } from "react";

export default function PropellerAdsScript8() {
  useEffect(() => {
    // Script PropellerAds với zone 10194920 - CPM $0.16, 747 impressions (test)
    // Zone "Interesting tag" - Test để xem hiệu quả
    const script = document.createElement("script");
    script.innerHTML = `(function(s){s.dataset.zone='10194920',s.src='https://3nbf4.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
    script.setAttribute("data-cfasync", "false");
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}

