"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SAMPLE_CLIENTS } from "@/lib/data/clients";

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

  // Direct link support: ?view=client|agency and &client=<slug> override the
  // saved localStorage mode on first load.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view");
    const clientParam = params.get("client");

    if (viewParam === "client" || viewParam === "agency") {
      setMode(viewParam);
      localStorage.setItem("aura_view_mode", viewParam);
    } else {
      const saved = localStorage.getItem("aura_view_mode");
      if (saved === "client" || saved === "agency") {
        setMode(saved);
      }
    }

    if (clientParam) {
      const match = SAMPLE_CLIENTS.find(
        (c) => c.slug.toLowerCase() === clientParam.trim().toLowerCase()
      );
      if (match) {
        setSelectedClient(match.name);
      }
    }
    // Intentionally only read the URL on first load, not on every navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
