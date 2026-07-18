"use client";

import { useState } from "react";
import { EDGE_MARGIN, paneHBounds, useDraggable } from "@/hooks/useDraggable";
import { CardWindow } from "@/components/ui/CardWindow";
import { useMinimizedWindow } from "@/lib/minimized";

/**
 * The one draggable window every info pane wears: about, donate, contact and the
 * notification news pane all render through this. It owns the shared shell —
 * placement, the drag, the normal/minimized/fullscreen state, and the sizing
 * that keeps the window an EDGE_MARGIN off each viewport edge — so a pane only
 * supplies its own label, body and footer.
 *
 * The red button closes the window. Route-backed panes (about / donate /
 * contact) leave `onClose` unset and close through the global window manager;
 * the dismissible news pane passes `onClose` so the header bell can unmount it.
 */

const WINDOW_TOP = 48;
const BOTTOM_RESERVED = 48;
const FULLSCREEN_TOP = 37;

type WinState = "normal" | "fullscreen";

export interface PaneProps {
  // stable key for the window manager and dock
  id: string;
  label: string;
  subtitle?: string;
  width: number;
  height: number;
  // stacking order; a header-launched pane (news) rides above the page's panes
  zIndex?: number;
  // dismissible panes pass this — closing calls back so the parent can unmount
  // (the news pane); route-backed panes omit it and close via the manager
  onClose?: () => void;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export function Pane({
  id,
  label,
  subtitle,
  width,
  height,
  zIndex = 10,
  onClose,
  footer,
  children,
}: PaneProps) {
  const [win, setWin] = useState<WinState>("normal");
  const { windowRef, minimized, minimize, close, activate, animStyle, restoreClass } = useMinimizedWindow({
    id,
    label,
  });

  const { pos, onMouseDown, onTouchStart } = useDraggable(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const winW = Math.min(width, vw - 2 * EDGE_MARGIN);
    const winH = Math.min(height, vh - WINDOW_TOP - BOTTOM_RESERVED);
    return {
      x: Math.max(EDGE_MARGIN, (vw - winW) / 2),
      y: Math.max(WINDOW_TOP, (vh - BOTTOM_RESERVED - winH) / 2),
    };
  });

  if (!pos) return null;

  // minimized panes live as a pill in the dock (rendered by the root layout)
  if (minimized) return null;

  const isFullscreen = win === "fullscreen";

  const base: React.CSSProperties = isFullscreen
    ? { position: "fixed", top: FULLSCREEN_TOP, left: 0, right: 0, bottom: 0, zIndex: Math.max(zIndex, 50) }
    : {
        position: "fixed",
        top: pos.y,
        ...paneHBounds(pos.x, width),
        height: `min(${height}px, calc(100svh - ${Math.round(pos.y) + EDGE_MARGIN}px))`,
        zIndex,
      };

  return (
    <CardWindow
      innerRef={windowRef}
      className={restoreClass}
      label={label}
      subtitle={subtitle}
      fullscreen={isFullscreen}
      onClose={onClose ?? close}
      onMinimize={minimize}
      onActivate={activate}
      onFullscreen={() => setWin(isFullscreen ? "normal" : "fullscreen")}
      dragProps={{ onMouseDown, onTouchStart }}
      style={{ ...base, ...animStyle }}
      footer={footer}
    >
      {children}
    </CardWindow>
  );
}
