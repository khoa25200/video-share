"use client";

import { useState, useEffect } from "react";

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
}

interface MoviesResponse {
  page: number;
  limit: number;
  total: number;
  data: Movie[];
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<MoviesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/movies?page=1&limit=12");

        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }

        const data = await response.json();
        setMovies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

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
              <div
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  background: "linear-gradient(to right, #dc2626, #b91c1c)",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                }}
              >
                GL
              </div>
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

            <nav style={{ display: "flex", gap: "2rem" }}>
              <a href="/" style={{ color: "white", textDecoration: "none" }}>
                Trang chủ
              </a>
              <a
                href="/movies"
                style={{ color: "#dc2626", textDecoration: "none" }}
              >
                Phim mới
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
          padding: "4rem 0",
          textAlign: "center",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}
        >
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              background: "linear-gradient(to right, #f87171, #dc2626)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Phim Mới Nhất
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "#9ca3af",
              marginBottom: "2rem",
            }}
          >
            Khám phá những bộ phim hay nhất
          </p>
        </div>
      </section>

      {/* Movies Grid */}
      <section style={{ padding: "2rem 0" }}>
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}
        >
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

                  {/* Play Button */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 20,
                      opacity: 0,
                      transition: "opacity 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "0";
                    }}
                  >
                    <button
                      onClick={() => handlePlay(movie)}
                      style={{
                        width: "4rem",
                        height: "4rem",
                        backgroundColor: "#dc2626",
                        borderRadius: "50%",
                        border: "none",
                        color: "white",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      ▶
                    </button>
                  </div>

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
                      <span style={{ color: "#9ca3af" }}>{movie.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlay(movie)}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span>▶</span>
                    <span>Xem phim</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
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
