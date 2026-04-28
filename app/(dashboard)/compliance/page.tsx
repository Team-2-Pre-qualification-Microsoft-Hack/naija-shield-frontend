import { complianceReports } from "@/lib/mock-data";

export default function CompliancePage() {
  return (
    <div className="p-6 space-y-5 min-h-screen">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#f5ede8" }}>
          Compliance
        </h1>
        <p className="text-xs" style={{ color: "#6b7280" }}>
          Generated reports ready for regulator submission
        </p>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
              {["Report ID", "Generated", "Period", "Incidents", "Status"].map((head) => (
                <th key={head} className="text-left px-5 py-3.5 text-sm font-semibold" style={{ color: "#9ca3af" }}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {complianceReports.map((report, index) => (
              <tr key={report.id} style={{ borderBottom: index < complianceReports.length - 1 ? "1px solid #13131f" : "none" }}>
                <td className="px-5 py-3.5 text-sm font-mono font-medium" style={{ color: "#e8581a" }}>{report.id}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>{report.generated}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>{report.period}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>{report.incidents}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>{report.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
