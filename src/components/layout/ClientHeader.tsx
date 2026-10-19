"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useViewMode } from "@/components/context/ViewModeContext";
import { CLIENT_TABS } from "@/lib/constants";
import { ArrowLeft, User } from "lucide-react";

export function ClientHeader() {
  const pathname = usePathname();
  const { selectedClient, toggleViewMode } = useViewMode();

  return (
    <header className="bg-white border-b border-hairline-subtle sticky top-0 z-30 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Client Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high text-ink-primary font-semibold flex items-center justify-center text-xs border border-hairline-subtle">
            {selectedClient.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </div>
          <div className="flex flex-col">
            <span className="text-title-md font-semibold text-ink-primary leading-tight">
              {selectedClient}
            </span>
            <span className="text-[10px] tracking-wider uppercase text-ink-tertiary font-medium">
              Client Portal • Powered by Aura
            </span>
          </div>
        </div>

        {/* Client Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 border-x border-hairline-subtle px-4 mx-4">
          {CLIENT_TABS.slice(0, 3).map((tab) => {
            const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.title}
                href={tab.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-body-sm font-medium transition-colors flex items-center gap-1.5",
                  isActive
                    ? "bg-surface-container text-ink-primary"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low"
                )}
              >
                <span>{tab.title}</span>
                {tab.badge && (
                  <span className="w-4 h-4 rounded-full bg-aura-primary text-white text-[10px] flex items-center justify-center font-medium">
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Info & Exit Client View */}
        <div className="flex items-center gap-4">
          {/* Agency Contact Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-body-sm text-ink-secondary">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span>
              Agency Contact: <strong className="font-medium text-ink-primary">Studio Nord</strong>
            </span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-4 border-l border-hairline-subtle">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-body-sm font-medium text-ink-primary leading-tight">
                Elena Rostova
              </span>
              <span className="text-[11px] text-ink-tertiary">
                Brand Lead
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-hairline-subtle flex items-center justify-center text-ink-secondary">
              <User className="w-4 h-4" />
            </div>
          </div>

          {/* Switch back button */}
          <button
            type="button"
            onClick={toggleViewMode}
            className="flex items-center gap-1 text-[11px] font-medium text-aura-primary bg-aura-primary/10 hover:bg-aura-primary/15 px-2.5 py-1.5 rounded-md transition-colors"
            title="Return to Agency Workspace"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Client View</span>
          </button>
        </div>
      </div>
    </header>
  );
}
