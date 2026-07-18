"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { BlogPost } from "@/types";
import { EDGE_MARGIN, paneHBounds, useDraggable } from "@/hooks/useDraggable";
import { BTN_W, CardWindow, NavBar } from "@/components/ui/CardWindow";
import { useMinimizedWindow } from "@/lib/minimized";

const CATEGORIES = ["books", "daily", "art", "travel"] as const;
type Category = (typeof CATEGORIES)[number];

// category buttons are pinned to the bottom of the page; the window lives
// between the 36px site header and that row
const CATEGORY_BAR_BOTTOM = 24;
const BOTTOM_RESERVED = 92;
const WINDOW_TOP = 48;
const WINDOW_W = 680;
const WINDOW_H = 520;

type WinState = "normal" | "fullscreen";

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
  const { windowRef, minimized, minimize, close, activate, animStyle, restoreClass } = useMinimizedWindow({
    id: "blog",
    label: "blog",
  });

  const { pos, onMouseDown, onTouchStart } = useDraggable(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const winW = Math.min(WINDOW_W, vw - 2 * EDGE_MARGIN);
    const winH = Math.min(WINDOW_H, vh - WINDOW_TOP - BOTTOM_RESERVED);
    return {
      x: Math.max(EDGE_MARGIN, (vw - winW) / 2),
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

  // minimized, the whole window (and its category bar) lives as a dock pill
  if (minimized) return null;

  const isFullscreen = win === "fullscreen";

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
        top: pos.y,
        ...paneHBounds(pos.x, WINDOW_W),
        // height tracks the live position, like every other pane: drag the
        // window down and it shrinks so its bottom edge never leaves the screen
        height: `min(${WINDOW_H}px, calc(100svh - ${Math.round(pos.y) + EDGE_MARGIN}px))`,
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
        innerRef={windowRef}
        className={restoreClass}
        label="blog"
        subtitle={post.title.length > 40 ? post.title.slice(0, 40) + "…" : post.title}
        fullscreen={isFullscreen}
        onClose={close}
        onMinimize={minimize}
        onActivate={activate}
        onFullscreen={() => setWin(isFullscreen ? "normal" : "fullscreen")}
        dragProps={{ onMouseDown, onTouchStart }}
        style={{ ...style, ...animStyle }}
        footer={
          <NavBar
            index={index}
            total={items.length}
            onPrev={() => setIndex((i) => Math.max(0, i - 1))}
            onNext={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
          />
        }
      >
        {(
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
