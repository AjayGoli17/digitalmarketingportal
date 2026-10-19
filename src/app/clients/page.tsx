"use client";

import * as React from "react";
import Link from "next/link";
import {
  Camera,
  Video,
  Pin,
  ShoppingBag,
  Plus,
  Search,
  ExternalLink,
  Check,
  X,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SAMPLE_CLIENTS, Client } from "@/lib/data/clients";

export default function ClientsDirectoryPage() {
  const [activeTab, setActiveTab] = React.useState<"all" | "active" | "in_production">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isNewClientOpen, setIsNewClientOpen] = React.useState(false);
  const [newClientName, setNewClientName] = React.useState("");
  const [newClientCategory, setNewClientCategory] = React.useState("");
  const [newClientCreated, setNewClientCreated] = React.useState(false);

  // Filter clients based on tab and search query
  const filteredClients = React.useMemo(() => {
    return SAMPLE_CLIENTS.filter((client) => {
      const matchesTab =
        activeTab === "all"
          ? true
          : activeTab === "active"
          ? client.status === "active"
          : client.status === "in_production";

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        client.name.toLowerCase().includes(q) ||
        client.category.toLowerCase().includes(q) ||
        client.industry.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const renderPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return (
          <span key="instagram" title="Instagram">
            <Camera className="w-3.5 h-3.5 text-ink-secondary" />
          </span>
        );
      case "video":
      case "tiktok":
        return (
          <span key="video" title="Shortform Video">
            <Video className="w-3.5 h-3.5 text-ink-secondary" />
          </span>
        );
      case "pinterest":
        return (
          <span key="pin" title="Pinterest">
            <Pin className="w-3.5 h-3.5 text-ink-secondary" />
          </span>
        );
      case "bag":
        return (
          <span key="bag" title="E-commerce">
            <ShoppingBag className="w-3.5 h-3.5 text-ink-secondary" />
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Page Header matching clients_refined.png */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-label-caps text-ink-tertiary uppercase tracking-wider font-semibold">
              Client Workspaces
            </span>
            <Badge variant="neutral" size="sm">
              {SAMPLE_CLIENTS.filter((c) => c.status === "active").length} active
            </Badge>
          </div>
          <h1 className="text-headline-lg lg:text-display-lg font-semibold text-ink-primary tracking-tight">
            Select Client
          </h1>
        </div>

        {/* Tab Switcher & New Client Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <div className="w-48 sm:w-56">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              leftIcon={<Search className="w-3.5 h-3.5" />}
              className="h-9 text-body-sm"
            />
          </div>

          {/* Filter Pills */}
          <div className="inline-flex rounded-lg border border-hairline-subtle bg-white p-0.5 text-body-sm shadow-whisper">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
                activeTab === "all"
                  ? "bg-surface-container text-ink-primary"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              All Clients
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
                activeTab === "active"
                  ? "bg-surface-container text-ink-primary"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("in_production")}
              className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
                activeTab === "in_production"
                  ? "bg-surface-container text-ink-primary"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              In Production
            </button>
          </div>

          {/* New Client Action */}
          <Button
            variant="accent"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsNewClientOpen(true)}
          >
            New Client
          </Button>
        </div>
      </div>

      {/* Clients Grid matching clients_refined.png */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const isComplete = client.cycleProgress === 100;
          return (
            <Card
              key={client.id}
              className="overflow-hidden flex flex-col justify-between group transition-all duration-200 hover:shadow-popover hover:border-zinc-300"
            >
              {/* Media Preview Banner */}
              <div
                className={`relative aspect-[16/10] bg-gradient-to-br ${client.bannerGradient} overflow-hidden flex flex-col items-center justify-center p-6 text-center select-none`}
              >
                {/* Visual Representation of Editorial Banner */}
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-lg font-serif italic text-ink-primary tracking-wide">
                    {client.bannerImageText || client.name}
                  </span>
                  {client.bannerSubtitle && (
                    <span className="text-[10px] text-ink-secondary tracking-widest mt-1 uppercase font-medium">
                      {client.bannerSubtitle}
                    </span>
                  )}
                </div>

                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4 bg-white flex-1 flex flex-col justify-between">
                <div>
                  {/* Avatar and Title */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high text-ink-primary font-semibold flex items-center justify-center text-xs border border-hairline-subtle shrink-0">
                      {client.initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-title-md font-semibold text-ink-primary truncate">
                        {client.name}
                      </h3>
                      <span className="text-body-sm text-ink-secondary block truncate">
                        {client.category}
                      </span>
                    </div>
                  </div>

                  {/* Platform Icons */}
                  <div className="flex items-center gap-2.5 mt-3 pt-1">
                    {client.platforms.map((p) => renderPlatformIcon(p))}
                  </div>
                </div>

                {/* Monthly Quota Progress */}
                <div className="space-y-1.5 pt-3 border-t border-hairline">
                  <div className="flex justify-between items-baseline text-body-sm font-medium">
                    <span className="text-ink-secondary text-xs">
                      {client.deliveredCount} / {client.totalQuotas} delivered
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        isComplete ? "text-emerald-600" : "text-ink-primary"
                      }`}
                    >
                      {isComplete ? "100% complete" : `${client.cycleProgress}%`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isComplete ? "bg-emerald-600" : "bg-aura-primary"
                      }`}
                      style={{ width: `${client.cycleProgress}%` }}
                    />
                  </div>
                </div>

                {/* Navigation CTA Button to Workspace */}
                <Link href={`/clients/${client.slug}`} className="block pt-1">
                  <Button variant="accent" size="sm" className="w-full justify-center">
                    Open Workspace →
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}

        {/* Add New Client Dashed Card */}
        <div
          onClick={() => setIsNewClientOpen(true)}
          className="rounded-xl border border-dashed border-hairline-subtle p-8 bg-white/50 hover:bg-white hover:border-zinc-400 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center min-h-[380px]"
        >
          <div className="w-11 h-11 rounded-full bg-surface-container-low border border-hairline-subtle flex items-center justify-center text-ink-primary mb-4 shadow-sm">
            <Plus className="w-5 h-5 stroke-[2]" />
          </div>
          <h3 className="text-title-md font-semibold text-ink-primary mb-1">
            Add New Client
          </h3>
          <p className="text-body-sm text-ink-secondary max-w-xs mb-6">
            Invite a brand partner or stage a new client workspace.
          </p>
          <span className="text-xs font-medium text-aura-primary hover:text-indigo-700 flex items-center gap-1">
            Invite Partner ›
          </span>
        </div>
      </div>

      {/* Bottom Footer Status Bar matching clients_refined.png */}
      <div className="pt-8 mt-12 border-t border-hairline-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-ink-secondary">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>All client workspaces synced with production CDN</span>
          <span className="text-ink-tertiary">·</span>
          <span className="text-ink-tertiary">Last asset updated 14m ago by Studio Nord</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="hover:text-ink-primary transition-colors cursor-pointer"
            onClick={() => alert("Monthly audit report queued for download.")}
          >
            Export Monthly Audit
          </button>
          <span className="text-ink-tertiary">·</span>
          <span className="text-ink-tertiary">Archived Accounts (4)</span>
        </div>
      </div>

      {/* New Client Modal */}
      {isNewClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-hairline-subtle shadow-popover max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <h3 className="text-headline-sm font-semibold text-ink-primary">
                  New Client Workspace
                </h3>
                <p className="text-body-sm text-ink-secondary">
                  Stage a new client retainer workspace in Aura.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewClientOpen(false);
                  setNewClientCreated(false);
                }}
                className="text-ink-tertiary hover:text-ink-primary p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {newClientCreated ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6 stroke-[2]" />
                </div>
                <h4 className="text-title-md font-semibold text-ink-primary">
                  Client Workspace Staged
                </h4>
                <p className="text-body-sm text-ink-secondary">
                  {newClientName || "New Client"} has been added to the staging pipeline.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsNewClientOpen(false);
                    setNewClientCreated(false);
                    setNewClientName("");
                    setNewClientCategory("");
                  }}
                  className="mt-2"
                >
                  Done
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newClientName) {
                    setNewClientCreated(true);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-body-sm font-medium text-ink-primary block">
                    Client Name
                  </label>
                  <Input
                    placeholder="e.g. Atelier Vrai"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-body-sm font-medium text-ink-primary block">
                    Industry / Business Type
                  </label>
                  <Input
                    placeholder="e.g. Fine Jewelry"
                    value={newClientCategory}
                    onChange={(e) => setNewClientCategory(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-body-sm font-medium text-ink-primary block">
                    Retainer Tier
                  </label>
                  <select className="h-9 w-full rounded-md border border-hairline-subtle bg-white px-3 text-body-sm text-ink-primary outline-none focus:border-aura-primary focus:ring-3 focus:ring-aura-primary/10">
                    <option>Monthly Retainer Tier I (8 Deliverables)</option>
                    <option>Monthly Retainer Tier II (12 Deliverables)</option>
                    <option>Bespoke Editorial Retainer</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-hairline">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsNewClientOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="accent" size="sm">
                    Create Workspace
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
