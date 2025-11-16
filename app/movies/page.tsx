"use client";

import { useState, useEffect } from "react";
import { sendTelegramNotification, getUserIP } from "@/lib/telegram";
import { useMode } from "@/lib/mode-context";
import Header from "@/components/Header";
import AdBanner from "@/components/AdBanner";
import styles from "@/styles/movie-grid.module.css";

interface Movie {
  id: string;
  title: string;
  originalTitle: string;
  country: string;
  category: string;
  year: string;
  episodes: string;
  duration: string;
  status: string;
  actors: string;
  description: string;
  iframe: string;
  thumbnail: string;
  mobileThumbnail?: string; // Mobile banner thumbnail
  series?: string;
  episode?: string;
  ranking?: string;
}

interface MoviesResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  data: Movie[];
}

export default function MoviesPage() {
  const { mode, isInitialized } = useMode();
  const [movies, setMovies] = useState<MoviesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "series">("grid");
  const [groupedMovies, setGroupedMovies] = useState<{
    [key: string]: Movie[];
  }>({});
  const [highlights, setHighlights] = useState<Movie[]>([]);
  const [highlightsLoading, setHighlightsLoading] = useState(true);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [visibleHighlights, setVisibleHighlights] = useState(3);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [topRanking, setTopRanking] = useState<Movie[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [yearsLoading, setYearsLoading] = useState(true);

  // Separate state for actual search/filter values
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [activeYear, setActiveYear] = useState("");
  const [activeCountry, setActiveCountry] = useState("");

  // Initialize filters from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get("search") || "";
    const category = urlParams.get("category") || "";
    const year = urlParams.get("year") || "";
    const country = urlParams.get("country") || "";
    const page = parseInt(urlParams.get("page") || "1");

    setSearchQuery(search);
    setSelectedCategory(category);
    setSelectedYear(year);
    setSelectedCountry(country);

    // Set active values from URL
    setActiveSearchQuery(search);
    setActiveCategory(category);
    setActiveYear(year);
    setActiveCountry(country);
    setCurrentPage(page);
  }, []);

  // Update URL params when filters change
  const updateURLParams = (page: number = currentPage) => {
    const params = new URLSearchParams();
    if (activeSearchQuery) params.set("search", activeSearchQuery);
    if (activeCategory) params.set("category", activeCategory);
    if (activeYear) params.set("year", activeYear);
    if (activeCountry) params.set("country", activeCountry);
    if (page > 1) params.set("page", page.toString());

    const newURL = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    window.history.pushState({}, "", newURL);
  };

  const fetchMovies = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        mode: mode,
      });

      if (activeSearchQuery) params.append("search", activeSearchQuery);
      if (activeCategory) params.append("category", activeCategory);
      if (activeYear) params.append("year", activeYear);
      if (activeCountry) params.append("country", activeCountry);

      const response = await fetch(`/api/movies?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();
      setMovies(data);
      setTotalPages(data.totalPages);
      setCurrentPage(page);

      // Update URL params after successful fetch
      updateURLParams(page);

      // Group movies by series
      const grouped = data.data.reduce(
        (acc: { [key: string]: Movie[] }, movie: Movie) => {
          const seriesKey = movie.series || "Đơn lẻ";
          if (!acc[seriesKey]) {
            acc[seriesKey] = [];
          }
          acc[seriesKey].push(movie);
          return acc;
        },
        {}
      );

      // Sort episodes within each series
      Object.keys(grouped).forEach((seriesKey) => {
        grouped[seriesKey].sort((a: Movie, b: Movie) => {
          const episodeA = parseInt(a.episode || "0");
          const episodeB = parseInt(b.episode || "0");
          return episodeA - episodeB;
        });
      });

      setGroupedMovies(grouped);

      // Scroll to filter section after pagination (only if there are URL params)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.toString()) {
        setTimeout(() => {
          const filterSection = document.getElementById("filter-section");
          if (filterSection) {
            filterSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Các function fetch riêng lẻ vẫn được giữ lại để tương thích ngược
  const fetchHighlights = async () => {
    try {
      setHighlightsLoading(true);
      const response = await fetch(`/api/highlights?mode=${mode}`);

      if (!response.ok) {
        throw new Error("Failed to fetch highlights");
      }

      const data = await response.json();
      setHighlights(data.data);
    } catch (err) {
      console.error("Failed to fetch highlights - Status: failed");
    } finally {
      setHighlightsLoading(false);
    }
  };

  const fetchTopRanking = async () => {
    try {
      setRankingLoading(true);
      const response = await fetch(`/api/ranking?mode=${mode}`);

      if (!response.ok) {
        throw new Error("Failed to fetch top ranking movies");
      }

      const data = await response.json();
      setTopRanking(data.data);
    } catch (err) {
      console.error("Error fetching top ranking movies - Status: failed");
      setTopRanking([]);
    } finally {
      setRankingLoading(false);
    }
  };

  const fetchAvailableTypes = async () => {
    try {
      setTypesLoading(true);
      const response = await fetch(`/api/types?mode=${mode}`);

      if (!response.ok) {
        throw new Error("Failed to fetch available types");
      }

      const data = await response.json();
      setAvailableTypes(data.data);
    } catch (err) {
      console.error("Error fetching available types - Status: failed");
      setAvailableTypes([]);
    } finally {
      setTypesLoading(false);
    }
  };

  const fetchAvailableCountries = async () => {
    try {
      setCountriesLoading(true);
      const response = await fetch(`/api/countries?mode=${mode}`);

      if (!response.ok) {
        throw new Error("Failed to fetch available countries");
      }

      const data = await response.json();
      setAvailableCountries(data.data);
    } catch (err) {
      console.error("Error fetching available countries - Status: failed");
      setAvailableCountries([]);
    } finally {
      setCountriesLoading(false);
    }
  };

  const fetchAvailableYears = async () => {
    try {
      setYearsLoading(true);
      const response = await fetch(`/api/years?mode=${mode}`);

      if (!response.ok) {
        throw new Error("Failed to fetch available years");
      }

      const data = await response.json();
      setAvailableYears(data.data);
    } catch (err) {
      console.error("Error fetching available years - Status: failed");
      setAvailableYears([]);
    } finally {
      setYearsLoading(false);
    }
  };

  // Fetch tất cả dữ liệu cần thiết trong một lần gọi
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setHighlightsLoading(true);
      setRankingLoading(true);
      setTypesLoading(true);
      setCountriesLoading(true);
      setYearsLoading(true);

      // Fetch tất cả dữ liệu song song
      const [
        moviesResponse,
        highlightsResponse,
        rankingResponse,
        typesResponse,
        countriesResponse,
        yearsResponse,
      ] = await Promise.all([
        fetch(`/api/movies?page=1&limit=12&mode=${mode}`),
        fetch(`/api/highlights?mode=${mode}`),
        fetch(`/api/ranking?mode=${mode}`),
        fetch(`/api/types?mode=${mode}`),
        fetch(`/api/countries?mode=${mode}`),
        fetch(`/api/years?mode=${mode}`),
      ]);

      // Xử lý movies data
      if (moviesResponse.ok) {
        const moviesData = await moviesResponse.json();
        setMovies(moviesData);

        // Group movies by series
        const grouped = moviesData.data.reduce(
          (acc: { [key: string]: Movie[] }, movie: Movie) => {
            const seriesKey = movie.series || "Đơn lẻ";
            if (!acc[seriesKey]) {
              acc[seriesKey] = [];
            }
            acc[seriesKey].push(movie);
            return acc;
          },
          {}
        );

        // Sort episodes within each series
        Object.keys(grouped).forEach((seriesKey) => {
          grouped[seriesKey].sort((a: Movie, b: Movie) => {
            const episodeA = parseInt(a.episode || "0");
            const episodeB = parseInt(b.episode || "0");
            return episodeA - episodeB;
          });
        });

        setGroupedMovies(grouped);
      }

      // Xử lý highlights data
      if (highlightsResponse.ok) {
        const highlightsData = await highlightsResponse.json();
        setHighlights(highlightsData.data);
      }

      // Xử lý ranking data
      if (rankingResponse.ok) {
        const rankingData = await rankingResponse.json();
        setTopRanking(rankingData.data);
      }

      // Xử lý filter data
      if (typesResponse.ok) {
        const typesData = await typesResponse.json();
        setAvailableTypes(typesData.data);
      }

      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json();
        setAvailableCountries(countriesData.data);
      }

      if (yearsResponse.ok) {
        const yearsData = await yearsResponse.json();
        setAvailableYears(yearsData.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching all data:", err);
    } finally {
      setLoading(false);
      setHighlightsLoading(false);
      setRankingLoading(false);
      setTypesLoading(false);
      setCountriesLoading(false);
      setYearsLoading(false);
    }
  };

  useEffect(() => {
    // Gửi thông báo Telegram khi user truy cập
    const sendNotification = async () => {
      try {
        const ip = await getUserIP();
        const userAgent = navigator.userAgent;
        const timestamp = Date.now();
        const referer = document.referrer;

        await fetch("/api/telegram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userAgent,
            ip,
            timestamp,
            referer,
          }),
        });
      } catch (error) {
        console.error(
          "Error sending Telegram notification - Status: failed",
          JSON.stringify(error)
        );
      }
    };

    // Chỉ gửi thông báo một lần khi trang load
    const hasNotified = sessionStorage.getItem("telegram-notified");
    if (!hasNotified) {
      sendNotification();
      sessionStorage.setItem("telegram-notified", "true");
    }
  }, []);

  // Initial data fetch when component mounts and mode is initialized
  useEffect(() => {
    if (isInitialized) {
      fetchAllData();
    }
  }, [isInitialized]);

  // Refetch movies when active filters change or mode changes
  useEffect(() => {
    fetchMovies(1);
  }, [activeSearchQuery, activeCategory, activeYear, activeCountry, mode]);

  // Refetch all data when mode changes
  useEffect(() => {
    fetchAllData();
  }, [mode]);

  // Function to apply search and filters
  const applyFilters = () => {
    setActiveSearchQuery(searchQuery);
    setActiveCategory(selectedCategory);
    setActiveYear(selectedYear);
    setActiveCountry(selectedCountry);

    // Scroll to filter section after applying filters (only if there are URL params)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.toString()) {
      setTimeout(() => {
        const filterSection = document.getElementById("filter-section");
        if (filterSection) {
          filterSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const search = urlParams.get("search") || "";
      const category = urlParams.get("category") || "";
      const year = urlParams.get("year") || "";
      const country = urlParams.get("country") || "";
      const page = parseInt(urlParams.get("page") || "1");

      setSearchQuery(search);
      setSelectedCategory(category);
      setSelectedYear(year);
      setSelectedCountry(country);
      setCurrentPage(page);
      fetchMovies(page);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (highlights.length > 1 && !isHovering) {
      const interval = setInterval(() => {
        setCurrentHighlightIndex((prev) => (prev + 1) % highlights.length);
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [highlights.length, isHovering]);

  const handlePlay = (movie: Movie) => {
    // Chuyển hướng đến trang chi tiết phim
    window.location.href = `/movies/${movie.id}`;
  };

  // Touch handling for mobile slider
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && highlights.length > 1) {
      setCurrentHighlightIndex((prev) =>
        prev === highlights.length - 1 ? 0 : prev + 1
      );
    }
    if (isRightSwipe && highlights.length > 1) {
      setCurrentHighlightIndex((prev) =>
        prev === 0 ? highlights.length - 1 : prev - 1
      );
    }
  };

  const extractVideoUrl = (iframe: string) => {
    const match = iframe.match(/src="([^"]+)"/);
    return match ? match[1] : "";
  };

  // Show loading if mode context is not initialized
  if (!isInitialized) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#111827",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "3rem",
              height: "3rem",
              border: "2px solid #374151",
              borderTop: "2px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          ></div>
          <p style={{ fontSize: "1.125rem" }}>Đang khởi tạo...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#111827",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "3rem",
              height: "3rem",
              border: "3px solid #374151",
              borderTop: "3px solid #dc2626",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          ></div>
          <p>Đang tải phim...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#111827",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#ef4444", marginBottom: "1rem" }}>Lỗi: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "#111827", color: "white" }}
    >
      {/* Header */}
      <Header />

      {/* Ad Banner - After Header - DISABLED */}
      {/* <div className="w-full bg-dark-900 py-2 px-4">
        <div className="max-w-7xl mx-auto">
          <AdBanner zoneId="movies-header" height="h-20 sm:h-24" />
        </div>
      </div> */}

      {/* Highlights Section */}
      {!highlightsLoading && highlights.length > 0 && (
        <section style={{ padding: "2rem 0", backgroundColor: "#0f172a" }}>
          <div
            style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1rem" }}
          >
            <div style={{ marginBottom: "2rem" }}>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                ⭐ PHIM NỔI BẬT
                <span className={`mode-indicator ${mode}`}>
                  {mode === "girl" ? "👩GL" : "👨BL"}
                </span>
              </h2>
              <p style={{ color: "#9ca3af", fontSize: "1rem" }}>
                Những bộ phim được yêu thích nhất
              </p>
            </div>

            {/* Mobile Slider View */}
            <div className="block sm:hidden px-2">
              <div
                className="relative overflow-hidden rounded-xl shadow-lg"
                style={{ minHeight: "300px" }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex transition-transform ease-in-out duration-500 h-full"
                  style={{
                    transform: `translateX(-${currentHighlightIndex * 100}%)`,
                  }}
                >
                  {highlights.map((movie) => (
                    <div
                      key={movie.id}
                      className="w-full flex-shrink-0 relative mx-1"
                      style={{ aspectRatio: "16/9", minHeight: "300px" }}
                      onClick={() => handlePlay(movie)}
                    >
                      <div
                        className="w-full h-full bg-cover bg-center rounded-xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-200"
                        style={{
                          backgroundImage: `url(${
                            movie.mobileThumbnail || movie.thumbnail
                          })`,
                        }}
                      >
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3 z-20">
                          <span className="px-2 py-1 text-xs font-bold bg-red-600 text-white rounded-lg shadow-lg">
                            {movie.status === "END"
                              ? "Hoàn thành"
                              : movie.status}
                          </span>
                        </div>

                        {/* Bottom Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 z-20 text-white">
                          {/* Highlight Badge */}
                          <div className="mb-3">
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-yellow-500 text-white rounded-lg shadow-lg">
                              ⭐ HOT
                            </span>
                          </div>

                          {/* Movie Title */}
                          <h3 className="text-lg font-bold mb-1 leading-tight text-white line-clamp-2 drop-shadow-lg">
                            {movie.title}
                          </h3>

                          {/* Movie Info Row */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                              <span>{movie.year}</span>
                              <span>•</span>
                              <span>{movie.category}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className="w-3 h-3 text-yellow-400 fill-current"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Slider Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-1.5">
                  {highlights.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentHighlightIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentHighlightIndex
                          ? "w-8 bg-white shadow-lg"
                          : "w-1.5 bg-white/60 hover:bg-white/80"
                      }`}
                      title={`Chuyển đến slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Swipe Hint */}
                {highlights.length > 1 && (
                  <div className="absolute top-3 right-3 z-30">
                    <div className="flex items-center gap-1 text-white/70">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                      </svg>
                      <span className="text-xs font-medium">Vuốt</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Carousel View */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "400px",
                overflow: "hidden",
                borderRadius: "1rem",
                backgroundColor: "#1e293b",
              }}
              className="hidden sm:block h-96 md:h-[400px]"
            >
              {/* Carousel Container */}
              <div
                style={{
                  display: "flex",
                  width: `${highlights.length * 100}%`,
                  height: "100%",
                  transform: `translateX(-${
                    currentHighlightIndex * (100 / highlights.length)
                  }%)`,
                  transition: "transform 0.5s ease-in-out",
                }}
              >
                {highlights.map((movie, index) => (
                  <div
                    key={movie.id}
                    style={{
                      width: `${100 / highlights.length}%`,
                      height: "100%",
                      position: "relative",
                      backgroundImage: `url(${movie.thumbnail})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => handlePlay(movie)}
                  >
                    {/* Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3))",
                        zIndex: 10,
                      }}
                    />

                    {/* Content */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "2rem",
                        zIndex: 20,
                        color: "white",
                      }}
                      className="p-4 sm:p-8"
                    >
                      {/* Highlight Badge */}
                      <div
                        style={{ marginBottom: "1rem" }}
                        className="mb-2 sm:mb-4"
                      >
                        <span
                          style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "9999px",
                            fontSize: "0.875rem",
                            fontWeight: "bold",
                            backgroundColor: "#f59e0b",
                            color: "white",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                          className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm"
                        >
                          ⭐{" "}
                          <span className="hidden sm:inline">PHIM NỔI BẬT</span>
                        </span>
                      </div>

                      {/* Movie Title */}
                      <h3
                        style={{
                          fontSize: "2rem",
                          fontWeight: "bold",
                          marginBottom: "0.5rem",
                          lineHeight: "1.2",
                        }}
                        className="text-lg sm:text-3xl font-bold mb-1 sm:mb-2 leading-tight"
                      >
                        {movie.title}
                      </h3>

                      {/* Original Title */}
                      {movie.originalTitle && (
                        <p
                          style={{
                            fontSize: "1.125rem",
                            color: "#d1d5db",
                            marginBottom: "1rem",
                            fontStyle: "italic",
                          }}
                          className="text-sm sm:text-lg text-gray-300 mb-2 sm:mb-4 italic"
                        >
                          {movie.originalTitle}
                        </p>
                      )}

                      {/* Movie Info */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          marginBottom: "1.5rem",
                          fontSize: "1rem",
                          color: "#9ca3af",
                        }}
                        className="flex items-center gap-1 sm:gap-4 mb-2 sm:mb-6 text-xs sm:text-base text-gray-400"
                      >
                        <span>📅 {movie.year}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>🌍 {movie.country}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>🎭 {movie.category}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>⏱️ {movie.duration}</span>
                      </div>

                      {/* Description - Hidden on mobile */}
                      <p
                        style={{
                          fontSize: "1rem",
                          lineHeight: "1.5",
                          marginBottom: "1.5rem",
                          color: "#d1d5db",
                          maxWidth: "600px",
                        }}
                        className="hidden sm:block text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 text-gray-300 max-w-2xl"
                      >
                        {movie.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows - Desktop Only */}
              {highlights.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    style={{
                      position: "absolute",
                      left: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "3rem",
                      height: "3rem",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      zIndex: 30,
                      transition: "all 0.3s ease",
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 text-white border-none rounded-full cursor-pointer flex items-center justify-center text-2xl z-30 transition-all duration-300 hover:bg-black/80"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.8)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.5)";
                    }}
                    onClick={() => {
                      setCurrentHighlightIndex(
                        currentHighlightIndex === 0
                          ? highlights.length - 1
                          : currentHighlightIndex - 1
                      );
                    }}
                  >
                    ‹
                  </button>

                  {/* Next Button */}
                  <button
                    style={{
                      position: "absolute",
                      right: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "3rem",
                      height: "3rem",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      zIndex: 30,
                      transition: "all 0.3s ease",
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 text-white border-none rounded-full cursor-pointer flex items-center justify-center text-2xl z-30 transition-all duration-300 hover:bg-black/80"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.8)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.5)";
                    }}
                    onClick={() => {
                      setCurrentHighlightIndex(
                        currentHighlightIndex === highlights.length - 1
                          ? 0
                          : currentHighlightIndex + 1
                      );
                    }}
                  >
                    ›
                  </button>
                </>
              )}

              {/* Dots Indicator - Desktop Only */}
              {highlights.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "1rem",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: "0.5rem",
                    zIndex: 30,
                  }}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-30"
                >
                  {highlights.map((_, index) => (
                    <button
                      key={index}
                      style={{
                        width: "0.75rem",
                        height: "0.75rem",
                        borderRadius: "50%",
                        border: "none",
                        backgroundColor:
                          index === currentHighlightIndex
                            ? "#dc2626"
                            : "rgba(255,255,255,0.5)",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      className="w-3 h-3 rounded-full border-none cursor-pointer transition-all duration-300"
                      onClick={() => setCurrentHighlightIndex(index)}
                      title={`Chuyển đến slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Ad Banner - Between Sections - ENABLED với Zone 10188024 (CPM cao) */}
      <div className="w-full bg-dark-900 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <AdBanner 
            zoneId="movies-between-sections" 
            height="h-24 sm:h-32"
            preload={false} // Lazy load vì không phải above-the-fold
          />
        </div>
      </div>

      {/* Top Ranking Section */}
      {!rankingLoading && topRanking.length > 0 && (
        <section style={{ padding: "2rem 0", backgroundColor: "#1e293b" }}>
          <div
            style={{ maxWidth: "1380px", margin: "0 auto", padding: "0 .8rem" }}
          >
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "white",
                marginBottom: "1.5rem",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              🏆 TOP 5 PHIM XEM NHIỀU NHẤT
              <span className={`mode-indicator ${mode}`}>
                {mode === "girl" ? "👩GL" : "👨BL"}
              </span>
            </h2>
            {/* Mobile Layout: Top 2 above, 3 below */}
            <div className="block sm:hidden">
              {/* Top 2 Movies */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {topRanking.slice(0, 2).map((movie, index) => (
                  <div
                    key={movie.id}
                    style={{
                      position: "relative",
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                      backgroundColor: "#334155",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                    }}
                    onClick={() =>
                      (window.location.href = `/movies/${movie.id}`)
                    }
                  >
                    {/* Ranking Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "0.5rem",
                        left: "0.5rem",
                        backgroundColor:
                          index === 0
                            ? "#ffd700"
                            : index === 1
                            ? "#c0c0c0"
                            : index === 2
                            ? "#cd7f32"
                            : "#dc2626",
                        color: "white",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        zIndex: 30,
                      }}
                    >
                      #{movie.ranking}
                    </div>

                    {/* Movie Poster */}
                    <div style={{ position: "relative", aspectRatio: "2/3" }}>
                      <img
                        src={movie.thumbnail}
                        alt={movie.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-movie.jpg";
                        }}
                      />

                      {/* Gradient Overlay for Title */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "50%",
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent)",
                          zIndex: 15,
                        }}
                      />

                      {/* Movie Info */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "0.5rem",
                          zIndex: 20,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            color: "white",
                            marginBottom: "0.25rem",
                            lineHeight: "1.2",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {movie.title}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.625rem",
                            color: "#d1d5db",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {movie.year} • {movie.country}
                        </p>
                        <p
                          style={{
                            fontSize: "0.625rem",
                            color: "#9ca3af",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {movie.category}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom 3 Movies */}
              <div className="grid grid-cols-3 gap-2">
                {topRanking.slice(2, 5).map((movie, index) => (
                  <div
                    key={movie.id}
                    style={{
                      position: "relative",
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                      backgroundColor: "#334155",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                    }}
                    onClick={() =>
                      (window.location.href = `/movies/${movie.id}`)
                    }
                  >
                    {/* Ranking Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "0.5rem",
                        left: "0.5rem",
                        backgroundColor:
                          index === 0
                            ? "#cd7f32"
                            : index === 1
                            ? "#8b5cf6"
                            : "#06b6d4",
                        color: "white",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        zIndex: 30,
                      }}
                    >
                      #{movie.ranking}
                    </div>

                    {/* Movie Poster */}
                    <div style={{ position: "relative", aspectRatio: "2/3" }}>
                      <img
                        src={movie.thumbnail}
                        alt={movie.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-movie.jpg";
                        }}
                      />

                      {/* Gradient Overlay for Title */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "50%",
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent)",
                          zIndex: 15,
                        }}
                      />

                      {/* Movie Info */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "0.75rem",
                          zIndex: 20,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: "bold",
                            color: "white",
                            marginBottom: "0.25rem",
                            lineHeight: "1.2",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {movie.title}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "#d1d5db",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {movie.year} • {movie.country}
                        </p>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "#9ca3af",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {movie.category}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Layout */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 250px))",
                gap: "1rem",
                marginBottom: "2rem",
                justifyContent: "center",
              }}
              className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 justify-center"
            >
              {topRanking.map((movie, index) => (
                <div
                  key={movie.id}
                  style={{
                    position: "relative",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                    backgroundColor: "#334155",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                  }}
                  onClick={() => (window.location.href = `/movies/${movie.id}`)}
                >
                  {/* Ranking Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      left: "0.5rem",
                      backgroundColor:
                        index === 0
                          ? "#ffd700"
                          : index === 1
                          ? "#c0c0c0"
                          : index === 2
                          ? "#cd7f32"
                          : index === 3
                          ? "#8b5cf6"
                          : "#06b6d4",
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      zIndex: 30,
                    }}
                  >
                    #{movie.ranking}
                  </div>

                  {/* Movie Poster */}
                  <div style={{ position: "relative", aspectRatio: "2/3" }}>
                    <img
                      src={movie.thumbnail}
                      alt={movie.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-movie.jpg";
                      }}
                    />

                    {/* Gradient Overlay for Title */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "50%",
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent)",
                        zIndex: 15,
                      }}
                    />

                    {/* Movie Info */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "1rem",
                        zIndex: 20,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "bold",
                          color: "white",
                          marginBottom: "0.25rem",
                          lineHeight: "1.2",
                        }}
                      >
                        {movie.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#d1d5db",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {movie.year} • {movie.country}
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                        }}
                      >
                        {movie.category}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search and Filter Controls */}
      <section
        id="filter-section"
        style={{ padding: "1rem 0", backgroundColor: "#1f2937" }}
        className="py-4 sm:py-12 bg-gray-800"
      >
        <div
          style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1rem" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
            className="flex flex-col gap-4 sm:gap-12"
          >
            {/* Search Bar - Full Width */}
            <div
              style={{
                position: "relative",
                width: "100%",
              }}
              className="relative w-full"
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(55, 65, 81, 0.8)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid transparent",
                  borderRadius: "25px",
                  padding: "0.375rem",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                  maxWidth: "400px",
                  margin: "0 auto",
                }}
                className="search-container relative flex items-center bg-gray-700/80 backdrop-blur-sm border-2 border-transparent rounded-full p-1 sm:p-8 transition-all duration-300 shadow-lg max-w-xl mx-auto"
              >
                <div
                  style={{
                    position: "absolute",
                    left: "0.375rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    fontSize: "0.75rem",
                    transition: "all 0.3s ease",
                  }}
                  className="search-icon absolute left-1.5 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-3xl transition-all duration-300"
                >
                  🔍
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm phim, diễn viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "0.25rem 0.375rem 0.25rem 1.5rem",
                    backgroundColor: "transparent",
                    border: "none",
                    outline: "none",
                    color: "white",
                    fontWeight: "400",
                  }}
                  className="text-xs sm:text-lg"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyFilters();
                    }
                  }}
                  onFocus={(e) => {
                    const parentElement = e.target.parentElement;
                    if (parentElement) {
                      parentElement.style.borderColor = "#dc2626";
                      parentElement.style.backgroundColor =
                        "rgba(55, 65, 81, 0.95)";
                      parentElement.style.transform = "scale(1.02)";
                      parentElement.style.boxShadow =
                        "0 8px 30px rgba(220, 38, 38, 0.2)";
                    }
                  }}
                  onBlur={(e) => {
                    const parentElement = e.target.parentElement;
                    if (parentElement) {
                      parentElement.style.borderColor = "transparent";
                      parentElement.style.backgroundColor =
                        "rgba(55, 65, 81, 0.8)";
                      parentElement.style.transform = "scale(1)";
                      parentElement.style.boxShadow =
                        "0 4px 20px rgba(0, 0, 0, 0.1)";
                    }
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveSearchQuery("");
                      updateURLParams();
                    }}
                    style={{
                      position: "absolute",
                      right: "0.375rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "1.5rem",
                      height: "1.5rem",
                      backgroundColor: "rgba(239, 68, 68, 0.2)",
                      color: "#ef4444",
                      border: "none",
                      borderRadius: "50%",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(239, 68, 68, 0.3)";
                      e.currentTarget.style.transform =
                        "translateY(-50%) scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(239, 68, 68, 0.2)";
                      e.currentTarget.style.transform =
                        "translateY(-50%) scale(1)";
                    }}
                    title="Xóa tìm kiếm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filter Controls */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                justifyContent: "center",
                alignItems: "center",
              }}
              className="flex flex-wrap gap-0.5 sm:gap-6 justify-center items-center"
            >
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setActiveCategory(e.target.value);
                  // Scroll to filter section after filter change (only if there are URL params)
                  const urlParams = new URLSearchParams(window.location.search);
                  if (urlParams.toString()) {
                    setTimeout(() => {
                      const filterSection =
                        document.getElementById("filter-section");
                      if (filterSection) {
                        filterSection.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }, 100);
                  }
                }}
                style={{
                  backgroundColor: "#374151",
                  color: "white",
                  border: "1px solid #4b5563",
                  borderRadius: "15px",
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  minWidth: "100px",
                  transition: "all 0.3s ease",
                }}
                className="bg-gray-700 text-white border border-gray-600 rounded-full px-2 py-2 sm:px-10 sm:py-5 text-sm sm:text-xl cursor-pointer min-w-[80px] sm:min-w-[220px] transition-all duration-300"
                title="Chọn thể loại phim"
                onFocus={(e) => {
                  e.target.style.borderColor = "#dc2626";
                  e.target.style.backgroundColor = "#4b5563";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#4b5563";
                  e.target.style.backgroundColor = "#374151";
                }}
                disabled={typesLoading}
              >
                <option value="">🎭 Thể loại</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* Country Filter */}
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setActiveCountry(e.target.value);
                  // Scroll to filter section after filter change (only if there are URL params)
                  const urlParams = new URLSearchParams(window.location.search);
                  if (urlParams.toString()) {
                    setTimeout(() => {
                      const filterSection =
                        document.getElementById("filter-section");
                      if (filterSection) {
                        filterSection.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }, 100);
                  }
                }}
                style={{
                  backgroundColor: "#374151",
                  color: "white",
                  border: "1px solid #4b5563",
                  borderRadius: "15px",
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  minWidth: "100px",
                  transition: "all 0.3s ease",
                }}
                className="bg-gray-700 text-white border border-gray-600 rounded-full px-2 py-2 sm:px-10 sm:py-5 text-sm sm:text-xl cursor-pointer min-w-[80px] sm:min-w-[220px] transition-all duration-300"
                title="Chọn quốc gia"
                onFocus={(e) => {
                  e.target.style.borderColor = "#dc2626";
                  e.target.style.backgroundColor = "#4b5563";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#4b5563";
                  e.target.style.backgroundColor = "#374151";
                }}
                disabled={countriesLoading}
              >
                <option value="">🌍 Quốc gia</option>
                {availableCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              {/* Year Filter */}
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setActiveYear(e.target.value);
                  // Scroll to filter section after filter change (only if there are URL params)
                  const urlParams = new URLSearchParams(window.location.search);
                  if (urlParams.toString()) {
                    setTimeout(() => {
                      const filterSection =
                        document.getElementById("filter-section");
                      if (filterSection) {
                        filterSection.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }, 100);
                  }
                }}
                style={{
                  backgroundColor: "#374151",
                  color: "white",
                  border: "1px solid #4b5563",
                  borderRadius: "15px",
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  minWidth: "100px",
                  transition: "all 0.3s ease",
                }}
                className="bg-gray-700 text-white border border-gray-600 rounded-full px-2 py-2 sm:px-10 sm:py-5 text-sm sm:text-xl cursor-pointer min-w-[80px] sm:min-w-[220px] transition-all duration-300"
                title="Chọn năm phát hành"
                onFocus={(e) => {
                  e.target.style.borderColor = "#dc2626";
                  e.target.style.backgroundColor = "#4b5563";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#4b5563";
                  e.target.style.backgroundColor = "#374151";
                }}
                disabled={yearsLoading}
              >
                <option value="">📅 Năm</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              {/* Search Button */}
              <button
                onClick={applyFilters}
                className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2 py-2 sm:px-10 sm:py-5 text-sm sm:text-xl cursor-pointer font-medium transition-all duration-300 flex items-center gap-0.5 sm:gap-3"
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  color: "#22c55e",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  borderRadius: "15px",
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(34, 197, 94, 0.3)";
                  e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.5)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(34, 197, 94, 0.2)";
                  e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.3)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                title="Tìm kiếm"
              >
                🔍 Tìm kiếm
              </button>

              {/* Reset Filter Button */}
              {(searchQuery ||
                selectedCategory ||
                selectedYear ||
                selectedCountry) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setSelectedYear("");
                    setSelectedCountry("");
                    setActiveSearchQuery("");
                    setActiveCategory("");
                    setActiveYear("");
                    setActiveCountry("");
                    // Clear URL params
                    window.history.pushState({}, "", window.location.pathname);
                  }}
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "15px",
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                  className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-2 sm:px-10 sm:py-5 text-sm sm:text-xl cursor-pointer font-medium transition-all duration-300 flex items-center gap-0.5 sm:gap-3"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(239, 68, 68, 0.3)";
                    e.currentTarget.style.borderColor =
                      "rgba(239, 68, 68, 0.5)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(239, 68, 68, 0.2)";
                    e.currentTarget.style.borderColor =
                      "rgba(239, 68, 68, 0.3)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  title="Xóa tất cả bộ lọc"
                >
                  🔄 Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <section style={{ padding: "2rem 0" }} className="py-4 sm:py-8">
        <div
          style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1rem" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {/* Pagination Info */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              color: "#9ca3af",
            }}
            className="flex justify-between items-center mb-4 sm:mb-8 text-gray-400"
          >
            <p className="text-xs sm:text-base">
              Trang {currentPage} / {totalPages} - Tổng {movies?.total || 0}{" "}
              phim
            </p>
          </div>

          {viewMode === "grid" ? (
            <div className={styles.movieGrid}>
              {movies?.data.map((movie) => (
                <div
                  key={movie.id}
                  className={`${styles.movieCard} bg-gray-800 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl max-w-[150px] w-full mx-auto`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                  }}
                  onClick={() => handlePlay(movie)}
                >
                  {/* Movie Poster */}
                  <div
                    className={`${styles.moviePoster} aspect-[2/3] bg-cover bg-center relative overflow-hidden`}
                    style={{
                      backgroundImage: `url(${movie.thumbnail})`,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                        zIndex: 10,
                      }}
                    />

                    {/* Status Badge */}
                    <div className={styles.statusBadge}>
                      <span
                        className={`${styles.badge} ${
                          movie.status === "END"
                            ? styles.statusCompleted
                            : styles.statusOngoing
                        } px-1 py-0.5 rounded-full text-xs font-medium text-white`}
                      >
                        {movie.status === "END" ? "Hoàn thành" : movie.status}
                      </span>
                    </div>

                    {/* Series Badge */}
                    {movie.series && (
                      <div className={styles.seriesBadge}>
                        <span
                          className={`${styles.badge} ${styles.seriesBadgeColor} px-0.5 py-0.5 rounded-full text-xs font-medium text-white`}
                        >
                          📺 {movie.series}
                        </span>
                      </div>
                    )}

                    {/* Episode Badge */}
                    {movie.episode && (
                      <div className={styles.episodeBadge}>
                        <span
                          className={`${styles.badge} ${styles.episodeBadgeColor} px-0.5 py-0.5 rounded-full text-xs font-medium text-white`}
                        >
                          Tập {movie.episode}
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay for Title */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "50%",
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent)",
                        zIndex: 15,
                      }}
                    />

                    {/* Movie Info */}
                    <div className={styles.movieInfo}>
                      <h3
                        className={`${styles.movieTitle} text-white font-semibold text-xs mb-1 leading-tight`}
                      >
                        {movie.title}
                      </h3>
                      {movie.originalTitle && (
                        <p
                          className={`${styles.originalTitle} text-gray-300 text-xs mb-1 italic`}
                        >
                          {movie.originalTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Movie Details */}
                  <div className={styles.movieDetails}>
                    <div
                      className={`${styles.detailsContainer} flex flex-col gap-0.5 text-xs text-gray-300 mb-1`}
                    >
                      <div
                        className={`${styles.detailItem} flex items-center gap-1`}
                      >
                        <span className={`${styles.detailIcon} text-xs`}>
                          📅
                        </span>
                        <span className={`${styles.detailText} text-xs`}>
                          {movie.year}
                        </span>
                        <span style={{ color: "#6b7280" }}>•</span>
                        <span className={`${styles.detailText} text-xs`}>
                          {movie.country}
                        </span>
                      </div>
                      <div
                        className={`${styles.detailItem} flex items-center gap-1`}
                      >
                        <span className={`${styles.detailIcon} text-xs`}>
                          ⏱️
                        </span>
                        <span className={`${styles.detailText} text-xs`}>
                          {movie.duration}
                        </span>
                        <span style={{ color: "#6b7280" }}>•</span>
                        <span className={`${styles.detailText} text-xs`}>
                          {movie.episodes} tập
                        </span>
                      </div>
                      <div
                        className={`${styles.detailItem} flex items-center gap-1`}
                      >
                        <span className={`${styles.detailIcon} text-xs`}>
                          🎭
                        </span>
                        <span
                          className={`${styles.detailText} text-xs text-gray-400`}
                        >
                          {movie.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
            >
              {Object.entries(groupedMovies).map(
                ([seriesName, seriesMovies]) => (
                  <div
                    key={seriesName}
                    style={{
                      backgroundColor: "#1f2937",
                      borderRadius: "1rem",
                      padding: "1.5rem",
                      border: "1px solid #374151",
                    }}
                  >
                    {/* Series Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom: "1.5rem",
                        paddingBottom: "1rem",
                        borderBottom: "1px solid #374151",
                      }}
                    >
                      <div
                        style={{
                          width: "3rem",
                          height: "3rem",
                          backgroundColor: "#dc2626",
                          borderRadius: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                        }}
                      >
                        📺
                      </div>
                      <div>
                        <h3
                          style={{
                            color: "white",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            margin: 0,
                          }}
                        >
                          {seriesName}
                        </h3>
                        <p
                          style={{
                            color: "#9ca3af",
                            fontSize: "0.875rem",
                            margin: 0,
                          }}
                        >
                          {seriesMovies.length} tập
                        </p>
                      </div>
                    </div>

                    {/* Episodes Grid */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      {seriesMovies.map((movie) => (
                        <div
                          key={movie.id}
                          style={{
                            backgroundColor: "#111827",
                            borderRadius: "0.75rem",
                            overflow: "hidden",
                            border: "1px solid #374151",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.02)";
                            e.currentTarget.style.borderColor = "#dc2626";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.borderColor = "#374151";
                          }}
                          onClick={() => handlePlay(movie)}
                        >
                          {/* Episode Thumbnail */}
                          <div
                            style={{
                              aspectRatio: "16/9",
                              backgroundImage: `url(${movie.thumbnail})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              position: "relative",
                            }}
                          >
                            {/* Episode Badge */}
                            <div
                              style={{
                                position: "absolute",
                                top: "0.5rem",
                                left: "0.5rem",
                                backgroundColor: "#dc2626",
                                color: "white",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.25rem",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                zIndex: 30,
                              }}
                            >
                              Tập {movie.episode || "N/A"}
                            </div>

                            {/* Gradient Overlay for Title */}
                            <div
                              style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: "50%",
                                background:
                                  "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent)",
                                zIndex: 15,
                              }}
                            />
                          </div>

                          {/* Episode Info */}
                          <div style={{ padding: "1rem" }}>
                            <h4
                              style={{
                                color: "white",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                margin: "0 0 0.5rem 0",
                                lineHeight: "1.25",
                              }}
                            >
                              {movie.title}
                            </h4>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                fontSize: "0.75rem",
                                color: "#9ca3af",
                              }}
                            >
                              <span>⏱️ {movie.duration}</span>
                              <span>•</span>
                              <span
                                style={{
                                  color:
                                    movie.status === "END"
                                      ? "#10b981"
                                      : "#f59e0b",
                                }}
                              >
                                {movie.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Ad Banner - Before Pagination - DISABLED */}
          {/* <div className="w-full py-4">
            <AdBanner zoneId="movies-before-pagination" height="h-24 sm:h-32" />
          </div> */}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
                marginTop: "3rem",
              }}
              className="flex justify-center items-center gap-1 sm:gap-4 mt-6 sm:mt-12"
            >
              <button
                onClick={() => fetchMovies(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "0.5rem",
                  backgroundColor: currentPage === 1 ? "#374151" : "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "2.5rem",
                  transition: "all 0.3s ease",
                }}
                className="p-1.5 sm:p-2.5 bg-gray-700 disabled:bg-gray-600 text-white border-none rounded-lg cursor-pointer disabled:cursor-not-allowed text-sm sm:text-lg font-medium flex items-center justify-center min-w-[2rem] sm:min-w-[2.5rem] transition-all duration-300"
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.backgroundColor = "#b91c1c";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.backgroundColor = "#dc2626";
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                ‹
              </button>

              {/* Page Numbers */}
              <div
                style={{ display: "flex", gap: "0.5rem" }}
                className="flex gap-1 sm:gap-2"
              >
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchMovies(pageNum)}
                      style={{
                        padding: "0.5rem 0.75rem",
                        backgroundColor:
                          currentPage === pageNum ? "#dc2626" : "#374151",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        minWidth: "2rem",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      className="p-1.5 sm:p-2.5 px-2 sm:px-3 bg-gray-700 data-[active=true]:bg-red-600 text-white border-none rounded-lg cursor-pointer text-xs sm:text-sm font-medium min-w-[1.5rem] sm:min-w-[2.5rem] transition-all duration-300 flex items-center justify-center"
                      onMouseEnter={(e) => {
                        if (currentPage !== pageNum) {
                          e.currentTarget.style.backgroundColor = "#4b5563";
                          e.currentTarget.style.transform = "scale(1.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== pageNum) {
                          e.currentTarget.style.backgroundColor = "#374151";
                          e.currentTarget.style.transform = "scale(1)";
                        }
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => fetchMovies(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: "0.5rem",
                  backgroundColor:
                    currentPage === totalPages ? "#374151" : "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "2.5rem",
                  transition: "all 0.3s ease",
                }}
                className="p-1.5 sm:p-2.5 bg-gray-700 disabled:bg-gray-600 text-white border-none rounded-lg cursor-pointer disabled:cursor-not-allowed text-sm sm:text-lg font-medium flex items-center justify-center min-w-[2rem] sm:min-w-[2.5rem] transition-all duration-300"
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.backgroundColor = "#b91c1c";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.backgroundColor = "#dc2626";
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 640px) {
          .search-container:focus-within {
            transform: scale(1.02);
            border-color: #dc2626;
            background-color: rgba(55, 65, 81, 0.95);
            box-shadow: 0 8px 30px rgba(220, 38, 38, 0.2);
          }
        }
      `}</style>
    </div>
  );
}
