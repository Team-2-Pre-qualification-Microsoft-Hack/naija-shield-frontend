"use client";

import { useMemo, useState } from "react";
import { threatFeedData } from "@/lib/mock-data";

type Threat = (typeof threatFeedData)[number];

function RiskPill({ score }: { score: number }) {
  const color = score >= 80 ? "#ef4444" : score >= 50 ? "#f59e0b" : "#10b981";
  return (
    <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" style={{ color, background: `${color}15` }}>
      {score}
    </span>
  );
}

export default function ThreatFeedPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Threat | null>(null);

  const rows = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) {
      return threatFeedData;
    }

    return threatFeedData.filter((item) => {
      return (
        item.id.toLowerCase().includes(value) ||
        item.preview.toLowerCase().includes(value) ||
        item.number.includes(value) ||
        item.typology.toLowerCase().includes(value)
      );
    });
  }, [query]);

  return (
    <div className="p-6 space-y-5 min-h-screen">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#f5ede8" }}>
          Threat Feed
        </h1>
        <p className="text-xs" style={{ color: "#6b7280" }}>
          {rows.length} intercepts
        </p>
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by id, typology, number or text"
        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
        style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", color: "#f5ede8" }}
      />

      <div className="rounded-xl overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
                {["ID", "Time", "Channel", "Preview", "Risk", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3.5 text-sm font-semibold" style={{ color: "#9ca3af" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: index < rows.length - 1 ? "1px solid #13131f" : "none" }}>
                  <td className="px-4 py-3.5 text-sm font-mono font-medium" style={{ color: "#e8581a" }}>{item.id}</td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: "#9ca3af" }}>{item.time}</td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: "#9ca3af" }}>{item.channel}</td>
                  <td className="px-4 py-3.5 text-sm max-w-sm truncate" style={{ color: "#9ca3af" }}>{item.preview}</td>
                  <td className="px-4 py-3.5"><RiskPill score={item.risk} /></td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: "#9ca3af" }}>{item.status}</td>
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

      {selected && (
        <div className="rounded-xl p-5 space-y-3" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: "#f5ede8" }}>
              {selected.id} details
            </h2>
            <button
              className="text-sm px-2.5 py-1 rounded"
              style={{ background: "#13131f", color: "#9ca3af" }}
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
            {selected.transcript}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
            {selected.aiReasoning}
          </p>
        </div>
      )}
    </div>
  );
}
