"use client";

import { useState, useEffect } from "react";
import { MDXRemote } from "next-mdx-remote";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import Image from "next/image";
import { useDraggable } from "@/hooks/useDraggable";

interface ArticleData {
  title: string;
  date: string;
  tags: string[];
  coverImage: string;
  mdxSource: MDXRemoteSerializeResult;
}

type WinState = "normal" | "fullscreen" | "closed";

const mdxComponents = {
  ColumnImages: ({ data }: { data: string }) => {
    const images: { src: string; alt: string }[] = JSON.parse(
      Buffer.from(data, "base64").toString("utf8")
    );
    return (
      <div style={{ display: "flex", gap: "0.75rem", margin: "1.5rem 0" }}>
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={img.src} alt={img.alt} style={{ flex: 1, minWidth: 0, maxWidth: "100%", height: "auto" }} />
        ))}
      </div>
    );
  },
  CVButton: ({ href }: { href: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-block", marginTop: "1rem", fontSize: 10, letterSpacing: "0.14em",
        color: "var(--foreground)", border: "1px solid var(--border)", padding: "6px 16px",
        textDecoration: "none", fontFamily: "inherit", cursor: "pointer",
      }}
    >
      cv
    </a>
  ),
  h1: (props: React.ComponentProps<"h1">) => (
    <h1 style={{ fontSize: 20, fontWeight: 600, marginTop: "2rem", marginBottom: "0.75rem", lineHeight: 1.3, fontFamily: "inherit" }} {...props} />
  ),
  h2: (props: React.ComponentProps<"h2">) => (
    <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: "1.75rem", marginBottom: "0.5rem", lineHeight: 1.3, fontFamily: "inherit" }} {...props} />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", fontFamily: "inherit" }} {...props} />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p style={{ marginBottom: "1rem", lineHeight: 1.85 }} {...props} />
  ),
  a: (props: React.ComponentProps<"a">) => (
    <a style={{ textDecoration: "underline", textUnderlineOffset: 4 }} {...props} />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem", listStyleType: "disc" }} {...props} />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol style={{ marginBottom: "1rem", paddingLeft: "1.5rem", listStyleType: "decimal" }} {...props} />
  ),
  hr: (props: React.ComponentProps<"hr">) => (
    <hr style={{ margin: "1.5rem 0", borderColor: "var(--border)" }} {...props} />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote style={{ borderLeft: "2px solid var(--border)", paddingLeft: "1rem", margin: "1.5rem 0", fontStyle: "italic", color: "var(--muted)" }} {...props} />
  ),
  code: (props: React.ComponentProps<"code">) => (
    <code style={{ background: "var(--card)", padding: "2px 6px", fontSize: "0.875em" }} {...props} />
  ),
  pre: (props: React.ComponentProps<"pre">) => (
    <pre style={{ marginBottom: "1rem", overflowX: "auto", border: "1px solid var(--border)", background: "var(--card)", padding: "1rem", fontSize: "0.875em" }} {...props} />
  ),
  img: (props: React.ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img style={{ maxWidth: "100%", height: "auto" }} alt={props.alt ?? ""} {...props} />
  ),
};

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  books:  { bg: "#1a2a1a", color: "#4caf6e" },
  art:    { bg: "#2a1e12", color: "#c97d3a" },
  travel: { bg: "#111e2a", color: "#3a88c9" },
};

export function BlogArticleWindow({
  slug,
  onClose,
  onMinimize,
  onTitleLoaded,
  minimized = false,
  windowIndex = 1,
}: {
  slug: string;
  onClose: () => void;
  onMinimize: () => void;
  onTitleLoaded?: (title: string) => void;
  minimized?: boolean;
  windowIndex?: number;
}) {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [win, setWin] = useState<WinState>("normal");

  const { pos, onMouseDown, onTouchStart } = useDraggable(() => {
    const vw = window.innerWidth;
    const isMobile = vw < 720;
    if (isMobile) return { x: 16, y: 44 + windowIndex * 32 };
    return {
      x: Math.max(20, (vw - 680) / 2 + windowIndex * 30),
      y: Math.max(44, 80 + windowIndex * 24),
    };
  });

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((r) => r.json())
      .then((data: ArticleData) => {
        setArticle(data);
        setLoading(false);
        onTitleLoaded?.(data.title);
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!pos) return null;
  if (minimized) return null;

  const shortTitle = article
    ? article.title.length > 48 ? article.title.slice(0, 48) + "…" : article.title
    : "loading…";

  if (win === "closed") {
    return (
      <button
        onClick={() => setWin("normal")}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          fontSize: 10, letterSpacing: "0.14em", color: "var(--muted)", background: "none",
          border: "1px solid var(--border)", padding: "6px 14px", cursor: "pointer", fontFamily: "inherit",
          zIndex: 10,
        }}
      >
        {article?.title ?? slug}
      </button>
    );
  }

  const isFullscreen = win === "fullscreen";

  const titleBar = (
    <div
      onMouseDown={isFullscreen ? undefined : onMouseDown}
      onTouchStart={isFullscreen ? undefined : onTouchStart}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "9px 14px", borderBottom: "1px solid var(--border)",
        flexShrink: 0, background: "var(--card)", userSelect: "none",
        cursor: isFullscreen ? "default" : "grab",
        touchAction: "none",
      }}
    >
      <span
        style={{
          fontSize: 10, letterSpacing: "0.14em", color: "var(--foreground)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          minWidth: 0, flex: 1, marginRight: 12,
        }}
      >
        blog · {shortTitle}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <button onClick={onClose} aria-label="Close" title="close" style={dotStyle("#ff5f57")} />
        <button onClick={onMinimize} aria-label="Minimize" title="minimize" style={dotStyle("#f5a623")} />
        <button onClick={() => setWin(isFullscreen ? "normal" : "fullscreen")} aria-label="Fullscreen" title="fullscreen" style={dotStyle("#27c93f")} />
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div
        className="window-restore"
        style={{
          position: "fixed", top: 37, left: 0, right: 0, bottom: 0,
          display: "flex", flexDirection: "column", background: "var(--background)",
          border: "1px solid var(--border)", zIndex: 50,
        }}
      >
        {titleBar}
        {articleBody(article, loading, win, setWin)}
      </div>
    );
  }

  return (
    <div
      className="window-restore"
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: "min(680px, calc(100vw - 32px))",
        maxHeight: "calc(100svh - 36px - 48px)",
        display: "flex",
        flexDirection: "column",
        border: "1px solid var(--border)",
        background: "var(--background)",
        zIndex: 10,
      }}
    >
      {titleBar}
      {articleBody(article, loading, win, setWin)}
    </div>
  );
}

function articleBody(
  article: ArticleData | null,
  loading: boolean,
  win: WinState,
  setWin: (w: WinState) => void,
) {
  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--muted)" }}>loading…</span>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--muted)" }}>not found</span>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      {article.coverImage && (
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/7", flexShrink: 0 }}>
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 680px) 100vw, 680px"
          />
        </div>
      )}
      <article style={{ padding: "28px 28px 40px" }}>
        <header style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 20, fontWeight: 600, lineHeight: 1.35,
              color: "var(--foreground)", marginBottom: 12, fontFamily: "inherit",
            }}
          >
            {article.title}
          </h1>
          <time style={{ display: "block", fontSize: 10, letterSpacing: "0.12em", color: "var(--muted)", marginBottom: 12 }}>
            {new Date(article.date).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </time>
          {article.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {article.tags.map((tag) => {
                const c = TAG_COLORS[tag] ?? { bg: "#1a1c22", color: "#616978" };
                return (
                  <span
                    key={tag}
                    style={{
                      background: c.bg, color: c.color, fontSize: 10,
                      letterSpacing: "0.12em", padding: "4px 10px",
                      border: `1px solid ${c.color}30`,
                    }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          )}
        </header>
        <div style={{ color: "var(--foreground)", fontSize: 15, lineHeight: 1.85 }}>
          <MDXRemote {...article.mdxSource} components={mdxComponents as never} />
        </div>
      </article>
    </div>
  );
}

function dotStyle(color: string): React.CSSProperties {
  return {
    width: 12, height: 12, borderRadius: "50%", background: color,
    border: "none", cursor: "pointer", padding: 0, flexShrink: 0,
  };
}
