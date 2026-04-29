export type IncidentChannel = "SMS" | "Voice" | "WhatsApp";
export type IncidentClassification =
  | "OTP_PHISH"
  | "VISHING"
  | "SOCIAL_ENGINEERING"
  | "IMPERSONATION"
  | "SAFE";
export type IncidentStatus = "Blocked" | "Monitoring" | "Allowed";
export type UserRole = "SOC_ANALYST" | "COMPLIANCE_OFFICER" | "SYSTEM_ADMIN";

export type ApiIncident = {
  id: string;
  from: string;
  channel: IncidentChannel;
  preview: string;
  transcript?: string;
  classification: IncidentClassification;
  riskScore: number;
  status: IncidentStatus;
  explanation: string;
  timestamp: string;
  state: string | null;
  lga: string | null;
  deepfakeScore: number | null;
};

export type IncidentsResponse = {
  items: ApiIncident[];
  total: number;
};

export type StatsResponse = {
  total: number;
  blocked: number;
  monitoring: number;
  allowed: number;
  avgRisk: number;
  byChannel: { channel: string; count: number }[];
  byState: { state: string; count: number }[];
};

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  organisation: string;
  lastActive: string;
  createdAt: string;
  invitePending: boolean;
};

export type UsersResponse = {
  total: number;
  users: ApiUser[];
};

export const CLASSIFICATION_LABEL: Record<IncidentClassification, string> = {
  OTP_PHISH: "OTP Phishing",
  VISHING: "Vishing",
  SOCIAL_ENGINEERING: "Social Engineering",
  IMPERSONATION: "Impersonation",
  SAFE: "Legitimate",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  SOC_ANALYST: "SOC Analyst",
  COMPLIANCE_OFFICER: "Compliance Officer",
  SYSTEM_ADMIN: "System Admin",
};

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

export function formatRelative(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } catch {
    return iso;
  }
}

export function statusLabel(status: IncidentStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}
