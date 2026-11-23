"use client";

import * as React from "react";
import {
  ContentItem,
  INITIAL_CONTENT_ITEMS,
  FeedbackEntry,
  ApprovalRecord,
  ContentStatus,
} from "@/lib/data/contentItems";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  fetchContentWorkspace,
  createContentItem,
  deleteContentItem,
  updateContentItem,
  insertRevision,
  insertFeedbackPin,
  attachFeedbackImage,
  updateClientQuotasRow,
  resetWorkspaceSampleData,
  formatTimestamp,
} from "@/lib/data/contentRepo";

import { ClientQuotas, SAMPLE_CLIENTS, getClientBySlug } from "@/lib/data/clients";

interface WorkflowActionResponse {
  success: boolean;
  error?: string;
}

interface ContentWorkflowContextType {
  items: ContentItem[];
  getItem: (id: string) => ContentItem | undefined;
  submitForApproval: (id: string) => WorkflowActionResponse;
  approveContent: (id: string, reviewerName?: string, comment?: string) => WorkflowActionResponse;
  requestChanges: (
    id: string,
    feedback: {
      targetArea: "Caption & Copy" | "Slide Photo" | "Scheduling Time" | "Hashtags" | "General";
      note: string;
      slideNumber?: number;
      reviewerName?: string;
      pinX?: number;
      pinY?: number;
      referenceImageUrl?: string;
    }
  ) => WorkflowActionResponse;
  editAndResubmit: (
    id: string,
    updates: {
      title?: string;
      caption?: string;
      time?: string;
      day?: number;
      month?: number;
      year?: number;
      slides?: ContentItem["slides"];
    }
  ) => WorkflowActionResponse;
  markPublished: (id: string) => WorkflowActionResponse;
  createContent: (item: Partial<ContentItem> & { title: string }) => ContentItem;
  deleteContent: (id: string) => boolean;
  resetSampleData: () => void;
  lastActionNotice: string | null;
  dismissNotice: () => void;
  error: string | null;
  clearError: () => void;
  isLiveDatabase: boolean;
  clientQuotas: Record<string, ClientQuotas>;
  updateClientQuotas: (clientSlug: string, quotas: ClientQuotas) => void;
  getClientQuotas: (clientSlug: string) => ClientQuotas;
}

const STORAGE_KEY = "aura_workflow_items_v2";
const QUOTAS_STORAGE_KEY = "aura_client_quotas_v1";

const DEFAULT_CLIENT_QUOTAS: Record<string, ClientQuotas> = SAMPLE_CLIENTS.reduce(
  (acc, c) => {
    if (c.quotas) {
      acc[c.slug] = c.quotas;
    }
    return acc;
  },
  {} as Record<string, ClientQuotas>
);

const ContentWorkflowContext = React.createContext<ContentWorkflowContextType | undefined>(
  undefined
);

export function ContentWorkflowProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ContentItem[]>(INITIAL_CONTENT_ITEMS);
  const [clientQuotas, setClientQuotas] = React.useState<Record<string, ClientQuotas>>(DEFAULT_CLIENT_QUOTAS);
  const [lastActionNotice, setLastActionNotice] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const isLive = isSupabaseConfigured();

  // Load persisted state on client: Supabase when configured, localStorage otherwise
  React.useEffect(() => {
    if (isLive) {
      fetchContentWorkspace()
        .then(({ items: liveItems, quotas }) => {
          setItems(liveItems);
          setClientQuotas((prev) => ({ ...prev, ...quotas }));
        })
        .catch((err) => {
          console.warn("Failed to load content workspace from Supabase", err);
          setError(err instanceof Error ? err.message : "Failed to load content from Supabase.");
        });
      return;
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
          }
        }
        const storedQuotas = localStorage.getItem(QUOTAS_STORAGE_KEY);
        if (storedQuotas) {
          const parsedQuotas = JSON.parse(storedQuotas);
          if (parsedQuotas && typeof parsedQuotas === "object") {
            setClientQuotas((prev) => ({ ...prev, ...parsedQuotas }));
          }
        }
      } catch (err) {
        console.warn("Failed to read localStorage content items or quotas", err);
      }
    }
  }, [isLive]);

  // Update local state, persisting to Supabase when configured or localStorage otherwise
  const saveItems = React.useCallback(
    (next: ContentItem[]) => {
      setItems(next);
      if (isLive) return;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (err) {
          console.warn("Failed to persist content items to localStorage", err);
        }
      }
    },
    [isLive]
  );

  const updateClientQuotas = React.useCallback(
    (clientSlug: string, quotas: ClientQuotas) => {
      setClientQuotas((prev) => {
        const next = { ...prev, [clientSlug]: quotas };
        if (!isLive && typeof window !== "undefined") {
          try {
            localStorage.setItem(QUOTAS_STORAGE_KEY, JSON.stringify(next));
          } catch (err) {
            console.warn("Failed to persist quotas to localStorage", err);
          }
        }
        return next;
      });

      if (isLive) {
        updateClientQuotasRow(clientSlug, quotas).catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to save quota to Supabase.");
        });
      }

      setLastActionNotice(`Updated deliverables package quota for ${clientSlug}.`);
      setTimeout(() => {
        setLastActionNotice((prev) => (prev?.includes(clientSlug) ? null : prev));
      }, 4500);
    },
    [isLive]
  );

  const getClientQuotas = React.useCallback(
    (clientSlug: string): ClientQuotas => {
      if (clientQuotas[clientSlug]) {
        return clientQuotas[clientSlug];
      }
      const found = SAMPLE_CLIENTS.find((c) => c.slug === clientSlug);
      if (found?.quotas) {
        return found.quotas;
      }
      return { posts: 4, reels: 2, stories: 2, carousels: 2, total: 10 };
    },
    [clientQuotas]
  );

  const triggerNotice = (msg: string) => {
    setLastActionNotice(msg);
    setError(null);
    setTimeout(() => {
      setLastActionNotice((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const getItem = React.useCallback(
    (id: string) => items.find((i) => i.id === id),
    [items]
  );

  // 1. Submit draft or revised content for client approval
  const submitForApproval = React.useCallback(
    (id: string): WorkflowActionResponse => {
      const item = items.find((i) => i.id === id);
      if (!item) {
        setError(`Item #${id} not found.`);
        return { success: false, error: "Content item not found." };
      }

      // Safeguard: only draft or changes requested can be submitted
      if (item.status !== "draft" && item.status !== "changes") {
        const err = `Cannot submit for approval from current status "${item.statusLabel || item.status}".`;
        setError(err);
        return { success: false, error: err };
      }

      const nextRevision = item.status === "changes" ? (item.revisionCount || 1) + 1 : item.revisionCount || 1;

      const nextItems = items.map((i) => {
        if (i.id !== id) return i;
        return {
          ...i,
          status: "pending" as ContentStatus,
          statusLabel: "Pending Approval",
          revisionCount: nextRevision,
        };
      });

      saveItems(nextItems);
      triggerNotice(`Submitted "${item.title}" for client approval (Revision v${nextRevision}).`);

      if (isLive) {
        updateContentItem(id, { status: "pending", statusLabel: "Pending Approval", revisionCount: nextRevision })
          .then(() =>
            insertRevision(id, { revisionNumber: nextRevision, status: "pending", title: item.title, caption: item.caption, reviewerName: "Agency" })
          )
          .catch((err) => setError(err instanceof Error ? err.message : "Failed to submit for approval."));
      }

      return { success: true };
    },
    [items, saveItems, isLive]
  );

  // 2. Client approves content
  const approveContent = React.useCallback(
    (id: string, reviewerNameArg?: string, comment?: string): WorkflowActionResponse => {
      const item = items.find((i) => i.id === id);
      if (!item) {
        setError(`Item #${id} not found.`);
        return { success: false, error: "Content item not found." };
      }

      // Safeguard: can only approve pending items
      if (item.status !== "pending") {
        const err = `Cannot approve item in "${item.statusLabel || item.status}" status.`;
        setError(err);
        return { success: false, error: err };
      }

      const reviewerName = reviewerNameArg || `${getClientBySlug(item.clientSlug).contactName} (Client)`;

      const approvalRecord: ApprovalRecord = {
        approvedBy: reviewerName,
        approvedAt: formatTimestamp(),
        comment: comment || "Approved for scheduled publication.",
      };

      const nextItems = items.map((i) => {
        if (i.id !== id) return i;
        return {
          ...i,
          status: "approved" as ContentStatus,
          statusLabel: "Approved",
          approvalRecord,
        };
      });

      saveItems(nextItems);
      triggerNotice(`Approved "${item.title}" by ${reviewerName}. Ready for publication.`);

      if (isLive) {
        updateContentItem(id, { status: "approved", statusLabel: "Approved", approvalRecord })
          .then(() =>
            insertRevision(id, {
              revisionNumber: item.revisionCount || 1,
              status: "approved",
              title: item.title,
              caption: item.caption,
              reviewerName,
            })
          )
          .catch((err) => setError(err instanceof Error ? err.message : "Failed to save approval."));
      }

      return { success: true };
    },
    [items, saveItems, isLive]
  );

  // 3. Client requests changes with feedback
  const requestChanges = React.useCallback(
    (
      id: string,
      feedback: {
        targetArea: "Caption & Copy" | "Slide Photo" | "Scheduling Time" | "Hashtags" | "General";
        note: string;
        slideNumber?: number;
        reviewerName?: string;
        pinX?: number;
        pinY?: number;
        referenceImageUrl?: string;
      }
    ): WorkflowActionResponse => {
      const item = items.find((i) => i.id === id);
      if (!item) {
        setError(`Item #${id} not found.`);
        return { success: false, error: "Content item not found." };
      }

      // Validation: prevent empty feedback
      if (!feedback.note || feedback.note.trim().length < 5) {
        const err = "Feedback note must be at least 5 characters describing the requested adjustments.";
        setError(err);
        return { success: false, error: err };
      }

      // Safeguard: can only request changes on pending items
      if (item.status !== "pending") {
        const err = `Cannot request changes on item in "${item.statusLabel || item.status}" status.`;
        setError(err);
        return { success: false, error: err };
      }

      const newFeedback: FeedbackEntry = {
        id: `fb-${Date.now()}`,
        contentItemId: id,
        reviewerName:
          feedback.reviewerName || `${getClientBySlug(item.clientSlug).contactName} (Client Sign-Off)`,
        reviewerRole: "client",
        targetArea: feedback.targetArea,
        note: feedback.note.trim(),
        slideNumber: feedback.slideNumber || 1,
        pinX: feedback.pinX,
        pinY: feedback.pinY,
        referenceImageUrl: feedback.referenceImageUrl,
        createdAt: formatTimestamp(),
      };

      const existingHistory = item.feedbackHistory || [];

      const nextItems = items.map((i) => {
        if (i.id !== id) return i;
        return {
          ...i,
          status: "changes" as ContentStatus,
          statusLabel: "Changes Requested",
          feedbackHistory: [newFeedback, ...existingHistory],
        };
      });

      saveItems(nextItems);
      triggerNotice(`Revision requested on "${item.title}". Feedback sent to Agency.`);

      if (isLive) {
        updateContentItem(id, { status: "changes", statusLabel: "Changes Requested" })
          .then(() =>
            insertFeedbackPin(id, {
              reviewerName: newFeedback.reviewerName,
              targetArea: newFeedback.targetArea,
              note: newFeedback.note,
              slideNumber: newFeedback.slideNumber,
              pinX: newFeedback.pinX,
              pinY: newFeedback.pinY,
            })
          )
          .then((pin) =>
            newFeedback.referenceImageUrl
              ? attachFeedbackImage(id, pin.id, newFeedback.referenceImageUrl)
              : undefined
          )
          .then(() =>
            insertRevision(id, {
              revisionNumber: item.revisionCount || 1,
              status: "changes",
              title: item.title,
              caption: item.caption,
              feedbackNote: newFeedback.note,
              targetArea: newFeedback.targetArea,
              reviewerName: newFeedback.reviewerName,
            })
          )
          .catch((err) => setError(err instanceof Error ? err.message : "Failed to save feedback."));
      }

      return { success: true };
    },
    [items, saveItems, isLive]
  );

  // 4. Agency edits content and resubmits
  const editAndResubmit = React.useCallback(
    (
      id: string,
      updates: {
        title?: string;
        caption?: string;
        time?: string;
        day?: number;
        month?: number;
        year?: number;
        slides?: ContentItem["slides"];
      }
    ): WorkflowActionResponse => {
      const item = items.find((i) => i.id === id);
      if (!item) {
        setError(`Item #${id} not found.`);
        return { success: false, error: "Content item not found." };
      }

      // Safeguard: only changes or draft can be edited & resubmitted
      if (item.status !== "changes" && item.status !== "draft") {
        const err = `Cannot resubmit from "${item.statusLabel || item.status}" status.`;
        setError(err);
        return { success: false, error: err };
      }

      const nextRevision = (item.revisionCount || 1) + 1;

      const nextItems = items.map((i) => {
        if (i.id !== id) return i;
        return {
          ...i,
          title: updates.title !== undefined ? updates.title : i.title,
          caption: updates.caption !== undefined ? updates.caption : i.caption,
          time: updates.time !== undefined ? updates.time : i.time,
          day: updates.day !== undefined ? updates.day : i.day,
          month: updates.month !== undefined ? updates.month : i.month,
          year: updates.year !== undefined ? updates.year : i.year,
          slides: updates.slides !== undefined ? updates.slides : i.slides,
          status: "pending" as ContentStatus,
          statusLabel: "Pending Approval",
          revisionCount: nextRevision,
        };
      });

      saveItems(nextItems);
      triggerNotice(`Revised "${item.title}" (v${nextRevision}) and resubmitted for client approval.`);

      if (isLive) {
        const nextTitle = updates.title !== undefined ? updates.title : item.title;
        const nextCaption = updates.caption !== undefined ? updates.caption : item.caption;
        updateContentItem(id, {
          status: "pending",
          statusLabel: "Pending Approval",
          revisionCount: nextRevision,
          title: updates.title,
          caption: updates.caption,
          time: updates.time,
          day: updates.day,
          month: updates.month,
          year: updates.year,
          slides: updates.slides,
        })
          .then(() =>
            insertRevision(id, { revisionNumber: nextRevision, status: "pending", title: nextTitle, caption: nextCaption, reviewerName: "Agency" })
          )
          .catch((err) => setError(err instanceof Error ? err.message : "Failed to resubmit revision."));
      }

      return { success: true };
    },
    [items, saveItems, isLive]
  );

  // 5. Agency manually marks approved content as Published
  const markPublished = React.useCallback(
    (id: string): WorkflowActionResponse => {
      const item = items.find((i) => i.id === id);
      if (!item) {
        setError(`Item #${id} not found.`);
        return { success: false, error: "Content item not found." };
      }

      // Safeguard: can only publish approved items
      if (item.status !== "approved") {
        const err = `Cannot publish item in "${item.statusLabel || item.status}" status. Content must be Approved first.`;
        setError(err);
        return { success: false, error: err };
      }

      const publishedTimestamp = formatTimestamp();

      const nextItems = items.map((i) => {
        if (i.id !== id) return i;
        return {
          ...i,
          status: "published" as ContentStatus,
          statusLabel: "Published",
          publishedAt: publishedTimestamp,
        };
      });

      saveItems(nextItems);
      triggerNotice(`Marked "${item.title}" as Published on ${publishedTimestamp}.`);

      if (isLive) {
        updateContentItem(id, { status: "published", statusLabel: "Published", publishedAt: new Date().toISOString() })
          .then(() =>
            insertRevision(id, { revisionNumber: item.revisionCount || 1, status: "published", title: item.title, caption: item.caption, reviewerName: "Agency" })
          )
          .catch((err) => setError(err instanceof Error ? err.message : "Failed to mark as published."));
      }

      return { success: true };
    },
    [items, saveItems, isLive]
  );

  // Create new content item
  const createContent = React.useCallback(
    (newItem: Partial<ContentItem> & { title: string }): ContentItem => {
      const id = `item-${Date.now()}`;
      const status = (newItem.status || "draft") as ContentStatus;
      const statusLabel =
        status === "draft"
          ? "Draft"
          : status === "pending"
          ? "Pending Approval"
          : status === "approved"
          ? "Approved"
          : "Draft";

      const created: ContentItem = {
        id,
        clientSlug: newItem.clientSlug || "kanso-botanicals",
        clientName: newItem.clientName || "Kanso Botanicals",
        clientInitials: newItem.clientInitials || "KB",
        title: newItem.title,
        format: newItem.format || "post",
        formatLabel: newItem.formatLabel || "Post",
        status,
        statusLabel,
        day: newItem.day || 18,
        month: newItem.month || 11,
        year: newItem.year || 2024,
        time: newItem.time || "10:00 AM",
        channels: newItem.channels || ["instagram"],
        aspectRatio: newItem.aspectRatio || "4:5",
        caption: newItem.caption || "",
        bgGradient: newItem.bgGradient || "from-[#E6DFD5] to-[#CCC2B4]",
        slideCount: newItem.slideCount || 1,
        feedbackHistory: [],
        revisionCount: 1,
      };

      const next = [created, ...items];
      saveItems(next);
      triggerNotice(`Created new deliverable "${created.title}" (${statusLabel}).`);

      if (isLive) {
        createContentItem(created)
          .then((liveItem) => {
            setItems((prev) => prev.map((i) => (i.id === created.id ? liveItem : i)));
          })
          .catch((err) => setError(err instanceof Error ? err.message : "Failed to save content item to Supabase."));
      }

      return created;
    },
    [items, saveItems, isLive]
  );

  // Delete content item
  const deleteContent = React.useCallback(
    (id: string): boolean => {
      const next = items.filter((i) => i.id !== id);
      saveItems(next);
      triggerNotice("Deliverable removed from queue.");

      if (isLive) {
        deleteContentItem(id).catch((err) =>
          setError(err instanceof Error ? err.message : "Failed to delete content item from Supabase.")
        );
      }

      return true;
    },
    [items, saveItems, isLive]
  );

  // Reset to initial baseline
  const resetSampleData = React.useCallback(() => {
    if (isLive) {
      resetWorkspaceSampleData()
        .then(({ items: liveItems, quotas }) => {
          setItems(liveItems);
          setClientQuotas((prev) => ({ ...prev, ...quotas }));
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to reset demo data."));
      triggerNotice("Reset content workflow items and package quotas to defaults.");
      return;
    }

    saveItems(INITIAL_CONTENT_ITEMS);
    setClientQuotas(DEFAULT_CLIENT_QUOTAS);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(QUOTAS_STORAGE_KEY);
      } catch (e) {
        // ignore
      }
    }
    triggerNotice("Reset content workflow items and package quotas to defaults.");
  }, [saveItems, isLive]);

  return (
    <ContentWorkflowContext.Provider
      value={{
        items,
        getItem,
        submitForApproval,
        approveContent,
        requestChanges,
        editAndResubmit,
        markPublished,
        createContent,
        deleteContent,
        resetSampleData,
        lastActionNotice,
        dismissNotice: () => setLastActionNotice(null),
        error,
        clearError: () => setError(null),
        isLiveDatabase: isLive,
        clientQuotas,
        updateClientQuotas,
        getClientQuotas,
      }}
    >
      {children}
    </ContentWorkflowContext.Provider>
  );
}

export function useContentWorkflow() {
  const context = React.useContext(ContentWorkflowContext);
  if (!context) {
    throw new Error("useContentWorkflow must be used within a ContentWorkflowProvider");
  }
  return context;
}
