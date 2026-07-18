"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// A window in the dock. `href` is unused now that windows open in place over the
// current page rather than navigating, but kept optional so call sites needn't
// change.
export interface MinimizedItem {
  id: string;
  label: string;
  href?: string;
}

interface WindowsCtx {
  // ids of windows currently on screen, in stacking order (last = on top)
  open: string[];
  minimizedItems: MinimizedItem[];
  // ids playing their grow-back entrance
  restoring: Set<string>;
  // bring a window up on the current page (over whatever else is showing)
  openWindow: (id: string) => void;
  // show only this window — what a route does on load; null clears the screen
  openExclusive: (id: string | null) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (item: MinimizedItem) => void;
  restoreWindow: (id: string) => void;
  // raise an already-open window above the others (click-to-front)
  bringToFront: (id: string) => void;
  clearRestoring: (id: string) => void;
}

const Ctx = createContext<WindowsCtx | null>(null);

const remove = (arr: string[], id: string) => arr.filter((x) => x !== id);

// The window manager lives in the root layout, so open windows and the dock
// outlive any single page: minimize a window, wander to another route, and the
// pill is still there — click it and the window opens right where you are.
export function MinimizedProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<string[]>([]);
  const [minimizedItems, setMinimizedItems] = useState<MinimizedItem[]>([]);
  const [restoring, setRestoring] = useState<Set<string>>(() => new Set());

  // actions are stable (functional updaters, no deps) so effects that call them
  // — e.g. a route opening its window on mount — don't re-fire on every state
  // change and loop
  const openWindow = useCallback((id: string) => {
    setMinimizedItems((prev) => prev.filter((i) => i.id !== id));
    setOpen((prev) => [...remove(prev, id), id]);
  }, []);

  const openExclusive = useCallback((id: string | null) => {
    setMinimizedItems((prev) => (id ? prev.filter((i) => i.id !== id) : prev));
    setOpen(id ? [id] : []);
  }, []);

  const closeWindow = useCallback((id: string) => {
    setOpen((prev) => remove(prev, id));
  }, []);

  const minimizeWindow = useCallback((item: MinimizedItem) => {
    setOpen((prev) => remove(prev, item.id));
    setMinimizedItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setMinimizedItems((prev) => prev.filter((i) => i.id !== id));
    setOpen((prev) => [...remove(prev, id), id]);
    setRestoring((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const bringToFront = useCallback((id: string) => {
    setOpen((prev) => {
      // already on top (or not open) — no reorder, so no needless re-render
      if (prev[prev.length - 1] === id || !prev.includes(id)) return prev;
      return [...remove(prev, id), id];
    });
  }, []);

  const clearRestoring = useCallback((id: string) => {
    setRestoring((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const value = useMemo<WindowsCtx>(
    () => ({
      open,
      minimizedItems,
      restoring,
      openWindow,
      openExclusive,
      closeWindow,
      minimizeWindow,
      restoreWindow,
      bringToFront,
      clearRestoring,
    }),
    [open, minimizedItems, restoring, openWindow, openExclusive, closeWindow, minimizeWindow, restoreWindow, bringToFront, clearRestoring],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWindows() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWindows must be used within MinimizedProvider");
  return ctx;
}

// A route's only job now is to bring its window up on load; the window itself is
// mounted globally by WindowLayer. `null` (the home page) clears the screen.
export function RouteWindow({ id }: { id: string | null }) {
  const { openExclusive } = useWindows();
  useEffect(() => {
    openExclusive(id);
  }, [id, openExclusive]);
  return null;
}

// how long the shrink-to-dock / grow-back animations run
const ANIM_MS = 400;

/**
 * The window-chrome behaviour every pane shares. A pane renders through
 * CardWindow, hands `windowRef` to its `innerRef`, spreads `animStyle` into its
 * style, adds `restoreClass` to its className, calls `minimize()` from the
 * yellow button and `close()` from the red one. While `minimized` is true the
 * pane renders nothing — it now lives as a pill in the dock.
 */
export function useMinimizedWindow(item: MinimizedItem) {
  const ctx = useWindows();
  const windowRef = useRef<HTMLDivElement>(null);
  const [animStyle, setAnimStyle] = useState<React.CSSProperties | null>(null);
  const minimized = ctx.minimizedItems.some((i) => i.id === item.id);
  const restoring = ctx.restoring.has(item.id);

  // let the grow-back entrance play once, then drop the flag
  useEffect(() => {
    if (!restoring) return;
    const t = setTimeout(() => ctx.clearRestoring(item.id), ANIM_MS + 40);
    return () => clearTimeout(t);
  }, [restoring, item.id, ctx]);

  function minimize() {
    const el = windowRef.current;
    if (!el) {
      ctx.minimizeWindow(item);
      return;
    }
    // fly the window toward the dock at the bottom-centre of the viewport,
    // shrinking into it — the classic iOS minimize
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    setAnimStyle({
      transform: `translate(${window.innerWidth / 2 - cx}px, ${window.innerHeight - 24 - cy}px) scale(0.06)`,
      opacity: 0,
      transformOrigin: "50% 100%",
      transition: `transform ${ANIM_MS}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${ANIM_MS}ms ease`,
      pointerEvents: "none",
    });
    setTimeout(() => {
      ctx.minimizeWindow(item);
      setAnimStyle(null);
    }, ANIM_MS - 20);
  }

  return {
    windowRef,
    minimized,
    minimize,
    close: () => ctx.closeWindow(item.id),
    // raise this window above the others; wired to the whole window on press so
    // clicking anywhere in a covered window brings it to the front
    activate: () => ctx.bringToFront(item.id),
    animStyle,
    restoreClass: restoring ? "window-restore" : undefined,
  };
}

// The dock: a row of pills pinned to the bottom-centre of every page. Clicking
// one opens its window in place, over whatever page you're currently on.
export function MinimizedDock() {
  const ctx = useWindows();

  if (ctx.minimizedItems.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 22,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8,
        zIndex: 120,
        maxWidth: "calc(100vw - 32px)",
        overflowX: "auto",
        padding: "0 4px",
        scrollbarWidth: "none",
      }}
    >
      {ctx.minimizedItems.map((item) => (
        <button
          key={item.id}
          className="dock-pill pixel-edge"
          onClick={() => ctx.restoreWindow(item.id)}
          style={{
            flexShrink: 0,
            fontSize: 12,
            letterSpacing: "0.13em",
            color: "var(--foreground)",
            background: "var(--card)",
            border: "1px solid var(--border)",
            padding: "9px 16px",
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
            backdropFilter: "blur(8px)",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
