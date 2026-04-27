"use client";

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

const navItems = [
  { href: "/overview", label: "Command Centre", icon: LayoutDashboard },
  { href: "/threat-feed", label: "Threat Feed", icon: Radio },
  { href: "/compliance", label: "Compliance", icon: FileText },
  { href: "/user-management", label: "User Management", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

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

      <div className="px-2 py-4" style={{ borderTop: "1px solid #1a1a2e" }}>
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
          style={{ background: "#13131f", color: "#6b7280" }}
        >
          <LogOut size={16} />
          Log out
        </Link>
      </div>
    </aside>
  );
}
