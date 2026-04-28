"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  FileText,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Spinner } from "@/components/ui/spinner";

const navItems = [
  { href: "/overview", label: "Command Centre", icon: LayoutDashboard },
  { href: "/threat-feed", label: "Threat Feed", icon: Radio },
  { href: "/compliance", label: "Compliance", icon: FileText },
  { href: "/user-management", label: "User Management", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
  }

  return (
    <aside
      className="hidden md:flex md:flex-col md:w-56 h-screen sticky top-0"
      style={{ background: "#09090f", borderRight: "1px solid #1a1a2e" }}
    >
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: "1px solid #1a1a2e" }}
      >
        <Image
          src="/logo.svg"
          alt="NaijaShield logo"
          width={164}
          height={52}
          className="h-7 w-auto"
          priority
        />
        <span className="text-sm font-semibold" style={{ color: "#f5ede8" }}>
          NaijaShield
        </span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
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
          style={{ background: "#1a0b0b", border: "1px solid #ef444428", color: "#ef4444", opacity: loggingOut ? 0.7 : 1 }}
          onMouseEnter={(e) => { if (!loggingOut) { e.currentTarget.style.background = "#220d0d"; e.currentTarget.style.borderColor = "#ef444455"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#1a0b0b"; e.currentTarget.style.borderColor = "#ef444428"; }}
        >
          {loggingOut ? <Spinner className="h-3.75 w-3.75" /> : <LogOut size={15} />}
          {loggingOut ? "Signing out…" : "Log out"}
        </button>
      </div>
    </aside>
  );
}
