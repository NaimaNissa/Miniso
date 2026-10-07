"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";

type Scope = {
  countryId: string;
  countryName: string;
  storeId: string | null;
  storeName: string | null;
};

type AppContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  scope: Scope;
  setScope: (scope: Partial<Scope>) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  aiOpen: boolean;
  setAiOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [themeReady, setThemeReady] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [scope, setScopeState] = useState<Scope>({
    countryId: "bd",
    countryName: "Bangladesh",
    storeId: null,
    storeName: null,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("miniso-theme") as Theme | null;
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
      }
    } catch {
      // ignore
    }
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("miniso-theme", theme);
    } catch {
      // ignore
    }
  }, [theme, themeReady]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === "Escape") {
        setCommandOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  const setScope = useCallback((partial: Partial<Scope>) => {
    setScopeState((s) => ({ ...s, ...partial }));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      scope,
      setScope,
      commandOpen,
      setCommandOpen,
      aiOpen,
      setAiOpen,
      notificationsOpen,
      setNotificationsOpen,
      sidebarCollapsed,
      setSidebarCollapsed,
    }),
    [
      theme,
      toggleTheme,
      scope,
      setScope,
      commandOpen,
      aiOpen,
      notificationsOpen,
      sidebarCollapsed,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within Providers");
  return ctx;
}
