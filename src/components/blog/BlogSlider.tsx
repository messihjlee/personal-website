"use client";

import { useState } from "react";
import type { BlogPost } from "@/types";
import { BlogCard } from "./BlogCard";

const PAGE_SIZE = 9;

export function BlogSlider({ posts }: { posts: BlogPost[] }) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  const paged = posts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const padded = [...paged, ...Array(PAGE_SIZE - paged.length).fill(null)] as (BlogPost | null)[];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
      <div
        className="blog-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
          gap: 12,
          width: "100%",
          flex: 1,
        }}
      >
        {padded.map((post, i) => (
          <div key={post ? `${post.slug}-${i}` : `empty-${i}`} style={{ minHeight: 0, minWidth: 0 }}>
            {post && <BlogCard post={post} priority={i < 9} />}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              color: page === 0 ? "var(--disabled)" : "var(--foreground)",
              background: "none",
              border: "1px solid var(--border)",
              padding: "4px 12px",
              cursor: page === 0 ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            prev
          </button>
          <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--muted)", alignSelf: "center" }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              color: page === totalPages - 1 ? "var(--disabled)" : "var(--foreground)",
              background: "none",
              border: "1px solid var(--border)",
              padding: "4px 12px",
              cursor: page === totalPages - 1 ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            next
          </button>
        </div>
      )}
    </div>
  );
}
