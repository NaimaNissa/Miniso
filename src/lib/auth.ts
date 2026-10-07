import type { LucideIcon } from "lucide-react";
import {
  Package,
  Boxes,
  Warehouse,
  Store,
  ShoppingCart,
  Users,
  Megaphone,
  ClipboardList,
  UsersRound,
  BarChart3,
  Sparkles,
  Truck,
  CheckSquare,
  MessageSquare,
  Building2,
  Ship,
  Search,
  ArrowLeftRight,
  Map,
} from "lucide-react";

export type RoleId =
  | "owner"
  | "inventory_manager"
  | "warehouse_staff"
  | "store_manager"
  | "social_media";

export type ModuleId =
  | "owner_dashboard"
  | "branch_dashboard"
  | "control_center"
  | "inventory"
  | "products"
  | "shipments"
  | "warehouse"
  | "stores"
  | "procurement"
  | "transfers"
  | "supply"
  | "pos"
  | "customers"
  | "social_inbox"
  | "product_lookup"
  | "promotions"
  | "operations"
  | "workforce"
  | "approvals"
  | "ai"
  | "reports"
  | "insights";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  moduleId: ModuleId;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type ModuleDef = {
  id: ModuleId;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export type DemoUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  initials: string;
  role: RoleId;
  title: string;
  workspace: string;
};

export const roleMeta: Record<
  RoleId,
  {
    label: string;
    shortLabel: string;
    description: string;
    home: string;
    color: string;
  }
> = {
  owner: {
    label: "Owner / HQ Admin",
    shortLabel: "Owner",
    description: "Network-wide sales, approvals, and control tower access.",
    home: "/dashboard/owner",
    color: "accent",
  },
  inventory_manager: {
    label: "Inventory Manager",
    shortLabel: "Manager",
    description:
      "Owns shipments, product data, approvals and reports. Full inventory access.",
    home: "/dashboard/owner",
    color: "accent",
  },
  warehouse_staff: {
    label: "Warehouse Staff",
    shortLabel: "Warehouse",
    description:
      "Receives shipments, moves stock to outlets, adjusts counts. Cannot edit prices.",
    home: "/warehouse",
    color: "info",
  },
  store_manager: {
    label: "Store Manager",
    shortLabel: "Branch",
    description:
      "Store command center: sales, staff, local stock, POS and daily operations.",
    home: "/dashboard/branch",
    color: "success",
  },
  social_media: {
    label: "Social Media Team",
    shortLabel: "Social",
    description:
      "Branch-linked agent: product lookup, offers, FAQs, chat handover. Cannot change stock.",
    home: "/social",
    color: "info",
  },
};

export const allModules: ModuleDef[] = [
  {
    id: "owner_dashboard",
    name: "Owner Dashboard",
    description: "Network KPIs, regions, approvals overview",
    href: "/dashboard/owner",
    icon: Building2,
  },
  {
    id: "branch_dashboard",
    name: "Branch Dashboard",
    description: "Store sales target, alerts, shift checklist",
    href: "/dashboard/branch",
    icon: Store,
  },
  {
    id: "control_center",
    name: "Control Center",
    description: "Country → city → store network map",
    href: "/control-center",
    icon: Map,
  },
  {
    id: "inventory",
    name: "Inventory",
    description: "Stock ledger, alerts, adjustments",
    href: "/inventory",
    icon: Boxes,
  },
  {
    id: "products",
    name: "Products",
    description: "SKU master, pricing, lifecycle",
    href: "/products",
    icon: Package,
  },
  {
    id: "shipments",
    name: "Inbound Shipments",
    description: "Create and track inbound from China/Japan",
    href: "/shipments",
    icon: Ship,
  },
  {
    id: "warehouse",
    name: "Warehouse",
    description: "Receiving, put-away, pick, dispatch",
    href: "/warehouse",
    icon: Warehouse,
  },
  {
    id: "stores",
    name: "Stores",
    description: "Branch network and store details",
    href: "/stores",
    icon: Store,
  },
  {
    id: "procurement",
    name: "Procurement",
    description: "Purchase orders and suppliers",
    href: "/procurement",
    icon: Truck,
  },
  {
    id: "transfers",
    name: "Transfers & Adjustments",
    description: "Warehouse↔outlet moves and stock changes",
    href: "/transfers",
    icon: ArrowLeftRight,
  },
  {
    id: "supply",
    name: "Supply",
    description: "Shipments, warehouse, transfers, procurement",
    href: "/supply",
    icon: Truck,
  },
  {
    id: "insights",
    name: "Insights",
    description: "Reports and AI recommendations",
    href: "/insights",
    icon: BarChart3,
  },
  {
    id: "pos",
    name: "POS",
    description: "Point of sale terminal",
    href: "/pos",
    icon: ShoppingCart,
  },
  {
    id: "customers",
    name: "Customers",
    description: "CRM and loyalty profiles",
    href: "/customers",
    icon: Users,
  },
  {
    id: "social_inbox",
    name: "Social Inbox",
    description: "Instagram/WhatsApp conversations + AI",
    href: "/social",
    icon: MessageSquare,
  },
  {
    id: "product_lookup",
    name: "Product Lookup",
    description: "Search price, outlet stock, offers, copy reply",
    href: "/lookup",
    icon: Search,
  },
  {
    id: "promotions",
    name: "Promotions",
    description: "Campaigns and offers",
    href: "/promotions",
    icon: Megaphone,
  },
  {
    id: "operations",
    name: "Store Operations",
    description: "Opening, mid-day, closing checklist",
    href: "/operations",
    icon: ClipboardList,
  },
  {
    id: "workforce",
    name: "Workforce",
    description: "Attendance and shifts",
    href: "/workforce",
    icon: UsersRound,
  },
  {
    id: "approvals",
    name: "Approvals",
    description: "Large adjustments, POs, refunds",
    href: "/approvals",
    icon: CheckSquare,
  },
  {
    id: "ai",
    name: "AI Insights",
    description: "Forecast and replenishment recommendations",
    href: "/ai",
    icon: Sparkles,
  },
  {
    id: "reports",
    name: "Reports",
    description: "Sales, inventory and supply analytics",
    href: "/reports",
    icon: BarChart3,
  },
];

/** Modules each role can access */
export const roleModules: Record<RoleId, ModuleId[]> = {
  owner: [
    "owner_dashboard",
    "branch_dashboard",
    "control_center",
    "inventory",
    "products",
    "shipments",
    "warehouse",
    "stores",
    "procurement",
    "transfers",
    "supply",
    "customers",
    "social_inbox",
    "promotions",
    "operations",
    "workforce",
    "approvals",
    "ai",
    "reports",
    "insights",
  ],
  inventory_manager: [
    "owner_dashboard",
    "control_center",
    "inventory",
    "products",
    "shipments",
    "warehouse",
    "stores",
    "procurement",
    "transfers",
    "supply",
    "approvals",
    "ai",
    "reports",
    "insights",
  ],
  warehouse_staff: [
    "warehouse",
    "shipments",
    "inventory",
    "transfers",
    "products",
  ],
  store_manager: [
    "branch_dashboard",
    "inventory",
    "products",
    "stores",
    "transfers",
    "pos",
    "customers",
    "social_inbox",
    "product_lookup",
    "operations",
    "workforce",
    "promotions",
  ],
  social_media: [
    "branch_dashboard",
    "social_inbox",
    "product_lookup",
    "products",
    "promotions",
    "customers",
  ],
};

export const demoUsers: DemoUser[] = [
  {
    id: "u-owner",
    email: "owner@miniso.bd",
    password: "owner123",
    name: "Amina Rahman",
    initials: "AR",
    role: "owner",
    title: "Country Owner",
    workspace: "Bangladesh HQ",
  },
  {
    id: "u-manager",
    email: "manager@miniso.bd",
    password: "manager123",
    name: "Karim Jahan",
    initials: "KJ",
    role: "inventory_manager",
    title: "Inventory Manager",
    workspace: "Supply Chain HQ",
  },
  {
    id: "u-warehouse",
    email: "warehouse@miniso.bd",
    password: "warehouse123",
    name: "Rashedul Karim",
    initials: "RK",
    role: "warehouse_staff",
    title: "Warehouse Staff",
    workspace: "Dhaka DC",
  },
  {
    id: "u-store",
    email: "store@miniso.bd",
    password: "store123",
    name: "Nusrat Jahan",
    initials: "NJ",
    role: "store_manager",
    title: "Store Manager",
    workspace: "Dhanmondi Store",
  },
  {
    id: "u-social",
    email: "social@miniso.bd",
    password: "social123",
    name: "Tania Akter",
    initials: "TA",
    role: "social_media",
    title: "Social Media Lead",
    workspace: "Customer Care",
  },
];

export function getModulesForRole(role: RoleId): ModuleDef[] {
  const ids = new Set(roleModules[role]);
  // Hide leaf tools when a hub exists (keeps My Modules clean)
  const hide: ModuleId[] = [];
  if (ids.has("supply")) {
    hide.push("shipments", "warehouse", "transfers", "procurement");
  }
  if (ids.has("insights")) {
    hide.push("ai", "reports");
  }
  return allModules.filter((m) => ids.has(m.id) && !hide.includes(m.id));
}

export function roleHasModule(role: RoleId, moduleId: ModuleId): boolean {
  return roleModules[role].includes(moduleId);
}

const navItem = (
  label: string,
  href: string,
  icon: LucideIcon,
  moduleId: ModuleId,
  badge?: number
): NavItem => ({ label, href, icon, moduleId, badge });

/**
 * Balanced sidebars: pin + 2 work groups.
 * Daily tools stay visible; less-used tools live in Supply / Insights hubs.
 */
export function getNavForRole(role: RoleId): NavGroup[] {
  const menus: Record<RoleId, NavGroup[]> = {
    owner: [
      {
        label: "",
        items: [
          navItem("Dashboard", "/dashboard/owner", Building2, "owner_dashboard"),
        ],
      },
      {
        label: "Operations",
        items: [
          navItem("Inventory", "/inventory", Boxes, "inventory", 24),
          navItem("Products", "/products", Package, "products"),
          navItem("Shipments", "/shipments", Ship, "shipments", 3),
          navItem("Warehouse", "/warehouse", Warehouse, "warehouse"),
          navItem("Transfers", "/transfers", ArrowLeftRight, "transfers"),
          navItem("Stores", "/stores", Store, "stores"),
          navItem("Supply hub", "/supply", Truck, "supply"),
        ],
      },
      {
        label: "Manage",
        items: [
          navItem("Approvals", "/approvals", CheckSquare, "approvals", 8),
          navItem("Customers", "/customers", Users, "customers"),
          navItem("Social", "/social", MessageSquare, "social_inbox", 2),
          navItem("Insights", "/insights", BarChart3, "insights"),
        ],
      },
    ],

    inventory_manager: [
      {
        label: "",
        items: [
          navItem("Dashboard", "/dashboard/owner", Building2, "owner_dashboard"),
        ],
      },
      {
        label: "Operations",
        items: [
          navItem("Inventory", "/inventory", Boxes, "inventory", 24),
          navItem("Products", "/products", Package, "products"),
          navItem("Shipments", "/shipments", Ship, "shipments", 3),
          navItem("Warehouse", "/warehouse", Warehouse, "warehouse"),
          navItem("Transfers", "/transfers", ArrowLeftRight, "transfers"),
          navItem("Stores", "/stores", Store, "stores"),
          navItem("Procurement", "/procurement", Truck, "procurement"),
        ],
      },
      {
        label: "Manage",
        items: [
          navItem("Approvals", "/approvals", CheckSquare, "approvals", 8),
          navItem("Insights", "/insights", BarChart3, "insights"),
        ],
      },
    ],

    warehouse_staff: [
      {
        label: "",
        items: [
          navItem("Warehouse", "/warehouse", Warehouse, "warehouse"),
        ],
      },
      {
        label: "Tasks",
        items: [
          navItem("Shipments", "/shipments", Ship, "shipments", 3),
          navItem("Inventory", "/inventory", Boxes, "inventory", 24),
          navItem("Transfers", "/transfers", ArrowLeftRight, "transfers"),
          navItem("Products", "/products", Package, "products"),
        ],
      },
    ],

    store_manager: [
      {
        label: "",
        items: [
          navItem("Dashboard", "/dashboard/branch", Store, "branch_dashboard"),
        ],
      },
      {
        label: "Floor",
        items: [
          navItem("POS", "/pos", ShoppingCart, "pos"),
          navItem("Operations", "/operations", ClipboardList, "operations"),
          navItem("Staff", "/workforce", UsersRound, "workforce"),
        ],
      },
      {
        label: "Customers",
        items: [
          navItem("Social agent", "/social", MessageSquare, "social_inbox", 2),
          navItem("Lookup", "/lookup", Search, "product_lookup"),
          navItem("Customers", "/customers", Users, "customers"),
        ],
      },
      {
        label: "Stock",
        items: [
          navItem("Inventory", "/inventory", Boxes, "inventory", 24),
          navItem("Products", "/products", Package, "products"),
          navItem("Transfers", "/transfers", ArrowLeftRight, "transfers"),
        ],
      },
    ],

    social_media: [
      {
        label: "",
        items: [
          navItem("Inbox", "/social", MessageSquare, "social_inbox", 2),
        ],
      },
      {
        label: "Branch",
        items: [
          navItem("Branch dashboard", "/dashboard/branch", Store, "branch_dashboard"),
          navItem("Lookup", "/lookup", Search, "product_lookup"),
          navItem("Products", "/products", Package, "products"),
          navItem("Promotions", "/promotions", Megaphone, "promotions"),
          navItem("Customers", "/customers", Users, "customers"),
        ],
      },
    ],
  };

  return menus[role];
}

/** Map a path to a module for access checks */
export function moduleForPath(pathname: string): ModuleId | null {
  if (pathname === "/home" || pathname === "/login" || pathname === "/") {
    return null;
  }
  if (pathname.startsWith("/dashboard/owner")) return "owner_dashboard";
  if (pathname.startsWith("/dashboard/branch")) return "branch_dashboard";
  if (pathname.startsWith("/dashboard")) return null;
  if (pathname.startsWith("/control-center")) return "control_center";
  if (pathname.startsWith("/inventory")) return "inventory";
  if (pathname.startsWith("/products")) return "products";
  if (pathname.startsWith("/shipments")) return "shipments";
  if (pathname.startsWith("/warehouse")) return "warehouse";
  if (pathname.startsWith("/stores")) return "stores";
  if (pathname.startsWith("/procurement")) return "procurement";
  if (pathname.startsWith("/transfers")) return "transfers";
  if (pathname.startsWith("/supply")) return "supply";
  if (pathname.startsWith("/pos")) return "pos";
  if (pathname.startsWith("/customers")) return "customers";
  if (pathname.startsWith("/social")) return "social_inbox";
  if (pathname.startsWith("/lookup")) return "product_lookup";
  if (pathname.startsWith("/promotions")) return "promotions";
  if (pathname.startsWith("/operations")) return "operations";
  if (pathname.startsWith("/workforce")) return "workforce";
  if (pathname.startsWith("/approvals")) return "approvals";
  if (pathname.startsWith("/ai")) return "ai";
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/insights")) return "insights";
  return null;
}

export function findUser(email: string, password: string): DemoUser | null {
  const normalized = email.trim().toLowerCase();
  return (
    demoUsers.find(
      (u) => u.email === normalized && u.password === password
    ) ?? null
  );
}
