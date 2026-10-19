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
  Clock,
  Trash2,
  Edit,
  Eye,
  Calendar as CalendarIcon,
  Moon,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  ContentItem,
  ContentFormat,
  INITIAL_CONTENT_ITEMS,
} from "@/lib/data/contentItems";
import { CreateContentModal } from "./CreateContentModal";
import { ContentPreviewModal } from "./ContentPreviewModal";
import { SAMPLE_CLIENTS } from "@/lib/data/clients";
import { useContentWorkflow } from "@/components/context/ContentWorkflowContext";

export function ContentCalendarView() {
  const { items, createContent, deleteContent, approveContent } = useContentWorkflow();
  const [viewMode, setViewMode] = React.useState<"calendar" | "list">("calendar");
  const [selectedClientSlug, setSelectedClientSlug] = React.useState<string>("kanso-botanicals");
  const [currentMonthIndex, setCurrentMonthIndex] = React.useState(11); // 11 = November
  const [currentYear, setCurrentYear] = React.useState(2024);
  const [selectedFormatFilter, setSelectedFormatFilter] = React.useState<"all" | ContentFormat>("all");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ContentItem | null>(null);
  const [previewItem, setPreviewItem] = React.useState<ContentItem | null>(null);

  // Month navigation labels
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthLabel = `${monthNames[currentMonthIndex - 1]} ${currentYear}`;

  const handlePrevMonth = () => {
    if (currentMonthIndex === 1) {
      setCurrentMonthIndex(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 12) {
      setCurrentMonthIndex(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  // Filter items based on client, format, and month
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchClient =
        selectedClientSlug === "all" || item.clientSlug === selectedClientSlug;
      const matchFormat =
        selectedFormatFilter === "all" || item.format === selectedFormatFilter;
      const matchMonth = item.month === currentMonthIndex && item.year === currentYear;
      return matchClient && matchFormat && matchMonth;
    });
  }, [items, selectedClientSlug, selectedFormatFilter, currentMonthIndex, currentYear]);

  // Counts for filter pills
  const counts = React.useMemo(() => {
    const base = items.filter(
      (item) =>
        (selectedClientSlug === "all" || item.clientSlug === selectedClientSlug) &&
        item.month === currentMonthIndex &&
        item.year === currentYear
    );
    return {
      all: base.length,
      posts: base.filter((i) => i.format === "post").length,
      carousels: base.filter((i) => i.format === "carousel").length,
      reels: base.filter((i) => i.format === "reel").length,
      stories: base.filter((i) => i.format === "story").length,
      approved: base.filter((i) => i.status === "approved").length,
      pending: base.filter((i) => i.status === "pending" || i.status === "changes").length,
    };
  }, [items, selectedClientSlug, currentMonthIndex, currentYear]);

  // Save / update content item
  const handleSaveItem = (itemData: Partial<ContentItem>) => {
    createContent({
      ...itemData,
      title: itemData.title || "Untitled Deliverable",
      clientSlug: selectedClientSlug === "all" ? "kanso-botanicals" : selectedClientSlug,
      clientName:
        SAMPLE_CLIENTS.find((c) => c.slug === selectedClientSlug)?.name ||
        "Kanso Botanicals",
      day: itemData.day || 15,
      month: currentMonthIndex,
      year: currentYear,
    });
  };

  // Delete content item
  const handleDeleteItem = (id: string) => {
    deleteContent(id);
    if (previewItem && previewItem.id === id) {
      setPreviewItem(null);
    }
  };

  // Status toggle
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

  // November 2024 Calendar Grid computation:
  // Nov 1 2024 is Friday. Preceding days in week (Mon-Thu): Oct 28, 29, 30, 31.
  // 30 days in November: 1 to 30.
  const calendarCells = React.useMemo(() => {
    const cells: {
      type: "prev" | "current" | "next";
      day: number;
      isWeekend?: boolean;
      weekendType?: "sat" | "sun";
      items: ContentItem[];
    }[] = [];

    // Preceding 4 days of October (28, 29, 30, 31)
    cells.push({ type: "prev", day: 28, items: [] });
    cells.push({ type: "prev", day: 29, items: [] });
    cells.push({ type: "prev", day: 30, items: [] });
    cells.push({ type: "prev", day: 31, items: [] });

    // Days 1 through 30 for November
    for (let d = 1; d <= 30; d++) {
      // Nov 1 is Friday (day index 4 in Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6)
      const dayOfWeek = (d + 3) % 7;
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
      const weekendType = dayOfWeek === 5 ? "sat" : dayOfWeek === 6 ? "sun" : undefined;
      const dayItems = filteredItems.filter((i) => i.day === d);
      cells.push({ type: "current", day: d, isWeekend, weekendType, items: dayItems });
    }

    // Trailing days to complete the 35 or 42 grid cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let nextDay = 1; nextDay <= remaining; nextDay++) {
      cells.push({ type: "next", day: nextDay, items: [] });
    }

    return cells;
  }, [filteredItems]);

  const selectedClient = SAMPLE_CLIENTS.find((c) => c.slug === selectedClientSlug);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Header matching content_calendar_refined.png */}
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

        {/* Header Controls: Client dropdown, Month navigator, View switch, Create button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Client Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedClientSlug}
              onChange={(e) => setSelectedClientSlug(e.target.value)}
              className="h-9 rounded-lg border border-hairline-subtle bg-white pl-8 pr-8 text-xs font-semibold text-ink-primary outline-none hover:border-zinc-300 shadow-whisper cursor-pointer appearance-none transition-colors"
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
          <div className="inline-flex items-center rounded-lg border border-hairline-subtle bg-white shadow-whisper p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 text-ink-tertiary hover:text-ink-primary rounded transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 text-xs font-semibold text-ink-primary whitespace-nowrap">
              {currentMonthLabel}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 text-ink-tertiary hover:text-ink-primary rounded transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Mode Switcher: Calendar / List */}
          <div className="inline-flex rounded-lg border border-hairline-subtle bg-white shadow-whisper p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-surface-container text-ink-primary font-semibold"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-surface-container text-ink-primary font-semibold"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          {/* Create Content CTA */}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setEditingItem(null);
              setIsCreateOpen(true);
            }}
            className="shadow-sm font-medium"
          >
            Create Content
          </Button>
        </div>
      </div>

      {/* Filter Row matching content_calendar_refined.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline-subtle pb-4">
        {/* Format Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setSelectedFormatFilter("all")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-colors ${
              selectedFormatFilter === "all"
                ? "bg-ink-primary text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>All</span>
            <span className="text-[10px] opacity-80">{counts.all}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFormatFilter("post")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-colors ${
              selectedFormatFilter === "post"
                ? "bg-ink-primary text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>Posts</span>
            <span className="text-[10px] opacity-80">{counts.posts}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFormatFilter("carousel")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-colors ${
              selectedFormatFilter === "carousel"
                ? "bg-ink-primary text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>Carousels</span>
            <span className="text-[10px] opacity-80">{counts.carousels}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFormatFilter("reel")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-colors ${
              selectedFormatFilter === "reel"
                ? "bg-ink-primary text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>Reels</span>
            <span className="text-[10px] opacity-80">{counts.reels}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFormatFilter("story")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-colors ${
              selectedFormatFilter === "story"
                ? "bg-ink-primary text-white"
                : "bg-surface-container-high/60 text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>Stories</span>
            <span className="text-[10px] opacity-80">{counts.stories}</span>
          </button>
        </div>

        {/* Right Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-ink-secondary shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Approved ({counts.approved})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-aura-primary" />
            <span>Pending Review ({counts.pending})</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: CALENDAR GRID (content_calendar_refined.png) */}
      {viewMode === "calendar" ? (
        <div className="bg-white rounded-2xl border border-hairline-subtle shadow-whisper overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-hairline bg-surface-container-low/40 text-center py-2.5 text-label-caps uppercase text-ink-tertiary font-bold tracking-wider">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* 7-column Calendar Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-hairline">
            {calendarCells.map((cell, idx) => {
              const isCurrent = cell.type === "current";

              return (
                <div
                  key={idx}
                  className={`min-h-[160px] sm:min-h-[190px] p-2 sm:p-2.5 flex flex-col justify-between transition-colors relative group ${
                    isCurrent
                      ? "bg-white hover:bg-surface-container-low/20"
                      : "bg-surface-container-low/10 text-ink-tertiary/40"
                  }`}
                >
                  {/* Day Number Header */}
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-xs font-semibold ${
                        isCurrent ? "text-ink-primary" : "text-ink-tertiary/60"
                      }`}
                    >
                      {cell.day}
                    </span>

                    {/* Saturday/Sunday labels or icons */}
                    {cell.isWeekend && isCurrent && (
                      <span className="text-[10px] uppercase font-bold text-ink-tertiary">
                        {cell.weekendType === "sat" ? "Sat" : "Sun"}
                      </span>
                    )}

                    {/* Quick Add Button on hover */}
                    {isCurrent && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(null);
                          setIsCreateOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-surface-container text-ink-tertiary hover:text-ink-primary transition-opacity"
                        title={`Add deliverable for Nov ${cell.day}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Weekend decorative icons matching screenshot on Sat 9 & Sun 10 */}
                  {cell.isWeekend && cell.items.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-ink-tertiary/30">
                      {cell.weekendType === "sat" ? (
                        <Moon className="w-5 h-5 stroke-[1.5]" />
                      ) : (
                        <Coffee className="w-5 h-5 stroke-[1.5]" />
                      )}
                    </div>
                  )}

                  {/* Scheduled Deliverable Cards */}
                  <div className="space-y-2 flex-1">
                    {cell.items.map((item) => {
                      const isApproved = item.status === "approved";
                      return (
                        <div
                          key={item.id}
                          onClick={() => setPreviewItem(item)}
                          className="rounded-xl border border-hairline-subtle bg-white p-2 shadow-whisper hover:shadow-popover hover:border-zinc-300 transition-all cursor-pointer group/card space-y-2"
                        >
                          {/* Top Tag & Time */}
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="inline-flex items-center gap-1 font-semibold text-ink-secondary bg-surface-container px-1.5 py-0.5 rounded">
                              {item.format === "reel" && <Play className="w-2.5 h-2.5 fill-current" />}
                              {item.format === "carousel" ? `Carousel ${item.slideCount ? `1/${item.slideCount}` : ""}` : item.formatLabel}
                            </span>
                            <span className="text-ink-tertiary font-mono">
                              {item.time}
                            </span>
                          </div>

                          {/* Media Thumbnail */}
                          <div
                            className={`relative aspect-[16/10] rounded-lg overflow-hidden bg-gradient-to-br ${item.bgGradient} flex items-center justify-center p-2 text-center border border-hairline/60`}
                          >
                            <span className="text-[11px] font-serif italic text-ink-primary truncate">
                              {item.previewHeroText || item.title}
                            </span>
                            {item.duration && (
                              <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 py-0.2 rounded font-mono">
                                ▶ {item.duration}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <div className="text-[11px] font-semibold text-ink-primary truncate leading-tight">
                            {item.title}
                          </div>

                          {/* Footer: Status badge & action dots */}
                          <div className="flex items-center justify-between pt-1 border-t border-hairline/40">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                                isApproved ? "text-emerald-600" : "text-aura-primary"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isApproved ? "bg-emerald-600" : "bg-aura-primary"
                                }`}
                              />
                              {isApproved ? "Approved" : "Pending"}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingItem(item);
                                setIsCreateOpen(true);
                              }}
                              className="text-ink-tertiary hover:text-ink-primary p-0.5"
                              title="Edit item"
                            >
                              <MoreVertical className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 2: LIST VIEW MODE */
        <Card className="overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface-container-low/50 border-b border-hairline text-label-caps uppercase text-ink-tertiary font-semibold">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Deliverable Title</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Channels</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredItems.map((item) => {
                  const isApproved = item.status === "approved";
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-container-low/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs text-ink-secondary whitespace-nowrap">
                        Nov {item.day}, {item.year} • {item.time}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-ink-primary">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-md bg-gradient-to-br ${item.bgGradient} border border-hairline shrink-0 flex items-center justify-center text-[9px] font-serif italic text-ink-primary`}
                          >
                            {item.clientInitials}
                          </div>
                          <span
                            onClick={() => setPreviewItem(item)}
                            className="hover:text-aura-primary transition-colors cursor-pointer truncate max-w-xs"
                          >
                            {item.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-ink-secondary text-xs">
                        {item.clientName}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="neutral" size="sm">
                          {item.formatLabel}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-ink-secondary capitalize">
                        {item.channels.join(", ")}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={isApproved ? "approved" : "pending"}
                          size="sm"
                          withDot
                        >
                          {item.statusLabel}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded text-ink-tertiary hover:text-ink-primary hover:bg-surface-container"
                            title="View preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setIsCreateOpen(true);
                            }}
                            className="p-1.5 rounded text-ink-tertiary hover:text-ink-primary hover:bg-surface-container"
                            title="Edit deliverable"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded text-ink-tertiary hover:text-[#DC2626] hover:bg-red-50"
                            title="Delete deliverable"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create / Edit Deliverable Modal */}
      <CreateContentModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        initialItem={editingItem}
        clientName={selectedClient?.name || "Kanso Botanicals"}
        clientSlug={selectedClient?.slug || "kanso-botanicals"}
      />

      {/* Content Preview & Review Modal */}
      <ContentPreviewModal
        isOpen={Boolean(previewItem)}
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onEdit={(item) => {
          setEditingItem(item);
          setIsCreateOpen(true);
        }}
        onDelete={handleDeleteItem}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
