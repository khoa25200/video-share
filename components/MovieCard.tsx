"use client";

import { useState } from "react";
import { Play, Star, Calendar, Clock, Users, Eye } from "lucide-react";

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

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
}

export default function MovieCard({ movie, onPlay }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: string) => {
    if (status === "END") return "bg-green-500";
    if (status.includes("Tập")) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const getStatusText = (status: string) => {
    if (status === "END") return "Hoàn thành";
    if (status.includes("Tập")) return status;
    return "Đang cập nhật";
  };

  return (
    <div
      className="movie-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Movie Poster Placeholder */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-dark-700 to-dark-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

        {/* Play Button Overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={() => onPlay(movie)}
            className="w-16 h-16 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300"
            aria-label={`Play ${movie.title}`}
          >
            <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-30">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
              movie.status
            )}`}
          >
            {getStatusText(movie.status)}
          </span>
        </div>

        {/* Movie Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">
            {movie.title}
          </h3>
          {movie.originalTitle && (
            <p className="text-gray-300 text-sm mb-2 italic">
              {movie.originalTitle}
            </p>
          )}
        </div>
      </div>

      {/* Movie Details */}
      <div className="p-4">
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-primary-400" />
            <span>{movie.year}</span>
            <span className="text-gray-500">•</span>
            <span>{movie.country}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-primary-400" />
            <span>{movie.duration}</span>
            <span className="text-gray-500">•</span>
            <span>{movie.episodes} tập</span>
          </div>

          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-primary-400" />
            <span className="text-gray-400 truncate">{movie.category}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => onPlay(movie)}
            className="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Xem phim</span>
          </button>
          <button className="btn-secondary" aria-label="View details">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
