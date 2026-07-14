"use client";

import { useState } from "react";
import { useDraggable } from "@/hooks/useDraggable";
import { BTN_W, CardWindow, NavBar } from "@/components/ui/CardWindow";

interface Section {
  title: string;
  rendered: React.ReactNode;
}

type WinState = "normal" | "minimized" | "fullscreen" | "closed";

const WINDOW_W = 680;
// sized to the longest section (~120 words), so the shorter ones don't sit in a
// half-empty pane; the body scrolls if a section ever outgrows it
const WINDOW_H = 420;
const WINDOW_TOP = 48;
const BOTTOM_RESERVED = 48;

export function AboutPanel({ sections }: { sections: Section[] }) {
  const [index, setIndex] = useState(0);
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
          zIndex: 10,
        }}
      >
        about
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
      label="about"
      subtitle={sections[index].title}
      minimized={isMinimized}
      fullscreen={isFullscreen}
      onClose={() => setWin("closed")}
      onMinimize={() => setWin(isMinimized ? "normal" : "minimized")}
      onFullscreen={() => setWin(isFullscreen ? "normal" : "fullscreen")}
      dragProps={{ onMouseDown, onTouchStart }}
      style={style}
      footer={
        <NavBar
          index={index}
          total={sections.length}
          onPrev={() => setIndex((i) => Math.max(0, i - 1))}
          onNext={() => setIndex((i) => Math.min(sections.length - 1, i + 1))}
        />
      }
    >
      {isMinimized ? (
        <div style={{ padding: "56px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <a
            className="pixel-edge"
            href="/found"
            style={{
              fontSize: 13,
              letterSpacing: "0.18em",
              color: "var(--muted)",
              background: "none",
              border: "1px solid var(--border)",
              padding: "10px 24px",
              cursor: "pointer",
              fontFamily: "inherit",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            you&apos;ve found me
          </a>
        </div>
      ) : (
        <div
          style={{
            padding: "28px 28px 24px",
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "flex",
            fontSize: 15,
            lineHeight: 1.85,
            color: "var(--foreground)",
          }}
        >
          {sections.map((s, i) => (
            <div
              key={s.title}
              // margin auto rather than justify/align center: a section taller
              // than the pane still scrolls from its top instead of being clipped
              style={{ display: i === index ? "block" : "none", margin: "auto", width: "100%" }}
            >
              {s.rendered}
            </div>
          ))}
        </div>
      )}
    </CardWindow>
  );
}
