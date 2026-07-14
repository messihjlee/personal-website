"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { BlogPost } from "@/types";
import { useDraggable } from "@/hooks/useDraggable";
import { BTN_W, CardWindow, NavBar } from "@/components/ui/CardWindow";

const CATEGORIES = ["books", "daily", "art", "travel"] as const;
type Category = (typeof CATEGORIES)[number];

// category buttons are pinned to the bottom of the page; the window lives
// between the 36px site header and that row
const CATEGORY_BAR_BOTTOM = 24;
const BOTTOM_RESERVED = 92;
const WINDOW_TOP = 48;
const WINDOW_W = 680;
const WINDOW_H = 520;

type WinState = "normal" | "minimized" | "fullscreen" | "closed";

export function BlogPanel({
  posts,
  onOpen,
}: {
  posts: BlogPost[];
  onOpen?: (slug: string) => void;
}) {
  const [category, setCategory] = useState<Category | null>(null);
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

  const items = useMemo(
    () => (category ? posts.filter((p) => p.tags[0] === category) : posts),
    [posts, category],
  );

  const post = items[index] ?? items[0];

  const categoryLeaders = useMemo(
    () => CATEGORIES.map((cat) => posts.find((p) => p.tags[0] === cat)).filter(Boolean) as BlogPost[],
    [posts],
  );

  function selectCategory(cat: Category) {
    setCategory((prev) => (prev === cat ? null : cat));
    setIndex(0);
  }

  if (!pos) return null;

  const isFullscreen = win === "fullscreen";
  const isMinimized = win === "minimized";

  const categoryBar = (
    <div
      style={{
        position: "fixed",
        bottom: CATEGORY_BAR_BOTTOM,
        left: 0,
        right: 0,
        display: "flex",
        // tight enough that four buttons plus gaps clear a 320px phone
        gap: 6,
        padding: "0 8px",
        justifyContent: "center",
        zIndex: 40,
      }}
    >
      {CATEGORIES.map((cat) => {
        const isActive = category === cat;
        return (
          <button
            key={cat}
            className="pixel-edge"
            onClick={() => selectCategory(cat)}
            style={{
              fontSize: 13,
              letterSpacing: "0.12em",
              color: isActive ? "var(--background)" : "var(--muted)",
              background: isActive ? "var(--foreground)" : "var(--background)",
              border: `1px solid ${isActive ? "var(--foreground)" : "var(--border)"}`,
              padding: "8px 0",
              width: BTN_W,
              textAlign: "center",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );

  if (win === "closed") {
    return (
      <>
        {categoryBar}
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
          blog
        </button>
      </>
    );
  }

  const style: React.CSSProperties = isFullscreen
    ? {
        position: "fixed",
        top: 37,
        left: 0,
        right: 0,
        bottom: BOTTOM_RESERVED - 20,
        zIndex: 30,
      }
    : {
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: `min(${WINDOW_W}px, calc(100vw - 32px))`,
        height: isMinimized
          ? "auto"
          : `min(${WINDOW_H}px, calc(100svh - ${WINDOW_TOP + BOTTOM_RESERVED}px))`,
        zIndex: 10,
      };

  return (
    <>
      {categoryBar}

      {/* Preload category leader images */}
      <div aria-hidden="true" style={{ position: "fixed", top: -9999, left: -9999, width: WINDOW_W, pointerEvents: "none" }}>
        {categoryLeaders.filter((p) => p.coverImage && p.slug !== post?.slug).map((p) => (
          <div key={p.slug} style={{ position: "relative", height: 300 }}>
            <Image src={p.coverImage!} alt="" fill sizes="(max-width: 680px) 100vw, 680px" priority />
          </div>
        ))}
      </div>

      <CardWindow
        label="blog"
        subtitle={post.title.length > 40 ? post.title.slice(0, 40) + "…" : post.title}
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
            total={items.length}
            onPrev={() => setIndex((i) => Math.max(0, i - 1))}
            onNext={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
          />
        }
      >
        {isMinimized ? (
          <div style={{ padding: "56px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <button
              className="pixel-edge"
              onClick={() => setWin("normal")}
              style={{
                fontSize: 13,
                letterSpacing: "0.18em",
                color: "var(--muted)",
                background: "none",
                border: "1px solid var(--border)",
                padding: "10px 0",
                width: BTN_W,
                textAlign: "center",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              show
            </button>
          </div>
        ) : (
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {post.coverImage && (
              <div style={{ position: "relative", width: "100%", flex: 1, minHeight: 0 }}>
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
            <div
              style={{
                padding: "20px 28px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flexShrink: 0,
                background: "var(--background)",
              }}
            >
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
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {post.title}
              </h2>
              {post.description && (
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "var(--muted)",
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {post.description}
                </p>
              )}
              <button
                className="pixel-edge"
                onClick={() => onOpen?.(post.slug)}
                style={{
                  fontSize: 13,
                  letterSpacing: "0.14em",
                  color: "var(--foreground)",
                  background: "none",
                  border: "1px solid var(--border)",
                  padding: "8px 0",
                  width: BTN_W,
                  textAlign: "center",
                  alignSelf: "flex-start",
                  marginTop: 2,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                read →
              </button>
            </div>
          </div>
        )}
      </CardWindow>
    </>
  );
}
