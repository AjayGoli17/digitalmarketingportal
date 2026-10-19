import { ContentItem, ContentFormat } from "@/lib/data/contentItems";
import { Client, ClientQuotas, SAMPLE_CLIENTS } from "@/lib/data/clients";

/**
 * AURA EDITORIAL AGENCY - DELIVERABLES METRICS & COUNTING RULES ENGINE
 *
 * COUNTING RULES SPECIFICATION:
 * 1. Deliverable Completion:
 *    A deliverable is counted as COMPLETED if and only if item.status === 'published'.
 *    Items in 'draft', 'pending', 'changes', or 'approved' (awaiting publication)
 *    are counted as active/pipeline deliverables and DO NOT count as completed.
 * 2. Scope & Temporal Isolation:
 *    Content items are evaluated strictly against their assigned client (clientSlug or clientName)
 *    and the target reporting month and year (item.month and item.year).
 * 3. Revision Handling:
 *    Revisions increment revisionCount on the same content item ID and never create duplicate entries.
 * 4. Zero Quotas:
 *    Division by zero is guarded via safePercentage(), which returns 0% when promised === 0
 *    (or 100% if items were published with zero quota).
 * 5. Historical Months:
 *    Changing reporting months recalculates totals strictly from items scheduled for that month,
 *    preserving historical published records without resetting or data loss.
 */

export interface DeliverableMetric {
  promised: number;
  completed: number; // status === 'published'
  remaining: number; // Math.max(0, promised - completed)
  overQuota: number; // Math.max(0, completed - promised)
  isOverQuota: boolean;
  percentage: number; // safePercentage(completed, promised)
}

export interface ClientMonthlyReport {
  clientId: string;
  clientSlug: string;
  clientName: string;
  clientInitials: string;
  month: number;
  year: number;
  monthLabel: string;
  monthName: string;
  quotas: ClientQuotas;
  posts: DeliverableMetric;
  reels: DeliverableMetric;
  stories: DeliverableMetric;
  carousels: DeliverableMetric;
  total: DeliverableMetric;
  statusCounts: {
    draft: number;
    pending: number;
    changes: number;
    approved: number;
    published: number;
  };
  inProductionCount: number; // draft + pending + changes + approved
  pipelineCount: number; // alias
  awaitingApprovalCount: number; // pending + changes
  totalCompleted: number;
  totalPromised: number;
  totalRemaining: number;
  totalPercentage: number;
  overQuota: number;
  isOverQuota: boolean;
  items: ContentItem[];
}

export interface ClientPaceItem {
  clientSlug: string;
  clientName: string;
  completed: number;
  promised: number;
  remaining: number;
  overQuota: number;
  isOverQuota: boolean;
  percentage: number;
}

export interface AgencyDashboardMetrics {
  month: number;
  year: number;
  monthLabel: string;
  activeClientsCount: number;
  activeClients: number;
  totalClientsCount: number;
  contentAwaitingApprovalCount: number;
  pendingApprovals: number;
  contentPublishedThisMonthCount: number;
  overallCompletionPercentage: number;
  overallPercentage: number;
  totalPromisedAcrossClients: number;
  totalPromised: number;
  totalCompletedAcrossClients: number;
  totalCompleted: number;
  totalRemaining: number;
  clientReports: ClientMonthlyReport[];
  clientPaces: ClientPaceItem[];
  clientsApproachingQuota: ClientMonthlyReport[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function getMonthLabel(month: number, year: number): string {
  const m = Math.max(1, Math.min(12, month));
  return `${MONTH_NAMES[m - 1]} ${year}`;
}

export const formatMonthYear = getMonthLabel;

export const FORMAT_CONFIG: Record<
  "posts" | "reels" | "carousels" | "stories",
  { label: string; key: "posts" | "reels" | "carousels" | "stories" }
> = {
  posts: { label: "Feed Posts", key: "posts" },
  reels: { label: "Reels & Video", key: "reels" },
  carousels: { label: "Carousels", key: "carousels" },
  stories: { label: "Stories", key: "stories" },
};

export type FormatDeliverableMetric = DeliverableMetric;

export function isDeliverableCompleted(item: ContentItem): boolean {
  return item?.status === "published";
}

export function safePercentage(completed: number, promised: number): number {
  const comp = typeof completed === "number" && !isNaN(completed) ? completed : 0;
  const prom = typeof promised === "number" && !isNaN(promised) ? promised : 0;
  if (prom <= 0) {
    return comp > 0 ? 100 : 0;
  }
  return Math.round((comp / prom) * 100);
}

function calculateMetric(completed: number, promised: number): DeliverableMetric {
  const comp = typeof completed === "number" && !isNaN(completed) ? Math.max(0, completed) : 0;
  const prom = typeof promised === "number" && !isNaN(promised) ? Math.max(0, promised) : 0;
  const remaining = Math.max(0, prom - comp);
  const overQuota = Math.max(0, comp - prom);
  const percentage = safePercentage(comp, prom);
  return {
    promised: prom,
    completed: comp,
    remaining,
    overQuota,
    isOverQuota: overQuota > 0,
    percentage,
  };
}

/**
 * Calculates monthly deliverable quota tracking for a single client.
 * Supports both (clientOrSlug, allItems, month, year, customQuotas)
 * and (clientSlug, clientName, allItems, customQuotas, month, year).
 */
export function calculateClientMonthlyReport(
  arg1: Client | string,
  arg2: ContentItem[] | string,
  arg3: number | ContentItem[],
  arg4?: number | ClientQuotas,
  arg5?: ClientQuotas | number,
  arg6?: number
): ClientMonthlyReport {
  let clientSlug: string = "kanso-botanicals";
  let allItems: ContentItem[] = [];
  let month: number = 11;
  let year: number = 2024;
  let customQuotas: ClientQuotas | undefined;

  if (typeof arg2 === "string") {
    // Called as (clientSlug, clientName, allItems, quotas, month, year)
    clientSlug = typeof arg1 === "string" ? arg1 : (arg1 as Client)?.slug || "kanso-botanicals";
    allItems = Array.isArray(arg3) ? arg3 : [];
    customQuotas = typeof arg4 === "object" && arg4 !== null ? (arg4 as ClientQuotas) : undefined;
    month = typeof arg5 === "number" ? arg5 : 11;
    year = typeof arg6 === "number" ? arg6 : 2024;
  } else {
    // Called as (clientOrSlug, allItems, month, year, customQuotas)
    clientSlug = typeof arg1 === "string" ? arg1 : (arg1 as Client)?.slug || "kanso-botanicals";
    allItems = Array.isArray(arg2) ? arg2 : [];
    month = typeof arg3 === "number" ? arg3 : 11;
    year = typeof arg4 === "number" ? arg4 : 2024;
    customQuotas = typeof arg5 === "object" && arg5 !== null ? (arg5 as ClientQuotas) : undefined;
  }

  const cleanSlug = (clientSlug || "").trim().toLowerCase();

  const found = SAMPLE_CLIENTS.find(
    (c) =>
      c.slug.toLowerCase() === cleanSlug ||
      (c.name && c.name.toLowerCase() === cleanSlug)
  );

  const client: Client = found || {
    id: clientSlug || "c-default",
    slug: clientSlug || "kanso-botanicals",
    code: "CLIENT",
    name: typeof arg2 === "string" ? arg2 : clientSlug || "Client",
    initials: (clientSlug || "CL").substring(0, 2).toUpperCase(),
    category: "Retainer",
    industry: "General",
    retainerTier: "Standard",
    platforms: ["instagram"],
    status: "active",
    statusLabel: "Active",
    cycle: getMonthLabel(month, year),
    cycleProgress: 0,
    deliveredCount: 0,
    totalQuotas: customQuotas?.total || 12,
    quotas: customQuotas || { posts: 4, reels: 2, stories: 2, carousels: 2, total: 10 },
    approvedCount: 0,
    pendingCount: 0,
    inReviewCount: 0,
    bannerGradient: "from-zinc-200 to-zinc-300",
    pendingDeliverables: [],
    activePipeline: [],
    productionMemo: {
      version: "1.0",
      title: "Production Memo",
      guidelines: "",
      colorProfile: "sRGB",
      aspectRatios: "4:5, 9:16",
      approverContact: "admin@aura.agency",
    },
  };

  const quotas: ClientQuotas = {
    posts: customQuotas?.posts ?? client.quotas?.posts ?? 6,
    reels: customQuotas?.reels ?? client.quotas?.reels ?? 2,
    stories: customQuotas?.stories ?? client.quotas?.stories ?? 2,
    carousels: customQuotas?.carousels ?? client.quotas?.carousels ?? 2,
    total: customQuotas?.total ?? client.quotas?.total ?? client.totalQuotas ?? 12,
  };

  // Filter items for this specific client and target month/year with strict null guards
  const clientTargetSlug = client.slug ? client.slug.toLowerCase() : "";
  const clientTargetName = client.name ? client.name.toLowerCase() : "";

  const clientItems = (allItems || []).filter((item) => {
    if (!item) return false;
    const itemSlug = item.clientSlug ? item.clientSlug.toLowerCase() : "";
    const itemName = item.clientName ? item.clientName.toLowerCase() : "";

    const matchesClient =
      (clientTargetSlug && itemSlug === clientTargetSlug) ||
      (clientTargetName && itemName === clientTargetName) ||
      (clientTargetName && itemSlug.includes(clientTargetName)) ||
      (itemName && clientTargetName.includes(itemName));

    const itemMonth = typeof item.month === "number" ? item.month : 11;
    const itemYear = typeof item.year === "number" ? item.year : 2024;
    const matchesDate = itemMonth === month && itemYear === year;

    return Boolean(matchesClient && matchesDate);
  });

  // Calculate completed count per format (strictly status === 'published')
  const completedPosts = clientItems.filter(
    (i) => i.format === "post" && isDeliverableCompleted(i)
  ).length;

  const completedReels = clientItems.filter(
    (i) => i.format === "reel" && isDeliverableCompleted(i)
  ).length;

  const completedStories = clientItems.filter(
    (i) => i.format === "story" && isDeliverableCompleted(i)
  ).length;

  const completedCarousels = clientItems.filter(
    (i) => i.format === "carousel" && isDeliverableCompleted(i)
  ).length;

  const completedTotal = completedPosts + completedReels + completedStories + completedCarousels;

  // Breakdown by status
  const statusCounts = {
    draft: clientItems.filter((i) => i.status === "draft").length,
    pending: clientItems.filter((i) => i.status === "pending").length,
    changes: clientItems.filter((i) => i.status === "changes").length,
    approved: clientItems.filter((i) => i.status === "approved").length,
    published: completedTotal,
  };

  const inProductionCount =
    statusCounts.draft + statusCounts.pending + statusCounts.changes + statusCounts.approved;

  const awaitingApprovalCount = statusCounts.pending + statusCounts.changes;

  const postsMetric = calculateMetric(completedPosts, quotas.posts);
  const reelsMetric = calculateMetric(completedReels, quotas.reels);
  const storiesMetric = calculateMetric(completedStories, quotas.stories);
  const carouselsMetric = calculateMetric(
    completedCarousels,
    quotas.carousels !== undefined ? quotas.carousels : 0
  );
  const totalMetric = calculateMetric(completedTotal, quotas.total);

  return {
    clientId: client.id,
    clientSlug: client.slug,
    clientName: client.name,
    clientInitials: client.initials,
    month,
    year,
    monthLabel: getMonthLabel(month, year),
    monthName: getMonthLabel(month, year),
    quotas,
    posts: postsMetric,
    reels: reelsMetric,
    stories: storiesMetric,
    carousels: carouselsMetric,
    total: totalMetric,
    statusCounts,
    inProductionCount,
    pipelineCount: inProductionCount,
    awaitingApprovalCount,
    totalCompleted: totalMetric.completed,
    totalPromised: totalMetric.promised,
    totalRemaining: totalMetric.remaining,
    totalPercentage: totalMetric.percentage,
    overQuota: totalMetric.overQuota,
    isOverQuota: totalMetric.overQuota > 0,
    items: clientItems,
  };
}

/**
 * Calculates studio-wide metrics for the Agency Dashboard & Deliverables Overview
 */
export function calculateAgencyDashboardMetrics(
  arg1: any,
  arg2: any,
  arg3?: any,
  arg4?: any,
  arg5?: any
): AgencyDashboardMetrics {
  let clients: Client[];
  let allItems: ContentItem[];
  let month: number;
  let year: number;
  let clientQuotaOverrides: Record<string, ClientQuotas> | undefined;

  // Check whether first argument is allItems or clients
  if (Array.isArray(arg1) && (arg1.length === 0 || "format" in arg1[0])) {
    // Called as (allItems, clients, clientQuotaOverrides, month, year)
    allItems = arg1;
    clients = Array.isArray(arg2) ? arg2 : SAMPLE_CLIENTS;
    clientQuotaOverrides = arg3;
    month = typeof arg4 === "number" ? arg4 : 11;
    year = typeof arg5 === "number" ? arg5 : 2024;
  } else if (Array.isArray(arg2) && (arg2.length === 0 || "format" in arg2[0])) {
    // Called as (clients, allItems, month, year, clientQuotaOverrides) or (clients, allItems, clientQuotaOverrides, month, year)
    clients = Array.isArray(arg1) ? arg1 : SAMPLE_CLIENTS;
    allItems = arg2;
    if (typeof arg3 === "number") {
      month = arg3;
      year = typeof arg4 === "number" ? arg4 : 2024;
      clientQuotaOverrides = arg5;
    } else {
      clientQuotaOverrides = arg3;
      month = typeof arg4 === "number" ? arg4 : 11;
      year = typeof arg5 === "number" ? arg5 : 2024;
    }
  } else {
    clients = Array.isArray(arg1) ? arg1 : SAMPLE_CLIENTS;
    allItems = Array.isArray(arg2) ? arg2 : [];
    month = typeof arg3 === "number" ? arg3 : 11;
    year = typeof arg4 === "number" ? arg4 : 2024;
    clientQuotaOverrides = typeof arg5 === "object" ? arg5 : undefined;
  }

  const safeClients = (clients || []).filter(Boolean);
  const safeItems = (allItems || []).filter(Boolean);
  const activeClients = safeClients.filter((c) => c?.status === "active");

  const clientReports = safeClients.map((client) => {
    const override = clientQuotaOverrides && client?.slug ? clientQuotaOverrides[client.slug] : undefined;
    return calculateClientMonthlyReport(client, safeItems, month, year, override);
  });

  // Total promised across active clients
  const totalPromised = clientReports
    .filter((r) => {
      const c = safeClients.find((client) => client?.slug === r.clientSlug);
      return c?.status === "active";
    })
    .reduce((sum, r) => sum + (r.total?.promised || 0), 0);

  // Total completed (published) across active clients in this month
  const totalCompleted = clientReports
    .filter((r) => {
      const c = safeClients.find((client) => client?.slug === r.clientSlug);
      return c?.status === "active";
    })
    .reduce((sum, r) => sum + (r.total?.completed || 0), 0);

  // Content awaiting approval across the entire studio
  const contentAwaitingApprovalCount = safeItems.filter(
    (i) => i && (i.status === "pending" || i.status === "changes")
  ).length;

  // Content published in this month across all clients
  const contentPublishedThisMonthCount = safeItems.filter(
    (i) => i && isDeliverableCompleted(i) && (i.month || 11) === month && (i.year || 2024) === year
  ).length;

  const overallCompletionPercentage = safePercentage(totalCompleted, totalPromised);

  // Clients approaching or exceeding their quotas (>= 75% completed or over quota)
  const clientsApproachingQuota = clientReports.filter(
    (r) => (r.total?.percentage || 0) >= 75 || (r.total?.overQuota || 0) > 0
  );

  const clientPaces: ClientPaceItem[] = clientReports.map((r) => ({
    clientSlug: r.clientSlug,
    clientName: r.clientName,
    completed: r.total?.completed || 0,
    promised: r.total?.promised || 0,
    remaining: r.total?.remaining || 0,
    overQuota: r.total?.overQuota || 0,
    isOverQuota: (r.total?.overQuota || 0) > 0,
    percentage: r.total?.percentage || 0,
  }));

  const totalRemaining = Math.max(0, totalPromised - totalCompleted);

  return {
    month,
    year,
    monthLabel: getMonthLabel(month, year),
    activeClientsCount: activeClients.length,
    activeClients: activeClients.length,
    totalClientsCount: clients.length,
    contentAwaitingApprovalCount,
    pendingApprovals: contentAwaitingApprovalCount,
    contentPublishedThisMonthCount,
    overallCompletionPercentage,
    overallPercentage: overallCompletionPercentage,
    totalPromisedAcrossClients: totalPromised,
    totalPromised,
    totalCompletedAcrossClients: totalCompleted,
    totalCompleted,
    totalRemaining,
    clientReports,
    clientPaces,
    clientsApproachingQuota,
  };
}
