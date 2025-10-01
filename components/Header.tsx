"use client";

import { useState } from "react";
import { Search, Menu, X, Play, Star } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-dark-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img
              src="/assets/logo.jpg"
              alt="GL VietSub Logo"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-xl font-bold gradient-text">GL VietSub</h1>
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

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-800 border border-dark-600 rounded-lg pl-10 pr-4 py-2 w-64 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            <button className="btn-primary">
              <Search className="w-4 h-4" />
            </button>
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
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm phim..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-dark-800 border border-dark-600 rounded-lg pl-10 pr-4 py-2 w-full text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                />
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
