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
  isInitialized: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<MovieMode>(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("movie-mode") as MovieMode;
      return savedMode && (savedMode === "girl" || savedMode === "boy")
        ? savedMode
        : "girl";
    }
    return "girl";
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Save mode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("movie-mode", mode);
    }
  }, [mode]);

  const modeLabel = mode === "girl" ? "Phim Girl" : "Phim Boy";

  return (
    <ModeContext.Provider value={{ mode, setMode, modeLabel, isInitialized }}>
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
