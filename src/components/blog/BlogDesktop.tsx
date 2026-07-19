"use client";

import { useState, useRef } from "react";
import type { BlogPost } from "@/types";
import { BlogPanel } from "./BlogPanel";
import { BlogArticleWindow } from "./BlogArticleWindow";

export function BlogDesktop({ posts }: { posts: BlogPost[] }) {
  const [openSlugs, setOpenSlugs] = useState<string[]>([]);
  const nextIndex = useRef(1);
  const indices = useRef<Map<string, number>>(new Map());

  function openArticle(slug: string) {
    if (!indices.current.has(slug)) {
      indices.current.set(slug, nextIndex.current++);
    }
    setOpenSlugs((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
  }

  function closeArticle(slug: string) {
    setOpenSlugs((prev) => prev.filter((s) => s !== slug));
  }

  // raise a covered article above the others — later in openSlugs renders last,
  // so it paints on top (every article window shares the same z-index)
  function focusArticle(slug: string) {
    setOpenSlugs((prev) =>
      prev[prev.length - 1] === slug ? prev : [...prev.filter((s) => s !== slug), slug],
    );
  }

  return (
    <>
      <BlogPanel posts={posts} onOpen={openArticle} />

      {openSlugs.map((slug) => (
        <BlogArticleWindow
          key={slug}
          slug={slug}
          onClose={() => closeArticle(slug)}
          onActivate={() => focusArticle(slug)}
          windowIndex={indices.current.get(slug) ?? 1}
        />
      ))}
    </>
  );
}
