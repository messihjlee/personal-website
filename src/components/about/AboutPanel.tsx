"use client";

import { useState } from "react";

interface Section {
  title: string;
  rendered: React.ReactNode;
}

type WinState = "normal" | "minimized" | "fullscreen" | "closed";

export function AboutPanel({ sections }: { sections: Section[] }) {
  const [index, setIndex] = useState(0);
  const [win, setWin] = useState<WinState>("normal");

  const isFirst = index === 0;
  const isLast = index === sections.length - 1;

  if (win === "closed") {
    return (
      <button
        onClick={() => setWin("normal")}
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "var(--muted)",
          background: "none",
          border: "1px solid var(--border)",
          padding: "6px 14px",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        about
      </button>
    );
  }

  const isFullscreen = win === "fullscreen";
  const isMinimized = win === "minimized";

  const windowStyle: React.CSSProperties = isFullscreen
    ? {
        position: "fixed",
        top: 37,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--background)",
        border: "1px solid var(--border)",
        zIndex: 50,
      }
    : {
        width: "100%",
        maxWidth: 680,
        display: "flex",
        flexDirection: "column",
        border: "1px solid var(--border)",
        background: "var(--background)",
      };

  return (
    <div style={windowStyle}>
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 14px",
          borderBottom: isMinimized ? "none" : "1px solid var(--border)",
          flexShrink: 0,
          background: "var(--card)",
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--muted)",
          }}
        >
          about · {sections[index].title}
        </span>

        {/* Window controls — x, hide, fullscreen */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <button
            onClick={() => setWin("closed")}
            aria-label="Close"
            title="close"
            style={dotStyle("#ff5f57")}
          />
          <button
            onClick={() => setWin(isMinimized ? "normal" : "minimized")}
            aria-label="Minimize"
            title="minimize"
            style={dotStyle("#f5a623")}
          />
          <button
            onClick={() => setWin(isFullscreen ? "normal" : "fullscreen")}
            aria-label="Fullscreen"
            title="fullscreen"
            style={dotStyle("#27c93f")}
          />
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Content */}
          <div
            style={{
              padding: "32px 28px",
              flex: 1,
              overflowY: "auto",
              fontSize: 15,
              lineHeight: 1.85,
              color: "var(--foreground)",
            }}
          >
            {sections.map((s, i) => (
              <div key={s.title} style={{ display: i === index ? "block" : "none" }}>
                {s.rendered}
              </div>
            ))}
          </div>

          {/* Footer nav */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 14px",
              borderTop: "1px solid var(--border)",
              flexShrink: 0,
              background: "var(--card)",
            }}
          >
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              style={navBtnStyle(isFirst)}
            >
              ← prev
            </button>
            <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--muted)" }}>
              {index + 1} / {sections.length}
            </span>
            <button
              onClick={() => setIndex((i) => Math.min(sections.length - 1, i + 1))}
              disabled={isLast}
              style={navBtnStyle(isLast)}
            >
              next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function dotStyle(color: string): React.CSSProperties {
  return {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: color,
    border: "none",
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
  };
}

function navBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    fontSize: 10,
    letterSpacing: "0.12em",
    color: disabled ? "var(--muted)" : "var(--foreground)",
    background: "none",
    border: "1px solid var(--border)",
    padding: "4px 12px",
    cursor: disabled ? "default" : "pointer",
    fontFamily: "inherit",
  };
}
