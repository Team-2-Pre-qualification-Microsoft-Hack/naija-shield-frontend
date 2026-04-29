"use client";

import Link from "next/link";
import { NigeriaMap } from "@/components/dashboard/nigeria-map";
import { useIncidents, useIncidentStats } from "@/lib/hooks";
import { formatTime, type ApiIncident } from "@/lib/types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function RiskPill({ score }: { score: number }) {
  const color = score >= 80 ? "#ef4444" : score >= 50 ? "#f59e0b" : "#10b981";
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ color, background: `${color}15` }}
    >
      {score}
    </span>
  );
}

const HOURS = ["00:00","02:00","04:00","06:00","08:00","10:00","12:00","14:00","16:00","18:00","20:00","22:00"];

function buildVelocity(incidents: ApiIncident[]) {
  const buckets = HOURS.map(() => ({ sms: 0, voice: 0 }));
  for (const inc of incidents) {
    const idx = Math.floor(new Date(inc.timestamp).getHours() / 2);
    if (inc.channel === "SMS") buckets[idx].sms++;
    else if (inc.channel === "Voice") buckets[idx].voice++;
  }
  return buckets;
}

function TrendChart({ incidents }: { incidents: ApiIncident[] }) {
  const buckets = buildVelocity(incidents);

  const chartData = {
    labels: HOURS,
    datasets: [
      {
        label: "SMS",
        data: buckets.map((b) => b.sms),
        borderColor: "#e8581a",
        backgroundColor: "rgba(232,88,26,0.12)",
        borderWidth: 2,
        pointBackgroundColor: "#e8581a",
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Voice",
        data: buckets.map((b) => b.voice),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.08)",
        borderWidth: 2,
        borderDash: [5, 4],
        pointBackgroundColor: "#3b82f6",
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#6b7280",
          font: { size: 11 },
          boxWidth: 12,
          boxHeight: 2,
          padding: 16,
          usePointStyle: false,
        },
      },
      tooltip: {
        backgroundColor: "#0f0f1a",
        borderColor: "#1a1a2e",
        borderWidth: 1,
        titleColor: "#f5ede8",
        bodyColor: "#9ca3af",
        padding: 10,
        callbacks: {
          label: (ctx: TooltipItem<"line">) => {
            const v = ctx.parsed.y ?? 0;
            return `  ${ctx.dataset.label}: ${v} intercept${v !== 1 ? "s" : ""}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "#1a1a2e" },
        ticks: { color: "#2a2a4a", font: { size: 9 } },
        border: { color: "#1a1a2e" },
      },
      y: {
        grid: { color: "#1a1a2e" },
        ticks: { color: "#2a2a4a", font: { size: 9 }, stepSize: 1, precision: 0 },
        border: { color: "#1a1a2e" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="absolute inset-0">
      <Line data={chartData} options={options} />
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-xl p-4 space-y-2 animate-pulse" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
      <div className="h-3 w-28 rounded" style={{ background: "#1a1a2e" }} />
      <div className="h-7 w-16 rounded" style={{ background: "#1a1a2e" }} />
      <div className="h-3 w-20 rounded" style={{ background: "#1a1a2e" }} />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr>
      {[80, 60, 50, 200, 40, 60, 40].map((w, i) => (
        <td key={i} className="px-5 py-3.5">
          <div className="h-3 rounded animate-pulse" style={{ width: w, background: "#1a1a2e" }} />
        </td>
      ))}
    </tr>
  );
}

export default function OverviewPage() {
  const { data: stats, isLoading: statsLoading } = useIncidentStats();
  const { data: incidentsData, isLoading: incidentsLoading } = useIncidents(50);

  const allIncidents: ApiIncident[] = incidentsData?.items ?? [];
  const rows = allIncidents.slice(0, 5);

  const kpis = stats
    ? [
        { label: "Total Intercepts", value: stats.total.toLocaleString(), sub: `${stats.blocked} blocked · ${stats.monitoring} monitoring`, color: "#e8581a" },
        { label: "Threats Blocked", value: stats.blocked.toLocaleString(), sub: `${stats.allowed} allowed through`, color: "#ef4444" },
        { label: "Under Monitoring", value: stats.monitoring.toLocaleString(), sub: "Flagged, awaiting review", color: "#f59e0b" },
        { label: "Avg Network Risk", value: `${stats.avgRisk}/100`, sub: stats.avgRisk >= 70 ? "High — action required" : stats.avgRisk >= 40 ? "Moderate" : "Low", color: stats.avgRisk >= 70 ? "#ef4444" : stats.avgRisk >= 40 ? "#f59e0b" : "#10b981" },
      ]
    : [];

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#f5ede8" }}>
            Command Centre
          </h1>
          <p className="text-xs" style={{ color: "#6b7280" }}>
            MTN Nigeria · Fraud Intelligence Dashboard
          </p>
        </div>
        <Link href="/threat-feed" className="text-sm font-medium" style={{ color: "#e8581a" }}>
          Open Threat Feed
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-4 space-y-2"
                style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}
              >
                <p className="text-sm font-medium" style={{ color: "#9ca3af" }}>
                  {item.label}
                </p>
                <p className="text-2xl font-bold" style={{ color: item.color }}>
                  {item.value}
                </p>
                <p className="text-[13px] font-light" style={{ color: "#6b7280" }}>
                  {item.sub}
                </p>
              </div>
            ))}
      </div>

      {stats?.byChannel && stats.byChannel.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.byChannel.map((c) => (
            <div
              key={c.channel}
              className="rounded-xl px-4 py-3 flex items-center justify-between"
              style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}
            >
              <span className="text-sm" style={{ color: "#9ca3af" }}>{c.channel}</span>
              <span className="text-sm font-bold" style={{ color: "#f5ede8" }}>{c.count}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 rounded-xl p-5" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
          <div className="mb-3">
            <h2 className="text-sm font-semibold" style={{ color: "#f5ede8" }}>
              Interactive Threat Map
            </h2>
            <p className="text-xs" style={{ color: "#6b7280" }}>
              Aggregated by exchange and cell-tower clusters
            </p>
          </div>
          <NigeriaMap />
        </div>

        <div className="xl:col-span-2 rounded-xl p-5 flex flex-col" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
          <div className="mb-3 shrink-0">
            <h2 className="text-sm font-semibold" style={{ color: "#f5ede8" }}>
              Threat Velocity
            </h2>
            <p className="text-xs" style={{ color: "#6b7280" }}>
              Intercepts per 2-hour interval
            </p>
          </div>
          <div className="relative flex-1 min-h-0" style={{ minHeight: 220 }}>
            <TrendChart incidents={allIncidents} />
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid #1a1a2e" }}>
          <h2 className="text-sm font-semibold" style={{ color: "#f5ede8" }}>
            Recent Intercepts
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
                {["ID", "Time", "Channel", "Preview", "Risk", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 text-sm font-semibold"
                    style={{ color: "#9ca3af" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidentsLoading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                : rows.map((row, i) => (
                    <tr
                      key={row.id}
                      style={{ borderBottom: i < rows.length - 1 ? "1px solid #13131f" : "none" }}
                    >
                      <td className="px-5 py-3.5 text-sm font-mono font-medium" style={{ color: "#e8581a" }}>
                        {row.id}
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>
                        {formatTime(row.timestamp)}
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>
                        {row.channel}
                      </td>
                      <td className="px-5 py-3.5 text-sm max-w-xs truncate" style={{ color: "#9ca3af" }}>
                        {row.preview}
                      </td>
                      <td className="px-5 py-3.5">
                        <RiskPill score={row.riskScore} />
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>
                        {row.status}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/threat-feed?id=${row.id}`}
                          className="text-sm px-2.5 py-1 rounded"
                          style={{ background: "#13131f", color: "#9ca3af" }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
