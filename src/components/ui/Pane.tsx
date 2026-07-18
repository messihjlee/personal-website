"use client";

import { useState } from "react";
import { EDGE_MARGIN, paneHBounds, useDraggable } from "@/hooks/useDraggable";
import { BTN_W, CardWindow } from "@/components/ui/CardWindow";

/**
 * The one draggable window every info pane wears: about, donate, contact and the
 * notification news pane all render through this. It owns the shared shell —
 * placement, the drag, the normal/minimized/fullscreen state, and the sizing
 * that keeps the window an EDGE_MARGIN off each viewport edge — so a pane only
 * supplies its own label, body and footer.
 *
 * Two closing modes:
 *  - persistent: pass `reopenLabel`, and closing collapses the window to a pill
 *    that reopens it (about / donate / contact live on their own page).
 *  - dismissible: pass `onClose`, and closing hands back to the parent to unmount
 *    (the news pane, launched from the header bell).
 */

const WINDOW_TOP = 48;
const BOTTOM_RESERVED = 48;
const FULLSCREEN_TOP = 37;

type WinState = "normal" | "minimized" | "fullscreen" | "closed";

export interface PaneProps {
  label: string;
  subtitle?: string;
  width: number;
  height: number;
  // stacking order; a header-launched pane (news) rides above the page's panes
  zIndex?: number;
  // persistent panes pass this — closing collapses to a reopen pill with this text
  reopenLabel?: string;
  // dismissible panes pass this — closing calls back so the parent can unmount
  onClose?: () => void;
  footer?: React.ReactNode;
  // shown in the body while minimized; omit to show nothing
  minimizedContent?: React.ReactNode;
  children?: React.ReactNode;
}

export function Pane({
  label,
  subtitle,
  width,
  height,
  zIndex = 10,
  reopenLabel,
  onClose,
  footer,
  minimizedContent,
  children,
}: PaneProps) {
  const [win, setWin] = useState<WinState>("normal");

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

  if (win === "closed") {
    // only persistent panes reach here; dismissible ones are unmounted by onClose
    if (!reopenLabel) return null;
    return (
      <button
        className="pixel-edge"
        onClick={() => setWin("normal")}
        style={{
          position: "fixed",
          left: Math.max(EDGE_MARGIN, pos.x),
          top: pos.y,
          fontSize: 13,
          letterSpacing: "0.14em",
          color: "var(--muted)",
          background: "none",
          border: "1px solid var(--border)",
          padding: "8px 0",
          width: BTN_W,
          textAlign: "center",
          cursor: "pointer",
          fontFamily: "inherit",
          zIndex,
        }}
      >
        {reopenLabel}
      </button>
    );
  }

  const isFullscreen = win === "fullscreen";
  const isMinimized = win === "minimized";

  const style: React.CSSProperties = isFullscreen
    ? { position: "fixed", top: FULLSCREEN_TOP, left: 0, right: 0, bottom: 0, zIndex: Math.max(zIndex, 50) }
    : {
        position: "fixed",
        top: pos.y,
        ...paneHBounds(pos.x, width),
        height: isMinimized
          ? "auto"
          : `min(${height}px, calc(100svh - ${Math.round(pos.y) + EDGE_MARGIN}px))`,
        zIndex,
      };

  return (
    <CardWindow
      label={label}
      subtitle={subtitle}
      minimized={isMinimized}
      fullscreen={isFullscreen}
      onClose={reopenLabel ? () => setWin("closed") : onClose}
      onMinimize={() => setWin(isMinimized ? "normal" : "minimized")}
      onFullscreen={() => setWin(isFullscreen ? "normal" : "fullscreen")}
      dragProps={{ onMouseDown, onTouchStart }}
      style={style}
      footer={footer}
    >
      {isMinimized ? minimizedContent : children}
    </CardWindow>
  );
}
