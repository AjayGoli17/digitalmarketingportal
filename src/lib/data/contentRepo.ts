import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import {
  ContentItem,
  ContentFormat,
  ContentStatus,
  ContentSlide,
  ApprovalRecord,
  FeedbackEntry,
  INITIAL_CONTENT_ITEMS,
} from "./contentItems";
import { ClientQuotas, SAMPLE_CLIENTS } from "./clients";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ContentItemRow = Database["public"]["Tables"]["content_items"]["Row"];

interface ContentMetadata {
  slides?: ContentSlide[];
  bgGradient?: string;
  formatLabel?: string;
  statusLabel?: string;
  approvalRecord?: ApprovalRecord;
  slideCount?: number;
  duration?: string;
  previewHeroText?: string;
  // Reference images reviewers attach to feedback, keyed by feedback_pins.id
  feedbackAttachments?: Record<string, string>;
}

const TARGET_AREA_TO_DB: Record<FeedbackEntry["targetArea"], string> = {
  "Caption & Copy": "caption",
  "Slide Photo": "slide_photo",
  "Scheduling Time": "timing",
  Hashtags: "hashtags",
  General: "general",
};

const TARGET_AREA_FROM_DB: Record<string, FeedbackEntry["targetArea"]> = {
  caption: "Caption & Copy",
  slide_photo: "Slide Photo",
  timing: "Scheduling Time",
  hashtags: "Hashtags",
  general: "General",
};

const DEFAULT_FORMAT_LABELS: Record<ContentFormat, string> = {
  post: "Post",
  carousel: "Carousel",
  reel: "Reel",
  story: "Story",
};

const DEFAULT_STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "Draft",
  pending: "Pending Approval",
  changes: "Changes Requested",
  approved: "Approved",
  published: "Published",
  scheduled: "Scheduled",
};

export function formatTimestamp(d: Date = new Date()): string {
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

function clientInitialsFromName(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  return initials || "??";
}

function partsFromScheduledAt(iso: string | null): { day: number; month: number; year: number; time: string } {
  const d = iso ? new Date(iso) : new Date();
  let hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return {
    day: d.getDate(),
    month: d.getMonth() + 1,
    year: d.getFullYear(),
    time: `${hours}:${mins} ${ampm}`,
  };
}

function scheduledAtFromParts(day: number, month: number, year: number, time: string): string {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  let hours = 0;
  let minutes = 0;
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  }
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

function requireClient() {
  const supabase = createClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase;
}

async function getClientRowBySlug(slug: string): Promise<ClientRow> {
  const supabase = requireClient();
  const { data, error } = await supabase.from("clients").select("*").eq("slug", slug).single();
  if (error || !data) {
    throw new Error(`Client not found for slug "${slug}".`);
  }
  return data;
}

function rowToContentItem(row: ContentItemRow, client: ClientRow, feedbackHistory: FeedbackEntry[]): ContentItem {
  const metadata = (row.metadata || {}) as ContentMetadata;
  const { day, month, year, time } = partsFromScheduledAt(row.scheduled_at);
  const format = row.format as ContentFormat;
  const status = row.status as ContentStatus;
  const mediaUrls = row.media_urls || [];
  const slides = metadata.slides?.map((s, i) => ({
    ...s,
    imageUrl: s.imageUrl || mediaUrls[i] || undefined,
  }));

  return {
    id: row.id,
    clientSlug: client.slug,
    clientName: client.name,
    clientInitials: clientInitialsFromName(client.name),
    title: row.title,
    format,
    formatLabel: metadata.formatLabel || DEFAULT_FORMAT_LABELS[format],
    status,
    statusLabel: metadata.statusLabel || DEFAULT_STATUS_LABELS[status],
    day,
    month,
    year,
    time,
    channels: row.channels as ContentItem["channels"],
    aspectRatio: row.aspect_ratio as ContentItem["aspectRatio"],
    caption: row.caption || "",
    slideCount: metadata.slideCount,
    duration: metadata.duration,
    bgGradient: metadata.bgGradient || "from-[#E6DFD5] to-[#CCC2B4]",
    previewHeroText: metadata.previewHeroText,
    slides,
    feedbackHistory,
    approvalRecord: metadata.approvalRecord,
    publishedAt: row.published_at ? formatTimestamp(new Date(row.published_at)) : undefined,
    revisionCount: row.revision_count,
  };
}

function buildMetadata(item: Partial<ContentItem>, existing?: ContentMetadata): ContentMetadata {
  return {
    slides: item.slides !== undefined ? item.slides : existing?.slides,
    bgGradient: item.bgGradient !== undefined ? item.bgGradient : existing?.bgGradient,
    formatLabel: item.formatLabel !== undefined ? item.formatLabel : existing?.formatLabel,
    statusLabel: item.statusLabel !== undefined ? item.statusLabel : existing?.statusLabel,
    approvalRecord: item.approvalRecord !== undefined ? item.approvalRecord : existing?.approvalRecord,
    slideCount: item.slideCount !== undefined ? item.slideCount : existing?.slideCount,
    duration: item.duration !== undefined ? item.duration : existing?.duration,
    previewHeroText: item.previewHeroText !== undefined ? item.previewHeroText : existing?.previewHeroText,
  };
}

function extractMediaUrls(slides?: ContentSlide[]): string[] {
  return (slides || [])
    .map((s) => s.imageUrl)
    .filter((url): url is string => Boolean(url));
}

export async function fetchContentWorkspace(): Promise<{
  items: ContentItem[];
  quotas: Record<string, ClientQuotas>;
}> {
  const supabase = requireClient();

  const { data: clients, error: clientsError } = await supabase.from("clients").select("*");
  if (clientsError) throw new Error(clientsError.message);

  const clientById = new Map((clients || []).map((c) => [c.id, c]));

  const { data: contentRows, error: contentError } = await supabase
    .from("content_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (contentError) throw new Error(contentError.message);

  const { data: pinRows, error: pinError } = await supabase
    .from("feedback_pins")
    .select("*")
    .order("created_at", { ascending: false });
  if (pinError) throw new Error(pinError.message);

  const attachmentsByContentId = new Map<string, Record<string, string>>();
  for (const row of contentRows || []) {
    const metadata = (row.metadata || {}) as ContentMetadata;
    attachmentsByContentId.set(row.id, metadata.feedbackAttachments || {});
  }

  const feedbackByContentId = new Map<string, FeedbackEntry[]>();
  for (const pin of pinRows || []) {
    const entry: FeedbackEntry = {
      id: pin.id,
      contentItemId: pin.content_item_id,
      reviewerName: pin.author_name,
      reviewerRole: "client",
      targetArea: TARGET_AREA_FROM_DB[pin.target_area || "general"] || "General",
      note: pin.note,
      slideNumber: pin.slide_index + 1,
      pinX: pin.pin_x ?? undefined,
      pinY: pin.pin_y ?? undefined,
      referenceImageUrl: attachmentsByContentId.get(pin.content_item_id)?.[pin.id],
      createdAt: formatTimestamp(new Date(pin.created_at)),
    };
    const list = feedbackByContentId.get(pin.content_item_id) || [];
    list.push(entry);
    feedbackByContentId.set(pin.content_item_id, list);
  }

  const items: ContentItem[] = [];
  for (const row of contentRows || []) {
    const client = clientById.get(row.client_id);
    if (!client) continue;
    items.push(rowToContentItem(row, client, feedbackByContentId.get(row.id) || []));
  }

  const quotas: Record<string, ClientQuotas> = {};
  for (const c of clients || []) {
    quotas[c.slug] = {
      posts: c.quota_posts ?? 4,
      reels: c.quota_reels ?? 2,
      carousels: c.quota_carousels ?? 2,
      stories: c.quota_stories ?? 2,
      total: c.quota_total ?? 10,
    };
  }

  return { items, quotas };
}

export async function createContentItem(item: ContentItem): Promise<ContentItem> {
  const supabase = requireClient();
  const client = await getClientRowBySlug(item.clientSlug);
  const metadata = buildMetadata(item);

  const { data, error } = await supabase
    .from("content_items")
    .insert({
      client_id: client.id,
      title: item.title,
      format: item.format,
      status: item.status,
      caption: item.caption || null,
      scheduled_at: scheduledAtFromParts(item.day, item.month, item.year, item.time),
      channels: item.channels,
      aspect_ratio: item.aspectRatio,
      revision_count: item.revisionCount || 1,
      media_urls: extractMediaUrls(item.slides),
      metadata,
    })
    .select()
    .single();
  if (error || !data) throw new Error(error?.message || "Failed to create content item.");

  await insertRevision(data.id, {
    revisionNumber: data.revision_count,
    status: data.status as ContentStatus,
    title: data.title,
    caption: data.caption,
    reviewerName: "Agency",
  });

  return rowToContentItem(data, client, []);
}

export async function deleteContentItem(id: string): Promise<void> {
  const supabase = requireClient();
  const { error } = await supabase.from("content_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export interface ContentItemPatch {
  status?: ContentStatus;
  statusLabel?: string;
  revisionCount?: number;
  publishedAt?: string | null;
  title?: string;
  caption?: string;
  day?: number;
  month?: number;
  year?: number;
  time?: string;
  approvalRecord?: ApprovalRecord;
  slides?: ContentSlide[];
}

export async function updateContentItem(id: string, patch: ContentItemPatch): Promise<void> {
  const supabase = requireClient();

  const { data: existing, error: fetchError } = await supabase
    .from("content_items")
    .select("metadata, scheduled_at")
    .eq("id", id)
    .single();
  if (fetchError || !existing) throw new Error(fetchError?.message || "Content item not found.");

  const metadata = buildMetadata(
    { statusLabel: patch.statusLabel, approvalRecord: patch.approvalRecord, slides: patch.slides },
    (existing.metadata || {}) as ContentMetadata
  );

  const update: Record<string, unknown> = { metadata };
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.revisionCount !== undefined) update.revision_count = patch.revisionCount;
  if (patch.publishedAt !== undefined) update.published_at = patch.publishedAt;
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.caption !== undefined) update.caption = patch.caption;
  if (patch.slides !== undefined) update.media_urls = extractMediaUrls(patch.slides);
  if (patch.day !== undefined || patch.month !== undefined || patch.year !== undefined || patch.time !== undefined) {
    const current = partsFromScheduledAt(existing.scheduled_at);
    update.scheduled_at = scheduledAtFromParts(
      patch.day ?? current.day,
      patch.month ?? current.month,
      patch.year ?? current.year,
      patch.time ?? current.time
    );
  }

  const { error } = await supabase.from("content_items").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

export interface RevisionInput {
  revisionNumber: number;
  status: ContentStatus;
  title: string;
  caption?: string | null;
  feedbackNote?: string | null;
  targetArea?: FeedbackEntry["targetArea"] | null;
  reviewerName?: string | null;
}

export async function insertRevision(contentItemId: string, revision: RevisionInput): Promise<void> {
  const supabase = requireClient();
  const dbStatus = revision.status === "scheduled" ? "approved" : revision.status;
  const { error } = await supabase.from("content_revisions").insert({
    content_item_id: contentItemId,
    revision_number: revision.revisionNumber,
    status: dbStatus,
    title: revision.title,
    caption: revision.caption ?? null,
    feedback_note: revision.feedbackNote ?? null,
    target_area: revision.targetArea ?? null,
    reviewer_name: revision.reviewerName ?? null,
  });
  if (error) throw new Error(error.message);
}

export interface FeedbackInput {
  reviewerName: string;
  targetArea: FeedbackEntry["targetArea"];
  note: string;
  slideNumber?: number;
  pinX?: number;
  pinY?: number;
}

export async function insertFeedbackPin(contentItemId: string, feedback: FeedbackInput): Promise<{ id: string }> {
  const supabase = requireClient();
  const { count } = await supabase
    .from("feedback_pins")
    .select("id", { count: "exact", head: true })
    .eq("content_item_id", contentItemId);

  const { data, error } = await supabase
    .from("feedback_pins")
    .insert({
      content_item_id: contentItemId,
      slide_index: (feedback.slideNumber || 1) - 1,
      pin_number: (count || 0) + 1,
      pin_x: feedback.pinX ?? null,
      pin_y: feedback.pinY ?? null,
      author_name: feedback.reviewerName,
      target_area: TARGET_AREA_TO_DB[feedback.targetArea],
      note: feedback.note,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message || "Failed to save feedback.");
  return { id: data.id };
}

export async function attachFeedbackImage(contentItemId: string, pinId: string, url: string): Promise<void> {
  const supabase = requireClient();
  const { data: existing, error: fetchError } = await supabase
    .from("content_items")
    .select("metadata")
    .eq("id", contentItemId)
    .single();
  if (fetchError || !existing) throw new Error(fetchError?.message || "Content item not found.");

  const metadata = (existing.metadata || {}) as ContentMetadata;
  const feedbackAttachments = { ...(metadata.feedbackAttachments || {}), [pinId]: url };

  const { error } = await supabase
    .from("content_items")
    .update({ metadata: { ...metadata, feedbackAttachments } })
    .eq("id", contentItemId);
  if (error) throw new Error(error.message);
}

export async function updateClientQuotasRow(clientSlug: string, quotas: ClientQuotas): Promise<void> {
  const supabase = requireClient();
  const { error } = await supabase
    .from("clients")
    .update({
      quota_posts: quotas.posts,
      quota_reels: quotas.reels,
      quota_carousels: quotas.carousels ?? 0,
      quota_stories: quotas.stories,
      quota_total: quotas.total,
    })
    .eq("slug", clientSlug);
  if (error) throw new Error(error.message);
}

export async function resetWorkspaceSampleData(): Promise<{
  items: ContentItem[];
  quotas: Record<string, ClientQuotas>;
}> {
  const supabase = requireClient();

  const { data: clients, error: clientsError } = await supabase.from("clients").select("*");
  if (clientsError) throw new Error(clientsError.message);

  const clientIds = (clients || []).map((c) => c.id);
  if (clientIds.length > 0) {
    const { error: deleteError } = await supabase.from("content_items").delete().in("client_id", clientIds);
    if (deleteError) throw new Error(deleteError.message);
  }

  for (const client of clients || []) {
    const sample = SAMPLE_CLIENTS.find((c) => c.slug === client.slug);
    if (!sample?.quotas) continue;
    const { error: quotaError } = await supabase
      .from("clients")
      .update({
        quota_posts: sample.quotas.posts,
        quota_reels: sample.quotas.reels,
        quota_carousels: sample.quotas.carousels ?? 0,
        quota_stories: sample.quotas.stories,
        quota_total: sample.quotas.total,
      })
      .eq("id", client.id);
    if (quotaError) throw new Error(quotaError.message);
  }

  for (const seedItem of INITIAL_CONTENT_ITEMS) {
    const client = (clients || []).find((c) => c.slug === seedItem.clientSlug);
    if (!client) continue;

    const metadata = buildMetadata(seedItem);
    const { data: inserted, error: insertError } = await supabase
      .from("content_items")
      .insert({
        client_id: client.id,
        title: seedItem.title,
        format: seedItem.format,
        status: seedItem.status,
        caption: seedItem.caption || null,
        scheduled_at: scheduledAtFromParts(seedItem.day, seedItem.month, seedItem.year, seedItem.time),
        channels: seedItem.channels,
        aspect_ratio: seedItem.aspectRatio,
        revision_count: seedItem.revisionCount || 1,
        published_at: null,
        metadata,
      })
      .select()
      .single();
    if (insertError) throw new Error(insertError.message);

    for (const feedback of [...(seedItem.feedbackHistory || [])].reverse()) {
      if (!inserted) continue;
      await supabase.from("feedback_pins").insert({
        content_item_id: inserted.id,
        slide_index: (feedback.slideNumber || 1) - 1,
        pin_x: feedback.pinX ?? null,
        pin_y: feedback.pinY ?? null,
        author_name: feedback.reviewerName,
        target_area: TARGET_AREA_TO_DB[feedback.targetArea],
        note: feedback.note,
      });
    }
  }

  return fetchContentWorkspace();
}
