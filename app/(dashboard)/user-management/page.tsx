"use client";

import { useState, useEffect } from "react";
import { AlertCircle, UserPlus, X, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { apiPost, apiDelete } from "@/lib/api";
import { friendlyError } from "@/lib/errors";
import { Spinner } from "@/components/ui/spinner";
import { useUsers } from "@/lib/hooks";
import { ROLE_LABEL, formatRelative, type UserRole } from "@/lib/types";

type InviteRole = UserRole;

type InviteForm = {
  name: string;
  email: string;
  role: InviteRole;
};

const EMPTY_FORM: InviteForm = { name: "", email: "", role: "SOC_ANALYST" };

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <tr key={i} style={{ borderBottom: "1px solid #13131f" }}>
          {[120, 160, 100, 60, 80].map((w, j) => (
            <td key={j} className="px-5 py-3.5">
              <div className="h-3 rounded animate-pulse" style={{ width: w, background: "#1a1a2e" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "SYSTEM_ADMIN";

  const { data, isLoading, error: fetchError, mutate } = useUsers();
  const userList = data?.users ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<InviteForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 4000);
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

  async function handleInvite(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await apiPost("/api/auth/invite", form);
      mutate();
      closeModal();
    } catch (err: unknown) {
      setError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/auth/users/${deleteTarget.id}`);
      mutate();
      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(friendlyError(err));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
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

      {fetchError && (
        <p className="text-sm" style={{ color: "#ef4444" }}>
          Failed to load users. Please refresh.
        </p>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 650 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
                {["Name", "Email", "Role", "Status", "Last Active", ...(isAdmin ? [""] : [])].map((head) => (
                  <th
                    key={head || "actions"}
                    className="text-left px-5 py-3.5 text-sm font-semibold"
                    style={{ color: "#9ca3af" }}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton />
              ) : (
                userList.map((user, index) => (
                  <tr
                    key={user.id}
                    style={{ borderBottom: index < userList.length - 1 ? "1px solid #13131f" : "none" }}
                  >
                    <td className="px-5 py-3.5 text-sm font-medium whitespace-nowrap" style={{ color: "#f5ede8" }}>
                      {user.name}
                    </td>
                    <td className="px-5 py-3.5 text-sm whitespace-nowrap" style={{ color: "#9ca3af" }}>
                      {user.email}
                    </td>
                    <td className="px-5 py-3.5 text-sm whitespace-nowrap" style={{ color: "#9ca3af" }}>
                      {ROLE_LABEL[user.role]}
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      {user.invitePending ? (
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{ color: "#f59e0b", background: "#f59e0b15" }}
                        >
                          Invite Pending
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{ color: "#10b981", background: "#10b98115" }}
                        >
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm whitespace-nowrap" style={{ color: "#9ca3af" }}>
                      {formatRelative(user.lastActive)}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        {user.id !== currentUser?.id ? (
                          <button
                            onClick={() => setDeleteTarget({ id: user.id, name: user.name })}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all"
                            style={{ background: "#ef444410", border: "1px solid #ef444420", color: "#ef4444" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#ef444420"; e.currentTarget.style.borderColor = "#ef444440"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#ef444410"; e.currentTarget.style.borderColor = "#ef444420"; }}
                          >
                            <Trash2 size={11} />
                            Remove
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: "#2a2a4a" }}>You</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                  They will receive an email to set their password.
                </p>
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
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{ background: "#130a0a", border: "1px solid #ef444440", color: "#ef4444" }}
              >
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
                  {(Object.keys(ROLE_LABEL) as InviteRole[]).map((r) => (
                    <option key={r} value={r} style={{ background: "#13131f" }}>
                      {ROLE_LABEL[r]}
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
        >
          <div
            className="w-full max-w-sm rounded-xl p-6 space-y-4 animate-fade-up"
            style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "#ef444415" }}
              >
                <Trash2 size={18} style={{ color: "#ef4444" }} />
              </div>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: "#f5ede8" }}>Remove User</h2>
                <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-sm" style={{ color: "#9ca3af" }}>
              Are you sure you want to remove <span style={{ color: "#f5ede8" }} className="font-semibold">{deleteTarget.name}</span> from NaijaShield?
            </p>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-10 rounded-lg text-sm font-medium"
                style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#6b7280" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2a4a")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold"
                style={{ background: deleting ? "#991b1b" : "#ef4444", color: "white", border: "none" }}
              >
                {deleting ? (
                  <>
                    <Spinner />
                    Removing...
                  </>
                ) : (
                  "Remove User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
