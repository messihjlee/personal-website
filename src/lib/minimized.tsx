"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

// A window the manager tracks. `href` is unused now that windows open in place
// over the current page rather than navigating, but kept optional so call sites
// needn't change.
export interface WindowItem {
  id: string;
  label: string;
  href?: string;
}

interface WindowsCtx {
  // ids of windows currently on screen, in stacking order (last = on top)
  open: string[];
  // bring a window up on the current page (over whatever else is showing)
  openWindow: (id: string) => void;
  // show only this window — what a route does on load; null clears the screen
  openExclusive: (id: string | null) => void;
  closeWindow: (id: string) => void;
  // raise an already-open window above the others (click-to-front)
  bringToFront: (id: string) => void;
}

const Ctx = createContext<WindowsCtx | null>(null);

const remove = (arr: string[], id: string) => arr.filter((x) => x !== id);

// The window manager lives in the root layout, so open windows outlive any
// single page and can float over whatever route is showing.
export function MinimizedProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<string[]>([]);

  // actions are stable (functional updaters, no deps) so effects that call them
  // — e.g. a route opening its window on mount — don't re-fire on every state
  // change and loop
  const openWindow = useCallback((id: string) => {
    setOpen((prev) => [...remove(prev, id), id]);
  }, []);

  const openExclusive = useCallback((id: string | null) => {
    setOpen(id ? [id] : []);
  }, []);

  const closeWindow = useCallback((id: string) => {
    setOpen((prev) => remove(prev, id));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setOpen((prev) => {
      // already on top (or not open) — no reorder, so no needless re-render
      if (prev[prev.length - 1] === id || !prev.includes(id)) return prev;
      return [...remove(prev, id), id];
    });
  }, []);

  const value = useMemo<WindowsCtx>(
    () => ({ open, openWindow, openExclusive, closeWindow, bringToFront }),
    [open, openWindow, openExclusive, closeWindow, bringToFront],
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

/**
 * The window-chrome behaviour every route-backed pane shares: the red button
 * closes the window, and because these panes are the only thing on their route,
 * closing returns to the home card desktop rather than leaving a blank page.
 * Pressing anywhere in the window raises it above any others.
 */
export function useWindowChrome(item: WindowItem) {
  const ctx = useWindows();
  const router = useRouter();

  const close = useCallback(() => {
    ctx.closeWindow(item.id);
    // the pane is the whole page, so there's nothing to fall back to — send the
    // visitor home to the desktop of cards
    router.push("/");
  }, [ctx, item.id, router]);

  const activate = useCallback(() => ctx.bringToFront(item.id), [ctx, item.id]);

  return { close, activate };
}
