"use client";

import { useEffect } from "react";

export default function PropellerAdsScript7() {
  useEffect(() => {
    // Script PropellerAds với zone 10194917 - CPM $0.68, 1363 impressions (tốt)
    // Zone "Interesting tag" - CPM cao và volume tốt
    const script = document.createElement("script");
    script.innerHTML = `(function(s){s.dataset.zone='10194917',s.src='https://3nbf4.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
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

