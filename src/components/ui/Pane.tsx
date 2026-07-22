"use client";

import { EDGE_MARGIN, paneHBounds, useDraggable } from "@/hooks/useDraggable";
import { CardWindow } from "@/components/ui/CardWindow";
import { useWindowChrome } from "@/lib/minimized";

/**
 * The one draggable window every info pane wears: about, donate, contact and the
 * notification news pane all render through this. It owns the shared shell —
 * placement, the drag, and the sizing that keeps the window an EDGE_MARGIN off
 * each viewport edge — so a pane only supplies its own label, body and footer.
 *
 * The red button closes the window. Route-backed panes (about / donate /
 * contact) leave `onClose` unset and close through the global window manager;
 * the dismissible news pane passes `onClose` so the header bell can unmount it.
 */

const WINDOW_TOP = 48;
const BOTTOM_RESERVED = 48;

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
  const { close, activate } = useWindowChrome({ id, label });

  const { pos, size, onMouseDown, onTouchStart, startResize } = useDraggable(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const winW = Math.min(width, vw - 2 * EDGE_MARGIN);
    const winH = Math.min(height, vh - WINDOW_TOP - BOTTOM_RESERVED);
    return {
      x: Math.max(EDGE_MARGIN, (vw - winW) / 2),
      y: Math.max(WINDOW_TOP, (vh - BOTTOM_RESERVED - winH) / 2),
    };
  }, width, height);

  if (!pos) return null;

  const base: React.CSSProperties = {
    position: "fixed",
    top: pos.y,
    ...paneHBounds(pos.x, size.w),
    height: `min(${size.h}px, calc(100svh - ${Math.round(pos.y) + EDGE_MARGIN}px))`,
    zIndex,
  };

  return (
    <CardWindow
      label={label}
      subtitle={subtitle}
      onClose={onClose ?? close}
      onActivate={activate}
      dragProps={{ onMouseDown, onTouchStart }}
      onResizeStart={startResize}
      style={base}
      footer={footer}
    >
      {children}
    </CardWindow>
  );
}
