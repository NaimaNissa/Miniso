import { PageHeader } from "@/components/ui/page-header";
import { GlassCard, SurfaceCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/status-badge";
import { Sparkles } from "lucide-react";

const insights = [
  {
    title: "Sanrio plush stockout risk",
    summary:
      "12 stores at high risk within 7 days. Recommend Gulshan → Dhanmondi transfer of 24 units.",
    confidence: 94,
    action: "Review transfer",
  },
  {
    title: "Gel Pen Set replenishment",
    summary:
      "Network cover at 2 days. Inbound ASN delayed; propose emergency PO or DC reserve release.",
    confidence: 88,
    action: "Open replenishment",
  },
  {
    title: "Slow mover — Ceramic Mug Set",
    summary:
      "Sell-through 28% in Agrabad. Suggest markdown test or cluster transfer to Gulshan.",
    confidence: 81,
    action: "View recommendation",
  },
];

export default function AIPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="AI Insights"
        description="Forecasting, replenishment and risk — AI recommends, humans approve"
      />

      <GlassCard className="mb-6 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Retail AI control principle</h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
              Every recommendation includes what was found, why, data freshness,
              confidence, and the exact action that will occur if approved. AI
              never silently changes inventory, price, or supplier commitments.
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-3">
        {insights.map((insight) => (
          <SurfaceCard key={insight.title} className="flex flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{insight.title}</h3>
              <Pill tone="info">{insight.confidence}%</Pill>
            </div>
            <p className="mt-3 flex-1 text-sm text-[var(--text-secondary)]">
              {insight.summary}
            </p>
            <p className="mt-3 text-[11px] text-[var(--text-muted)]">
              Data as of today 11:40 · Model: store×SKU weekly
            </p>
            <Button className="mt-4" variant="secondary" size="sm">
              {insight.action}
            </Button>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
