"use client";

import * as React from "react";
import { useViewMode } from "@/components/context/ViewModeContext";
import { useContentWorkflow } from "@/components/context/ContentWorkflowContext";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  CheckSquare,
  Clock,
  Play,
  CheckCircle2,
  Edit2,
  Calendar,
  Layers,
  Globe,
  Send,
  AlertCircle,
  MessageSquare,
  Info,
  X,
} from "lucide-react";
import { ContentItem } from "@/lib/data/contentItems";
import { AssetReviewDetailView } from "@/components/client/AssetReviewDetailView";
import { RequestChangesModal } from "@/components/client/RequestChangesModal";
import { EditAndResubmitModal } from "@/components/content/EditAndResubmitModal";

export default function ApprovalsPage() {
  const { isClientView, selectedClient } = useViewMode();
  const {
    items,
    approveContent,
    requestChanges,
    submitForApproval,
    markPublished,
    lastActionNotice,
    dismissNotice,
    error,
    clearError,
    resetSampleData,
  } = useContentWorkflow();

  const [selectedAsset, setSelectedAsset] = React.useState<ContentItem | null>(null);
  const [changesAsset, setChangesAsset] = React.useState<ContentItem | null>(null);
  const [editAsset, setEditAsset] = React.useState<ContentItem | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Filter items based on client view and status tab
  const clientFiltered = React.useMemo(() => {
    return (items || []).filter((item) => {
      if (!item) return false;
      if (isClientView) {
        const sel = (selectedClient || "").trim().toLowerCase();
        const itemName = (item.clientName || "").trim().toLowerCase();
        const itemSlug = (item.clientSlug || "").trim().toLowerCase();
        return (
          itemSlug === sel ||
          (sel && itemName.includes(sel)) ||
          (itemName && sel.includes(itemName))
        );
      }
      return true;
    });
  }, [items, isClientView, selectedClient]);

  const displayedItems = React.useMemo(() => {
    return clientFiltered.filter((item) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "pending") return item.status === "pending";
      if (statusFilter === "changes") return item.status === "changes";
      if (statusFilter === "approved") return item.status === "approved";
      if (statusFilter === "published") return item.status === "published";
      if (statusFilter === "draft") return item.status === "draft";
      return true;
    });
  }, [clientFiltered, statusFilter]);

  // Counts for tabs
  const pendingCount = clientFiltered.filter((i) => i.status === "pending").length;
  const changesCount = clientFiltered.filter((i) => i.status === "changes").length;
  const approvedCount = clientFiltered.filter((i) => i.status === "approved").length;
  const publishedCount = clientFiltered.filter((i) => i.status === "published").length;
  const draftCount = clientFiltered.filter((i) => i.status === "draft").length;

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
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Transient Action Notice Banner */}
      {lastActionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-whisper animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{lastActionNotice}</span>
          </div>
          <button
            type="button"
            onClick={dismissNotice}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between shadow-whisper">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-red-700 hover:text-red-900 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-label-caps text-ink-tertiary uppercase font-semibold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-aura-primary" />
            <span>{isClientView ? `${selectedClient} Portal` : "Studio Nord Agency"}</span>
            <span>•</span>
            <span>Approval Pipeline</span>
          </div>
          <h1 className="text-headline-lg lg:text-display-lg font-semibold text-ink-primary tracking-tight font-serif italic">
            Approvals Queue
          </h1>
          <p className="text-body-sm text-ink-secondary mt-1">
            {isClientView
              ? `Review and sign off on creative deliverables for ${selectedClient} prior to publishing.`
              : "Review creative deliverables, read client feedback notes, and process revisions."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="pending" size="sm" withDot>
            {pendingCount} Pending Sign-Off
          </Badge>
          <Badge variant="changes" size="sm" withDot>
            {changesCount} Changes
          </Badge>
          <Badge variant="approved" size="sm" withDot>
            {approvedCount} Approved
          </Badge>
        </div>
      </div>

      {/* Retainer Progress Summary Banner */}
      <Card className="p-5 bg-white border border-hairline-subtle shadow-whisper">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-ink-primary">
              <Layers className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="text-body-sm font-semibold text-ink-primary">
                Workflow Synchronization (Sample Mode)
              </h3>
              <p className="text-xs text-ink-secondary">
                {clientFiltered.length} total deliverables tracked across {selectedClient} cycle
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-amber-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> {pendingCount} Awaiting Client
            </span>
            <span className="flex items-center gap-1.5 text-red-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-600" /> {changesCount} Changes Requested
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> {approvedCount} Approved
            </span>
            <span className="flex items-center gap-1.5 text-aura-primary font-medium">
              <Globe className="w-3.5 h-3.5" /> {publishedCount} Published
            </span>
          </div>
        </div>
        <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-600"
            style={{ width: `${(approvedCount / Math.max(1, clientFiltered.length)) * 100}%` }}
          />
          <div
            className="h-full bg-aura-primary"
            style={{ width: `${(publishedCount / Math.max(1, clientFiltered.length)) * 100}%` }}
          />
          <div
            className="h-full bg-amber-500"
            style={{ width: `${(pendingCount / Math.max(1, clientFiltered.length)) * 100}%` }}
          />
          <div
            className="h-full bg-red-500"
            style={{ width: `${(changesCount / Math.max(1, clientFiltered.length)) * 100}%` }}
          />
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline-subtle pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-ink-primary text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            All ({clientFiltered.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            Pending Approval ({pendingCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("changes")}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
              statusFilter === "changes"
                ? "bg-red-600 text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            Changes Requested ({changesCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
              statusFilter === "approved"
                ? "bg-emerald-600 text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            Approved ({approvedCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("published")}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
              statusFilter === "published"
                ? "bg-aura-primary text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            Published ({publishedCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
              statusFilter === "draft"
                ? "bg-zinc-700 text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        <button
          type="button"
          onClick={resetSampleData}
          className="text-[11px] text-ink-tertiary hover:text-ink-primary underline transition-colors"
        >
          Reset Sample Queue
        </button>
      </div>

      {/* Items Grid */}
      {displayedItems.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-hairline p-8">
          <CheckSquare className="w-10 h-10 text-ink-tertiary mx-auto stroke-[1.25]" />
          <h3 className="text-title-md font-semibold text-ink-primary">
            No Deliverables in this Queue
          </h3>
          <p className="text-body-sm text-ink-secondary max-w-sm mx-auto">
            There are currently no assets matching the &ldquo;{statusFilter}&rdquo; filter. Select &ldquo;All&rdquo; to view the complete pipeline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedItems.map((item) => {
            const isVideo = item.format === "reel";
            const latestFeedback =
              item.feedbackHistory && item.feedbackHistory.length > 0
                ? item.feedbackHistory[0]
                : null;

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
                className="overflow-hidden flex flex-col justify-between group transition-all duration-200 hover:shadow-popover border border-hairline-subtle bg-white"
              >
                {/* Media Preview Area */}
                <div
                  onClick={() => setSelectedAsset(item)}
                  className={`relative aspect-[4/5] bg-gradient-to-br ${item.bgGradient} flex flex-col justify-between p-4 overflow-hidden cursor-pointer select-none`}
                >
                  <div className="flex items-center justify-between z-20">
                    <Badge variant="frosted-dark" size="sm">
                      {item.formatLabel.toUpperCase()}
                      {item.revisionCount && item.revisionCount > 1
                        ? ` • v${item.revisionCount}`
                        : ""}
                    </Badge>

                    <Badge variant={badgeVariant} size="sm" withDot>
                      {item.statusLabel || item.status.toUpperCase()}
                    </Badge>
                  </div>

                  {isVideo ? (
                    <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-ink-primary shadow-lg mx-auto my-auto group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  ) : (
                    <div className="my-auto text-center p-6">
                      <span className="text-2xl font-serif italic text-ink-primary block leading-tight">
                        {item.clientName}
                      </span>
                      <span className="text-xs font-semibold text-ink-secondary tracking-widest uppercase mt-1 block">
                        {item.title}
                      </span>
                    </div>
                  )}

                  <div className="z-20 text-[11px] text-white/90 flex items-center justify-between bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <span className="truncate">
                      Nov {item.day}, {item.year} • {item.time}
                    </span>
                    <span className="font-mono">Aspect {item.aspectRatio}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3 bg-white">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold uppercase tracking-wider text-ink-tertiary">
                        {item.clientName}
                      </span>
                      <span className="text-ink-secondary font-medium">
                        Instagram {item.format}
                      </span>
                    </div>
                    <h3
                      onClick={() => setSelectedAsset(item)}
                      className="text-headline-sm font-semibold text-ink-primary leading-tight cursor-pointer hover:text-aura-primary transition-colors"
                    >
                      {item.title}
                    </h3>
                    <p className="text-body-sm text-ink-secondary line-clamp-2 mt-1 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>

                  {/* Feedback callout if changes requested */}
                  {item.status === "changes" && latestFeedback && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-amber-900">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Client Feedback ({latestFeedback.targetArea})
                        </span>
                        <span className="text-[10px] text-amber-700 font-normal">
                          {latestFeedback.createdAt}
                        </span>
                      </div>
                      <p className="text-amber-800 line-clamp-2 leading-relaxed">
                        &ldquo;{latestFeedback.note}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Approval callout if approved */}
                  {item.status === "approved" && item.approvalRecord && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Approved by {item.approvalRecord.approvedBy} on {item.approvalRecord.approvedAt}
                      </span>
                    </div>
                  )}

                  {/* Published callout if published */}
                  {item.status === "published" && item.publishedAt && (
                    <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-aura-primary text-xs flex items-center gap-2">
                      <Globe className="w-4 h-4 text-aura-primary shrink-0" />
                      <span>Published on {item.publishedAt}</span>
                    </div>
                  )}

                  {/* Action Buttons based on View Mode */}
                  <div className="pt-3 border-t border-hairline flex items-center justify-between gap-3">
                    {isClientView ? (
                      /* Client View Actions */
                      item.status === "pending" ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setChangesAsset(item)}
                            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Request Edit
                          </Button>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedAsset(item)}
                            >
                              Review
                            </Button>

                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() => approveContent(item.id)}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            >
                              Sign Off
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs text-ink-tertiary">
                            Status: {item.statusLabel}
                          </span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedAsset(item)}
                          >
                            Inspect Detail
                          </Button>
                        </div>
                      )
                    ) : (
                      /* Agency View Actions */
                      <div className="flex items-center justify-between w-full gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedAsset(item)}
                        >
                          Inspect
                        </Button>

                        {item.status === "draft" && (
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={() => submitForApproval(item.id)}
                            leftIcon={<Send className="w-3.5 h-3.5" />}
                          >
                            Submit for Approval
                          </Button>
                        )}

                        {item.status === "changes" && (
                          <Button
                            variant="accent"
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700"
                            onClick={() => setEditAsset(item)}
                            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                          >
                            Edit & Resubmit
                          </Button>
                        )}

                        {item.status === "approved" && (
                          <Button
                            variant="accent"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => markPublished(item.id)}
                            leftIcon={<Globe className="w-3.5 h-3.5" />}
                          >
                            Publish
                          </Button>
                        )}

                        {item.status === "pending" && (
                          <span className="text-xs text-amber-700 font-medium">
                            Awaiting client sign-off
                          </span>
                        )}

                        {item.status === "published" && (
                          <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Published
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Changes Modal */}
      {changesAsset && (
        <RequestChangesModal
          isOpen={Boolean(changesAsset)}
          onClose={() => setChangesAsset(null)}
          assetTitle={changesAsset.title}
          slideNumber={1}
          onSendFeedback={(fb) => {
            requestChanges(changesAsset.id, fb);
          }}
        />
      )}

      {/* Edit & Resubmit Modal for Agency */}
      {editAsset && (
        <EditAndResubmitModal
          isOpen={Boolean(editAsset)}
          onClose={() => setEditAsset(null)}
          item={editAsset}
        />
      )}
    </div>
  );
}
