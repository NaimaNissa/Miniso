import { PageHeader } from "@/components/ui/page-header";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Pill } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

const staff = [
  { name: "Nusrat Jahan", role: "Store Manager", status: "Present", shift: "09:00–18:00" },
  { name: "Rafi Islam", role: "Cashier", status: "Present", shift: "09:00–17:00" },
  { name: "Sadia Noor", role: "Floor Associate", status: "Present", shift: "10:00–19:00" },
  { name: "Imtiaz Kabir", role: "Cashier", status: "Break", shift: "12:00–21:00" },
  { name: "Lamia Hasan", role: "Visual Merchandiser", status: "Absent", shift: "09:00–18:00" },
];

export default function WorkforcePage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Workforce"
        description="Attendance, shifts and store staffing"
        actions={<Button size="sm">Create roster</Button>}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        {[
          { label: "Present", value: "18" },
          { label: "Scheduled", value: "20" },
          { label: "On break", value: "2" },
          { label: "Absent", value: "1" },
        ].map((k) => (
          <GlassCard key={k.label} className="p-4">
            <p className="text-xs text-[var(--text-muted)]">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold">{k.value}</p>
          </GlassCard>
        ))}
      </div>

      <SurfaceCard className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--background-elevated)] text-xs text-[var(--text-muted)]">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Role</th>
              <th className="px-3 py-3 font-medium">Shift</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr
                key={s.name}
                className="border-t border-[var(--border)] hover:bg-[var(--background-elevated)]"
              >
                <td className="px-5 py-3.5 font-medium">{s.name}</td>
                <td className="px-3 py-3.5 text-[var(--text-secondary)]">
                  {s.role}
                </td>
                <td className="px-3 py-3.5 text-[var(--text-muted)]">
                  {s.shift}
                </td>
                <td className="px-5 py-3.5">
                  <Pill
                    tone={
                      s.status === "Present"
                        ? "success"
                        : s.status === "Break"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {s.status}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SurfaceCard>
    </div>
  );
}
