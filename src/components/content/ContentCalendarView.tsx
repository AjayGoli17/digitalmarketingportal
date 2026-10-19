"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  LayoutGrid,
  List as ListIcon,
  Play,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CalendarX,
  Moon,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  ContentItem,
  ContentFormat,
  ContentStatus,
  PublishingChannel,
} from "@/lib/data/contentItems";
import {
  MONTH_NAMES,
  WEEKDAY_SHORT,
  buildMonthWeeks,
  dateKey,
  formatLongDate,
  shiftMonth,
  timeToMinutes,
} from "@/lib/calendar";
import { CreateContentModal } from "./CreateContentModal";
import { ContentPreviewModal } from "./ContentPreviewModal";
import { SAMPLE_CLIENTS } from "@/lib/data/clients";
import { useContentWorkflow } from "@/components/context/ContentWorkflowContext";

/** Visual language per workflow status. Badge variants share names with ContentStatus. */
const STATUS_META: Record<
  ContentStatus,
  { label: string; variant: BadgeVariant; dot: string; accent: string }
> = {
  draft: { label: "Draft", variant: "draft", dot: "bg-zinc-400", accent: "border-l-zinc-300" },
  pending: { label: "Pending", variant: "pending", dot: "bg-[#D97706]", accent: "border-l-[#D97706]" },
  changes: { label: "Changes requested", variant: "changes", dot: "bg-[#DC2626]", accent: "border-l-[#DC2626]" },
  approved: { label: "Approved", variant: "approved", dot: "bg-[#16A34A]", accent: "border-l-[#16A34A]" },
  published: { label: "Published", variant: "published", dot: "bg-aura-primary", accent: "border-l-aura-primary" },
  scheduled: { label: "Scheduled", variant: "scheduled", dot: "bg-[#4F46E5]", accent: "border-l-[#4F46E5]" },
};

const CHANNEL_SHORT: Record<PublishingChannel, string> = {
  instagram: "IG",
  pinterest: "PIN",
  tiktok: "TT",
};

const FORMAT_FILTERS: { id: "all" | ContentFormat; label: string }[] = [
  { id: "all", label: "All" },
  { id: "post", label: "Posts" },
  { id: "carousel", label: "Carousels" },
  { id: "reel", label: "Reels" },
  { id: "story", label: "Stories" },
];

function ChannelChips({ channels }: { channels: PublishingChannel[] }) {
  if (!channels?.length) return null;
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Channels: ${channels.join(", ")}`}>
      {channels.map((ch) => (
        <span
          key={ch}
          title={ch}
          className="rounded bg-surface-container px-1 py-px text-[9px] font-bold tracking-wide text-ink-secondary"
        >
          {CHANNEL_SHORT[ch] ?? ch}
        </span>
      ))}
    </span>
  );
}

export function ContentCalendarView() {
  const { items, createContent, deleteContent, approveContent } = useContentWorkflow();
  const [viewMode, setViewMode] = React.useState<"calendar" | "list">("calendar");
  const [selectedClientSlug, setSelectedClientSlug] = React.useState<string>("kanso-botanicals");
  const [selectedFormatFilter, setSelectedFormatFilter] = React.useState<"all" | ContentFormat>("all");

  // "Today" and the visible month are resolved on the client so server and browser
  // never disagree about the date (avoids hydration mismatches).
  const [today, setToday] = React.useState<{ year: number; month: number; day: number } | null>(null);
  const [view, setView] = React.useState<{ year: number; month: number } | null>(null);

  React.useEffect(() => {
    const now = new Date();
    const t = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    setToday(t);
    setView({ year: t.year, month: t.month });
  }, []);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ContentItem | null>(null);
  const [previewItem, setPreviewItem] = React.useState<ContentItem | null>(null);
  const [createDay, setCreateDay] = React.useState<number | undefined>(undefined);

  const currentMonthIndex = view?.month ?? 1;
  const currentYear = view?.year ?? 1970;
  const currentMonthName = MONTH_NAMES[currentMonthIndex - 1];
  const currentMonthLabel = view ? `${currentMonthName} ${currentYear}` : "Loading…";

  const goToMonth = (delta: number) =>
    setView((v) => (v ? shiftMonth(v.year, v.month, delta) : v));

  const handlePrevMonth = () => goToMonth(-1);
  const handleNextMonth = () => goToMonth(1);
  const handleGoToToday = () => {
    if (today) setView({ year: today.year, month: today.month });
  };

  const isViewingToday =
    !!today && !!view && today.year === view.year && today.month === view.month;

  // Client + format filtered items across ALL months (so padding days and "jump" can use them)
  const scopedItems = React.useMemo(
    () =>
      items.filter(
        (item) =>
          (selectedClientSlug === "all" || item.clientSlug === selectedClientSlug) &&
          (selectedFormatFilter === "all" || item.format === selectedFormatFilter)
      ),
    [items, selectedClientSlug, selectedFormatFilter]
  );

  // Items in the visible month (used by list view, counts and empty states)
  const filteredItems = React.useMemo(
    () =>
      scopedItems
        .filter((i) => i.month === currentMonthIndex && i.year === currentYear)
        .sort((a, b) => a.day - b.day || timeToMinutes(a.time) - timeToMinutes(b.time)),
    [scopedItems, currentMonthIndex, currentYear]
  );

  // Items grouped by exact date, sorted by time of day
  const itemsByDate = React.useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    for (const item of scopedItems) {
      const key = dateKey(item.year, item.month, item.day);
      const list = map.get(key);
      if (list) list.push(item);
      else map.set(key, [item]);
    }
    map.forEach((list) => list.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)));
    return map;
  }, [scopedItems]);

  // Counts for filter pills + status legend (client + month scoped, ignoring format filter)
  const counts = React.useMemo(() => {
    const base = items.filter(
      (item) =>
        (selectedClientSlug === "all" || item.clientSlug === selectedClientSlug) &&
        item.month === currentMonthIndex &&
        item.year === currentYear
    );
    const byFormat: Record<"all" | ContentFormat, number> = {
      all: base.length,
      post: base.filter((i) => i.format === "post").length,
      carousel: base.filter((i) => i.format === "carousel").length,
      reel: base.filter((i) => i.format === "reel").length,
      story: base.filter((i) => i.format === "story").length,
    };
    const byStatus = (Object.keys(STATUS_META) as ContentStatus[]).reduce(
      (acc, s) => ({ ...acc, [s]: base.filter((i) => i.status === s).length }),
      {} as Record<ContentStatus, number>
    );
    return { byFormat, byStatus };
  }, [items, selectedClientSlug, currentMonthIndex, currentYear]);

  // Most relevant month with content, for the empty-state shortcut
  const latestContentMonth = React.useMemo(() => {
    if (!scopedItems.length) return null;
    const latest = scopedItems.reduce((best, i) =>
      i.year * 12 + i.month > best.year * 12 + best.month ? i : best
    );
    return { year: latest.year, month: latest.month };
  }, [scopedItems]);

  const showJumpToContent =
    !!latestContentMonth &&
    (latestContentMonth.year !== currentYear || latestContentMonth.month !== currentMonthIndex);

  const weeks = React.useMemo(
    () => (view ? buildMonthWeeks(view.year, view.month) : []),
    [view]
  );

  const selectedClient = SAMPLE_CLIENTS.find((c) => c.slug === selectedClientSlug);

  // Save content item (unchanged behaviour: the workflow context creates the record)
  const handleSaveItem = (itemData: Partial<ContentItem>) => {
    createContent({
      ...itemData,
      title: itemData.title || "Untitled Deliverable",
      clientSlug: selectedClientSlug === "all" ? "kanso-botanicals" : selectedClientSlug,
      clientName:
        SAMPLE_CLIENTS.find((c) => c.slug === selectedClientSlug)?.name ||
        "Kanso Botanicals",
      day: itemData.day || createDay || 15,
      month: editingItem?.month ?? currentMonthIndex,
      year: editingItem?.year ?? currentYear,
    });
  };

  const handleDeleteItem = (id: string) => {
    deleteContent(id);
    if (previewItem && previewItem.id === id) {
      setPreviewItem(null);
    }
  };

  const handleStatusChange = (id: string, status: "approved" | "pending") => {
    if (status === "approved") {
      approveContent(id);
    }
    if (previewItem && previewItem.id === id) {
      setPreviewItem((prev) =>
        prev ? { ...prev, status, statusLabel: status === "approved" ? "Approved" : "Pending Approval" } : null
      );
    }
  };

  const openCreate = (day?: number) => {
    setEditingItem(null);
    setCreateDay(day);
    setIsCreateOpen(true);
  };

  const openEdit = (item: ContentItem) => {
    setEditingItem(item);
    setIsCreateOpen(true);
  };

  const isToday = (y: number, m: number, d: number) =>
    !!today && today.year === y && today.month === m && today.day === d;

  /** Calendar-grid post card: one button opens preview, a sibling button opens edit. */
  const renderCalendarCard = (item: ContentItem) => {
    const meta = STATUS_META[item.status] ?? STATUS_META.draft;
    return (
      <div
        key={item.id}
        className={cn(
          "group/card relative rounded-lg border border-hairline-subtle border-l-[3px] bg-white shadow-whisper transition-all hover:border-zinc-300 hover:shadow-popover focus-within:ring-2 focus-within:ring-aura-primary",
          meta.accent
        )}
      >
        <button
          type="button"
          onClick={() => setPreviewItem(item)}
          aria-label={`Preview ${item.title}, ${item.formatLabel}, ${item.statusLabel || meta.label}, ${item.time}`}
          className="block w-full space-y-1.5 rounded-lg p-2 pr-7 text-left focus-visible:outline-none"
        >
          <span className="flex items-center justify-between gap-1 text-[10px]">
            <span className="inline-flex items-center gap-1 rounded bg-surface-container px-1.5 py-0.5 font-semibold text-ink-secondary">
              {item.format === "reel" && <Play className="h-2.5 w-2.5 fill-current" aria-hidden />}
              {item.format === "carousel" && item.slideCount
                ? `Carousel 1/${item.slideCount}`
                : item.formatLabel}
            </span>
            <span className="font-mono text-ink-tertiary">{item.time}</span>
          </span>
          <span className="block truncate text-[11px] font-semibold leading-tight text-ink-primary">
            {item.title}
          </span>
          <span className="flex items-center justify-between gap-1">
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium")}>
              <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden />
              <span className="text-ink-secondary">{item.statusLabel || meta.label}</span>
            </span>
            <ChannelChips channels={item.channels} />
          </span>
        </button>
        <button
          type="button"
          onClick={() => openEdit(item)}
          aria-label={`Edit ${item.title}`}
          title="Edit item"
          className="absolute right-1 top-1 rounded p-1 text-ink-tertiary transition-colors hover:bg-surface-container hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-primary"
        >
          <MoreVertical className="h-3 w-3" aria-hidden />
        </button>
      </div>
    );
  };

  /** Mobile agenda row for a single post. */
  const renderAgendaRow = (item: ContentItem) => {
    const meta = STATUS_META[item.status] ?? STATUS_META.draft;
    return (
      <li key={item.id} className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => setPreviewItem(item)}
          aria-label={`Preview ${item.title}, ${item.formatLabel}, ${item.statusLabel || meta.label}, ${item.time}`}
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-1.5 rounded-xl border border-hairline-subtle border-l-4 bg-white p-3 text-left shadow-whisper transition-colors hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-primary",
            meta.accent
          )}
        >
          <span className="flex items-center justify-between gap-2 text-[11px]">
            <span className="font-mono text-ink-tertiary">{item.time}</span>
            <Badge variant={meta.variant} size="sm" withDot>
              {item.statusLabel || meta.label}
            </Badge>
          </span>
          <span className="truncate text-sm font-semibold text-ink-primary">{item.title}</span>
          <span className="flex items-center gap-2 text-[11px] text-ink-secondary">
            <span>{item.formatLabel}</span>
            <ChannelChips channels={item.channels} />
          </span>
        </button>
        <button
          type="button"
          onClick={() => openEdit(item)}
          aria-label={`Edit ${item.title}`}
          className="shrink-0 self-center rounded-lg p-2 text-ink-tertiary hover:bg-surface-container hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-primary"
        >
          <Edit className="h-4 w-4" aria-hidden />
        </button>
      </li>
    );
  };

  // Days of the visible month that have content (mobile agenda)
  const agendaDays = React.useMemo(() => {
    const byDay = new Map<number, ContentItem[]>();
    for (const item of filteredItems) {
      const list = byDay.get(item.day);
      if (list) list.push(item);
      else byDay.set(item.day, [item]);
    }
    return Array.from(byDay.entries()).sort((a, b) => a[0] - b[0]);
  }, [filteredItems]);

  const pillClass = (active: boolean) =>
    cn(
      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-primary",
      active
        ? "bg-ink-primary text-white"
        : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
    );

  const emptyMonthPanel = (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-ink-tertiary">
        <CalendarX className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-primary">
          Nothing scheduled for {currentMonthLabel}
        </p>
        <p className="mt-1 text-xs text-ink-secondary">
          {selectedFormatFilter !== "all"
            ? "No content matches the current format filter this month."
            : "Plan the month ahead by adding your first deliverable."}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => openCreate()}>
          Schedule content
        </Button>
        {showJumpToContent && latestContentMonth && (
          <Button variant="secondary" size="sm" onClick={() => setView(latestContentMonth)}>
            Jump to {MONTH_NAMES[latestContentMonth.month - 1]} {latestContentMonth.year}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-label-caps text-aura-primary font-bold uppercase tracking-wider">
              Social Production Pipeline
            </span>
            <span className="text-ink-tertiary">·</span>
            <span className="text-xs text-ink-secondary">Q4 Strategy Schedule</span>
          </div>
          <h1 className="text-headline-lg lg:text-display-lg font-semibold text-ink-primary tracking-tight">
            Content Calendar
          </h1>
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Client Selector Dropdown */}
          <div className="relative">
            <label htmlFor="calendar-client" className="sr-only">
              Client
            </label>
            <select
              id="calendar-client"
              value={selectedClientSlug}
              onChange={(e) => setSelectedClientSlug(e.target.value)}
              className="h-9 rounded-lg border border-hairline-subtle bg-white pl-8 pr-8 text-xs font-semibold text-ink-primary outline-none hover:border-zinc-300 shadow-whisper cursor-pointer appearance-none transition-colors focus-visible:ring-2 focus-visible:ring-aura-primary"
            >
              <option value="all">All Clients</option>
              {SAMPLE_CLIENTS.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded bg-surface-container-high text-[9px] font-bold text-ink-primary flex items-center justify-center pointer-events-none border border-hairline-subtle">
              {selectedClient?.initials || "ALL"}
            </div>
          </div>

          {/* Month Navigator */}
          <div
            role="group"
            aria-label="Change month"
            className="inline-flex items-center rounded-lg border border-hairline-subtle bg-white shadow-whisper p-0.5"
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!view}
              className="p-1.5 text-ink-tertiary hover:text-ink-primary rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-primary"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden />
            </button>
            <span
              className="px-3 min-w-[8.5rem] text-center text-xs font-semibold text-ink-primary whitespace-nowrap"
              aria-live="polite"
            >
              {currentMonthLabel}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={!view}
              className="p-1.5 text-ink-tertiary hover:text-ink-primary rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-primary"
              aria-label="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5" aria-hidden />
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleGoToToday}
            disabled={!today || isViewingToday}
            aria-label="Go to current month"
          >
            Today
          </Button>

          {/* View Mode Switcher: Calendar / List */}
          <div
            role="group"
            aria-label="Switch view"
            className="inline-flex rounded-lg border border-hairline-subtle bg-white shadow-whisper p-0.5 text-xs"
          >
            {(
              [
                { id: "calendar", label: "Calendar", Icon: LayoutGrid },
                { id: "list", label: "List", Icon: ListIcon },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={viewMode === id}
                onClick={() => setViewMode(id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-primary",
                  viewMode === id
                    ? "bg-surface-container text-ink-primary font-semibold"
                    : "text-ink-secondary hover:text-ink-primary"
                )}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Create Content CTA */}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => openCreate()}
            className="shadow-sm font-medium"
          >
            Create Content
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-hairline-subtle pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs" role="group" aria-label="Filter by format">
          {FORMAT_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={selectedFormatFilter === f.id}
              onClick={() => setSelectedFormatFilter(f.id)}
              className={pillClass(selectedFormatFilter === f.id)}
            >
              <span>{f.label}</span>
              <span className="text-[10px] opacity-80">{counts.byFormat[f.id]}</span>
            </button>
          ))}
        </div>

        {/* Status legend: only the statuses this app supports; "Scheduled" only when present */}
        <ul
          aria-label="Status legend"
          className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-ink-secondary"
        >
          {(Object.keys(STATUS_META) as ContentStatus[])
            .filter((s) => s !== "scheduled" || counts.byStatus[s] > 0)
            .map((s) => (
              <li key={s} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", STATUS_META[s].dot)} aria-hidden />
                <span>
                  {STATUS_META[s].label} ({counts.byStatus[s]})
                </span>
              </li>
            ))}
        </ul>
      </div>

      {!view ? (
        <div
          className="h-96 animate-pulse rounded-2xl border border-hairline-subtle bg-surface-container-low/40"
          aria-busy="true"
          aria-label="Loading calendar"
        />
      ) : viewMode === "calendar" ? (
        <>
          {/* DESKTOP / TABLET: month grid */}
          <div className="hidden md:block bg-white rounded-2xl border border-hairline-subtle shadow-whisper overflow-hidden">
            <div
              role="grid"
              aria-label={`Content calendar for ${currentMonthLabel}`}
              className="divide-y divide-hairline"
            >
              <div role="row" className="grid grid-cols-7 border-b border-hairline bg-surface-container-low/40 text-center py-2.5 text-label-caps uppercase text-ink-tertiary font-bold tracking-wider">
                {WEEKDAY_SHORT.map((d) => (
                  <div key={d} role="columnheader">
                    {d}
                  </div>
                ))}
              </div>

              {weeks.map((week, wi) => (
                <div key={wi} role="row" className="grid grid-cols-7 divide-x divide-hairline">
                  {week.map((cell) => {
                    const cellItems = itemsByDate.get(dateKey(cell.year, cell.month, cell.day)) ?? [];
                    const todayCell = isToday(cell.year, cell.month, cell.day);
                    const isWeekend = cell.weekdayIndex >= 5;
                    return (
                      <div
                        key={`${cell.year}-${cell.month}-${cell.day}`}
                        role="gridcell"
                        aria-current={todayCell ? "date" : undefined}
                        aria-label={`${formatLongDate(cell.year, cell.month, cell.day)}${
                          todayCell ? ", today" : ""
                        }, ${cellItems.length === 0 ? "no content" : `${cellItems.length} scheduled`}`}
                        className={cn(
                          "group relative flex min-h-[120px] lg:min-h-[160px] flex-col p-1.5 lg:p-2.5 transition-colors",
                          cell.inMonth
                            ? "bg-white hover:bg-surface-container-low/20"
                            : "bg-surface-container-low/30",
                          todayCell && "bg-indigo-50/40"
                        )}
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span
                            className={cn(
                              "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold",
                              todayCell
                                ? "bg-aura-primary text-white"
                                : cell.inMonth
                                ? "text-ink-primary"
                                : "text-ink-tertiary/60"
                            )}
                          >
                            {cell.day}
                          </span>
                          {cell.inMonth && (
                            <button
                              type="button"
                              onClick={() => openCreate(cell.day)}
                              aria-label={`Add content on ${formatLongDate(cell.year, cell.month, cell.day)}`}
                              className="rounded p-1 text-ink-tertiary opacity-0 transition-opacity hover:bg-surface-container hover:text-ink-primary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-primary group-hover:opacity-100 group-focus-within:opacity-100"
                            >
                              <Plus className="h-3 w-3" aria-hidden />
                            </button>
                          )}
                        </div>

                        {cellItems.length > 0 ? (
                          <div className="flex-1 space-y-1.5">{cellItems.map(renderCalendarCard)}</div>
                        ) : (
                          cell.inMonth &&
                          isWeekend && (
                            <div
                              className="flex flex-1 items-center justify-center text-ink-tertiary/30"
                              aria-hidden
                            >
                              {cell.weekdayIndex === 5 ? (
                                <Moon className="h-5 w-5 stroke-[1.5]" />
                              ) : (
                                <Coffee className="h-5 w-5 stroke-[1.5]" />
                              )}
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {filteredItems.length === 0 && <div className="border-t border-hairline">{emptyMonthPanel}</div>}
          </div>

          {/* MOBILE: agenda of days that have content */}
          <div className="md:hidden space-y-4">
            {agendaDays.length === 0 ? (
              <div className="rounded-2xl border border-hairline-subtle bg-white shadow-whisper">
                {emptyMonthPanel}
              </div>
            ) : (
              agendaDays.map(([day, dayItems]) => {
                const todayRow = isToday(currentYear, currentMonthIndex, day);
                return (
                  <section key={day} aria-label={formatLongDate(currentYear, currentMonthIndex, day)}>
                    <div className="mb-2 flex items-center justify-between">
                      <h2
                        className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          todayRow ? "text-aura-primary" : "text-ink-tertiary"
                        )}
                        aria-current={todayRow ? "date" : undefined}
                      >
                        {formatLongDate(currentYear, currentMonthIndex, day)}
                        {todayRow && " · Today"}
                      </h2>
                      <button
                        type="button"
                        onClick={() => openCreate(day)}
                        aria-label={`Add content on ${formatLongDate(currentYear, currentMonthIndex, day)}`}
                        className="rounded p-1.5 text-ink-tertiary hover:bg-surface-container hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-primary"
                      >
                        <Plus className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                    <ul className="space-y-2">{dayItems.map(renderAgendaRow)}</ul>
                  </section>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* LIST VIEW MODE */
        <Card className="overflow-hidden bg-white">
          {filteredItems.length === 0 ? (
            emptyMonthPanel
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <caption className="sr-only">Content scheduled for {currentMonthLabel}</caption>
                <thead className="bg-surface-container-low/50 border-b border-hairline text-label-caps uppercase text-ink-tertiary font-semibold">
                  <tr>
                    <th scope="col" className="py-3 px-4">Date & Time</th>
                    <th scope="col" className="py-3 px-4">Deliverable Title</th>
                    <th scope="col" className="py-3 px-4">Client</th>
                    <th scope="col" className="py-3 px-4">Format</th>
                    <th scope="col" className="py-3 px-4">Channels</th>
                    <th scope="col" className="py-3 px-4">Status</th>
                    <th scope="col" className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filteredItems.map((item) => {
                    const meta = STATUS_META[item.status] ?? STATUS_META.draft;
                    return (
                      <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs text-ink-secondary whitespace-nowrap">
                          {MONTH_NAMES[item.month - 1]?.slice(0, 3)} {item.day}, {item.year} • {item.time}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-ink-primary">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-md bg-gradient-to-br ${item.bgGradient} border border-hairline shrink-0 flex items-center justify-center text-[9px] font-serif italic text-ink-primary`}
                              aria-hidden
                            >
                              {item.clientInitials}
                            </div>
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className="max-w-xs truncate text-left hover:text-aura-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-primary rounded"
                            >
                              {item.title}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-ink-secondary text-xs">{item.clientName}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant="neutral" size="sm">
                            {item.formatLabel}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-ink-secondary capitalize">
                          {item.channels.join(", ")}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={meta.variant} size="sm" withDot>
                            {item.statusLabel || meta.label}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className="p-1.5 rounded text-ink-tertiary hover:text-ink-primary hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-primary"
                              title="View preview"
                              aria-label={`View preview of ${item.title}`}
                            >
                              <Eye className="w-3.5 h-3.5" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="p-1.5 rounded text-ink-tertiary hover:text-ink-primary hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-primary"
                              title="Edit deliverable"
                              aria-label={`Edit ${item.title}`}
                            >
                              <Edit className="w-3.5 h-3.5" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 rounded text-ink-tertiary hover:text-[#DC2626] hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-primary"
                              title="Delete deliverable"
                              aria-label={`Delete ${item.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Create / Edit Deliverable Modal */}
      <CreateContentModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingItem(null);
          setCreateDay(undefined);
        }}
        onSave={handleSaveItem}
        initialItem={editingItem}
        clientName={selectedClient?.name || "Kanso Botanicals"}
        clientSlug={selectedClient?.slug || "kanso-botanicals"}
        month={editingItem?.month ?? currentMonthIndex}
        year={editingItem?.year ?? currentYear}
        initialDay={createDay}
      />

      {/* Content Preview & Review Modal */}
      <ContentPreviewModal
        isOpen={Boolean(previewItem)}
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onEdit={(item) => openEdit(item)}
        onDelete={handleDeleteItem}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
