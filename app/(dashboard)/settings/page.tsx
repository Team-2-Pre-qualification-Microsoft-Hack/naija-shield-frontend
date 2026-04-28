export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#f5ede8" }}>
          Settings
        </h1>
        <p className="text-xs" style={{ color: "#6b7280" }}>
          Integration-ready configuration placeholders
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-xl p-5 space-y-4" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
          <h2 className="text-sm font-semibold" style={{ color: "#f5ede8" }}>
            Detection Engine
          </h2>
          <div className="space-y-2">
            <label className="text-xs" style={{ color: "#6b7280" }}>Risk threshold</label>
            <input
              readOnly
              value="80"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#f5ede8" }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs" style={{ color: "#6b7280" }}>Webhook endpoint</label>
            <input
              readOnly
              value="https://api.naijashield.local/hooks/incidents"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#f5ede8" }}
            />
          </div>
        </section>

        <section className="rounded-xl p-5 space-y-4" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
          <h2 className="text-sm font-semibold" style={{ color: "#f5ede8" }}>
            Identity & Access
          </h2>
          <div className="space-y-2">
            <label className="text-xs" style={{ color: "#6b7280" }}>Auth provider</label>
            <input
              readOnly
              value="Microsoft Entra External ID"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#f5ede8" }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs" style={{ color: "#6b7280" }}>Default role</label>
            <input
              readOnly
              value="SOC Analyst"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{ background: "#13131f", border: "1px solid #1a1a2e", color: "#f5ede8" }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
