export interface SocialPlatform {
  name: "instagram" | "tiktok" | "pinterest" | "calendar" | "bag" | "video";
  label: string;
}

export interface ClientDeliverable {
  id: string;
  title: string;
  format: "SINGLE POST" | "REEL / VIDEO" | "CAROUSEL" | "STORY ARC";
  formatType: "post" | "reel" | "carousel" | "story";
  status: "pending_approval" | "approved" | "scheduled" | "changes_requested";
  statusLabel: string;
  mediaTags: string[];
  bannerBg: string;
  bannerType: "image" | "video";
  headline: string;
  caption: string;
  channelLabel: string;
  scheduledDate: string;
  avatarText: string;
  footerAuthor: string;
  slideCount?: number;
}

export interface ProductionMemo {
  version: string;
  title: string;
  guidelines: string;
  colorProfile: string;
  aspectRatios: string;
  approverContact: string;
}

export interface ClientQuotas {
  posts: number;
  reels: number;
  stories: number;
  carousels?: number;
  total: number;
}

export interface Client {
  id: string;
  slug: string;
  code: string; // e.g. "CLIENT 04"
  name: string;
  initials: string;
  category: string;
  industry: string;
  retainerTier: string;
  platforms: ("instagram" | "tiktok" | "pinterest" | "bag" | "video")[];
  status: "active" | "in_production" | "paused";
  statusLabel: string;
  cycle: string;
  cycleProgress: number; // percentage, e.g. 83
  deliveredCount: number;
  totalQuotas: number;
  quotas: ClientQuotas;
  approvedCount: number;
  pendingCount: number;
  inReviewCount: number;
  bannerGradient: string;
  bannerImageText?: string;
  bannerSubtitle?: string;
  productionMemo: ProductionMemo;
  pendingDeliverables: ClientDeliverable[];
  activePipeline: ClientDeliverable[];
}

export const SAMPLE_CLIENTS: Client[] = [
  {
    id: "c1",
    slug: "kanso-botanicals",
    code: "CLIENT 04",
    name: "Kanso Botanicals",
    initials: "KB",
    category: "Clean Skincare",
    industry: "Skincare & Wellness",
    retainerTier: "Monthly Retainer Tier II",
    platforms: ["instagram", "video", "pinterest"],
    status: "active",
    statusLabel: "Active Retainer",
    cycle: "November 2024",
    cycleProgress: 83,
    deliveredCount: 10,
    totalQuotas: 12,
    quotas: { posts: 6, reels: 2, stories: 2, carousels: 2, total: 12 },
    approvedCount: 7,
    pendingCount: 2,
    inReviewCount: 1,
    bannerGradient: "from-[#DFD7CF] to-[#C9BFB5]",
    bannerImageText: "Aura Botanica",
    bannerSubtitle: "REVITALIZING ELIXIR",
    productionMemo: {
      version: "v2.4",
      title: "Art Direction Guidelines v2.4",
      guidelines:
        "Maintain muted Scandinavian neutrals, travertine textures, and natural daylight shadows. Avoid high-saturation contrast or synthetic studio lighting for this cycle.",
      colorProfile: "Warm Clay / Mineral",
      aspectRatios: "4:5, 9:16",
      approverContact: "Elena Rostova",
    },
    pendingDeliverables: [
      {
        id: "d1",
        title: "Restorative Oil Batch 04",
        format: "SINGLE POST",
        formatType: "post",
        status: "pending_approval",
        statusLabel: "Pending Client Approval",
        mediaTags: ["Hi-Res Still", "4:5 Feed"],
        bannerBg: "from-[#ECE5DC] to-[#D5CABE]",
        bannerType: "image",
        headline: "Restorative Oil Batch 04",
        caption:
          '"Quiet formulations for loud environments. Introducing Batch 04, steeped with cold-pressed meadowfoam and raw maritime cedar."',
        channelLabel: "INSTAGRAM FEED",
        scheduledDate: "Scheduled Nov 2",
        avatarText: "KB",
        footerAuthor: "Kanso Feed",
      },
      {
        id: "d2",
        title: "Morning Ritual with Founder",
        format: "REEL / VIDEO",
        formatType: "reel",
        status: "pending_approval",
        statusLabel: "Pending Client Approval",
        mediaTags: ["00:28 Shortform", "9:16 Vertical"],
        bannerBg: "from-[#DDD5CD] to-[#BFB4A8]",
        bannerType: "video",
        headline: "Morning Ritual with Founder",
        caption:
          "Atmospheric morning sequence documenting slow botanic distillation and sunrise tea preparation. Studio sound design layered...",
        channelLabel: "TIKTOK + IG REEL",
        scheduledDate: "Scheduled Nov 4",
        avatarText: "KB",
        footerAuthor: "Editorial Cut v2",
      },
    ],
    activePipeline: [
      {
        id: "p1",
        title: "Ceramic Ritual Holders",
        format: "CAROUSEL",
        formatType: "carousel",
        status: "approved",
        statusLabel: "Approved",
        mediaTags: ["4 Slides"],
        bannerBg: "from-[#E6DFD5] to-[#CCC2B4]",
        bannerType: "image",
        headline: "Ceramic Ritual Holders",
        caption: "Architectural stillness paired with tactile st...",
        channelLabel: "Instagram Feed",
        scheduledDate: "Scheduled Nov 8",
        avatarText: "KB",
        footerAuthor: "Studio Feed",
        slideCount: 4,
      },
      {
        id: "p2",
        title: "Exclusive Drop Preview",
        format: "STORY ARC",
        formatType: "story",
        status: "scheduled",
        statusLabel: "Scheduled",
        mediaTags: ["Countdown Sticker"],
        bannerBg: "from-[#D5CDC3] to-[#B8AEA0]",
        bannerType: "image",
        headline: "Exclusive Drop Preview",
        caption: "Architectural light studies with direct RSVP...",
        channelLabel: "Instagram Story",
        scheduledDate: "Scheduled Nov 10",
        avatarText: "KB",
        footerAuthor: "Stories Engine",
      },
    ],
  },
  {
    id: "c2",
    slug: "alta-living",
    code: "CLIENT 02",
    name: "Alta Living",
    initials: "AL",
    category: "Boutique Architecture",
    industry: "Hospitality & Interiors",
    retainerTier: "Monthly Retainer Tier I",
    platforms: ["instagram", "bag"],
    status: "active",
    statusLabel: "Active Retainer",
    cycle: "November 2024",
    cycleProgress: 77,
    deliveredCount: 14,
    totalQuotas: 18,
    quotas: { posts: 8, reels: 4, stories: 2, carousels: 4, total: 18 },
    approvedCount: 12,
    pendingCount: 2,
    inReviewCount: 0,
    bannerGradient: "from-[#CFCBC8] to-[#ABA6A1]",
    bannerImageText: "ALTA Hotel",
    bannerSubtitle: "WEEKEND SUITE TOUR",
    productionMemo: {
      version: "v1.8",
      title: "Architectural Lighting Direction v1.8",
      guidelines:
        "High-contrast chiaroscuro light casting through brutalist arches. Minimalist typography overlays in monospaced sans.",
      colorProfile: "Monochrome Concrete / Raw Linen",
      aspectRatios: "4:5, 9:16",
      approverContact: "Marcus Vance",
    },
    pendingDeliverables: [
      {
        id: "d3",
        title: "Penthouse Travertine Study",
        format: "SINGLE POST",
        formatType: "post",
        status: "pending_approval",
        statusLabel: "Pending Client Approval",
        mediaTags: ["Hi-Res Still", "4:5 Feed"],
        bannerBg: "from-[#D8D4CF] to-[#B5AFA9]",
        bannerType: "image",
        headline: "Penthouse Travertine Study",
        caption:
          "Monolithic volume framed by south-facing floor-to-ceiling glazing. A dialogue between stone weight and morning lightness.",
        channelLabel: "INSTAGRAM FEED",
        scheduledDate: "Scheduled Nov 6",
        avatarText: "AL",
        footerAuthor: "Alta Curations",
      },
    ],
    activePipeline: [
      {
        id: "p3",
        title: "Atelier Suite Walkthrough",
        format: "STORY ARC",
        formatType: "story",
        status: "scheduled",
        statusLabel: "Scheduled",
        mediaTags: ["Interactive Poll"],
        bannerBg: "from-[#C9C4BE] to-[#A39E98]",
        bannerType: "image",
        headline: "Atelier Suite Walkthrough",
        caption: "Swipe-up room tour and reservation link...",
        channelLabel: "Instagram Story",
        scheduledDate: "Scheduled Nov 12",
        avatarText: "AL",
        footerAuthor: "Alta Media",
      },
    ],
  },
  {
    id: "c3",
    slug: "maison-studio",
    code: "CLIENT 01",
    name: "Maison Studio",
    initials: "MS",
    category: "Luxury Fashion",
    industry: "Luxury Fashion",
    retainerTier: "Bespoke Editorial Retainer",
    platforms: ["bag", "video", "instagram"],
    status: "in_production",
    statusLabel: "In Production",
    cycle: "November 2024",
    cycleProgress: 100,
    deliveredCount: 8,
    totalQuotas: 8,
    quotas: { posts: 4, reels: 2, stories: 1, carousels: 1, total: 8 },
    approvedCount: 8,
    pendingCount: 0,
    inReviewCount: 0,
    bannerGradient: "from-[#D6CCC3] to-[#B3A698]",
    bannerImageText: "Maison Studio",
    bannerSubtitle: "AW24 COLLECTION",
    productionMemo: {
      version: "v3.1",
      title: "Parisienne Street Visual Tone v3.1",
      guidelines:
        "35mm film grain, analog color timing with warm highlight bias. Street candid framing with deliberate blur on motion.",
      colorProfile: "Warm 35mm Tungsten",
      aspectRatios: "4:5, 9:16",
      approverContact: "Marc Delacroix",
    },
    pendingDeliverables: [],
    activePipeline: [
      {
        id: "p4",
        title: "Behind The Lens: AW24",
        format: "REEL / VIDEO",
        formatType: "reel",
        status: "approved",
        statusLabel: "Approved",
        mediaTags: ["Color Graded"],
        bannerBg: "from-[#CFC4B7] to-[#A79787]",
        bannerType: "video",
        headline: "Behind The Lens: AW24",
        caption: "Final studio master certified for multi-channel launch.",
        channelLabel: "TIKTOK + REEL",
        scheduledDate: "Scheduled Nov 16",
        avatarText: "MS",
        footerAuthor: "Editorial Cut",
      },
    ],
  },
  {
    id: "c4",
    slug: "ceramics-and-form",
    code: "CLIENT 03",
    name: "Ceramics & Form",
    initials: "CE",
    category: "Artisan Interior",
    industry: "Artisan Interior",
    retainerTier: "Monthly Retainer Tier I",
    platforms: ["instagram", "pinterest"],
    status: "active",
    statusLabel: "Active Retainer",
    cycle: "November 2024",
    cycleProgress: 60,
    deliveredCount: 6,
    totalQuotas: 10,
    quotas: { posts: 4, reels: 2, stories: 2, carousels: 2, total: 10 },
    approvedCount: 5,
    pendingCount: 1,
    inReviewCount: 0,
    bannerGradient: "from-[#D9D3CA] to-[#BDB4A7]",
    bannerImageText: "Ceramics & Form",
    bannerSubtitle: "TERRA FIRMA DROP",
    productionMemo: {
      version: "v1.2",
      title: "Tactile Earth Texture Guide v1.2",
      guidelines:
        "Macro focus on raw stoneware textures, uneven rim glazes, and natural earth clay pigment gradients.",
      colorProfile: "Terracotta / Raw Sand",
      aspectRatios: "4:5, 1:1",
      approverContact: "Hannah Vance",
    },
    pendingDeliverables: [
      {
        id: "d4",
        title: "Handcrafted Earth Vessel Drop",
        format: "SINGLE POST",
        formatType: "post",
        status: "pending_approval",
        statusLabel: "Pending Client Approval",
        mediaTags: ["Macro Hi-Res", "Feed 4:5"],
        bannerBg: "from-[#DDD8D1] to-[#BEB6AA]",
        bannerType: "image",
        headline: "Handcrafted Earth Vessel Drop",
        caption:
          '"Each silhouette carries deliberate imperfections from the wood-fired kiln. Limited release of 45 numbered pieces."',
        channelLabel: "INSTAGRAM FEED",
        scheduledDate: "Scheduled Nov 19",
        avatarText: "CE",
        footerAuthor: "Studio Nord Edit",
      },
    ],
    activePipeline: [],
  },
];

// Helper functions for data access
export function getClients(filter?: { status?: string; search?: string }): Client[] {
  let list = [...SAMPLE_CLIENTS];

  if (filter?.status && filter.status !== "all") {
    list = list.filter((c) => c.status === filter.status);
  }

  if (filter?.search) {
    const q = (filter.search || "").toLowerCase().trim();
    if (q) {
      list = list.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.category && c.category.toLowerCase().includes(q)) ||
          (c.industry && c.industry.toLowerCase().includes(q))
      );
    }
  }

  return list;
}

export function getClientBySlug(slug: string): Client | undefined {
  if (!slug) return SAMPLE_CLIENTS[0];
  const clean = slug.trim().toLowerCase();
  return SAMPLE_CLIENTS.find((c) => c.slug.toLowerCase() === clean) || SAMPLE_CLIENTS[0];
}
