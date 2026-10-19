"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SAMPLE_CLIENTS } from "@/lib/data/clients";

export interface HeaderProps {
  onMenuToggle?: () => void;
  breadcrumbs?: string[];
  onNewPost?: () => void;
}

export function Header({
  onMenuToggle,
  breadcrumbs,
  onNewPost,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const dynamicBreadcrumbs = React.useMemo(() => {
    if (breadcrumbs) return breadcrumbs;

    if (pathname === "/clients") {
      return ["Aura Agency", "Client Workspaces"];
    }

    if (pathname.startsWith("/clients/")) {
      const slug = pathname.replace("/clients/", "");
      const client = SAMPLE_CLIENTS.find((c) => c.slug === slug);
      if (client) {
        return ["Aura Agency", client.name];
      }
    }

    if (pathname === "/workspace") {
      return ["Aura Agency", "Kanso Botanicals Workspace"];
    }

    return ["Aura Agency", "Acme Global Campaign"];
  }, [breadcrumbs, pathname]);

  return (
    <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-hairline-subtle px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Mobile Menu Button & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center text-body-sm">
          {dynamicBreadcrumbs.map((crumb, index) => {
            const isLast = index === dynamicBreadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb}>
                {index > 0 && (
                  <span className="mx-2 text-ink-tertiary select-none">›</span>
                )}
                <span
                  className={
                    isLast
                      ? "text-ink-primary font-medium"
                      : "text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
                  }
                >
                  {crumb}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right Controls: Search, Notification Bell, New Post CTA */}
      <div className="flex items-center gap-3">
        <div className="w-48 md:w-72 lg:w-80">
          <Input
            placeholder="Search deliverables, assets..."
            leftIcon={<Search className="w-4 h-4" />}
            className="h-9 text-body-sm bg-surface-container-low/50 border-hairline-subtle"
          />
        </div>

        <button
          type="button"
          className="relative p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-aura-primary" />
        </button>

        <Button
          variant="accent"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onNewPost || (() => router.push("/content"))}
          className="font-medium whitespace-nowrap"
        >
          New Post
        </Button>
      </div>
    </header>
  );
}
