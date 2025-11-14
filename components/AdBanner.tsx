"use client";

import { useEffect, useRef, useState } from "react";
import { getAdZone } from "@/lib/ad-config";

interface AdBannerProps {
  zoneId: string;
  className?: string;
  height?: string;
}

export default function AdBanner({
  zoneId,
  className = "",
  height = "h-24",
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const scriptLoadedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!adRef.current) return;

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
  }, [zoneId]);

  const loadPropellerAds = (
    container: HTMLElement,
    zoneId: string,
    format: string,
    size: string
  ) => {
    // PropellerAds sử dụng script tag với data attributes
    const adDiv = document.createElement("div");
    adDiv.id = `propeller-${zoneId}`;
    adDiv.className = "propeller-ads";
    adDiv.setAttribute("data-zone-id", zoneId);
    adDiv.setAttribute("data-format", format);
    if (format === "banner") {
      adDiv.setAttribute("data-size", size);
    }
    container.appendChild(adDiv);

    // Load PropellerAds script
    if (!scriptLoadedRef.current["propellerads"]) {
      const script = document.createElement("script");
      script.src = "https://ads.propellerads.com/ads.js";
      script.async = true;
      script.onload = () => {
        scriptLoadedRef.current["propellerads"] = true;
        // Hide placeholder after script loads
        setTimeout(() => {
          if (adDiv.children.length > 0) {
            setShowPlaceholder(false);
          }
        }, 1000);
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

  const zone = getAdZone(zoneId);
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

