"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ViewMode = "agency" | "client";

interface ViewModeContextType {
  mode: ViewMode;
  isClientView: boolean;
  toggleViewMode: () => void;
  setMode: (mode: ViewMode) => void;
  selectedClient: string;
  setSelectedClient: (client: string) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ViewMode>("agency");
  const [selectedClient, setSelectedClient] = useState<string>("Kanso Botanicals");

  // Load persisted view mode preference if present
  useEffect(() => {
    const saved = localStorage.getItem("aura_view_mode");
    if (saved === "client" || saved === "agency") {
      setMode(saved);
    }
  }, []);

  const toggleViewMode = () => {
    setMode((prev) => {
      const next = prev === "agency" ? "client" : "agency";
      localStorage.setItem("aura_view_mode", next);
      return next;
    });
  };

  const handleSetMode = (newMode: ViewMode) => {
    setMode(newMode);
    localStorage.setItem("aura_view_mode", newMode);
  };

  return (
    <ViewModeContext.Provider
      value={{
        mode,
        isClientView: mode === "client",
        toggleViewMode,
        setMode: handleSetMode,
        selectedClient,
        setSelectedClient,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
}
