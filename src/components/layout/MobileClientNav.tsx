"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LayoutGrid, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileClientNav() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Overview",
      href: "/",
      icon: Sparkles,
      isActive: pathname === "/",
    },
    {
      title: "Content",
      href: "/content",
      icon: LayoutGrid,
      isActive: pathname === "/content" || pathname.startsWith("/client/content"),
    },
    {
      title: "Approvals",
      href: "/approvals",
      icon: CheckCircle2,
      badge: 2,
      isActive: pathname === "/approvals" || pathname.startsWith("/client/review"),
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-hairline-subtle z-40 md:hidden py-1 px-4 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[11px] font-medium transition-colors relative",
              item.isActive
                ? "text-aura-primary font-semibold"
                : "text-ink-secondary hover:text-ink-primary"
            )}
          >
            <div className="relative">
              <Icon className="w-5 h-5 stroke-[1.75]" />
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-aura-primary text-white text-[9px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="mt-1">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
