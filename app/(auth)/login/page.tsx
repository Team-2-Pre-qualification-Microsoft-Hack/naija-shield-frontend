import LoginForm from "@/components/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-around w-1/2 px-12 py-10"
        style={{ background: "linear-gradient(135deg, #0f0f1a 0%, #09090f 50%, #1e0e06 100%)" }}>
        
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.svg"
            alt="NaijaShield logo"
            width={180}
            height={56}
            className="h-8 w-auto"
            priority
          />
          <span className="text-lg font-semibold tracking-tight" style={{ color: "#f5ede8" }}>
            NaijaShield
          </span>
        </div>

        {/* Center content */}
        <div className="space-y-6">
          {/* Radar animation */}
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 200 200" className="w-full h-full opacity-20">
              <circle cx="100" cy="100" r="90" stroke="#e8581a" strokeWidth="0.5" fill="none" />
              <circle cx="100" cy="100" r="65" stroke="#e8581a" strokeWidth="0.5" fill="none" />
              <circle cx="100" cy="100" r="40" stroke="#e8581a" strokeWidth="0.5" fill="none" />
              <circle cx="100" cy="100" r="15" stroke="#e8581a" strokeWidth="0.5" fill="none" />
              <line x1="100" y1="10" x2="100" y2="190" stroke="#e8581a" strokeWidth="0.5" />
              <line x1="10" y1="100" x2="190" y2="100" stroke="#e8581a" strokeWidth="0.5" />
              <line x1="27" y1="27" x2="173" y2="173" stroke="#e8581a" strokeWidth="0.3" />
              <line x1="173" y1="27" x2="27" y2="173" stroke="#e8581a" strokeWidth="0.3" />
            </svg>
            {/* Blip dots */}
            <div className="absolute top-[30%] left-[60%] w-2 h-2 rounded-full animate-ping"
              style={{ background: "#ef4444" }} />
            <div className="absolute top-[55%] left-[35%] w-1.5 h-1.5 rounded-full animate-ping"
              style={{ background: "#f59e0b", animationDelay: "0.5s" }} />
            <div className="absolute top-[70%] left-[65%] w-1 h-1 rounded-full animate-ping"
              style={{ background: "#e8581a", animationDelay: "1s" }} />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight" style={{ color: "#f5ede8" }}>
              Trust, Safety &<br />Fraud Intelligence
            </h1>
            <p className="text-sm font-light leading-relaxed" style={{ color: "#9c7c6e" }}>
              Real-time threat interception across Nigerian telecom networks.
              Protecting millions — silently, automatically, continuously.
            </p>
          </div>

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-4 pt-4"
            style={{ borderTop: "1px solid #1a1a2e" }}>
            {[
              { label: "Threats Blocked", value: "1.2M+" },
              { label: "Networks Protected", value: "6" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-bold" style={{ color: "#e8581a" }}>
                  {stat.value}
                </p>
                <p className="text-xs font-light mt-0.5" style={{ color: "#9c7c6e" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs font-light" style={{ color: "#9c7c6e" }}>
          © 2025 NaijaShield. CBN & NCC Compliant Infrastructure.
        </p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8"
        style={{ background: "#09090f" }}>
        <LoginForm />
      </div>
    </main>
  );
}