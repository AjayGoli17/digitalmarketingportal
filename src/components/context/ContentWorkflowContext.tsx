"use client";

import * as React from "react";
import {
  ContentItem,
  INITIAL_CONTENT_ITEMS,
  FeedbackEntry,
  ApprovalRecord,
  ContentStatus,
} from "@/lib/data/contentItems";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

import { ClientQuotas, SAMPLE_CLIENTS } from "@/lib/data/clients";

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

function formatTimestamp(d = new Date()): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  let hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${month} ${day}, ${year}, ${hours}:${mins} ${ampm}`;
}

export function ContentWorkflowProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ContentItem[]>(INITIAL_CONTENT_ITEMS);
  const [clientQuotas, setClientQuotas] = React.useState<Record<string, ClientQuotas>>(DEFAULT_CLIENT_QUOTAS);
  const [lastActionNotice, setLastActionNotice] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const isLive = isSupabaseConfigured();

  // Load persisted sample state on client
  React.useEffect(() => {
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
  }, []);

  // Save to localStorage whenever items change in sample mode
  const saveItems = React.useCallback((next: ContentItem[]) => {
    setItems(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn("Failed to persist content items to localStorage", err);
      }
    }
  }, []);

  const updateClientQuotas = React.useCallback((clientSlug: string, quotas: ClientQuotas) => {
    setClientQuotas((prev) => {
      const next = { ...prev, [clientSlug]: quotas };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(QUOTAS_STORAGE_KEY, JSON.stringify(next));
        } catch (err) {
          console.warn("Failed to persist quotas to localStorage", err);
        }
      }
      return next;
    });
    setLastActionNotice(`Updated deliverables package quota for ${clientSlug}.`);
    setTimeout(() => {
      setLastActionNotice((prev) => (prev?.includes(clientSlug) ? null : prev));
    }, 4500);
  }, []);

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
      return { success: true };
    },
    [items, saveItems]
  );

  // 2. Client approves content
  const approveContent = React.useCallback(
    (id: string, reviewerName = "Elena Rostova (Client)", comment?: string): WorkflowActionResponse => {
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
      return { success: true };
    },
    [items, saveItems]
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
        reviewerName: feedback.reviewerName || "Elena Rostova (Client Sign-Off)",
        reviewerRole: "client",
        targetArea: feedback.targetArea,
        note: feedback.note.trim(),
        slideNumber: feedback.slideNumber || 1,
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
      return { success: true };
    },
    [items, saveItems]
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
          status: "pending" as ContentStatus,
          statusLabel: "Pending Approval",
          revisionCount: nextRevision,
        };
      });

      saveItems(nextItems);
      triggerNotice(`Revised "${item.title}" (v${nextRevision}) and resubmitted for client approval.`);
      return { success: true };
    },
    [items, saveItems]
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
      return { success: true };
    },
    [items, saveItems]
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
      return created;
    },
    [items, saveItems]
  );

  // Delete content item
  const deleteContent = React.useCallback(
    (id: string): boolean => {
      const next = items.filter((i) => i.id !== id);
      saveItems(next);
      triggerNotice("Deliverable removed from queue.");
      return true;
    },
    [items, saveItems]
  );

  // Reset to initial baseline
  const resetSampleData = React.useCallback(() => {
    saveItems(INITIAL_CONTENT_ITEMS);
    setClientQuotas(DEFAULT_CLIENT_QUOTAS);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(QUOTAS_STORAGE_KEY);
      } catch (e) {
        // ignore
      }
    }
    triggerNotice("Reset content workflow items and package quotas to default sample set.");
  }, [saveItems]);

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
