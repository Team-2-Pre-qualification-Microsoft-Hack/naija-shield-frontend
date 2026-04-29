"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export default function LoginForm({ activated = false }: { activated?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 2000);
    return () => clearTimeout(t);
  }, [error]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/overview");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-8">

      {/* Mobile logo */}
      <div className="flex lg:hidden items-center gap-2 mb-2">
        <Image
          src="/logo.svg"
          alt="NaijaShield logo"
          width={150}
          height={46}
          className="h-7 w-auto"
          priority
        />
        <span className="font-semibold" style={{ color: "#f5ede8" }}>
          NaijaShield
        </span>
      </div>

      {/* Header */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold" style={{ color: "#f5ede8" }}>
          Welcome back
        </h2>
        <p className="text-sm" style={{ color: "#6b7280" }}>
          Sign in to your operations dashboard
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">

        {/* Activation success */}
        {activated && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
            style={{ background: "#061a0f", border: "1px solid #10b98140", color: "#10b981" }}>
            <CheckCircle2 size={14} className="shrink-0" />
            Account activated! Sign in to continue.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
            style={{ background: "#0f0f1a", border: "1px solid #ef444440", color: "#ef4444" }}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" style={{ color: "#6b7280", fontSize: "13px" }}>
            Work Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="analyst@mtn.ng"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              background: "#0f0f1a",
              border: "1px solid #1a1a2e",
              color: "#f5ede8",
              height: "44px",
              fontSize: "14px",
            }}
            className="placeholder:text-[#2a2a4a] focus:border-[#e8581a] transition-colors"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" style={{ color: "#6b7280", fontSize: "13px" }}>
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                background: "#0f0f1a",
                border: "1px solid #1a1a2e",
                color: "#f5ede8",
                height: "44px",
                fontSize: "14px",
                paddingRight: "44px",
              }}
              className="placeholder:text-[#2a2a4a] focus:border-[#e8581a] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "#6b7280" }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs transition-colors"
              style={{ color: "#6b7280" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#e8581a")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
            >
              Forgot password?
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 font-semibold text-sm transition-all"
          style={{
            background: loading ? "#9c4010" : "#e8581a",
            color: "white",
            border: "none",
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Authenticating...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "#1a1a2e" }} />
        <span className="text-xs" style={{ color: "#2a2a4a" }}>OR</span>
        <div className="flex-1 h-px" style={{ background: "#1a1a2e" }} />
      </div>

      {/* Microsoft SSO */}
      <button
        type="button"
        className="w-full h-11 flex items-center justify-center gap-3 rounded-lg text-sm font-medium transition-all"
        style={{
          background: "#0f0f1a",
          border: "1px solid #1a1a2e",
          color: "#f5ede8",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#e8581a")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
      >
        {/* Microsoft logo */}
        <svg width="18" height="18" viewBox="0 0 21 21">
          <rect x="1" y="1" width="9" height="9" fill="#f25022" />
          <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
          <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
          <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </svg>
        Continue with Microsoft
      </button>

      {/* Footer note */}
      <p className="text-center text-xs" style={{ color: "#2a2a4a" }}>
        Access is by invitation only.{" "}
        <span style={{ color: "#6b7280" }}>Contact your system administrator.</span>
      </p>
    </div>
  );
}