"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ClientHeader } from "./ClientHeader";
import { MobileClientNav } from "./MobileClientNav";
import { useViewMode } from "@/components/context/ViewModeContext";
import { X } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isClientView } = useViewMode();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile drawer on route navigation or escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isClientView) {
    return (
      <div className="min-h-screen bg-canvas text-ink-primary flex flex-col font-sans selection:bg-aura-primary/20 pb-16 md:pb-0">
        <ClientHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <MobileClientNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex font-sans selection:bg-aura-primary/20">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar className="fixed inset-y-0 left-0" />
      </div>

      {/* Mobile Sidebar Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-ink-primary/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:hidden transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative">
          <Sidebar />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-1 rounded-md text-ink-secondary hover:text-ink-primary bg-surface-container-low"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        <Header onMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
