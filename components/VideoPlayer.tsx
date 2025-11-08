"use client";

import { useState, useEffect, useRef } from "react";

interface VideoPlayerProps {
  movie: {
    id: string;
    title: string;
    iframe?: string;
    videoUrl?: string;
    thumbnail?: string;
  };
  className?: string;
}

export default function VideoPlayer({
  movie,
  className = "",
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Kiểm tra loại video
  const isVideoFile =
    movie.videoUrl &&
    (movie.videoUrl.endsWith(".mp4") ||
      movie.videoUrl.endsWith(".m3u8") ||
      movie.videoUrl.includes(".m3u8"));

  // Extract URL từ iframe
  const extractIframeUrl = (iframe: string): string | null => {
    const match = iframe.match(/src="([^"]+)"/);
    return match ? match[1] : null;
  };

  // Handle video events
  const handleVideoLoad = () => {
    setIsLoading(false);
    setVideoError(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setVideoError(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIsIframeLoaded(true);
  };

  // Auto play video khi component mount
  useEffect(() => {
    if (isVideoFile && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto play bị block, không làm gì
      });
    }
  }, [isVideoFile]);

  // Bảo vệ chống download video
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+S, Ctrl+U, Ctrl+Shift+I, F12, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        (e.ctrlKey && e.key === "s") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "I" || e.key === "J" || e.key === "C")) ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "K")
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Disable video download via video element
    const handleVideoContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Prevent video source inspection
    const handleVideoLoadStart = () => {
      if (video.src) {
        // Obfuscate video URL in DOM
        Object.defineProperty(video, "src", {
          get: () => "",
          set: () => {},
          configurable: true,
        });
      }
    };

    // Add event listeners
    container.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    container.addEventListener("dragstart", handleDragStart);
    container.addEventListener("selectstart", handleSelectStart);
    video.addEventListener("contextmenu", handleVideoContextMenu);
    video.addEventListener("loadstart", handleVideoLoadStart);

    // Disable video controls download button
    if (video.hasAttribute("controls")) {
      video.setAttribute("controlsList", "nodownload noplaybackrate");
    }

    // Add CSS to disable pointer events on video controls
    const style = document.createElement("style");
    style.textContent = `
      video::-webkit-media-controls-enclosure {
        pointer-events: none !important;
      }
      video::-webkit-media-controls-panel {
        pointer-events: none !important;
      }
      video::-webkit-media-controls-play-button {
        pointer-events: auto !important;
      }
      video::-webkit-media-controls-timeline {
        pointer-events: auto !important;
      }
      video::-webkit-media-controls-volume-slider {
        pointer-events: auto !important;
      }
      video::-webkit-media-controls-mute-button {
        pointer-events: auto !important;
      }
      video::-webkit-media-controls-fullscreen-button {
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      container.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      container.removeEventListener("dragstart", handleDragStart);
      container.removeEventListener("selectstart", handleSelectStart);
      video.removeEventListener("contextmenu", handleVideoContextMenu);
      video.removeEventListener("loadstart", handleVideoLoadStart);
      document.head.removeChild(style);
    };
  }, [isVideoFile]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Container với tỷ lệ 16:9 */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
      >
        {/* Skeleton Loader */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 animate-pulse">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Đang tải video...</p>
            </div>
          </div>
        )}

        {/* Video Player cho MP4/M3U8 */}
        {isVideoFile ? (
          <>
            <video
              ref={videoRef}
              className={`w-full h-full object-contain transition-opacity duration-500 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              controls
              controlsList="nodownload noplaybackrate"
              preload="metadata"
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
              poster={movie.thumbnail || undefined}
              onContextMenu={(e) => e.preventDefault()}
              style={{ pointerEvents: "auto" }}
              disablePictureInPicture
              disableRemotePlayback
            >
              <source
                src={movie.videoUrl}
                type={
                  movie.videoUrl?.endsWith(".m3u8")
                    ? "application/x-mpegURL"
                    : "video/mp4"
                }
              />
              <track kind="subtitles" srcLang="vi" label="Vietnamese" />
              Trình duyệt không hỗ trợ video.
            </video>
            {/* Watermark overlay */}
            <div className="absolute top-4 right-4 pointer-events-none z-10">
              <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded text-white text-sm font-semibold">
                GLVIETSUB.ORG
              </div>
            </div>
            {/* Protection overlay - prevents direct access to video element */}
            <div
              className="absolute inset-0 pointer-events-none z-20"
              style={{
                background: "transparent",
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            />
          </>
        ) : (
          /* Iframe Player */
          <iframe
            ref={iframeRef}
            src={
              movie.iframe
                ? extractIframeUrl(movie.iframe) || undefined
                : undefined
            }
            className={`w-full h-full border-0 transition-opacity duration-500 ${
              isIframeLoaded ? "opacity-100" : "opacity-0"
            }`}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            loading="eager"
            onLoad={handleIframeLoad}
            title={`Video player for ${movie.title}`}
          />
        )}

        {/* Error State */}
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <svg
                className="w-16 h-16 text-red-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-semibold mb-2">Không thể tải video</p>
              <p className="text-gray-400 text-sm">
                Vui lòng kiểm tra lại kết nối mạng
              </p>
            </div>
          </div>
        )}

        {/* Video Controls Overlay */}
        {isVideoFile && !isLoading && !videoError && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.paused
                        ? videoRef.current.play()
                        : videoRef.current.pause();
                    }
                  }}
                  className="text-white hover:text-blue-400 transition-colors"
                  aria-label="Play/Pause video"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <span className="text-white text-sm">{movie.title}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.requestFullscreen();
                    }
                  }}
                  className="text-white hover:text-blue-400 transition-colors"
                  aria-label="Enter fullscreen"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Play Button Overlay cho Video */}
        {isVideoFile && !isLoading && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
              <svg
                className="w-8 h-8 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-white mb-2">{movie.title}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span className="flex items-center space-x-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span>{isVideoFile ? "Video File" : "Embedded Video"}</span>
          </span>
          {isVideoFile && movie.videoUrl?.endsWith(".m3u8") && (
            <span className="flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 110 2h-1v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6H4a1 1 0 110-2h3z"
                />
              </svg>
              <span>HLS Stream</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
