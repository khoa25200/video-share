"use client";

import { useEffect } from "react";

export default function PropellerAdsScript4() {
  useEffect(() => {
    // Script PropellerAds Vignette với zone 10194906 (Vignette Banner mới - CPM cao hơn 65% so với banner)
    const script = document.createElement("script");
    script.innerHTML = `(function(s){s.dataset.zone='10194906',s.src='https://gizokraijaw.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
