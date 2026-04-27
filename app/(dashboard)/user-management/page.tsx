import { users } from "@/lib/mock-data";

export default function UserManagementPage() {
  return (
    <div className="p-6 space-y-5 min-h-screen">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#f5ede8" }}>
          User Management
        </h1>
        <p className="text-xs" style={{ color: "#6b7280" }}>
          Access roles and analyst activity
        </p>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid #1a1a2e" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
              {["Name", "Email", "Role", "Status", "Last Active"].map((head) => (
                <th key={head} className="text-left px-5 py-3.5 text-sm font-semibold" style={{ color: "#9ca3af" }}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} style={{ borderBottom: index < users.length - 1 ? "1px solid #13131f" : "none" }}>
                <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "#f5ede8" }}>{user.name}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>{user.email}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>{user.role}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>{user.status}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "#9ca3af" }}>{user.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
