"use client";

import { useState, useEffect } from "react";
import { sendTelegramNotification, getUserIP } from "@/lib/telegram";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [topRanking, setTopRanking] = useState<Movie[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchHighlights = async () => {
    try {
      setHighlightsLoading(true);
      const response = await fetch("/api/highlights");

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
      const response = await fetch("/api/ranking");

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

  useEffect(() => {
    fetchMovies(1);
    fetchHighlights();
    fetchTopRanking();

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

  // Refetch movies when active filters change
  useEffect(() => {
    fetchMovies(1);
  }, [activeSearchQuery, activeCategory, activeYear, activeCountry]);

  // Function to apply search and filters
  const applyFilters = () => {
    setActiveSearchQuery(searchQuery);
    setActiveCategory(selectedCategory);
    setActiveYear(selectedYear);
    setActiveCountry(selectedCountry);
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
    if (highlights.length > 1) {
      const interval = setInterval(() => {
        setCurrentHighlightIndex((prev) => (prev + 1) % highlights.length);
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [highlights.length]);

  const handlePlay = (movie: Movie) => {
    // Chuyển hướng đến trang chi tiết phim
    window.location.href = `/movies/${movie.id}`;
  };

  const extractVideoUrl = (iframe: string) => {
    const match = iframe.match(/src="([^"]+)"/);
    return match ? match[1] : "";
  };

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
      <header
        style={{
          backgroundColor: "#1f2937",
          padding: "1rem 0",
          borderBottom: "1px solid #374151",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <img
                src="/assets/logo.jpg"
                alt="GL VietSub Logo"
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "0.5rem",
                  objectFit: "cover",
                }}
              />
              <div>
                <h1
                  style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}
                >
                  GL VietSub
                </h1>
                <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: 0 }}>
                  Xem phim online HD
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav
              style={{
                display: "flex",
                gap: "2rem",
                alignItems: "center",
              }}
              className="hidden md:flex"
            >
              <a href="/" style={{ color: "white", textDecoration: "none" }}>
                Trang chủ
              </a>

              <a
                href="/movies"
                style={{ color: "white", textDecoration: "none" }}
              >
                Phim Reels
              </a>

              {/* View Mode Toggle */}
              <div
                style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem" }}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor:
                      viewMode === "grid" ? "#dc2626" : "#374151",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    transition: "all 0.3s ease",
                  }}
                >
                  📋 Lưới
                </button>
                <button
                  onClick={() => setViewMode("series")}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor:
                      viewMode === "series" ? "#dc2626" : "#374151",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    transition: "all 0.3s ease",
                  }}
                >
                  📺 Series
                </button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                display: "none",
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                fontSize: "1.5rem",
                cursor: "pointer",
                padding: "0.5rem",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="md:hidden"
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "#111827",
                borderTop: "1px solid #374151",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                zIndex: 40,
              }}
              className="md:hidden"
            >
              <a
                href="/"
                style={{
                  color: "white",
                  textDecoration: "none",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #374151",
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Trang chủ
              </a>

              <a
                href="/movies"
                style={{
                  color: "white",
                  textDecoration: "none",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #374151",
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Phim Reels
              </a>

              {/* Mobile View Mode Toggle */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #374151",
                }}
              >
                <button
                  onClick={() => {
                    setViewMode("grid");
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor:
                      viewMode === "grid" ? "#dc2626" : "#374151",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    transition: "all 0.3s ease",
                    flex: 1,
                  }}
                >
                  📋 Lưới
                </button>
                <button
                  onClick={() => {
                    setViewMode("series");
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor:
                      viewMode === "series" ? "#dc2626" : "#374151",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    transition: "all 0.3s ease",
                    flex: 1,
                  }}
                >
                  📺 Series
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Highlights Section */}
      {!highlightsLoading && highlights.length > 0 && (
        <section style={{ padding: "2rem 0", backgroundColor: "#0f172a" }}>
          <div
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}
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
              </h2>
              <p style={{ color: "#9ca3af", fontSize: "1rem" }}>
                Những bộ phim được yêu thích nhất
              </p>
            </div>

            <div
              style={{
                position: "relative",
                width: "100%",
                height: "400px",
                overflow: "hidden",
                borderRadius: "1rem",
                backgroundColor: "#1e293b",
              }}
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
                    >
                      {/* Highlight Badge */}
                      <div style={{ marginBottom: "1rem" }}>
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
                        >
                          ⭐ PHIM NỔI BẬT
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
                      >
                        <span>📅 {movie.year}</span>
                        <span>•</span>
                        <span>🌍 {movie.country}</span>
                        <span>•</span>
                        <span>🎭 {movie.category}</span>
                        <span>•</span>
                        <span>⏱️ {movie.duration}</span>
                      </div>

                      {/* Description */}
                      <p
                        style={{
                          fontSize: "1rem",
                          lineHeight: "1.5",
                          marginBottom: "1.5rem",
                          color: "#d1d5db",
                          maxWidth: "600px",
                        }}
                      >
                        {movie.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
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

              {/* Dots Indicator */}
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

      {/* Top Ranking Section */}
      {!rankingLoading && topRanking.length > 0 && (
        <section style={{ padding: "2rem 0", backgroundColor: "#1e293b" }}>
          <div
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}
          >
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "white",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              🏆 TOP 5 PHIM XEM NHIỀU NHẤT
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
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
      <section style={{ padding: "1rem 0", backgroundColor: "#1f2937" }}>
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {/* Search Bar - Full Width */}
            <div
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(55, 65, 81, 0.8)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid transparent",
                  borderRadius: "50px",
                  padding: "0.75rem",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
                className="search-container"
              >
                <div
                  style={{
                    position: "absolute",
                    left: "1.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    fontSize: "1.2rem",
                    transition: "all 0.3s ease",
                  }}
                  className="search-icon"
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
                    padding: "0.75rem 1rem 0.75rem 3.5rem",
                    backgroundColor: "transparent",
                    border: "none",
                    outline: "none",
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: "400",
                  }}
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
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "2.5rem",
                      height: "2.5rem",
                      backgroundColor: "rgba(239, 68, 68, 0.2)",
                      color: "#ef4444",
                      border: "none",
                      borderRadius: "50%",
                      cursor: "pointer",
                      fontSize: "1rem",
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
                gap: "1rem",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setActiveCategory(e.target.value);
                }}
                style={{
                  backgroundColor: "#374151",
                  color: "white",
                  border: "1px solid #4b5563",
                  borderRadius: "25px",
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  minWidth: "140px",
                  transition: "all 0.3s ease",
                }}
                title="Chọn thể loại phim"
                onFocus={(e) => {
                  e.target.style.borderColor = "#dc2626";
                  e.target.style.backgroundColor = "#4b5563";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#4b5563";
                  e.target.style.backgroundColor = "#374151";
                }}
              >
                <option value="">🎭 Thể loại</option>
                <option value="Tình Cảm">Tình Cảm</option>
                <option value="Hành Động">Hành Động</option>
                <option value="Hài Hước">Hài Hước</option>
                <option value="Cổ Trang">Cổ Trang</option>
                <option value="Kinh Dị">Kinh Dị</option>
                <option value="Khoa Học Viễn Tưởng">Khoa Học Viễn Tưởng</option>
              </select>

              {/* Country Filter */}
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setActiveCountry(e.target.value);
                }}
                style={{
                  backgroundColor: "#374151",
                  color: "white",
                  border: "1px solid #4b5563",
                  borderRadius: "25px",
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  minWidth: "140px",
                  transition: "all 0.3s ease",
                }}
                title="Chọn quốc gia"
                onFocus={(e) => {
                  e.target.style.borderColor = "#dc2626";
                  e.target.style.backgroundColor = "#4b5563";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#4b5563";
                  e.target.style.backgroundColor = "#374151";
                }}
              >
                <option value="">🌍 Quốc gia</option>
                <option value="Trung Quốc">Trung Quốc</option>
                <option value="Hàn Quốc">Hàn Quốc</option>
                <option value="Nhật Bản">Nhật Bản</option>
                <option value="Thái Lan">Thái Lan</option>
                <option value="Việt Nam">Việt Nam</option>
                <option value="Mỹ">Mỹ</option>
              </select>

              {/* Year Filter */}
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setActiveYear(e.target.value);
                }}
                style={{
                  backgroundColor: "#374151",
                  color: "white",
                  border: "1px solid #4b5563",
                  borderRadius: "25px",
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  minWidth: "140px",
                  transition: "all 0.3s ease",
                }}
                title="Chọn năm phát hành"
                onFocus={(e) => {
                  e.target.style.borderColor = "#dc2626";
                  e.target.style.backgroundColor = "#4b5563";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#4b5563";
                  e.target.style.backgroundColor = "#374151";
                }}
              >
                <option value="">📅 Năm</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>

              {/* Search Button */}
              <button
                onClick={applyFilters}
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  color: "#22c55e",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  borderRadius: "25px",
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
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
                    borderRadius: "25px",
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
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
      <section style={{ padding: "2rem 0" }}>
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}
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
          >
            <p>
              Trang {currentPage} / {totalPages} - Tổng {movies?.total || 0}{" "}
              phim
            </p>
          </div>

          {viewMode === "grid" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {movies?.data.map((movie) => (
                <div
                  key={movie.id}
                  style={{
                    backgroundColor: "#1f2937",
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    cursor: "pointer",
                  }}
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
                    style={{
                      aspectRatio: "3/4",
                      backgroundImage: `url(${movie.thumbnail})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                      overflow: "hidden",
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
                    <div
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        zIndex: 30,
                      }}
                    >
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                          backgroundColor:
                            movie.status === "END" ? "#10b981" : "#f59e0b",
                          color: "white",
                        }}
                      >
                        {movie.status === "END" ? "Hoàn thành" : movie.status}
                      </span>
                    </div>

                    {/* Series Badge */}
                    {movie.series && (
                      <div
                        style={{
                          position: "absolute",
                          top: "0.75rem",
                          left: "0.75rem",
                          zIndex: 30,
                        }}
                      >
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                            backgroundColor: "#dc2626",
                            color: "white",
                          }}
                        >
                          📺 {movie.series}
                        </span>
                      </div>
                    )}

                    {/* Episode Badge */}
                    {movie.episode && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "0.75rem",
                          left: "0.75rem",
                          zIndex: 30,
                        }}
                      >
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                            backgroundColor: "rgba(0,0,0,0.8)",
                            color: "white",
                          }}
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
                          color: "white",
                          fontWeight: "600",
                          fontSize: "1.125rem",
                          marginBottom: "0.25rem",
                          lineHeight: "1.25",
                        }}
                      >
                        {movie.title}
                      </h3>
                      {movie.originalTitle && (
                        <p
                          style={{
                            color: "#d1d5db",
                            fontSize: "0.875rem",
                            marginBottom: "0.5rem",
                            fontStyle: "italic",
                          }}
                        >
                          {movie.originalTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Movie Details */}
                  <div style={{ padding: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        fontSize: "0.875rem",
                        color: "#d1d5db",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span style={{ color: "#dc2626" }}>📅</span>
                        <span>{movie.year}</span>
                        <span style={{ color: "#6b7280" }}>•</span>
                        <span>{movie.country}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span style={{ color: "#dc2626" }}>⏱️</span>
                        <span>{movie.duration}</span>
                        <span style={{ color: "#6b7280" }}>•</span>
                        <span>{movie.episodes} tập</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span style={{ color: "#dc2626" }}>🎭</span>
                        <span style={{ color: "#9ca3af" }}>
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
            >
              <button
                onClick={() => fetchMovies(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "0.75rem",
                  backgroundColor: currentPage === 1 ? "#374151" : "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "1.2rem",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "3rem",
                  transition: "all 0.3s ease",
                }}
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
              <div style={{ display: "flex", gap: "0.5rem" }}>
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
                        padding: "0.75rem 1rem",
                        backgroundColor:
                          currentPage === pageNum ? "#dc2626" : "#374151",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        fontSize: "1rem",
                        fontWeight: "500",
                        minWidth: "3rem",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
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
                  padding: "0.75rem",
                  backgroundColor:
                    currentPage === totalPages ? "#374151" : "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: "1.2rem",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "3rem",
                  transition: "all 0.3s ease",
                }}
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
      `}</style>
    </div>
  );
}
