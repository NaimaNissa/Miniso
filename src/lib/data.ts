export type InventoryStatus =
  | "healthy"
  | "low"
  | "critical"
  | "out"
  | "transit"
  | "reserved"
  | "damaged"
  | "inspection";

export type ApprovalType =
  | "inventory"
  | "purchase"
  | "price"
  | "refund"
  | "supplier";

export const countries = [
  { id: "global", name: "Global", flag: "🌐" },
  { id: "bd", name: "Bangladesh", flag: "🇧🇩" },
  { id: "in", name: "India", flag: "🇮🇳" },
  { id: "id", name: "Indonesia", flag: "🇮🇩" },
  { id: "sg", name: "Singapore", flag: "🇸🇬" },
];

export const stores = [
  {
    id: "MIN-BD-DHK-014",
    name: "Dhanmondi Store",
    city: "Dhaka",
    country: "Bangladesh",
    status: "operational" as const,
    manager: "Nusrat Jahan",
    salesToday: 184500,
    transactions: 426,
    avgBasket: 433,
    stockAvailability: 96.2,
    staffPresent: 18,
    staffTotal: 20,
  },
  {
    id: "MIN-BD-DHK-008",
    name: "Gulshan Store",
    city: "Dhaka",
    country: "Bangladesh",
    status: "operational" as const,
    manager: "Rahim Khan",
    salesToday: 256800,
    transactions: 512,
    avgBasket: 502,
    stockAvailability: 91.4,
    staffPresent: 22,
    staffTotal: 24,
  },
  {
    id: "MIN-BD-DHK-021",
    name: "Uttara Store",
    city: "Dhaka",
    country: "Bangladesh",
    status: "operational" as const,
    manager: "Farhana Akter",
    salesToday: 142300,
    transactions: 318,
    avgBasket: 447,
    stockAvailability: 88.7,
    staffPresent: 14,
    staffTotal: 16,
  },
  {
    id: "MIN-BD-CTG-003",
    name: "Chittagong Agrabad",
    city: "Chittagong",
    country: "Bangladesh",
    status: "maintenance" as const,
    manager: "Imran Hossain",
    salesToday: 98400,
    transactions: 210,
    avgBasket: 469,
    stockAvailability: 94.1,
    staffPresent: 12,
    staffTotal: 14,
  },
];

export const warehouses = [
  {
    id: "WH-BD-DHK-01",
    name: "Dhaka DC",
    city: "Dhaka",
    capacity: 92,
    inbound: 14,
    outbound: 28,
  },
  {
    id: "WH-BD-CTG-01",
    name: "Chittagong DC",
    city: "Chittagong",
    capacity: 71,
    inbound: 6,
    outbound: 11,
  },
];

export const products = [
  {
    id: "MIN-PL-2048",
    sku: "SKU-2048",
    name: "Sanrio Plush Bear",
    category: "Toys & IP",
    brand: "Sanrio",
    price: 1250,
    cost: 620,
    status: "active" as const,
    available: 4820,
    inTransit: 640,
    reserved: 120,
    stores: 128,
    inventoryStatus: "healthy" as InventoryStatus,
    unitsSold30d: 3840,
    revenue30d: 4800000,
    margin: 50.4,
    sellThrough: 72,
    stockCoverage: 18,
    image: "🧸",
  },
  {
    id: "MIN-BG-1102",
    sku: "SKU-1102",
    name: "Canvas Tote Bag",
    category: "Lifestyle",
    brand: "MINISO",
    price: 850,
    cost: 310,
    status: "active" as const,
    available: 2104,
    inTransit: 200,
    reserved: 45,
    stores: 96,
    inventoryStatus: "healthy" as InventoryStatus,
    unitsSold30d: 1920,
    revenue30d: 1632000,
    margin: 63.5,
    sellThrough: 68,
    stockCoverage: 22,
    image: "👜",
  },
  {
    id: "MIN-ST-3301",
    sku: "SKU-3301",
    name: "Gel Pen Set (12pc)",
    category: "Stationery",
    brand: "MINISO",
    price: 390,
    cost: 145,
    status: "active" as const,
    available: 8,
    inTransit: 500,
    reserved: 0,
    stores: 82,
    inventoryStatus: "critical" as InventoryStatus,
    unitsSold30d: 9200,
    revenue30d: 3588000,
    margin: 62.8,
    sellThrough: 91,
    stockCoverage: 2,
    image: "✏️",
  },
  {
    id: "MIN-HM-4410",
    sku: "SKU-4410",
    name: "Aroma Diffuser Mini",
    category: "Home",
    brand: "MINISO",
    price: 1890,
    cost: 840,
    status: "active" as const,
    available: 24,
    inTransit: 80,
    reserved: 12,
    stores: 64,
    inventoryStatus: "low" as InventoryStatus,
    unitsSold30d: 860,
    revenue30d: 1625400,
    margin: 55.6,
    sellThrough: 64,
    stockCoverage: 6,
    image: "🫧",
  },
  {
    id: "MIN-BT-5520",
    sku: "SKU-5520",
    name: "Skyline Water Bottle 500ml",
    category: "Lifestyle",
    brand: "MINISO",
    price: 690,
    cost: 250,
    status: "active" as const,
    available: 0,
    inTransit: 1200,
    reserved: 0,
    stores: 70,
    inventoryStatus: "out" as InventoryStatus,
    unitsSold30d: 4100,
    revenue30d: 2829000,
    margin: 63.8,
    sellThrough: 88,
    stockCoverage: 0,
    image: "🧴",
  },
  {
    id: "MIN-BT-6611",
    sku: "SKU-6611",
    name: "Wireless Earbuds Lite",
    category: "Electronics",
    brand: "MINISO",
    price: 2490,
    cost: 1180,
    status: "active" as const,
    available: 1560,
    inTransit: 300,
    reserved: 80,
    stores: 54,
    inventoryStatus: "healthy" as InventoryStatus,
    unitsSold30d: 980,
    revenue30d: 2440200,
    margin: 52.6,
    sellThrough: 58,
    stockCoverage: 24,
    image: "🎧",
  },
];

export const inventoryRows = [
  {
    sku: "SKU-102",
    name: "Kuromi Keychain",
    store: "Gulshan",
    stock: 4,
    target: 25,
    status: "critical" as InventoryStatus,
    category: "Toys & IP",
  },
  {
    sku: "SKU-204",
    name: "Sanrio Plush Bear",
    store: "Dhanmondi",
    stock: 8,
    target: 30,
    status: "low" as InventoryStatus,
    category: "Toys & IP",
  },
  {
    sku: "SKU-301",
    name: "Notebook A5 Lined",
    store: "Uttara",
    stock: 48,
    target: 40,
    status: "healthy" as InventoryStatus,
    category: "Stationery",
  },
  {
    sku: "SKU-3301",
    name: "Gel Pen Set (12pc)",
    store: "Dhanmondi",
    stock: 3,
    target: 40,
    status: "critical" as InventoryStatus,
    category: "Stationery",
  },
  {
    sku: "SKU-5520",
    name: "Skyline Water Bottle",
    store: "Gulshan",
    stock: 0,
    target: 35,
    status: "out" as InventoryStatus,
    category: "Lifestyle",
  },
  {
    sku: "SKU-4410",
    name: "Aroma Diffuser Mini",
    store: "Agrabad",
    stock: 12,
    target: 20,
    status: "low" as InventoryStatus,
    category: "Home",
  },
  {
    sku: "SKU-1102",
    name: "Canvas Tote Bag",
    store: "Uttara",
    stock: 64,
    target: 30,
    status: "healthy" as InventoryStatus,
    category: "Lifestyle",
  },
  {
    sku: "SKU-6611",
    name: "Wireless Earbuds Lite",
    store: "Dhanmondi",
    stock: 18,
    target: 15,
    status: "healthy" as InventoryStatus,
    category: "Electronics",
  },
  {
    sku: "SKU-7780",
    name: "Face Mask Pack (5)",
    store: "Gulshan",
    stock: 220,
    target: 100,
    status: "transit" as InventoryStatus,
    category: "Beauty",
  },
  {
    sku: "SKU-8891",
    name: "Ceramic Mug Set",
    store: "Dhanmondi",
    stock: 6,
    target: 18,
    status: "inspection" as InventoryStatus,
    category: "Home",
  },
];

export const kpis = {
  salesToday: 4820000,
  salesChange: 12.4,
  inventoryValue: 28400000,
  inventoryAvailable: 94.2,
  lowStock: 128,
  lowStockChange: -8,
  outOfStock: 24,
  outOfStockChange: -14,
  pendingActions: 37,
};

export const salesSparkline = [42, 48, 45, 52, 58, 61, 55, 68, 72, 70, 78, 84];
export const inventorySparkline = [78, 80, 79, 82, 85, 84, 88, 90, 89, 92, 93, 94];

export const purchaseOrders = [
  {
    id: "PO-2026-00482",
    supplier: "ABC Manufacturing",
    destination: "Dhaka DC",
    expected: "18 Oct 2026",
    status: "in_transit" as const,
    items: 24,
    value: 1840000,
    stage: 5,
  },
  {
    id: "PO-2026-00491",
    supplier: "Guangzhou Toys Co.",
    destination: "Dhaka DC",
    expected: "22 Oct 2026",
    status: "pending_approval" as const,
    items: 18,
    value: 920000,
    stage: 1,
  },
  {
    id: "PO-2026-00455",
    supplier: "HomeCraft Ltd",
    destination: "Chittagong DC",
    expected: "12 Oct 2026",
    status: "received" as const,
    items: 32,
    value: 2100000,
    stage: 6,
  },
  {
    id: "PO-2026-00501",
    supplier: "Stationery Plus",
    destination: "Dhaka DC",
    expected: "25 Oct 2026",
    status: "supplier_confirmed" as const,
    items: 40,
    value: 640000,
    stage: 3,
  },
];

export const customers = [
  {
    id: "CUS-100284",
    name: "Ayesha Rahman",
    phone: "+880 1712-445566",
    tier: "Gold",
    lifetimeSpend: 42800,
    orders: 36,
    avgBasket: 1189,
    points: 2140,
  },
  {
    id: "CUS-100512",
    name: "Tanvir Ahmed",
    phone: "+880 1811-998877",
    tier: "Silver",
    lifetimeSpend: 18650,
    orders: 14,
    avgBasket: 1332,
    points: 840,
  },
  {
    id: "CUS-100901",
    name: "Maliha Chowdhury",
    phone: "+880 1913-334455",
    tier: "Platinum",
    lifetimeSpend: 98600,
    orders: 72,
    avgBasket: 1369,
    points: 4920,
  },
];

export const approvals = [
  {
    id: "APR-8821",
    type: "inventory" as ApprovalType,
    title: "Stock write-off — damaged plush batch",
    requestedBy: "Nusrat Jahan",
    date: "7 Oct 2026 · 09:14",
    reason: "Water damage during inbound QC at Dhaka DC",
    financialImpact: 62400,
    inventoryImpact: "-48 units SKU-2048",
    risk: "medium" as const,
  },
  {
    id: "APR-8824",
    type: "purchase" as ApprovalType,
    title: "PO-2026-00491 — Guangzhou Toys Co.",
    requestedBy: "Karim Uddin",
    date: "7 Oct 2026 · 08:40",
    reason: "Rush replenishment for Sanrio IP launch",
    financialImpact: 920000,
    inventoryImpact: "+18 SKUs inbound",
    risk: "low" as const,
  },
  {
    id: "APR-8830",
    type: "price" as ApprovalType,
    title: "Promo price — Gel Pen Set weekend deal",
    requestedBy: "Farhana Akter",
    date: "6 Oct 2026 · 17:22",
    reason: "Clear aged stationery before new assortment",
    financialImpact: -18,
    inventoryImpact: "Margin −4.2 pts",
    risk: "low" as const,
  },
  {
    id: "APR-8833",
    type: "refund" as ApprovalType,
    title: "High-value refund — Wireless Earbuds",
    requestedBy: "POS · Gulshan",
    date: "7 Oct 2026 · 10:05",
    reason: "Defective unit within 7-day window",
    financialImpact: 2490,
    inventoryImpact: "+1 return to QC",
    risk: "medium" as const,
  },
  {
    id: "APR-8840",
    type: "supplier" as ApprovalType,
    title: "Onboard supplier — EcoPack BD",
    requestedBy: "Procurement HQ",
    date: "6 Oct 2026 · 14:10",
    reason: "Local packaging partner for BD market",
    financialImpact: 0,
    inventoryImpact: "New vendor master",
    risk: "high" as const,
  },
];

export const conversations = [
  {
    id: "1",
    channel: "Instagram" as const,
    customer: "@nabila.k",
    preview: "Do you have Sanrio plush in Dhanmondi?",
    time: "2m",
    unread: true,
    aiConfidence: 96,
  },
  {
    id: "2",
    channel: "WhatsApp" as const,
    customer: "+880 17•••8899",
    preview: "What's the price of the tote bag?",
    time: "14m",
    unread: true,
    aiConfidence: 99,
  },
  {
    id: "3",
    channel: "Facebook" as const,
    customer: "Rafiul Islam",
    preview: "Can I return earbuds bought yesterday?",
    time: "1h",
    unread: false,
    aiConfidence: 88,
  },
  {
    id: "4",
    channel: "Instagram" as const,
    customer: "@samiya.designs",
    preview: "When will water bottles restock?",
    time: "3h",
    unread: false,
    aiConfidence: 91,
  },
];

export const socialMessages = [
  {
    id: "m1",
    sender: "customer" as const,
    text: "Hi! Do you have the Sanrio Plush Bear in Dhanmondi store?",
    time: "11:42",
  },
  {
    id: "m2",
    sender: "ai" as const,
    text: "Yes — Dhanmondi currently has 8 units of Sanrio Plush Bear (SKU-2048) available at ৳1,250. Stock is low; I recommend visiting today.",
    time: "11:42",
  },
  {
    id: "m3",
    sender: "customer" as const,
    text: "Is there a loyalty offer on it?",
    time: "11:44",
  },
  {
    id: "m4",
    sender: "ai" as const,
    text: "Gold members get 1.5× points this week on Toys & IP. Nearest alternate with higher stock: Gulshan (42 units).",
    time: "11:44",
  },
  {
    id: "m5",
    sender: "system" as const,
    text: "AI confidence 96% · Sources: live store inventory, active promo catalog · Updated 11:44",
    time: "11:44",
  },
];

export const warehouseTasks = [
  {
    id: "WH-T-101",
    type: "Receiving",
    ref: "ASN-8821",
    status: "in_progress" as const,
    priority: "high" as const,
    assignee: "Team A",
  },
  {
    id: "WH-T-102",
    type: "Put Away",
    ref: "GRN-4410",
    status: "pending" as const,
    priority: "medium" as const,
    assignee: "Team B",
  },
  {
    id: "WH-T-103",
    type: "Picking",
    ref: "TR-DHK-229",
    status: "waiting" as const,
    priority: "high" as const,
    assignee: "Team C",
  },
  {
    id: "WH-T-104",
    type: "Dispatch",
    ref: "TR-UTT-118",
    status: "completed" as const,
    priority: "low" as const,
    assignee: "Team A",
  },
  {
    id: "WH-T-105",
    type: "Stock Count",
    ref: "CNT-ZONE-B",
    status: "exception" as const,
    priority: "high" as const,
    assignee: "QC Lead",
  },
];

export const storeOperations = {
  opening: [
    { label: "Attendance checked", done: true },
    { label: "POS status verified", done: true },
    { label: "Cash float verified", done: true },
    { label: "Store opening checklist", done: true },
    { label: "Equipment status", done: true },
  ],
  during: [
    { label: "Replenishment — aisle 3", done: true },
    { label: "Display task — Sanrio endcap", done: true },
    { label: "3 low-stock SKUs flagged", done: false, warn: true },
    { label: "Customer issue #4412", done: false },
    { label: "Maintenance request — AC zone B", done: false, warn: true },
  ],
  closing: [
    { label: "Cash reconciliation", done: false },
    { label: "POS closing", done: false },
    { label: "Refund review", done: false },
    { label: "Stock exceptions", done: false },
    { label: "Daily summary", done: false },
  ],
};

export const notifications = {
  critical: [
    {
      id: "n1",
      title: "Out of stock — Skyline Water Bottle",
      meta: "Gulshan · 10:12",
    },
    {
      id: "n2",
      title: "Warehouse discrepancy — Zone B count",
      meta: "Dhaka DC · 09:48",
    },
  ],
  attention: [
    {
      id: "n3",
      title: "5 purchase orders awaiting approval",
      meta: "Procurement · 08:30",
    },
    {
      id: "n4",
      title: "Late shipment — PO-2026-00482",
      meta: "Inbound · ETA slipped 1d",
    },
  ],
  info: [
    {
      id: "n5",
      title: "Transfer TR-DHK-229 received",
      meta: "Uttara · 11:02",
    },
    {
      id: "n6",
      title: "Display task completed",
      meta: "Dhanmondi · 10:40",
    },
  ],
};

export const posCatalog = products.map((p) => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  price: p.price,
  image: p.image,
  available: p.available,
}));

export const poTimeline = [
  "Created",
  "Reviewed",
  "Approved",
  "Supplier Confirmed",
  "In Production",
  "Shipped",
  "Received",
];

export const networkStats = {
  stores: 82,
  warehouses: 4,
  inventory: 24000000,
  salesToday: 4800000,
};

export const ownerMetrics = {
  networkSalesToday: 4820000,
  networkSalesChange: 12.4,
  monthToDate: 98400000,
  monthToDateChange: 8.1,
  grossMargin: 54.2,
  grossMarginChange: 0.6,
  inventoryValue: 28400000,
  inventoryTurns: 6.4,
  openStores: 80,
  totalStores: 82,
  pendingApprovals: 22,
  criticalExceptions: 7,
  supplierOtif: 91,
  forecastAccuracy: 88.8,
};

export const regionPerformance = [
  {
    region: "Dhaka",
    stores: 48,
    sales: 3120000,
    growth: 14.2,
    availability: 93.8,
    alerts: 9,
  },
  {
    region: "Chittagong",
    stores: 18,
    sales: 980000,
    growth: 6.4,
    availability: 95.1,
    alerts: 3,
  },
  {
    region: "Sylhet",
    stores: 8,
    sales: 420000,
    growth: 11.0,
    availability: 91.2,
    alerts: 4,
  },
  {
    region: "Other cities",
    stores: 8,
    sales: 300000,
    growth: 4.8,
    availability: 94.0,
    alerts: 2,
  },
];

export const topStoresBySales = [
  { name: "Gulshan Store", sales: 256800, growth: 18.2, rank: 1 },
  { name: "Bashundhara City", sales: 231400, growth: 9.5, rank: 2 },
  { name: "Dhanmondi Store", sales: 184500, growth: 12.1, rank: 3 },
  { name: "Uttara Store", sales: 142300, growth: 7.4, rank: 4 },
  { name: "Chittagong Agrabad", sales: 98400, growth: -2.1, rank: 5 },
];

export const branchToday = {
  storeId: "MIN-BD-DHK-014",
  storeName: "Dhanmondi Store",
  manager: "Nusrat Jahan",
  salesTarget: 220000,
  salesToday: 184500,
  transactions: 426,
  avgBasket: 433,
  conversionHint: "Footfall est. 1,180",
  stockAvailability: 96.2,
  lowStockSkus: 3,
  outOfStockSkus: 1,
  staffPresent: 18,
  staffTotal: 20,
  pendingTasks: 4,
  openIncidents: 1,
  cashVariance: 0,
  lastSaleAt: "11:52 AM",
};

export const branchHourlySales = [
  8200, 12400, 18600, 22100, 19800, 24500, 27800, 21400, 16200, 13500,
];

export const branchAlerts = [
  {
    id: "ba1",
    severity: "critical" as const,
    title: "Gel Pen Set critically low",
    detail: "3 units left · target 40 · aisle 2",
  },
  {
    id: "ba2",
    severity: "warning" as const,
    title: "Sanrio Plush Bear low stock",
    detail: "8 units · recommend transfer from Gulshan",
  },
  {
    id: "ba3",
    severity: "warning" as const,
    title: "AC maintenance request open",
    detail: "Zone B · reported 09:40",
  },
  {
    id: "ba4",
    severity: "info" as const,
    title: "Inbound transfer TR-DHK-229 arriving",
    detail: "ETA 2:30 PM · 12 SKUs",
  },
];

export const branchTopSellers = [
  { name: "Sanrio Plush Bear", units: 42, revenue: 52500 },
  { name: "Canvas Tote Bag", units: 38, revenue: 32300 },
  { name: "Gel Pen Set (12pc)", units: 61, revenue: 23790 },
  { name: "Skyline Water Bottle", units: 0, revenue: 0, oos: true },
];
