export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  initials: string;
  role:
    | "owner"
    | "inventory_manager"
    | "warehouse_staff"
    | "store_manager"
    | "social_media"
    | "staff";
  title: string;
  workspace: string;
  branchId?: string | null;
  phone?: string;
};

export type Session = {
  token: string;
  user: ApiUser;
  home: string;
};

export type ApprovalRecord = {
  id: string;
  type: string;
  title: string;
  requestedBy: string;
  date: string;
  reason: string;
  financialImpact: number;
  inventoryImpact: string;
  risk: string;
  status?: string;
  poId?: string;
  adjustmentId?: string;
  promotionId?: string;
  branchId?: string;
  decidedBy?: string;
  decidedAt?: string;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export const api = {
  login: (email: string, password: string) =>
    request<Session>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: (body: Record<string, string>) =>
    request<Session>("/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  createInvite: (
    token: string,
    body: {
      email: string;
      role: string;
      name?: string;
      title?: string;
      position?: string;
      branchId?: string;
      warehouseId?: string;
    }
  ) =>
    request<{
      id: string;
      email: string;
      role: string;
      roleLabel: string;
      workspace: string;
      inviteUrl: string;
      emailStatus: string;
      emailError?: string;
      message: string;
      expiresAt: string;
    }>("/v1/invites", { method: "POST", body: JSON.stringify(body) }, token),
  listInvites: (token: string) =>
    request<
      {
        id: string;
        email: string;
        role: string;
        roleLabel: string;
        title: string;
        position: string;
        name: string;
        branchId: string;
        warehouseId: string;
        invitedBy: string;
        status: string;
        emailStatus: string;
        emailError: string;
        createdAt: string;
        expiresAt: string;
        acceptedUserId: string;
      }[]
    >("/v1/invites", {}, token),
  resendInvite: (token: string, id: string) =>
    request<{
      id: string;
      inviteUrl: string;
      emailStatus: string;
      message: string;
    }>(`/v1/invites/${id}/resend`, { method: "POST" }, token),
  revokeInvite: (token: string, id: string) =>
    request<{ status: string }>(`/v1/invites/${id}/revoke`, { method: "POST" }, token),
  getInvite: (inviteToken: string) =>
    request<{
      id: string;
      email: string;
      role: string;
      roleLabel: string;
      title: string;
      position: string;
      name: string;
      branchId: string;
      branchName: string;
      warehouseId: string;
      workspace: string;
      invitedBy: string;
      home: string;
      expiresAt: string;
    }>(`/v1/invites/token/${inviteToken}`),
  acceptInvite: (body: {
    token: string;
    name: string;
    password: string;
    phone?: string;
  }) =>
    request<Session>("/v1/invites/accept", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  me: (token: string) => request<ApiUser>("/v1/me", {}, token),
  stores: () =>
    request<{ id: string; name: string; city: string }[]>("/v1/public/stores"),
  snapshot: (token: string) => request<Snapshot>("/v1/snapshot", {}, token),
  staff: (token: string) => request<StaffBundle>("/v1/staff", {}, token),
  clock: (token: string, type: string) =>
    request<StaffBundle>("/v1/staff/clock", {
      method: "POST",
      body: JSON.stringify({ type }),
    }, token),
  updateProfile: (token: string, body: Record<string, string>) =>
    request<StaffBundle>("/v1/staff/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }, token),
  requestLeave: (token: string, body: Record<string, string>) =>
    request<StaffBundle>("/v1/staff/leave", {
      method: "POST",
      body: JSON.stringify(body),
    }, token),
  reviewLeave: (token: string, id: string, status: string) =>
    request<StaffBundle>(`/v1/leaves/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }, token),
  checkout: (
    token: string,
    body: { storeId?: string; tender: string; lines: { productId: string; qty: number }[] }
  ) =>
    request<{ id: string; total: number }>("/v1/pos/checkout", {
      method: "POST",
      body: JSON.stringify(body),
    }, token),
  createApproval: (token: string, body: Record<string, string | number>) =>
    request<{ id: string; type: string; title: string }>("/v1/approvals", {
      method: "POST",
      body: JSON.stringify(body),
    }, token),
  decideApproval: (token: string, id: string, status: "approved" | "declined") =>
    request(`/v1/approvals/${id}/decision`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }, token),
  createTransfer: (token: string, body: { toStoreId: string; sku: string; qty: number }) =>
    request("/v1/transfers", { method: "POST", body: JSON.stringify(body) }, token),
  receiveTransfer: (token: string, id: string) =>
    request(`/v1/transfers/${id}/receive`, { method: "POST" }, token),
  createAdjustment: (
    token: string,
    body: { sku: string; qty: number; reason: string; storeId?: string }
  ) =>
    request("/v1/adjustments", { method: "POST", body: JSON.stringify(body) }, token),
  createShipment: (token: string, body: Record<string, string | number>) =>
    request("/v1/shipments", { method: "POST", body: JSON.stringify(body) }, token),
  receiveShipment: (token: string, id: string) =>
    request(`/v1/shipments/${id}/receive`, { method: "POST" }, token),
  toggleOperation: (token: string, id: string) =>
    request(`/v1/operations/${id}/toggle`, { method: "POST" }, token),
};

export type Snapshot = {
  org?: {
    hq: {
      id: string;
      name: string;
      country: string;
      city: string;
      ownerUserId: string;
      ownerName: string;
    };
    branches: {
      id: string;
      name: string;
      city: string;
      status: string;
      manager: string;
      managerUserId: string;
      managerEmail: string;
      staffTotal: number;
      staffPresent: number;
      salesToday: number;
      salesTarget: number;
    }[];
  };
  stores: {
    id: string;
    name: string;
    city: string;
    country: string;
    status: "operational" | "maintenance";
    manager: string;
    managerUserId?: string;
    managerEmail?: string;
    hqId?: string;
    salesToday: number;
    transactions: number;
    avgBasket: number;
    stockAvailability: number;
    staffPresent: number;
    staffTotal: number;
    salesTarget?: number;
  }[];
  warehouses: { id: string; name: string; city: string; capacity: number; inbound: number; outbound: number }[];
  products: {
    id: string;
    sku: string;
    name: string;
    category: string;
    brand: string;
    price: number;
    cost: number;
    status: string;
    image: string;
    available: number;
    inTransit: number;
    reserved: number;
    stores: number;
    inventoryStatus: "healthy" | "low" | "critical" | "out" | "transit" | "reserved" | "damaged" | "inspection";
    unitsSold30d: number;
    revenue30d: number;
    margin: number;
    sellThrough: number;
    stockCoverage: number;
  }[];
  inventoryRows: {
    sku: string;
    name: string;
    store: string;
    stock: number;
    target: number;
    status: "healthy" | "low" | "critical" | "out" | "transit" | "reserved" | "damaged" | "inspection";
    category: string;
    productId: string;
    storeId: string;
  }[];
  purchaseOrders: {
    id: string;
    supplier: string;
    destination: string;
    expected: string;
    status: string;
    items: number;
    value: number;
    stage: number;
  }[];
  approvals: ApprovalRecord[];
  approvalHistory?: ApprovalRecord[];
  approvalStats?: {
    inventory: number;
    purchase: number;
    price: number;
    refund: number;
    supplier: number;
    total: number;
  };
  customers: {
    id: string;
    name: string;
    phone: string;
    tier: string;
    lifetimeSpend: number;
    orders: number;
    avgBasket: number;
    points: number;
  }[];
  conversations: {
    id: string;
    channel: string;
    customer: string;
    preview: string;
    time: string;
    unread: boolean;
    aiConfidence: number;
    storeId: string;
  }[];
  socialMessages: { id: string; sender: string; text: string; time: string }[];
  warehouseTasks: { id: string; type: string; ref: string; status: string; priority: string; assignee: string }[];
  transfers: { id: string; from: string; to: string; sku: string; qty: number; status: string }[];
  adjustments: { id: string; sku: string; reason: string; qty: number; status: string }[];
  shipments: { id: string; origin: string; invoice: string; eta: string; status: string; items: number }[];
  promotions: {
    id: string;
    name: string;
    status: string;
    period: string;
    scope: string;
    note: string;
    category: string;
  }[];
  notesByBranch: Record<string, string[]>;
  storeOperations: {
    opening: { id?: string; label: string; done: boolean; warn?: boolean }[];
    during: { id?: string; label: string; done: boolean; warn?: boolean }[];
    closing: { id?: string; label: string; done: boolean; warn?: boolean }[];
  };
  salesSparkline: number[];
  inventorySparkline: number[];
  branchBoards: Record<
    string,
    {
      storeId: string;
      storeName: string;
      manager: string;
      salesTarget: number;
      salesToday: number;
      transactions: number;
      avgBasket: number;
      stockAvailability: number;
      lowStockSkus: number;
      outOfStockSkus: number;
      staffPresent: number;
      staffTotal: number;
      pendingTasks: number;
      lastSaleAt: string;
      alerts: { id: string; severity: "critical" | "warning" | "info"; title: string; detail: string }[];
      topSellers: { name: string; units: number; revenue: number; oos?: boolean }[];
      hourly: number[];
    }
  >;
  notifications: {
    critical: { id: string; title: string; meta: string }[];
    attention: { id: string; title: string; meta: string }[];
    info: { id: string; title: string; meta: string }[];
  };
  regionPerformance: { region: string; stores: number; sales: number; growth: number; availability: number; alerts: number }[];
  topStoresBySales: { name: string; sales: number; growth: number; rank: number }[];
  networkStats: { stores: number; warehouses: number; inventory: number; salesToday: number };
  ownerMetrics: {
    networkSalesToday: number;
    networkSalesChange: number;
    monthToDate: number;
    monthToDateChange: number;
    grossMargin: number;
    grossMarginChange: number;
    inventoryValue: number;
    inventoryTurns: number;
    openStores: number;
    totalStores: number;
    pendingApprovals: number;
    criticalExceptions: number;
    supplierOtif: number;
    forecastAccuracy: number;
  };
};

export type StaffBundle = {
  directory: {
    id: string;
    email: string;
    name: string;
    initials: string;
    branchId: string;
    workspace: string;
    city: string;
    position: string;
    employeeCode: string;
    phone: string;
    address: string;
    joined: string;
    baseSalary: number;
    bankAccount: string;
    emergencyName: string;
    emergencyPhone: string;
    shiftStart: string;
    shiftEnd: string;
    offDay: number;
    managerName: string;
  }[];
  punches: { id: string; staffId: string; type: "in" | "out" | "break_start" | "break_end"; at: string }[];
  leaves: {
    id: string;
    staffId: string;
    kind: "casual" | "sick" | "unpaid";
    from: string;
    to: string;
    reason: string;
    status: "pending" | "approved" | "declined";
  }[];
};
