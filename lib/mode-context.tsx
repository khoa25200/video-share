"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type MovieMode = "girl" | "boy";

interface ModeContextType {
  mode: MovieMode;
  setMode: (mode: MovieMode) => void;
  modeLabel: string;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<MovieMode>("girl");

  // Load mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("movie-mode") as MovieMode;
    if (savedMode && (savedMode === "girl" || savedMode === "boy")) {
      setMode(savedMode);
    }
  }, []);

  // Save mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("movie-mode", mode);
  }, [mode]);

  const modeLabel = mode === "girl" ? "Phim Girl" : "Phim Boy";

  return (
    <ModeContext.Provider value={{ mode, setMode, modeLabel }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}
