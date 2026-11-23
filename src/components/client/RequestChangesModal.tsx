"use client";

import * as React from "react";
import { X, Send, Paperclip, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { uploadContentImage } from "@/lib/media";

export interface RequestChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetTitle: string;
  slideNumber?: number;
  clientSlug?: string;
  onSendFeedback?: (feedback: {
    targetArea: "Caption & Copy" | "Slide Photo" | "Scheduling Time" | "Hashtags" | "General";
    note: string;
    slideNumber?: number;
    referenceImageUrl?: string;
  }) => void;
}

export function RequestChangesModal({
  isOpen,
  onClose,
  assetTitle,
  slideNumber = 1,
  clientSlug = "general",
  onSendFeedback,
}: RequestChangesModalProps) {
  const [targetArea, setTargetArea] = React.useState<
    "Caption & Copy" | "Slide Photo" | "Scheduling Time" | "Hashtags" | "General"
  >("Slide Photo");
  const [note, setNote] = React.useState(
    "Could we warm up the golden lighting slightly on this asset and ensure the texture highlights pop before scheduling?"
  );
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [referenceImageUrl, setReferenceImageUrl] = React.useState<string | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setValidationError(null);
      setSubmitted(false);
      setReferenceImageUrl(undefined);
      setUploadProgress(null);
      setUploadError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setReferenceImageUrl(undefined);
    setUploadProgress(0);
    try {
      const url = await uploadContentImage(file, clientSlug, (percent) => setUploadProgress(percent));
      setReferenceImageUrl(url);
      setUploadProgress(null);
    } catch (err) {
      setUploadProgress(null);
      setUploadError(err instanceof Error ? err.message : "Failed to upload reference image.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveReferenceImage = () => {
    setReferenceImageUrl(undefined);
    setUploadError(null);
    setUploadProgress(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = note.trim();
    if (!trimmed || trimmed.length < 5) {
      setValidationError("Please enter at least 5 characters describing the required adjustments.");
      return;
    }

    setValidationError(null);
    if (onSendFeedback) {
      onSendFeedback({ targetArea, note: trimmed, slideNumber, referenceImageUrl });
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  const targets = [
    "Caption & Copy",
    "Slide Photo",
    "Scheduling Time",
    "Hashtags",
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-hairline-subtle shadow-popover max-w-lg w-full p-6 space-y-5 animate-in slide-in-from-bottom-6 duration-300">
        {/* Handle bar on mobile */}
        <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto sm:hidden" />

        {/* Modal Header matching approvals.png */}
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-aura-primary" />
            <h3 className="text-headline-sm font-semibold text-ink-primary">
              Request Changes
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

        {/* Subtitle Line */}
        <div className="text-xs text-ink-secondary -mt-2">
          <span>{assetTitle}</span>
          <span className="text-ink-tertiary"> • </span>
          <span className="font-semibold text-aura-primary">
            Slide {slideNumber}
          </span>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-title-md font-semibold text-ink-primary">
              Feedback Sent to Agency
            </h4>
            <p className="text-body-sm text-ink-secondary max-w-xs mx-auto">
              Aura Editorial Agency has received your revision request and timeline adjustments.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selected Asset Pill Preview */}
            <div className="p-3 rounded-xl bg-surface-container-low border border-hairline-subtle flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-ink-primary shrink-0 border border-hairline-subtle">
                ASSET
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-ink-primary block truncate">
                  Selected Asset: {assetTitle}
                </span>
                <span className="text-[11px] text-ink-secondary block truncate">
                  Aura Editorial Agency • Deliverable Review Node
                </span>
              </div>
            </div>

            {/* Target Area Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-ink-tertiary block">
                Target Area
              </label>
              <div className="flex flex-wrap gap-1.5">
                {targets.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTargetArea(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      targetArea === t
                        ? "bg-aura-primary text-white shadow-sm"
                        : "bg-surface-container-low text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    {targetArea === t && <span className="mr-1">✓</span>}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-ink-primary">
                  What would you like changed? <span className="text-red-500">*</span>
                </label>
                <span className="text-ink-tertiary text-[10px]">
                  Markdown supported
                </span>
              </div>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                className={`w-full rounded-xl border p-3 text-body-sm text-ink-primary outline-none focus:ring-3 transition-all resize-none leading-relaxed ${
                  validationError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-hairline-subtle focus:border-aura-primary focus:ring-aura-primary/10"
                }`}
                placeholder="Describe required adjustments or visual color shifts..."
                required
              />
              {validationError && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>

            {/* Attachment line */}
            <div className="p-2.5 rounded-xl bg-surface-container-low/60 border border-hairline space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-ink-secondary">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attach a reference image</span>
                </div>
                {!referenceImageUrl && uploadProgress === null && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white border border-hairline px-2.5 py-1 rounded-md text-ink-primary font-medium hover:bg-zinc-50"
                  >
                    Add File
                  </button>
                )}
              </div>

              {uploadProgress !== null && (
                <div className="flex items-center gap-2 text-ink-secondary">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading… {uploadProgress}%</span>
                </div>
              )}

              {uploadError && (
                <div className="flex items-center gap-1.5 text-red-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {referenceImageUrl && (
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-hairline shrink-0">
                    <img src={referenceImageUrl} className="w-full h-full object-cover" alt="Reference" />
                  </div>
                  <span className="text-ink-secondary flex-1">Reference image attached</span>
                  <button
                    type="button"
                    onClick={handleRemoveReferenceImage}
                    className="text-ink-tertiary hover:text-red-600 p-1"
                    aria-label="Remove reference image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
                className="hidden"
              />
            </div>

            {/* Action buttons matching approvals.png */}
            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center text-body-sm bg-ink-primary hover:bg-zinc-800"
                rightIcon={<Send className="w-3.5 h-3.5 ml-1" />}
              >
                Send Feedback to Agency
              </Button>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-center text-xs text-ink-secondary hover:text-ink-primary py-1"
              >
                Keep reviewing (Cancel)
              </button>
            </div>

            <div className="text-[11px] text-ink-tertiary flex items-center justify-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Agency team is notified immediately and status updates to Changes Requested.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
