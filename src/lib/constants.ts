export interface NavItem {
  title: string;
  href: string;
  iconName: "dashboard" | "clients" | "workspace" | "content" | "approvals" | "deliverables";
  badge?: string | number;
}

export const AGENCY_NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    iconName: "dashboard",
  },
  {
    title: "Clients",
    href: "/clients",
    iconName: "clients",
  },
  {
    title: "Workspace",
    href: "/workspace",
    iconName: "workspace",
  },
  {
    title: "Content",
    href: "/content",
    iconName: "content",
  },
  {
    title: "Approvals",
    href: "/approvals",
    iconName: "approvals",
    badge: 4,
  },
  {
    title: "Deliverables",
    href: "/deliverables",
    iconName: "deliverables",
  },
];

export interface ClientTab {
  title: string;
  href: string;
  badge?: number;
}

export const CLIENT_TABS: ClientTab[] = [
  { title: "Overview", href: "/" },
  { title: "Content", href: "/content" },
  { title: "Approvals", href: "/approvals", badge: 2 },
  { title: "Deliverables", href: "/deliverables" },
  { title: "Brand Guidelines", href: "#" },
];

export type StatusType = "pending" | "changes" | "approved" | "scheduled";

export const STATUS_CONFIG: Record<
  StatusType,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    label: "Pending Review",
    bg: "bg-[#FEF3C7]",
    text: "text-[#D97706]",
    border: "border-[#FDE68A]",
    dot: "bg-[#D97706]",
  },
  changes: {
    label: "Changes Requested",
    bg: "bg-[#FEE2E2]",
    text: "text-[#DC2626]",
    border: "border-[#FECACA]",
    dot: "bg-[#DC2626]",
  },
  approved: {
    label: "Approved",
    bg: "bg-[#DCFCE7]",
    text: "text-[#16A34A]",
    border: "border-[#BBF7D0]",
    dot: "bg-[#16A34A]",
  },
  scheduled: {
    label: "Scheduled",
    bg: "bg-[#EEF2FF]",
    text: "text-[#4F46E5]",
    border: "border-[#E0E7FF]",
    dot: "bg-[#4F46E5]",
  },
};
