"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, type ApiUser } from "@/lib/api";
import {
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
  token: string | null;
  ready: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: true; home: string } | { ok: false; error: string }>;
  signup: (
    body: Record<string, string>
  ) => Promise<{ ok: true; home: string } | { ok: false; error: string }>;
  acceptInvite: (body: {
    token: string;
    name: string;
    password: string;
    phone?: string;
  }) => Promise<{ ok: true; home: string } | { ok: false; error: string }>;
  logout: () => void;
  refreshUser: () => void;
  modules: ModuleDef[];
  navGroups: NavGroup[];
  canAccess: (moduleId: ModuleId) => boolean;
  canAccessPath: (pathname: string) => boolean;
  roleLabel: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "miniso-auth-token";

function asUser(user: ApiUser): DemoUser {
  return {
    id: user.id,
    email: user.email,
    password: "",
    name: user.name,
    initials: user.initials,
    role: user.role,
    title: user.title,
    workspace: user.workspace,
    branchId: user.branchId || undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const persist = useCallback((next: SessionLike | null) => {
    if (!next) {
      setUser(null);
      setToken(null);
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        // ignore
      }
      return;
    }
    setUser(asUser(next.user));
    setToken(next.token);
    try {
      localStorage.setItem(TOKEN_KEY, next.token);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const stored = (() => {
      try {
        return localStorage.getItem(TOKEN_KEY);
      } catch {
        return null;
      }
    })();
    if (!stored) {
      setReady(true);
      return;
    }
    api
      .me(stored)
      .then((me) => {
        if (cancelled) return;
        setToken(stored);
        setUser(asUser(me));
      })
      .catch(() => {
        if (!cancelled) persist(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [persist]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const session = await api.login(email, password);
        persist(session);
        return { ok: true as const, home: session.home };
      } catch (error) {
        return {
          ok: false as const,
          error: error instanceof Error ? error.message : "Invalid email or password",
        };
      }
    },
    [persist]
  );

  const signup = useCallback(
    async (body: Record<string, string>) => {
      try {
        const session = await api.signup(body);
        persist(session);
        return { ok: true as const, home: session.home };
      } catch (error) {
        return {
          ok: false as const,
          error: error instanceof Error ? error.message : "Could not create account",
        };
      }
    },
    [persist]
  );

  const acceptInvite = useCallback(
    async (body: {
      token: string;
      name: string;
      password: string;
      phone?: string;
    }) => {
      try {
        const session = await api.acceptInvite(body);
        persist(session);
        return { ok: true as const, home: session.home };
      } catch (error) {
        return {
          ok: false as const,
          error:
            error instanceof Error ? error.message : "Could not accept invite",
        };
      }
    },
    [persist]
  );

  const logout = useCallback(() => persist(null), [persist]);

  const refreshUser = useCallback(() => {
    if (!token) return;
    api
      .me(token)
      .then((me) => setUser(asUser(me)))
      .catch(() => persist(null));
  }, [persist, token]);

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
      if (pathname === "/home" || pathname === "/dashboard" || pathname === "/") {
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
      token,
      ready,
      login,
      signup,
      acceptInvite,
      logout,
      refreshUser,
      modules,
      navGroups,
      canAccess,
      canAccessPath,
      roleLabel,
    }),
    [
      user,
      token,
      ready,
      login,
      signup,
      acceptInvite,
      logout,
      refreshUser,
      modules,
      navGroups,
      canAccess,
      canAccessPath,
      roleLabel,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

type SessionLike = { token: string; user: ApiUser };

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
