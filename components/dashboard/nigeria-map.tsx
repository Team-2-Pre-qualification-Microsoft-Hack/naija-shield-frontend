"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { useHeatmap } from "@/lib/hooks";
import { CLASSIFICATION_LABEL, type HeatmapPoint } from "@/lib/types";

const GEO_URL = "/nigeria-states.json";

function weightColor(weight: number) {
  if (weight >= 80) return "#ef4444";
  if (weight >= 50) return "#f59e0b";
  if (weight >= 20) return "#e8581a";
  return "#10b981";
}

function stateFill(maxWeight: number) {
  if (maxWeight >= 80) return "#ef444418";
  if (maxWeight >= 50) return "#f59e0b12";
  if (maxWeight >= 20) return "#e8581a0e";
  return "#13131f";
}

function stateStroke(maxWeight: number) {
  if (maxWeight >= 80) return "#ef444435";
  if (maxWeight >= 50) return "#f59e0b28";
  if (maxWeight >= 20) return "#e8581a22";
  return "#1e1e30";
}

function buildStateMap(points: HeatmapPoint[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const p of points) {
    map[p.state] = Math.max(map[p.state] ?? 0, p.weight);
  }
  return map;
}

export function NigeriaMap() {
  const { data: heatmap, isLoading } = useHeatmap();
  const [tooltip, setTooltip] = useState<HeatmapPoint | null>(null);

  const points: HeatmapPoint[] = heatmap ?? [];
  const stateMaxWeight = buildStateMap(points);

  return (
    <div className="relative w-full h-80">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-xs" style={{ color: "#2a2a4a" }}>Loading map…</div>
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [8, 9], scale: 2100 }}
        width={900}
        height={320}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => {
              const name: string = geo.properties.name ?? "";
              const maxW = stateMaxWeight[name] ?? 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={stateFill(maxW)}
                  stroke={stateStroke(maxW)}
                  strokeWidth={0.6}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#1e1e30", outline: "none", cursor: "default" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {points.map((point) => {
          const color = weightColor(point.weight);
          const r = 2.5 + (point.weight / 100) * 4;
          return (
            <Marker key={point.id} coordinates={[point.lng, point.lat]}>
              <g
                onMouseEnter={() => setTooltip(point)}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: "pointer" }}
              >
                <circle r={r + 7} fill={color} opacity={0.06} />
                <circle r={r + 3} fill={color} opacity={0.14} />
                <circle r={r} fill={color} opacity={0.5} />
                <circle r={2} fill={color} />
              </g>
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute left-3 top-3 rounded-lg px-3 py-2.5 space-y-1 pointer-events-none"
          style={{ background: "#0a0a14", border: "1px solid #1a1a2e", minWidth: 160 }}
        >
          <p className="text-xs font-semibold" style={{ color: weightColor(tooltip.weight) }}>
            {tooltip.state} · {tooltip.lga}
          </p>
          <p className="text-[10px]" style={{ color: "#9ca3af" }}>
            {CLASSIFICATION_LABEL[tooltip.classification]}
          </p>
          <div className="flex items-center gap-2 text-[10px]" style={{ color: "#6b7280" }}>
            <span>{tooltip.channel}</span>
            <span>·</span>
            <span>{tooltip.status}</span>
            <span>·</span>
            <span style={{ color: weightColor(tooltip.weight) }}>Risk {tooltip.weight}</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        className="absolute right-3 bottom-3 flex items-center gap-3 rounded-md px-2.5 py-1.5"
        style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}
      >
        {[
          { label: "High ≥80",  color: "#ef4444" },
          { label: "Med ≥50",   color: "#f59e0b" },
          { label: "Low ≥20",   color: "#e8581a" },
          { label: "Safe",      color: "#10b981" },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1 text-[10px]" style={{ color: "#6b7280" }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>

      {/* Live count */}
      {points.length > 0 && (
        <div
          className="absolute left-3 bottom-3 rounded-md px-2.5 py-1.5 text-[10px]"
          style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", color: "#6b7280" }}
        >
          {points.length} active intercepts
        </div>
      )}
    </div>
  );
}
