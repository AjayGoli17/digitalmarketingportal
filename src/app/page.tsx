"use client";

import * as React from "react";
import Link from "next/link";
import { useViewMode } from "@/components/context/ViewModeContext";
import { useContentWorkflow } from "@/components/context/ContentWorkflowContext";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Users,
  TrendingUp,
  ArrowRight,
  SlidersHorizontal,
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  Database,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { ContentItem } from "@/lib/data/contentItems";
import { SAMPLE_CLIENTS } from "@/lib/data/clients";
import {
  calculateAgencyDashboardMetrics,
  calculateClientMonthlyReport,
} from "@/lib/metrics";
import { AssetReviewDetailView } from "@/components/client/AssetReviewDetailView";
import { RequestChangesModal } from "@/components/client/RequestChangesModal";

export default function DashboardPage() {
  const { isClientView, selectedClient } = useViewMode();
  const [supabaseReady, setSupabaseReady] = React.useState<boolean>(false);

  React.useEffect(() => {
    setSupabaseReady(isSupabaseConfigured());
  }, []);

  if (isClientView) {
    return <ClientPortalView clientName={selectedClient} supabaseReady={supabaseReady} />;
  }

  return <AgencyDashboardView supabaseReady={supabaseReady} />;
}

// ==========================================
// AGENCY DASHBOARD VIEW (dashboard_refined.png)
// ==========================================
function AgencyDashboardView({ supabaseReady }: { supabaseReady: boolean }) {
  const { items, clientQuotas } = useContentWorkflow();
  const [selectedReviewItem, setSelectedReviewItem] = React.useState<ContentItem | null>(null);

  const pendingApprovals = React.useMemo(() => {
    return items.filter((i) => i.status === "pending" || i.status === "changes");
  }, [items]);

  const cardsToShow = pendingApprovals.length >= 3 ? pendingApprovals.slice(0, 3) : items.slice(0, 3);

  // November 2024 studio metrics
  const dashboardMetrics = React.useMemo(() => {
    return calculateAgencyDashboardMetrics(items, SAMPLE_CLIENTS, clientQuotas, 11, 2024);
  }, [items, clientQuotas]);

  if (selectedReviewItem) {
    return (
      <AssetReviewDetailView
        item={selectedReviewItem}
        onBack={() => setSelectedReviewItem(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Supabase Connection Status Banner */}
      <div className="rounded-lg border border-hairline-subtle bg-white p-3.5 shadow-whisper flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-md flex items-center justify-center ${
              supabaseReady
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-surface-container-high text-ink-secondary border border-hairline-subtle"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-body-sm font-medium text-ink-primary">
                Supabase Backend Engine
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  supabaseReady
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-surface-container text-ink-tertiary"
                }`}
              >
                {supabaseReady ? "Configured & Live" : "UI System Mode (Sample Data Persistent)"}
              </span>
            </div>
            <p className="text-[12px] text-ink-secondary">
              {supabaseReady
                ? "Connected to live PostgreSQL database. Schema migrations are ready."
                : "App running in UI system foundation mode. Workflow actions synchronize in browser memory & localStorage."}
            </p>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span className="text-label-caps text-ink-tertiary uppercase tracking-wider font-semibold">
              Studio Overview · Autumn Q4
            </span>
          </div>
          <h1 className="text-headline-lg lg:text-display-lg font-semibold text-ink-primary tracking-tight">
            Good morning, Sarah
          </h1>
          <p className="text-body-sm text-ink-secondary mt-1">
            Thursday, Nov 14 · {pendingApprovals.length} deliverables in approval pipeline
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/approvals">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            >
              Approval Queue
            </Button>
          </Link>
          <Link href="/content">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Zap className="w-3.5 h-3.5" />}
            >
              Calendar
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1 */}
        <Card className="p-6">
          <div className="flex items-center justify-between text-ink-tertiary mb-3">
            <span className="text-label-caps uppercase font-semibold tracking-wider">
              Total Clients
            </span>
            <Users className="w-4 h-4 text-ink-tertiary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-ink-primary">
              {dashboardMetrics.activeClients}
            </span>
            <span className="text-body-sm text-ink-secondary font-medium">
              Active Retainers
            </span>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="p-6">
          <div className="flex items-center justify-between text-ink-tertiary mb-3">
            <span className="text-label-caps uppercase font-semibold tracking-wider">
              Pending Approvals
            </span>
            <span className="w-2 h-2 rounded-full bg-aura-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-ink-primary">
              {dashboardMetrics.pendingApprovals}
            </span>
            <span className="text-body-sm text-ink-secondary font-medium">
              Deliverables
            </span>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="p-6">
          <div className="flex items-center justify-between text-ink-tertiary mb-3">
            <span className="text-label-caps uppercase font-semibold tracking-wider">
              Deliverables Completed
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-ink-primary">
              {dashboardMetrics.overallPercentage}%
            </span>
            <span className="text-body-sm text-ink-secondary font-medium">
              {dashboardMetrics.totalCompleted}/{dashboardMetrics.totalPromised} Published
            </span>
          </div>
        </Card>
      </div>

      {/* Needs Approval Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-headline-sm font-semibold text-ink-primary">
              Needs Approval
            </h2>
            <Badge variant="neutral" size="sm">
              {pendingApprovals.length} Immediate
            </Badge>
          </div>
          <Link
            href="/approvals"
            className="text-body-sm text-ink-secondary hover:text-ink-primary font-medium flex items-center gap-1 transition-colors"
          >
            View all in Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Editorial Asset Cards matching dashboard_refined.png */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cardsToShow.map((item) => {
            const isVideo = item.format === "reel";
            const badgeVariant: BadgeVariant =
              item.status === "approved"
                ? "approved"
                : item.status === "changes"
                ? "changes"
                : item.status === "published"
                ? "published"
                : item.status === "draft"
                ? "draft"
                : "pending";

            return (
              <Card key={item.id} className="overflow-hidden group flex flex-col justify-between">
                <div
                  onClick={() => setSelectedReviewItem(item)}
                  className={`relative aspect-[4/5] bg-gradient-to-br ${item.bgGradient} overflow-hidden cursor-pointer`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 z-10" />
                  <div className="absolute top-3 left-3 z-20 flex gap-2">
                    <Badge variant="frosted-dark" size="sm">
                      {item.formatLabel.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 z-20">
                    <Badge variant={badgeVariant} size="sm" withDot>
                      {item.statusLabel || item.status.toUpperCase()}
                    </Badge>
                  </div>

                  {isVideo ? (
                    <div className="w-full h-full flex items-center justify-center relative z-20">
                      <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-ink-primary shadow-lg transition-transform group-hover:scale-110">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-ink-secondary p-6 text-center z-20">
                      <span className="text-title-md font-serif italic text-ink-primary">
                        {item.clientName}
                      </span>
                      <span className="text-[11px] text-ink-secondary tracking-widest uppercase mt-1">
                        {item.title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex items-center justify-between bg-white border-t border-hairline">
                  <div className="min-w-0 pr-2">
                    <span className="text-label-caps uppercase text-ink-tertiary block font-semibold truncate">
                      {item.clientName}
                    </span>
                    <h4 className="text-title-md font-medium text-ink-primary truncate mt-0.5">
                      {item.title}
                    </h4>
                  </div>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => setSelectedReviewItem(item)}
                  >
                    Review
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Client Retainer Pace Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-headline-sm font-semibold text-ink-primary">
              Client Retainer Pace
            </h2>
            <span className="text-body-sm text-ink-secondary">
              Monthly quota deliverables
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-label-caps uppercase text-ink-tertiary font-semibold tracking-wider">
              November Cycle
            </span>
            <Link
              href="/deliverables"
              className="text-xs text-aura-primary hover:underline font-medium"
            >
              Deliverables & Quotas →
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {dashboardMetrics.clientPaces.map((pace) => {
            const client = SAMPLE_CLIENTS.find((c) => c.slug === pace.clientSlug);
            const isFinished = pace.percentage >= 100;

            return (
              <Link key={pace.clientSlug} href={`/clients/${pace.clientSlug}`} className="block group">
                <Card className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150 group-hover:border-zinc-300 group-hover:shadow-whisper">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high text-ink-primary font-semibold flex items-center justify-center text-xs border border-hairline-subtle">
                      {client?.initials || pace.clientSlug.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-title-md font-medium text-ink-primary group-hover:text-aura-primary transition-colors">
                        {pace.clientName}
                      </h4>
                      <span className="text-body-sm text-ink-secondary">
                        {client?.category || client?.industry || "Brand"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 max-w-md mx-0 sm:mx-6">
                    <div className="flex justify-between text-body-sm mb-1.5">
                      <span className="font-medium text-ink-primary">
                        {pace.completed}/{pace.promised} deliverables
                      </span>
                      <span className={isFinished ? "text-emerald-600 font-medium" : "text-ink-secondary"}>
                        {pace.percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFinished ? "bg-emerald-600" : "bg-aura-primary"
                        }`}
                        style={{ width: `${Math.min(100, pace.percentage)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {pace.isOverQuota ? (
                      <Badge variant="approved" size="sm">
                        +{pace.overQuota} extra
                      </Badge>
                    ) : isFinished ? (
                      <Badge variant="approved" size="sm">
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="scheduled" size="sm">
                        {pace.remaining} remaining
                      </Badge>
                    )}
                    <ExternalLink className="w-4 h-4 text-ink-tertiary group-hover:text-ink-primary transition-colors" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ==========================================
// CLIENT PORTAL VIEW (client_overview.png)
// ==========================================
function ClientPortalView({
  clientName = "Kanso Botanicals",
  supabaseReady,
}: {
  clientName: string;
  supabaseReady: boolean;
}) {
  const { items, clientQuotas, approveContent, requestChanges } = useContentWorkflow();
  const [selectedAsset, setSelectedAsset] = React.useState<ContentItem | null>(null);
  const [changesAsset, setChangesAsset] = React.useState<ContentItem | null>(null);

  const cleanName = (clientName || "Kanso Botanicals").trim().toLowerCase();

  // Match client slug
  const matchedClient = React.useMemo(() => {
    return (
      SAMPLE_CLIENTS.find(
        (c) =>
          c.name.toLowerCase() === cleanName ||
          c.slug.toLowerCase() === cleanName
      ) || SAMPLE_CLIENTS[0]
    );
  }, [cleanName]);

  // Client monthly report for November 2024
  const clientReport = React.useMemo(() => {
    const quotas = clientQuotas?.[matchedClient.slug] || matchedClient.quotas;
    return calculateClientMonthlyReport(
      matchedClient.slug,
      matchedClient.name,
      items || [],
      quotas,
      11,
      2024
    );
  }, [items, clientQuotas, matchedClient]);

  // Filter items for this client
  const clientItems = React.useMemo(() => {
    return (items || []).filter((i) => {
      if (!i) return false;
      const iSlug = (i.clientSlug || "").toLowerCase();
      const iName = (i.clientName || "").toLowerCase();
      return (
        iSlug === matchedClient.slug ||
        (cleanName && iName.includes(cleanName)) ||
        (cleanName && iSlug.includes(cleanName)) ||
        (iName && cleanName.includes(iName))
      );
    });
  }, [items, matchedClient.slug, cleanName]);

  // Find priority items needing attention (pending or changes)
  const pendingItems = clientItems.filter((i) => i.status === "pending" || i.status === "changes");
  const asset1 = pendingItems[0] || clientItems[0] || (items || [])[0];
  const asset2 = pendingItems[1] || clientItems[1] || (items || [])[1];

  const signOffCount = clientItems.filter((i) => i.status === "pending").length;

  if (selectedAsset) {
    return (
      <AssetReviewDetailView
        item={selectedAsset}
        onBack={() => setSelectedAsset(null)}
        onApprove={(id) => {
          approveContent(id);
        }}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Top Client Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-aura-primary" />
            <span className="text-label-caps text-ink-tertiary uppercase tracking-wider font-semibold">
              Client Portal / Dashboard · November 2024 Campaign
            </span>
          </div>
          <h1 className="text-headline-lg lg:text-display-lg font-semibold text-ink-primary tracking-tight font-serif italic">
            {clientName}
          </h1>
          <p className="text-body-sm text-ink-secondary mt-1">
            Review upcoming scheduled assets and sign off on pending creative deliverables before launch.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant={signOffCount > 0 ? "pending" : "approved"} withDot>
            {signOffCount > 0
              ? `${signOffCount} Item${signOffCount > 1 ? "s" : ""} Need Your Sign-Off`
              : "All Deliverables Approved"}
          </Badge>
          <Link href="/content">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Calendar className="w-3.5 h-3.5" />}
            >
              View Full Month
            </Button>
          </Link>
        </div>
      </div>

      {/* Retainer Momentum Bar */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h4 className="text-title-md font-medium text-ink-primary">
              Monthly Retainer Momentum
            </h4>
            <span className="text-body-sm text-ink-secondary">
              {clientReport.totalCompleted} of {clientReport.totalPromised} deliverables published ({clientReport.totalPercentage}% completed)
            </span>
          </div>
          <div className="flex items-center gap-4 text-body-sm">
            <span className="flex items-center gap-1.5 text-ink-secondary">
              <span className="w-2 h-2 rounded-full bg-emerald-600" /> {clientReport.totalCompleted} Published
            </span>
            <span className="flex items-center gap-1.5 text-ink-secondary">
              <span className="w-2 h-2 rounded-full bg-aura-primary" /> {clientReport.pipelineCount} In Pipeline
            </span>
            <span className="flex items-center gap-1.5 text-ink-secondary">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" /> {signOffCount} Sign-off Required
            </span>
          </div>
        </div>

        <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-600 transition-all duration-300"
            style={{ width: `${Math.min(100, clientReport.totalPercentage)}%` }}
          />
        </div>
      </Card>

      {/* Needs Your Attention Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
            <h2 className="text-headline-sm font-semibold text-ink-primary">
              Needs Your Attention
            </h2>
            <Badge variant="changes" size="sm">
              Priority
            </Badge>
          </div>
          <span className="text-body-sm text-ink-secondary">
            Sign off below to confirm scheduled publication dates
          </span>
        </div>

        {/* 2 Big Preview Cards matching client_overview.png */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Card 1 */}
          {asset1 && (
            <Card className="overflow-hidden group">
              <div
                onClick={() => setSelectedAsset(asset1)}
                className={`relative aspect-[4/5] bg-gradient-to-br ${asset1.bgGradient} overflow-hidden cursor-pointer select-none`}
              >
                <div className="absolute top-3 left-3 z-20">
                  <Badge
                    variant={asset1.status === "approved" ? "approved" : "changes"}
                    size="sm"
                    withDot
                  >
                    {asset1.status === "approved" ? "APPROVED" : "PENDING SIGN-OFF"}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 z-20">
                  <Badge variant="frosted-dark" size="sm">
                    {asset1.formatLabel} • {asset1.slideCount || 1} Frame{asset1.slideCount && asset1.slideCount > 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                  <span className="text-2xl font-serif italic text-ink-primary">
                    {clientName}
                  </span>
                  <span className="text-xs text-ink-secondary tracking-widest uppercase mt-2">
                    {asset1.title}
                  </span>
                </div>
              </div>
              <div className="p-6 bg-white space-y-4">
                <div>
                  <h3
                    onClick={() => setSelectedAsset(asset1)}
                    className="text-headline-sm font-semibold text-ink-primary cursor-pointer hover:text-aura-primary transition-colors"
                  >
                    {asset1.title}
                  </h3>
                  <p className="text-body-sm text-ink-secondary mt-1.5 leading-relaxed line-clamp-2">
                    &ldquo;{asset1.caption}&rdquo;
                  </p>
                </div>

                <div className="pt-2 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-body-sm text-ink-secondary">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Nov {asset1.day} • {asset1.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setChangesAsset(asset1)}
                    >
                      Request Edit
                    </Button>
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => {
                        if (asset1.status !== "approved") {
                          approveContent(asset1.id);
                        } else {
                          setSelectedAsset(asset1);
                        }
                      }}
                      className={asset1.status === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    >
                      {asset1.status === "approved" ? "Approved ✓" : "Review & Sign Off"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Client Card 2 */}
          {asset2 && (
            <Card className="overflow-hidden group">
              <div
                onClick={() => setSelectedAsset(asset2)}
                className={`relative aspect-[4/5] bg-gradient-to-br ${asset2.bgGradient} overflow-hidden cursor-pointer select-none`}
              >
                <div className="absolute top-3 left-3 z-20">
                  <Badge
                    variant={asset2.status === "approved" ? "approved" : "changes"}
                    size="sm"
                    withDot
                  >
                    {asset2.status === "approved" ? "APPROVED" : "PENDING SIGN-OFF"}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 z-20">
                  <Badge variant="frosted-dark" size="sm">
                    {asset2.formatLabel} • {asset2.duration || "0:30"}
                  </Badge>
                </div>
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-ink-primary shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white space-y-4">
                <div>
                  <span className="text-label-caps uppercase text-ink-tertiary font-semibold block">
                    {asset2.channels.join(", ").toUpperCase()}
                  </span>
                  <h3
                    onClick={() => setSelectedAsset(asset2)}
                    className="text-headline-sm font-semibold text-ink-primary mt-1 cursor-pointer hover:text-aura-primary transition-colors"
                  >
                    {asset2.title}
                  </h3>
                  <p className="text-body-sm text-ink-secondary mt-1.5 leading-relaxed line-clamp-2">
                    {asset2.caption}
                  </p>
                </div>

                <div className="pt-2 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-body-sm text-ink-secondary">
                    Scheduled: Fri, Nov {asset2.day} · {asset2.time}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setChangesAsset(asset2)}
                    >
                      Request Edit
                    </Button>
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => {
                        if (asset2.status !== "approved") {
                          approveContent(asset2.id);
                        } else {
                          setSelectedAsset(asset2);
                        }
                      }}
                      className={asset2.status === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    >
                      {asset2.status === "approved" ? "Approved ✓" : "Sign Off ✓"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Changes Modal */}
      {changesAsset && (
        <RequestChangesModal
          isOpen={Boolean(changesAsset)}
          onClose={() => setChangesAsset(null)}
          assetTitle={changesAsset.title}
          slideNumber={1}
          onSendFeedback={(fb) => {
            requestChanges(changesAsset.id, fb);
          }}
        />
      )}
    </div>
  );
}
