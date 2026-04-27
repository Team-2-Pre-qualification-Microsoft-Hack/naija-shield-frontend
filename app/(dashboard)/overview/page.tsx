import Link from "next/link";
import {
  kpiData,
  nigeriaHotspots,
  threatFeedData,
  threatVelocity,
} from "@/lib/mock-data";

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

function TrendChart() {
  const width = 520;
  const height = 220;
  const padding = 22;
  const values = threatVelocity.flatMap((point) => [point.sms, point.voice]);
  const maxValue = Math.max(...values);

  const mapPoint = (value: number, index: number, size: number) => {
    const x = padding + (index / (size - 1)) * (width - padding * 2);
    const y = height - padding - (value / maxValue) * (height - padding * 2);
    return { x, y };
  };

  const smsPath = threatVelocity
    .map((point, index) => {
      const { x, y } = mapPoint(point.sms, index, threatVelocity.length);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  const voicePath = threatVelocity
    .map((point, index) => {
      const { x, y } = mapPoint(point.voice, index, threatVelocity.length);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-55" fill="none">
        {[0.25, 0.5, 0.75].map((factor) => {
          const y = height - padding - factor * (height - padding * 2);
          return <line key={factor} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1a1a2e" strokeWidth="1" />;
        })}
        <path d={smsPath} stroke="#e8581a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={voicePath} stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex items-center justify-between text-[10px]" style={{ color: "#2a2a4a" }}>
        {threatVelocity.map((point) => (
          <span key={point.hour}>{point.hour}</span>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs" style={{ color: "#6b7280" }}>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5" style={{ background: "#e8581a" }} /> SMS</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5" style={{ background: "#3b82f6" }} /> Voice</span>
      </div>
    </div>
  );
}

function ThreatMap() {
  const colorFor = (intensity: number) => {
    if (intensity >= 80) {
      return "#ef4444";
    }
    if (intensity >= 50) {
      return "#f59e0b";
    }
    return "#e8581a";
  };

  return (
    <div className="relative w-full h-70">
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        <path
          d="M24 12 L36 10 L52 12 L67 15 L76 22 L79 34 L74 47 L73 57 L69 68 L60 77 L50 82 L43 89 L35 85 L28 78 L23 69 L18 59 L15 48 L14 37 L18 24 Z"
          fill="#13131f"
          stroke="#1a1a2e"
          strokeWidth="0.7"
        />

        {nigeriaHotspots.map((spot) => {
          const color = colorFor(spot.intensity);
          const r = 1.2 + spot.intensity / 35;
          return (
            <g key={spot.city}>
              <circle cx={spot.x} cy={spot.y} r={r + 1.5} fill={color} opacity="0.15" />
              <circle cx={spot.x} cy={spot.y} r={r} fill={color} opacity="0.35" />
              <circle cx={spot.x} cy={spot.y} r="0.8" fill={color} />
            </g>
          );
        })}
      </svg>

      <div className="absolute right-3 bottom-3 rounded-md px-2 py-1 text-[10px]" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", color: "#6b7280" }}>
        Cell-tower cluster view
      </div>
    </div>
  );
}

export default function OverviewPage() {
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
        {kpiData.map((item) => (
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
            <p
              className="text-[13px] font-light"
              style={{ color: item.delta.startsWith("+") ? "#10b981" : "#f59e0b" }}
            >
              {item.delta} vs yesterday
            </p>
          </div>
        ))}
      </div>

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
          <ThreatMap />
        </div>

        <div className="xl:col-span-2 rounded-xl p-5" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
          <div className="mb-3">
            <h2 className="text-sm font-semibold" style={{ color: "#f5ede8" }}>
              Threat Velocity
            </h2>
            <p className="text-xs" style={{ color: "#6b7280" }}>
              Intercepts per interval (mock stream)
            </p>
          </div>
          <TrendChart />
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
                {[
                  "ID",
                  "Time",
                  "Channel",
                  "Preview",
                  "Risk",
                  "Status",
                ].map((h) => (
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
              {threatFeedData.map((row, i) => (
                <tr
                  key={row.id}
                  style={{ borderBottom: i < threatFeedData.length - 1 ? "1px solid #13131f" : "none" }}
                >
                  <td className="px-5 py-3.5 text-sm font-mono font-medium" style={{ color: "#e8581a" }}>
                    {row.id}
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>
                    {row.time}
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>
                    {row.channel}
                  </td>
                  <td className="px-5 py-3.5 text-sm max-w-xs truncate" style={{ color: "#9ca3af" }}>
                    {row.preview}
                  </td>
                  <td className="px-5 py-3.5">
                    <RiskPill score={row.risk} />
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>
                    {row.status}
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
