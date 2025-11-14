"use client";

import { useEffect } from "react";

export default function PropellerAdsScript2() {
  useEffect(() => {
    // Script PropellerAds với zone 10188032
    const script = document.createElement("script");
    script.innerHTML = `(function(s){s.dataset.zone='10188032',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}

