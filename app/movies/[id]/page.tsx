"use client";

import { useState, useEffect } from "react";
import { Movie } from "@/lib/google-sheets";
import VideoPlayer from "@/components/VideoPlayer";
import AdBanner from "@/components/AdBanner";
import { useMode } from "@/lib/mode-context";

interface MovieDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MovieDetail({ params }: MovieDetailProps) {
  const { mode } = useMode();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movieId, setMovieId] = useState<string | null>(null);
  const [relatedEpisodes, setRelatedEpisodes] = useState<Movie[]>([]);
  const [episodesPage, setEpisodesPage] = useState(1);
  const [hasMoreEpisodes, setHasMoreEpisodes] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [totalEpisodes, setTotalEpisodes] = useState(0);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setMovieId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!movieId) return;

    const fetchMovie = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/movies/${movieId}?mode=${mode}`);

        if (!response.ok) {
          throw new Error("Failed to fetch movie");
        }

        const data = await response.json();
        setMovie(data);

        // Fetch related episodes if this movie has a series
        if (data.series) {
          try {
            const episodesResponse = await fetch(
              `/api/movies?series=${encodeURIComponent(
                data.series
              )}&page=1&limit=10&mode=${mode}`
            );
            if (episodesResponse.ok) {
              const episodesData = await episodesResponse.json();
              setRelatedEpisodes(episodesData.data);
              setTotalEpisodes(episodesData.total);
              setHasMoreEpisodes(episodesData.hasNextPage);
            }
          } catch (err) {
            console.error(
              "Failed to fetch related episodes:",
              JSON.stringify(err)
            );
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId, mode]);

  const loadMoreEpisodes = async () => {
    if (loadingEpisodes || !hasMoreEpisodes) return;

    setLoadingEpisodes(true);
    const nextPage = episodesPage + 1;

    try {
      const episodesResponse = await fetch(
        `/api/movies?series=${encodeURIComponent(
          movie?.series || ""
        )}&page=${nextPage}&limit=10&mode=${mode}`
      );

      if (episodesResponse.ok) {
        const episodesData = await episodesResponse.json();

        setRelatedEpisodes((prev) => {
          // Combine existing episodes with new episodes
          const combined = [...prev, ...episodesData.data];
          return combined;
        });

        setEpisodesPage(nextPage);
        setHasMoreEpisodes(episodesData.hasNextPage);
      }
    } catch (err) {
      console.error("Failed to load more episodes - Status: failed");
    } finally {
      setLoadingEpisodes(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Đang tải phim...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-dark-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">
            Lỗi: {error || "Không tìm thấy phim"}
          </p>
          <a href="/movies" className="text-primary-400 hover:text-primary-300">
            Quay lại danh sách phim
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <a
                href="/movies"
                className="flex items-center space-x-2 text-white hover:text-primary-400 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Quay lại</span>
              </a>
              <div className="h-6 w-px bg-dark-600"></div>
              <h1 className="text-xl font-bold">Chi tiết phim</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <div
              className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundImage: `url(${movie.thumbnail})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              onClick={() => {
                // Scroll to video player section
                const videoSection = document.querySelector(
                  "[data-video-section]"
                );
                if (videoSection) {
                  videoSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              <div className="relative h-full">
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center shadow-2xl">
                    <svg
                      className="w-8 h-8 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-30">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                      movie.status === "END"
                        ? "bg-green-600"
                        : movie.status.includes("Tập")
                        ? "bg-blue-600"
                        : "bg-yellow-600"
                    }`}
                  >
                    {movie.status === "END" ? "Hoàn thành" : movie.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Movie Info */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {movie.title}
                </h1>
                {movie.originalTitle && (
                  <p className="text-xl text-gray-400 italic">
                    {movie.originalTitle}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-400 text-sm sm:text-base">
                  4.8/5
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Nội dung
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {movie.description ||
                    "Một bộ phim hấp dẫn với cốt truyện thú vị và diễn xuất xuất sắc..."}
                </p>
              </div>

              {/* Movie Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-primary-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-300 text-sm sm:text-base">
                      Năm:{" "}
                      <span className="text-white font-medium">
                        {movie.year}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-primary-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-gray-300 text-sm sm:text-base">
                      Quốc gia:{" "}
                      <span className="text-white font-medium">
                        {movie.country}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-primary-400 flex-shrink-0"
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
                    <span className="text-gray-300 text-sm sm:text-base">
                      Thể loại:{" "}
                      <span className="text-white font-medium">
                        {movie.category}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-primary-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-gray-300 text-sm sm:text-base">
                      Thời lượng:{" "}
                      <span className="text-white font-medium">
                        {movie.duration}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-primary-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <span className="text-gray-300 text-sm sm:text-base">
                      Tập:{" "}
                      <span className="text-white font-medium">
                        {movie.episodes}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-primary-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-gray-300 text-sm sm:text-base">
                      Diễn viên:{" "}
                      <span className="text-white font-medium">
                        {movie.actors}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6">
                <button
                  onClick={() => {
                    // Scroll to video player section
                    const videoSection = document.querySelector(
                      "[data-video-section]"
                    );
                    if (videoSection) {
                      videoSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="flex items-center space-x-3 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Xem ngay</span>
                </button>

                <button className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-300 backdrop-blur-sm border border-white/20">
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
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>Yêu thích</span>
                </button>
              </div>
            </div>
          </div>

          {/* Ad Sidebar - Desktop Only - ENABLED với Zone 10188024 (CPM cao) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <AdBanner 
                zoneId="detail-sidebar-top" 
                height="h-64"
                preload={true} // Preload vì sidebar thường visible ngay (above-the-fold)
              />
            </div>
          </div>
        </div>

        {/* Video Player Section */}
        <div className="mt-12" data-video-section>
          <h2 className="text-2xl font-bold text-white mb-6">Xem phim</h2>
          <VideoPlayer movie={movie} />
        </div>

        {/* Ad Banner - After Video Player - DISABLED */}
        {/* <div className="mt-8">
          <AdBanner zoneId="detail-after-video" height="h-24 sm:h-32" />
        </div> */}

        {/* Related Episodes Section */}
        {relatedEpisodes.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              📺 {movie.series} - Tất cả tập ({totalEpisodes} tập)
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 justify-center">
              {relatedEpisodes.map((episode) => (
                <div
                  key={episode.id}
                  className={`bg-dark-800 rounded-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer w-full ${
                    episode.id === movie.id
                      ? "border-primary-500 ring-2 ring-primary-500/20"
                      : "border-dark-700 hover:border-primary-500/50"
                  }`}
                  onClick={() => {
                    window.location.href = `/movies/${episode.id}`;
                  }}
                >
                  {/* Episode Thumbnail */}
                  <div
                    className="aspect-[3/4] relative"
                    style={{
                      backgroundImage: `url(${episode.thumbnail})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Episode Badge */}
                    <div className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 bg-primary-600 text-white px-1 py-0.5 sm:px-1.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold">
                      Tập {episode.episode}
                    </div>

                    {/* Current Episode Indicator */}
                    {episode.id === movie.id && (
                      <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-green-600 text-white px-1 py-0.5 sm:px-1.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold">
                        Đang xem
                      </div>
                    )}

                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 bg-primary-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Episode Info */}
                  <div className="p-1 sm:p-2 md:p-3">
                    <h3 className="text-white text-xs sm:text-sm md:text-base font-medium line-clamp-2 mb-0.5 sm:mb-1">
                      {episode.title}
                    </h3>
                    <div className="flex items-center justify-between text-[9px] sm:text-xs text-gray-400">
                      <span className="truncate">{episode.duration}</span>
                      <span
                        className={`px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-1 rounded text-[9px] sm:text-xs ${
                          episode.status === "END"
                            ? "bg-green-600/20 text-green-400"
                            : "bg-yellow-600/20 text-yellow-400"
                        }`}
                      >
                        {episode.status === "END"
                          ? "Hoàn thành"
                          : episode.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreEpisodes && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMoreEpisodes}
                  disabled={loadingEpisodes}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-600/50 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {loadingEpisodes ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang tải...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
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
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <span>
                        Xem thêm tập ({totalEpisodes - relatedEpisodes.length}{" "}
                        tập còn lại)
                      </span>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
