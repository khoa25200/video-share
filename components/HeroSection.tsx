"use client";

import { useState, useEffect } from "react";
import { Play, Star, TrendingUp, Users, Calendar } from "lucide-react";

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
}

interface HeroSectionProps {
  featuredMovies: Movie[];
  onPlay: (movie: Movie) => void;
}

export default function HeroSection({
  featuredMovies,
  onPlay,
}: HeroSectionProps) {
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredMovies.length > 0) {
      setCurrentMovie(featuredMovies[0]);
    }
  }, [featuredMovies]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
      setCurrentMovie(featuredMovies[currentIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredMovies, currentIndex]);

  if (!currentMovie) {
    return (
      <section className="relative h-[70vh] bg-gradient-to-r from-dark-800 to-dark-900 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-dark-700 rounded w-64 mb-4"></div>
          <div className="h-4 bg-dark-700 rounded w-48"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[70vh] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark-800 via-dark-900 to-dark-800">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          {/* Movie Info */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {currentMovie.title}
            </h1>

            {currentMovie.originalTitle && (
              <p className="text-xl text-gray-300 mb-4 italic">
                {currentMovie.originalTitle}
              </p>
            )}

            <div className="flex items-center space-x-6 text-sm text-gray-300 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-primary-400" />
                <span>{currentMovie.year}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary-400" />
                <span>{currentMovie.country}</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-primary-400" />
                <span>{currentMovie.category}</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <span className="text-gray-300 text-sm">9.2/10</span>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-lg leading-relaxed mb-6 line-clamp-3">
              {currentMovie.description ||
                "Một bộ phim hấp dẫn với cốt truyện thú vị và diễn xuất xuất sắc..."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onPlay(currentMovie)}
              className="flex items-center space-x-3 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Play className="w-6 h-6" fill="currentColor" />
              <span>Xem ngay</span>
            </button>

            <button className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-300 backdrop-blur-sm border border-white/20">
              <Star className="w-5 h-5" />
              <span>Yêu thích</span>
            </button>
          </div>
        </div>
      </div>

      {/* Movie Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex space-x-2">
          {featuredMovies.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setCurrentMovie(featuredMovies[index]);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-primary-500 w-8" : "bg-white/30"
              }`}
              aria-label={`Go to movie ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
