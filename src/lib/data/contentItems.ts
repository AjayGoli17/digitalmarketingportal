export type ContentFormat = "post" | "carousel" | "reel" | "story";
export type ContentStatus =
  | "draft"
  | "pending"
  | "changes"
  | "approved"
  | "published"
  | "scheduled"; // backwards compatible
export type PublishingChannel = "instagram" | "pinterest" | "tiktok";

export interface FeedbackEntry {
  id: string;
  contentItemId: string;
  reviewerName: string;
  reviewerRole: "client" | "agency";
  targetArea: "Caption & Copy" | "Slide Photo" | "Scheduling Time" | "Hashtags" | "General";
  note: string;
  slideNumber?: number;
  createdAt: string;
}

export interface ApprovalRecord {
  approvedBy: string;
  approvedAt: string;
  comment?: string;
}

export interface ContentSlide {
  id: number;
  title: string;
  subtitle?: string;
  bgGradient: string;
  filename?: string;
}

export interface ContentItem {
  id: string;
  clientSlug: string;
  clientName: string;
  clientInitials: string;
  title: string;
  format: ContentFormat;
  formatLabel: string;
  status: ContentStatus;
  statusLabel: string;
  day: number; // day of month 1-31
  month: number; // 1-12 (11 = Nov)
  year: number; // 2024
  time: string; // "09:30 AM"
  channels: PublishingChannel[];
  aspectRatio: "4:5" | "9:16" | "1:1";
  caption: string;
  slideCount?: number;
  duration?: string;
  bgGradient: string;
  previewHeroText?: string;
  slides?: ContentSlide[];

  // Workflow, Feedback history & Approval details
  feedbackHistory?: FeedbackEntry[];
  approvalRecord?: ApprovalRecord;
  publishedAt?: string;
  revisionCount?: number;
}

export const INITIAL_CONTENT_ITEMS: ContentItem[] = [
  {
    id: "item-1",
    clientSlug: "kanso-botanicals",
    clientName: "Kanso Botanicals",
    clientInitials: "KB",
    title: "Botanica Drops",
    format: "post",
    formatLabel: "Post",
    status: "approved",
    statusLabel: "Approved",
    day: 4,
    month: 11,
    year: 2024,
    time: "09:30 AM",
    channels: ["instagram"],
    aspectRatio: "4:5",
    caption:
      "Formulations grounded in wild harvesting. Our cold-pressed botanical drops hydrate and restore dermal barrier balance. #BotanicaDrops #Kanso #CleanSkincare",
    bgGradient: "from-[#E6DFD5] to-[#CCC2B4]",
    previewHeroText: "Aura Botanica",
    approvalRecord: {
      approvedBy: "Elena Rostova (Client)",
      approvedAt: "Nov 3, 2024, 02:15 PM",
      comment: "Approved for scheduled publication.",
    },
    slides: [
      {
        id: 1,
        title: "Botanica Drops",
        subtitle: "HERO SERUM STILL",
        bgGradient: "from-[#ECE5DC] to-[#D5CABE]",
        filename: "Botanica_Drops_V1.png",
      },
    ],
  },
  {
    id: "item-2",
    clientSlug: "kanso-botanicals",
    clientName: "Kanso Botanicals",
    clientInitials: "KB",
    title: "Founder Q&A",
    format: "reel",
    formatLabel: "Reel",
    status: "pending",
    statusLabel: "Pending Approval",
    day: 6,
    month: 11,
    year: 2024,
    time: "05:00 PM",
    channels: ["instagram", "tiktok"],
    aspectRatio: "9:16",
    duration: "0:42",
    caption:
      "Elena sits down to discuss the autumn extraction process and answers community questions regarding meadowfoam integrity. #BehindTheBrand #FounderStory",
    bgGradient: "from-[#DDD5CD] to-[#BFB4A8]",
    previewHeroText: "Founder Q&A",
    slides: [
      {
        id: 1,
        title: "Elena Q&A Cut",
        subtitle: "0:42 REEL VIDEO",
        bgGradient: "from-[#DDD5CD] to-[#BFB4A8]",
        filename: "Founder_Story_4K.mp4",
      },
    ],
  },
  {
    id: "item-3",
    clientSlug: "kanso-botanicals",
    clientName: "Kanso Botanicals",
    clientInitials: "KB",
    title: "Studio Sanctuary",
    format: "carousel",
    formatLabel: "Carousel",
    status: "changes",
    statusLabel: "Changes Requested",
    day: 8,
    month: 11,
    year: 2024,
    time: "11:00 AM",
    channels: ["instagram", "pinterest"],
    aspectRatio: "4:5",
    slideCount: 4,
    caption:
      "A walkthrough of our botanical apothecary and stone drying room. Natural illumination meets restrained design. #StudioSanctuary #CleanAesthetic",
    bgGradient: "from-[#DFD7CF] to-[#C9BFB5]",
    previewHeroText: "Studio Sanctuary",
    revisionCount: 1,
    feedbackHistory: [
      {
        id: "fb-1",
        contentItemId: "item-3",
        reviewerName: "Elena Rostova (Client)",
        reviewerRole: "client",
        targetArea: "Slide Photo",
        note: "Could we warm up the lighting on slide 2? The stone vessels look slightly too cool against the brand palette.",
        slideNumber: 2,
        createdAt: "Nov 7, 2024, 04:30 PM",
      },
    ],
    slides: [
      { id: 1, title: "Apothecary Overview", bgGradient: "from-[#E6DFD5] to-[#CCC2B4]" },
      { id: 2, title: "Stoneware Vessels", bgGradient: "from-[#DFD7CF] to-[#C9BFB5]" },
      { id: 3, title: "Drying Flora", bgGradient: "from-[#D5CDC3] to-[#B8AEA0]" },
      { id: 4, title: "Bench Detail", bgGradient: "from-[#CFCBC8] to-[#ABA6A1]" },
    ],
  },
  {
    id: "item-4",
    clientSlug: "kanso-botanicals",
    clientName: "Kanso Botanicals",
    clientInitials: "KB",
    title: "Early Access VIP Vault",
    format: "story",
    formatLabel: "Story",
    status: "draft",
    statusLabel: "Draft",
    day: 12,
    month: 11,
    year: 2024,
    time: "08:00 AM",
    channels: ["instagram"],
    aspectRatio: "9:16",
    caption:
      "Private VIP link for Autumn Drop 02 subscribers. Swipe up to access remaining numbered batches. #EarlyAccess #AuraCurations",
    bgGradient: "from-[#D5CDC3] to-[#B8AEA0]",
    previewHeroText: "Early Access",
  },
  {
    id: "item-5",
    clientSlug: "kanso-botanicals",
    clientName: "Kanso Botanicals",
    clientInitials: "KB",
    title: "Evening Ritual",
    format: "reel",
    formatLabel: "Reel",
    status: "published",
    statusLabel: "Published",
    day: 14,
    month: 11,
    year: 2024,
    time: "06:30 PM",
    channels: ["instagram", "tiktok"],
    aspectRatio: "9:16",
    duration: "0:30",
    publishedAt: "Nov 14, 2024, 06:30 PM",
    approvalRecord: {
      approvedBy: "Elena Rostova (Client)",
      approvedAt: "Nov 10, 2024, 11:00 AM",
    },
    caption:
      "Nighttime restoration sequence. Four drops warmed in palms and applied with slow upward strokes. #EveningRitual #SlowBeauty",
    bgGradient: "from-[#DDD5CD] to-[#BFB4A8]",
    previewHeroText: "Evening Ritual",
  },
  {
    id: "item-6",
    clientSlug: "kanso-botanicals",
    clientName: "Kanso Botanicals",
    clientInitials: "KB",
    title: "Serum Study",
    format: "post",
    formatLabel: "Post",
    status: "approved",
    statusLabel: "Approved",
    day: 15,
    month: 11,
    year: 2024,
    time: "02:15 PM",
    channels: ["instagram", "pinterest"],
    aspectRatio: "4:5",
    caption:
      "Ingredient provenance: maritime cedar oil distilled at 60 degrees to preserve active antioxidants. #BotanicalStudy #IngredientTruth",
    bgGradient: "from-[#E6DFD5] to-[#CCC2B4]",
    previewHeroText: "Serum Study",
  },
  {
    id: "item-7",
    clientSlug: "kanso-botanicals",
    clientName: "Kanso Botanicals",
    clientInitials: "KB",
    title: "VIP Drop",
    format: "story",
    formatLabel: "Story",
    status: "pending",
    statusLabel: "Pending",
    day: 20,
    month: 11,
    year: 2024,
    time: "10:00 AM",
    channels: ["instagram"],
    aspectRatio: "9:16",
    caption:
      "Exclusive preview for Tier II partners. RSVP for tomorrow's live keynote studio broadcast.",
    bgGradient: "from-[#CFCBC8] to-[#ABA6A1]",
    previewHeroText: "VIP Drop",
  },
  {
    id: "item-8",
    clientSlug: "kanso-botanicals",
    clientName: "Kanso Botanicals",
    clientInitials: "KB",
    title: "Restorative Botanical Elixir — Autumn Drop 02",
    format: "carousel",
    formatLabel: "Carousel",
    status: "pending",
    statusLabel: "Pending",
    day: 14,
    month: 11,
    year: 2024,
    time: "10:30 AM",
    channels: ["instagram", "pinterest"],
    aspectRatio: "4:5",
    slideCount: 5,
    caption:
      "Quiet formulations for loud environments. Batch 04 features organic cold-pressed meadowfoam and raw maritime cedar. Link in bio for private vault access. #KansoBotanicals #CleanFormulations #MindfulRituals #BotanicalSkincare",
    bgGradient: "from-[#DFD7CF] to-[#C9BFB5]",
    previewHeroText: "Aura Botanica",
    slides: [
      { id: 1, title: "Packaging Still", bgGradient: "from-[#ECE5DC] to-[#D5CABE]" },
      { id: 2, title: "Texture Focus", subtitle: "2400 × 3000px", bgGradient: "from-[#DFD7CF] to-[#C9BFB5]" },
      { id: 3, title: "Application Study", bgGradient: "from-[#DDD5CD] to-[#BFB4A8]" },
      { id: 4, title: "Founder Portrait", bgGradient: "from-[#D5CDC3] to-[#B8AEA0]" },
      { id: 5, title: "Unboxing Gift Box", bgGradient: "from-[#CFCBC8] to-[#ABA6A1]" },
    ],
  },
  {
    id: "item-9",
    clientSlug: "kanso-botanicals",
    clientName: "Kanso Botanicals",
    clientInitials: "KB",
    title: "Mineral Hydration Masque",
    format: "post",
    formatLabel: "Post",
    status: "approved",
    statusLabel: "Approved",
    day: 22,
    month: 11,
    year: 2024,
    time: "01:00 PM",
    channels: ["instagram"],
    aspectRatio: "4:5",
    caption:
      "Deep marine clay infused with alpine chamomile. Weekly reset for stressed barrier layers.",
    bgGradient: "from-[#E6DFD5] to-[#CCC2B4]",
    previewHeroText: "Mineral Masque",
  },
  {
    id: "item-10",
    clientSlug: "kanso-botanicals",
    clientName: "Kanso Botanicals",
    clientInitials: "KB",
    title: "Solstice Ritual Teaser",
    format: "post",
    formatLabel: "Post",
    status: "approved",
    statusLabel: "Approved",
    day: 25,
    month: 11,
    year: 2024,
    time: "11:30 AM",
    channels: ["instagram", "pinterest"],
    aspectRatio: "4:5",
    caption:
      "Marking the arrival of winter light. First batch teasers dropping exclusively to email list.",
    bgGradient: "from-[#DFD7CF] to-[#C9BFB5]",
    previewHeroText: "Solstice Ritual",
  },
  {
    id: "item-11",
    clientSlug: "kanso-botanicals",
    clientName: "Kanso Botanicals",
    clientInitials: "KB",
    title: "Extraction Lab Micro-Cuts",
    format: "post",
    formatLabel: "Post",
    status: "approved",
    statusLabel: "Approved",
    day: 27,
    month: 11,
    year: 2024,
    time: "04:15 PM",
    channels: ["instagram"],
    aspectRatio: "4:5",
    caption:
      "Macro views of botanical oil distillation. Preserving cold-pressed bioactive nutrients.",
    bgGradient: "from-[#ECE5DC] to-[#D5CABE]",
    previewHeroText: "Extraction Lab",
  },
  {
    id: "item-12",
    clientSlug: "kanso-botanicals",
    clientName: "Kanso Botanicals",
    clientInitials: "KB",
    title: "November Monthly Wrap",
    format: "post",
    formatLabel: "Post",
    status: "approved",
    statusLabel: "Approved",
    day: 29,
    month: 11,
    year: 2024,
    time: "05:45 PM",
    channels: ["instagram"],
    aspectRatio: "4:5",
    caption:
      "November retrospective: 3,400 orders shipped and 12 sustainable harvests processed.",
    bgGradient: "from-[#DDD5CD] to-[#BFB4A8]",
    previewHeroText: "Monthly Wrap",
  },
  // Additional items for other clients so switching clients shows real data
  {
    id: "item-alta-1",
    clientSlug: "alta-living",
    clientName: "Alta Living",
    clientInitials: "AL",
    title: "Weekend Suite Tour",
    format: "carousel",
    formatLabel: "Carousel",
    status: "approved",
    statusLabel: "Approved",
    day: 8,
    month: 11,
    year: 2024,
    time: "09:00 AM",
    channels: ["instagram", "pinterest"],
    aspectRatio: "4:5",
    slideCount: 4,
    caption:
      "Travertine architecture under morning solstice lighting. Reservations for penthouse suites are now open.",
    bgGradient: "from-[#CFCBC8] to-[#ABA6A1]",
    previewHeroText: "Alta Living",
  },
  {
    id: "item-maison-1",
    clientSlug: "maison-studio",
    clientName: "Maison Studio",
    clientInitials: "MS",
    title: "Behind The Lens: AW24",
    format: "reel",
    formatLabel: "Reel",
    status: "approved",
    statusLabel: "Approved",
    day: 16,
    month: 11,
    year: 2024,
    time: "02:00 PM",
    channels: ["instagram", "tiktok"],
    aspectRatio: "9:16",
    duration: "0:28",
    caption:
      "35mm film memories of the Paris winter collection staging. Direct cuts from Marc Delacroix.",
    bgGradient: "from-[#D6CCC3] to-[#B3A698]",
    previewHeroText: "Maison Studio",
  },
];
