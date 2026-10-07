# MINISO Retail OS

Premium centralized retail operating system UI for MINISO-scale inventory, store operations, POS, procurement, CRM, and AI-assisted decisions.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 with design tokens
- Lucide icons

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Modules

| Route | Purpose |
|-------|---------|
| `/dashboard` | KPI control tower |
| `/inventory` | Inventory control center |
| `/products` | Product / SKU master |
| `/stores` | Store network & command centers |
| `/pos` | Touch-friendly POS |
| `/warehouse` | Warehouse workflows |
| `/procurement` | Purchase orders & timeline |
| `/customers` | CRM / loyalty |
| `/social` | Social inbox + AI agent |
| `/approvals` | Approval center |
| `/operations` | Daily store operations |
| `/ai` | AI insights |
| `/reports` | Analytics |
| `/control-center` | Global network view |

## Design system

Tokens live in `src/app/globals.css` (`--accent`, glass surfaces, semantic colors, radii, shadows). Shared primitives are under `src/components/ui/`.
