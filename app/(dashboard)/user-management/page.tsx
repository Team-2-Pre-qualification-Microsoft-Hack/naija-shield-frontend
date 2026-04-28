"use client";

import { useState, useEffect } from "react";
import { AlertCircle, UserPlus, X } from "lucide-react";
import { users } from "@/lib/mock-data";
import { useAuth } from "@/context/auth-context";
import { apiPost } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

type InviteRole = "SOC_ANALYST" | "COMPLIANCE_OFFICER" | "SYSTEM_ADMIN";

type InviteForm = {
  name: string;
  email: string;
  role: InviteRole;
};

const ROLE_LABELS: Record<InviteRole, string> = {
  SOC_ANALYST: "SOC Analyst",
  COMPLIANCE_OFFICER: "Compliance Officer",
  SYSTEM_ADMIN: "System Admin",
};

const EMPTY_FORM: InviteForm = { name: "", email: "", role: "SOC_ANALYST" };

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "SYSTEM_ADMIN";

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<InviteForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 2000);
    return () => clearTimeout(t);
  }, [error]);

  function openModal() {
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setError("");
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await apiPost("/api/auth/invite", form);
      closeModal();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send invite.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-5 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#f5ede8" }}>
            User Management
          </h1>
          <p className="text-xs" style={{ color: "#6b7280" }}>
            Access roles and analyst activity
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: "#e8581a18", border: "1px solid #e8581a40", color: "#e8581a" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e8581a25")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#e8581a18")}
          >
            <UserPlus size={14} />
            Invite User
          </button>
        )}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
              {["Name", "Email", "Role", "Status", "Last Active"].map((head) => (
                <th key={head} className="text-left px-5 py-3.5 text-sm font-semibold" style={{ color: "#9ca3af" }}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} style={{ borderBottom: index < users.length - 1 ? "1px solid #13131f" : "none" }}>
                <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "#f5ede8" }}>{user.name}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>{user.email}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>{user.role}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>{user.status}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>{user.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="w-full max-w-md rounded-xl p-6 space-y-5"
            style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: "#f5ede8" }}>Invite a user</h2>
                <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>They will receive an email to set their password.</p>
              </div>
              <button
                onClick={closeModal}
                className="transition-colors"
                style={{ color: "#6b7280" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f5ede8")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{ background: "#130a0a", border: "1px solid #ef444440", color: "#ef4444" }}>
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs" style={{ color: "#6b7280" }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Emeka Okafor"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 rounded-lg text-sm outline-none transition-colors placeholder:text-[#2a2a4a]"
                  style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#f5ede8", height: "40px" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#e8581a")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs" style={{ color: "#6b7280" }}>Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="analyst@mtn.ng"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 rounded-lg text-sm outline-none transition-colors placeholder:text-[#2a2a4a]"
                  style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#f5ede8", height: "40px" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#e8581a")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs" style={{ color: "#6b7280" }}>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as InviteRole }))}
                  className="w-full px-3 rounded-lg text-sm outline-none"
                  style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#f5ede8", height: "40px" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#e8581a")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
                >
                  {(Object.keys(ROLE_LABELS) as InviteRole[]).map((r) => (
                    <option key={r} value={r} style={{ background: "#13131f" }}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 h-10 rounded-lg text-sm font-medium transition-all"
                  style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#6b7280" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2a4a")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: submitting ? "#9c4010" : "#e8581a", color: "white", border: "none" }}
                >
                  {submitting ? (
                    <>
                      <Spinner />
                      Sending…
                    </>
                  ) : (
                    "Send Invite"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
