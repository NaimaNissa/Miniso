import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard, GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { storeOperations } from "@/lib/data";
import { Check, AlertTriangle, Circle } from "lucide-react";

export default function OperationsPage() {
  const sections = [
    {
      title: "Opening",
      description: "Attendance, POS, cash float, checklist, equipment",
      items: storeOperations.opening,
    },
    {
      title: "During day",
      description: "Replenishment, tasks, customers, counts, maintenance",
      items: storeOperations.during,
    },
    {
      title: "Closing",
      description: "Cash recon, POS close, refunds, exceptions, summary",
      items: storeOperations.closing,
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Store Operations"
        description="Dhanmondi Store · daily workflow timeline"
        actions={<Button size="sm">Start shift checklist</Button>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Checklist progress", value: "62%" },
          { label: "Open incidents", value: "2" },
          { label: "Tasks overdue", value: "1" },
        ].map((k) => (
          <GlassCard key={k.label} className="p-4">
            <p className="text-xs text-[var(--text-muted)]">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold">{k.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="space-y-4">
        {sections.map((section, si) => (
          <SurfaceCard key={section.title} className="p-5">
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                {si + 1}
              </span>
              <div>
                <h2 className="font-semibold">{section.title}</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {section.description}
                </p>
              </div>
            </div>
            <ul className="space-y-2">
              {section.items.map((item) => {
                const warn = "warn" in item && item.warn;
                return (
                  <li
                    key={item.label}
                    className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5 text-sm">
                      {item.done ? (
                        <Check className="h-4 w-4 text-[var(--success)]" />
                      ) : warn ? (
                        <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
                      ) : (
                        <Circle className="h-4 w-4 text-[var(--text-muted)]" />
                      )}
                      {item.label}
                    </div>
                    {!item.done && (
                      <Button size="sm" variant="secondary">
                        Complete
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
