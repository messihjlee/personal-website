"use client";

import { Coins, Mail } from "lucide-react";
import { siteConfig, socialLinks } from "@/lib/constants";
import { useDraggable } from "@/hooks/useDraggable";

// A draggable window (grab the title bar) in the same visual language as the
// blog/contact windows.
export function DonatePanel() {
  const { pos, onMouseDown, onTouchStart } = useDraggable(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(560, vw - 32);
    return { x: Math.max(16, (vw - w) / 2), y: Math.max(56, (vh - 440) / 2) };
  });

  if (!pos) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: "min(560px, calc(100vw - 32px))",
        display: "flex",
        flexDirection: "column",
        border: "1px solid var(--border)",
        background: "var(--background)",
        zIndex: 10,
      }}
    >
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 14px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
          userSelect: "none",
          cursor: "grab",
          touchAction: "none",
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--foreground)" }}>
          support · research fund
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={dotStyle("#ff5f57")} />
          <span style={dotStyle("#f5a623")} />
          <span style={dotStyle("#27c93f")} />
        </div>
      </div>

      <div style={{ padding: "30px 26px", display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ color: "var(--foreground)", opacity: 0.75 }}>
          <Coins size={32} strokeWidth={1.5} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={noteStyle}>
            The house won — thanks for playing. I&apos;m an independent researcher funding this
            work out of my own pocket, and your support goes directly toward the API credits
            that keep the experiments running.
          </p>
          <p style={noteStyle}>
            Any amount genuinely helps and is deeply appreciated. Supporters are credited in the
            acknowledgements section of the work their funding makes possible.
          </p>
        </div>

        <a
          href={siteConfig.donationUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            alignSelf: "start",
            fontSize: 13,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: "var(--background)",
            background: "var(--foreground)",
            textDecoration: "none",
            padding: "11px 20px",
          }}
        >
          <Coins size={16} strokeWidth={2} />
          fund the research →
        </a>

        <a
          href={socialLinks.email}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            alignSelf: "start",
            fontSize: 13,
            letterSpacing: "0.08em",
            color: "var(--muted)",
            textDecoration: "none",
            borderBottom: "1px solid var(--border)",
            paddingBottom: 2,
          }}
        >
          <Mail size={14} strokeWidth={1.5} />
          or reach out first →
        </a>
      </div>
    </div>
  );
}

const noteStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.8,
  color: "var(--foreground)",
  margin: 0,
  letterSpacing: "0.04em",
};

function dotStyle(color: string): React.CSSProperties {
  return {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: color,
    display: "inline-block",
    flexShrink: 0,
  };
}
