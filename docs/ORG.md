# MINISO Retail OS — Organisation model

This is the living map of how people, stores, and modules connect.
Every role reads from the same Postgres records; scope changes by role, not by a separate fake dataset.

## Hierarchy

```
Bangladesh HQ (Country Owner)
├── Supply Chain HQ (Inventory Manager)
│   └── Dhaka DC / Chittagong DC (Warehouse Staff)
└── Branches (each has one Branch Manager)
    ├── Dhanmondi Store
    │   ├── Branch Manager → Nusrat Jahan
    │   ├── Social agent (branch-linked)
    │   └── Floor staff & cashiers (clock, leave, payroll)
    ├── Gulshan Store
    │   ├── Branch Manager → Rahim Khan
    │   └── Floor staff & cashiers
    ├── Uttara Store
    │   ├── Branch Manager → Farhana Akter
    │   └── Floor staff & cashiers
    └── Chittagong Agrabad
        ├── Branch Manager → Imran Hossain
        └── Floor staff & cashiers
```

## Roles and what they see

| Role | Home | Scope |
|------|------|--------|
| **Owner** | Owner dashboard | All HQ metrics, every branch board, all staff & managers, approvals |
| **Inventory manager** | Owner / supply hubs | Network stock, POs, shipments, warehouses, approvals |
| **Warehouse staff** | Warehouse | DC inbound/outbound, receive shipments, fulfill transfers |
| **Store manager** | Branch dashboard | **Only their branch**: team, POS, ops checklist, local stock, leave approvals |
| **Social media** | Inbox | Conversations & lookup for their assigned branch |
| **Staff (cashier / floor)** | Staff portal | Own clock, tasks, leave, payroll estimate; teammates at same branch |

## Shared records (the interconnect)

- `headquarters` → owns many `stores`
- each `store.manager_user_id` → the `users` row with role `store_manager`
- each `staff` row shares `id` with a `users` row (role `staff`) and `branch_id` → that store
- `staff.manager_user_id` / `manager_name` mirror the store’s branch manager
- punches, leaves, payroll estimates hang off `staff`
- POS sales decrement that store’s `stock` and bump that store’s sales KPIs
- transfers / shipments move stock between warehouse and store locations
- approvals are HQ-decided (owner / inventory manager) with a real submit → decide → side-effect flow:
  - **inventory** — stock adjustment opens pending; approve posts qty to `stock`
  - **purchase** — PO starts `pending_approval`; approve → `supplier_confirmed`
  - **price** — promo stays `Pending approval` until activate / decline
  - **refund** — branch manager request; approve restocks the store
  - **supplier** — vendor onboarding recorded on the approval itself
- social conversations are tagged with `store_id`
- **employee invites** — owner (and branch managers for their store) send role-based signup links by email; accepting creates the user and lands them on `homeFor(role)`

## Employee invites

1. Owner opens **People** → **Invite employee** (or branch manager invites staff / social for their store)
2. Choose email + role (+ branch / warehouse / position when required)
3. API creates a 7-day token and emails `/invite/{token}` (Resend or SMTP when configured; otherwise the invite link is shown to copy)
4. Invitee sets name + password → account is created with that role → session redirects to their dashboard

## Demo logins (seeded)

| Email | Password | Role | Branch |
|-------|----------|------|--------|
| owner@miniso.bd | owner123 | Owner | HQ (all) |
| manager@miniso.bd | manager123 | Inventory manager | HQ |
| warehouse@miniso.bd | warehouse123 | Warehouse | Dhaka DC |
| store@miniso.bd | store123 | Branch manager | Dhanmondi |
| gulshan@miniso.bd | store123 | Branch manager | Gulshan |
| uttara@miniso.bd | store123 | Branch manager | Uttara |
| ctg@miniso.bd | store123 | Branch manager | Agrabad |
| social@miniso.bd | social123 | Social | Dhanmondi |
| staff@miniso.bd | staff123 | Cashier | Dhanmondi |

Other cashiers and floor associates are seeded per branch (same password `staff123`) so workforce, attendance, and leave stay realistic.

## Reseed

With an existing Railway database, set `RESEED=1` once when starting the Go API to wipe transactional seed tables and reload this org graph. Leave `RESEED` unset afterward so live punches / POS sales are kept.
