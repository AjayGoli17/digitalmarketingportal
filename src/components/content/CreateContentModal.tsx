"use client";

import * as React from "react";
import {
  X,
  Plus,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  ContentItem,
  ContentFormat,
  PublishingChannel,
} from "@/lib/data/contentItems";
import { MONTH_NAMES, getDaysInMonth } from "@/lib/calendar";

export interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<ContentItem>) => void;
  initialItem?: ContentItem | null;
  clientName?: string;
  clientSlug?: string;
  /** Calendar context for new items. Defaults preserve the previous Nov 2024 behaviour. */
  month?: number;
  year?: number;
  initialDay?: number;
}

export function CreateContentModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
  clientName = "Kanso Botanicals",
  clientSlug = "kanso-botanicals",
  month = 11,
  year = 2024,
  initialDay,
}: CreateContentModalProps) {
  const monthLabel = MONTH_NAMES[month - 1] ?? "November";
  const daysInMonth = getDaysInMonth(year, month);
  const [format, setFormat] = React.useState<ContentFormat>(
    initialItem?.format || "carousel"
  );
  const [title, setTitle] = React.useState(
    initialItem?.title || "Restorative Botanical Elixir — Autumn Drop 02"
  );
  const [caption, setCaption] = React.useState(
    initialItem?.caption ||
      "Rooted in ancient ritual, renewed for daily calm. 🌿✨\n\nOur restorative botanical infusion balances skin moisture while bringing a quiet stillness to your day.\n\n#MindfulRitual #CleanBeauty #BotanicalSkincare"
  );
  const [channels, setChannels] = React.useState<PublishingChannel[]>(
    initialItem?.channels || ["instagram", "pinterest"]
  );
  const [day, setDay] = React.useState(initialItem?.day || 14);
  const [time, setTime] = React.useState(initialItem?.time || "10:30 AM");
  const [aspectRatio, setAspectRatio] = React.useState<"4:5" | "1:1">(
    (initialItem?.aspectRatio as "4:5" | "1:1") || "4:5"
  );
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const [submitStatus, setSubmitStatus] = React.useState<"draft" | "pending">("pending");
  const [slides, setSlides] = React.useState(
    initialItem?.slides || [
      { id: 1, title: "Hero Serum Still", bgGradient: "from-[#ECE5DC] to-[#D5CABE]" },
      { id: 2, title: "Restorative Texture Focus", bgGradient: "from-[#DFD7CF] to-[#C9BFB5]" },
      { id: 3, title: "Botanical Extracts", bgGradient: "from-[#DDD5CD] to-[#BFB4A8]" },
      { id: 4, title: "Elena Founder Portrait", bgGradient: "from-[#D5CDC3] to-[#B8AEA0]" },
    ]
  );

  React.useEffect(() => {
    if (initialItem) {
      setFormat(initialItem.format);
      setTitle(initialItem.title);
      setCaption(initialItem.caption);
      setChannels(initialItem.channels);
      setDay(initialItem.day);
      setTime(initialItem.time);
      if (initialItem.slides && initialItem.slides.length > 0) {
        setSlides(initialItem.slides);
      }
    }
  }, [initialItem]);

  // Pre-fill the day when the modal is opened from a specific calendar date
  React.useEffect(() => {
    if (isOpen && !initialItem && initialDay) {
      setDay(initialDay);
    }
  }, [isOpen, initialItem, initialDay]);

  if (!isOpen) return null;

  const toggleChannel = (ch: PublishingChannel) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleAddSlide = () => {
    const newId = slides.length + 1;
    const gradients = [
      "from-[#E6DFD5] to-[#CCC2B4]",
      "from-[#DFD7CF] to-[#C9BFB5]",
      "from-[#DDD5CD] to-[#BFB4A8]",
      "from-[#D5CDC3] to-[#B8AEA0]",
      "from-[#CFCBC8] to-[#ABA6A1]",
    ];
    const newSlide = {
      id: newId,
      title: `Slide ${newId} (Local Preview)`,
      bgGradient: gradients[newId % gradients.length],
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStatus = initialItem ? initialItem.status : submitStatus;
    const finalStatusLabel =
      finalStatus === "draft"
        ? "Draft"
        : finalStatus === "pending"
        ? "Pending Approval"
        : initialItem?.statusLabel || "Draft";

    onSave({
      id: initialItem?.id,
      title,
      format,
      formatLabel:
        format === "post"
          ? "Post"
          : format === "carousel"
          ? "Carousel"
          : format === "reel"
          ? "Reel"
          : "Story",
      caption,
      channels,
      day: Number(day),
      month,
      year,
      time,
      aspectRatio,
      clientName,
      clientSlug,
      clientInitials: clientName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2),
      status: finalStatus,
      statusLabel: finalStatusLabel,
      slideCount: format === "carousel" ? slides.length : undefined,
      slides,
      bgGradient: slides[0]?.bgGradient || "from-[#DFD7CF] to-[#C9BFB5]",
    });
    onClose();
  };

  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-hairline-subtle shadow-popover max-w-5xl w-full my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header matching create_content_refined.png */}
        <div className="px-6 py-4 border-b border-hairline-subtle flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-title-md sm:text-headline-sm font-semibold text-ink-primary">
              {initialItem ? "Edit Deliverable" : "New Deliverable"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span className="text-xs font-medium text-ink-secondary">
                {clientName} • Q4 Campaign
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-tertiary hidden sm:flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Autosaved
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-ink-tertiary hover:text-ink-primary p-1 rounded-md transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Two-Column Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-hairline">
          {/* Left Column: Stage Preview & Slides Strip */}
          <div className="lg:col-span-7 p-6 space-y-5 bg-surface-container-low/30">
            {/* Top Stage Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-label-caps uppercase text-ink-tertiary font-semibold tracking-wider">
                  Stage Preview
                </span>
                {format === "carousel" && (
                  <Badge variant="neutral" size="sm">
                    Slide {currentSlideIndex + 1} of {slides.length}
                  </Badge>
                )}
              </div>

              {/* Aspect Ratio Toggle */}
              <div className="inline-flex rounded-lg border border-hairline-subtle bg-white p-0.5 text-xs shadow-whisper">
                <button
                  type="button"
                  onClick={() => setAspectRatio("4:5")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    aspectRatio === "4:5"
                      ? "bg-surface-container text-ink-primary"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  4:5 Portrait
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio("1:1")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    aspectRatio === "1:1"
                      ? "bg-surface-container text-ink-primary"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  1:1 Square
                </button>
              </div>
            </div>

            {/* Main Stage Media Viewport */}
            <div
              className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${
                currentSlide?.bgGradient || "from-[#DFD7CF] to-[#C9BFB5]"
              } ${
                aspectRatio === "4:5" ? "aspect-[4/5]" : "aspect-square"
              } max-h-[380px] w-full mx-auto flex items-center justify-center border border-hairline shadow-whisper group`}
            >
              {/* Slide Badge Pill */}
              <div className="absolute top-3 left-3 z-20">
                <Badge variant="frosted-dark" size="sm">
                  {currentSlideIndex + 1 < 10 ? `0${currentSlideIndex + 1}` : currentSlideIndex + 1} • {currentSlide?.title || "Slide"}
                </Badge>
              </div>

              {/* Navigation Arrows for Carousel */}
              {slides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentSlideIndex((prev) =>
                        prev > 0 ? prev - 1 : slides.length - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-ink-primary hover:bg-white transition-all z-20"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentSlideIndex((prev) =>
                        prev < slides.length - 1 ? prev + 1 : 0
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-ink-primary hover:bg-white transition-all z-20"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Visual Presentation / Texture representation */}
              <div className="flex flex-col items-center justify-center text-center p-8 select-none">
                <span className="text-2xl font-serif italic text-ink-primary tracking-wide">
                  {currentSlide?.title || "Editorial Creative"}
                </span>
                <span className="text-xs text-ink-secondary tracking-widest uppercase mt-2 font-medium">
                  {clientName} • Stage Asset
                </span>
              </div>

              {/* Bottom Metadata bar */}
              <div className="absolute bottom-3 inset-x-3 z-20 flex justify-between items-center text-[11px] text-white/90 font-mono drop-shadow">
                <span>Texture_Macro_V2.png • 2400 × 3000px</span>
                <span className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[10px]">
                  4K Sharp
                </span>
              </div>
            </div>

            {/* Carousel Slides Strip */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-label-caps uppercase text-ink-tertiary font-semibold">
                  Carousel Slides ({slides.length})
                </span>
                <span className="text-ink-tertiary text-[11px]">
                  Local media selection (Storage sync in future prompt)
                </span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      currentSlideIndex === idx
                        ? "border-aura-primary shadow-sm scale-105"
                        : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`w-full h-full bg-gradient-to-br ${s.bgGradient} flex items-center justify-center text-[10px] font-medium text-ink-secondary`}
                    >
                      <span className="absolute top-1 left-1.5 text-[10px] font-bold text-ink-primary">
                        {idx + 1}
                      </span>
                    </div>
                  </button>
                ))}

                {/* Add Slide Button */}
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="w-16 h-20 rounded-lg border-2 border-dashed border-hairline-subtle hover:border-aura-primary/50 bg-white flex flex-col items-center justify-center text-ink-tertiary hover:text-aura-primary transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4 mb-1" />
                  <span className="text-[10px] font-medium">Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata, Formats, Channels, Caption, Schedule */}
          <div className="lg:col-span-5 p-6 space-y-5 bg-white">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Deliverable Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider block">
                  Post Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Restorative Botanical Elixir"
                  required
                  className="h-9 font-medium"
                />
              </div>

              {/* Content Format Segmented Control */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider block">
                  Content Format
                </label>
                <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg border border-hairline-subtle bg-surface-container-low text-xs">
                  {(["post", "carousel", "reel", "story"] as ContentFormat[]).map(
                    (fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setFormat(fmt)}
                        className={`py-1.5 rounded-md font-medium capitalize transition-all ${
                          format === fmt
                            ? "bg-white text-ink-primary shadow-sm"
                            : "text-ink-secondary hover:text-ink-primary"
                        }`}
                      >
                        {fmt}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Publishing Channels */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider block">
                  Publishing Channels
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleChannel("instagram")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      channels.includes("instagram")
                        ? "bg-aura-primary/10 border-aura-primary text-aura-primary"
                        : "bg-white border-hairline-subtle text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Instagram Feed</span>
                    {channels.includes("instagram") && (
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleChannel("pinterest")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      channels.includes("pinterest")
                        ? "bg-aura-primary/10 border-aura-primary text-aura-primary"
                        : "bg-white border-hairline-subtle text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    <span>Pinterest</span>
                    {channels.includes("pinterest") && (
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleChannel("tiktok")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      channels.includes("tiktok")
                        ? "bg-aura-primary/10 border-aura-primary text-aura-primary"
                        : "bg-white border-hairline-subtle text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    <span>TikTok</span>
                    {channels.includes("tiktok") && (
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Caption Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-ink-secondary uppercase tracking-wider">
                    Caption
                  </label>
                  <span className="text-ink-tertiary">
                    {caption.length} / 2,200
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full rounded-md border border-hairline-subtle p-3 text-body-sm text-ink-primary outline-none focus:border-aura-primary focus:ring-3 focus:ring-aura-primary/10 transition-all resize-none leading-relaxed"
                    placeholder="Compose editorial caption and hashtags..."
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCaption(
                        (prev) =>
                          prev +
                          "\n\n#ArtisanalFormulations #BotanicalCare #SlowLiving"
                      )
                    }
                    className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-aura-primary hover:text-indigo-700 bg-white/90 px-2 py-0.5 rounded border border-hairline shadow-sm"
                  >
                    <Sparkles className="w-3 h-3 text-aura-primary" />
                    <span>AI Refine</span>
                  </button>
                </div>
              </div>

              {/* Publish Schedule */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider block">
                  Publish Schedule
                </label>
                <div className="p-3 rounded-lg border border-hairline-subtle bg-surface-container-low/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-aura-primary" />
                    <div className="flex items-center gap-2 text-body-sm">
                      <input
                        type="number"
                        min={1}
                        max={daysInMonth}
                        value={day}
                        onChange={(e) => setDay(Number(e.target.value))}
                        className="w-10 rounded border border-hairline px-1.5 py-0.5 text-xs text-center font-medium bg-white"
                        title={`Day of ${monthLabel}`}
                      />
                      <span className="font-medium text-ink-primary text-xs sm:text-body-sm">
                        {monthLabel.slice(0, 3)}, {year} •
                      </span>
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-20 rounded border border-hairline px-1.5 py-0.5 text-xs text-center font-medium bg-white"
                        title="Scheduled time"
                      />
                    </div>
                  </div>
                  <Badge variant="approved" size="sm">
                    Peak Slot
                  </Badge>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-ink-tertiary">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Requires client sign-off</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  {!initialItem && (
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      onClick={() => setSubmitStatus("draft")}
                    >
                      Save Draft
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="accent"
                    size="sm"
                    onClick={() => setSubmitStatus("pending")}
                  >
                    {initialItem ? "Save Changes" : "Send for Approval →"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
