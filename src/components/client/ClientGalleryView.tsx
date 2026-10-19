"use client";

import * as React from "react";
import {
  Calendar,
  ArrowUpDown,
  Filter,
  Play,
  Download,
  CheckCircle2,
  Image as ImageIcon,
  Clock,
  Layers,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ContentItem } from "@/lib/data/contentItems";
import { AssetReviewDetailView } from "./AssetReviewDetailView";
import { useContentWorkflow } from "@/components/context/ContentWorkflowContext";

export function ClientGalleryView({
  clientName = "Kanso Botanicals",
}: {
  clientName?: string;
}) {
  const { items, approveContent } = useContentWorkflow();
  const [formatFilter, setFormatFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedAsset, setSelectedAsset] = React.useState<ContentItem | null>(null);

  // Filter items belonging to this client
  const clientItems = React.useMemo(() => {
    const target = (clientName || "Kanso Botanicals").trim().toLowerCase();
    return (items || []).filter((item) => {
      if (!item) return false;
      const itemName = (item.clientName || "").trim().toLowerCase();
      const itemSlug = (item.clientSlug || "").trim().toLowerCase();
      return (
        itemSlug === target ||
        (target && itemName.includes(target)) ||
        (itemName && target.includes(itemName))
      );
    });
  }, [items, clientName]);

  const filteredItems = React.useMemo(() => {
    return clientItems.filter((item) => {
      const matchFormat =
        formatFilter === "all"
          ? true
          : formatFilter === "posts"
          ? item.format === "post"
          : formatFilter === "carousels"
          ? item.format === "carousel"
          : formatFilter === "reels"
          ? item.format === "reel"
          : item.format === "story";

      const matchStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      return matchFormat && matchStatus;
    });
  }, [clientItems, formatFilter, statusFilter]);

  const pendingCount = clientItems.filter((i) => i.status === "pending").length;
  const approvedCount = clientItems.filter((i) => i.status === "approved").length;
  const changesCount = clientItems.filter((i) => i.status === "changes").length;
  const publishedCount = clientItems.filter((i) => i.status === "published").length;

  const handleBatchApprove = () => {
    const pending = clientItems.filter((i) => i.status === "pending");
    if (pending.length === 0) {
      alert("No deliverables currently pending client sign-off.");
      return;
    }
    pending.forEach((i) => approveContent(i.id));
  };

  if (selectedAsset) {
    return (
      <AssetReviewDetailView
        item={selectedAsset}
        onBack={() => setSelectedAsset(null)}
        onApprove={(id) => {
          approveContent(id);
        }}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Header matching client_content.png */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-label-caps text-ink-tertiary uppercase font-semibold tracking-wider">
            <span>Archive & Pipeline</span>
            <span>•</span>
            <span>Q4 Campaign Cycle</span>
          </div>
          <h1 className="text-headline-lg lg:text-display-lg font-semibold text-ink-primary tracking-tight font-serif italic">
            Content Gallery
          </h1>
          <p className="text-body-sm text-ink-secondary mt-1">
            Browse the curated editorial archive and active pipeline for {clientName}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {pendingCount > 0 && (
            <Badge variant="pending" size="sm" withDot>
              {pendingCount} Actions Required
            </Badge>
          )}
          {changesCount > 0 && (
            <Badge variant="changes" size="sm" withDot>
              {changesCount} Changes Requested
            </Badge>
          )}
          <Badge variant="approved" size="sm" withDot>
            {approvedCount} Approved
          </Badge>
        </div>
      </div>

      {/* Filter and Sorting Controls matching client_content.png */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-hairline-subtle pb-4">
        {/* Format Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setFormatFilter("all")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-medium transition-colors ${
              formatFilter === "all"
                ? "bg-ink-primary text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>All</span>
            <span className="text-[10px] opacity-80">{clientItems.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setFormatFilter("posts")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-medium transition-colors ${
              formatFilter === "posts"
                ? "bg-ink-primary text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>Posts</span>
            <span className="text-[10px] opacity-80">
              {clientItems.filter((i) => i.format === "post").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFormatFilter("carousels")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-medium transition-colors ${
              formatFilter === "carousels"
                ? "bg-ink-primary text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>Carousels</span>
            <span className="text-[10px] opacity-80">
              {clientItems.filter((i) => i.format === "carousel").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFormatFilter("reels")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-medium transition-colors ${
              formatFilter === "reels"
                ? "bg-ink-primary text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>Reels</span>
            <span className="text-[10px] opacity-80">
              {clientItems.filter((i) => i.format === "reel").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFormatFilter("stories")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-medium transition-colors ${
              formatFilter === "stories"
                ? "bg-ink-primary text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>Stories</span>
            <span className="text-[10px] opacity-80">
              {clientItems.filter((i) => i.format === "story").length}
            </span>
          </button>
        </div>

        {/* Right dropdown filters */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline-subtle bg-white text-ink-primary shadow-whisper">
            <Calendar className="w-3.5 h-3.5 text-ink-tertiary" />
            <span className="font-medium">November 2024</span>
          </div>

          <button
            type="button"
            onClick={() =>
              setStatusFilter((prev) =>
                prev === "all"
                  ? "pending"
                  : prev === "pending"
                  ? "changes"
                  : prev === "changes"
                  ? "approved"
                  : "all"
              )
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              statusFilter !== "all"
                ? "bg-aura-primary/10 border-aura-primary text-aura-primary font-medium"
                : "border-hairline-subtle bg-white text-ink-primary shadow-whisper"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>
              {statusFilter === "all"
                ? "Filter Status"
                : statusFilter === "pending"
                ? "Status: Pending"
                : statusFilter === "changes"
                ? "Status: Changes"
                : "Status: Approved"}
            </span>
          </button>
        </div>
      </div>

      {/* Masonry / Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isVideo = item.format === "reel";
          const badgeVariant: BadgeVariant =
            item.status === "approved"
              ? "approved"
              : item.status === "changes"
              ? "changes"
              : item.status === "published"
              ? "published"
              : item.status === "draft"
              ? "draft"
              : "pending";

          return (
            <Card
              key={item.id}
              onClick={() => setSelectedAsset(item)}
              className="overflow-hidden flex flex-col justify-between group transition-all duration-200 hover:shadow-popover hover:border-zinc-300 cursor-pointer"
            >
              {/* Media Viewport */}
              <div
                className={`relative ${
                  isVideo ? "aspect-[9/14]" : "aspect-[4/5]"
                } bg-gradient-to-br ${item.bgGradient} flex flex-col justify-between p-4 overflow-hidden`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between z-20">
                  <Badge variant="frosted-dark" size="sm">
                    {item.formatLabel.toUpperCase()}
                    {item.slideCount && item.slideCount > 1
                      ? ` • ${item.slideCount} slides`
                      : ""}
                  </Badge>

                  <Badge variant={badgeVariant} size="sm" withDot>
                    {item.statusLabel || item.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Video Play Button Overlay */}
                {isVideo && (
                  <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-ink-primary shadow-lg mx-auto my-auto transition-transform group-hover:scale-110">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                )}

                {/* Visual Label */}
                {!isVideo && (
                  <div className="my-auto text-center p-6">
                    <span className="text-xl font-serif italic text-ink-primary block leading-tight">
                      {clientName}
                    </span>
                    <span className="text-[11px] font-semibold text-ink-secondary tracking-widest uppercase mt-1 block">
                      {item.title}
                    </span>
                  </div>
                )}

                {/* Bottom Overlay if Reel */}
                {isVideo && (
                  <div className="z-20 text-[11px] text-white/90 flex items-center justify-between bg-black/40 backdrop-blur-sm p-2 rounded-lg">
                    <span>♫ Ambient Soundtrack • 4K</span>
                    <span>lll</span>
                  </div>
                )}
              </div>

              {/* Card Footer Info */}
              <div className="p-4 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-tertiary">
                    {item.channels.join(", ").toUpperCase()}
                  </span>
                  {item.status === "changes" && (
                    <span className="text-[11px] font-medium text-red-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      Changes Requested
                    </span>
                  )}
                  {item.status === "approved" && (
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Approved
                    </span>
                  )}
                  {item.status === "pending" && (
                    <span className="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Needs Sign-Off
                    </span>
                  )}
                </div>

                <h3 className="text-body-sm font-semibold text-ink-primary leading-tight group-hover:text-aura-primary transition-colors">
                  {item.title}
                </h3>

                <div className="flex items-center justify-between text-xs text-ink-secondary pt-2 border-t border-hairline">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-ink-tertiary" /> Nov {item.day} • {item.time}
                  </span>
                  <span className="text-[11px] text-ink-tertiary font-medium">
                    Aspect {item.aspectRatio}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Bottom Summary Bar */}
      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shadow-whisper">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-ink-secondary shrink-0 border border-hairline-subtle">
            <Layers className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h4 className="text-body-sm font-semibold text-ink-primary">
              {clientItems.length} Deliverables in Active Cycle
            </h4>
            <span className="text-xs text-ink-secondary">
              {approvedCount} approved • {pendingCount} pending client sign-off • {changesCount} revisions
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => alert("Archive download queued (Sample Mode).")}
          >
            Export Archive
          </Button>

          {pendingCount > 0 && (
            <Button
              variant="accent"
              size="sm"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={handleBatchApprove}
            >
              Batch Sign-Off ({pendingCount})
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
