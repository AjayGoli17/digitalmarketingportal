"use client";

import * as React from "react";
import Link from "next/link";
import {
  Link2,
  Plus,
  RotateCw,
  Play,
  Calendar,
  LayoutGrid,
  List,
  FileText,
  Download,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Client, ClientDeliverable } from "@/lib/data/clients";
import { useContentWorkflow } from "@/components/context/ContentWorkflowContext";
import {
  calculateClientMonthlyReport,
  formatMonthYear,
  FORMAT_CONFIG,
} from "@/lib/metrics";
import { CheckCircle2, Clock, ChevronLeft, ChevronRight, Sliders, ExternalLink } from "lucide-react";

export interface ClientWorkspaceViewProps {
  client: Client;
  onClientChange?: (slug: string) => void;
  allClients?: Client[];
}

export function ClientWorkspaceView({
  client,
  onClientChange,
  allClients,
}: ClientWorkspaceViewProps) {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "content" | "approvals" | "deliverables" | "brand_guidelines"
  >("overview");
  const [pipelineView, setPipelineView] = React.useState<"grid" | "list">("grid");
  const [shareCopied, setShareCopied] = React.useState(false);
  const [isProposeOpen, setIsProposeOpen] = React.useState(false);
  const [proposeTitle, setProposeTitle] = React.useState("");
  const [proposeSuccess, setProposeSuccess] = React.useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = React.useState<ClientDeliverable | null>(null);

  // Deliverables Reporting & Pacing
  const { items, clientQuotas } = useContentWorkflow();
  const [reportingMonth, setReportingMonth] = React.useState<number>(11);
  const [reportingYear, setReportingYear] = React.useState<number>(2024);

  const clientReport = React.useMemo(() => {
    const quotas = (client?.slug && clientQuotas?.[client.slug]) || client?.quotas || { posts: 4, reels: 2, stories: 2, carousels: 2, total: 10 };
    return calculateClientMonthlyReport(
      client?.slug || "kanso-botanicals",
      client?.name || "Client",
      items || [],
      quotas,
      reportingMonth,
      reportingYear
    );
  }, [client?.slug, client?.name, client?.quotas, items, clientQuotas, reportingMonth, reportingYear]);

  // Client items in the current reporting month
  const monthItems = React.useMemo(() => {
    return items.filter(
      (i) =>
        i.clientSlug === client.slug &&
        (i.month ? i.month === reportingMonth : true) &&
        (i.year ? i.year === reportingYear : true)
    );
  }, [items, client.slug, reportingMonth, reportingYear]);

  const publishedItems = monthItems.filter((i) => i.status === "published");
  const pipelineItems = monthItems.filter((i) => i.status !== "published");

  const handleShareClick = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Header Section matching client_workspace.png */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          {/* Subtitle tag row */}
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/clients"
              className="text-ink-tertiary hover:text-ink-primary text-xs flex items-center gap-1 transition-colors mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Clients
            </Link>
            <span className="text-label-caps text-ink-tertiary uppercase font-semibold">
              {client.code}
            </span>
            <span className="text-ink-tertiary">·</span>
            <Badge variant="approved" size="sm" withDot>
              {client.statusLabel}
            </Badge>

            {/* Client selector if multiple available */}
            {allClients && onClientChange && (
              <select
                value={client.slug}
                onChange={(e) => onClientChange(e.target.value)}
                className="ml-2 text-xs font-medium text-ink-secondary bg-surface-container-low border border-hairline-subtle rounded px-2 py-0.5 outline-none hover:text-ink-primary cursor-pointer"
              >
                {allClients.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    Switch to {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Client Title */}
          <h1 className="text-headline-lg lg:text-display-lg font-semibold text-ink-primary tracking-tight">
            {client.name}
          </h1>

          {/* Client Metadata Line */}
          <div className="flex flex-wrap items-center gap-2 text-body-sm text-ink-secondary mt-1.5">
            <span>{client.industry}</span>
            <span className="text-ink-tertiary">/</span>
            <span className="capitalize">{client.platforms.join(", ")}</span>
            <span className="text-ink-tertiary">/</span>
            <span>{client.retainerTier}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={
              shareCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Link2 className="w-3.5 h-3.5" />
              )
            }
            onClick={handleShareClick}
          >
            {shareCopied ? "Link Copied!" : "Share Client Link"}
          </Button>
          <Button
            variant="accent"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsProposeOpen(true)}
          >
            Propose Deliverable
          </Button>
        </div>
      </div>

      {/* Navigation Tabs Bar matching client_workspace.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline-subtle gap-3">
        <div className="flex items-center space-x-6 overflow-x-auto text-body-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`pb-3 flex items-center gap-1.5 transition-colors relative whitespace-nowrap ${
              activeTab === "overview"
                ? "text-ink-primary font-semibold"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>Overview</span>
            <span className="w-1.5 h-1.5 rounded-full bg-aura-primary" />
            {activeTab === "overview" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-aura-primary rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`pb-3 flex items-center gap-1.5 transition-colors relative whitespace-nowrap ${
              activeTab === "content"
                ? "text-ink-primary font-semibold"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>Content</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-surface-container-high text-ink-secondary font-medium">
              12
            </span>
            {activeTab === "content" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-aura-primary rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("approvals")}
            className={`pb-3 flex items-center gap-1.5 transition-colors relative whitespace-nowrap ${
              activeTab === "approvals"
                ? "text-ink-primary font-semibold"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>Approvals</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-aura-primary/10 text-aura-primary font-semibold">
              2
            </span>
            {activeTab === "approvals" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-aura-primary rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("deliverables")}
            className={`pb-3 flex items-center gap-1.5 transition-colors relative whitespace-nowrap ${
              activeTab === "deliverables"
                ? "text-ink-primary font-semibold"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>Deliverables</span>
            {activeTab === "deliverables" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-aura-primary rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("brand_guidelines")}
            className={`pb-3 flex items-center gap-1.5 transition-colors relative whitespace-nowrap ${
              activeTab === "brand_guidelines"
                ? "text-ink-primary font-semibold"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <span>Brand Guidelines</span>
            {activeTab === "brand_guidelines" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-aura-primary rounded-full" />
            )}
          </button>
        </div>

        {/* Sync status */}
        <div className="pb-3 text-xs text-ink-tertiary flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <RotateCw className="w-3 h-3 text-ink-tertiary" />
          <span>Last synced 14m ago</span>
        </div>
      </div>

      {/* Main Tab Content: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Cycle Progress Card matching client_workspace.png */}
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Progress Bar & Counts */}
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-center gap-2">
                    <span className="text-label-caps uppercase text-ink-tertiary font-semibold tracking-wider">
                      Cycle Progress
                    </span>
                    <span className="text-ink-tertiary">/</span>
                    <span className="text-body-sm font-medium text-ink-primary">
                      {formatMonthYear(reportingMonth, reportingYear)} Retainer
                    </span>
                  </div>
                  <span className="text-title-md font-semibold text-aura-primary">
                    {clientReport.totalPercentage}%
                  </span>
                </div>

                {/* Main Progress Bar */}
                <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      clientReport.totalPercentage >= 100 ? "bg-emerald-600" : "bg-aura-primary"
                    }`}
                    style={{ width: `${Math.min(100, clientReport.totalPercentage)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-body-sm text-ink-secondary">
                  <span>
                    {clientReport.totalCompleted} of {clientReport.totalPromised} deliverables published
                  </span>
                  <span className="text-ink-tertiary text-xs">
                    {clientReport.totalRemaining} remaining to launch · {clientReport.pipelineCount} in production
                  </span>
                </div>
              </div>

              {/* Metric Stats Pills */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="p-3.5 rounded-lg bg-surface-container-low border border-hairline-subtle min-w-[90px] text-center">
                  <div className="flex items-center justify-center gap-1.5 text-label-caps uppercase text-ink-tertiary font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Published</span>
                  </div>
                  <span className="text-xl font-semibold text-ink-primary block mt-1">
                    {clientReport.totalCompleted}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-container-low border border-hairline-subtle min-w-[90px] text-center">
                  <div className="flex items-center justify-center gap-1.5 text-label-caps uppercase text-ink-tertiary font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-aura-primary" />
                    <span>Remaining</span>
                  </div>
                  <span className="text-xl font-semibold text-ink-primary block mt-1">
                    {clientReport.totalRemaining}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-container-low border border-hairline-subtle min-w-[90px] text-center">
                  <div className="flex items-center justify-center gap-1.5 text-label-caps uppercase text-ink-tertiary font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    <span>Quota</span>
                  </div>
                  <span className="text-xl font-semibold text-ink-primary block mt-1">
                    {clientReport.totalPromised}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Pending Approval Section */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <h2 className="text-headline-sm font-semibold text-ink-primary">
                  Pending Approval
                </h2>
                <Badge variant="scheduled" size="sm">
                  Action Required
                </Badge>
              </div>
              <span className="text-body-sm text-ink-secondary text-xs sm:text-sm">
                Direct client sign-off requested for scheduled distribution slots
              </span>
            </div>

            {/* 2 Big Pending Deliverable Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {client.pendingDeliverables.map((item) => (
                <Card key={item.id} className="overflow-hidden flex flex-col justify-between group">
                  {/* Media Viewport */}
                  <div
                    className={`relative aspect-[4/3] sm:aspect-[16/10] bg-gradient-to-br ${item.bannerBg} overflow-hidden flex items-center justify-center`}
                  >
                    {/* Top status badges */}
                    <div className="absolute top-3 left-3 z-20">
                      <Badge variant="pending" size="sm" withDot>
                        {item.statusLabel}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 z-20">
                      <Badge variant="frosted-dark" size="sm">
                        {item.format}
                      </Badge>
                    </div>

                    {/* Video play icon or Still display */}
                    {item.bannerType === "video" ? (
                      <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-ink-primary shadow-lg transition-transform group-hover:scale-105 cursor-pointer">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-6 select-none">
                        <span className="text-xl font-serif italic text-ink-primary">
                          {client.bannerImageText || client.name}
                        </span>
                        <span className="text-xs text-ink-secondary tracking-widest mt-1 uppercase font-medium">
                          {client.bannerSubtitle || item.title}
                        </span>
                      </div>
                    )}

                    {/* Bottom media tags */}
                    <div className="absolute bottom-3 left-3 z-20 flex gap-2">
                      {item.mediaTags.map((tag) => (
                        <Badge key={tag} variant="frosted-dark" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 bg-white space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta row */}
                      <div className="flex items-center justify-between text-xs text-ink-secondary font-medium mb-1.5">
                        <span className="text-label-caps uppercase text-ink-tertiary font-semibold">
                          {item.channelLabel}
                        </span>
                        <span className="flex items-center gap-1 text-ink-secondary">
                          <Calendar className="w-3.5 h-3.5" /> {item.scheduledDate}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-headline-sm font-semibold text-ink-primary mt-1">
                        {item.headline}
                      </h3>

                      {/* Caption */}
                      <p className="text-body-sm text-ink-secondary mt-2 leading-relaxed">
                        {item.caption}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-hairline flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-surface-container-high text-ink-primary font-semibold flex items-center justify-center text-[10px] border border-hairline-subtle">
                          {item.avatarText}
                        </div>
                        <span className="text-body-sm font-medium text-ink-secondary">
                          {item.footerAuthor}
                        </span>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedReviewItem(item)}
                      >
                        Review Item
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Active Pipeline Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-headline-sm font-semibold text-ink-primary">
                  Active Pipeline
                </h2>
                <span className="text-body-sm text-ink-secondary text-xs sm:text-sm">
                  Verified assets ready for publishing pipeline
                </span>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 border border-hairline-subtle rounded-lg p-0.5 bg-white">
                <button
                  type="button"
                  onClick={() => setPipelineView("grid")}
                  className={`p-1.5 rounded ${
                    pipelineView === "grid"
                      ? "bg-surface-container text-ink-primary"
                      : "text-ink-tertiary hover:text-ink-primary"
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPipelineView("list")}
                  className={`p-1.5 rounded ${
                    pipelineView === "list"
                      ? "bg-surface-container text-ink-primary"
                      : "text-ink-tertiary hover:text-ink-primary"
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3 Column Grid matching client_workspace.png */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pipeline Item 1 */}
              {client.activePipeline[0] && (
                <Card className="overflow-hidden flex flex-col justify-between">
                  <div
                    className={`relative aspect-[4/3] bg-gradient-to-br ${client.activePipeline[0].bannerBg} overflow-hidden flex items-center justify-center`}
                  >
                    <div className="absolute top-3 left-3 z-20">
                      <Badge variant="approved" size="sm" withDot>
                        {client.activePipeline[0].statusLabel}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 z-20">
                      <Badge variant="frosted-dark" size="sm">
                        {client.activePipeline[0].mediaTags[0]}
                      </Badge>
                    </div>
                    <div className="p-6 text-center select-none">
                      <span className="text-title-md font-serif italic text-ink-primary">
                        {client.activePipeline[0].headline}
                      </span>
                    </div>
                    {/* Carousel indicator dots */}
                    <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1 z-20">
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    </div>
                  </div>

                  <div className="p-5 bg-white space-y-2">
                    <div className="flex justify-between items-center text-xs text-ink-secondary">
                      <span className="font-medium text-ink-primary">
                        {client.activePipeline[0].scheduledDate}
                      </span>
                      <span>{client.activePipeline[0].channelLabel}</span>
                    </div>
                    <h4 className="text-title-md font-semibold text-ink-primary">
                      {client.activePipeline[0].headline}
                    </h4>
                    <p className="text-body-sm text-ink-secondary line-clamp-2">
                      {client.activePipeline[0].caption}
                    </p>
                  </div>
                </Card>
              )}

              {/* Pipeline Item 2 */}
              {client.activePipeline[1] && (
                <Card className="overflow-hidden flex flex-col justify-between">
                  <div
                    className={`relative aspect-[4/3] bg-gradient-to-br ${client.activePipeline[1].bannerBg} overflow-hidden flex items-center justify-center`}
                  >
                    <div className="absolute top-3 left-3 z-20">
                      <Badge variant="scheduled" size="sm" withDot>
                        {client.activePipeline[1].statusLabel}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 z-20">
                      <Badge variant="frosted-dark" size="sm">
                        {client.activePipeline[1].format}
                      </Badge>
                    </div>
                    <div className="p-6 text-center select-none">
                      <span className="text-title-md font-serif italic text-ink-primary">
                        {client.activePipeline[1].headline}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 z-20">
                      <Badge variant="frosted-dark" size="sm">
                        {client.activePipeline[1].mediaTags[0]}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 bg-white space-y-2">
                    <div className="flex justify-between items-center text-xs text-ink-secondary">
                      <span className="font-medium text-ink-primary">
                        {client.activePipeline[1].scheduledDate}
                      </span>
                      <span>{client.activePipeline[1].channelLabel}</span>
                    </div>
                    <h4 className="text-title-md font-semibold text-ink-primary">
                      {client.activePipeline[1].headline}
                    </h4>
                    <p className="text-body-sm text-ink-secondary line-clamp-2">
                      {client.activePipeline[1].caption}
                    </p>
                  </div>
                </Card>
              )}

              {/* Production Memo Card matching client_workspace.png */}
              <Card className="p-6 bg-surface-container-low/50 border border-hairline-subtle flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-ink-tertiary">
                    <span className="text-label-caps uppercase font-semibold tracking-wider">
                      Production Memo
                    </span>
                    <FileText className="w-4 h-4 text-ink-secondary" />
                  </div>

                  <div>
                    <h4 className="text-title-md font-semibold text-ink-primary">
                      {client.productionMemo.title}
                    </h4>
                    <p className="text-body-sm text-ink-secondary mt-2 leading-relaxed">
                      {client.productionMemo.guidelines}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-hairline text-body-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-tertiary text-xs">Color Profile</span>
                      <span className="font-medium text-ink-primary text-xs">
                        {client.productionMemo.colorProfile}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-tertiary text-xs">Aspect Ratios</span>
                      <span className="font-medium text-ink-primary text-xs">
                        {client.productionMemo.aspectRatios}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-tertiary text-xs">Approver Contact</span>
                      <span className="font-medium text-ink-primary text-xs">
                        {client.productionMemo.approverContact}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full mt-5 bg-white justify-center"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => alert("Brand kit package queued for download.")}
                >
                  Download Brand Kit
                </Button>
              </Card>
            </div>
          </section>
        </div>
      )}

      {/* Alternate Tab: Content Calendar */}
      {activeTab === "content" && (
        <Card className="p-8 text-center space-y-4 bg-white">
          <Calendar className="w-8 h-8 mx-auto text-aura-primary" />
          <div>
            <h3 className="text-title-md font-semibold text-ink-primary">
              Scheduled Assets ({client.deliveredCount} Active)
            </h3>
            <p className="text-body-sm text-ink-secondary max-w-md mx-auto mt-1">
              Full calendar matrix, monthly production pacing, and scheduled distribution for {client.name}.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setActiveTab("overview")}>
              Return to Overview
            </Button>
            <Link href="/content">
              <Button variant="accent" size="sm">
                Open Content Calendar →
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Alternate Tab: Approvals */}
      {activeTab === "approvals" && (
        <Card className="p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-aura-primary/10 text-aura-primary mx-auto flex items-center justify-center font-semibold">
            {client.pendingCount}
          </div>
          <h3 className="text-title-md font-semibold text-ink-primary">
            Pending Client Approvals
          </h3>
          <p className="text-body-sm text-ink-secondary max-w-md mx-auto">
            Review {client.pendingCount} deliverables currently awaiting feedback or final sign-off.
          </p>
          <Button variant="secondary" size="sm" onClick={() => setActiveTab("overview")}>
            Return to Overview
          </Button>
        </Card>
      )}

      {/* Alternate Tab: Deliverables */}
      {activeTab === "deliverables" && (
        <div className="space-y-6">
          {/* Header & Month Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-headline-sm font-semibold text-ink-primary">
                Monthly Package Quotas & Retainer Pacing
              </h2>
              <p className="text-body-sm text-ink-secondary mt-0.5">
                Contractual production deliverables breakdown for {client.name}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-hairline-subtle rounded-lg p-1 shadow-whisper">
                <button
                  onClick={() => {
                    if (reportingMonth === 1) {
                      setReportingMonth(12);
                      setReportingYear((y) => y - 1);
                    } else {
                      setReportingMonth((m) => m - 1);
                    }
                  }}
                  aria-label="Previous month"
                  className="p-1 rounded hover:bg-surface-container text-ink-secondary hover:text-ink-primary transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="px-2.5 py-0.5 flex items-center gap-1.5 text-body-sm font-medium text-ink-primary min-w-[120px] justify-center">
                  <Calendar className="w-3 h-3 text-aura-primary" />
                  <span>{formatMonthYear(reportingMonth, reportingYear)}</span>
                </div>
                <button
                  onClick={() => {
                    if (reportingMonth === 12) {
                      setReportingMonth(1);
                      setReportingYear((y) => y + 1);
                    } else {
                      setReportingMonth((m) => m + 1);
                    }
                  }}
                  aria-label="Next month"
                  className="p-1 rounded hover:bg-surface-container text-ink-secondary hover:text-ink-primary transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <Link href="/deliverables">
                <Button variant="secondary" size="sm" leftIcon={<Sliders className="w-3.5 h-3.5" />}>
                  Studio Quotas
                </Button>
              </Link>
            </div>
          </div>

          {/* Strict counting rule notification */}
          <div className="rounded-lg bg-surface-container-low border border-hairline-subtle p-3 flex items-start gap-2.5 text-body-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-ink-secondary text-xs sm:text-sm">
              <strong className="text-ink-primary font-semibold">Strict Completion Accounting:</strong> Only assets with status <code className="bg-white px-1 py-0.5 rounded border border-hairline text-emerald-700 font-semibold font-mono text-xs">published</code> count toward package quotas. Draft, pending, and change revisions remain in production pipeline.
            </div>
          </div>

          {/* Retainer Summary Card */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline-subtle">
              <div>
                <span className="text-label-caps uppercase text-ink-tertiary font-semibold tracking-wider">
                  Contractual Retainer Progress
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-semibold text-ink-primary">
                    {clientReport.totalCompleted} / {clientReport.totalPromised}
                  </span>
                  <span className="text-body-sm text-ink-secondary">Deliverables Published</span>
                  {clientReport.isOverQuota && (
                    <Badge variant="approved" size="sm">
                      Over Quota (+{clientReport.overQuota})
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold text-ink-primary">
                  {clientReport.totalPercentage}%
                </span>
                <span className="text-xs text-ink-tertiary block">
                  {clientReport.totalRemaining} remaining to launch
                </span>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    clientReport.totalPercentage >= 100 ? "bg-emerald-600" : "bg-aura-primary"
                  }`}
                  style={{ width: `${Math.min(100, clientReport.totalPercentage)}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Format Breakdown 4-Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(
              [
                { key: "posts", metric: clientReport.posts },
                { key: "reels", metric: clientReport.reels },
                { key: "carousels", metric: clientReport.carousels },
                { key: "stories", metric: clientReport.stories },
              ] as const
            ).map(({ key, metric }) => {
              const cfg = FORMAT_CONFIG[key];
              return (
                <Card key={key} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink-primary tracking-wide">
                      {cfg.label}
                    </span>
                    <span className="text-xs text-ink-tertiary font-mono">
                      {metric.completed} / {metric.promised}
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        metric.percentage >= 100 ? "bg-emerald-600" : "bg-ink-primary"
                      }`}
                      style={{ width: `${Math.min(100, metric.percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-ink-secondary">
                    <span>
                      {metric.promised === 0
                        ? "No quota"
                        : metric.isOverQuota
                        ? `+${metric.overQuota} extra`
                        : `${metric.remaining} remaining`}
                    </span>
                    <span className="font-semibold text-ink-primary">
                      {metric.percentage}%
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Itemized Deliverables Breakdown for Month */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Published Deliverables Column */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-hairline pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <h3 className="text-title-md font-semibold text-ink-primary">
                    Published Deliverables ({publishedItems.length})
                  </h3>
                </div>
                <span className="text-xs text-ink-tertiary font-medium">Counts to quota</span>
              </div>

              {publishedItems.length === 0 ? (
                <p className="text-body-sm text-ink-tertiary py-4 text-center">
                  No deliverables published yet in {formatMonthYear(reportingMonth, reportingYear)}.
                </p>
              ) : (
                <div className="space-y-2">
                  {publishedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-surface-container-low border border-hairline-subtle flex items-center justify-between gap-3 text-body-sm"
                    >
                      <div className="min-w-0">
                        <span className="font-medium text-ink-primary truncate block">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-ink-tertiary mt-0.5">
                          <span className="uppercase font-semibold">{item.formatLabel}</span>
                          <span>·</span>
                          <span>Nov {item.day}, {item.time}</span>
                        </div>
                      </div>
                      <Badge variant="published" size="sm">
                        Published
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* In-Production Pipeline Column */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-hairline pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-aura-primary" />
                  <h3 className="text-title-md font-semibold text-ink-primary">
                    In Production Pipeline ({pipelineItems.length})
                  </h3>
                </div>
                <span className="text-xs text-ink-tertiary font-medium">Pending launch</span>
              </div>

              {pipelineItems.length === 0 ? (
                <p className="text-body-sm text-ink-tertiary py-4 text-center">
                  All scheduled deliverables for this month have been published.
                </p>
              ) : (
                <div className="space-y-2">
                  {pipelineItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-surface-container-low border border-hairline-subtle flex items-center justify-between gap-3 text-body-sm"
                    >
                      <div className="min-w-0">
                        <span className="font-medium text-ink-primary truncate block">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-ink-tertiary mt-0.5">
                          <span className="uppercase font-semibold">{item.formatLabel}</span>
                          <span>·</span>
                          <span>Nov {item.day}, {item.time}</span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          item.status === "approved"
                            ? "approved"
                            : item.status === "changes"
                            ? "changes"
                            : item.status === "draft"
                            ? "draft"
                            : "pending"
                        }
                        size="sm"
                      >
                        {item.statusLabel || item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Alternate Tab: Brand Guidelines */}
      {activeTab === "brand_guidelines" && (
        <Card className="p-6 max-w-2xl mx-auto space-y-5 bg-white">
          <div className="border-b border-hairline pb-4">
            <h3 className="text-headline-sm font-semibold text-ink-primary">
              {client.productionMemo.title}
            </h3>
            <p className="text-body-sm text-ink-secondary mt-1">
              Official art direction parameters for {client.name}.
            </p>
          </div>
          <div className="space-y-3 text-body-sm">
            <p className="text-ink-primary leading-relaxed">
              {client.productionMemo.guidelines}
            </p>
            <div className="p-4 rounded-lg bg-surface-container-low border border-hairline-subtle space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-secondary">Color Calibration</span>
                <span className="font-medium text-ink-primary">{client.productionMemo.colorProfile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Aspect Ratios</span>
                <span className="font-medium text-ink-primary">{client.productionMemo.aspectRatios}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Primary Sign-off Approver</span>
                <span className="font-medium text-ink-primary">{client.productionMemo.approverContact}</span>
              </div>
            </div>
          </div>
          <Button
            variant="accent"
            size="sm"
            className="w-full justify-center"
            onClick={() => setActiveTab("overview")}
          >
            Back to Workspace
          </Button>
        </Card>
      )}

      {/* Propose Deliverable Modal */}
      {isProposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-hairline-subtle shadow-popover max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <h3 className="text-headline-sm font-semibold text-ink-primary">
                  Propose Deliverable
                </h3>
                <p className="text-body-sm text-ink-secondary">
                  Queue a new asset for {client.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsProposeOpen(false);
                  setProposeSuccess(false);
                }}
                className="text-ink-tertiary hover:text-ink-primary p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {proposeSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6 stroke-[2]" />
                </div>
                <h4 className="text-title-md font-semibold text-ink-primary">
                  Deliverable Proposed
                </h4>
                <p className="text-body-sm text-ink-secondary">
                  &ldquo;{proposeTitle}&rdquo; has been staged for production.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsProposeOpen(false);
                    setProposeSuccess(false);
                    setProposeTitle("");
                  }}
                  className="mt-2"
                >
                  Done
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (proposeTitle) {
                    setProposeSuccess(true);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-body-sm font-medium text-ink-primary block">
                    Deliverable Title
                  </label>
                  <Input
                    placeholder="e.g. Winter Solstice Teaser"
                    value={proposeTitle}
                    onChange={(e) => setProposeTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-body-sm font-medium text-ink-primary block">
                    Format
                  </label>
                  <select className="h-9 w-full rounded-md border border-hairline-subtle bg-white px-3 text-body-sm text-ink-primary outline-none focus:border-aura-primary focus:ring-3 focus:ring-aura-primary/10">
                    <option>Single Post (4:5 Feed)</option>
                    <option>Reel / Video (9:16 Vertical)</option>
                    <option>Carousel (Multi-slide)</option>
                    <option>Story Arc (24h Ephemeral)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-body-sm font-medium text-ink-primary block">
                    Target Publishing Channel
                  </label>
                  <select className="h-9 w-full rounded-md border border-hairline-subtle bg-white px-3 text-body-sm text-ink-primary outline-none focus:border-aura-primary focus:ring-3 focus:ring-aura-primary/10">
                    <option>Instagram Feed</option>
                    <option>TikTok + Reels</option>
                    <option>Pinterest</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-hairline">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsProposeOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="accent" size="sm">
                    Submit Proposal
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Review Item Modal Preview */}
      {selectedReviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-hairline-subtle shadow-popover max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="pending" size="sm" withDot>
                  {selectedReviewItem.statusLabel}
                </Badge>
                <Badge variant="frosted-dark" size="sm">
                  {selectedReviewItem.format}
                </Badge>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReviewItem(null)}
                className="text-ink-tertiary hover:text-ink-primary p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-headline-sm font-semibold text-ink-primary">
                {selectedReviewItem.headline}
              </h3>
              <p className="text-body-sm text-ink-secondary leading-relaxed p-3 rounded-lg bg-surface-container-low border border-hairline-subtle">
                {selectedReviewItem.caption}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-ink-secondary pt-2">
                <div>
                  <span className="text-ink-tertiary block">Target Slot:</span>
                  <span className="font-medium text-ink-primary">{selectedReviewItem.scheduledDate}</span>
                </div>
                <div>
                  <span className="text-ink-tertiary block">Channel:</span>
                  <span className="font-medium text-ink-primary">{selectedReviewItem.channelLabel}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-hairline flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedReviewItem(null)}
              >
                Close
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={() => {
                  alert("Sign-off recorded for " + selectedReviewItem.headline);
                  setSelectedReviewItem(null);
                }}
              >
                Sign Off Creative
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
