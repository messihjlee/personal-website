"use client";

import { useState } from "react";
import { Mail, Github, GraduationCap, BookOpen } from "lucide-react";
import { useDraggable } from "@/hooks/useDraggable";
import { BTN_W, CardWindow, NavBar } from "@/components/ui/CardWindow";

interface WindowEntry {
  id: string;
  title: string;
  icon: React.ReactNode;
  note: string;
  linkLabel: string;
  href: string;
}

type WinState = "normal" | "minimized" | "fullscreen" | "closed";

const WINDOW_W = 680;
const WINDOW_H = 360;
const WINDOW_TOP = 48;
const BOTTOM_RESERVED = 48;

const WINDOWS: WindowEntry[] = [
  {
    id: "email",
    title: "email",
    icon: <Mail size={32} strokeWidth={1.5} />,
    note: "Want to reach out directly or inquire about a possible collaboration opportunity?",
    linkLabel: "messihjlee@gmail.com",
    href: "mailto:messihjlee@gmail.com",
  },
  {
    id: "github",
    title: "github",
    icon: <Github size={32} strokeWidth={1.5} />,
    note: "Curious about what projects I'm currently working on?",
    linkLabel: "github.com/messihjlee",
    href: "https://github.com/messihjlee",
  },
  {
    id: "scholar",
    title: "google scholar",
    icon: <GraduationCap size={32} strokeWidth={1.5} />,
    note: "Want to browse my published work and citation record?",
    linkLabel: "Google Scholar profile",
    href: "https://scholar.google.com/citations?user=qUz4nA8AAAAJ",
  },
  {
    id: "researchgate",
    title: "researchgate",
    icon: <BookOpen size={32} strokeWidth={1.5} />,
    note: "Looking for preprints, full texts, or research updates?",
    linkLabel: "ResearchGate profile",
    href: "https://www.researchgate.net/profile/Messi-Lee",
  },
];

export function ContactPanel() {
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

  const entry = WINDOWS[index];

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
        contact
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
      label="contact"
      subtitle={entry.title}
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
          total={WINDOWS.length}
          onPrev={() => setIndex((i) => Math.max(0, i - 1))}
          onNext={() => setIndex((i) => Math.min(WINDOWS.length - 1, i + 1))}
        />
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
            alignItems: "center",
            justifyContent: "center",
            gap: 22,
            textAlign: "center",
          }}
        >
          <div style={{ color: "var(--foreground)", opacity: 0.75 }}>{entry.icon}</div>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.8,
              color: "var(--foreground)",
              margin: 0,
              letterSpacing: "0.04em",
              maxWidth: 420,
            }}
          >
            {entry.note}
          </p>

          <a
            href={entry.href}
            target={entry.id === "email" ? undefined : "_blank"}
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              fontSize: 13,
              letterSpacing: "0.10em",
              color: "var(--foreground)",
              textDecoration: "none",
              borderBottom: "1px solid var(--border)",
              paddingBottom: 2,
            }}
          >
            {entry.linkLabel} →
          </a>
        </div>
      )}
    </CardWindow>
  );
}
