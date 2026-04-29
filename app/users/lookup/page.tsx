"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Shield,
  HelpCircle,
  Phone,
  ArrowRight,
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
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    glow: string;
    icon: React.ReactNode;
    headline: string;
    sub: string;
  }
> = {
  UNKNOWN: {
    label: "Unknown",
    color: "#9ca3af",
    bg: "#9ca3af0d",
    border: "#9ca3af25",
    glow: "rgba(156,163,175,0.08)",
    icon: <HelpCircle size={28} />,
    headline: "No record found",
    sub: "This number has not appeared in any fraud intercept yet. That doesn't confirm it's safe.",
  },
  CLEAN: {
    label: "Clean",
    color: "#10b981",
    bg: "#10b9810d",
    border: "#10b98130",
    glow: "rgba(16,185,129,0.10)",
    icon: <ShieldCheck size={28} />,
    headline: "This number looks safe",
    sub: "No fraudulent activity has been detected from this number.",
  },
  LOW_RISK: {
    label: "Low Risk",
    color: "#10b981",
    bg: "#10b9810d",
    border: "#10b98130",
    glow: "rgba(16,185,129,0.08)",
    icon: <Shield size={28} />,
    headline: "Low risk — stay alert",
    sub: "Minor flags on record. Proceed with caution and do not share personal information.",
  },
  SUSPICIOUS: {
    label: "Suspicious",
    color: "#f59e0b",
    bg: "#f59e0b0d",
    border: "#f59e0b35",
    glow: "rgba(245,158,11,0.10)",
    icon: <ShieldAlert size={28} />,
    headline: "Suspicious number",
    sub: "This number has been flagged multiple times. Avoid sharing any sensitive details.",
  },
  HIGH_RISK: {
    label: "High Risk",
    color: "#ef4444",
    bg: "#ef44440d",
    border: "#ef444435",
    glow: "rgba(239,68,68,0.10)",
    icon: <ShieldX size={28} />,
    headline: "Do NOT engage",
    sub: "Confirmed fraud activity detected. Block this number and report to your bank immediately.",
  },
};

async function fetchReputation(phone: string): Promise<NumberReputation> {
  const res = await fetch(
    `${BASE}/api/numbers/${encodeURIComponent(phone)}/reputation`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.error || "Failed to look up number.");
  }
  return res.json();
}

function ScoreArc({ score, color }: { score: number; color: string }) {
  const r = 52;
  const cx = 64;
  const cy = 64;
  const startAngle = -210;
  const sweep = 240;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const arc = (angle: number) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  });
  const endAngle = startAngle + sweep * (score / 100);
  const s = arc(startAngle);
  const e = arc(endAngle);
  const sEnd = arc(startAngle + sweep);
  const largeArc = sweep * (score / 100) > 180 ? 1 : 0;
  const largeArcBg = sweep > 180 ? 1 : 0;

  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <path
        d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArcBg} 1 ${sEnd.x} ${sEnd.y}`}
        fill="none"
        stroke="#1a1a2e"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {score > 0 && (
        <path
          d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
        />
      )}
      <text x={cx} y={cy - 4} textAnchor="middle" fill={color} fontSize="24" fontWeight="700" fontFamily="inherit">
        {score}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#6b7280" fontSize="10" fontFamily="inherit">
        RISK SCORE
      </text>
    </svg>
  );
}

export default function PublicLookupPage() {
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
    <div className="min-h-screen flex flex-col" style={{ background: "#09090f" }}>

      {/* Top nav */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid #13131f" }}
      >
        <div className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="NaijaShield" width={130} height={40} className="h-6 w-auto" priority />
          <span className="text-sm font-semibold" style={{ color: "#f5ede8" }}>NaijaShield</span>
        </div>
        <a
          href="/login"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: "#6b7280" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e8581a")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
        >
          Analyst Login <ArrowRight size={12} />
        </a>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-14">

        {/* Hero */}
        <div className="w-full max-w-xl text-center space-y-4 mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: "#e8581a12", border: "1px solid #e8581a30", color: "#e8581a" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#e8581a" }} />
            Powered by live telecom intercepts · Free to use
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ color: "#f5ede8" }}>
            Is this number a scam?
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
            Check any Nigerian phone number before you pick up, reply, or send money.
            NaijaShield's fraud database is built from real telecom intercepts — not user reports.
          </p>
        </div>

        {/* Search box */}
        <div className="w-full max-w-xl space-y-3">
          <form onSubmit={handleSearch}>
            <div
              className="flex items-center gap-3 rounded-xl px-4"
              style={{
                background: "#0f0f1a",
                border: "1px solid #1a1a2e",
                height: "56px",
                transition: "border-color 0.2s",
              }}
              onFocusCapture={(e) => (e.currentTarget.style.borderColor = "#e8581a")}
              onBlurCapture={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
            >
              <Phone size={16} style={{ color: "#2a2a4a" }} className="shrink-0" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number e.g. 08012345678"
                required
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#2a2a4a]"
                style={{ color: "#f5ede8" }}
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 rounded-lg text-sm font-semibold shrink-0 transition-all"
                style={{
                  background: loading ? "#9c4010" : "#e8581a",
                  color: "white",
                  height: "36px",
                  border: "none",
                }}
              >
                {loading ? <Spinner /> : <Search size={14} />}
                <span className="hidden sm:inline">{loading ? "Checking…" : "Check"}</span>
              </button>
            </div>
          </form>

          {error && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{ background: "#130a0a", border: "1px solid #ef444435", color: "#ef4444" }}
            >
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center mt-16 space-y-3">
            <Spinner />
            <p className="text-sm" style={{ color: "#6b7280" }}>Scanning fraud database…</p>
          </div>
        )}

        {/* Results */}
        {!loading && result && verdict && (
          <div className="w-full max-w-xl mt-8 space-y-4">

            {/* Verdict hero card */}
            <div
              className="rounded-2xl p-6 space-y-5"
              style={{
                background: `radial-gradient(ellipse at top, ${verdict.glow}, transparent 70%), #0f0f1a`,
                border: `1px solid ${verdict.border}`,
              }}
            >
              {/* Top row */}
              <div className="flex items-center gap-5">
                <ScoreArc score={result.reputationScore} color={verdict.color} />
                <div className="flex-1 space-y-1.5">
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: verdict.bg, border: `1px solid ${verdict.border}`, color: verdict.color }}
                  >
                    <span style={{ color: verdict.color }}>{verdict.icon}</span>
                    {verdict.label}
                  </div>
                  <p className="text-base font-bold" style={{ color: "#f5ede8" }}>{verdict.headline}</p>
                  <p className="text-xs font-mono" style={{ color: "#6b7280" }}>{searched}</p>
                </div>
              </div>

              {/* Sub-message */}
              <p
                className="text-sm leading-relaxed pt-4"
                style={{ color: "#9ca3af", borderTop: `1px solid ${verdict.border}` }}
              >
                {verdict.sub}
              </p>

              {/* NaijaShield attribution */}
              <p className="text-xs" style={{ color: "#2a2a4a" }}>
                {result.message}
              </p>
            </div>

            {/* Incident stats */}
            {result.totalIncidents > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total",      value: result.totalIncidents,         color: "#f5ede8" },
                  { label: "Blocked",    value: result.blockedCount    ?? 0,   color: "#ef4444" },
                  { label: "Monitoring", value: result.monitoringCount ?? 0,   color: "#f59e0b" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl p-4 text-center space-y-1"
                    style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}
                  >
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs" style={{ color: "#6b7280" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Flagged classifications */}
            {result.classifications && result.classifications.length > 0 && (
              <div className="rounded-xl p-4 space-y-2.5" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
                <p className="text-xs font-semibold" style={{ color: "#6b7280" }}>Fraud types detected</p>
                <div className="flex flex-wrap gap-2">
                  {result.classifications.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: "#ef444412", border: "1px solid #ef444430", color: "#ef4444" }}
                    >
                      {CLASSIFICATION_LABEL[c] ?? c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recent incidents */}
            {result.recentIncidents && result.recentIncidents.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
                <div className="px-4 py-3" style={{ borderBottom: "1px solid #13131f" }}>
                  <p className="text-xs font-semibold" style={{ color: "#6b7280" }}>
                    Last {result.recentIncidents.length} recorded incident{result.recentIncidents.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {result.recentIncidents.map((inc, i) => (
                  <div
                    key={inc.id}
                    className="px-4 py-3 flex items-center gap-3"
                    style={{ borderTop: i > 0 ? "1px solid #13131f" : "none" }}
                  >
                    <span
                      className="shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-bold"
                      style={{
                        color: inc.riskScore >= 80 ? "#ef4444" : inc.riskScore >= 50 ? "#f59e0b" : "#10b981",
                        background: inc.riskScore >= 80 ? "#ef444415" : inc.riskScore >= 50 ? "#f59e0b15" : "#10b98115",
                      }}
                    >
                      {inc.riskScore}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: "#9ca3af" }}>
                        {CLASSIFICATION_LABEL[inc.classification] ?? inc.classification} · {inc.channel}
                      </p>
                      {inc.preview && (
                        <p className="text-xs truncate mt-0.5" style={{ color: "#6b7280" }}>{inc.preview}</p>
                      )}
                    </div>
                    <p className="text-xs shrink-0" style={{ color: "#2a2a4a" }}>
                      {formatRelative(inc.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Search another */}
            <button
              onClick={() => { setResult(null); setPhone(""); setSearched(""); }}
              className="w-full h-11 rounded-xl text-sm font-medium transition-all"
              style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#9ca3af" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2a4a")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
            >
              Check another number
            </button>
          </div>
        )}

        {/* Initial empty state */}
        {!loading && !result && !error && (
          <div className="w-full max-w-xl mt-10 grid grid-cols-3 gap-3">
            {[
              { label: "Database Entries", value: "1.2M+", color: "#e8581a" },
              { label: "Threats Intercepted", value: "98K+", color: "#ef4444" },
              { label: "Daily Queries", value: "24/7", color: "#10b981" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-4 text-center space-y-1"
                style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}
              >
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs" style={{ color: "#6b7280" }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer
        className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{ borderTop: "1px solid #13131f" }}
      >
        <p className="text-xs" style={{ color: "#2a2a4a" }}>
          © {new Date().getFullYear()} NaijaShield · CBN & NCC Compliant
        </p>
        <p className="text-xs" style={{ color: "#2a2a4a" }}>
          Data sourced from live telecom fraud intercepts
        </p>
      </footer>
    </div>
  );
}
