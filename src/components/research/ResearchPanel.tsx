"use client";

import { useState, useMemo } from "react";
import { ExternalLink, FileText } from "lucide-react";
import type { Publication } from "@/lib/research";

type WinState = "normal" | "minimized" | "fullscreen" | "closed";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ResearchPanel({ publications }: { publications: Publication[] }) {
  const items = useMemo(() => shuffle(publications), [publications]);
  const [index, setIndex] = useState(0);
  const [win, setWin] = useState<WinState>("normal");

  const pub = items[index];
  const isFirst = index === 0;
  const isLast = index === items.length - 1;

  const doiUrl = pub.doi ? `https://doi.org/${pub.doi}` : undefined;
  const arxivUrl = pub.arxiv ? `https://arxiv.org/abs/${pub.arxiv}` : undefined;
  const linkUrl = pub.url || doiUrl || arxivUrl;
  const pdfUrl = pub.pdf ? `/papers/${pub.pdf}` : undefined;

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
        research
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
        maxHeight: "calc(100svh - 36px - 48px)",
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
        <span style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "var(--foreground)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
          flex: 1,
          marginRight: 12,
        }}>
          research · {pub.venue} · {pub.year}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <button onClick={() => setWin("closed")} aria-label="Close" title="close" style={dotStyle("#ff5f57")} />
          <button onClick={() => setWin(isMinimized ? "normal" : "minimized")} aria-label="Minimize" title="minimize" style={dotStyle("#f5a623")} />
          <button onClick={() => setWin(isFullscreen ? "normal" : "fullscreen")} aria-label="Fullscreen" title="fullscreen" style={dotStyle("#27c93f")} />
        </div>
      </div>

      {isMinimized && (
        <div style={{ padding: "56px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button
            onClick={() => setWin("normal")}
            style={{
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--muted)",
              background: "none",
              border: "1px solid var(--border)",
              padding: "8px 20px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            show
          </button>
        </div>
      )}

      {!isMinimized && (
        <>
          {/* Content */}
          <div className="research-panel-body" style={{ flex: 1, overflowY: "auto", padding: "28px 28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1.4,
                color: "var(--foreground)",
                margin: 0,
                fontFamily: "inherit",
              }}
            >
              {pub.title}
            </h2>
            <p style={{ fontSize: 11, lineHeight: 1.6, color: "var(--foreground)", margin: 0 }}>
              {pub.authors}
            </p>
            <div style={{ height: 1, background: "var(--border)", flexShrink: 0 }} />
            {pub.abstract && (
              <p style={{ fontSize: 13, lineHeight: 1.8, color: "var(--muted)", margin: 0 }}>
                {pub.abstract}
              </p>
            )}
            {(pdfUrl || arxivUrl || linkUrl) && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                {pdfUrl && (
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    <FileText size={12} /> pdf
                  </a>
                )}
                {arxivUrl && (
                  <a href={arxivUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    <ExternalLink size={12} /> arxiv
                  </a>
                )}
                {linkUrl && linkUrl !== arxivUrl && (
                  <a href={linkUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                    <ExternalLink size={12} /> paper
                  </a>
                )}
              </div>
            )}
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
            <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={isFirst} style={navBtnStyle(isFirst)}>
              ← prev
            </button>
            <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--muted)" }}>
              {index + 1} / {items.length}
            </span>
            <button onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))} disabled={isLast} style={navBtnStyle(isLast)}>
              next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 10,
  letterSpacing: "0.1em",
  color: "var(--foreground)",
  textDecoration: "none",
  border: "1px solid var(--border)",
  padding: "4px 10px",
};

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
