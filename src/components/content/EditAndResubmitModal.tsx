"use client";

import * as React from "react";
import { X, Send, AlertCircle, CheckCircle2, Plus, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ContentItem, ContentSlide } from "@/lib/data/contentItems";
import { useContentWorkflow } from "@/components/context/ContentWorkflowContext";
import { uploadContentImage } from "@/lib/media";

export interface EditAndResubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem;
}

export function EditAndResubmitModal({
  isOpen,
  onClose,
  item,
}: EditAndResubmitModalProps) {
  const { editAndResubmit } = useContentWorkflow();
  const [title, setTitle] = React.useState(item.title);
  const [caption, setCaption] = React.useState(item.caption);
  const [time, setTime] = React.useState(item.time);
  const [day, setDay] = React.useState(item.day);
  const [slides, setSlides] = React.useState<ContentSlide[]>(item.slides || []);
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const [uploadStates, setUploadStates] = React.useState<
    Record<number, { progress: number; uploading?: boolean; error?: string }>
  >({});
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const allowMultipleImages = item.format === "carousel";

  React.useEffect(() => {
    if (isOpen) {
      setTitle(item.title);
      setCaption(item.caption);
      setTime(item.time);
      setDay(item.day);
      setSlides(item.slides || []);
      setCurrentSlideIndex(0);
      setUploadStates({});
      setSubmitted(false);
      setError(null);
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = allowMultipleImages ? Array.from(fileList) : [fileList[0]];

    if (!allowMultipleImages) {
      setSlides([]);
      setUploadStates({});
    }
    setError(null);

    for (const file of files) {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setSlides((prev) => [
        ...prev,
        { id, title: file.name, bgGradient: "from-[#DFD7CF] to-[#C9BFB5]" },
      ]);
      setUploadStates((prev) => ({ ...prev, [id]: { progress: 0, uploading: true } }));

      try {
        const url = await uploadContentImage(file, item.clientSlug, (percent) => {
          setUploadStates((prev) => ({ ...prev, [id]: { progress: percent, uploading: true } }));
        });
        setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, imageUrl: url } : s)));
        setUploadStates((prev) => ({ ...prev, [id]: { progress: 100, uploading: false } }));
      } catch (err) {
        setUploadStates((prev) => ({
          ...prev,
          [id]: {
            progress: 0,
            uploading: false,
            error: err instanceof Error ? err.message : "Upload failed.",
          },
        }));
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveSlide = (id: number) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
    setUploadStates((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleMoveSlide = (id: number, direction: -1 | 1) => {
    setSlides((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      const newIndex = index + direction;
      if (index === -1 || newIndex < 0 || newIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
  };

  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Pins the client left on the slide currently on screen, oldest first for stable numbering
  const slidePins = (item.feedbackHistory || [])
    .filter(
      (fb) => (fb.slideNumber || 1) === currentSlideIndex + 1 && fb.pinX !== undefined && fb.pinY !== undefined
    )
    .slice()
    .reverse();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!caption.trim()) {
      setError("Caption is required.");
      return;
    }

    const stillUploading = Object.values(uploadStates).some((s) => s.uploading);
    if (stillUploading) {
      setError("Please wait for images to finish uploading before resubmitting.");
      return;
    }

    if (!slides.some((s) => s.imageUrl)) {
      setError("Add at least one uploaded image before resubmitting for client approval.");
      return;
    }

    const res = editAndResubmit(item.id, {
      title: title.trim(),
      caption: caption.trim(),
      time,
      day: Number(day),
      slides,
    });

    if (!res.success) {
      setError(res.error || "Failed to resubmit revised content.");
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-hairline-subtle shadow-popover max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-aura-primary" />
            <h3 className="text-headline-sm font-semibold text-ink-primary">
              Edit & Resubmit Revision
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-ink-secondary hover:text-ink-primary"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-title-md font-semibold text-ink-primary">
              Content Revised & Resubmitted
            </h4>
            <p className="text-body-sm text-ink-secondary max-w-xs mx-auto">
              Status updated to Pending Approval. The client can now review the revised asset.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current slide image with the client's pinned feedback */}
            {currentSlide && (
              <div className="space-y-2">
                <div className="relative w-full aspect-[4/5] max-h-64 mx-auto rounded-xl overflow-hidden border border-hairline-subtle bg-gradient-to-br from-[#DFD7CF] to-[#C9BFB5]">
                  {currentSlide.imageUrl ? (
                    <img
                      src={currentSlide.imageUrl}
                      className="w-full h-full object-cover"
                      alt={currentSlide.title || item.title}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${currentSlide.bgGradient} flex items-center justify-center text-xs text-ink-secondary`}>
                      No image uploaded yet
                    </div>
                  )}

                  {slidePins.map((pin, idx) => (
                    <div
                      key={pin.id}
                      style={{ left: `${pin.pinX}%`, top: `${pin.pinY}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 text-white font-bold text-[11px] flex items-center justify-center shadow-lg border-2 border-white"
                      title={pin.note}
                    >
                      {idx + 1}
                    </div>
                  ))}

                  {slides.length > 1 && (
                    <span className="absolute bottom-1.5 right-1.5 text-[10px] bg-black/40 text-white px-1.5 py-0.5 rounded font-mono">
                      Slide {currentSlideIndex + 1} of {slides.length}
                    </span>
                  )}
                </div>
                {slides.length > 1 && (
                  <div className="flex items-center gap-1.5 justify-center">
                    {slides.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentSlideIndex ? "bg-aura-primary" : "bg-zinc-300"
                        }`}
                        aria-label={`View slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Full feedback list, each note tied to its numbered pin */}
            {item.feedbackHistory && item.feedbackHistory.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" /> Client Feedback ({item.feedbackHistory.length})
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {item.feedbackHistory.map((fb) => {
                    const group = (item.feedbackHistory || [])
                      .filter(
                        (f) =>
                          (f.slideNumber || 1) === (fb.slideNumber || 1) &&
                          f.pinX !== undefined &&
                          f.pinY !== undefined
                      )
                      .slice()
                      .reverse();
                    const pinNumber = group.findIndex((f) => f.id === fb.id) + 1;
                    return (
                      <div key={fb.id} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-amber-900">
                          <span className="flex items-center gap-1.5">
                            {pinNumber > 0 && (
                              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center shrink-0">
                                {pinNumber}
                              </span>
                            )}
                            Slide {fb.slideNumber || 1} • {fb.targetArea}
                          </span>
                          <span className="text-[10px] text-amber-700 font-normal">{fb.createdAt}</span>
                        </div>
                        <p className="text-amber-800 leading-relaxed font-sans">&ldquo;{fb.note}&rdquo;</p>
                        {fb.referenceImageUrl && (
                          <img
                            src={fb.referenceImageUrl}
                            className="w-12 h-12 rounded-lg object-cover border border-amber-200 mt-1"
                            alt="Reference attached by reviewer"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Title field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink-primary">
                Deliverable Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-hairline-subtle px-3 py-2 text-body-sm text-ink-primary outline-none focus:border-aura-primary focus:ring-2 focus:ring-aura-primary/10"
                required
              />
            </div>

            {/* Caption field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-ink-primary">
                  Revised Caption & Copy
                </label>
                <span className="text-ink-tertiary text-[10px]">
                  Markdown supported
                </span>
              </div>
              <textarea
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full rounded-lg border border-hairline-subtle p-3 text-body-sm text-ink-primary outline-none focus:border-aura-primary focus:ring-2 focus:ring-aura-primary/10 resize-none leading-relaxed"
                required
              />
            </div>

            {/* Image picker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-ink-primary">
                  {allowMultipleImages ? "Carousel Images" : "Image"}
                </label>
                <span className="text-ink-tertiary text-[10px]">Uploads to Supabase Storage</span>
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {slides.map((s, idx) => {
                  const state = uploadStates[s.id];
                  return (
                    <div key={s.id} className="relative shrink-0 group/thumb">
                      <button
                        type="button"
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`w-14 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === currentSlideIndex ? "border-aura-primary" : "border-transparent"
                        }`}
                      >
                        {s.imageUrl ? (
                          <img src={s.imageUrl} className="w-full h-full object-cover" alt={s.title} />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${s.bgGradient} flex items-center justify-center`}>
                            {state?.uploading && <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-primary" />}
                            {state?.error && <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
                          </div>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlide(s.id)}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-ink-primary text-white flex items-center justify-center shadow opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                      {state?.error && (
                        <p className="text-[9px] text-red-600 w-14 leading-tight mt-0.5">{state.error}</p>
                      )}
                    </div>
                  );
                })}

                {(allowMultipleImages || slides.length === 0) && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-16 rounded-lg border-2 border-dashed border-hairline-subtle hover:border-aura-primary/50 bg-white flex flex-col items-center justify-center text-ink-tertiary hover:text-aura-primary transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={allowMultipleImages}
                onChange={handleFilesSelected}
                className="hidden"
              />
            </div>

            {/* Schedule row */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-ink-primary">Scheduled Day</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value))}
                  className="w-full rounded-lg border border-hairline-subtle px-3 py-2 text-body-sm text-ink-primary outline-none focus:border-aura-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-ink-primary">Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg border border-hairline-subtle px-3 py-2 text-body-sm text-ink-primary outline-none focus:border-aura-primary"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                type="submit"
                rightIcon={<Send className="w-3.5 h-3.5 ml-1" />}
              >
                Resubmit for Approval
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
