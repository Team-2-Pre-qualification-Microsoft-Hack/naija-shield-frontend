"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings as SettingsIcon,
  FileText,
  Bell,
  Shield,
  Users,
  Clock,
  ChevronDown,
  Check,
} from "lucide-react";

/* ── Persisted settings shape ── */
type ReportScheduleSettings = {
  enabled: boolean;
  frequency: "hourly" | "6h" | "daily" | "weekly";
  agencyType: "CBN" | "NCC" | "GENERAL";
  maxIncidents: number;
  emailRecipients: string;
};

const DEFAULT_SCHEDULE: ReportScheduleSettings = {
  enabled: false,
  frequency: "daily",
  agencyType: "CBN",
  maxIncidents: 50,
  emailRecipients: "",
};

type NotificationSettings = {
  emailAlerts: boolean;
  inAppAlerts: boolean;
  escalationThreshold: number;
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailAlerts: true,
  inAppAlerts: true,
  escalationThreshold: 80,
};

const FREQ_LABELS: Record<string, string> = {
  hourly: "Every Hour",
  "6h": "Every 6 Hours",
  daily: "Daily",
  weekly: "Weekly",
};

/* ── Toggle component ── */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full group"
    >
      <span className="text-sm" style={{ color: "#f5ede8" }}>{label}</span>
      <div
        className="relative w-10 h-5.5 rounded-full transition-colors"
        style={{ background: checked ? "#e8581a" : "#1a1a2e" }}
      >
        <div
          className="absolute top-0.5 w-4.5 h-4.5 rounded-full transition-transform"
          style={{
            background: "#f5ede8",
            transform: checked ? "translateX(19px)" : "translateX(2px)",
          }}
        />
      </div>
    </button>
  );
}

/* ── Section wrapper ── */
function Section({ icon: Icon, title, subtitle, children }: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
      <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid #1a1a2e" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "#e8581a15", color: "#e8581a" }}
        >
          <Icon size={15} />
        </div>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "#f5ede8" }}>{title}</h2>
          <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{subtitle}</p>
        </div>
      </div>
      <div className="px-5 py-4 space-y-4">
        {children}
      </div>
    </section>
  );
}

/* ── Field wrapper ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium" style={{ color: "#6b7280" }}>{label}</label>
      {children}
    </div>
  );
}

/* ── Select input ── */
function SelectInput({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 rounded-lg text-sm outline-none appearance-none"
        style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#f5ede8", height: "40px" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#e8581a")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#13131f" }}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6b7280" }} />
    </div>
  );
}

/* ── Text input ── */
function TextInput({ value, onChange, placeholder, readOnly = false }: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      readOnly={readOnly}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      className="w-full rounded-lg px-3 py-2 text-sm outline-none"
      style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#f5ede8", opacity: readOnly ? 0.6 : 1 }}
      onFocus={(e) => { if (!readOnly) e.currentTarget.style.borderColor = "#e8581a"; }}
      onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
    />
  );
}

/* ══════════════════════════════════════════════
   SettingsPage
   ══════════════════════════════════════════════ */
export default function SettingsPage() {
  /* ── Report schedule state ── */
  const [schedule, setSchedule] = useState<ReportScheduleSettings>(DEFAULT_SCHEDULE);
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [saved, setSaved] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ns_report_settings");
      if (raw) setSchedule(JSON.parse(raw));
    } catch { /* use defaults */ }
    try {
      const raw = localStorage.getItem("ns_notification_settings");
      if (raw) setNotifications(JSON.parse(raw));
    } catch { /* use defaults */ }
  }, []);

  // Persist changes
  const save = useCallback(() => {
    localStorage.setItem("ns_report_settings", JSON.stringify(schedule));
    localStorage.setItem("ns_notification_settings", JSON.stringify(notifications));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [schedule, notifications]);

  function updateSchedule<K extends keyof ReportScheduleSettings>(key: K, value: ReportScheduleSettings[K]) {
    setSchedule((prev) => ({ ...prev, [key]: value }));
  }

  function updateNotifications<K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#f5ede8" }}>Settings</h1>
          <p className="text-xs" style={{ color: "#6b7280" }}>
            Platform configuration and report scheduling
          </p>
        </div>
        <button
          onClick={save}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: saved ? "#10b98118" : "#e8581a18",
            border: saved ? "1px solid #10b98140" : "1px solid #e8581a40",
            color: saved ? "#10b981" : "#e8581a",
          }}
        >
          {saved ? <Check size={14} /> : <SettingsIcon size={14} />}
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Report Scheduling ── */}
        <Section
          icon={FileText}
          title="Report Scheduling"
          subtitle="Configure automatic report generation"
        >
          <Toggle
            checked={schedule.enabled}
            onChange={(v) => updateSchedule("enabled", v)}
            label="Enable automatic reports"
          />

          <Field label="Frequency">
            <SelectInput
              value={schedule.frequency}
              onChange={(v) => updateSchedule("frequency", v as ReportScheduleSettings["frequency"])}
              options={Object.entries(FREQ_LABELS).map(([value, label]) => ({ value, label }))}
            />
          </Field>

          <Field label="Default report type">
            <SelectInput
              value={schedule.agencyType}
              onChange={(v) => updateSchedule("agencyType", v as ReportScheduleSettings["agencyType"])}
              options={[
                { value: "CBN", label: "CBN Fraud Incident Report" },
                { value: "NCC", label: "NCC Incident Disclosure Report" },
                { value: "GENERAL", label: "Internal Summary Report" },
              ]}
            />
          </Field>

          <Field label="Max incidents per report">
            <SelectInput
              value={String(schedule.maxIncidents)}
              onChange={(v) => updateSchedule("maxIncidents", Number(v))}
              options={[
                { value: "10", label: "10 incidents" },
                { value: "20", label: "20 incidents" },
                { value: "50", label: "50 incidents" },
                { value: "100", label: "100 incidents" },
              ]}
            />
          </Field>

          <Field label="Email recipients (comma-separated)">
            <TextInput
              value={schedule.emailRecipients}
              onChange={(v) => updateSchedule("emailRecipients", v)}
              placeholder="admin@naijashield.ng, compliance@mtn.ng"
            />
          </Field>

          {schedule.enabled && (
            <div className="rounded-lg px-3 py-2.5 flex items-center gap-2" style={{ background: "#e8581a10", border: "1px solid #e8581a20" }}>
              <Clock size={12} style={{ color: "#e8581a" }} />
              <span className="text-xs" style={{ color: "#e8581a" }}>
                Next report: {FREQ_LABELS[schedule.frequency]} · {schedule.agencyType} type
              </span>
            </div>
          )}
        </Section>

        {/* ── Notifications ── */}
        <Section
          icon={Bell}
          title="Notifications"
          subtitle="Alert preferences and escalation rules"
        >
          <Toggle
            checked={notifications.emailAlerts}
            onChange={(v) => updateNotifications("emailAlerts", v)}
            label="Email notifications"
          />

          <Toggle
            checked={notifications.inAppAlerts}
            onChange={(v) => updateNotifications("inAppAlerts", v)}
            label="In-app alerts"
          />

          <Field label="Escalation threshold (risk score)">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={notifications.escalationThreshold}
                onChange={(e) => updateNotifications("escalationThreshold", Number(e.target.value))}
                className="flex-1 accent-[#e8581a]"
              />
              <span
                className="text-sm font-bold w-10 text-right"
                style={{
                  color: notifications.escalationThreshold >= 80
                    ? "#ef4444"
                    : notifications.escalationThreshold >= 50
                    ? "#f59e0b"
                    : "#10b981",
                }}
              >
                {notifications.escalationThreshold}
              </span>
            </div>
            <p className="text-xs" style={{ color: "#6b7280" }}>
              Incidents above this score trigger immediate escalation
            </p>
          </Field>
        </Section>

        {/* ── Detection Engine ── */}
        <Section
          icon={Shield}
          title="Detection Engine"
          subtitle="Threat detection configuration"
        >
          <Field label="Risk threshold">
            <TextInput value="80" readOnly />
          </Field>
          <Field label="Webhook endpoint">
            <TextInput value="https://api.naijashield.local/hooks/incidents" readOnly />
          </Field>
          <p className="text-xs" style={{ color: "#6b7280" }}>
            Contact system admin to modify detection parameters.
          </p>
        </Section>

        {/* ── Identity & Access ── */}
        <Section
          icon={Users}
          title="Identity & Access"
          subtitle="Authentication and role management"
        >
          <Field label="Auth provider">
            <TextInput value="Microsoft Entra External ID" readOnly />
          </Field>
          <Field label="Default role">
            <TextInput value="SOC Analyst" readOnly />
          </Field>
          <p className="text-xs" style={{ color: "#6b7280" }}>
            Manage users and roles in the User Management page.
          </p>
        </Section>
      </div>
    </div>
  );
}
