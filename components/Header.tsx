"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useMode } from "@/lib/mode-context";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { mode, setMode, modeLabel } = useMode();

  return (
    <header className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-dark-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img
              src="/assets/logo.jpg"
              alt="GLVIETSUB Logo"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-xl font-bold gradient-text">GLVIETSUB</h1>
              <p className="text-xs text-gray-400">Xem phim online HD</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/"
              className="text-white hover:text-primary-400 transition-colors"
            >
              Trang chủ
            </a>
            <a
              href="/movies"
              className="text-white hover:text-primary-400 transition-colors"
            >
              Phim mới
            </a>
            <a
              href="#"
              className="text-white hover:text-primary-400 transition-colors"
            >
              Phim lẻ
            </a>
            <a
              href="#"
              className="text-white hover:text-primary-400 transition-colors"
            >
              Phim bộ
            </a>
            <a
              href="#"
              className="text-white hover:text-primary-400 transition-colors"
            >
              Thể loại
            </a>
          </nav>

          {/* Mode Toggle Only */}
          <div className="hidden md:flex items-center">
            {/* Mode Toggle */}
            <div className="flex items-center bg-dark-800 rounded-lg p-1">
              <button
                onClick={() => setMode("girl")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === "girl"
                    ? "bg-primary-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                👩 Phim Girl
              </button>
              <button
                onClick={() => setMode("boy")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === "boy"
                    ? "bg-primary-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                👨 Phim Boy
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-primary-400 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark-700">
            <div className="space-y-4">
              {/* Mobile Mode Toggle */}
              <div className="flex items-center bg-dark-800 rounded-lg p-1">
                <button
                  onClick={() => {
                    setMode("girl");
                    setIsMenuOpen(false);
                  }}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    mode === "girl"
                      ? "bg-primary-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  👩 Phim Girl
                </button>
                <button
                  onClick={() => {
                    setMode("boy");
                    setIsMenuOpen(false);
                  }}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    mode === "boy"
                      ? "bg-primary-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  👨 Phim Boy
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <a
                  href="/"
                  className="block text-white hover:text-primary-400 transition-colors py-2"
                >
                  Trang chủ
                </a>
                <a
                  href="/movies"
                  className="block text-white hover:text-primary-400 transition-colors py-2"
                >
                  Phim mới
                </a>
                <a
                  href="#"
                  className="block text-white hover:text-primary-400 transition-colors py-2"
                >
                  Phim lẻ
                </a>
                <a
                  href="#"
                  className="block text-white hover:text-primary-400 transition-colors py-2"
                >
                  Phim bộ
                </a>
                <a
                  href="#"
                  className="block text-white hover:text-primary-400 transition-colors py-2"
                >
                  Thể loại
                </a>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
