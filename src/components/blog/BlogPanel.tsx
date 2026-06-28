"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { BlogPost } from "@/types";
import { useDraggable } from "@/hooks/useDraggable";

const CATEGORIES = ["books", "daily", "art", "travel"] as const;
type Category = (typeof CATEGORIES)[number];

type WinState = "normal" | "minimized" | "fullscreen" | "closed";

export function BlogPanel({
  posts,
  onOpen,
  windowIndex = 0,
}: {
  posts: BlogPost[];
  onOpen?: (slug: string) => void;
  windowIndex?: number;
}) {
  const [category, setCategory] = useState<Category | null>(null);
  const [index, setIndex] = useState(0);
  const [win, setWin] = useState<WinState>("normal");

  const { pos, onMouseDown, onTouchStart } = useDraggable(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 720;
    const winW = Math.min(680, vw - 32);
    const tabsH = 30;
    const boxH = Math.min(560, vh - 84);
    return {
      x: Math.max(isMobile ? 16 : 20, (vw - winW) / 2 + windowIndex * (isMobile ? 16 : 30)),
      y: Math.max(44, (vh - boxH - tabsH) / 2 + windowIndex * (isMobile ? 20 : 24)),
    };
  });

  const items = useMemo(
    () => (category ? posts.filter((p) => p.tags[0] === category) : posts),
    [posts, category],
  );

  const post = items[index] ?? items[0];
  const isFirst = index === 0;
  const isLast = index === items.length - 1;

  const categoryLeaders = useMemo(
    () => CATEGORIES.map((cat) => posts.find((p) => p.tags[0] === cat)).filter(Boolean) as BlogPost[],
    [posts],
  );

  function selectCategory(cat: Category) {
    setCategory((prev) => (prev === cat ? null : cat));
    setIndex(0);
  }

  // Don't render until position is ready (avoids flash at 0,0)
  if (!pos) return null;

  if (win === "closed") {
    return (
      <button
        onClick={() => setWin("normal")}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "var(--muted)",
          background: "none",
          border: "1px solid var(--border)",
          padding: "6px 14px",
          cursor: "pointer",
          fontFamily: "inherit",
          zIndex: 10,
        }}
      >
        blog
      </button>
    );
  }

  const isFullscreen = win === "fullscreen";
  const isMinimized = win === "minimized";

  const titleBar = (
    <div
      onMouseDown={isFullscreen ? undefined : onMouseDown}
      onTouchStart={isFullscreen ? undefined : onTouchStart}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "9px 14px",
        borderBottom: isMinimized ? "none" : "1px solid var(--border)",
        flexShrink: 0,
        background: "var(--card)",
        userSelect: "none",
        cursor: isFullscreen ? "default" : "grab",
      }}
    >
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "var(--foreground)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
          flex: 1,
          marginRight: 12,
        }}
      >
        blog · {post.title.length > 48 ? post.title.slice(0, 48) + "…" : post.title}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <button onClick={() => setWin("closed")} aria-label="Close" title="close" style={dotStyle("#ff5f57")} />
        <button onClick={() => setWin(isMinimized ? "normal" : "minimized")} aria-label="Minimize" title="minimize" style={dotStyle("#f5a623")} />
        <button onClick={() => setWin(isFullscreen ? "normal" : "fullscreen")} aria-label="Fullscreen" title="fullscreen" style={dotStyle("#27c93f")} />
      </div>
    </div>
  );

  const windowBody = (
    <>
      {/* Fullscreen category filter row */}
      {isFullscreen && !isMinimized && (
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: "8px 14px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
            background: "var(--card)",
            flexWrap: "wrap",
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                color: category === cat ? "var(--foreground)" : "var(--muted)",
                background: "none",
                border: `1px solid ${category === cat ? "var(--foreground)" : "var(--border)"}`,
                padding: "3px 10px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

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

      {/* Preload category leader images */}
      <div aria-hidden="true" style={{ position: "fixed", top: -9999, left: -9999, width: 680, pointerEvents: "none" }}>
        {categoryLeaders.filter((p) => p.coverImage && p.slug !== post?.slug).map((p) => (
          <div key={p.slug} style={{ position: "relative", height: 300 }}>
            <Image src={p.coverImage!} alt="" fill sizes="(max-width: 680px) 100vw, 680px" priority />
          </div>
        ))}
      </div>

      {!isMinimized && (
        <>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {post.coverImage && (
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/7", flexShrink: 0 }}>
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 680px) 100vw, 680px"
                  priority
                />
              </div>
            )}
            <div style={{ padding: "28px 28px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <time style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--muted)" }}>
                {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </time>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: 1.35,
                  color: "var(--foreground)",
                  margin: 0,
                  fontFamily: "inherit",
                }}
              >
                {post.title}
              </h2>
              {post.description && (
                <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--muted)", margin: 0 }}>
                  {post.description}
                </p>
              )}
              <button
                onClick={() => onOpen?.(post.slug)}
                style={{
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: "var(--foreground)",
                  background: "none",
                  border: "1px solid var(--border)",
                  padding: "6px 14px",
                  alignSelf: "flex-start",
                  marginTop: 4,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                read →
              </button>
            </div>
          </div>

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
    </>
  );

  if (isFullscreen) {
    return (
      <div
        style={{
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
        }}
      >
        {titleBar}
        {windowBody}
      </div>
    );
  }

  // Normal / minimized — draggable fixed window with category tabs above
  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: "min(680px, calc(100vw - 32px))",
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
      }}
    >
      {/* Trapezoid category tabs */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
        {CATEGORIES.map((cat) => {
          const isActive = category === cat;
          return (
            <div
              key={cat}
              style={{
                clipPath: "polygon(0% 0%, calc(100% - 14px) 0%, 100% 100%, 0% 100%)",
                background: "var(--border)",
                position: "relative",
                zIndex: isActive ? 1 : 0,
                marginBottom: "-1px",
              }}
            >
              <button
                onClick={() => selectCategory(cat)}
                style={{
                  display: "block",
                  clipPath: "polygon(1px 1px, calc(100% - 15px) 1px, calc(100% - 1px) 100%, 1px 100%)",
                  background: isActive ? "var(--card)" : "var(--background)",
                  color: "var(--foreground)",
                  padding: "5px 28px 6px 14px",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  fontFamily: "inherit",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  width: "100%",
                }}
              >
                {cat}
              </button>
            </div>
          );
        })}
      </div>

      {/* Window box */}
      <div
        style={{
          height: "min(560px, calc(100svh - 84px))",
          display: "flex",
          flexDirection: "column",
          border: "1px solid var(--border)",
          background: "var(--background)",
        }}
      >
        {titleBar}
        {windowBody}
      </div>
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
