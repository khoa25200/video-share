"use client";

import { useEffect } from "react";

export default function PropellerAdsScript6() {
  useEffect(() => {
    // Script PropellerAds với zone 10203708 từ otieu.com
    const script = document.createElement("script");
    script.innerHTML = `(function(s){s.dataset.zone='10203708',s.src='https://otieu.com/4/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}

