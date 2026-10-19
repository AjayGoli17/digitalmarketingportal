"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Network,
  Image as ImageIcon,
  CheckSquare,
  Package,
  ChevronsUpDown,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AGENCY_NAV_ITEMS, NavItem } from "@/lib/constants";
import { useViewMode } from "@/components/context/ViewModeContext";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { isClientView, toggleViewMode } = useViewMode();

  const getIcon = (name: NavItem["iconName"]) => {
    const iconClass = "w-4 h-4 shrink-0";
    switch (name) {
      case "dashboard":
        return <LayoutDashboard className={iconClass} />;
      case "clients":
        return <Users className={iconClass} />;
      case "workspace":
        return <Network className={iconClass} />;
      case "content":
        return <ImageIcon className={iconClass} />;
      case "approvals":
        return <CheckSquare className={iconClass} />;
      case "deliverables":
        return <Package className={iconClass} />;
    }
  };

  return (
    <aside
      className={cn(
        "w-[260px] h-screen bg-white border-r border-hairline-subtle flex flex-col justify-between shrink-0 select-none",
        className
      )}
    >
      {/* Top Header / Brand */}
      <div className="flex flex-col">
        <div className="h-16 px-5 flex items-center justify-between border-b border-hairline/60">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Aura Squircle Logo */}
            <div className="w-8 h-8 rounded-lg bg-ink-primary flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-title-md font-semibold text-ink-primary tracking-tight">
                Aura
              </span>
            </div>
          </Link>
          <button
            type="button"
            className="text-ink-tertiary hover:text-ink-primary transition-colors p-1 rounded"
            aria-label="Switch organization"
          >
            <ChevronsUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="px-3 pt-6">
          <div className="px-3 mb-2 text-label-caps text-ink-tertiary font-semibold uppercase tracking-wider">
            Workspace
          </div>
          <nav className="space-y-1">
            {AGENCY_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-body-sm font-medium transition-colors",
                    isActive
                      ? "bg-surface-container text-ink-primary"
                      : "text-ink-secondary hover:bg-surface-container-low hover:text-ink-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        isActive ? "text-ink-primary" : "text-ink-secondary"
                      )}
                    >
                      {getIcon(item.iconName)}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-aura-primary/10 text-aura-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Area: Client View Switch & Profile */}
      <div className="p-3 border-t border-hairline/60 space-y-3">
        {/* Client View Toggle */}
        <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-ink-secondary" />
            <span className="text-body-sm font-medium text-ink-primary">
              Client View
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isClientView}
            onClick={toggleViewMode}
            className={cn(
              "w-10 h-5 rounded-full transition-colors relative flex items-center px-0.5",
              isClientView ? "bg-aura-primary" : "bg-zinc-300"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 block",
                isClientView ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs font-medium overflow-hidden border border-hairline-subtle">
              <span>SN</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-body-sm font-medium text-ink-primary leading-tight">
                Studio Nord
              </span>
              <span className="text-[11px] text-ink-tertiary">
                agency-lead
              </span>
            </div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-ink-tertiary" />
        </div>
      </div>
    </aside>
  );
}
