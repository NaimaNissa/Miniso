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
  Wallet,
  Clock,
  CalendarDays,
  ListChecks,
  CalendarOff,
} from "lucide-react";

export type RoleId =
  | "owner"
  | "inventory_manager"
  | "warehouse_staff"
  | "store_manager"
  | "social_media"
  | "staff";

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
  | "insights"
  | "staff_today"
  | "staff_schedule"
  | "staff_tasks"
  | "staff_team"
  | "staff_payroll"
  | "staff_leave";

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
  branchId?: string;
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
  staff: {
    label: "Branch Staff",
    shortLabel: "Staff",
    description:
      "Your shift, schedule, tasks, team, payroll, leave, and profile.",
    home: "/staff",
    color: "success",
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
  {
    id: "staff_today",
    name: "Today",
    description: "Clock in, break, and today’s shift",
    href: "/staff",
    icon: Clock,
  },
  {
    id: "staff_schedule",
    name: "Schedule",
    description: "This week’s shifts and your day off",
    href: "/staff/schedule",
    icon: CalendarDays,
  },
  {
    id: "staff_tasks",
    name: "Tasks",
    description: "Floor checklist to stay on track",
    href: "/staff/tasks",
    icon: ListChecks,
  },
  {
    id: "staff_team",
    name: "My team",
    description: "Who is on the floor at your branch",
    href: "/staff/team",
    icon: Users,
  },
  {
    id: "staff_payroll",
    name: "Payroll",
    description: "Estimated pay, hours, and payday",
    href: "/staff/payroll",
    icon: Wallet,
  },
  {
    id: "staff_leave",
    name: "Leave",
    description: "Balances and requests for your manager",
    href: "/staff/leave",
    icon: CalendarOff,
  },
];

/** Modules each role can access. Profile lives in the topbar dropdown, not here. */
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
    "workforce",
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
  staff: [
    "staff_today",
    "staff_schedule",
    "staff_tasks",
    "staff_team",
    "staff_payroll",
    "staff_leave",
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
    title: "Branch Manager",
    workspace: "Dhanmondi Store",
    branchId: "MIN-BD-DHK-014",
  },
  {
    id: "u-store-gulshan",
    email: "gulshan@miniso.bd",
    password: "store123",
    name: "Rahim Khan",
    initials: "RH",
    role: "store_manager",
    title: "Branch Manager",
    workspace: "Gulshan Store",
    branchId: "MIN-BD-DHK-008",
  },
  {
    id: "u-store-uttara",
    email: "uttara@miniso.bd",
    password: "store123",
    name: "Farhana Akter",
    initials: "FA",
    role: "store_manager",
    title: "Branch Manager",
    workspace: "Uttara Store",
    branchId: "MIN-BD-DHK-021",
  },
  {
    id: "u-store-ctg",
    email: "ctg@miniso.bd",
    password: "store123",
    name: "Imran Hossain",
    initials: "IH",
    role: "store_manager",
    title: "Branch Manager",
    workspace: "Chittagong Agrabad",
    branchId: "MIN-BD-CTG-003",
  },
  {
    id: "u-social",
    email: "social@miniso.bd",
    password: "social123",
    name: "Tania Akter",
    initials: "TA",
    role: "social_media",
    title: "Social Media Lead",
    workspace: "Dhanmondi Store",
    branchId: "MIN-BD-DHK-014",
  },
  {
    id: "st-rafi",
    email: "staff@miniso.bd",
    password: "staff123",
    name: "Rafi Islam",
    initials: "RI",
    role: "staff",
    title: "Cashier",
    workspace: "Dhanmondi Store",
    branchId: "MIN-BD-DHK-014",
  },
];

/** Login page grouping — HQ vs branch managers vs floor. */
export function demoUsersByLane(): { label: string; users: DemoUser[] }[] {
  return [
    {
      label: "Headquarters",
      users: demoUsers.filter((u) =>
        ["owner", "inventory_manager", "warehouse_staff"].includes(u.role)
      ),
    },
    {
      label: "Branch managers",
      users: demoUsers.filter((u) => u.role === "store_manager"),
    },
    {
      label: "Floor & social",
      users: demoUsers.filter((u) => u.role === "staff" || u.role === "social_media"),
    },
  ];
}

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
          navItem("People", "/workforce", UsersRound, "workforce"),
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
          navItem("People", "/workforce", UsersRound, "workforce"),
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
          navItem("My team", "/workforce", UsersRound, "workforce"),
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
    staff: [
      {
        label: "",
        items: [navItem("Today", "/staff", Clock, "staff_today")],
      },
      {
        label: "Work",
        items: [
          navItem("Schedule", "/staff/schedule", CalendarDays, "staff_schedule"),
          navItem("Tasks", "/staff/tasks", ListChecks, "staff_tasks"),
          navItem("My team", "/staff/team", Users, "staff_team"),
        ],
      },
      {
        label: "Pay",
        items: [
          navItem("Payroll", "/staff/payroll", Wallet, "staff_payroll"),
          navItem("Leave", "/staff/leave", CalendarOff, "staff_leave"),
        ],
      },
    ],
  };

  return menus[role];
}

/** Map a path to a module for access checks */
export function moduleForPath(pathname: string): ModuleId | null {
  if (
    pathname === "/home" ||
    pathname === "/login" ||
    pathname === "/" ||
    pathname.startsWith("/staff/signup") ||
    pathname.startsWith("/invite/")
  ) {
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
  if (pathname.startsWith("/staff/schedule")) return "staff_schedule";
  if (pathname.startsWith("/staff/tasks")) return "staff_tasks";
  if (pathname.startsWith("/staff/team")) return "staff_team";
  if (pathname.startsWith("/staff/payroll")) return "staff_payroll";
  if (pathname.startsWith("/staff/leave")) return "staff_leave";
  if (pathname.startsWith("/staff")) return "staff_today";
  return null;
}

export function isAuthPage(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/staff/signup") ||
    pathname.startsWith("/invite/")
  );
}
