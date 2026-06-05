"use client";

import { useState, useRef } from "react";
import type { BlogPost } from "@/types";
import { BlogPanel } from "./BlogPanel";
import { BlogArticleWindow } from "./BlogArticleWindow";

export function BlogDesktop({ posts }: { posts: BlogPost[] }) {
  const [openSlugs, setOpenSlugs] = useState<string[]>([]);
  const nextIndex = useRef(1); // 0 is reserved for the main panel
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

  return (
    <>
      <BlogPanel posts={posts} onOpen={openArticle} windowIndex={0} />
      {openSlugs.map((slug) => (
        <BlogArticleWindow
          key={slug}
          slug={slug}
          onClose={() => closeArticle(slug)}
          windowIndex={indices.current.get(slug) ?? 1}
        />
      ))}
    </>
  );
}
