"use client";

import { useAuth } from "@/components/auth-provider";
import { api, type Snapshot } from "@/lib/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type RetailContextValue = {
  ready: boolean;
  error: string;
  reload: () => Promise<void>;
  data: Snapshot | null;
};

const RetailContext = createContext<RetailContextValue | null>(null);

export function RetailProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [data, setData] = useState<Snapshot | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!token) {
      setData(null);
      setReady(true);
      return;
    }
    try {
      const snapshot = await api.snapshot(token);
      setData(snapshot);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load records");
    } finally {
      setReady(true);
    }
  }, [token]);

  useEffect(() => {
    setReady(false);
    void reload();
  }, [reload]);

  const value = useMemo(
    () => ({ ready, error, reload, data }),
    [ready, error, reload, data]
  );

  return (
    <RetailContext.Provider value={value}>{children}</RetailContext.Provider>
  );
}

const emptyOps = { opening: [], during: [], closing: [] };

export function useRetail() {
  const ctx = useContext(RetailContext);
  const { user, token } = useAuth();
  if (!ctx) throw new Error("useRetail must be used within RetailProvider");
  const data = ctx.data;
  const branchId = user?.branchId || "MIN-BD-DHK-014";
  const board = data?.branchBoards?.[branchId];
  const branchToday = {
    storeId: board?.storeId ?? branchId,
    storeName: board?.storeName ?? user?.workspace ?? "Branch",
    manager: board?.manager ?? "",
    salesTarget: board?.salesTarget || 1,
    salesToday: board?.salesToday ?? 0,
    transactions: board?.transactions ?? 0,
    avgBasket: board?.avgBasket ?? 0,
    stockAvailability: board?.stockAvailability ?? 0,
    lowStockSkus: board?.lowStockSkus ?? 0,
    outOfStockSkus: board?.outOfStockSkus ?? 0,
    staffPresent: board?.staffPresent ?? 0,
    staffTotal: board?.staffTotal ?? 0,
    pendingTasks: board?.pendingTasks ?? 0,
    lastSaleAt: board?.lastSaleAt ?? "",
  };
  return {
    ready: ctx.ready,
    error: ctx.error,
    reload: ctx.reload,
    token,
    org: data?.org ?? null,
    stores: data?.stores ?? [],
    warehouses: data?.warehouses ?? [],
    products: data?.products ?? [],
    inventoryRows: data?.inventoryRows ?? [],
    purchaseOrders: data?.purchaseOrders ?? [],
    approvals: data?.approvals ?? [],
    approvalHistory: data?.approvalHistory ?? [],
    approvalStats: data?.approvalStats ?? {
      inventory: 0,
      purchase: 0,
      price: 0,
      refund: 0,
      supplier: 0,
      total: 0,
    },
    customers: data?.customers ?? [],
    conversations: data?.conversations ?? [],
    socialMessages: data?.socialMessages ?? [],
    warehouseTasks: data?.warehouseTasks ?? [],
    transfers: data?.transfers ?? [],
    adjustments: data?.adjustments ?? [],
    shipments: data?.shipments ?? [],
    promotions: data?.promotions ?? [],
    notesByBranch: data?.notesByBranch ?? {},
    storeOperations: data?.storeOperations ?? emptyOps,
    salesSparkline: data?.salesSparkline ?? [],
    inventorySparkline: data?.inventorySparkline ?? [],
    notifications: data?.notifications ?? { critical: [], attention: [], info: [] },
    regionPerformance: data?.regionPerformance ?? [],
    topStoresBySales: data?.topStoresBySales ?? [],
    networkStats: data?.networkStats ?? {
      stores: 0,
      warehouses: 0,
      inventory: 0,
      salesToday: 0,
    },
    ownerMetrics: data?.ownerMetrics ?? {
      networkSalesToday: 0,
      networkSalesChange: 0,
      monthToDate: 0,
      monthToDateChange: 0,
      grossMargin: 0,
      grossMarginChange: 0,
      inventoryValue: 0,
      inventoryTurns: 0,
      openStores: 0,
      totalStores: 0,
      pendingApprovals: 0,
      criticalExceptions: 0,
      supplierOtif: 0,
      forecastAccuracy: 0,
    },
    branchId,
    branchBoards: data?.branchBoards ?? {},
    branchToday,
    branchAlerts: board?.alerts ?? [],
    branchTopSellers: board?.topSellers ?? [],
    branchHourlySales: board?.hourly ?? [],
    posCatalog: (data?.products ?? []).map((product) => {
      const atBranch = (data?.inventoryRows ?? []).find(
        (row) => row.productId === product.id && row.storeId === branchId
      );
      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        image: product.image,
        available: atBranch?.stock ?? 0,
      };
    }),
  };
}
