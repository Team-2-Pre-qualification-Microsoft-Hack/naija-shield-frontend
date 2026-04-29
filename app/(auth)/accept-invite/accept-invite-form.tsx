"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";


const ERROR_MAP: Record<string, string> = {
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match.",
  INVALID_INVITE: "This invite link is invalid, already used, or has expired.",
};

export function AcceptInviteForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Auto-dismiss error after 2 s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 2000);
    return () => clearTimeout(t);
  }, [error]);

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  if (!token) {
    return (
      <div className="w-full max-w-sm space-y-5 text-center">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full mx-auto"
          style={{ background: "#1a0b0b", border: "1px solid #ef444430" }}
        >
          <AlertCircle size={20} style={{ color: "#ef4444" }} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold" style={{ color: "#f5ede8" }}>Invalid invite link</p>
          <p className="text-xs" style={{ color: "#6b7280" }}>
            This link is missing a token. Contact your system administrator.
          </p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiPost("/api/auth/invite/accept", {
        inviteToken: token,
        password,
        confirmPassword,
      });
      router.push("/login?activated=1");
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Something went wrong.";
      setError(ERROR_MAP[raw] ?? raw);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-8">

      {/* Mobile logo */}
      <div className="flex lg:hidden items-center gap-2 mb-2">
        <Image src="/logo.svg" alt="NaijaShield logo" width={150} height={46} className="h-7 w-auto" priority />
        <span className="font-semibold" style={{ color: "#f5ede8" }}>NaijaShield</span>
      </div>

      {/* Header */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold" style={{ color: "#f5ede8" }}>Set your password</h2>
        <p className="text-sm" style={{ color: "#6b7280" }}>
          Create a password to activate your NaijaShield account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Error banner */}
        {error && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
            style={{ background: "#0f0f1a", border: "1px solid #ef444440", color: "#ef4444" }}
          >
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" style={{ color: "#6b7280", fontSize: "13px" }}>
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 rounded-lg text-sm outline-none transition-colors placeholder:text-[#2a2a4a]"
              style={{
                background: "#0f0f1a",
                border: "1px solid #1a1a2e",
                color: "#f5ede8",
                height: "44px",
                paddingRight: "44px",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#e8581a")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "#6b7280" }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirm" style={{ color: "#6b7280", fontSize: "13px" }}>
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 rounded-lg text-sm outline-none transition-colors placeholder:text-[#2a2a4a]"
              style={{
                background: "#0f0f1a",
                border: `1px solid ${passwordMismatch ? "#ef444460" : "#1a1a2e"}`,
                color: "#f5ede8",
                height: "44px",
                paddingRight: "44px",
              }}
              onFocus={(e) => { if (!passwordMismatch) e.currentTarget.style.borderColor = "#e8581a"; }}
              onBlur={(e) => { if (!passwordMismatch) e.currentTarget.style.borderColor = "#1a1a2e"; }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "#6b7280" }}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {passwordMismatch && (
            <p className="text-xs" style={{ color: "#ef4444" }}>Passwords do not match</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || passwordMismatch}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-lg font-semibold text-sm transition-all"
          style={{
            background: loading || passwordMismatch ? "#9c4010" : "#e8581a",
            color: "white",
            border: "none",
            opacity: passwordMismatch ? 0.6 : 1,
          }}
        >
          {loading ? (
            <>
              <Spinner />
              Activating account…
            </>
          ) : (
            "Activate Account"
          )}
        </button>
      </form>

      <p className="text-center text-xs" style={{ color: "#2a2a4a" }}>
        Access is by invitation only.{" "}
        <span style={{ color: "#6b7280" }}>Contact your system administrator.</span>
      </p>
    </div>
  );
}
