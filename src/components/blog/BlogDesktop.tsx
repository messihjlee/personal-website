"use client";

import { useState, useRef } from "react";
import type { BlogPost } from "@/types";
import { BlogPanel } from "./BlogPanel";
import { BlogArticleWindow } from "./BlogArticleWindow";

export function BlogDesktop({ posts }: { posts: BlogPost[] }) {
  const [openSlugs, setOpenSlugs] = useState<string[]>([]);
  const [minimizedSlugs, setMinimizedSlugs] = useState<string[]>([]);
  const [articleTitles, setArticleTitles] = useState<Record<string, string>>({});
  const nextIndex = useRef(1);
  const indices = useRef<Map<string, number>>(new Map());

  function openArticle(slug: string) {
    if (!indices.current.has(slug)) {
      indices.current.set(slug, nextIndex.current++);
    }
    setOpenSlugs((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    setMinimizedSlugs((prev) => prev.filter((s) => s !== slug));
  }

  function closeArticle(slug: string) {
    setOpenSlugs((prev) => prev.filter((s) => s !== slug));
    setMinimizedSlugs((prev) => prev.filter((s) => s !== slug));
  }

  function minimizeArticle(slug: string) {
    setMinimizedSlugs((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
  }

  function restoreArticle(slug: string) {
    setMinimizedSlugs((prev) => prev.filter((s) => s !== slug));
  }

  function handleTitleLoaded(slug: string, title: string) {
    setArticleTitles((prev) => ({ ...prev, [slug]: title }));
  }

  return (
    <>
      <BlogPanel posts={posts} onOpen={openArticle} />

      {openSlugs.map((slug) => (
        <BlogArticleWindow
          key={slug}
          slug={slug}
          onClose={() => closeArticle(slug)}
          onMinimize={() => minimizeArticle(slug)}
          onTitleLoaded={(title) => handleTitleLoaded(slug, title)}
          minimized={minimizedSlugs.includes(slug)}
          windowIndex={indices.current.get(slug) ?? 1}
        />
      ))}

      {minimizedSlugs.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
            zIndex: 100,
            maxWidth: "calc(100vw - 32px)",
            overflowX: "auto",
            padding: "0 4px",
            scrollbarWidth: "none",
          }}
        >
          {minimizedSlugs.map((slug) => {
            const title = articleTitles[slug] ?? slug;
            const short = title.length > 28 ? title.slice(0, 28) + "…" : title;
            return (
              <button
                key={slug}
                onClick={() => restoreArticle(slug)}
                style={{
                  flexShrink: 0,
                  fontSize: 10,
                  letterSpacing: "0.13em",
                  color: "var(--foreground)",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  padding: "7px 14px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                  backdropFilter: "blur(8px)",
                }}
              >
                {short}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
