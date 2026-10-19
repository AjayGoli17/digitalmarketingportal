"use client";

import * as React from "react";
import { X, Send, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ContentItem } from "@/lib/data/contentItems";
import { useContentWorkflow } from "@/components/context/ContentWorkflowContext";

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
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTitle(item.title);
      setCaption(item.caption);
      setTime(item.time);
      setDay(item.day);
      setSubmitted(false);
      setError(null);
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const latestFeedback = item.feedbackHistory && item.feedbackHistory.length > 0
    ? item.feedbackHistory[0]
    : null;

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

    const res = editAndResubmit(item.id, {
      title: title.trim(),
      caption: caption.trim(),
      time,
      day: Number(day),
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
            {/* Show Client Revision Note callout */}
            {latestFeedback && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-amber-900">
                  <span>Client Feedback ({latestFeedback.targetArea})</span>
                  <span className="text-[10px] text-amber-700 font-normal">
                    {latestFeedback.createdAt}
                  </span>
                </div>
                <p className="text-amber-800 leading-relaxed font-sans">
                  &ldquo;{latestFeedback.note}&rdquo;
                </p>
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
