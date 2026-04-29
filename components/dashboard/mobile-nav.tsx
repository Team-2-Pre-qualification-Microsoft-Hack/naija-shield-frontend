"use client";

import { useState, type ElementType } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Radio,
  FileText,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Spinner } from "@/components/ui/spinner";
import type { UserRole } from "@/lib/auth";

const navItems: { href: string; label: string; icon: ElementType; roles: UserRole[] }[] = [
  { href: "/overview",        label: "Command Centre",  icon: LayoutDashboard, roles: ["SOC_ANALYST", "COMPLIANCE_OFFICER", "SYSTEM_ADMIN"] },
  { href: "/threat-feed",     label: "Threat Feed",     icon: Radio,           roles: ["SOC_ANALYST", "SYSTEM_ADMIN"] },
  { href: "/compliance",      label: "Compliance",      icon: FileText,        roles: ["COMPLIANCE_OFFICER", "SYSTEM_ADMIN"] },
  { href: "/user-management", label: "User Management", icon: Users,           roles: ["SYSTEM_ADMIN"] },
  { href: "/settings",        label: "Settings",        icon: Settings,        roles: ["SYSTEM_ADMIN"] },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
  }

  return (
    <>
      {/* Sticky top header */}
      <header
        className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ background: "#09090f", borderBottom: "1px solid #1a1a2e" }}
      >
        <Link href="/overview" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="NaijaShield" width={120} height={38} className="h-6 w-auto" priority />
          <span className="text-sm font-semibold" style={{ color: "#f5ede8" }}>NaijaShield</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
          style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#9ca3af" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2a2a4a")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      </header>

      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(0,0,0,0.65)" }}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "#09090f", borderRight: "1px solid #1a1a2e" }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-4 py-5"
          style={{ borderBottom: "1px solid #1a1a2e" }}
        >
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="NaijaShield" width={140} height={44} className="h-7 w-auto" priority />
            <span className="text-sm font-semibold" style={{ color: "#f5ede8" }}>NaijaShield</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: "#6b7280" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f5ede8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.filter((item) => !user || item.roles.includes(user.role)).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors"
                style={{
                  background: active ? "#e8581a18" : "transparent",
                  color: active ? "#e8581a" : "#6b7280",
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="px-2 py-4 space-y-2" style={{ borderTop: "1px solid #1a1a2e" }}>
          {user && (
            <div className="px-3 py-2.5 rounded-lg" style={{ background: "#0f0f1a" }}>
              <p className="text-xs font-semibold truncate" style={{ color: "#f5ede8" }}>{user.name}</p>
              <p className="text-[11px] truncate mt-0.5" style={{ color: "#6b7280" }}>{user.email}</p>
              <span
                className="inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: "#e8581a15", color: "#e8581a" }}
              >
                {user.role.replace(/_/g, " ")}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: "#1a0b0b",
              border: "1px solid #ef444428",
              color: "#ef4444",
              opacity: loggingOut ? 0.7 : 1,
            }}
            onMouseEnter={(e) => { if (!loggingOut) { e.currentTarget.style.background = "#220d0d"; e.currentTarget.style.borderColor = "#ef444455"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#1a0b0b"; e.currentTarget.style.borderColor = "#ef444428"; }}
          >
            {loggingOut ? <Spinner className="h-3.75 w-3.75" /> : <LogOut size={15} />}
            {loggingOut ? "Signing out…" : "Log out"}
          </button>
        </div>
      </div>
    </>
  );
}
