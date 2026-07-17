"use client";

import Link from "next/link";
import { useState } from "react";
import { PLAY_HREF, siteConfig, socialLinks } from "@/lib/constants";
import { useDraggable } from "@/hooks/useDraggable";
import { actionBtnStyle, BTN_W, CardWindow, footerBarStyle } from "@/components/ui/CardWindow";

type WinState = "normal" | "minimized" | "fullscreen" | "closed";

const WINDOW_W = 560;
const WINDOW_H = 420;
const WINDOW_TOP = 48;
const BOTTOM_RESERVED = 48;

// The same window as contact, blog and research — the frame, title bar and
// footer all come from CardWindow, so this pane is theirs down to the hairline.
export function DonatePanel() {
  const [win, setWin] = useState<WinState>("normal");

  const { pos, onMouseDown, onTouchStart } = useDraggable(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const winW = Math.min(WINDOW_W, vw - 32);
    const winH = Math.min(WINDOW_H, vh - WINDOW_TOP - BOTTOM_RESERVED);
    return {
      x: Math.max(16, (vw - winW) / 2),
      y: Math.max(WINDOW_TOP, (vh - BOTTOM_RESERVED - winH) / 2),
    };
  });

  if (!pos) return null;

  if (win === "closed") {
    return (
      <button
        className="pixel-edge"
        onClick={() => setWin("normal")}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          ...actionBtnStyle,
          fontSize: 13,
          letterSpacing: "0.14em",
          color: "var(--muted)",
          padding: "8px 0",
          width: BTN_W,
          zIndex: 10,
        }}
      >
        support
      </button>
    );
  }

  const isFullscreen = win === "fullscreen";
  const isMinimized = win === "minimized";

  const style: React.CSSProperties = isFullscreen
    ? { position: "fixed", top: 37, left: 0, right: 0, bottom: 0, zIndex: 50 }
    : {
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: `min(${WINDOW_W}px, calc(100vw - 32px))`,
        height: isMinimized
          ? "auto"
          : `min(${WINDOW_H}px, calc(100svh - ${Math.round(pos.y) + 24}px))`,
        zIndex: 10,
      };

  return (
    <CardWindow
      label="support"
      subtitle="research fund"
      minimized={isMinimized}
      fullscreen={isFullscreen}
      onClose={() => setWin("closed")}
      onMinimize={() => setWin(isMinimized ? "normal" : "minimized")}
      onFullscreen={() => setWin(isFullscreen ? "normal" : "fullscreen")}
      dragProps={{ onMouseDown, onTouchStart }}
      style={style}
      footer={
        <div style={footerBarStyle}>
          {/* the table is an overlay on the home page, so this is the way back */}
          <Link
            href={PLAY_HREF}
            className="pixel-edge"
            style={{ ...actionBtnStyle, display: "inline-block", textDecoration: "none" }}
          >
            ← play again
          </Link>
          <a
            href={siteConfig.donationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-edge"
            style={{ ...actionBtnStyle, display: "inline-block", textDecoration: "none" }}
          >
            fund the research →
          </a>
        </div>
      }
    >
      {!isMinimized && (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 18,
          }}
        >
          <p style={noteStyle}>
            The house won — thanks for playing. I&apos;m an independent researcher funding this
            work out of my own pocket, and your support goes directly toward the API credits
            that keep the experiments running.
          </p>
          <p style={noteStyle}>
            Any amount genuinely helps and is deeply appreciated. Supporters are credited in the
            acknowledgements section of the work their funding makes possible.
          </p>

          <a
            href={socialLinks.email}
            style={{
              alignSelf: "start",
              fontSize: 13,
              letterSpacing: "0.10em",
              color: "var(--muted)",
              textDecoration: "none",
              borderBottom: "1px solid var(--border)",
              paddingBottom: 2,
            }}
          >
            or reach out first →
          </a>
        </div>
      )}
    </CardWindow>
  );
}

const noteStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.8,
  color: "var(--foreground)",
  margin: 0,
  letterSpacing: "0.04em",
};
