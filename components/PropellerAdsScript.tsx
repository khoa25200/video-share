"use client";

import { useEffect } from "react";

export default function PropellerAdsScript() {
  useEffect(() => {
    // Script PropellerAds với zone 10187995
    const script = document.createElement("script");
    script.innerHTML = `(function(s){s.dataset.zone='10187995',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}

