"use client";

import { useEffect, useRef, useState } from "react";
import { getAdZone } from "@/lib/ad-config";

interface AdBannerProps {
  zoneId: string;
  className?: string;
  height?: string;
  lazyLoad?: boolean; // Lazy load khi scroll đến
  delay?: number; // Delay trước khi load (ms)
  preload?: boolean; // Preload ngay lập tức (above-the-fold)
}

export default function AdBanner({
  zoneId,
  className = "",
  height = "h-24",
  lazyLoad,
  delay,
  preload = false, // Preload cho above-the-fold ads
}: AdBannerProps) {
  const zone = getAdZone(zoneId);
  const lazyLoadEnabled = lazyLoad !== undefined ? lazyLoad : (zone?.lazyLoad ?? true);
  const delayTime = delay !== undefined ? delay : (zone?.delay ?? 300); // Giảm default delay xuống 300ms
  const adRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  // Preload = true hoặc lazyLoad = false → load ngay
  const [shouldLoad, setShouldLoad] = useState(preload || !lazyLoadEnabled);
  const scriptLoadedRef = useRef<Record<string, boolean>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const viewabilityRef = useRef<{ isVisible: boolean; viewTime: number }>({
    isVisible: false,
    viewTime: 0,
  });

  // Intersection Observer cho lazy loading và viewability tracking
  useEffect(() => {
    if (!lazyLoadEnabled || shouldLoad) {
      // Nếu không lazy load hoặc đã load, track viewability ngay
      if (shouldLoad && adRef.current) {
        let viewTimeStart = 0;
        const viewabilityObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                // Ad visible ít nhất 50%
                if (!viewabilityRef.current.isVisible) {
                  viewabilityRef.current.isVisible = true;
                  viewTimeStart = Date.now();
                }
              } else {
                // Ad không visible
                if (viewabilityRef.current.isVisible) {
                  viewabilityRef.current.isVisible = false;
                  viewabilityRef.current.viewTime += Date.now() - viewTimeStart;
                }
              }
            });
          },
          {
            rootMargin: "0px",
            threshold: [0, 0.5, 1.0], // Track khi 0%, 50%, 100% visible
          }
        );
        viewabilityObserver.observe(adRef.current);
        return () => {
          viewabilityObserver.disconnect();
          // Lưu view time cuối cùng
          if (viewabilityRef.current.isVisible && viewTimeStart > 0) {
            viewabilityRef.current.viewTime += Date.now() - viewTimeStart;
          }
        };
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Giảm delay xuống 0-300ms để tăng viewability
            const loadDelay = Math.max(0, Math.min(delayTime, 300));
            setTimeout(() => {
              setShouldLoad(true);
            }, loadDelay);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Tăng lên 200px để preload sớm hơn
        threshold: 0.01, // Giảm threshold để trigger sớm hơn
      }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazyLoadEnabled, delayTime, shouldLoad]);

  // Load ad khi shouldLoad = true
  useEffect(() => {
    if (!adRef.current || !shouldLoad) return;

    const zone = getAdZone(zoneId);
    if (!zone || !zone.enabled) return;

    const { network, zoneId: adZoneId, format, size } = zone;

    if (network === "placeholder") {
      // Keep placeholder visible
      return;
    }

    // Load ad script based on network
    if (network === "propellerads" && adZoneId) {
      loadPropellerAds(adRef.current!, adZoneId, format, size || "728x90");
    } else if (network === "adsterra" && adZoneId) {
      loadAdsterra(adRef.current!, adZoneId, format, size || "728x90");
    }
  }, [zoneId, shouldLoad]);

  const loadPropellerAds = (
    container: HTMLElement,
    zoneId: string,
    format: string,
    size: string
  ) => {
    // Đồng bộ với global scripts - sử dụng tag.min.js giống các PropellerAdsScript components
    // Xác định domain dựa trên zoneId (giống cách global scripts làm)
    let scriptDomain = "3nbf4.com"; // Default domain
    if (zoneId === "10188024") {
      scriptDomain = "3nbf4.com";
    } else if (zoneId === "10187995") {
      scriptDomain = "al5sm.com";
    } else if (zoneId === "10188032" || zoneId === "10194910") {
      scriptDomain = "nap5k.com";
    } else if (zoneId === "10188092" || zoneId === "10194906") {
      scriptDomain = "gizokraijaw.net";
    }

    // Load script giống global scripts
    if (!scriptLoadedRef.current[`propellerads-${zoneId}`]) {
      const script = document.createElement("script");
      script.innerHTML = `(function(s){s.dataset.zone='${zoneId}',s.src='https://${scriptDomain}/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;
      script.setAttribute("data-cfasync", "false");
      document.head.appendChild(script);
      scriptLoadedRef.current[`propellerads-${zoneId}`] = true;

      // Hide placeholder after script loads
      setTimeout(() => {
        if (container.children.length > 0) {
          setShowPlaceholder(false);
        }
      }, 1000);
    } else {
      // Script already loaded, check if ad loaded
      setTimeout(() => {
        if (container.children.length > 0) {
          setShowPlaceholder(false);
        }
      }, 1000);
    }
  };

  const loadAdsterra = (
    container: HTMLElement,
    zoneId: string,
    format: string,
    size: string
  ) => {
    // Adsterra sử dụng script tag với zone ID
    const adDiv = document.createElement("div");
    adDiv.id = `adsterra-${zoneId}`;
    adDiv.className = "adsterra-ads";
    container.appendChild(adDiv);

    // Load Adsterra script
    if (!scriptLoadedRef.current["adsterra"]) {
      const script = document.createElement("script");
      script.src = `https://ads.adsterra.com/render/${zoneId}.js`;
      script.async = true;
      script.onload = () => {
        scriptLoadedRef.current["adsterra"] = true;
        // Hide placeholder after script loads
        setTimeout(() => {
          if (adDiv.children.length > 0) {
            setShowPlaceholder(false);
          }
        }, 1000);
      };
      script.onerror = () => {
        // Keep placeholder if script fails
        console.error("Failed to load Adsterra script");
      };
      document.head.appendChild(script);
    } else {
      // Script already loaded, check if ad loaded
      setTimeout(() => {
        if (adDiv.children.length > 0) {
          setShowPlaceholder(false);
        }
      }, 1000);
    }
  };

  const isPlaceholder = !zone || zone.network === "placeholder" || !zone.zoneId;

  return (
    <div
      className={`w-full ${height} ${className} relative`}
      data-zone-id={zoneId}
    >
      {/* Ad container */}
      <div ref={adRef} className="w-full h-full" />

      {/* Placeholder - hiển thị khi chưa có ad code hoặc ad chưa load */}
      {showPlaceholder && (
        <div
          ref={placeholderRef}
          className="absolute inset-0 w-full bg-dark-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center"
        >
          <div className="text-center">
            <p className="text-gray-500 text-sm font-medium">
              {isPlaceholder ? "Khu vực quảng cáo" : "Đang tải quảng cáo..."}
            </p>
            {zone?.size && (
              <p className="text-gray-600 text-xs mt-1">{zone.size}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

