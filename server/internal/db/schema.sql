CREATE TABLE IF NOT EXISTS headquarters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  owner_user_id TEXT
);

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  status TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  manager_user_id TEXT,
  hq_id TEXT REFERENCES headquarters(id),
  sales_today BIGINT NOT NULL DEFAULT 0,
  transactions INT NOT NULL DEFAULT 0,
  avg_basket INT NOT NULL DEFAULT 0,
  stock_availability NUMERIC(5,1) NOT NULL DEFAULT 0,
  sales_target BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  capacity INT NOT NULL,
  inbound INT NOT NULL DEFAULT 0,
  outbound INT NOT NULL DEFAULT 0,
  hq_id TEXT REFERENCES headquarters(id)
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  role TEXT NOT NULL,
  title TEXT NOT NULL,
  workspace TEXT NOT NULL,
  branch_id TEXT REFERENCES stores(id),
  phone TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  branch_id TEXT NOT NULL REFERENCES stores(id),
  position TEXT NOT NULL,
  employee_code TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  joined DATE NOT NULL,
  base_salary INT NOT NULL,
  bank_account TEXT NOT NULL DEFAULT '',
  emergency_name TEXT NOT NULL DEFAULT '',
  emergency_phone TEXT NOT NULL DEFAULT '',
  shift_start TEXT NOT NULL,
  shift_end TEXT NOT NULL,
  off_day INT NOT NULL,
  manager_name TEXT NOT NULL,
  manager_user_id TEXT
);

CREATE TABLE IF NOT EXISTS punches (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL REFERENCES staff(id),
  type TEXT NOT NULL,
  at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS leaves (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL REFERENCES staff(id),
  kind TEXT NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  price INT NOT NULL,
  cost INT NOT NULL,
  status TEXT NOT NULL,
  image TEXT NOT NULL,
  units_sold_30d INT NOT NULL DEFAULT 0,
  revenue_30d BIGINT NOT NULL DEFAULT 0,
  margin NUMERIC(5,1) NOT NULL DEFAULT 0,
  sell_through INT NOT NULL DEFAULT 0,
  stock_coverage INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stock (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  location_kind TEXT NOT NULL,
  location_id TEXT NOT NULL,
  location_name TEXT NOT NULL,
  on_hand INT NOT NULL DEFAULT 0,
  reserved INT NOT NULL DEFAULT 0,
  in_transit INT NOT NULL DEFAULT 0,
  target INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  UNIQUE (product_id, location_kind, location_id)
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  supplier TEXT NOT NULL,
  destination TEXT NOT NULL,
  warehouse_id TEXT REFERENCES warehouses(id),
  expected TEXT NOT NULL,
  status TEXT NOT NULL,
  items INT NOT NULL,
  value BIGINT NOT NULL,
  stage INT NOT NULL
);

CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY,
  origin TEXT NOT NULL,
  invoice TEXT NOT NULL,
  eta TEXT NOT NULL,
  status TEXT NOT NULL,
  items INT NOT NULL,
  warehouse_id TEXT REFERENCES warehouses(id),
  product_id TEXT REFERENCES products(id),
  qty INT NOT NULL DEFAULT 0,
  po_id TEXT REFERENCES purchase_orders(id)
);

CREATE TABLE IF NOT EXISTS transfers (
  id TEXT PRIMARY KEY,
  from_name TEXT NOT NULL,
  to_name TEXT NOT NULL,
  from_kind TEXT NOT NULL,
  from_id TEXT NOT NULL,
  to_kind TEXT NOT NULL,
  to_id TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id),
  sku TEXT NOT NULL,
  qty INT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS adjustments (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL,
  reason TEXT NOT NULL,
  qty INT NOT NULL,
  status TEXT NOT NULL,
  store_name TEXT NOT NULL DEFAULT '',
  store_id TEXT,
  product_id TEXT REFERENCES products(id),
  location_kind TEXT NOT NULL DEFAULT 'store'
);

CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  requested_at TEXT NOT NULL,
  reason TEXT NOT NULL,
  financial_impact BIGINT NOT NULL DEFAULT 0,
  inventory_impact TEXT NOT NULL DEFAULT '',
  risk TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  po_id TEXT REFERENCES purchase_orders(id),
  adjustment_id TEXT REFERENCES adjustments(id),
  promotion_id TEXT,
  requester_user_id TEXT,
  branch_id TEXT,
  decided_by TEXT,
  decided_at TIMESTAMPTZ,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  tier TEXT NOT NULL,
  lifetime_spend BIGINT NOT NULL DEFAULT 0,
  orders INT NOT NULL DEFAULT 0,
  avg_basket INT NOT NULL DEFAULT 0,
  points INT NOT NULL DEFAULT 0,
  home_store_id TEXT REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id),
  user_id TEXT REFERENCES users(id),
  total BIGINT NOT NULL,
  tender TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sale_lines (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL REFERENCES sales(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  qty INT NOT NULL,
  price INT NOT NULL
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  customer TEXT NOT NULL,
  preview TEXT NOT NULL,
  time_label TEXT NOT NULL,
  unread BOOLEAN NOT NULL DEFAULT false,
  ai_confidence INT NOT NULL DEFAULT 0,
  store_id TEXT REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS social_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  time_label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS warehouse_tasks (
  id TEXT PRIMARY KEY,
  warehouse_id TEXT REFERENCES warehouses(id),
  type TEXT NOT NULL,
  ref TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  assignee TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS operation_tasks (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id),
  phase TEXT NOT NULL,
  label TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  warn BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  period TEXT NOT NULL,
  scope TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS branch_notes (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id),
  body TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS series_points (
  name TEXT NOT NULL,
  idx INT NOT NULL,
  value INT NOT NULL,
  PRIMARY KEY (name, idx)
);

CREATE TABLE IF NOT EXISTS hourly_sales (
  store_id TEXT NOT NULL REFERENCES stores(id),
  hour INT NOT NULL,
  amount BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (store_id, hour)
);
