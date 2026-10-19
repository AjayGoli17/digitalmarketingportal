"use client";

import * as React from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageSquare,
  Maximize2,
  Copy,
  Check,
  Edit2,
  CheckCircle,
  X,
  User,
  History,
  Send,
  Globe,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ContentItem } from "@/lib/data/contentItems";
import { RequestChangesModal } from "./RequestChangesModal";
import { EditAndResubmitModal } from "@/components/content/EditAndResubmitModal";
import { useViewMode } from "@/components/context/ViewModeContext";
import { useContentWorkflow } from "@/components/context/ContentWorkflowContext";

export interface AssetReviewDetailViewProps {
  item: ContentItem;
  onBack: () => void;
  onApprove?: (id: string) => void;
}

export function AssetReviewDetailView({
  item: propItem,
  onBack,
  onApprove,
}: AssetReviewDetailViewProps) {
  const { isClientView } = useViewMode();
  const {
    getItem,
    approveContent,
    requestChanges,
    submitForApproval,
    markPublished,
  } = useContentWorkflow();

  // Always use the latest reactive state from workflow context
  const currentItem = getItem(propItem.id) || propItem;

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isChangesOpen, setIsChangesOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [showPinCallout, setShowPinCallout] = React.useState(true);
  const [showHistory, setShowHistory] = React.useState(false);

  const slides = currentItem.slides && currentItem.slides.length > 0
    ? currentItem.slides
    : [
        {
          id: 1,
          title: currentItem.title,
          bgGradient: currentItem.bgGradient,
        },
      ];

  const totalSlides = slides.length;

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(currentItem.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApprove = () => {
    approveContent(currentItem.id, "Elena Rostova (Client)");
    if (onApprove) onApprove(currentItem.id);
  };

  const handlePublish = () => {
    markPublished(currentItem.id);
  };

  const handleSubmitDraft = () => {
    submitForApproval(currentItem.id);
  };

  const latestFeedback =
    currentItem.feedbackHistory && currentItem.feedbackHistory.length > 0
      ? currentItem.feedbackHistory[0]
      : null;

  const statusVariant: BadgeVariant =
    currentItem.status === "approved"
      ? "approved"
      : currentItem.status === "changes"
      ? "changes"
      : currentItem.status === "published"
      ? "published"
      : currentItem.status === "draft"
      ? "draft"
      : "pending";

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-in fade-in duration-300 pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-ink-primary font-semibold text-headline-sm hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
          <span>Asset Review Detail</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-tertiary hidden sm:inline">
            {isClientView ? "Client View" : "Agency Studio"}
          </span>
          <div className="w-9 h-9 rounded-full bg-aura-primary text-white flex items-center justify-center font-medium shadow-sm">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Subtitle Line with Campaign & Status Pill */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-aura-primary uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-aura-primary" />
          <span>{currentItem.clientName} • Q4 CAMPAIGN</span>
        </div>

        <Badge variant={statusVariant} size="sm" withDot>
          {currentItem.statusLabel || currentItem.status.toUpperCase()}
        </Badge>
      </div>

      {/* Main Asset Frame matching content_detail.png */}
      <div className="rounded-2xl overflow-hidden border border-hairline shadow-popover bg-white">
        <div
          className={`relative aspect-[4/5] bg-gradient-to-br ${
            slides[currentSlide]?.bgGradient || currentItem.bgGradient
          } flex flex-col justify-between overflow-hidden group`}
        >
          {/* Top Frame Bar: Avatar & Slide Count */}
          <div className="p-4 z-20 flex items-center justify-between text-white drop-shadow">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white text-ink-primary font-bold text-xs flex items-center justify-center">
                {currentItem.clientInitials}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight text-white">
                  {currentItem.clientSlug.replace("-", "")}
                </span>
                <span className="text-[10px] text-white/80">
                  {currentItem.formatLabel} Asset
                </span>
              </div>
            </div>

            <span className="text-label-caps uppercase bg-black/40 backdrop-blur-md px-2.5 py-1 rounded text-white font-mono">
              Slide {currentSlide + 1} of {totalSlides}
            </span>
          </div>

          {/* Visual Canvas Representation */}
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none relative">
            <div className="p-5 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 max-w-[260px] shadow-sm">
              <span className="text-xl font-serif italic text-ink-primary block leading-tight">
                {currentItem.clientName}
              </span>
              <span className="text-xs font-semibold text-ink-secondary tracking-widest uppercase mt-1 block">
                {slides[currentSlide]?.title || currentItem.title}
              </span>
            </div>

            {/* Interactive Feedback Pin Node (1) pinned over media if feedback exists */}
            {latestFeedback && (
              <div
                onClick={() => setShowPinCallout((prev) => !prev)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform animate-pulse"
                title="Click to view Client Feedback Note"
              >
                1
              </div>
            )}
          </div>

          {/* Prev / Next Arrows */}
          {totalSlides > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setCurrentSlide((p) => (p > 0 ? p - 1 : totalSlides - 1))
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-ink-primary hover:bg-white shadow z-20"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentSlide((p) => (p < totalSlides - 1 ? p + 1 : 0))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-ink-primary hover:bg-white shadow z-20"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Slide Indicator Dots */}
          <div className="p-3 z-20 flex justify-center gap-1.5">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === i ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick Meta Row below preview */}
        <div className="p-3.5 bg-white flex items-center justify-between text-xs text-ink-secondary border-t border-hairline">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 hover:text-ink-primary">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" /> Ready
            </span>
            <button
              type="button"
              onClick={() => setShowPinCallout((prev) => !prev)}
              className="flex items-center gap-1.5 hover:text-ink-primary"
            >
              <MessageSquare className="w-4 h-4" />{" "}
              {currentItem.feedbackHistory?.length || 0} Notes
            </button>
            <span className="text-ink-tertiary">Aspect {currentItem.aspectRatio}</span>
          </div>
          <Maximize2 className="w-4 h-4 text-ink-tertiary hover:text-ink-primary cursor-pointer" />
        </div>
      </div>

      {/* Pin Callout Note Card matching content_detail.png */}
      {showPinCallout && latestFeedback && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 shadow-whisper relative animate-in fade-in duration-200">
          <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
            1
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-amber-950">
                Latest Client Revision Request ({latestFeedback.targetArea})
              </span>
              <span className="text-amber-800 text-[11px]">
                {latestFeedback.createdAt}
              </span>
            </div>
            <p className="text-body-sm text-amber-900 leading-relaxed font-sans">
              &ldquo;{latestFeedback.note}&rdquo;
            </p>
            <div className="text-[11px] text-amber-700 pt-0.5">
              Reviewer: <span className="font-medium">{latestFeedback.reviewerName}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPinCallout(false)}
            className="text-amber-600 hover:text-amber-900 p-0.5"
            aria-label="Dismiss note"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Approval Verification Card if approved */}
      {currentItem.approvalRecord && (
        <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 flex items-center gap-3 text-xs shadow-whisper">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold text-emerald-950 block">
              Authorized by {currentItem.approvalRecord.approvedBy}
            </span>
            <span className="text-emerald-800 text-[11px]">
              Sign-off recorded on {currentItem.approvalRecord.approvedAt}
            </span>
          </div>
          <Badge variant="approved" size="sm">
            Sign-off Verified
          </Badge>
        </div>
      )}

      {/* Published Card if published */}
      {currentItem.status === "published" && currentItem.publishedAt && (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-3 text-xs shadow-whisper">
          <Globe className="w-5 h-5 text-aura-primary shrink-0" />
          <div className="flex-1">
            <span className="font-semibold text-indigo-950 block">
              Published to Social Grid
            </span>
            <span className="text-indigo-800 text-[11px]">
              Live status synchronized on {currentItem.publishedAt}
            </span>
          </div>
          <Badge variant="published" size="sm">
            Live
          </Badge>
        </div>
      )}

      {/* Full Revision History Collapsible */}
      {currentItem.feedbackHistory && currentItem.feedbackHistory.length > 1 && (
        <div className="border border-hairline-subtle rounded-xl bg-white overflow-hidden shadow-whisper">
          <button
            type="button"
            onClick={() => setShowHistory((p) => !p)}
            className="w-full p-3.5 flex items-center justify-between text-xs font-semibold text-ink-primary hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-ink-secondary" />
              <span>Prior Revision Rounds ({currentItem.feedbackHistory.length} Total)</span>
            </div>
            <span className="text-aura-primary">
              {showHistory ? "Hide History" : "Show All"}
            </span>
          </button>

          {showHistory && (
            <div className="p-3.5 border-t border-hairline-subtle space-y-3 bg-surface-container-low/40 text-xs">
              {currentItem.feedbackHistory.map((fb, idx) => (
                <div key={fb.id} className="p-3 bg-white rounded-lg border border-hairline space-y-1">
                  <div className="flex justify-between text-[11px] text-ink-tertiary">
                    <span className="font-semibold text-ink-secondary">
                      Round {currentItem.feedbackHistory!.length - idx} • {fb.targetArea}
                    </span>
                    <span>{fb.createdAt}</span>
                  </div>
                  <p className="text-ink-primary">{fb.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Copy & Technical Specifications Card */}
      <Card className="p-5 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 pb-3 border-b border-hairline">
          <span className="font-semibold text-ink-primary">
            Instagram {currentItem.formatLabel} • {totalSlides} Slide{totalSlides > 1 ? "s" : ""}
          </span>
          <span className="text-ink-secondary">
            Nov {currentItem.day}, {currentItem.year} • {currentItem.time}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-tertiary">
              Caption & Copy
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs text-aura-primary font-medium hover:text-indigo-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <p className="text-body-sm text-ink-primary leading-relaxed whitespace-pre-wrap p-3 rounded-lg bg-surface-container-low/60 border border-hairline-subtle">
            {currentItem.caption}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-ink-secondary">
          <span className="px-2 py-0.5 rounded bg-surface-container border border-hairline">
            Channels: {currentItem.channels.join(", ")}
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-container border border-hairline font-mono">
            Aspect: {currentItem.aspectRatio}
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-container border border-hairline">
            Revision: v{currentItem.revisionCount || 1}
          </span>
        </div>
      </Card>

      {/* Sticky Bottom Review Action Bar matching content_detail.png */}
      <div className="fixed bottom-14 md:bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-hairline-subtle py-3 px-4 z-30 shadow-popover">
        <div className="max-w-xl mx-auto space-y-1.5">
          {isClientView ? (
            /* CLIENT VIEW ACTIONS */
            currentItem.status === "pending" ? (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Edit2 className="w-4 h-4" />}
                  onClick={() => setIsChangesOpen(true)}
                  className="justify-center bg-surface-container-low hover:bg-surface-container font-medium"
                >
                  Changes
                </Button>

                <Button
                  variant="accent"
                  size="md"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  onClick={handleApprove}
                  className="justify-center font-medium bg-aura-primary hover:bg-[#4338CA]"
                >
                  Approve Post
                </Button>
              </div>
            ) : currentItem.status === "approved" ? (
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-center text-xs font-semibold border border-emerald-200">
                ✓ Approved for scheduled publication
              </div>
            ) : currentItem.status === "changes" ? (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 text-amber-800 text-xs border border-amber-200">
                <span>Changes requested. Agency is preparing revision.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChangesOpen(true)}
                  className="text-amber-900 underline"
                >
                  Add More Notes
                </Button>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-indigo-50 text-aura-primary text-center text-xs font-semibold border border-indigo-200">
                Status: {currentItem.statusLabel}
              </div>
            )
          ) : (
            /* AGENCY VIEW ACTIONS */
            <div className="flex items-center justify-between gap-3">
              {currentItem.status === "draft" && (
                <Button
                  variant="accent"
                  size="md"
                  className="w-full justify-center"
                  leftIcon={<Send className="w-4 h-4" />}
                  onClick={handleSubmitDraft}
                >
                  Submit for Client Approval
                </Button>
              )}

              {currentItem.status === "changes" && (
                <Button
                  variant="accent"
                  size="md"
                  className="w-full justify-center bg-amber-600 hover:bg-amber-700"
                  leftIcon={<Edit2 className="w-4 h-4" />}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit & Resubmit Revised Content
                </Button>
              )}

              {currentItem.status === "approved" && (
                <Button
                  variant="accent"
                  size="md"
                  className="w-full justify-center bg-emerald-600 hover:bg-emerald-700"
                  leftIcon={<Globe className="w-4 h-4" />}
                  onClick={handlePublish}
                >
                  Mark Deliverable as Published
                </Button>
              )}

              {currentItem.status === "pending" && (
                <div className="w-full p-2.5 rounded-lg bg-amber-50 text-amber-800 text-center text-xs font-medium border border-amber-200">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  Awaiting client sign-off. You will be notified when Elena approves or requests changes.
                </div>
              )}

              {currentItem.status === "published" && (
                <div className="w-full p-2.5 rounded-lg bg-indigo-50 text-aura-primary text-center text-xs font-semibold border border-indigo-200">
                  ✓ Deliverable is published to social channels
                </div>
              )}
            </div>
          )}

          <p className="text-[11px] text-center text-ink-tertiary">
            Aura Editorial Agency Social Media Manager MVP • Client Portal
          </p>
        </div>
      </div>

      {/* Request Changes Modal */}
      <RequestChangesModal
        isOpen={isChangesOpen}
        onClose={() => setIsChangesOpen(false)}
        assetTitle={currentItem.title}
        slideNumber={currentSlide + 1}
        onSendFeedback={(fb) => {
          requestChanges(currentItem.id, fb);
        }}
      />

      {/* Edit & Resubmit Modal for Agency */}
      <EditAndResubmitModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={currentItem}
      />
    </div>
  );
}
