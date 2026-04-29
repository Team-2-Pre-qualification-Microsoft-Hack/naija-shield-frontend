"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  X,
  AlertCircle,
  Clock,
  History,
  ChevronDown,
} from "lucide-react";
import { useIncidentStats, useIncidents, useReports } from "@/lib/hooks";
import { apiPost, apiGet } from "@/lib/api";
import { CLASSIFICATION_LABEL, AGENCY_LABEL } from "@/lib/types";
import type { AgencyType, ReportRequest, ReportResponse } from "@/lib/types";
import { generateReportPDF } from "@/lib/pdf-report";
import { Spinner } from "@/components/ui/spinner";

/* ── Period presets ── */
type PeriodPreset = "1h" | "6h" | "24h" | "7d" | "30d" | "custom";
const PERIOD_LABELS: Record<PeriodPreset, string> = {
  "1h":  "Last 1 Hour",
  "6h":  "Last 6 Hours",
  "24h": "Last 24 Hours",
  "7d":  "Last 7 Days",
  "30d": "Last 30 Days",
  custom: "Custom Range",
};

function periodDates(preset: PeriodPreset): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  switch (preset) {
    case "1h":  from.setHours(from.getHours() - 1);   break;
    case "6h":  from.setHours(from.getHours() - 6);   break;
    case "24h": from.setDate(from.getDate() - 1);     break;
    case "7d":  from.setDate(from.getDate() - 7);     break;
    case "30d": from.setDate(from.getDate() - 30);    break;
    default:    from.setDate(from.getDate() - 1);     break;
  }
  return { from, to };
}

function fmtDateShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-NG", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
    });
  } catch { return iso; }
}

function fmtRelative(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch { return iso; }
}

/* ── Stat card ── */
function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-xl p-4 space-y-1.5" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
      <p className="text-sm" style={{ color: "#9ca3af" }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs" style={{ color: "#6b7280" }}>{sub}</p>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="rounded-xl p-4 space-y-2 animate-pulse" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
      <div className="h-3 w-24 rounded" style={{ background: "#1a1a2e" }} />
      <div className="h-7 w-16 rounded" style={{ background: "#1a1a2e" }} />
      <div className="h-3 w-20 rounded" style={{ background: "#1a1a2e" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════
   CompliancePage
   ══════════════════════════════════════════════ */
export default function CompliancePage() {
  const { data: stats, isLoading: statsLoading } = useIncidentStats();
  const { data: incidentsData } = useIncidents(100);
  const { data: reportsData, mutate: refreshReports } = useReports(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [agencyType, setAgencyType] = useState<AgencyType>("CBN");
  const [period, setPeriod] = useState<PeriodPreset>("24h");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [maxIncidents, setMaxIncidents] = useState(50);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const incidents = incidentsData?.items ?? [];
  const reports = reportsData?.items ?? [];

  /* ── Generate PDF via backend → jsPDF ── */
  async function handleGenerate() {
    setError("");
    setGenerating(true);

    try {
      let periodFrom: string;
      let periodTo: string;

      if (period === "custom") {
        if (!customFrom || !customTo) {
          setError("Please select both start and end dates.");
          setGenerating(false);
          return;
        }
        periodFrom = new Date(customFrom).toISOString();
        periodTo = new Date(customTo).toISOString();
      } else {
        const dates = periodDates(period);
        periodFrom = dates.from.toISOString();
        periodTo = dates.to.toISOString();
      }

      const body: ReportRequest = {
        agencyType,
        periodFrom,
        periodTo,
        maxIncidentDetails: maxIncidents,
      };

      // 1. POST to backend to generate + persist report
      const report = await apiPost<ReportResponse>("/api/reports", body);

      // 2. Generate PDF from backend response
      await generateReportPDF(report);

      // 3. Refresh report history
      refreshReports();

      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  }

  const complianceRate =
    stats && stats.total > 0
      ? Math.round(((stats.blocked + stats.allowed) / stats.total) * 100)
      : null;

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#f5ede8" }}>Compliance</h1>
          <p className="text-xs" style={{ color: "#6b7280" }}>
            Regulatory reporting and incident disclosure
          </p>
        </div>
        <button
          onClick={() => { setError(""); setModalOpen(true); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: "#e8581a18", border: "1px solid #e8581a40", color: "#e8581a" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e8581a25")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#e8581a18")}
        >
          <FileText size={14} />
          Generate Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : stats ? (
          <>
            <StatCard
              label="Total Incidents"
              value={stats.total.toLocaleString()}
              sub={`${stats.blocked} blocked · ${stats.monitoring} monitoring`}
              color="#e8581a"
            />
            <StatCard
              label="Threats Blocked"
              value={stats.blocked.toLocaleString()}
              sub="Confirmed fraud — no user impact"
              color="#ef4444"
            />
            <StatCard
              label="Avg Risk Score"
              value={`${stats.avgRisk}/100`}
              sub={stats.avgRisk >= 70 ? "High — escalation required" : stats.avgRisk >= 40 ? "Moderate" : "Within threshold"}
              color={stats.avgRisk >= 70 ? "#ef4444" : stats.avgRisk >= 40 ? "#f59e0b" : "#10b981"}
            />
            <StatCard
              label="Compliance Rate"
              value={complianceRate !== null ? `${complianceRate}%` : "—"}
              sub="Incidents actioned vs total"
              color="#10b981"
            />
          </>
        ) : null}
      </div>

      {/* Channel breakdown */}
      {stats?.byChannel && stats.byChannel.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#f5ede8" }}>
            Incidents by Channel
          </h2>
          <div className="space-y-3">
            {stats.byChannel.map((c) => {
              const pct = stats.total > 0 ? Math.round((c.count / stats.total) * 100) : 0;
              return (
                <div key={c.channel} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: "#9ca3af" }}>{c.channel}</span>
                    <span style={{ color: "#f5ede8" }}>{c.count} <span style={{ color: "#6b7280" }}>({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "#1a1a2e" }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: c.channel === "SMS" ? "#e8581a" : "#3b82f6",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Incident classification breakdown */}
      {incidents.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #1a1a2e" }}>
            <h2 className="text-sm font-semibold" style={{ color: "#f5ede8" }}>Classification Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 500 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
                {["Classification", "Count", "Share"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-sm font-semibold" style={{ color: "#9ca3af" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(
                incidents.reduce<Record<string, number>>((acc, inc) => {
                  const label = CLASSIFICATION_LABEL[inc.classification];
                  acc[label] = (acc[label] ?? 0) + 1;
                  return acc;
                }, {})
              )
                .sort((a, b) => b[1] - a[1])
                .map(([label, count], i, arr) => {
                  const pct = incidents.length > 0 ? Math.round((count / incidents.length) * 100) : 0;
                  return (
                    <tr
                      key={label}
                      style={{ borderBottom: i < arr.length - 1 ? "1px solid #13131f" : "none" }}
                    >
                      <td className="px-5 py-3.5 text-sm whitespace-nowrap" style={{ color: "#f5ede8" }}>{label}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold whitespace-nowrap" style={{ color: "#e8581a" }}>{count}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 rounded-full" style={{ background: "#1a1a2e" }}>
                            <div
                              className="h-1.5 rounded-full"
                              style={{ width: `${pct}%`, background: "#e8581a" }}
                            />
                          </div>
                          <span className="text-xs" style={{ color: "#6b7280" }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Report History */}
      <div className="rounded-xl overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #1a1a2e" }}>
          <div className="flex items-center gap-2">
            <History size={14} style={{ color: "#e8581a" }} />
            <h2 className="text-sm font-semibold" style={{ color: "#f5ede8" }}>Report History</h2>
          </div>
          <span className="text-xs" style={{ color: "#6b7280" }}>
            {reports.length > 0 ? `${reportsData?.total ?? reports.length} reports generated` : "No reports yet"}
          </span>
        </div>

        {reports.length > 0 ? (
          <div className="divide-y" style={{ borderColor: "#13131f" }}>
            {reports.map((rpt) => (
              <div
                key={rpt.id}
                className="px-5 py-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-[#13131f]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      background: rpt.agencyType === "CBN" ? "#dc262618" : rpt.agencyType === "NCC" ? "#2563eb18" : "#e8581a18",
                      color: rpt.agencyType === "CBN" ? "#dc2626" : rpt.agencyType === "NCC" ? "#2563eb" : "#e8581a",
                    }}
                  >
                    {rpt.agencyType.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#f5ede8" }}>
                      {AGENCY_LABEL[rpt.agencyType]}
                    </p>
                    <div className="flex items-center gap-2 text-xs" style={{ color: "#6b7280" }}>
                      <span className="font-mono">{rpt.id}</span>
                      <span>·</span>
                      <span>{rpt.summary.totalIncidents} incidents</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs" style={{ color: "#9ca3af" }}>{fmtRelative(rpt.generatedAt)}</p>
                    <p className="text-xs" style={{ color: "#6b7280" }}>{rpt.generatedBy}</p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        // Fetch full report (list endpoint returns truncated data)
                        const full = await apiGet<ReportResponse>(
                          `/api/reports/${rpt.id}?agencyType=${rpt.agencyType}`
                        );
                        await generateReportPDF(full);
                      } catch { /* handled inside */ }
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#9ca3af" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e8581a40"; e.currentTarget.style.color = "#e8581a"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1a1a2e"; e.currentTarget.style.color = "#9ca3af"; }}
                    title="Re-download PDF"
                  >
                    <Download size={12} />
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <FileText size={24} style={{ color: "#1a1a2e" }} className="mx-auto mb-2" />
            <p className="text-sm" style={{ color: "#6b7280" }}>
              No reports generated yet. Click &quot;Generate Report&quot; to create your first PDF report.
            </p>
          </div>
        )}
      </div>

      {/* ── Generate Report Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div
            className="w-full max-w-md rounded-xl p-6 space-y-5 animate-fade-up"
            style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: "#f5ede8" }}>Generate Report</h2>
                <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                  Downloads as a professional PDF report
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ color: "#6b7280" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f5ede8")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{ background: "#130a0a", border: "1px solid #ef444440", color: "#ef4444" }}
              >
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Report Type */}
            <div className="space-y-1.5">
              <label className="text-xs" style={{ color: "#6b7280" }}>Report Type</label>
              <div className="relative">
                <select
                  value={agencyType}
                  onChange={(e) => setAgencyType(e.target.value as AgencyType)}
                  className="w-full px-3 rounded-lg text-sm outline-none appearance-none"
                  style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#f5ede8", height: "40px" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#e8581a")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
                >
                  {(Object.keys(AGENCY_LABEL) as AgencyType[]).map((key) => (
                    <option key={key} value={key} style={{ background: "#13131f" }}>
                      {AGENCY_LABEL[key]}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6b7280" }} />
              </div>
            </div>

            {/* Period */}
            <div className="space-y-1.5">
              <label className="text-xs flex items-center gap-1" style={{ color: "#6b7280" }}>
                <Clock size={10} /> Reporting Period
              </label>
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as PeriodPreset)}
                  className="w-full px-3 rounded-lg text-sm outline-none appearance-none"
                  style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#f5ede8", height: "40px" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#e8581a")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
                >
                  {(Object.keys(PERIOD_LABELS) as PeriodPreset[]).map((key) => (
                    <option key={key} value={key} style={{ background: "#13131f" }}>
                      {PERIOD_LABELS[key]}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6b7280" }} />
              </div>

              {period === "custom" && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="datetime-local"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg text-xs outline-none"
                    style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#f5ede8", colorScheme: "dark" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#e8581a")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
                  />
                  <input
                    type="datetime-local"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg text-xs outline-none"
                    style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#f5ede8", colorScheme: "dark" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#e8581a")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
                  />
                </div>
              )}
            </div>

            {/* Max Incidents */}
            <div className="space-y-1.5">
              <label className="text-xs" style={{ color: "#6b7280" }}>Max Incident Details</label>
              <div className="relative">
                <select
                  value={maxIncidents}
                  onChange={(e) => setMaxIncidents(Number(e.target.value))}
                  className="w-full px-3 rounded-lg text-sm outline-none appearance-none"
                  style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#f5ede8", height: "40px" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#e8581a")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n} style={{ background: "#13131f" }}>
                      {n} incidents
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6b7280" }} />
              </div>
            </div>

            {/* Report preview */}
            <div className="rounded-lg p-3 space-y-1.5" style={{ background: "#13131f", border: "1px solid #1a1a2e" }}>
              <p className="text-xs font-medium" style={{ color: "#9ca3af" }}>Will include</p>
              {[
                `${stats?.total ?? "—"} total incidents`,
                `${stats?.blocked ?? "—"} blocked threats`,
                `Up to ${maxIncidents} incident detail records`,
                "Classification & channel breakdown tables",
                "Branded PDF with NaijaShield logo",
                agencyType === "CBN"
                  ? "CBN regulatory narrative & compliance note"
                  : agencyType === "NCC"
                  ? "NCC incident disclosure narrative"
                  : "Internal summary narrative",
              ].map((item) => (
                <p key={item} className="text-xs flex items-center gap-1.5" style={{ color: "#6b7280" }}>
                  <span style={{ color: "#e8581a" }}>›</span> {item}
                </p>
              ))}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 h-10 rounded-lg text-sm font-medium"
                style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#6b7280" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2a4a")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !stats}
                className="flex-1 h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold"
                style={{
                  background: generating || !stats ? "#9c4010" : "#e8581a",
                  color: "white",
                  border: "none",
                }}
              >
                {generating ? (
                  <>
                    <Spinner />
                    Generating…
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
