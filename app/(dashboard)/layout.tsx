import Sidebar from "@/components/dashboard/sidebar";
import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ background: "#09090f" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div
          className="md:hidden flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid #1a1a2e", background: "#09090f" }}
        >
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="NaijaShield logo"
              width={150}
              height={46}
              className="h-6 w-auto"
              priority
            />
            <span className="text-sm font-semibold" style={{ color: "#f5ede8" }}>
              NaijaShield
            </span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs"
            style={{ background: "#13131f", color: "#6b7280" }}
          >
            <LogOut size={14} />
            Log out
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
