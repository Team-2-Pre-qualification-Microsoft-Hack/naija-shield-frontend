import useSWR from "swr";
import { apiGet } from "./api";
import type { IncidentsResponse, StatsResponse, UsersResponse, HeatmapPoint, ReportsListResponse } from "./types";

export function useIncidents(limit = 50) {
  return useSWR<IncidentsResponse>(
    `/api/incidents?limit=${limit}`,
    (url: string) => apiGet<IncidentsResponse>(url),
    { refreshInterval: 30_000 }
  );
}

export function useIncidentStats() {
  return useSWR<StatsResponse>(
    "/api/incidents/stats",
    (url: string) => apiGet<StatsResponse>(url),
    { refreshInterval: 60_000 }
  );
}

export function useUsers() {
  return useSWR<UsersResponse>(
    "/api/auth/users",
    (url: string) => apiGet<UsersResponse>(url)
  );
}

export function useHeatmap() {
  return useSWR<HeatmapPoint[]>(
    "/api/incidents/heatmap",
    (url: string) => apiGet<HeatmapPoint[]>(url),
    { refreshInterval: 60_000 }
  );
}

export function useReports(limit = 20) {
  return useSWR<ReportsListResponse>(
    `/api/reports?limit=${limit}`,
    (url: string) => apiGet<ReportsListResponse>(url)
  );
}
