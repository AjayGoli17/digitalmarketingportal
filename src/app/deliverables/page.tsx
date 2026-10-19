"use client";

import * as React from "react";
import Link from "next/link";
import { useContentWorkflow } from "@/components/context/ContentWorkflowContext";
import { SAMPLE_CLIENTS, ClientQuotas } from "@/lib/data/clients";
import {
  calculateClientMonthlyReport,
  calculateAgencyDashboardMetrics,
  formatMonthYear,
  FORMAT_CONFIG,
  FormatDeliverableMetric,
} from "@/lib/metrics";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Package,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertCircle,
  X,
} from "lucide-react";

export default function DeliverablesPage() {
  const { items, clientQuotas, updateClientQuotas } = useContentWorkflow();

  // Month navigation: default to November 2024 (where current sample deliverables are concentrated)
  const [selectedMonth, setSelectedMonth] = React.useState<number>(11);
  const [selectedYear, setSelectedYear] = React.useState<number>(2024);

  // Client filter
  const [filterSlug, setFilterSlug] = React.useState<string>("all");

  // Edit Quota modal state
  const [editingClient, setEditingClient] = React.useState<string | null>(null);
  const [quotaForm, setQuotaForm] = React.useState<ClientQuotas>({
    posts: 6,
    reels: 2,
    stories: 2,
    carousels: 2,
    total: 12,
  });

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // Filtered clients list
  const activeClients = React.useMemo(() => {
    if (filterSlug === "all") return SAMPLE_CLIENTS;
    return SAMPLE_CLIENTS.filter((c) => c.slug === filterSlug);
  }, [filterSlug]);

  // Overall studio metrics for this month
  const studioMetrics = React.useMemo(() => {
    return calculateAgencyDashboardMetrics(
      items,
      SAMPLE_CLIENTS,
      clientQuotas,
      selectedMonth,
      selectedYear
    );
  }, [items, clientQuotas, selectedMonth, selectedYear]);

  // Client monthly reports
  const clientReports = React.useMemo(() => {
    return (activeClients || []).map((c) => {
      const q = clientQuotas?.[c.slug] || c?.quotas || { posts: 4, reels: 2, stories: 2, carousels: 2, total: 10 };
      return calculateClientMonthlyReport(c.slug, c.name, items || [], q, selectedMonth, selectedYear);
    });
  }, [activeClients, items, clientQuotas, selectedMonth, selectedYear]);

  // Open Quota Modal for a client
  const openEditQuota = (slug: string) => {
    const c = SAMPLE_CLIENTS.find((cl) => cl.slug === slug);
    const q = clientQuotas?.[slug] || c?.quotas || { posts: 4, reels: 2, stories: 2, carousels: 2, total: 10 };
    setQuotaForm(q);
    setEditingClient(slug);
  };

  const handleSaveQuotas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    const total = quotaForm.posts + quotaForm.reels + quotaForm.stories + (quotaForm.carousels || 0);
    updateClientQuotas(editingClient, {
      ...quotaForm,
      total,
    });
    setEditingClient(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-hairline-subtle pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-aura-primary" />
            <span className="text-label-caps text-ink-tertiary uppercase tracking-wider font-semibold">
              Retainer Operations & Deliverables Engine
            </span>
          </div>
          <h1 className="text-headline-lg lg:text-display-lg font-semibold text-ink-primary tracking-tight">
            Deliverables & Quotas
          </h1>
          <p className="text-body-sm text-ink-secondary mt-1">
            Format quotas, monthly production pacing, and strict completion tracking across active retainers.
          </p>
        </div>

        {/* Month Navigation & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-hairline-subtle rounded-lg p-1 shadow-whisper">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1.5 rounded hover:bg-surface-container text-ink-secondary hover:text-ink-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 flex items-center gap-2 text-body-sm font-medium text-ink-primary min-w-[130px] justify-center">
              <Calendar className="w-3.5 h-3.5 text-aura-primary" />
              <span>{formatMonthYear(selectedMonth, selectedYear)}</span>
            </div>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1.5 rounded hover:bg-surface-container text-ink-secondary hover:text-ink-primary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link href="/content">
            <Button variant="secondary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Content Matrix
            </Button>
          </Link>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="rounded-lg bg-surface-container-low border border-hairline-subtle p-3.5 flex items-start gap-3 text-body-sm">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <div className="text-ink-secondary">
          <span className="font-medium text-ink-primary">Deliverable Completion Policy: </span>
          Only content items with status <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-hairline text-emerald-700 font-semibold">published</span> count toward contractual quota completion. In-review, changes requested, and scheduled drafts remain in production pipeline.
        </div>
      </div>

      {/* Studio Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-ink-tertiary mb-2">
            <span className="text-label-caps uppercase font-semibold">Total Promised</span>
            <Package className="w-4 h-4 text-ink-tertiary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-ink-primary">
              {studioMetrics.totalPromised}
            </span>
            <span className="text-body-sm text-ink-secondary font-medium">Deliverables</span>
          </div>
          <span className="text-xs text-ink-tertiary mt-2 block">
            Across {studioMetrics.activeClients} active agency retainers
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-ink-tertiary mb-2">
            <span className="text-label-caps uppercase font-semibold">Completed (Published)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-emerald-600">
              {studioMetrics.totalCompleted}
            </span>
            <span className="text-body-sm text-ink-secondary font-medium">
              / {studioMetrics.totalPromised}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-ink-secondary">
            <span>Overall Pacing</span>
            <span className="font-medium text-ink-primary">{studioMetrics.overallPercentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all"
              style={{ width: `${Math.min(100, studioMetrics.overallPercentage)}%` }}
            />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-ink-tertiary mb-2">
            <span className="text-label-caps uppercase font-semibold">Remaining Quota</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-ink-primary">
              {studioMetrics.totalRemaining}
            </span>
            <span className="text-body-sm text-ink-secondary font-medium">To Launch</span>
          </div>
          <span className="text-xs text-ink-tertiary mt-2 block">
            Scheduled for remainder of {formatMonthYear(selectedMonth, selectedYear)}
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-ink-tertiary mb-2">
            <span className="text-label-caps uppercase font-semibold">In Approval Pipeline</span>
            <TrendingUp className="w-4 h-4 text-aura-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-ink-primary">
              {studioMetrics.pendingApprovals}
            </span>
            <span className="text-body-sm text-ink-secondary font-medium">Awaiting Sign-off</span>
          </div>
          <span className="text-xs text-ink-tertiary mt-2 block">
            Drafts, pending approvals & change revisions
          </span>
        </Card>
      </div>

      {/* Client Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterSlug("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filterSlug === "all"
              ? "bg-ink-primary text-white"
              : "bg-surface-container text-ink-secondary hover:text-ink-primary hover:bg-surface-container-high"
          }`}
        >
          All Clients ({SAMPLE_CLIENTS.length})
        </button>
        {SAMPLE_CLIENTS.map((c) => (
          <button
            key={c.slug}
            onClick={() => setFilterSlug(c.slug)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              filterSlug === c.slug
                ? "bg-ink-primary text-white"
                : "bg-surface-container text-ink-secondary hover:text-ink-primary hover:bg-surface-container-high"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Client Monthly Deliverables Cards */}
      <div className="space-y-6">
        {clientReports.map((report) => {
          const clientData = SAMPLE_CLIENTS.find((c) => c.slug === report.clientSlug);

          return (
            <Card key={report.clientSlug} className="p-6 overflow-hidden">
              {/* Client Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-hairline-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-surface-container-high text-ink-primary font-semibold flex items-center justify-center text-sm border border-hairline-subtle">
                    {clientData?.initials || report.clientName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-headline-sm font-semibold text-ink-primary">
                        {report.clientName}
                      </h3>
                      <Badge variant="neutral" size="sm">
                        {clientData?.retainerTier || "Retainer"}
                      </Badge>
                      {report.isOverQuota && (
                        <Badge variant="approved" size="sm">
                          Over Quota (+{report.overQuota})
                        </Badge>
                      )}
                    </div>
                    <span className="text-body-sm text-ink-secondary">
                      {clientData?.category} · {report.monthName} Retainer Package
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Sliders className="w-3.5 h-3.5" />}
                    onClick={() => openEditQuota(report.clientSlug)}
                  >
                    Configure Quotas
                  </Button>
                  <Link href={`/clients/${report.clientSlug}`}>
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Workspace
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Total Retainer Progress Bar */}
              <div className="py-5 border-b border-hairline-subtle space-y-2">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="font-medium text-ink-primary">
                    Retainer Completion Pace ({report.totalCompleted} of {report.totalPromised} published)
                  </span>
                  <span className="font-semibold text-ink-primary">
                    {report.totalPercentage}%
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      report.totalPercentage >= 100 ? "bg-emerald-600" : "bg-aura-primary"
                    }`}
                    style={{ width: `${Math.min(100, report.totalPercentage)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-ink-tertiary pt-1">
                  <span>Remaining to publish: <strong className="text-ink-secondary">{report.totalRemaining}</strong></span>
                  <span>Pipeline items in production: <strong className="text-ink-secondary">{report.pipelineCount}</strong></span>
                </div>
              </div>

              {/* Format Breakdown Grid */}
              <div className="pt-5 space-y-3">
                <h4 className="text-label-caps uppercase font-semibold text-ink-tertiary tracking-wider">
                  Deliverable Format Distribution
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(
                    [
                      { key: "posts", metric: report.posts },
                      { key: "reels", metric: report.reels },
                      { key: "carousels", metric: report.carousels },
                      { key: "stories", metric: report.stories },
                    ] as const
                  ).map(({ key, metric }) => {
                    const cfg = FORMAT_CONFIG[key];
                    return (
                      <div
                        key={key}
                        className="p-4 rounded-lg bg-surface-container-low border border-hairline-subtle space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-ink-primary tracking-wide">
                            {cfg.label}
                          </span>
                          <span className="text-xs text-ink-tertiary">
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

                        <div className="flex items-center justify-between text-[11px] text-ink-secondary pt-0.5">
                          <span>
                            {metric.promised === 0
                              ? "No quota"
                              : metric.isOverQuota
                              ? `+${metric.overQuota} extra`
                              : `${metric.remaining} left`}
                          </span>
                          <span className="font-medium text-ink-primary">
                            {metric.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit Quota Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-hairline-subtle space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <h3 className="text-headline-sm font-semibold text-ink-primary">
                  Configure Package Quotas
                </h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Update monthly deliverable targets for {SAMPLE_CLIENTS.find((c) => c.slug === editingClient)?.name}.
                </p>
              </div>
              <button
                onClick={() => setEditingClient(null)}
                className="p-1 rounded-md text-ink-tertiary hover:text-ink-primary hover:bg-surface-container"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuotas} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-ink-secondary block mb-1">
                  Feed Posts Quota
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={quotaForm.posts}
                  onChange={(e) =>
                    setQuotaForm((prev) => ({ ...prev, posts: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-hairline-subtle text-body-sm text-ink-primary outline-none focus:border-ink-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-secondary block mb-1">
                  Reels & Video Quota
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={quotaForm.reels}
                  onChange={(e) =>
                    setQuotaForm((prev) => ({ ...prev, reels: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-hairline-subtle text-body-sm text-ink-primary outline-none focus:border-ink-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-secondary block mb-1">
                  Carousels Quota
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={quotaForm.carousels ?? 0}
                  onChange={(e) =>
                    setQuotaForm((prev) => ({ ...prev, carousels: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-hairline-subtle text-body-sm text-ink-primary outline-none focus:border-ink-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-secondary block mb-1">
                  Stories Quota
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={quotaForm.stories}
                  onChange={(e) =>
                    setQuotaForm((prev) => ({ ...prev, stories: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-hairline-subtle text-body-sm text-ink-primary outline-none focus:border-ink-primary"
                />
              </div>

              <div className="pt-2 border-t border-hairline flex items-center justify-between text-body-sm">
                <span className="text-ink-secondary">Calculated Total:</span>
                <span className="font-semibold text-ink-primary">
                  {quotaForm.posts + quotaForm.reels + quotaForm.stories + (quotaForm.carousels || 0)} deliverables/mo
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setEditingClient(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
