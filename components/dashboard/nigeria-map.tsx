"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { nigeriaHotspots, nigeriaStateThreat } from "@/lib/mock-data";

const GEO_URL = "/nigeria-states.json";

type HotspotTooltip = {
  city: string;
  count: number;
  intensity: number;
};

function colorForIntensity(intensity: number) {
  if (intensity >= 80) return "#ef4444";
  if (intensity >= 50) return "#f59e0b";
  return "#e8581a";
}

function stateFill(stateName: string) {
  const intensity = nigeriaStateThreat[stateName];
  if (!intensity) return "#13131f";
  if (intensity >= 80) return "#ef444414";
  if (intensity >= 50) return "#f59e0b10";
  if (intensity >= 20) return "#e8581a0c";
  return "#13131f";
}

function stateStroke(stateName: string) {
  const intensity = nigeriaStateThreat[stateName];
  if (!intensity) return "#1e1e30";
  if (intensity >= 80) return "#ef444430";
  if (intensity >= 50) return "#f59e0b25";
  return "#e8581a20";
}

export function NigeriaMap() {
  const [tooltip, setTooltip] = useState<HotspotTooltip | null>(null);

  return (
    <div className="relative w-full h-80">
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
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={stateFill(name)}
                  stroke={stateStroke(name)}
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

        {nigeriaHotspots.map((spot) => {
          const color = colorForIntensity(spot.intensity);
          const r = 3.5 + spot.intensity / 28;
          return (
            <Marker
              key={spot.city}
              coordinates={[spot.lng, spot.lat]}
            >
              <g
                onMouseEnter={() =>
                  setTooltip({ city: spot.city, count: spot.count, intensity: spot.intensity })
                }
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: "pointer" }}
              >
                <circle r={r + 6} fill={color} opacity={0.07} />
                <circle r={r + 3} fill={color} opacity={0.15} />
                <circle r={r} fill={color} opacity={0.45} />
                <circle r={2} fill={color} />
              </g>
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="absolute left-3 top-3 rounded-lg px-3 py-2 space-y-0.5 pointer-events-none"
          style={{ background: "#0a0a14", border: "1px solid #1a1a2e" }}
        >
          <p className="text-xs font-semibold" style={{ color: colorForIntensity(tooltip.intensity) }}>
            {tooltip.city}
          </p>
          <p className="text-[10px]" style={{ color: "#6b7280" }}>
            {tooltip.count.toLocaleString()} intercepts · risk {tooltip.intensity}
          </p>
        </div>
      )}

      {/* Legend */}
      <div
        className="absolute right-3 bottom-3 flex items-center gap-3 rounded-md px-2.5 py-1.5"
        style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}
      >
        {[
          { label: "High", color: "#ef4444" },
          { label: "Med",  color: "#f59e0b" },
          { label: "Low",  color: "#e8581a" },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1 text-[10px]" style={{ color: "#6b7280" }}>
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: color }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
