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
          <a
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/logo.jpg"
              alt="GLVIETSUB Logo"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-xl font-bold gradient-text">GLVIETSUB</h1>
              <p className="text-xs text-gray-400">Xem phim online HD</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <a
              href="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
            >
              Trang chủ
            </a>
            <a
              href="#"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
              onClick={(e) => {
                e.preventDefault();
                const filterSection = document.getElementById("filter-section");
                if (filterSection) {
                  filterSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }}
            >
              Tìm kiếm
            </a>
            <a
              href="#"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
              onClick={(e) => {
                e.preventDefault();
                const filterSection = document.getElementById("filter-section");
                if (filterSection) {
                  filterSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }}
            >
              Thể loại
            </a>
          </nav>

          {/* Desktop Mode Toggle */}
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
                👩 Girl Love
              </button>
              <button
                onClick={() => setMode("boy")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === "boy"
                    ? "bg-primary-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                👨 Boy Love
              </button>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Mode Toggle */}
            <div className="flex items-center bg-dark-800 rounded-lg p-0.5">
              <button
                onClick={() => setMode("girl")}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  mode === "girl"
                    ? "bg-primary-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                👩
              </button>
              <button
                onClick={() => setMode("boy")}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  mode === "boy"
                    ? "bg-primary-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                👨
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-primary-400 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark-700">
            <div className="space-y-4">
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
