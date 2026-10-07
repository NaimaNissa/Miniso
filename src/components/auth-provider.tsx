"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  demoUsers,
  findUser,
  getModulesForRole,
  getNavForRole,
  moduleForPath,
  roleHasModule,
  roleMeta,
  type DemoUser,
  type ModuleDef,
  type ModuleId,
  type NavGroup,
  type RoleId,
} from "@/lib/auth";

type AuthContextValue = {
  user: DemoUser | null;
  ready: boolean;
  login: (
    email: string,
    password: string
  ) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  modules: ModuleDef[];
  navGroups: NavGroup[];
  canAccess: (moduleId: ModuleId) => boolean;
  canAccessPath: (pathname: string) => boolean;
  roleLabel: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "miniso-auth-user-id";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const id = localStorage.getItem(STORAGE_KEY);
      if (id) {
        const found = demoUsers.find((u) => u.id === id) ?? null;
        setUser(found);
      }
    } catch {
      // ignore storage errors
    }
    setReady(true);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const found = findUser(email, password);
    if (!found) {
      return { ok: false as const, error: "Invalid email or password" };
    }
    setUser(found);
    try {
      localStorage.setItem(STORAGE_KEY, found.id);
    } catch {
      // ignore
    }
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const modules = useMemo(
    () => (user ? getModulesForRole(user.role) : []),
    [user]
  );

  const navGroups = useMemo(
    () => (user ? getNavForRole(user.role) : []),
    [user]
  );

  const canAccess = useCallback(
    (moduleId: ModuleId) => (user ? roleHasModule(user.role, moduleId) : false),
    [user]
  );

  const canAccessPath = useCallback(
    (pathname: string) => {
      if (!user) return false;
      if (
        pathname === "/home" ||
        pathname === "/dashboard" ||
        pathname === "/"
      ) {
        return true;
      }
      const mod = moduleForPath(pathname);
      if (!mod) return true;
      return roleHasModule(user.role, mod);
    },
    [user]
  );

  const roleLabel = user ? roleMeta[user.role as RoleId].label : "";

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      logout,
      modules,
      navGroups,
      canAccess,
      canAccessPath,
      roleLabel,
    }),
    [
      user,
      ready,
      login,
      logout,
      modules,
      navGroups,
      canAccess,
      canAccessPath,
      roleLabel,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
