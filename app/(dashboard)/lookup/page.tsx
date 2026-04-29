"use client";

import { useState } from "react";
import {
  Search,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Shield,
  HelpCircle,
  Phone,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  CLASSIFICATION_LABEL,
  formatRelative,
  type NumberReputation,
  type ReputationVerdict,
} from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL!;

const VERDICT_CONFIG: Record<
  ReputationVerdict,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode; desc: string }
> = {
  UNKNOWN:    { label: "Unknown",    color: "#9ca3af", bg: "#9ca3af10", border: "#9ca3af25", icon: <HelpCircle size={22} />,  desc: "No intelligence on this number yet." },
  CLEAN:      { label: "Clean",      color: "#10b981", bg: "#10b98110", border: "#10b98130", icon: <ShieldCheck size={22} />, desc: "No fraudulent activity detected." },
  LOW_RISK:   { label: "Low Risk",   color: "#10b981", bg: "#10b98110", border: "#10b98130", icon: <Shield size={22} />,      desc: "Minor flags — exercise caution." },
  SUSPICIOUS: { label: "Suspicious", color: "#f59e0b", bg: "#f59e0b10", border: "#f59e0b30", icon: <ShieldAlert size={22} />, desc: "Multiple suspicious patterns detected." },
  HIGH_RISK:  { label: "High Risk",  color: "#ef4444", bg: "#ef444410", border: "#ef444430", icon: <ShieldX size={22} />,     desc: "Confirmed fraud activity. Do not engage." },
};

async function fetchReputation(phone: string): Promise<NumberReputation> {
  const res = await fetch(`${BASE}/api/numbers/${encodeURIComponent(phone)}/reputation`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.error || "Failed to look up number.");
  }
  return res.json();
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const filled = (score / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="36" cy="36" r={radius} fill="none" stroke="#1a1a2e" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LookupPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NumberReputation | null>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState("");

  async function handleSearch(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = phone.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSearched(trimmed);
    try {
      setResult(await fetchReputation(trimmed));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const verdict = result ? VERDICT_CONFIG[result.verdict] : null;

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#f5ede8" }}>Number Lookup</h1>
        <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
          Check any Nigerian number against the fraud intelligence database
        </p>
      </div>

      {/* Search card */}
      <div className="rounded-xl p-5" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Phone
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#2a2a4a" }}
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 08012345678 or +2348012345678"
              required
              className="w-full pl-9 pr-4 rounded-lg text-sm outline-none transition-colors placeholder:text-[#2a2a4a]"
              style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#f5ede8", height: "42px" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#e8581a")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 rounded-lg text-sm font-semibold transition-all shrink-0"
            style={{ background: loading ? "#9c4010" : "#e8581a", color: "white", height: "42px", border: "none" }}
          >
            {loading ? <Spinner /> : <Search size={14} />}
            {loading ? "Checking…" : "Check Number"}
          </button>
        </form>

        {error && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm mt-3"
            style={{ background: "#130a0a", border: "1px solid #ef444440", color: "#ef4444" }}
          >
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Spinner />
          <p className="text-sm" style={{ color: "#6b7280" }}>Scanning intelligence database…</p>
        </div>
      )}

      {/* Results */}
      {!loading && result && verdict && (
        <div className="space-y-4">

          {/* Main verdict card */}
          <div
            className="rounded-xl p-5"
            style={{ background: "#0f0f1a", border: `1px solid ${verdict.border}` }}
          >
            <div className="flex items-center gap-5">
              {/* Score ring */}
              <div className="relative shrink-0">
                <ScoreRing score={result.reputationScore} color={verdict.color} />
                <span
                  className="absolute inset-0 flex items-center justify-center text-lg font-bold"
                  style={{ color: verdict.color }}
                >
                  {result.reputationScore}
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span style={{ color: verdict.color }}>{verdict.icon}</span>
                  <span className="text-base font-bold" style={{ color: verdict.color }}>{verdict.label}</span>
                </div>
                <p className="text-xs font-mono truncate" style={{ color: "#6b7280" }}>{searched}</p>
                <p className="text-xs" style={{ color: "#9ca3af" }}>{verdict.desc}</p>
              </div>

              <div
                className="shrink-0 text-center px-4 py-3 rounded-lg"
                style={{ background: "#13131f" }}
              >
                <p className="text-2xl font-bold" style={{ color: "#f5ede8" }}>{result.totalIncidents}</p>
                <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>incident{result.totalIncidents !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {/* API message */}
            <p
              className="text-xs leading-relaxed mt-4 pt-4"
              style={{ color: "#6b7280", borderTop: "1px solid #13131f" }}
            >
              {result.message}
            </p>
          </div>

          {/* Stats + classifications row */}
          {result.totalIncidents > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Incident breakdown */}
              <div className="rounded-xl p-4 space-y-3" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
                <p className="text-xs font-semibold" style={{ color: "#6b7280" }}>Incident Breakdown</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Blocked",    value: result.blockedCount    ?? 0, color: "#ef4444", bar: "#ef444420" },
                    { label: "Monitoring", value: result.monitoringCount ?? 0, color: "#f59e0b", bar: "#f59e0b20" },
                    { label: "Allowed",    value: result.allowedCount    ?? 0, color: "#10b981", bar: "#10b98120" },
                  ].map((s) => {
                    const pct = result.totalIncidents > 0 ? Math.round((s.value / result.totalIncidents) * 100) : 0;
                    return (
                      <div key={s.label} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: "#9ca3af" }}>{s.label}</span>
                          <span className="text-xs font-semibold" style={{ color: s.color }}>{s.value}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#13131f" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: s.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Flagged classifications */}
              {result.classifications && result.classifications.length > 0 && (
                <div className="rounded-xl p-4 space-y-3" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
                  <p className="text-xs font-semibold" style={{ color: "#6b7280" }}>Flagged For</p>
                  <div className="flex flex-wrap gap-2">
                    {result.classifications.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: "#ef444415", border: "1px solid #ef444430", color: "#ef4444" }}
                      >
                        {CLASSIFICATION_LABEL[c] ?? c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent incidents */}
          {result.recentIncidents && result.recentIncidents.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
              <div className="px-5 py-3.5" style={{ borderBottom: "1px solid #13131f" }}>
                <p className="text-sm font-semibold" style={{ color: "#f5ede8" }}>Recent Incidents</p>
              </div>
              <div>
                {result.recentIncidents.map((inc, i) => (
                  <div
                    key={inc.id}
                    className="px-5 py-3.5 flex items-center gap-4"
                    style={{ borderTop: i > 0 ? "1px solid #13131f" : "none" }}
                  >
                    {/* Risk pill */}
                    <span
                      className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold"
                      style={{
                        color: inc.riskScore >= 80 ? "#ef4444" : inc.riskScore >= 50 ? "#f59e0b" : "#10b981",
                        background: inc.riskScore >= 80 ? "#ef444415" : inc.riskScore >= 50 ? "#f59e0b15" : "#10b98115",
                      }}
                    >
                      {inc.riskScore}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono font-medium" style={{ color: "#e8581a" }}>{inc.id}</p>
                        <span className="text-xs" style={{ color: "#2a2a4a" }}>·</span>
                        <p className="text-xs" style={{ color: "#6b7280" }}>
                          {CLASSIFICATION_LABEL[inc.classification] ?? inc.classification}
                        </p>
                        <span className="text-xs" style={{ color: "#2a2a4a" }}>·</span>
                        <p className="text-xs" style={{ color: "#6b7280" }}>{inc.channel}</p>
                      </div>
                      {inc.preview && (
                        <p className="text-xs truncate mt-0.5" style={{ color: "#9ca3af" }}>{inc.preview}</p>
                      )}
                    </div>

                    <p className="text-xs shrink-0 whitespace-nowrap" style={{ color: "#6b7280" }}>
                      {formatRelative(inc.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state — after search, no result yet (initial) */}
      {!loading && !result && !error && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}
          >
            <Search size={22} style={{ color: "#2a2a4a" }} />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium" style={{ color: "#6b7280" }}>Enter a phone number to check</p>
            <p className="text-xs" style={{ color: "#2a2a4a" }}>
              Built from real telecom intercepts — not user reports
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
