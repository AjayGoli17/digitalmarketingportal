"use client";

import * as React from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Edit3,
  Trash2,
  Send,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Shield,
  Clock,
  Instagram,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ContentItem } from "@/lib/data/contentItems";

export interface ContentPreviewModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: "approved" | "pending") => void;
}

export function ContentPreviewModal({
  item,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}: ContentPreviewModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const [copiedCaption, setCopiedCaption] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    setCurrentSlideIndex(0);
    setIsDeleting(false);
  }, [item]);

  if (!isOpen || !item) return null;

  const slides = item.slides && item.slides.length > 0
    ? item.slides
    : [
        {
          id: 1,
          title: item.title,
          bgGradient: item.bgGradient,
        },
      ];

  const totalSlides = slides.length;
  const currentSlide = slides[currentSlideIndex] || slides[0];

  const handleCopyCaption = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(item.caption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  const statusVariant =
    item.status === "approved"
      ? "approved"
      : item.status === "changes"
      ? "changes"
      : "pending";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-canvas rounded-2xl border border-hairline shadow-popover max-w-6xl w-full my-6 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Header Bar matching content_preview_refined.png */}
        <div className="px-6 py-4 bg-white border-b border-hairline-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary transition-colors py-1 px-2 rounded-md hover:bg-surface-container-low"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Content</span>
            </button>
            <span className="text-ink-tertiary">·</span>
            <div className="w-6 h-6 rounded-md bg-surface-container-high text-[10px] font-bold text-ink-primary flex items-center justify-center border border-hairline-subtle">
              {item.clientInitials}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-body-sm font-semibold text-ink-primary truncate max-w-[200px] sm:max-w-md">
                {item.title}
              </span>
              <Badge variant={statusVariant} size="sm" withDot>
                {item.status === "approved" ? "Approved" : "Ready to Send"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <span className="text-xs text-ink-tertiary hidden md:inline">
              v2.1 (Approved Draft)
            </span>
            <button
              type="button"
              onClick={() => alert("Live Preview mode active.")}
              className="inline-flex items-center gap-1 text-xs font-medium text-ink-secondary hover:text-ink-primary border border-hairline-subtle rounded-md px-2.5 py-1 bg-white hover:bg-surface-container-low transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Live Preview</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-ink-tertiary hover:text-ink-primary"
              aria-label="Close"
            >
              <span className="text-lg leading-none">&times;</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Two-Column Responsive Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Media Viewport */}
          <div className="lg:col-span-7 flex flex-col items-center space-y-4">
            <div className="w-full flex justify-between items-center text-xs text-ink-secondary px-1">
              <span className="font-medium text-ink-primary flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-aura-primary" />
                Instagram 4:5 Feed Preview
              </span>
              <span className="font-mono text-ink-tertiary">1080 × 1350 PX</span>
            </div>

            {/* Mobile / Feed Phone Container Frame */}
            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-[#DFD7CF] to-[#C9BFB5] border border-hairline shadow-popover flex flex-col justify-between group">
              {/* Carousel multi-bar progress line on top */}
              {totalSlides > 1 && (
                <div className="absolute top-2 inset-x-3 z-30 flex gap-1">
                  {slides.map((_, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full overflow-hidden bg-black/20"
                    >
                      <div
                        className={`h-full transition-all duration-200 ${
                          i <= currentSlideIndex ? "bg-white" : "bg-transparent"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Slide Navigation Arrows */}
              {totalSlides > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md shadow flex items-center justify-center text-ink-primary hover:bg-white transition-all z-20"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md shadow flex items-center justify-center text-ink-primary hover:bg-white transition-all z-20"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Main Visual Artwork Layer */}
              <div
                className={`w-full h-full bg-gradient-to-br ${
                  currentSlide.bgGradient || item.bgGradient
                } flex flex-col items-center justify-center p-8 text-center select-none`}
              >
                <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 max-w-[280px]">
                  <span className="text-xl font-serif italic text-ink-primary block leading-tight">
                    {item.clientName}
                  </span>
                  <span className="text-sm font-medium text-ink-primary mt-1 block">
                    {currentSlide.title || item.title}
                  </span>
                  <span className="text-[10px] text-ink-secondary tracking-widest uppercase mt-2 block font-semibold">
                    AUTUMN CAMPAIGN
                  </span>
                </div>
              </div>

              {/* Instagram Bottom Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent text-white z-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white text-ink-primary text-[10px] font-bold flex items-center justify-center">
                    {item.clientInitials}
                  </div>
                  <span className="text-xs font-medium">
                    {item.clientSlug.replace("-", "")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <Heart className="w-4 h-4 cursor-pointer hover:text-red-400" />
                  <MessageCircle className="w-4 h-4 cursor-pointer" />
                  <Share2 className="w-4 h-4 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalSlides > 1 && (
              <div className="flex items-center gap-3 text-xs text-ink-secondary">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="p-1 text-ink-tertiary hover:text-ink-primary"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium text-ink-primary">
                  Slide {currentSlideIndex + 1} of {totalSlides}
                </span>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="p-1 text-ink-tertiary hover:text-ink-primary"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Thumbnail Strip */}
            {totalSlides > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto p-1">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`relative w-12 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      currentSlideIndex === idx
                        ? "border-aura-primary scale-105"
                        : "border-hairline opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`w-full h-full bg-gradient-to-br ${s.bgGradient} flex items-end justify-center pb-1 text-[9px] font-bold text-ink-primary`}
                    >
                      0{idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Editorial Details & Actions */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="p-6 bg-white space-y-5">
              {/* Status Header */}
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <Badge variant={statusVariant} size="md" withDot>
                  {item.status === "approved" ? "Approved" : "Ready to Send"}
                </Badge>
                <span className="text-label-caps uppercase text-ink-tertiary font-semibold tracking-wider">
                  Client Approval
                </span>
              </div>

              {/* Title & Client */}
              <div>
                <h3 className="text-headline-sm font-semibold text-ink-primary">
                  {item.title}
                </h3>
                <span className="text-body-sm text-ink-secondary">
                  {item.clientName}
                </span>
              </div>

              {/* Key Specs List */}
              <div className="space-y-2.5 pt-2 border-t border-hairline text-body-sm">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-tertiary">Platform & Format</span>
                  <span className="text-xs font-medium text-ink-primary capitalize">
                    {item.channels.join(", ")} • {item.formatLabel}
                    {item.slideCount ? ` (${item.slideCount} slides)` : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-tertiary">Scheduled Date</span>
                  <span className="text-xs font-medium text-ink-primary">
                    Nov {item.day}, {item.year} • {item.time} EST
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-tertiary">Buffer Sync</span>
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                </div>
              </div>

              {/* Caption Preview Box */}
              <div className="space-y-2 pt-2 border-t border-hairline">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                    Caption Preview
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="inline-flex items-center gap-1 text-xs text-aura-primary hover:text-indigo-700 font-medium"
                  >
                    {copiedCaption ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-container-low border border-hairline-subtle text-body-sm text-ink-primary leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {item.caption}
                </div>
              </div>

              {/* Primary & Secondary Actions */}
              <div className="space-y-2 pt-2 border-t border-hairline">
                {item.status !== "approved" ? (
                  <Button
                    variant="accent"
                    size="md"
                    className="w-full justify-center"
                    leftIcon={<Send className="w-4 h-4" />}
                    onClick={() => {
                      if (onStatusChange) {
                        onStatusChange(item.id, "approved");
                      }
                      alert("Deliverable marked Approved & Queued for publication!");
                    }}
                  >
                    Approve & Schedule Post
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full justify-center"
                    leftIcon={<Check className="w-4 h-4 text-emerald-600" />}
                    disabled
                  >
                    Deliverable Approved
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="justify-center"
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      onClose();
                      onEdit(item);
                    }}
                  >
                    Edit Deliverable
                  </Button>

                  {isDeleting ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="justify-center"
                      onClick={() => {
                        onDelete(item.id);
                        onClose();
                      }}
                    >
                      Confirm Delete?
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-center text-[#DC2626] hover:bg-red-50 hover:text-red-700"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => setIsDeleting(true)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Client Presentation Mode Note Card matching content_preview_refined.png */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-hairline-subtle flex items-start gap-3">
              <Shield className="w-4 h-4 text-aura-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-ink-primary">
                  Client Presentation Mode
                </h4>
                <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">
                  Elena Rostova will receive this clean interactive review view upon sending for final sign-off.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
