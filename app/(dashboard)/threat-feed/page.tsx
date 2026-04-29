"use client";

import { useMemo, useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIncidents } from "@/lib/hooks";
import { friendlyError } from "@/lib/errors";
import {
  CLASSIFICATION_LABEL,
  formatTime,
  statusLabel,
  type ApiIncident,
} from "@/lib/types";

const PAGE_SIZE = 20;

function RiskPill({ score }: { score: number }) {
  const color = score >= 80 ? "#ef4444" : score >= 50 ? "#f59e0b" : "#10b981";
  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ color, background: `${color}15` }}
    >
      {score}
    </span>
  );
}

function RowSkeleton() {
  return (
    <tr>
      {[80, 60, 50, 220, 40, 60, 40].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3 rounded animate-pulse" style={{ width: w, background: "#1a1a2e" }} />
        </td>
      ))}
    </tr>
  );
}

function ThreatFeedContent() {
  const { data, isLoading, error } = useIncidents(200);
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ApiIncident | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const allRows: ApiIncident[] = data?.items ?? [];

  // Auto-select incident coming from overview "View" link
  useEffect(() => {
    if (!highlightId || allRows.length === 0) return;
    const found = allRows.find((r) => r.id === highlightId);
    if (found) setSelected(found);
  }, [highlightId, allRows]);

  // Scroll detail panel into view whenever a row is selected
  useEffect(() => {
    if (selected && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selected]);

  const filteredRows = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return allRows;
    return allRows.filter(
      (item) =>
        item.id.toLowerCase().includes(value) ||
        item.preview.toLowerCase().includes(value) ||
        item.from.includes(value) ||
        CLASSIFICATION_LABEL[item.classification].toLowerCase().includes(value)
    );
  }, [query, allRows]);

  // Reset to page 1 whenever search query changes
  useEffect(() => { setPage(1); }, [query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const rows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 space-y-5 min-h-screen">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#f5ede8" }}>
          Threat Feed
        </h1>
        <p className="text-xs" style={{ color: "#6b7280" }}>
          {isLoading ? "Loading…" : `${filteredRows.length} intercept${filteredRows.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {error && (
        <p className="text-sm" style={{ color: "#ef4444" }}>
          {friendlyError(error)}
        </p>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by id, typology, number or text"
        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
        style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", color: "#f5ede8" }}
      />

      <div ref={tableRef} className="rounded-xl overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
                {["ID", "Time", "Channel", "Preview", "Risk", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3.5 text-sm font-semibold"
                    style={{ color: "#9ca3af" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
                : rows.map((item, index) => (
                    <tr
                      key={item.id}
                      style={{ borderBottom: index < rows.length - 1 ? "1px solid #13131f" : "none" }}
                    >
                      <td className="px-4 py-3.5 text-sm font-mono font-medium whitespace-nowrap" style={{ color: "#e8581a" }}>
                        {item.id}
                      </td>
                      <td className="px-4 py-3.5 text-sm whitespace-nowrap" style={{ color: "#9ca3af" }}>
                        {formatTime(item.timestamp)}
                      </td>
                      <td className="px-4 py-3.5 text-sm whitespace-nowrap" style={{ color: "#9ca3af" }}>
                        {item.channel.charAt(0) + item.channel.slice(1).toLowerCase()}
                      </td>
                      <td className="px-4 py-3.5 text-sm max-w-sm truncate" style={{ color: "#9ca3af" }}>
                        {item.preview}
                      </td>
                      <td className="px-4 py-3.5">
                        <RiskPill score={item.riskScore} />
                      </td>
                      <td className="px-4 py-3.5 text-sm whitespace-nowrap" style={{ color: "#9ca3af" }}>
                        {statusLabel(item.status)}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          className="text-sm px-2.5 py-1 rounded"
                          style={{ background: "#13131f", color: "#9ca3af" }}
                          onClick={() => setSelected(item)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs" style={{ color: "#6b7280" }}>
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setPage((p) => p - 1); tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
              disabled={page === 1}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
              style={page === 1
                ? { background: "#0a0a14", border: "1px solid #13131f", color: "#2a2a4a", cursor: "not-allowed" }
                : { background: "#e8581a18", border: "1px solid #e8581a50", color: "#e8581a" }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => { setPage((p) => p + 1); tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
              disabled={page === totalPages}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
              style={page === totalPages
                ? { background: "#0a0a14", border: "1px solid #13131f", color: "#2a2a4a", cursor: "not-allowed" }
                : { background: "#e8581a18", border: "1px solid #e8581a50", color: "#e8581a" }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {selected && (
        <div
          ref={detailRef}
          className="rounded-xl p-5 space-y-3"
          style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: "#f5ede8" }}>
              {selected.id} · {CLASSIFICATION_LABEL[selected.classification]}
            </h2>
            <button
              className="text-sm px-2.5 py-1 rounded"
              style={{ background: "#13131f", color: "#9ca3af" }}
              onClick={() => {
                setSelected(null);
                tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Close
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium" style={{ color: "#6b7280" }}>
              From: {selected.from}
            </p>
            <p className="text-xs font-medium" style={{ color: "#6b7280" }}>
              Time: {formatTime(selected.timestamp)}
            </p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
            {selected.transcript}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
            {selected.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ThreatFeedPage() {
  return (
    <Suspense>
      <ThreatFeedContent />
    </Suspense>
  );
}
