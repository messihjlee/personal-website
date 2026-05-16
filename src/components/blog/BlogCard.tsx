"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { BlogPost } from "@/types";

export function BlogCard({ post }: { post: BlogPost }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/blog/${post.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        height: "100%",
        textDecoration: "none",
        border: "1px solid var(--border)",
        background: "var(--card)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {post.coverImage ? (
        <>
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 640px) 100vw, 33vw"
          />
          {/* Dark mask + text — fades in on hover */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(20,21,24,0.88)",
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.18s ease",
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "12px",
            }}
          >
            <p
              className="grid-card-title blog-card-title"
              style={{
                letterSpacing: "0.04em",
                color: "rgba(255,255,255,0.95)",
                lineHeight: 1.4,
                margin: "0 0 4px",
              }}
            >
              {post.title}
            </p>
            <time
              className="blog-card-date"
              style={{
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              })}
            </time>
          </div>
        </>
      ) : (
        <>
          {/* No image: show text only on hover */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(20,21,24,0.88)",
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.18s ease",
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "12px",
            }}
          >
            <p
              className="grid-card-title"
              style={{
                fontSize: 15,
                letterSpacing: "0.04em",
                color: "rgba(255,255,255,0.95)",
                lineHeight: 1.4,
                margin: "0 0 4px",
              }}
            >
              {post.title}
            </p>
            <time
              style={{
                fontSize: 12,
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              })}
            </time>
          </div>
        </>
      )}
    </Link>
  );
}
